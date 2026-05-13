import Link from "next/link";
import { Navbar } from "@/components/navbar";

const candidate = {
  name: "Leila Mansour",
  initials: "LM",
  title: "Full-Stack Developer",
  experience: "5 yrs",
  location: "Beirut, Lebanon",
  availability: "Remote-ready",
  languages: ["Arabic", "English"],
  completeness: 92,
  skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
  experienceLevel: "Senior",
  experienceYears: 5,
  languageProficiency: "Arabic & English",
  education: "BSc Computer Science — AUB, 2019",
  availability2: "Full-time · Remote · From June 2026",
  summary:
    "Experienced full-stack developer with 5 years in Fintech & e-commerce across MENA. Bilingual Arabic/English.",
  experience_items: [
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
};

export default function CandidateProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="candidate" userName={candidate.name} />

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1a3d2b] text-white flex items-center justify-center text-2xl font-bold">
              {candidate.initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
              <p className="text-gray-500 text-sm">
                {candidate.title} · {candidate.experience} · {candidate.location} · Remote-ready · {candidate.languages.join(" & ")}
              </p>
            </div>
          </div>
          <button className="text-sm border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
            Edit Profile
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: AI analysis summary */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-[#1a3d2b] bg-[#f0fdf4] px-2 py-0.5 rounded">
                  AI Match Analysis
                </span>
              </div>
              <div className="text-5xl font-bold text-[#1a3d2b] mb-1">
                {candidate.completeness}%
              </div>
              <p className="text-xs text-gray-400">Profile completeness</p>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Technical Skills</span>
                  <span className="font-medium">9/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience Level</span>
                  <span className="font-medium">Senior</span>
                </div>
                <div className="flex justify-between">
                  <span>Language Fit</span>
                  <span className="font-medium">{candidate.languageProficiency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Education</span>
                  <span className="font-medium">BSc</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <span key={skill} className="text-xs bg-[#f0fdf4] text-[#1a3d2b] border border-[#bbf7d0] px-2 py-1 rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-sm text-gray-600">{candidate.summary}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Experience</h3>
              <div className="space-y-3">
                {candidate.experience_items.map((exp) => (
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
              <p className="text-sm text-gray-600">{candidate.education}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Availability</h3>
              <p className="text-sm text-gray-600">{candidate.availability2}</p>
            </div>

            <div className="flex gap-3">
              <button className="border border-red-200 text-red-500 text-sm px-4 py-2 rounded-md hover:bg-red-50 transition-colors">
                Not a fit
              </button>
              <button className="bg-[#1a3d2b] text-white text-sm px-6 py-2 rounded-md hover:opacity-90 transition-opacity">
                Request Introduction →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
