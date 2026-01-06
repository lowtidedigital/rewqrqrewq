import Stripe from "stripe";

type APIGatewayV2Event = {
  version: string;
  routeKey?: string;
  rawPath: string;
  headers?: Record<string, string | undefined>;
  body?: string | null;
  isBase64Encoded?: boolean;
  requestContext: {
    http: { method: string; path: string };
    authorizer?: {
      jwt?: {
        claims?: Record<string, any>;
      };
    };
  };
};

type APIGatewayV2Result = {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // Keep default unless you have a specific pinned Stripe API version
});

function json(statusCode: number, data: any): APIGatewayV2Result {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  };
}

function getClaims(event: APIGatewayV2Event) {
  return event.requestContext.authorizer?.jwt?.claims || null;
}

export const handler = async (event: APIGatewayV2Event): Promise<APIGatewayV2Result> => {
  try {
    const method = event.requestContext.http.method;
    const path = event.rawPath;

    // These routes are JWT-protected in API Gateway, but we still sanity-check claims
    const claims = getClaims(event);
    const userSub = claims?.sub as string | undefined;
    const email = (claims?.email as string | undefined) || (claims?.["cognito:username"] as string | undefined);

    if (!userSub) return json(401, { message: "Unauthorized: missing JWT claims" });

    const APP_DOMAIN = process.env.APP_DOMAIN || "app.linkharbour.io";
    const PRICE_STARTER = process.env.STRIPE_PRICE_STARTER || ""; // your price_...
    const PORTAL_RETURN_URL = `https://${APP_DOMAIN}/dashboard/billing`;
    const CHECKOUT_SUCCESS_URL = `https://${APP_DOMAIN}/dashboard/billing?success=1`;
    const CHECKOUT_CANCEL_URL = `https://${APP_DOMAIN}/dashboard/billing?canceled=1`;

    if (!process.env.STRIPE_SECRET_KEY) {
      return json(500, { message: "Server not configured: STRIPE_SECRET_KEY missing" });
    }

    // POST /billing/checkout
    if (method === "POST" && path === "/billing/checkout") {
      if (!PRICE_STARTER) return json(500, { message: "Server not configured: STRIPE_PRICE_STARTER missing" });

      // Optional: accept plan in body (for later expansion). For now Starter only.
      // If body exists, parse but don't require it.
      let requestedPlan: string | undefined;
      if (event.body) {
        try {
          const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
          const parsed = JSON.parse(raw);
          requestedPlan = parsed?.plan;
        } catch {
          // ignore
        }
      }

      // If you later add Pro/Enterprise, switch on requestedPlan.
      // For now, always use Starter subscription.
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: PRICE_STARTER, quantity: 1 }],
        success_url: CHECKOUT_SUCCESS_URL,
        cancel_url: CHECKOUT_CANCEL_URL,

        // Helpful linkage between Stripe + Cognito user
        client_reference_id: userSub,
        customer_email: email,

        // Store link between user + subscription for webhook processing
        metadata: {
          user_sub: userSub,
          plan: "starter",
        },
      });

      return json(200, { url: session.url });
    }

    // POST /billing/portal
    if (method === "POST" && path === "/billing/portal") {
      if (!email) return json(400, { message: "Cannot open portal: missing email on user" });

      // Find customer by email (avoids needing a DB mapping)
      const found = await stripe.customers.search({
        query: `email:'${email.replace(/'/g, "\\'")}'`,
        limit: 1,
      });

      const customer = found.data?.[0];
      if (!customer?.id) return json(404, { message: "No Stripe customer found for this account" });

      const portal = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: PORTAL_RETURN_URL,
      });

      return json(200, { url: portal.url });
    }

    return json(404, { message: "Not Found" });
  } catch (err: any) {
    console.error("billing handler error", err);
    return json(500, { message: "Internal Server Error" });
  }
};
