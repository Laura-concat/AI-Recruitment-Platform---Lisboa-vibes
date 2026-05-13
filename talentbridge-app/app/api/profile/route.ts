import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { candidateProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [profile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId));

  if (!profile) {
    return new Response("Not found", { status: 404 });
  }

  // Never expose the raw embedding vector to the client
  const { embedding: _embedding, ...rest } = profile;
  return Response.json(rest);
}
