import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
 // ✅ fixes "cannot find module aws-lambda" TS error
// If you prefer, you can keep: from "aws-lambda"
// ...but then you MUST have: npm i -D @types/aws-lambda

import Stripe from "stripe";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

// -------------------- ENV --------------------
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const BILLING_TABLE = process.env.BILLING_TABLE!;
const APP_DOMAIN = process.env.APP_DOMAIN || "app.linkharbour.io";

// Use ONE paid price id. Keep compatibility with either name.
const PAID_PRICE_ID =
  process.env.STRIPE_PRICE_ID ||
  process.env.STRIPE_STARTER_PRICE_ID ||
  process.env.STRIPE_PRO_PRICE_ID ||
  "";

// -------------------- Stripe --------------------
// If your stripe types complain about apiVersion, keep this.
// Otherwise you can remove the 2nd arg and it will still work.
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
});

// -------------------- DynamoDB --------------------
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

type BillingPlan = "free" | "starter" | "enterprise";
type BillingStatus = "none" | "active";

type BillingRow = {
  userSub: string;
  plan: BillingPlan;
  status: BillingStatus;
  stripeCustomerId: string;
  subscriptionId: string;
  currentPeriodEnd: number; // unix seconds
  updatedAt: string; // ISO
};

function nowIso() {
  return new Date().toISOString();
}

function corsHeaders() {
  return {
    "content-type": "application/json",
    "access-control-allow-origin": `https://${APP_DOMAIN}`,
    "access-control-allow-headers":
      "authorization,Authorization,content-type,Content-Type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  };
}

function json(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(body),
  };
}

function getUserSub(event: APIGatewayProxyEventV2): string | null {
  const rc: any = event.requestContext as any;

  // HTTP API JWT authorizer (new shape)
  const jwtClaims = rc?.authorizer?.jwt?.claims;
  if (jwtClaims?.sub) return jwtClaims.sub;

  // Some setups put claims directly under authorizer.claims
  const claims = rc?.authorizer?.claims;
  if (claims?.sub) return claims.sub;

  // Fallback (rare): sometimes sub is directly under authorizer
  if (rc?.authorizer?.sub) return rc.authorizer.sub;

  return null;
}

async function getBillingRow(userSub: string): Promise<BillingRow | null> {
  const res = await ddb.send(
    new GetCommand({
      TableName: BILLING_TABLE,
      Key: { userSub },
    })
  );
  return (res.Item as BillingRow) ?? null;
}

async function ensureBillingRow(userSub: string): Promise<BillingRow> {
  const existing = await getBillingRow(userSub);
  if (existing) return existing;

  const row: BillingRow = {
    userSub,
    plan: "free",
    status: "none",
    stripeCustomerId: "",
    subscriptionId: "",
    currentPeriodEnd: 0,
    updatedAt: nowIso(),
  };

  try {
    await ddb.send(
      new PutCommand({
        TableName: BILLING_TABLE,
        Item: row,
        ConditionExpression: "attribute_not_exists(userSub)",
      })
    );
  } catch {
    // Race: someone else created it; fall through
  }

  return (await getBillingRow(userSub)) ?? row;
}

async function updateBillingRow(userSub: string, patch: Partial<BillingRow>) {
  const exprParts: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, any> = {};

  // Always update updatedAt (ISO)
  patch.updatedAt = nowIso();

  let i = 0;
  for (const [k, v] of Object.entries(patch)) {
    i += 1;
    const nk = `#k${i}`;
    const vk = `:v${i}`;
    names[nk] = k;
    values[vk] = v;
    exprParts.push(`${nk} = ${vk}`);
  }

  if (exprParts.length === 0) return;

  await ddb.send(
    new UpdateCommand({
      TableName: BILLING_TABLE,
      Key: { userSub },
      UpdateExpression: `SET ${exprParts.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}

function normalizePath(rawPath: string) {
  return rawPath || "";
}

function parseJsonBody(event: APIGatewayProxyEventV2): any {
  if (!event.body) return {};
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error("Invalid JSON body");
  }
}

function isActiveLikeStripeStatus(s: string | undefined) {
  return s === "active" || s === "trialing" || s === "past_due" || s === "unpaid";
}

function planFromSubscription(sub: any): BillingPlan {
  const priceIds: string[] =
    sub?.items?.data?.map((i: any) => i?.price?.id).filter(Boolean) ?? [];

  if (PAID_PRICE_ID && priceIds.includes(PAID_PRICE_ID)) return "starter";
  return "free";
}

/**
 * NEW: If DynamoDB is still "free/none" but we have a Stripe customer,
 * query Stripe and backfill subscription status into DynamoDB.
 *
 * Fixes TS error by accessing current_period_end via "any" fallback.
 */
async function backfillFromStripeIfNeeded(userSub: string, row: BillingRow): Promise<BillingRow> {
  if (!row.stripeCustomerId) return row;

  const looksMissing =
    !row.subscriptionId || row.status === "none" || row.plan === "free";

  if (!looksMissing) return row;

  try {
    const subs = await stripe.subscriptions.list({
      customer: row.stripeCustomerId,
      status: "all",
      limit: 10,
    });

    // pick best: active-like first, otherwise nothing
    const best =
      subs.data.find((s: any) => isActiveLikeStripeStatus(s?.status)) ??
      null;

    if (!best) return row;

    const plan = planFromSubscription(best);
    const isActive = isActiveLikeStripeStatus((best as any).status) && plan === "starter";

    // ✅ fixes TS complaint: some Stripe TS builds don't expose current_period_end
    const currentPeriodEnd =
      (best as any).current_period_end ??
      (best as any).currentPeriodEnd ??
      0;

    const patch: Partial<BillingRow> = {
      subscriptionId: (best as any).id ?? "",
      plan,
      status: isActive ? "active" : "none",
      currentPeriodEnd: Number(currentPeriodEnd) || 0,
    };

    await updateBillingRow(userSub, patch);

    // return the fresh row from Dynamo to keep it consistent
    return (await getBillingRow(userSub)) ?? { ...row, ...patch, updatedAt: nowIso() };
  } catch {
    // If Stripe is temporarily down / key issues, don't break billing page
    return row;
  }
}

// -------------------- HANDLER --------------------
export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;

  // CORS preflight
  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: "",
    };
  }

  const path = normalizePath(event.rawPath || "");
  const userSub = getUserSub(event);

  if (!userSub) {
    return json(401, { message: "Unauthorized" });
  }

  // Body (for POST)
  let body: any = {};
  try {
    body = parseJsonBody(event);
  } catch (e: any) {
    return json(400, { message: e?.message || "Invalid JSON body" });
  }

  const returnUrl =
    body.returnUrl || `https://${APP_DOMAIN}/dashboard/billing`;

  // -------------------- GET /billing/status --------------------
if (method === "GET" && path.endsWith("/billing/status")) {
  let row = await ensureBillingRow(userSub);

  // ✅ self-heal billing status from Stripe if Dynamo is stale/missing
  row = await backfillFromStripeIfNeeded(userSub, row);

  return json(200, {
    plan: row.plan,
    status: row.status,
    stripeCustomerId: row.stripeCustomerId,
    subscriptionId: row.subscriptionId,
    currentPeriodEnd: row.currentPeriodEnd,
    updatedAt: row.updatedAt,
  });
}


  if (method === "POST" && path.endsWith("/billing/checkout")) {
  if (!PAID_PRICE_ID) {
    return json(500, {
      message:
        "Missing Stripe price id env var (set STRIPE_PRICE_ID or STRIPE_STARTER_PRICE_ID or STRIPE_PRO_PRICE_ID).",
    });
  }

  const requestedPriceId =
    body.priceId || body.priceID || body.price || body.stripePriceId;

  if (requestedPriceId && requestedPriceId !== PAID_PRICE_ID) {
    return json(400, { message: "Invalid priceId" });
  }

  // Always start from Dynamo
  let row = await ensureBillingRow(userSub);

  // Ensure Stripe customer exists
  let customerId = row.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { userSub },
    });
    customerId = customer.id;
    await updateBillingRow(userSub, { stripeCustomerId: customerId });

    // refresh row in memory
    row = { ...row, stripeCustomerId: customerId };
  } else {
    // Best-effort: ensure metadata exists for mapping
    try {
      await stripe.customers.update(customerId, { metadata: { userSub } });
    } catch {}
  }

  // ✅ 1) Self-heal Dynamo from Stripe (handles "paid but Dynamo stale")
  row = await backfillFromStripeIfNeeded(userSub, row);

  // ✅ 2) If already active starter, don't charge again — send to portal
  if (row.plan === "starter" && row.status === "active") {
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return json(200, { url: portal.url, alreadySubscribed: true });
  }

  // ✅ 3) Otherwise create checkout (idempotent)
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: PAID_PRICE_ID, quantity: 1 }],
      success_url: `${returnUrl}?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=1`,
      client_reference_id: userSub,
      metadata: { userSub },
      subscription_data: { metadata: { userSub } },
    },
    {
      idempotencyKey: `checkout_${userSub}_${PAID_PRICE_ID}`,
    }
  );

  return json(200, { url: session.url });
}


  // -------------------- POST /billing/portal --------------------
  if (method === "POST" && path.endsWith("/billing/portal")) {
    const row = await ensureBillingRow(userSub);

    let customerId = row.stripeCustomerId;

    // Fallback: try to find customer by metadata.userSub
    if (!customerId) {
      const customers = await stripe.customers.search({
        query: `metadata['userSub']:'${userSub}'`,
        limit: 1,
      });
      const found = customers.data[0];
      if (found) {
        customerId = found.id;
        await updateBillingRow(userSub, { stripeCustomerId: customerId });
      }
    }

    if (!customerId) {
      return json(400, {
        message:
          "No Stripe customer found yet. Start checkout first to create a customer/subscription.",
      });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return json(200, { url: portal.url });
  }

  return json(404, { message: "Not Found" });
}

