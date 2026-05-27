import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { introRequests, candidateProfiles, jobs, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

const ADMIN_EMAIL = "laura@concat.tech";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    accepted: "bg-green-100 text-green-700 border-green-200",
    declined: "bg-red-100 text-red-600 border-red-200",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (email !== ADMIN_EMAIL) redirect("/dashboard");

  const rows = await db
    .select({
      id: introRequests.id,
      status: introRequests.status,
      createdAt: introRequests.createdAt,
      candidateName: candidateProfiles.fullName,
      jobTitle: jobs.title,
      clientEmail: users.email,
    })
    .from(introRequests)
    .innerJoin(candidateProfiles, eq(introRequests.candidateProfileId, candidateProfiles.id))
    .innerJoin(jobs, eq(introRequests.jobId, jobs.id))
    .innerJoin(users, eq(introRequests.clientUserId, users.id))
    .orderBy(desc(introRequests.createdAt));

  const pending = rows.filter((r) => r.status === "pending");
  const rest = rows.filter((r) => r.status !== "pending");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="client" />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin — Intro Requests</h1>
            <p className="text-sm text-gray-500 mt-1">{rows.length} total · {pending.length} pending</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-sm font-medium text-gray-700">No intro requests yet</p>
            <p className="text-xs text-gray-400 mt-1">They&apos;ll appear here as clients request introductions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...pending, ...rest].map((row) => (
              <div
                key={row.id}
                className={`bg-white border rounded-xl px-5 py-4 flex items-center justify-between gap-4 ${
                  row.status === "pending" ? "border-amber-200" : "border-gray-200"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-900 text-sm truncate">
                      {row.candidateName ?? "Anonymous"}
                    </span>
                    <StatusBadge status={row.status} />
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {row.jobTitle} · requested by {row.clientEmail}
                  </p>
                </div>
                <div className="text-xs text-gray-400 shrink-0">
                  {new Date(row.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
