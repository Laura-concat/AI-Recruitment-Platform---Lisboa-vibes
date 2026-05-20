import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return new Response("Stripe not configured", { status: 500 });
  }
  const stripe = new Stripe(stripeKey);

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response("Invalid Stripe webhook signature", { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const tier = (sub.metadata?.tier as "basic" | "pro") ?? "basic";
      const status = mapStripeStatus(sub.status);
      // current_period_end is on the first subscription item in Stripe v22
      const periodEnd = sub.items.data[0]?.current_period_end ?? 0;

      await db
        .insert(subscriptions)
        .values({
          userId: sub.metadata.userId,
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          tier,
          status,
          currentPeriodEnd: new Date(periodEnd * 1000),
        })
        .onConflictDoUpdate({
          target: subscriptions.stripeSubscriptionId,
          set: {
            status,
            tier,
            currentPeriodEnd: new Date(periodEnd * 1000),
            updatedAt: new Date(),
          },
        });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db
        .update(subscriptions)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // In Stripe v22 the subscription ref lives on invoice.parent
      const parentSub = (invoice.parent as { subscription_details?: { subscription?: string } } | null)
        ?.subscription_details?.subscription;
      if (parentSub) {
        await db
          .update(subscriptions)
          .set({ status: "past_due", updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, parentSub));
      }
      break;
    }
  }

  return new Response("OK", { status: 200 });
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): "active" | "canceled" | "past_due" | "trialing" {
  switch (status) {
    case "active":    return "active";
    case "canceled":  return "canceled";
    case "past_due":  return "past_due";
    case "trialing":  return "trialing";
    default:          return "active";
  }
}
