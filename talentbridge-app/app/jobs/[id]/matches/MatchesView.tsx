"use client";

import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import type { MatchRow } from "./page";
import { triggerMatching } from "@/app/actions/triggerMatching";
import { updateMatchOutcome } from "@/app/actions/updateMatchOutcome";

function initials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 90 ? "bg-[#1a3d2b]" : score >= 80 ? "bg-[#16a34a]" : "bg-amber-500";
  return (
    <span className={`${bg} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
      {score}%
    </span>
  );
}

function MatchCard({
  match,
  onDismiss,
  archived,
}: {
  match: MatchRow;
  onDismiss: (id: string) => void;
  archived?: boolean;
}) {
  const [goodFit, setGoodFit] = useState(match.outcome === "shortlisted");
  const [saving, setSaving] = useState(false);

  const name = match.fullName ?? "Anonymous Candidate";
  const scoreInt = Math.round(match.matchScore);
  const subtitle = [
    match.seniorityLevel ? match.seniorityLevel.charAt(0).toUpperCase() + match.seniorityLevel.slice(1) : null,
    match.experienceYears ? `${match.experienceYears} yr${match.experienceYears !== 1 ? "s" : ""}` : null,
    match.languages.length ? match.languages.join(" & ") : null,
  ].filter(Boolean).join(" · ");

  async function handleNotAFit() {
    setSaving(true);
    await updateMatchOutcome(match.matchId, "rejected");
    onDismiss(match.matchId);
  }

  async function handleGoodFit() {
    const next = !goodFit;
    setGoodFit(next);
    await updateMatchOutcome(match.matchId, next ? "shortlisted" : "shortlisted");
  }

  return (
    <div className={`bg-white border rounded-xl p-5 transition-all ${archived ? "opacity-60" : "border-gray-200"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1a3d2b] text-white flex items-center justify-center font-bold flex-shrink-0">
            {initials(match.fullName)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-gray-900">{name}</span>
              {scoreInt >= 90 && !archived && (
                <span className="text-xs bg-[#f0fdf4] text-[#1a3d2b] border border-[#bbf7d0] px-2 py-0.5 rounded-full font-medium">
                  Top Match
                </span>
              )}
              {goodFit && !archived && (
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                  Good Fit ✓
                </span>
              )}
              {archived && (
                <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">
                  Archived
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

      {!archived && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={handleGoodFit}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
              goodFit
                ? "bg-green-100 border-green-400 text-green-700 font-medium"
                : "border-green-300 text-green-700 hover:bg-green-50"
            }`}
          >
            Good Fit
          </button>
          <button
            onClick={handleNotAFit}
            disabled={saving}
            className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Not a Fit
          </button>
          <Link
            href={`/candidates/${match.matchId}?intro=1`}
            className="text-xs px-3 py-1.5 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Request Intro
          </Link>
        </div>
      )}
    </div>
  );
}

const STRONG_MATCH_THRESHOLD = 50;

interface Props {
  job: { id: string; title: string; status: string };
  matchRows: MatchRow[];
}

export default function MatchesView({ job, matchRows }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [matchError, setMatchError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(
    () => new Set(matchRows.filter((m) => m.outcome === "rejected").map((m) => m.matchId))
  );
  const [showArchived, setShowArchived] = useState(false);

  const activeRows = matchRows.filter((m) => !dismissed.has(m.matchId));
  const archivedRows = matchRows.filter((m) => dismissed.has(m.matchId));

  const hasStrongMatches = activeRows.some((m) => m.matchScore >= STRONG_MATCH_THRESHOLD);
  const hasAnyMatches = matchRows.length > 0;

  function handleDismiss(matchId: string) {
    setDismissed((prev) => new Set([...prev, matchId]));
  }

  // Auto-trigger on first load if no matches exist yet
  useEffect(() => {
    if (!hasAnyMatches && job.status !== "matching") {
      runMatching();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runMatching() {
    setMatchError(null);
    startTransition(async () => {
      const result = await triggerMatching(job.id);
      if (result.ok) {
        router.refresh();
      } else {
        setMatchError(result.error ?? "Matching failed");
      }
    });
  }

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

        {job.status === "matching" || isPending ? (
          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-10 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#1a3d2b] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">AI is analysing your job and matching candidates — this takes about 10 seconds.</p>
          </div>
        ) : !hasAnyMatches ? (
          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-10 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#1a3d2b] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">Finding the best candidates for this role…</p>
            {matchError && (
              <div className="mt-4">
                <p className="text-xs text-red-500 mb-3">{matchError}</p>
                <button
                  onClick={runMatching}
                  className="bg-[#1a3d2b] text-white text-sm px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity"
                >
                  Try Again →
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {!hasStrongMatches && activeRows.length > 0 && (
              <div className="mt-6 mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  No exact matches for this role right now
                </p>
                <p className="text-sm text-amber-700">
                  We don&apos;t currently have candidates that precisely match your requirements.
                  Below are the closest profiles available — they may still be worth a look, or{" "}
                  <a href="mailto:laura@concat.tech" className="underline font-medium">
                    get in touch
                  </a>{" "}
                  and we&apos;ll actively source candidates for this role.
                </p>
              </div>
            )}

            {activeRows.length === 0 && archivedRows.length > 0 && (
              <div className="mt-6 mb-6 bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">All candidates have been archived</p>
                <p className="text-xs text-gray-400 mb-4">You can review them below or re-run matching to find new candidates.</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowArchived(true)}
                    className="text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    View Archived ({archivedRows.length})
                  </button>
                  <button
                    onClick={runMatching}
                    disabled={isPending}
                    className="text-sm bg-[#1a3d2b] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Re-run Matching →
                  </button>
                </div>
              </div>
            )}

            {activeRows.length > 0 && (
              <>
                <p className="text-sm text-gray-500 mb-6">
                  {hasStrongMatches
                    ? `${activeRows.length} candidate${activeRows.length !== 1 ? "s" : ""} matched · Ranked by AI fit score`
                    : `${activeRows.length} closest profile${activeRows.length !== 1 ? "s" : ""} on the platform · Ranked by relevance`}
                </p>
                <div className="space-y-4">
                  {activeRows.map((m) => (
                    <MatchCard key={m.matchId} match={m} onDismiss={handleDismiss} />
                  ))}
                </div>
              </>
            )}

            {archivedRows.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={() => setShowArchived((v) => !v)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className={`w-4 h-4 transition-transform ${showArchived ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {showArchived ? "Hide" : "Show"} archived candidates ({archivedRows.length})
                </button>
                {showArchived && (
                  <div className="mt-4 space-y-4">
                    {archivedRows.map((m) => (
                      <MatchCard key={m.matchId} match={m} onDismiss={handleDismiss} archived />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 border-t border-gray-200 pt-6 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Results are based on skills, seniority, and experience extracted from your job description.
              </p>
              <button
                onClick={runMatching}
                disabled={isPending}
                className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Re-run matching
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
