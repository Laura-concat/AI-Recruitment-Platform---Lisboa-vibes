import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { matches, candidateProfiles, jobs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSubscriptionStatus } from "@/lib/subscription";
import { UpgradePrompt, PastDueBanner } from "@/components/upgrade-prompt";
import CandidateView from "./CandidateView";

export default async function ClientCandidateViewPage({
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

  const { id: matchId } = await params;

  // Fetch match + candidate profile + job, verifying client owns the job
  const [row] = await db
    .select({
      matchScore: matches.matchScore,
      matchExplanation: matches.matchExplanation,
      jobTitle: jobs.title,
      jobId: jobs.id,
      fullName: candidateProfiles.fullName,
      skills: candidateProfiles.skills,
      experienceYears: candidateProfiles.experienceYears,
      seniorityLevel: candidateProfiles.seniorityLevel,
      languages: candidateProfiles.languages,
      summary: candidateProfiles.summary,
      experienceItems: candidateProfiles.experienceItems,
      education: candidateProfiles.education,
    })
    .from(matches)
    .innerJoin(candidateProfiles, eq(matches.candidateProfileId, candidateProfiles.id))
    .innerJoin(jobs, and(eq(matches.jobId, jobs.id), eq(jobs.userId, userId)))
    .where(eq(matches.id, matchId));

  if (!row) redirect("/dashboard/client");

  return (
    <>
      {sub.isPastDue && <PastDueBanner />}
      <CandidateView
        matchId={matchId}
        matchScore={Math.round(row.matchScore)}
        matchExplanation={row.matchExplanation}
        jobTitle={row.jobTitle}
        jobId={row.jobId}
        fullName={row.fullName}
        skills={row.skills}
        experienceYears={row.experienceYears}
        seniorityLevel={row.seniorityLevel}
        languages={row.languages}
        summary={row.summary}
        experienceItems={row.experienceItems as { role: string; company: string; period: string }[] | null}
        education={row.education as { degree: string; institution: string; year?: number } | string | null}
      />
    </>
  );
}
