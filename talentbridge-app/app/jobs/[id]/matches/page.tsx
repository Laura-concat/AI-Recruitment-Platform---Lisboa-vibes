import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { matches, candidateProfiles, jobs } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSubscriptionStatus } from "@/lib/subscription";
import { UpgradePrompt, PastDueBanner } from "@/components/upgrade-prompt";
import MatchesView from "./MatchesView";

export interface MatchRow {
  matchId: string;
  candidateProfileId: string;
  matchScore: number;
  matchExplanation: string | null;
  fullName: string | null;
  skills: string[];
  experienceYears: number | null;
  seniorityLevel: string | null;
  languages: string[];
  summary: string | null;
}

export default async function MatchResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const sub = await getSubscriptionStatus(userId);
  if (!sub.isActive && !sub.isPastDue) {
    return <UpgradePrompt returnPath="/dashboard/client" />;
  }

  const { id: jobId } = await params;

  // Verify the job belongs to this client
  const [job] = await db
    .select({ id: jobs.id, title: jobs.title, status: jobs.status })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

  if (!job) redirect("/dashboard/client");

  // Fetch matches with candidate profile data
  const rows = await db
    .select({
      matchId: matches.id,
      candidateProfileId: matches.candidateProfileId,
      matchScore: matches.matchScore,
      matchExplanation: matches.matchExplanation,
      fullName: candidateProfiles.fullName,
      skills: candidateProfiles.skills,
      experienceYears: candidateProfiles.experienceYears,
      seniorityLevel: candidateProfiles.seniorityLevel,
      languages: candidateProfiles.languages,
      summary: candidateProfiles.summary,
    })
    .from(matches)
    .innerJoin(candidateProfiles, eq(matches.candidateProfileId, candidateProfiles.id))
    .where(eq(matches.jobId, jobId))
    .orderBy(desc(matches.matchScore));

  return (
    <>
      {sub.isPastDue && <PastDueBanner />}
      <MatchesView job={job} matchRows={rows} />
    </>
  );
}
