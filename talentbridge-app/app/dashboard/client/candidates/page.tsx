import Link from "next/link";
import { Navbar } from "@/components/navbar";

const candidates = [
  {
    id: "leila-mansour",
    initials: "LM",
    name: "Leila Mansour",
    title: "Full-Stack Developer · 5 yrs · Beirut, Lebanon · Remote-ready",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
    score: 94,
    matchedJob: "Senior React Developer",
    status: "shortlisted" as const,
  },
  {
    id: "sara-al-ahmad",
    initials: "SA",
    name: "Sara Al-Ahmad",
    title: "React Native Developer · 4 yrs · Amman, Jordan · Remote-first",
    skills: ["React Native", "TypeScript", "Firebase", "GraphQL"],
    score: 88,
    matchedJob: "Senior React Developer",
    status: "interviewing" as const,
  },
  {
    id: "nour-hassan",
    initials: "NH",
    name: "Nour Hassan",
    title: "Frontend Developer · 3 yrs · Cairo, Egypt · Open to relocation",
    skills: ["React", "Vue.js", "JavaScript", "CSS", "Figma"],
    score: 82,
    matchedJob: "Senior React Developer",
    status: "reviewing" as const,
  },
  {
    id: "omar-khalil",
    initials: "OK",
    name: "Omar Khalil",
    title: "Backend Engineer · 6 yrs · Dubai, UAE · On-site",
    skills: ["Node.js", "Python", "PostgreSQL", "Docker", "AWS"],
    score: 91,
    matchedJob: "Backend Node.js Engineer",
    status: "shortlisted" as const,
  },
];

const statusStyles: Record<string, string> = {
  shortlisted: "bg-[#f0fdf4] text-[#1a3d2b]",
  interviewing: "bg-blue-50 text-blue-700",
  reviewing: "bg-gray-100 text-gray-600",
};

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 90 ? "bg-[#1a3d2b]" : score >= 85 ? "bg-[#16a34a]" : "bg-amber-500";
  return (
    <span className={`${bg} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
      {score}%
    </span>
  );
}

export default function ClientCandidatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-sm text-gray-500 mt-0.5">All candidates matched across your job postings</p>
        </div>

        <div className="space-y-4">
          {candidates.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#1a3d2b] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {c.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900">{c.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusStyles[c.status]}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{c.title}</p>
                    <p className="text-xs text-gray-400">Matched to: {c.matchedJob}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {c.skills.map((s) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <ScoreBadge score={c.score} />
                  <Link
                    href={`/candidates/${c.id}`}
                    className="text-sm border border-gray-300 px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
