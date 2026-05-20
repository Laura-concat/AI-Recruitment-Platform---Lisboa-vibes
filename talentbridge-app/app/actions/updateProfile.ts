"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { candidateProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface ProfileUpdate {
  fullName?: string;
  summary?: string;
  skills?: string[];
  languages?: string[];
  education?: { degree: string; institution: string; year?: number } | string;
  experienceItems?: { role: string; company: string; period: string }[];
}

export async function updateProfile(data: ProfileUpdate) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const now = new Date();

  const existing = await db
    .select({ id: candidateProfiles.id })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId));

  if (existing.length > 0) {
    await db
      .update(candidateProfiles)
      .set({ ...data, updatedAt: now })
      .where(eq(candidateProfiles.userId, userId));
  } else {
    await db.insert(candidateProfiles).values({
      userId,
      skills: data.skills ?? [],
      languages: data.languages ?? [],
      summary: data.summary,
      education: data.education,
      experienceItems: data.experienceItems,
      updatedAt: now,
    });
  }

  return { success: true };
}
