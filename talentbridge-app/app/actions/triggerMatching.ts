"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { jobs, candidateProfiles, matches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const SENIORITY_ORDER = ["junior", "mid", "senior", "lead"];

function scoreCandidate(
  candidate: {
    skills: string[];
    seniorityLevel: string | null;
    experienceYears: number | null;
    summary: string | null;
  },
  jobText: string,
  jobTitle: string
): { score: number; explanation: string } {
  const jt = (jobTitle + " " + jobText).toLowerCase();

  // Skill overlap
  const matchedSkills = candidate.skills.filter((s) => jt.includes(s.toLowerCase()));
  const skillScore = candidate.skills.length
    ? Math.round((matchedSkills.length / Math.max(candidate.skills.length, 1)) * 50)
    : 0;

  // Seniority match — check job title/description for seniority keywords
  let seniorityScore = 15;
  const titleLower = jobTitle.toLowerCase();
  const jobSeniority = titleLower.includes("junior") || titleLower.includes("entry")
    ? "junior"
    : titleLower.includes("senior") || titleLower.includes("lead") || titleLower.includes("principal")
    ? "senior"
    : titleLower.includes("mid") || titleLower.includes("intermediate")
    ? "mid"
    : null;

  if (jobSeniority && candidate.seniorityLevel) {
    const jobIdx = SENIORITY_ORDER.indexOf(jobSeniority);
    const candIdx = SENIORITY_ORDER.indexOf(candidate.seniorityLevel);
    const diff = Math.abs(jobIdx - candIdx);
    seniorityScore = diff === 0 ? 30 : diff === 1 ? 20 : 5;
  }

  // Experience years — check for mentions in job text
  const expMatch = jt.match(/(\d+)\+?\s*years?/);
  let expScore = 10;
  if (expMatch && candidate.experienceYears != null) {
    const required = parseInt(expMatch[1], 10);
    expScore = candidate.experienceYears >= required ? 20 : candidate.experienceYears >= required - 1 ? 12 : 5;
  }

  const total = Math.min(100, skillScore + seniorityScore + expScore);

  const explanation = matchedSkills.length
    ? `Matched ${matchedSkills.length} skill${matchedSkills.length !== 1 ? "s" : ""}: ${matchedSkills.slice(0, 5).join(", ")}${matchedSkills.length > 5 ? ` +${matchedSkills.length - 5} more` : ""}.`
    : "No direct skill overlap found with the job description.";

  return { score: total, explanation };
}

export async function triggerMatching(jobId: string): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Unauthorized" };

  // Verify job belongs to this client
  const [job] = await db
    .select({ id: jobs.id, title: jobs.title, description: jobs.description })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

  if (!job) return { ok: false, error: "Job not found" };

  // Mark as matching
  await db.update(jobs).set({ status: "matching" }).where(eq(jobs.id, jobId));

  try {
    // Fetch all visible candidate profiles
    const candidates = await db
      .select({
        id: candidateProfiles.id,
        skills: candidateProfiles.skills,
        seniorityLevel: candidateProfiles.seniorityLevel,
        experienceYears: candidateProfiles.experienceYears,
        summary: candidateProfiles.summary,
      })
      .from(candidateProfiles)
      .where(eq(candidateProfiles.isVisible, true));

    if (candidates.length === 0) {
      await db.update(jobs).set({ status: "complete" }).where(eq(jobs.id, jobId));
      return { ok: true };
    }

    // Score all candidates
    const scored = candidates
      .map((c) => ({ ...c, ...scoreCandidate(c, job.description ?? "", job.title) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Delete existing matches for this job, insert new ones
    await db.delete(matches).where(eq(matches.jobId, jobId));
    await db.insert(matches).values(
      scored.map((c) => ({
        jobId,
        candidateProfileId: c.id,
        matchScore: c.score,
        matchExplanation: c.explanation,
      }))
    );

    await db.update(jobs).set({ status: "complete" }).where(eq(jobs.id, jobId));
    return { ok: true };
  } catch (err) {
    await db.update(jobs).set({ status: "pending" }).where(eq(jobs.id, jobId));
    return { ok: false, error: String(err) };
  }
}
