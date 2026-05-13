import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { matches, jobs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: jobId } = await params;

  // Verify the job belongs to this client
  const [job] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

  if (!job) {
    return new Response("Not found", { status: 404 });
  }

  const results = await db
    .select()
    .from(matches)
    .where(eq(matches.jobId, jobId));

  return Response.json(results);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: jobId } = await params;
  const url = new URL(request.url);
  const matchId = url.searchParams.get("matchId");

  if (!matchId) {
    return new Response("matchId query param required", { status: 400 });
  }

  // Verify the job belongs to this client
  const [job] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

  if (!job) {
    return new Response("Not found", { status: 404 });
  }

  const body = await request.json() as {
    rating?: number;
    outcome?: "shortlisted" | "interviewing" | "hired" | "rejected";
  };

  const [updated] = await db
    .update(matches)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(matches.id, matchId), eq(matches.jobId, jobId)))
    .returning();

  if (!updated) {
    return new Response("Match not found", { status: 404 });
  }

  return Response.json(updated);
}
