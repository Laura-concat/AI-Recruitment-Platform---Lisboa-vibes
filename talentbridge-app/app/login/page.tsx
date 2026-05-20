"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn } from "@clerk/nextjs/legacy";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle __clerk_ticket param (from test-login redirect)
  useEffect(() => {
    const ticket = searchParams.get("__clerk_ticket");
    if (!ticket || !isLoaded || !signIn) return;

    signIn
      .create({ strategy: "ticket", ticket })
      .then(async (result) => {
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/dashboard");
        }
      })
      .catch((err) => {
        const msg = err?.errors?.[0]?.message ?? "Test login failed.";
        setError(msg);
      });
  }, [isLoaded, signIn, setActive, searchParams, router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isLoaded || !signIn) {
      setError("Authentication is not ready. Please refresh and try again.");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError(`Unexpected sign-in state: ${result.status}. Please try again.`);
        console.error("Sign-in result:", result);
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr.errors?.[0]?.message ?? "Sign in failed. Please check your credentials.");
      console.error("Sign-in error:", clerkErr.errors);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-[#1a3d2b] font-bold text-2xl mb-10">
        TalentBridge
      </Link>

      <div className="w-full max-w-sm border border-gray-200 rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your TalentBridge account.</p>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a3d2b] text-white py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Test login shortcuts */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2 text-center">Test accounts</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="/api/test-login?role=candidate"
              className="text-center text-xs border border-gray-200 rounded-md py-2 px-3 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Login as Candidate
            </a>
            <a
              href="/api/test-login?role=client"
              className="text-center text-xs border border-gray-200 rounded-md py-2 px-3 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Login as Client
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-[#1a3d2b] font-medium hover:underline">
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
