"use client";

import { useRef } from "react";

interface SampleProfile {
  initials: string;
  name: string;
  title: string;
  location: string;
  remote: string;
  experienceYears: number;
  skills: string[];
  matchScore: number;
  color: string;
}

function getSeniority(years: number): { label: string; className: string } {
  if (years >= 6) return { label: "Senior", className: "bg-purple-100 text-purple-700" };
  if (years >= 3) return { label: "Mid-level", className: "bg-blue-100 text-blue-700" };
  return { label: "Junior", className: "bg-amber-100 text-amber-700" };
}

function ProfileCard({ profile }: { profile: SampleProfile }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-start gap-4 mb-3">
        <div className={`w-12 h-12 rounded-full ${profile.color} text-white font-bold text-sm flex items-center justify-center flex-shrink-0`}>
          {profile.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5 gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{profile.name}</h3>
            <span className="text-xs font-bold text-[#1a3d2b] bg-[#f0fdf4] px-2 py-0.5 rounded-full shrink-0">
              {profile.matchScore}% Fit
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm text-gray-600">{profile.title}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSeniority(profile.experienceYears).className}`}>
              {getSeniority(profile.experienceYears).label}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {profile.location} · {profile.remote} · {profile.experienceYears} yrs exp
          </p>
        </div>
      </div>

      {/* Skills fill remaining space */}
      <div className="flex flex-wrap gap-1.5 flex-1 content-start mb-4">
        {profile.skills.map((skill) => (
          <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded h-fit">
            {skill}
          </span>
        ))}
      </div>

      {/* Footer always at bottom */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">Full profile &amp; AI analysis</span>
        <span className="text-xs font-medium text-[#1a3d2b] flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Unlocks with subscription
        </span>
      </div>
    </div>
  );
}

export function ProfileCarousel({ profiles }: { profiles: SampleProfile[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Scroll left"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {profiles.map((profile) => (
          <div key={profile.initials} className="flex-shrink-0 w-72 snap-start">
            <ProfileCard profile={profile} />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Scroll right"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
