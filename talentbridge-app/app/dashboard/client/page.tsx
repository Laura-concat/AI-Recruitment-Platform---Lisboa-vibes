import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Navbar } from "@/components/navbar";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
}

export default async function ClientDashboardPage() {
  const { userId } = await auth();

  const activeJobs = userId
    ? await db
        .select({
          id: jobs.id,
          title: jobs.title,
          status: jobs.status,
          requirements: jobs.requirements,
          createdAt: jobs.createdAt,
        })
        .from(jobs)
        .where(eq(jobs.userId, userId))
        .orderBy(desc(jobs.createdAt))
        .limit(20)
    : [];

  const jobCount = activeJobs.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Welcome back 👋</h1>
        <p className="text-sm text-gray-500 mb-8">
          {jobCount > 0
            ? `${jobCount} active job posting${jobCount !== 1 ? "s" : ""}. Here's your activity at a glance.`
            : "Post your first job to start matching with top developers."}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard value={String(jobCount)} label="Active job posts" />
          <StatCard value="—" label="Candidate matches" amber />
          <StatCard value="—" label="Interviews scheduled" />
        </div>

        {/* Active Job Postings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Job Postings</h2>
            <Link
              href="/jobs/new"
              className="bg-[#1a3d2b] text-white text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
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
              <Link
                href="/jobs/new"
                className="bg-[#1a3d2b] text-white text-sm px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity"
              >
                Post a Job →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobs.map((job) => {
                const reqs = job.requirements as { skills?: string[]; experienceYears?: number; employmentType?: string; location?: string } | null;
                const skillCount = reqs?.skills?.length ?? 0;
                const meta = [reqs?.employmentType, reqs?.location].filter(Boolean).join(" · ");
                return (
                  <div
                    key={job.id}
                    className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {meta && <span>{meta} · </span>}
                        Posted {timeAgo(new Date(job.createdAt))}
                        {skillCount > 0 && <span> · {skillCount} skills extracted</span>}
                      </p>
                      {reqs?.skills && reqs.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {reqs.skills.slice(0, 6).map((skill) => (
                            <span
                              key={skill}
                              className="text-xs bg-[#f0fdf4] text-[#1a3d2b] border border-[#bbf7d0] px-2 py-0.5 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                          {reqs.skills.length > 6 && (
                            <span className="text-xs text-gray-400 px-1 py-0.5">+{reqs.skills.length - 6} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/jobs/${job.id}/matches`}
                      className="shrink-0 ml-4 bg-[#1a3d2b] text-white text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                    >
                      View Matches →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 text-sm text-gray-400">
          Viewing as a <strong>Client</strong>. &nbsp;
          <Link href="/dashboard" className="text-[#1a3d2b] font-medium hover:underline">
            Switch to Candidate view →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, amber }: { value: string; label: string; amber?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className={`text-3xl font-bold mb-1 ${amber ? "text-amber-500" : "text-gray-900"}`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
