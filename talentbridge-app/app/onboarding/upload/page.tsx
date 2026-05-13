"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CandidateCVUploadPage() {
  const router = useRouter();

  function handleUpload() {
    router.push("/onboarding/analysing");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-[#1a3d2b] font-bold text-xl">TalentBridge</Link>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-[#1a3d2b]">Dashboard</Link>
            <Link href="/profile" className="hover:text-[#1a3d2b]">Profile</Link>
            <Link href="#" className="hover:text-[#1a3d2b]">Settings</Link>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#1a3d2b] text-white flex items-center justify-center text-sm font-medium">
            L
          </div>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="mx-auto max-w-4xl px-6 pt-8">
        <OnboardingProgress step={1} />
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload your CV to get started
        </h1>
        <p className="text-gray-500 mb-8">
          Our AI will scan your CV and automatically build your profile. It takes less than 2 minutes.
        </p>

        {/* Drop zone */}
        <div
          onClick={handleUpload}
          className="border-2 border-dashed border-[#1a3d2b] rounded-xl p-16 cursor-pointer hover:bg-[#f0fdf4] transition-colors"
        >
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-700 font-medium mb-1">
            Drag &amp; drop your CV here, or click to browse
          </p>
          <p className="text-sm text-gray-400">Supported formats: PDF, DOCX, DOC — Max 10 MB</p>
          <button
            type="button"
            className="mt-6 bg-[#1a3d2b] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Browse Files
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
          <span>🔒</span>
          Your CV is securely stored and only shared with companies you approve.
        </p>
      </div>
    </div>
  );
}

function OnboardingProgress({ step }: { step: number }) {
  const steps = [
    { label: "Upload CV", n: 1 },
    { label: "AI Analysis", n: 2 },
    { label: "Review Profile", n: 3 },
    { label: "Go Live", n: 4 },
  ];

  return (
    <div className="flex items-center gap-2 text-sm mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                s.n <= step
                  ? "bg-[#1a3d2b] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {s.n < step ? "✓" : s.n}
            </span>
            <span className={s.n <= step ? "text-[#1a3d2b] font-medium" : "text-gray-400"}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span className="text-gray-300 mx-1">—</span>
          )}
        </div>
      ))}
    </div>
  );
}
