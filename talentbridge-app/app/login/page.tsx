"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-[#1a3d2b] font-bold text-2xl mb-10">
        TalentBridge
      </Link>

      <SignIn
        routing="hash"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#1a3d2b",
            colorBackground: "#ffffff",
            borderRadius: "0.75rem",
          },
          elements: {
            card: "shadow-sm border border-gray-200",
            headerTitle: "text-2xl font-bold text-gray-900",
            headerSubtitle: "text-sm text-gray-500",
            formButtonPrimary: "bg-[#1a3d2b] hover:opacity-90 text-sm",
            footerActionLink: "text-[#1a3d2b] font-medium",
          },
        }}
      />

      <p className="text-center text-xs text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-[#1a3d2b] font-medium hover:underline">
          Create one →
        </Link>
      </p>
    </div>
  );
}
