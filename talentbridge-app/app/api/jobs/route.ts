import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const results = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      status: jobs.status,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .orderBy(desc(jobs.createdAt));

  return Response.json(results);
}
