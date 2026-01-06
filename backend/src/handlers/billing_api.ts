import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STARTER_PRICE_ID = process.env.STRIPE_STARTER_PRICE_ID!;
const APP_DOMAIN = process.env.APP_DOMAIN || "app.linkharbour.io";

const stripe = new Stripe(STRIPE_SECRET_KEY);


function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": `https://${APP_DOMAIN}`,
      "access-control-allow-headers": "Authorization,Content-Type",
      "access-control-allow-methods": "POST,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function getUserSub(event: APIGatewayProxyEventV2): string | null {
  // With Cognito JWT authorizer, API Gateway usually injects JWT claims here:
  const claims: any = (event.requestContext as any)?.authorizer?.jwt?.claims;
  return claims?.sub || null;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  if (event.requestContext.http.method === "OPTIONS") {
    return json(200, { ok: true });
  }

  const path = event.rawPath || "";
  const sub = getUserSub(event);

  if (!sub) {
    return json(401, { message: "Unauthorized" });
  }

  // optional body data
  const body = event.body ? JSON.parse(event.body) : {};
  const returnUrl = body.returnUrl || `https://${APP_DOMAIN}/dashboard/billing`;

  // NOTE: In a real system you’d map sub -> Stripe customer id in DynamoDB.
  // For now, Stripe can create a new customer per checkout unless you store it.
  if (path.endsWith("/billing/checkout")) {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: STARTER_PRICE_ID, quantity: 1 }],
      success_url: `${returnUrl}?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=1`,
      // Put Cognito user id in metadata so webhook can attach plan later
      metadata: { cognito_sub: sub },
      subscription_data: {
        metadata: { cognito_sub: sub },
      },
    });

    return json(200, { url: session.url });
  }

  if (path.endsWith("/billing/portal")) {
    // If you don't have a customer id stored yet, portal won't work reliably.
    // We still try to locate customer by metadata (not guaranteed).
    // Best practice: store customer id on first checkout webhook.

    // Try to find most recent customer with metadata match (simple fallback)
    const customers = await stripe.customers.search({
      query: `metadata['cognito_sub']:'${sub}'`,
      limit: 1,
    });

    const customer = customers.data[0];
    if (!customer) {
      return json(400, { message: "No Stripe customer found yet. Start checkout first." });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl,
    });

    return json(200, { url: portal.url });
  }

  return json(404, { message: "Not Found" });
}
