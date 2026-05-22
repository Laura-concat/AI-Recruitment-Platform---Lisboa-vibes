"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/navbar";

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
}

interface Education {
  degree: string;
  institution: string;
  year?: number;
}

interface Props {
  matchId: string;
  matchScore: number;
  matchExplanation: string | null;
  jobTitle: string;
  jobId: string;
  fullName: string | null;
  skills: string[];
  experienceYears: number | null;
  seniorityLevel: string | null;
  languages: string[];
  summary: string | null;
  experienceItems: ExperienceItem[] | null;
  education: Education | string | null;
}

function formatEducation(edu: Education | string | null): string {
  if (!edu) return "";
  if (typeof edu === "string") return edu;
  return [edu.degree, edu.institution, edu.year].filter(Boolean).join(" — ");
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function CandidateView({
  matchScore,
  matchExplanation,
  jobTitle,
  jobId,
  fullName,
  skills,
  experienceYears,
  seniorityLevel,
  languages,
  summary,
  experienceItems,
  education,
}: Props) {
  const [verdict, setVerdict] = useState<"fit" | "not-fit" | null>(null);
  const [introSent, setIntroSent] = useState(false);

  const name = fullName ?? "Anonymous Candidate";
  const eduStr = formatEducation(education);
  const levelLabel = seniorityLevel
    ? seniorityLevel.charAt(0).toUpperCase() + seniorityLevel.slice(1)
    : null;
  const subtitle = [
    levelLabel,
    experienceYears ? `${experienceYears} yr${experienceYears !== 1 ? "s" : ""}` : null,
    languages.length ? languages.join(" & ") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="text-sm text-gray-400 mb-4">
          <Link href={`/jobs/${jobId}/matches`} className="hover:text-[#1a3d2b]">
            Back to {jobTitle} matches
          </Link>
          {" / "}
          <span>{name}</span>
          {" / "}
          <span>{matchScore}% match</span>
        </div>

        {introSent && (
          <div className="mb-4 bg-[#f0fdf4] border border-[#bbf7d0] text-[#1a3d2b] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span>✓</span> Introduction request sent for {name}. We&apos;ll be in touch within 24 hours.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: AI analysis + actions */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#1a3d2b] text-white flex items-center justify-center font-bold">
                  {initials(fullName)}
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">{name}</h1>
                  {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
              </div>
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
              <div className="text-5xl font-bold text-[#1a3d2b] mb-1">{matchScore}%</div>
              <p className="text-xs text-gray-400 mb-4">AI fit score for this role</p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Experience Level</span>
                  <span className="font-medium">{levelLabel ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Years exp.</span>
                  <span className="font-medium">
                    {experienceYears != null ? `${experienceYears} yr${experienceYears !== 1 ? "s" : ""}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Languages</span>
                  <span className="font-medium">{languages.length ? languages.join(" & ") : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Education</span>
                  <span className="font-medium">{eduStr ? eduStr.split("—")[0].trim() : "—"}</span>
                </div>
              </div>

              {matchExplanation && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 leading-relaxed">{matchExplanation}</p>
                </div>
              )}
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

          {/* Right: Full profile */}
          <div className="md:col-span-2 space-y-4">
            {summary && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
              </div>
            )}

            {skills.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-[#f0fdf4] text-[#1a3d2b] border border-[#bbf7d0] px-2 py-1 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(experienceItems) && experienceItems.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Experience</h3>
                <div className="space-y-4">
                  {experienceItems.map((exp, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{exp.role}</p>
                        <p className="text-xs text-gray-500">{exp.company}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 ml-4">{exp.period}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {eduStr && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
                <p className="text-sm text-gray-600">{eduStr}</p>
              </div>
            )}

            {languages.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Languages</h3>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <span
                      key={lang}
                      className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
