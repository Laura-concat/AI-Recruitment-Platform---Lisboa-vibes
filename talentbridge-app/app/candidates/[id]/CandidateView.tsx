"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Navbar } from "@/components/navbar";
import { requestIntro } from "@/app/actions/requestIntro";

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
  personalBio: string | null;
  experienceItems: ExperienceItem[] | null;
  education: Education | string | null;
  autoOpenIntro?: boolean;
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
  matchId,
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
  personalBio,
  experienceItems,
  education,
  autoOpenIntro = false,
}: Props) {
  const [verdict, setVerdict] = useState<"fit" | "not-fit" | null>(null);
  const [introSent, setIntroSent] = useState(false);
  const [introError, setIntroError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showIntroModal, setShowIntroModal] = useState(autoOpenIntro);
  const [introMessage, setIntroMessage] = useState(
    `Hi, I came across your profile on TalentBridge and I'm very interested in speaking with you about the ${jobTitle} role. We think you could be a great fit for our team. Looking forward to connecting!`
  );

  function handleRequestIntro() {
    setIntroError(null);
    startTransition(async () => {
      const result = await requestIntro(matchId, introMessage);
      if (result.ok) {
        setIntroSent(true);
        setShowIntroModal(false);
      } else {
        setIntroError(result.error ?? "Something went wrong");
      }
    });
  }

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

      {/* Intro modal */}
      {showIntroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Request Introduction</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Send a personalised message to {fullName ?? "this candidate"} via TalentBridge.
                </p>
              </div>
              <button onClick={() => setShowIntroModal(false)} className="text-gray-400 hover:text-gray-600 ml-4 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your message</label>
              <textarea
                rows={6}
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                This message will be shared with the candidate by our team.
              </p>
            </div>

            {introError && (
              <p className="text-xs text-red-500 mb-3">{introError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowIntroModal(false)}
                className="flex-1 border border-gray-300 text-gray-600 text-sm py-2.5 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestIntro}
                disabled={isPending || !introMessage.trim()}
                className="flex-1 bg-[#1a3d2b] text-white text-sm py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isPending && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                {isPending ? "Sending…" : "Send Introduction Request →"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => setShowIntroModal(true)}
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
                onClick={() => setShowIntroModal(true)}
                disabled={introSent}
                className="flex-1 text-sm py-2 rounded-md bg-[#1a3d2b] text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {introSent ? "Intro Sent ✓" : "Request intro →"}
              </button>
            </div>
          </div>

          {/* Right: Full profile */}
          <div className="md:col-span-2 space-y-4">
            {personalBio && (
              <div className="bg-white border border-[#bbf7d0] bg-[#f0fdf4] rounded-xl p-5">
                <h3 className="font-semibold text-[#1a3d2b] mb-2 text-sm">About me</h3>
                <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{personalBio}&rdquo;</p>
              </div>
            )}

            {summary && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Professional Summary</h3>
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
