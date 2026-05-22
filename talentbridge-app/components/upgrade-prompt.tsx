import Link from "next/link";
import { Navbar } from "@/components/navbar";

interface UpgradePromptProps {
  returnPath?: string;
}

export function UpgradePrompt({ returnPath }: UpgradePromptProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />
      <div className="mx-auto max-w-2xl px-6 py-24 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-2xl mb-6">
          🔒
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Subscription required
        </h1>
        <p className="text-gray-500 mb-8 max-w-md text-sm leading-relaxed">
          Access to candidate profiles and AI match results requires an active TalentBridge subscription.
          Subscribe to unlock full access to the talent pool.
        </p>
        <div className="flex gap-3">
          <Link
            href="/pricing"
            className="bg-[#1a3d2b] text-white px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            View Plans →
          </Link>
          {returnPath && (
            <Link
              href={returnPath}
              className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Go Back
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function PastDueBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-center justify-between">
      <span>
        Your last payment failed. Please update your payment method to keep access.
      </span>
      <form action={async () => {
        "use server";
        const { createPortalSession } = await import("@/app/actions/createPortalSession");
        await createPortalSession();
      }}>
        <button
          type="submit"
          className="ml-4 text-xs font-medium underline hover:no-underline"
        >
          Manage billing →
        </button>
      </form>
    </div>
  );
}
