import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { cvs } from "@/lib/db/schema";
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
  const [cv] = await db
    .select({ id: cvs.id, status: cvs.status, uploadedAt: cvs.uploadedAt })
    .from(cvs)
    .where(and(eq(cvs.id, id), eq(cvs.userId, userId)));

  if (!cv) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json(cv);
}
