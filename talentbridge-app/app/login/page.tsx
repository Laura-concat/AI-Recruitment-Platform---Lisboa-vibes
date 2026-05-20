"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs/legacy";

export default function LoginPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [role, setRole] = useState<"candidate" | "client">("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push(role === "client" ? "/dashboard/client" : "/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed. Please check your credentials.";
      setError(msg);
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

        <div className="flex rounded-lg border border-gray-200 p-1 mb-5 gap-1">
          <button
            type="button"
            onClick={() => setRole("candidate")}
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${
              role === "candidate" ? "bg-[#1a3d2b] text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            I&apos;m a Developer
          </button>
          <button
            type="button"
            onClick={() => setRole("client")}
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${
              role === "client" ? "bg-[#1a3d2b] text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            I&apos;m Hiring
          </button>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "client" ? "ahmed@dubaifintech.com" : "leila@gmail.com"}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link href="#" className="text-xs text-[#1a3d2b] hover:underline">Forgot password?</Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] focus:border-transparent"
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
            className="w-full bg-[#1a3d2b] text-white py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-[#1a3d2b] font-medium hover:underline">
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
