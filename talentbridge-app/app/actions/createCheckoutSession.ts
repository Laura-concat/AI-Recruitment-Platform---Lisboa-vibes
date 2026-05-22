"use server";

import Stripe from "stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function createCheckoutSession(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-up");

  const plan = (formData.get("plan") as string) || "basic";

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) throw new Error("Stripe is not configured.");

  const priceId =
    plan === "pro"
      ? process.env.STRIPE_PRICE_ID_PRO
      : process.env.STRIPE_PRICE_ID_BASIC;

  if (!priceId) throw new Error(`Stripe price ID not set for plan: ${plan}`);

  const stripe = new Stripe(stripeKey);

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  if (email) {
    await db
      .insert(users)
      .values({ id: userId, email, role: "client" })
      .onConflictDoNothing();
  }

  // Reuse existing Stripe customer if one exists
  const [existingSub] = await db
    .select({ stripeCustomerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  let customerId = existingSub?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: email ?? undefined,
      metadata: { userId },
    });
    customerId = customer.id;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/client?subscription=success`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { userId, tier: plan },
    subscription_data: {
      metadata: { userId, tier: plan },
    },
  });

  redirect(session.url!);
}
