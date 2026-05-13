"use client";

import Link from "next/link";

interface NavbarProps {
  variant?: "public" | "candidate" | "client";
  userName?: string;
}

export function Navbar({ variant = "public", userName }: NavbarProps) {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-[#1a3d2b] font-bold text-xl tracking-tight">
          TalentBridge
        </Link>

        {variant === "public" && (
          <>
            <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
              <Link href="/" className="hover:text-[#1a3d2b]">Home</Link>
              <Link href="/#features" className="hover:text-[#1a3d2b]">Features</Link>
              <Link href="/pricing" className="hover:text-[#1a3d2b]">Pricing</Link>
              <Link href="/#clients" className="hover:text-[#1a3d2b]">For Clients</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-600 hover:text-[#1a3d2b] px-3 py-1.5">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-[#1a3d2b] text-white text-sm px-4 py-2 rounded-md hover:bg-[#15332400] hover:bg-opacity-90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </>
        )}

        {variant === "candidate" && (
          <>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/dashboard" className="hover:text-[#1a3d2b]">Dashboard</Link>
              <Link href="/profile" className="hover:text-[#1a3d2b]">My Profile</Link>
              <Link href="/profile#settings" className="hover:text-[#1a3d2b]">Settings</Link>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#1a3d2b] text-white flex items-center justify-center text-sm font-medium">
              {userName?.[0] ?? "L"}
            </div>
          </>
        )}

        {variant === "client" && (
          <>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/dashboard/client" className="hover:text-[#1a3d2b]">Dashboard</Link>
              <Link href="/dashboard/client/jobs" className="hover:text-[#1a3d2b]">My Jobs</Link>
              <Link href="/dashboard/client/candidates" className="hover:text-[#1a3d2b]">Candidates</Link>
              <Link href="/dashboard/client/billing" className="hover:text-[#1a3d2b]">Billing</Link>
            </div>
            <Link
              href="/jobs/new"
              className="bg-[#1a3d2b] text-white text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              + Post a Job
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
