"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { label: "Reading CV document", threshold: 10 },
  { label: "Extracting work experience", threshold: 28 },
  { label: "Identifying technical skills", threshold: 48 },
  { label: "Calculating experience level", threshold: 65 },
  { label: "Generating profile summary", threshold: 82 },
  { label: "Building your public profile", threshold: 98 },
];

export default function AIAnalysingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push("/profile"), 600);
          return 100;
        }
        const increment = p < 80 ? 1.4 : 0.6;
        return Math.min(p + increment, 100);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [router]);

  const completedCount = STEPS.filter((s) => progress >= s.threshold).length;
  const activeIndex = completedCount < STEPS.length ? completedCount : -1;

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link href="/" className="text-[#1a3d2b] font-bold text-xl">TalentBridge</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pt-8">
        <div className="flex items-center gap-2 text-sm mb-8">
          {["Upload CV", "AI Analysis", "Review Profile", "Go Live"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i < 2 ? "bg-[#1a3d2b] text-white" : "bg-gray-200 text-gray-500"}`}>
                  {i < 1 ? "✓" : i + 1}
                </span>
                <span className={i < 2 ? "text-[#1a3d2b] font-medium" : "text-gray-400"}>{label}</span>
              </div>
              {i < 3 && <span className="text-gray-300 mx-1">—</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysing your CV...</h1>
        <p className="text-gray-500 mb-6">
          Our AI is reading your CV and extracting your skills, experience and expertise.
          This takes about 45 seconds.
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-[#1a3d2b] h-2 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mb-8 text-right">{Math.round(progress)}%</p>

        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const done = progress >= step.threshold;
            const active = i === activeIndex;
            return (
              <div key={step.label} className="flex items-center gap-3">
                {done ? (
                  <span className="w-5 h-5 rounded-full bg-[#1a3d2b] text-white text-xs flex items-center justify-center flex-shrink-0">✓</span>
                ) : active ? (
                  <span className="w-5 h-5 rounded-full border-2 border-[#1a3d2b] flex-shrink-0 animate-spin border-t-transparent" />
                ) : (
                  <span className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0" />
                )}
                <span className={`text-sm ${done ? "text-gray-700" : active ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-10">
          Please don&apos;t close the window. You&apos;ll be redirected automatically when your profile is ready.
        </p>
      </div>
    </div>
  );
}
