"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const ADMIN_EMAIL = "laura@concat.tech";

function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications/unread-count")
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  return (
    <Link href="/notifications" className="relative hover:opacity-80 transition-opacity" aria-label="Notifications">
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-[#1a3d2b] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

interface NavbarProps {
  variant?: "public" | "candidate" | "client";
  userName?: string;
}

export function Navbar({ variant = "public", userName }: NavbarProps) {
  const { user } = useUser();
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL;

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
              {isAdmin && (
                <Link href="/admin" className="text-[#1a3d2b] font-medium hover:opacity-80">Admin</Link>
              )}
              <NotificationBell />
              <Link href="/logout" className="hover:text-red-500 transition-colors">Sign Out</Link>
            </div>
            <Link
              href="/onboarding/upload"
              className="bg-[#1a3d2b] text-white text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              Upload CV
            </Link>
          </>
        )}

        {variant === "client" && (
          <>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/dashboard/client" className="hover:text-[#1a3d2b]">Dashboard</Link>
              <Link href="/dashboard/client/jobs" className="hover:text-[#1a3d2b]">My Jobs</Link>
              <Link href="/dashboard/client/candidates" className="hover:text-[#1a3d2b]">Candidates</Link>
              <Link href="/dashboard/client/billing" className="hover:text-[#1a3d2b]">Billing</Link>
              {isAdmin && (
                <Link href="/admin" className="text-[#1a3d2b] font-medium hover:opacity-80">Admin</Link>
              )}
              <NotificationBell />
              <Link href="/logout" className="hover:text-red-500 transition-colors">Sign Out</Link>
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
