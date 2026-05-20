"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export default function LogoutPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    signOut(() => router.replace("/"));
  }, [signOut, router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <span className="w-6 h-6 rounded-full border-2 border-[#1a3d2b] border-t-transparent animate-spin" />
      <p className="text-sm text-gray-500">Signing you out…</p>
    </div>
  );
}
