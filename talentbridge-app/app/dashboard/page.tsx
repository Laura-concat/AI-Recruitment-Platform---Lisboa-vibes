import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { candidateProfiles, matches, jobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { redirect } from "next/navigation";
import { JobMatchCard } from "@/components/job-match-card";


function calcCompleteness(p: {
  fullName: string | null;
  summary: string | null;
  skills: string[];
  experienceItems: unknown;
  education: unknown;
  languages: string[];
}): number {
  let score = 0;
  if (p.fullName) score += 20;
  if (p.summary) score += 20;
  if (p.skills.length > 0) score += 25;
  if (Array.isArray(p.experienceItems) && p.experienceItems.length > 0) score += 20;
  if (p.education) score += 10;
  if (p.languages.length > 0) score += 5;
  return Math.min(score, 100);
}

export default async function CandidateDashboardPage() {
  const { userId } = await auth();

  // Redirect clients to their own dashboard
  const clerkUser = userId ? await currentUser() : null;
  if (clerkUser?.unsafeMetadata?.role === "client") {
    redirect("/dashboard/client");
  }
  const profile = userId
    ? (await db.select({
        id: candidateProfiles.id,
        fullName: candidateProfiles.fullName,
        experienceYears: candidateProfiles.experienceYears,
        seniorityLevel: candidateProfiles.seniorityLevel,
        skills: candidateProfiles.skills,
        languages: candidateProfiles.languages,
        summary: candidateProfiles.summary,
        education: candidateProfiles.education,
        experienceItems: candidateProfiles.experienceItems,
      }).from(candidateProfiles).where(eq(candidateProfiles.userId, userId)).limit(1))[0] ?? null
    : null;

  // Fetch real AI matches for this candidate (if any)
  const jobMatchRows = profile
    ? await db
        .select({
          matchId: matches.id,
          matchScore: matches.matchScore,
          jobId: jobs.id,
          jobTitle: jobs.title,
          jobDescription: jobs.description,
          jobRequirements: jobs.requirements,
        })
        .from(matches)
        .innerJoin(jobs, eq(matches.jobId, jobs.id))
        .where(eq(matches.candidateProfileId, profile.id))
        .orderBy(matches.matchScore)
        .limit(10)
    : [];

  const jobMatches = jobMatchRows.map((row) => {
    const reqs = row.jobRequirements as { skills?: string[]; employmentType?: string; location?: string } | null;
    const typeParts = [reqs?.employmentType, reqs?.location].filter(Boolean);
    return {
      id: row.matchId,
      title: row.jobTitle,
      company: "", // client company not exposed to candidate for privacy
      type: typeParts.join(" · "),
      score: Math.round(row.matchScore),
      description: row.jobDescription,
      skills: reqs?.skills ?? [],
    };
  });

  const hasProfile = !!profile;
  const firstName = profile?.fullName?.split(" ")[0] ?? null;
  const completeness = profile ? calcCompleteness(profile) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="candidate" userName={profile?.fullName ?? undefined} />

      <div className="mx-auto max-w-4xl px-6 py-10">
        {!hasProfile && (
          <div className="mb-8 bg-[#f0fdf4] border border-[#1a3d2b]/20 rounded-xl p-6 flex items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1a3d2b] mb-1">Upload your CV to get started</h2>
              <p className="text-sm text-gray-600">Our AI will analyse your CV and build your profile automatically. Takes under 2 minutes.</p>
            </div>
            <Link
              href="/onboarding/upload"
              className="shrink-0 bg-[#1a3d2b] text-white text-sm font-medium px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity"
            >
              Upload CV →
            </Link>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {hasProfile
            ? `${profile.seniorityLevel ? profile.seniorityLevel.charAt(0).toUpperCase() + profile.seniorityLevel.slice(1) + " developer" : "Developer"}${profile.experienceYears ? ` · ${profile.experienceYears} yr${profile.experienceYears !== 1 ? "s" : ""} experience` : ""}. Here's your activity at a glance.`
            : "Complete your profile to start getting matched with top companies."}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard value={String(profile?.skills.length ?? 0)} label="Skills on your profile" />
          <StatCard value={profile?.experienceYears != null ? `${profile.experienceYears} yr${profile.experienceYears !== 1 ? "s" : ""}` : "—"} label="Years experience" />
          <StatCard value={`${completeness}%`} label="Profile completeness" highlight={completeness >= 80} />
        </div>

        {/* Skills snapshot */}
        {profile && profile.skills.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Your top skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.slice(0, 12).map((skill) => (
                <span key={skill} className="text-xs bg-[#f0fdf4] text-[#1a3d2b] border border-[#bbf7d0] px-2 py-1 rounded-md">
                  {skill}
                </span>
              ))}
              {profile.skills.length > 12 && (
                <span className="text-xs text-gray-400 px-2 py-1">+{profile.skills.length - 12} more</span>
              )}
            </div>
          </div>
        )}

        {/* Job Matches */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Job Matches</h2>
          {jobMatches.length > 0 ? (
            <div className="space-y-3">
              {jobMatches.map((job) => (
                <JobMatchCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm font-medium text-gray-700 mb-1">No matches yet</p>
              <p className="text-xs text-gray-400">
                {hasProfile
                  ? "You'll be matched automatically when clients post relevant jobs."
                  : "Upload your CV first to start getting matched with jobs."}
              </p>
            </div>
          )}
        </div>

        {/* View client dashboard link */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-sm text-gray-400">
          Viewing as a <strong>Candidate</strong>. &nbsp;
          <Link href="/dashboard/client" className="text-[#1a3d2b] font-medium hover:underline">
            Switch to Client view →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className={`text-3xl font-bold mb-1 ${highlight ? "text-amber-500" : "text-gray-900"}`}>
        {value}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
