"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { cvs, users, candidateProfiles } from "@/lib/db/schema";
import { eq, and, gt, count } from "drizzle-orm";
import { put } from "@/lib/blob";
import { inngest } from "@/lib/inngest/client";
import { extractTextFromBuffer, parseProfileFromText } from "@/lib/cv-parser";

const DAILY_LIMIT = 3;

export async function uploadCv(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  // Ensure user row exists in DB (Clerk webhook may not be configured yet)
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (email) {
    const role = (clerkUser?.unsafeMetadata?.role as string) === "client" ? "client" : "candidate";
    await db.insert(users).values({ id: userId, email, role }).onConflictDoNothing();
  }

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Invalid file type. Please upload a PDF or Word document." };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "File is too large. Maximum size is 10 MB." };
  }

  // Rate limit: max 3 uploads per user per 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [{ value: recentCount }] = await db
    .select({ value: count() })
    .from(cvs)
    .where(and(eq(cvs.userId, userId), gt(cvs.uploadedAt, yesterday)));

  if (recentCount >= DAILY_LIMIT) {
    return { error: "Daily upload limit reached. You can upload up to 3 CVs per day." };
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: "File storage is not configured yet. Please add BLOB_READ_WRITE_TOKEN to your environment." };
  }

  // Extract text and parse profile fields before uploading (while we still have the File object)
  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await extractTextFromBuffer(buffer, file.type);
  const parsed = text ? parseProfileFromText(text) : null;

  // Upload to Vercel Blob (private)
  const blob = await put(`cvs/${userId}/${Date.now()}-${file.name}`, file, {
    access: "private",
    addRandomSuffix: true,
  });

  // Create CV record
  const [cv] = await db
    .insert(cvs)
    .values({ userId, fileUrl: blob.url, status: parsed ? "complete" : "pending" })
    .returning({ id: cvs.id });

  // Upsert candidate profile with parsed data
  if (parsed) {
    const profileData = {
      fullName: parsed.fullName ?? undefined,
      skills: parsed.skills,
      languages: parsed.languages,
      experienceYears: parsed.experienceYears ?? undefined,
      seniorityLevel: parsed.seniorityLevel ?? undefined,
      experienceItems: parsed.experienceItems.length ? parsed.experienceItems : undefined,
      education: parsed.education ?? undefined,
      summary: parsed.summary ?? undefined,
      updatedAt: new Date(),
    };
    const existing = await db
      .select({ id: candidateProfiles.id })
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userId))
      .limit(1);
    if (existing.length > 0) {
      await db.update(candidateProfiles).set(profileData).where(eq(candidateProfiles.userId, userId));
    } else {
      await db.insert(candidateProfiles).values({ userId, ...profileData });
    }
  }

  // Fire Inngest event for AI analysis when keys are available
  try {
    await inngest.send({ name: "cv/upload.received", data: { cvId: cv.id } });
  } catch {
    // Inngest not yet configured
  }

  return { cvId: cv.id, status: parsed ? "complete" : "processing" };
}
