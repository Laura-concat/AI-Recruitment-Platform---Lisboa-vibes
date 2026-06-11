"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { matches, jobs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

type Outcome = "shortlisted" | "interviewing" | "hired" | "rejected";

export async function updateMatchOutcome(matchId: string, outcome: Outcome) {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  // Verify the match belongs to a job owned by this client
  const [match] = await db
    .select({ id: matches.id })
    .from(matches)
    .innerJoin(jobs, eq(matches.jobId, jobs.id))
    .where(and(eq(matches.id, matchId), eq(jobs.userId, userId)));

  if (!match) return { ok: false };

  await db.update(matches).set({ outcome }).where(eq(matches.id, matchId));
  return { ok: true };
}
