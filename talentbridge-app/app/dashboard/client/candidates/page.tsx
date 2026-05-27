import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { matches, candidateProfiles, jobs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Navbar } from "@/components/navbar";

function initials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 90 ? "bg-[#1a3d2b]" : score >= 80 ? "bg-[#16a34a]" : "bg-amber-500";
  return (
    <span className={`${bg} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
      {score}%
    </span>
  );
}

export default async function ClientCandidatesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  // Fetch all matches across all this client's jobs
  const rows = await db
    .select({
      matchId: matches.id,
      matchScore: matches.matchScore,
      matchExplanation: matches.matchExplanation,
      jobTitle: jobs.title,
      jobId: jobs.id,
      fullName: candidateProfiles.fullName,
      skills: candidateProfiles.skills,
      experienceYears: candidateProfiles.experienceYears,
      seniorityLevel: candidateProfiles.seniorityLevel,
      languages: candidateProfiles.languages,
    })
    .from(matches)
    .innerJoin(candidateProfiles, eq(matches.candidateProfileId, candidateProfiles.id))
    .innerJoin(jobs, eq(matches.jobId, jobs.id))
    .where(eq(jobs.userId, userId))
    .orderBy(desc(matches.matchScore));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {rows.length} candidate{rows.length !== 1 ? "s" : ""} matched across your job postings
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-sm font-medium text-gray-700 mb-1">No candidates yet</p>
            <p className="text-xs text-gray-400 mb-6">
              Post a job and run matching to see candidates here.
            </p>
            <Link
              href="/jobs/new"
              className="bg-[#1a3d2b] text-white text-sm px-5 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              Post a Job →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((c) => {
              const name = c.fullName ?? "Anonymous Candidate";
              const score = Math.round(c.matchScore);
              const subtitle = [
                c.seniorityLevel
                  ? c.seniorityLevel.charAt(0).toUpperCase() + c.seniorityLevel.slice(1)
                  : null,
                c.experienceYears ? `${c.experienceYears} yr${c.experienceYears !== 1 ? "s" : ""}` : null,
                c.languages.length ? c.languages.join(" & ") : null,
              ].filter(Boolean).join(" · ");

              return (
                <div key={c.matchId} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-[#1a3d2b] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {initials(c.fullName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-gray-900">{name}</span>
                          {score >= 90 && (
                            <span className="text-xs bg-[#f0fdf4] text-[#1a3d2b] border border-[#bbf7d0] px-2 py-0.5 rounded-full font-medium">
                              Top Match
                            </span>
                          )}
                        </div>
                        {subtitle && <p className="text-sm text-gray-500 mb-1">{subtitle}</p>}
                        <p className="text-xs text-gray-400">Matched to: {c.jobTitle}</p>
                        {c.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {c.skills.slice(0, 6).map((s) => (
                              <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                            {c.skills.length > 6 && (
                              <span className="text-xs text-gray-400">+{c.skills.length - 6} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <ScoreBadge score={score} />
                      <Link
                        href={`/candidates/${c.matchId}`}
                        className="text-sm border border-gray-300 px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
