import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Stripe requires the **raw** request body for signature verification.
// For HTTP API v2 (payload 2.0), event.body is a string (possibly base64).
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const sig = event.headers?.["stripe-signature"] || event.headers?.["Stripe-Signature"];
    if (!sig) {
      return { statusCode: 400, body: "Missing stripe-signature header" };
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return { statusCode: 500, body: "Missing STRIPE_WEBHOOK_SECRET" };
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return { statusCode: 500, body: "Missing STRIPE_SECRET_KEY" };
    }

    const rawBody = event.body
      ? (event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body)
      : "";

    let stripeEvent: Stripe.Event;

    try {
      stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      return { statusCode: 400, body: `Webhook signature verification failed: ${err?.message || err}` };
    }

    // Handle the events you care about
    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        // Customer finished checkout; subscription may be present
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        // TODO: write/update the user's plan in DynamoDB using session.customer / session.client_reference_id / session.metadata
        // console.log("checkout.session.completed", { id: session.id, customer: session.customer, subscription: session.subscription });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = stripeEvent.data.object as Stripe.Subscription;
        // TODO: update user's plan status in DynamoDB
        // console.log(stripeEvent.type, { id: sub.id, status: sub.status, customer: sub.customer });
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        // TODO: optionally mark account delinquent / paid in DynamoDB
        // console.log(stripeEvent.type, { id: invoice.id, customer: invoice.customer, subscription: invoice.subscription });
        break;
      }

      default:
        // console.log(`Unhandled event type: ${stripeEvent.type}`);
        break;
    }

    // Stripe expects a 2xx response quickly.
    return { statusCode: 200, body: "ok" };
  } catch (err: any) {
    return { statusCode: 500, body: `Webhook handler error: ${err?.message || err}` };
  }
};
