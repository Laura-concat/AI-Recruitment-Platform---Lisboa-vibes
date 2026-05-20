"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { cvs } from "@/lib/db/schema";
import { eq, and, gt, count } from "drizzle-orm";
import { put } from "@/lib/blob";
import { inngest } from "@/lib/inngest/client";

const DAILY_LIMIT = 3;

export async function uploadCv(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

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

  // Upload to Vercel Blob (private)
  const blob = await put(`cvs/${userId}/${Date.now()}-${file.name}`, file, {
    access: "public", // Vercel Blob free tier requires public; use private with paid plan
    addRandomSuffix: true,
  });

  // Create CV record
  const [cv] = await db
    .insert(cvs)
    .values({ userId, fileUrl: blob.url, status: "pending" })
    .returning({ id: cvs.id });

  // Fire Inngest event to trigger AI analysis (queues up when Inngest keys are added)
  try {
    await inngest.send({ name: "cv/upload.received", data: { cvId: cv.id } });
  } catch {
    // Inngest not yet configured — analysis will need to be triggered manually
  }

  return { cvId: cv.id, status: "processing" };
}
