"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { matches, candidateProfiles, jobs, users, introRequests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendIntroRequestEmails } from "@/lib/email";

export async function requestIntro(
  matchId: string
): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Unauthorized" };

  // Fetch match + candidate profile + job, verifying client owns the job
  const [row] = await db
    .select({
      matchId: matches.id,
      matchScore: matches.matchScore,
      jobId: jobs.id,
      jobTitle: jobs.title,
      candidateProfileId: candidateProfiles.id,
      candidateUserId: candidateProfiles.userId,
      candidateName: candidateProfiles.fullName,
    })
    .from(matches)
    .innerJoin(candidateProfiles, eq(matches.candidateProfileId, candidateProfiles.id))
    .innerJoin(jobs, and(eq(matches.jobId, jobs.id), eq(jobs.userId, userId)))
    .where(eq(matches.id, matchId));

  if (!row) return { ok: false, error: "Match not found" };

  // Prevent duplicate requests
  const existing = await db
    .select({ id: introRequests.id })
    .from(introRequests)
    .where(and(eq(introRequests.matchId, matchId), eq(introRequests.clientUserId, userId)))
    .limit(1);

  if (existing.length > 0) return { ok: true }; // already requested, idempotent

  // Save intro request
  await db.insert(introRequests).values({
    matchId,
    clientUserId: userId,
    candidateProfileId: row.candidateProfileId,
    jobId: row.jobId,
  });

  // Fetch emails — candidate from users table, client from Clerk
  const [candidateUser] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, row.candidateUserId))
    .limit(1);

  const clerkUser = await currentUser();
  const clientEmail = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const clientName = clerkUser?.fullName ?? clerkUser?.firstName ?? null;

  if (candidateUser?.email) {
    await sendIntroRequestEmails({
      candidateName: row.candidateName ?? "Candidate",
      candidateEmail: candidateUser.email,
      jobTitle: row.jobTitle,
      clientEmail,
      clientName,
      matchScore: Math.round(row.matchScore),
    });
  }

  return { ok: true };
}
