import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface SubscriptionStatus {
  isActive: boolean;
  isPastDue: boolean;
  tier: "basic" | "pro" | null;
  currentPeriodEnd: Date | null;
}

const PAST_DUE_GRACE_DAYS = 7;

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub) {
    return { isActive: false, isPastDue: false, tier: null, currentPeriodEnd: null };
  }

  const isActive = sub.status === "active" || sub.status === "trialing";

  // past_due retains read access for 7 days after period end
  let isPastDue = false;
  if (sub.status === "past_due") {
    const graceCutoff = new Date(sub.currentPeriodEnd);
    graceCutoff.setDate(graceCutoff.getDate() + PAST_DUE_GRACE_DAYS);
    isPastDue = graceCutoff > new Date();
  }

  return {
    isActive,
    isPastDue,
    tier: sub.tier,
    currentPeriodEnd: sub.currentPeriodEnd,
  };
}
