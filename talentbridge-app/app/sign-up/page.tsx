"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs/legacy";

type Step = "role" | "form" | "verify";
type Role = "developer" | "client";

export default function SignUpPage() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function selectRole(role: Role) {
    setSelectedRole(role);
    setStep("form");
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp || !selectedRole) return;
    setError(null);
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: { role: selectedRole === "developer" ? "candidate" : "client" },
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr.errors?.[0]?.message ?? "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push(selectedRole === "developer" ? "/onboarding/upload" : "/dashboard/client");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr.errors?.[0]?.message ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-[#1a3d2b] font-bold text-2xl mb-10">
        TalentBridge
      </Link>

      <div className="w-full max-w-lg">
        {step === "role" && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Join TalentBridge — Who are you?
            </h1>
            <p className="text-gray-500 text-center mb-8 text-sm">
              Select your role to get started with the right experience.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div
                onClick={() => selectRole("developer")}
                className="border-2 border-[#1a3d2b] rounded-xl p-6 hover:bg-[#f0fdf4] transition-colors cursor-pointer"
              >
                <div className="text-4xl mb-4">👩‍💻</div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">I&apos;m a Developer</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Upload your CV, build your AI-powered profile, and get matched with top companies
                  in the Gulf and Europe.
                </p>
                <div className="w-full bg-[#1a3d2b] text-white text-sm font-medium py-2.5 rounded-md text-center">
                  Sign up as Developer
                </div>
              </div>

              <div
                onClick={() => selectRole("client")}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#1a3d2b] hover:bg-[#f0fdf4] transition-colors cursor-pointer"
              >
                <div className="text-4xl mb-4">🏢</div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">I&apos;m Hiring</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Post your job description, get AI-matched to the best Arab-speaking developers,
                  and hire in under a week.
                </p>
                <div className="w-full border border-[#1a3d2b] text-[#1a3d2b] text-sm font-medium py-2.5 rounded-md text-center">
                  Sign up as a Client
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1a3d2b] font-medium hover:underline">Sign in →</Link>
            </p>
          </>
        )}

        {step === "form" && (
          <div className="max-w-sm mx-auto border border-gray-200 rounded-xl p-8 shadow-sm">
            <button
              onClick={() => setStep("role")}
              className="text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-500 mb-6">
              Signing up as a{" "}
              <span className="font-medium text-[#1a3d2b]">
                {selectedRole === "developer" ? "Developer" : "Client"}
              </span>
            </p>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full bg-[#1a3d2b] text-white py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                {loading ? "Creating account..." : "Continue →"}
              </button>
            </form>
          </div>
        )}

        {step === "verify" && (
          <div className="max-w-sm mx-auto border border-gray-200 rounded-xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Check your email</h1>
            <p className="text-sm text-gray-500 mb-6">
              We sent a verification code to <span className="font-medium">{email}</span>
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] tracking-widest text-center text-lg"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full bg-[#1a3d2b] text-white py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                {loading ? "Verifying..." : "Verify & Continue →"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
