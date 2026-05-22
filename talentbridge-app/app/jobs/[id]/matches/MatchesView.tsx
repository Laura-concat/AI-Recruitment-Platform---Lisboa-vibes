"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/navbar";

const INITIAL_MATCHES = [
  {
    id: "leila-mansour",
    initials: "LM",
    name: "Leila Mansour",
    badge: "Top Match",
    title: "Full-Stack Developer · 5 yrs exp · Beirut, Lebanon · Remote-ready",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
    score: 94,
  },
  {
    id: "sara-al-ahmad",
    initials: "SA",
    name: "Sara Al-Ahmad",
    badge: null,
    title: "React Native Developer · 4 yrs exp · Amman, Jordan · Remote-first",
    skills: ["React Native", "TypeScript", "Firebase", "GraphQL"],
    score: 88,
  },
  {
    id: "nour-hassan",
    initials: "NH",
    name: "Nour Hassan",
    badge: null,
    title: "Frontend Developer · 3 yrs exp · Cairo, Egypt · Open to relocation",
    skills: ["React", "Vue.js", "JavaScript", "CSS", "Figma"],
    score: 82,
  },
];

type FeedbackState = "good" | "not-fit" | "intro-sent" | null;

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 90 ? "bg-[#1a3d2b]" : score >= 85 ? "bg-[#16a34a]" : "bg-amber-500";
  return (
    <span className={`${bg} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
      {score}%
    </span>
  );
}

function MatchCard({ match }: { match: typeof INITIAL_MATCHES[0] }) {
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  function handleFeedback(value: FeedbackState) {
    setFeedback((prev) => (prev === value ? null : value));
  }

  function handleIntro() {
    setFeedback("intro-sent");
  }

  return (
    <div className={`bg-white border rounded-xl p-5 transition-colors ${feedback === "not-fit" ? "border-red-200 opacity-60" : feedback === "good" ? "border-green-300" : "border-gray-200"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1a3d2b] text-white flex items-center justify-center font-bold flex-shrink-0">
            {match.initials}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-gray-900">{match.name}</span>
              {match.badge && (
                <span className="text-xs bg-[#f0fdf4] text-[#1a3d2b] border border-[#bbf7d0] px-2 py-0.5 rounded-full font-medium">
                  {match.badge}
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
            <p className="text-sm text-gray-500 mb-2">{match.title}</p>
            <p className="text-xs text-gray-400">
              Skills: {match.skills.join(", ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ScoreBadge score={match.score} />
          <Link
            href={`/candidates/${match.id}`}
            className="text-sm border border-gray-300 px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
        <button
          onClick={() => handleFeedback("good")}
          className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
            feedback === "good"
              ? "bg-green-100 border-green-400 text-green-700 font-medium"
              : "border-green-300 text-green-700 hover:bg-green-50"
          }`}
        >
          Good Fit
        </button>
        <button
          onClick={() => handleFeedback("not-fit")}
          className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
            feedback === "not-fit"
              ? "bg-red-100 border-red-400 text-red-500 font-medium"
              : "border-red-200 text-red-500 hover:bg-red-50"
          }`}
        >
          Not a Fit
        </button>
        <button
          onClick={handleIntro}
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

export default function MatchesView() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="text-sm text-gray-400 mb-4">
          <Link href="/dashboard/client" className="hover:text-[#1a3d2b]">Dashboard</Link>
          {" / "}
          <Link href="/jobs/1" className="hover:text-[#1a3d2b]">Senior React Developer</Link>
          {" / "}
          <span className="text-gray-700">AI Matches</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          AI-Matched Candidates — Senior React Developer
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          3 candidates matched from 210 profiles · Ranked by AI fit score · Updated 2 hours ago
        </p>

        <div className="space-y-4">
          {INITIAL_MATCHES.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
