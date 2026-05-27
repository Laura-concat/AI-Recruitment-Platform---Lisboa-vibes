import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { markAllNotificationsRead } from "@/app/actions/markNotificationsRead";
import Link from "next/link";

export default async function NotificationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  // Determine role for navbar variant
  const [dbUser] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  const variant = dbUser?.role === "client" ? "client" : "candidate";

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

  const unreadIds = rows.filter((n) => !n.read).map((n) => n.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant={variant} />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          {unreadIds.length > 0 && (
            <form action={markAllNotificationsRead}>
              <button type="submit" className="text-xs text-[#1a3d2b] hover:underline">
                Mark all as read
              </button>
            </form>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-sm font-medium text-gray-700">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">You&apos;ll see updates here as activity happens.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((n) => (
              <div
                key={n.id}
                className={`bg-white border rounded-xl px-5 py-4 flex items-start gap-3 ${
                  !n.read ? "border-[#1a3d2b]/20 bg-[#f0fdf4]" : "border-gray-200"
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-[#1a3d2b]" : "bg-gray-300"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                    {n.link && (
                      <Link href={n.link} className="text-xs text-[#1a3d2b] hover:underline font-medium">
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
