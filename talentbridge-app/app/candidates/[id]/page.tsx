import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { matches, candidateProfiles, jobs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import CandidateView from "./CandidateView";

export default async function ClientCandidateViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ intro?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const { id: matchId } = await params;
  const { intro } = await searchParams;
  const autoOpenIntro = intro === "1";

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
      personalBio: candidateProfiles.personalBio,
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
        personalBio={row.personalBio ?? null}
        experienceItems={row.experienceItems as { role: string; company: string; period: string }[] | null}
        education={row.education as { degree: string; institution: string; year?: number } | string | null}
        autoOpenIntro={autoOpenIntro}
      />
    </>
  );
}
