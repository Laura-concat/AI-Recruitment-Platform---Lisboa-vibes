"use client";

import { useState } from "react";

interface JobMatch {
  id: string;
  title: string;
  company: string;
  type: string;
  score: number;
  description?: string;
  skills?: string[];
}

function ScoreColor(score: number): string {
  if (score >= 90) return "bg-[#1a3d2b]";
  if (score >= 80) return "bg-[#16a34a]";
  return "bg-amber-500";
}

export function JobMatchCard({ job }: { job: JobMatch }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{job.title} — {job.company}</p>
          <p className="text-sm text-gray-500 mt-0.5">{job.type}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className={`${ScoreColor(job.score)} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
            {job.score}%
          </span>
          <span className="text-gray-400 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          {job.description ? (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed whitespace-pre-line">{job.description}</p>
          ) : (
            <p className="text-sm text-gray-400 mt-3 italic">Full job description not available yet.</p>
          )}
          {job.skills && job.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.skills.map((s) => (
                <span key={s} className="text-xs bg-[#f0fdf4] text-[#1a3d2b] border border-[#bbf7d0] px-2 py-0.5 rounded-md">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
