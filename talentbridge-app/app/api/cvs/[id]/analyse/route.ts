import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { cvs, candidateProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractTextFromBuffer, parseProfileFromText } from "@/lib/cv-parser";

export const maxDuration = 60;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  const [cv] = await db
    .select({ id: cvs.id, fileUrl: cvs.fileUrl, status: cvs.status })
    .from(cvs)
    .where(and(eq(cvs.id, id), eq(cvs.userId, userId)));

  if (!cv) return new Response("Not found", { status: 404 });

  // Already processed
  if (cv.status === "complete") return Response.json({ status: "complete" });

  try {
    const fileRes = await fetch(cv.fileUrl);
    if (!fileRes.ok) throw new Error(`Failed to fetch CV: ${fileRes.status}`);

    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType = fileRes.headers.get("content-type") ?? "application/pdf";
    const mimeType = contentType.split(";")[0].trim();

    const text = await extractTextFromBuffer(buffer, mimeType);
    const parsed = text ? parseProfileFromText(text) : null;

    if (parsed) {
      const profileData = {
        fullName: parsed.fullName ?? undefined,
        location: parsed.location ?? undefined,
        skills: parsed.skills,
        languages: parsed.languages,
        experienceYears: parsed.experienceYears ?? undefined,
        seniorityLevel: parsed.seniorityLevel ?? undefined,
        experienceItems: parsed.experienceItems.length ? parsed.experienceItems : undefined,
        education: parsed.education ?? undefined,
        summary: parsed.summary ?? undefined,
        updatedAt: new Date(),
      };

      const { location: _loc, ...profileDataWithoutLocation } = profileData;

      const existing = await db
        .select({ id: candidateProfiles.id })
        .from(candidateProfiles)
        .where(eq(candidateProfiles.userId, userId))
        .limit(1);

      try {
        if (existing.length > 0) {
          await db.update(candidateProfiles).set(profileData).where(eq(candidateProfiles.userId, userId));
        } else {
          await db.insert(candidateProfiles).values({ userId, ...profileData });
        }
      } catch {
        // Fallback: save without location if column missing in production
        if (existing.length > 0) {
          await db.update(candidateProfiles).set(profileDataWithoutLocation).where(eq(candidateProfiles.userId, userId));
        } else {
          await db.insert(candidateProfiles).values({ userId, ...profileDataWithoutLocation });
        }
      }
    }

    await db.update(cvs).set({ status: "complete" }).where(eq(cvs.id, cv.id));
    return Response.json({ status: "complete" });
  } catch {
    await db.update(cvs).set({ status: "failed" }).where(eq(cvs.id, cv.id));
    return Response.json({ status: "failed" }, { status: 500 });
  }
}
