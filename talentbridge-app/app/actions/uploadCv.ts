"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { cvs, users } from "@/lib/db/schema";
import { put } from "@/lib/blob";

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

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { error: "File storage is not configured yet. Please add BLOB_READ_WRITE_TOKEN to your environment." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name;
  const mimeType = file.type;

  // Upload to Vercel Blob
  const blob = await put(`cvs/${userId}/${Date.now()}-${fileName}`, buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType: mimeType,
  });

  // Insert CV as pending — extraction happens in /api/cvs/[id]/analyse
  const [cv] = await db
    .insert(cvs)
    .values({ userId, fileUrl: blob.url, status: "pending" })
    .returning({ id: cvs.id });

  return { cvId: cv.id };
}
