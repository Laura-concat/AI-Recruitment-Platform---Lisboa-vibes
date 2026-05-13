import Link from "next/link";
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

export default function CandidateDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="candidate" userName="Leila" />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back, Leila 👋
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Your profile is live. Here&apos;s your activity at a glance.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard value="12" label="Companies viewed your profile" />
          <StatCard value="3" label="Active job matches" />
          <StatCard value="92%" label="Profile completeness" highlight />
        </div>

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
