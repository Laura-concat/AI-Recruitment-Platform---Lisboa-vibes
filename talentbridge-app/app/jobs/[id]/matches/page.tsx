import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSubscriptionStatus } from "@/lib/subscription";
import { UpgradePrompt, PastDueBanner } from "@/components/upgrade-prompt";
import MatchesView from "./MatchesView";

export default async function MatchResultsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const sub = await getSubscriptionStatus(userId);

  if (!sub.isActive && !sub.isPastDue) {
    return <UpgradePrompt returnPath="/dashboard/client" />;
  }

  return (
    <>
      {sub.isPastDue && <PastDueBanner />}
      <MatchesView />
    </>
  );
}
