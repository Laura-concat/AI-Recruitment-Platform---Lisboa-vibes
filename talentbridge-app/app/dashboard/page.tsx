import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { candidateProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Navbar } from "@/components/navbar";

const jobMatches = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "Dubai FinTech Co.",
    type: "Full-time · Remote · Dubai, UAE",
    score: 94,
    scoreColor: "bg-[#1a3d2b]",
  },
  {
    id: "2",
    title: "Full-Stack Engineer",
    company: "Riyadh SaaS Startup",
    type: "Full-time · Hybrid · Riyadh, KSA",
    score: 88,
    scoreColor: "bg-[#16a34a]",
  },
  {
    id: "3",
    title: "React Native Developer",
    company: "Berlin Tech Co. (EU)",
    type: "Contract · Remote · Berlin, Germany",
    score: 80,
    scoreColor: "bg-amber-500",
  },
];

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
          <div className="space-y-3">
            {jobMatches.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">{job.title} — {job.company}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{job.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`${job.scoreColor} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                    {job.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
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
