"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { parseJobFromText } from "@/lib/jd-parser";

export async function updateJob(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const jobId = formData.get("jobId") as string | null;
  if (!jobId) return { error: "Missing job ID" };

  // Verify ownership
  const existing = await db
    .select({ id: jobs.id, requirements: jobs.requirements })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .limit(1);

  if (existing.length === 0) return { error: "Job not found" };

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";
  const employmentType = (formData.get("employmentType") as string | null)?.trim() ?? "Full-time";
  const location = (formData.get("location") as string | null)?.trim() ?? "Remote";
  const deadlineRaw = (formData.get("applyDeadline") as string | null)?.trim() ?? "";
  const country = (formData.get("country") as string | null)?.trim() ?? "";
  const city = (formData.get("city") as string | null)?.trim() ?? "";

  if (!deadlineRaw) return { error: "Please set an application deadline." };

  const parsed = parseJobFromText(description, title || undefined);
  const finalTitle = title || parsed.title || "Untitled Position";
  const finalDescription = `${employmentType} · ${location}\n\n${parsed.description}`;

  const prevReqs = existing[0].requirements as Record<string, unknown> | null;
  const requirements = {
    ...(prevReqs ?? {}),
    skills: parsed.requiredSkills.length ? parsed.requiredSkills : ((prevReqs?.skills as string[]) ?? []),
    experienceYears: parsed.experienceYears ?? prevReqs?.experienceYears ?? null,
    employmentType,
    location,
    ...(location === "On-site" && country ? { country, city } : { country: undefined, city: undefined }),
  };

  await db
    .update(jobs)
    .set({
      title: finalTitle,
      description: finalDescription,
      requirements,
      applyDeadline: deadlineRaw ? new Date(deadlineRaw) : null,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));

  return { success: true };
}
