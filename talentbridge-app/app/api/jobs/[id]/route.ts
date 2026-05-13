import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const [job] = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      description: jobs.description,
      requirements: jobs.requirements,
      status: jobs.status,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.userId, userId)));

  if (!job) {
    return new Response("Not found", { status: 404 });
  }

  // Never expose the raw embedding vector
  return Response.json(job);
}
