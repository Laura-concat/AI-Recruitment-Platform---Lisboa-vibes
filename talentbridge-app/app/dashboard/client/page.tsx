import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { jobs, matches, candidateProfiles, introRequests } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { getSubscriptionStatus } from "@/lib/subscription";
import { createPortalSession } from "@/app/actions/createPortalSession";

const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;

type Outcome = "shortlisted" | "interviewing" | "hired" | "rejected" | null;

function outcomeLabel(outcome: Outcome, hasIntro: boolean): { label: string; className: string } {
  if (outcome === "hired")       return { label: "Hired ✓",          className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  if (outcome === "interviewing") return { label: "Interviewing",      className: "bg-blue-100 text-blue-700 border-blue-200" };
  if (hasIntro)                   return { label: "Intro Requested",   className: "bg-blue-50 text-blue-600 border-blue-200" };
  if (outcome === "shortlisted")  return { label: "Shortlisted",       className: "bg-green-100 text-green-700 border-green-200" };
  if (outcome === "rejected")     return { label: "Archived",          className: "bg-gray-100 text-gray-400 border-gray-200" };
  return                                  { label: "Matched",          className: "bg-gray-100 text-gray-600 border-gray-200" };
}

function ScoreDot({ score }: { score: number }) {
  const bg = score >= 80 ? "bg-[#1a3d2b]" : score >= 60 ? "bg-amber-500" : "bg-gray-400";
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold flex-shrink-0 ${bg}`}>
      {score}
    </span>
  );
}

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ subscription?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;
  const subscriptionSuccess = params.subscription === "success";

  const [sub, activeJobs_] = await Promise.all([
    userId ? getSubscriptionStatus(userId) : Promise.resolve(null),
    userId
      ? db
          .select({
            id: jobs.id,
            title: jobs.title,
            status: jobs.status,
            requirements: jobs.requirements,
            applyDeadline: jobs.applyDeadline,
            createdAt: jobs.createdAt,
          })
          .from(jobs)
          .where(eq(jobs.userId, userId))
          .orderBy(desc(jobs.createdAt))
          .limit(20)
      : Promise.resolve([]),
  ]);

  const activeJobs = activeJobs_;
  const jobIds = activeJobs.map((j) => j.id);

  // Fetch all matches + candidate names + intro requests for these jobs
  const [matchRows, introRows] = await Promise.all([
    jobIds.length > 0
      ? db
          .select({
            matchId: matches.id,
            jobId: matches.jobId,
            candidateProfileId: matches.candidateProfileId,
            matchScore: matches.matchScore,
            outcome: matches.outcome,
            fullName: candidateProfiles.fullName,
          })
          .from(matches)
          .innerJoin(candidateProfiles, eq(matches.candidateProfileId, candidateProfiles.id))
          .where(inArray(matches.jobId, jobIds))
          .orderBy(desc(matches.matchScore))
      : Promise.resolve([]),
    jobIds.length > 0
      ? db
          .select({ matchId: introRequests.matchId })
          .from(introRequests)
          .where(inArray(introRequests.jobId, jobIds))
      : Promise.resolve([]),
  ]);

  const introMatchIds = new Set(introRows.map((r) => r.matchId));

  type MatchRow = (typeof matchRows)[number];
  // Group matches by jobId
  const matchesByJob = new Map<string, MatchRow[]>();
  for (const row of matchRows) {
    if (!matchesByJob.has(row.jobId)) matchesByJob.set(row.jobId, []);
    matchesByJob.get(row.jobId)!.push(row);
  }

  const jobCount = activeJobs.length;
  const totalMatches = matchRows.filter((m) => m.outcome !== "rejected").length;
  const totalInterviewing = matchRows.filter((m) => m.outcome === "interviewing" || m.outcome === "hired").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      {sub?.isPastDue && stripeConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-center justify-between">
          <span>Your last payment failed. Please update your payment method to keep access.</span>
          <form action={createPortalSession}>
            <button type="submit" className="ml-4 text-xs font-medium underline hover:no-underline">
              Manage billing →
            </button>
          </form>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-6 py-10">
        {subscriptionSuccess && (
          <div className="mb-6 bg-[#f0fdf4] border border-[#bbf7d0] text-[#1a3d2b] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span>✓</span> Subscription activated! You now have full access to candidate profiles and match results.
          </div>
        )}

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-0.5">My Jobs</h1>
            <p className="text-sm text-gray-500">
              {jobCount > 0
                ? `${jobCount} job posting${jobCount !== 1 ? "s" : ""} · ${totalMatches} candidate${totalMatches !== 1 ? "s" : ""} matched`
                : "Post your first job to start matching with top developers."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {sub?.isActive && stripeConfigured && (
              <form action={createPortalSession}>
                <button type="submit" className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
                  Manage subscription
                </button>
              </form>
            )}
            {!sub?.isActive && !sub?.isPastDue && (
              <Link href="/pricing" className="text-xs bg-[#1a3d2b] text-white px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity">
                Subscribe to access talent →
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard value={String(jobCount)} label="Job postings" />
          <StatCard value={totalMatches > 0 ? String(totalMatches) : "—"} label="Candidates matched" />
          <StatCard value={totalInterviewing > 0 ? String(totalInterviewing) : "—"} label="Interviewing" amber={totalInterviewing === 0} />
        </div>

        {/* Job list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Job Postings</h2>
            <Link href="/jobs/new" className="bg-[#1a3d2b] text-white text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
              + Post New Job
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-sm text-gray-500 mb-6">
                Post your first job description and our AI will match you with the best candidates.
              </p>
              <Link href="/jobs/new" className="bg-[#1a3d2b] text-white text-sm px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity">
                Post a Job →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job) => {
                const reqs = job.requirements as { skills?: string[]; employmentType?: string; location?: string; country?: string; city?: string } | null;
                const locationLabel = reqs?.location === "On-site" && (reqs?.city || reqs?.country)
                  ? `On-site · ${[reqs.city, reqs.country].filter(Boolean).join(", ")}`
                  : reqs?.location;
                const meta = [reqs?.employmentType, locationLabel].filter(Boolean).join(" · ");
                const postedDate = new Date(job.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                const deadlineDate = job.applyDeadline
                  ? new Date(job.applyDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                  : null;
                const isDeadlinePast = job.applyDeadline ? new Date(job.applyDeadline) < new Date() : false;
                const jobMatches = matchesByJob.get(job.id) ?? [];
                const activeMatches = jobMatches.filter((m) => m.outcome !== "rejected");

                return (
                  <div key={job.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {/* Job header */}
                    <div className="px-5 py-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{job.title}</p>
                          {job.status === "matching" && (
                            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              Matching…
                            </span>
                          )}
                          {job.status === "pending" && activeMatches.length === 0 && (
                            <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">
                              Awaiting match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {meta && <span>{meta} · </span>}Posted {postedDate}
                          {deadlineDate && (
                            <span className={`ml-2 font-medium ${isDeadlinePast ? "text-red-500" : "text-amber-600"}`}>
                              · {isDeadlinePast ? "Deadline passed" : `Apply by ${deadlineDate}`}
                            </span>
                          )}
                        </p>
                      </div>
                      <Link
                        href={`/jobs/${job.id}/matches`}
                        className="shrink-0 text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {activeMatches.length > 0 ? "Manage →" : "View →"}
                      </Link>
                    </div>

                    {/* Candidate rows */}
                    {activeMatches.length > 0 && (
                      <div className="border-t border-gray-100">
                        {activeMatches.map((m, i) => {
                          const hasIntro = introMatchIds.has(m.matchId);
                          const status = outcomeLabel(m.outcome as Outcome, hasIntro);
                          const score = Math.round(m.matchScore);
                          return (
                            <div
                              key={m.matchId}
                              className={`flex items-center gap-3 px-5 py-3 ${i < activeMatches.length - 1 ? "border-b border-gray-50" : ""}`}
                            >
                              <ScoreDot score={score} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {m.fullName ?? "Candidate"}
                                </p>
                                <p className="text-xs text-gray-400">{score}% match</p>
                              </div>
                              <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${status.className}`}>
                                {status.label}
                              </span>
                              <Link
                                href={`/candidates/${m.matchId}`}
                                className="text-xs text-gray-400 hover:text-[#1a3d2b] transition-colors shrink-0"
                              >
                                View →
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {activeMatches.length === 0 && job.status === "complete" && (
                      <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400 flex items-center justify-between">
                        <span>No active candidates — all may be archived.</span>
                        <Link href={`/jobs/${job.id}/matches`} className="text-[#1a3d2b] hover:underline">View archived →</Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, amber }: { value: string; label: string; amber?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className={`text-3xl font-bold mb-1 ${amber ? "text-gray-300" : "text-gray-900"}`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
