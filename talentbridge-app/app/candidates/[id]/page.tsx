import Link from "next/link";
import { Navbar } from "@/components/navbar";

const candidate = {
  name: "Leila Mansour",
  initials: "LM",
  title: "Full-Stack Developer · 5 yrs · Beirut, Lebanon · Remote-ready · Bilingual Arabic/English",
  matchScore: 94,
  matchExplanation:
    "Why this match: Leila's 5 years in React and Node.js aligns perfectly with your stack. Her Bilingual Arabic/English background is ideal for your MENA-focused clients, and her strong Fintech background matches your industry.",
  skills: ["React", "TypeScript", "Python", "PostgreSQL", "Docker", "AWS"],
  experienceLevel: "Senior",
  experienceYears: "5",
  languageFit: "Arabic & English",
  education: "BSc",
  summary:
    "Experienced full-stack developer with 5 years in Fintech & e-commerce across MENA. Bilingual Arabic/English.",
  experience: [
    {
      role: "Senior Frontend Dev",
      company: "Fintech Startup, Beirut",
      period: "2022–Present",
    },
    {
      role: "Full-Stack Developer",
      company: "E-commerce Agency, Amman",
      period: "2019–2022",
    },
  ],
  education_detail: "BSc Computer Science — AUB, 2019",
  availability: "Full-time · Remote · From June 2026",
};

export default function ClientCandidateViewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4">
          <Link href="/jobs/1/matches" className="hover:text-[#1a3d2b]">Back to matches</Link>
          {" / "}
          <span>Leila Mansour</span>
          {" / "}
          <span>94% match</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: AI analysis */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#1a3d2b] text-white flex items-center justify-center font-bold">
                  {candidate.initials}
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">{candidate.name}</h1>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">{candidate.title}</p>
              <button className="w-full bg-[#1a3d2b] text-white text-sm py-2.5 rounded-md hover:opacity-90 transition-opacity">
                Request Intro →
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-[#1a3d2b] bg-[#f0fdf4] px-2 py-0.5 rounded">
                  AI Match Analysis
                </span>
              </div>
              <div className="text-5xl font-bold text-[#1a3d2b] mb-1">{candidate.matchScore}%</div>
              <p className="text-xs text-gray-400 mb-4">AI fit score for this role</p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Technical Skills</span>
                  <span className="font-medium">9/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience Level</span>
                  <span className="font-medium">{candidate.experienceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Language Fit</span>
                  <span className="font-medium">{candidate.languageFit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Education</span>
                  <span className="font-medium">{candidate.education}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">{candidate.matchExplanation}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 border border-red-200 text-red-500 text-sm py-2 rounded-md hover:bg-red-50">
                Not a fit
              </button>
              <button className="flex-1 bg-[#1a3d2b] text-white text-sm py-2 rounded-md hover:opacity-90">
                Request intro →
              </button>
            </div>
          </div>

          {/* Right: Profile details */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-sm text-gray-600">{candidate.summary}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <span key={skill} className="text-xs bg-[#f0fdf4] text-[#1a3d2b] border border-[#bbf7d0] px-2 py-1 rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Experience</h3>
              <div className="space-y-3">
                {candidate.experience.map((exp) => (
                  <div key={exp.role} className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{exp.role}</p>
                      <p className="text-xs text-gray-500">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-400">{exp.period}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
              <p className="text-sm text-gray-600">{candidate.education_detail}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Availability</h3>
              <p className="text-sm text-gray-600">{candidate.availability}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
