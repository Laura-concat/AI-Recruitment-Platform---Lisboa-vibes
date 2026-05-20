"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { jobs, users } from "@/lib/db/schema";
import { inngest } from "@/lib/inngest/client";
import { extractTextFromBuffer } from "@/lib/cv-parser";
import { parseJobFromText } from "@/lib/jd-parser";

export async function createJob(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  // Ensure user row exists
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (email) {
    const role = (clerkUser?.unsafeMetadata?.role as string) === "candidate" ? "candidate" : "client";
    await db.insert(users).values({ id: userId, email, role }).onConflictDoNothing();
  }

  const titleInput = (formData.get("title") as string | null)?.trim() ?? "";
  const descriptionInput = (formData.get("description") as string | null)?.trim() ?? "";
  const employmentType = (formData.get("employmentType") as string | null)?.trim() ?? "Full-time";
  const location = (formData.get("location") as string | null)?.trim() ?? "Remote";
  const file = formData.get("file") as File | null;

  let parsed;
  let rawDescription = descriptionInput;

  if (file && file.size > 0) {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return { error: "Invalid file type. Please upload a PDF or Word document." };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { error: "File too large. Maximum size is 10 MB." };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromBuffer(buffer, file.type);
    rawDescription = text || descriptionInput;
    parsed = parseJobFromText(rawDescription, titleInput || undefined);
  } else {
    if (!descriptionInput && !titleInput) {
      return { error: "Please provide a job title and description." };
    }
    parsed = parseJobFromText(rawDescription, titleInput || undefined);
  }

  const finalTitle = titleInput || parsed.title || "Untitled Position";
  const finalDescription = `${employmentType} · ${location}\n\n${parsed.description}`;

  const [job] = await db
    .insert(jobs)
    .values({
      userId,
      title: finalTitle,
      description: finalDescription,
      requirements: {
        skills: parsed.requiredSkills,
        experienceYears: parsed.experienceYears,
        employmentType,
        location,
      },
      status: "pending",
    })
    .returning({ id: jobs.id });

  try {
    await inngest.send({ name: "job/created", data: { jobId: job.id } });
  } catch {
    // Inngest not yet configured
  }

  return { jobId: job.id };
}
