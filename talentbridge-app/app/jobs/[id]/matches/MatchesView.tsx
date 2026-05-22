"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import type { MatchRow } from "./page";

type FeedbackState = "good" | "not-fit" | "intro-sent" | null;

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 90 ? "bg-[#1a3d2b]" : score >= 80 ? "bg-[#16a34a]" : "bg-amber-500";
  return (
    <span className={`${bg} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
      {score}%
    </span>
  );
}

function MatchCard({ match }: { match: MatchRow }) {
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const name = match.fullName ?? "Anonymous Candidate";
  const scoreInt = Math.round(match.matchScore);
  const subtitle = [
    match.seniorityLevel
      ? match.seniorityLevel.charAt(0).toUpperCase() + match.seniorityLevel.slice(1)
      : null,
    match.experienceYears ? `${match.experienceYears} yr${match.experienceYears !== 1 ? "s" : ""}` : null,
    match.languages.length ? match.languages.join(" & ") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={`bg-white border rounded-xl p-5 transition-colors ${
        feedback === "not-fit"
          ? "border-red-200 opacity-60"
          : feedback === "good"
          ? "border-green-300"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1a3d2b] text-white flex items-center justify-center font-bold flex-shrink-0">
            {initials(match.fullName)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-gray-900">{name}</span>
              {scoreInt >= 90 && (
                <span className="text-xs bg-[#f0fdf4] text-[#1a3d2b] border border-[#bbf7d0] px-2 py-0.5 rounded-full font-medium">
                  Top Match
                </span>
              )}
              {feedback === "good" && (
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                  Good Fit ✓
                </span>
              )}
              {feedback === "not-fit" && (
                <span className="text-xs bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                  Not a Fit
                </span>
              )}
              {feedback === "intro-sent" && (
                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                  Intro Requested ✓
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-gray-500 mb-2">{subtitle}</p>}
            {match.skills.length > 0 && (
              <p className="text-xs text-gray-400">
                Skills: {match.skills.slice(0, 6).join(", ")}
                {match.skills.length > 6 && ` +${match.skills.length - 6} more`}
              </p>
            )}
            {match.matchExplanation && (
              <p className="text-xs text-gray-500 mt-1 italic leading-relaxed max-w-md">
                {match.matchExplanation}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ScoreBadge score={scoreInt} />
          <Link
            href={`/candidates/${match.matchId}`}
            className="text-sm border border-gray-300 px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
        <button
          onClick={() => setFeedback((prev) => (prev === "good" ? null : "good"))}
          className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
            feedback === "good"
              ? "bg-green-100 border-green-400 text-green-700 font-medium"
              : "border-green-300 text-green-700 hover:bg-green-50"
          }`}
        >
          Good Fit
        </button>
        <button
          onClick={() => setFeedback((prev) => (prev === "not-fit" ? null : "not-fit"))}
          className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
            feedback === "not-fit"
              ? "bg-red-100 border-red-400 text-red-500 font-medium"
              : "border-red-200 text-red-500 hover:bg-red-50"
          }`}
        >
          Not a Fit
        </button>
        <button
          onClick={() => setFeedback("intro-sent")}
          disabled={feedback === "intro-sent"}
          className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
            feedback === "intro-sent"
              ? "bg-blue-100 border-blue-300 text-blue-600 font-medium cursor-default"
              : "border-blue-200 text-blue-600 hover:bg-blue-50"
          }`}
        >
          {feedback === "intro-sent" ? "Intro Sent ✓" : "Request Intro"}
        </button>
      </div>
    </div>
  );
}

interface Props {
  job: { id: string; title: string; status: string };
  matchRows: MatchRow[];
}

export default function MatchesView({ job, matchRows }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="text-sm text-gray-400 mb-4">
          <Link href="/dashboard/client" className="hover:text-[#1a3d2b]">
            Dashboard
          </Link>
          {" / "}
          <span className="text-gray-700">{job.title}</span>
          {" / "}
          <span className="text-gray-700">AI Matches</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          AI-Matched Candidates — {job.title}
        </h1>

        {job.status === "matching" ? (
          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-10 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#1a3d2b] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">AI matching in progress — check back in a moment.</p>
          </div>
        ) : matchRows.length === 0 ? (
          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-10 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm font-medium text-gray-700 mb-1">No matches yet</p>
            <p className="text-xs text-gray-400">
              Matches will appear here once the AI pipeline has run.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-8">
              {matchRows.length} candidate{matchRows.length !== 1 ? "s" : ""} matched · Ranked by AI fit score
            </p>
            <div className="space-y-4">
              {matchRows.map((m) => (
                <MatchCard key={m.matchId} match={m} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
