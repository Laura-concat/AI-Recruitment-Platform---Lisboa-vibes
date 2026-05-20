"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/navbar";

const candidate = {
  name: "Leila Mansour",
  initials: "LM",
  title: "Full-Stack Developer · 5 yrs · Beirut, Lebanon · Remote-ready · Bilingual Arabic/English",
  matchScore: 94,
  matchExplanation:
    "Leila's 5 years in React and Node.js aligns perfectly with your stack. Her bilingual Arabic/English background is ideal for your MENA-focused clients, and her Fintech background matches your industry.",
  skills: ["React", "TypeScript", "Python", "PostgreSQL", "Docker", "AWS"],
  experienceLevel: "Senior",
  experienceYears: "5",
  languageFit: "Arabic & English",
  education: "BSc",
  summary:
    "Experienced full-stack developer with 5 years in Fintech & e-commerce across MENA. Bilingual Arabic/English.",
  experience: [
    { role: "Senior Frontend Dev", company: "Fintech Startup, Beirut", period: "2022–Present" },
    { role: "Full-Stack Developer", company: "E-commerce Agency, Amman", period: "2019–2022" },
  ],
  education_detail: "BSc Computer Science — AUB, 2019",
  availability: "Full-time · Remote · From June 2026",
};

export default function ClientCandidateViewPage() {
  const [verdict, setVerdict] = useState<"fit" | "not-fit" | null>(null);
  const [introSent, setIntroSent] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="text-sm text-gray-400 mb-4">
          <Link href="/jobs/1/matches" className="hover:text-[#1a3d2b]">Back to matches</Link>
          {" / "}
          <span>Leila Mansour</span>
          {" / "}
          <span>94% match</span>
        </div>

        {introSent && (
          <div className="mb-4 bg-[#f0fdf4] border border-[#bbf7d0] text-[#1a3d2b] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span>✓</span> Introduction request sent to Leila Mansour. We&apos;ll be in touch within 24 hours.
          </div>
        )}

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
              <button
                onClick={() => setIntroSent(true)}
                disabled={introSent}
                className="w-full bg-[#1a3d2b] text-white text-sm py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {introSent ? "Intro Requested ✓" : "Request Intro →"}
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
              <button
                onClick={() => setVerdict((v) => (v === "not-fit" ? null : "not-fit"))}
                className={`flex-1 text-sm py-2 rounded-md border transition-colors ${
                  verdict === "not-fit"
                    ? "bg-red-100 border-red-400 text-red-600 font-medium"
                    : "border-red-200 text-red-500 hover:bg-red-50"
                }`}
              >
                {verdict === "not-fit" ? "Not a Fit ✓" : "Not a fit"}
              </button>
              <button
                onClick={() => {
                  setVerdict("fit");
                  setIntroSent(true);
                }}
                disabled={introSent}
                className={`flex-1 text-sm py-2 rounded-md transition-colors ${
                  verdict === "fit"
                    ? "bg-[#1a3d2b] text-white opacity-70 cursor-default"
                    : "bg-[#1a3d2b] text-white hover:opacity-90"
                }`}
              >
                {verdict === "fit" ? "Intro Sent ✓" : "Request intro →"}
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
