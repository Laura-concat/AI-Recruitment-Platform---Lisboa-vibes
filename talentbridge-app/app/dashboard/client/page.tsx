import Link from "next/link";
import { Navbar } from "@/components/navbar";

const activeJobs = [
  {
    id: "1",
    title: "Senior React Developer",
    postedAgo: "3 days ago",
    matches: 5,
    status: "Awaiting your review",
  },
  {
    id: "2",
    title: "Backend Node.js Engineer",
    postedAgo: "1 week ago",
    matches: 3,
    status: "AI analysis complete",
  },
];

export default function ClientDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" userName="Ahmed" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Welcome, Ahmed 👋</h1>
        <p className="text-sm text-gray-500 mb-8">
          Dubai FinTech Co · Professional Plan · 2 active job postings
        </p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard value="2" label="Active job posts" />
          <StatCard value="8" label="Candidate matches" amber />
          <StatCard value="3" label="Interviews scheduled" />
          <div className="bg-white border-2 border-[#1a3d2b] rounded-xl p-5">
            <div className="text-xs font-semibold text-[#1a3d2b] mb-1">Pro Plan</div>
            <div className="text-sm text-gray-700 font-medium">Renews June 2026</div>
            <Link href="/billing" className="text-xs text-[#1a3d2b] hover:underline mt-1 inline-block">
              Manage →
            </Link>
          </div>
        </div>

        {/* Active Job Postings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Job Postings</h2>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">{job.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Posted {job.postedAgo} · {job.matches} candidates matched · {job.status}
                  </p>
                </div>
                <Link
                  href={`/jobs/${job.id}/matches`}
                  className="bg-[#1a3d2b] text-white text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  View Matches →
                </Link>
              </div>
            ))}
          </div>
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
