import { NonRetriableError } from "inngest";
import { eq } from "drizzle-orm";
import { inngest } from "../client";
import { db } from "@/lib/db";
import { cvs, candidateProfiles } from "@/lib/db/schema";
import { uploadCvToFiles, extractCvData } from "@/lib/claude";
import { generateEmbedding } from "@/lib/voyage";

export const analyseCV = inngest.createFunction(
  {
    id: "analyse-cv",
    retries: 3,
    triggers: [{ event: "cv/upload.received" }],
    onFailure: async ({ event, step }) => {
      // event.data.event is the original triggering event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cvId = (event.data as any).event?.data?.cvId as string | undefined;
      if (!cvId) return;
      await step.run("mark-cv-failed", async () => {
        await db.update(cvs).set({ status: "failed" }).where(eq(cvs.id, cvId));
      });
    },
  },
  async ({ event, step }) => {
    const { cvId } = event.data as { cvId: string };

    // ── Step 1: Fetch CV record and mark as processing ────────────────────────
    const cv = await step.run("fetch-cv", async () => {
      const [record] = await db.select().from(cvs).where(eq(cvs.id, cvId));
      if (!record) throw new NonRetriableError(`CV record not found: ${cvId}`);
      await db.update(cvs).set({ status: "processing" }).where(eq(cvs.id, cvId));
      return record;
    });

    // ── Step 2: Upload file to Claude Files API ───────────────────────────────
    const fileId = await step.run("upload-to-claude", async () => {
      return await uploadCvToFiles(cv.fileUrl);
    });

    // ── Step 3: Extract structured data with Claude ───────────────────────────
    const extraction = await step.run("extract-data", async () => {
      return await extractCvData(fileId);
    });

    // ── Step 4: Upsert CandidateProfile with extracted fields ─────────────────
    await step.run("upsert-profile", async () => {
      const [existing] = await db
        .select({ id: candidateProfiles.id })
        .from(candidateProfiles)
        .where(eq(candidateProfiles.userId, cv.userId));

      const profileData = {
        skills: extraction.skills ?? [],
        experienceYears: extraction.experience_years ?? null,
        seniorityLevel: extraction.seniority_level ?? null,
        languages: extraction.languages ?? [],
        experienceItems: extraction.experience_items ?? [],
        education: extraction.education ?? null,
        summary: extraction.summary ?? null,
        updatedAt: new Date(),
      };

      if (existing) {
        await db
          .update(candidateProfiles)
          .set(profileData)
          .where(eq(candidateProfiles.userId, cv.userId));
      } else {
        await db.insert(candidateProfiles).values({
          userId: cv.userId,
          ...profileData,
        });
      }
    });

    // ── Step 5: Generate Voyage AI embedding and store ────────────────────────
    await step.run("generate-embedding", async () => {
      const summaryText = [
        extraction.summary,
        `Skills: ${extraction.skills.join(", ")}`,
        `Languages: ${extraction.languages.join(", ")}`,
        `Experience: ${extraction.experience_years} years`,
      ]
        .filter(Boolean)
        .join("\n");

      const embedding = await generateEmbedding(summaryText);

      await db
        .update(candidateProfiles)
        .set({ embedding })
        .where(eq(candidateProfiles.userId, cv.userId));
    });

    // ── Step 6: Mark CV as complete ───────────────────────────────────────────
    await step.run("mark-complete", async () => {
      await db.update(cvs).set({ status: "complete" }).where(eq(cvs.id, cvId));
    });
  }
);
