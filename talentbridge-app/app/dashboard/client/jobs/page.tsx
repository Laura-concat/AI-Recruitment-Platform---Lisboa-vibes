import Link from "next/link";
import { Navbar } from "@/components/navbar";

const jobs = [
  {
    id: "1",
    title: "Senior React Developer",
    type: "Full-time · Remote · Dubai, UAE",
    postedAgo: "3 days ago",
    matches: 5,
    interviews: 1,
    status: "matching" as const,
  },
  {
    id: "2",
    title: "Backend Node.js Engineer",
    type: "Full-time · Hybrid · Dubai, UAE",
    postedAgo: "1 week ago",
    matches: 3,
    interviews: 2,
    status: "complete" as const,
  },
  {
    id: "3",
    title: "Product Manager — FinTech",
    type: "Full-time · On-site · Dubai, UAE",
    postedAgo: "2 weeks ago",
    matches: 4,
    interviews: 0,
    status: "complete" as const,
  },
];

const statusLabel: Record<string, { label: string; className: string }> = {
  matching: { label: "AI Matching...", className: "bg-amber-100 text-amber-700" },
  complete: { label: "Matches ready", className: "bg-[#f0fdf4] text-[#1a3d2b]" },
};

export default function ClientJobsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Job Postings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Dubai FinTech Co · 3 active postings</p>
          </div>
          <Link
            href="/jobs/new"
            className="bg-[#1a3d2b] text-white text-sm px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity"
          >
            + Post a New Job
          </Link>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{job.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{job.type}</p>
                  <p className="text-xs text-gray-400 mt-1">Posted {job.postedAgo}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusLabel[job.status].className}`}>
                  {statusLabel[job.status].label}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex gap-6 text-sm text-gray-500">
                  <span><strong className="text-gray-900">{job.matches}</strong> candidates matched</span>
                  <span><strong className="text-gray-900">{job.interviews}</strong> interviews scheduled</span>
                </div>
                <Link
                  href={`/jobs/${job.id}/matches`}
                  className="text-sm bg-[#1a3d2b] text-white px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity"
                >
                  View Matches →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
