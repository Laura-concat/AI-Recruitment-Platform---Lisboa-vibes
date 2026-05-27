"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { jobs, candidateProfiles, matches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractSkills } from "@/lib/cv-parser";

const SENIORITY_ORDER = ["junior", "mid", "senior", "lead"];

function inferJobSeniority(title: string, description: string): string | null {
  const text = (title + " " + description).toLowerCase();
  if (/\bjunior\b|\bentry[\s-]level\b|\bgraduate\b|\bintern\b/.test(text)) return "junior";
  if (/\bsenior\b|\blead\b|\bprincipal\b|\bstaff\b|\bhead of\b/.test(text)) return "senior";
  if (/\bmid[\s-]level\b|\bintermediate\b/.test(text)) return "mid";
  return null;
}

function scoreCandidate(
  candidate: {
    skills: string[];
    seniorityLevel: string | null;
    experienceYears: number | null;
  },
  jobSkills: string[],
  jobTitle: string,
  jobDescription: string
): { score: number; explanation: string } {
  const jobSkillsLower = new Set(jobSkills.map((s) => s.toLowerCase()));
  const candidateSkillsLower = new Set(candidate.skills.map((s) => s.toLowerCase()));

  // Which of the job's required skills does the candidate actually have?
  const coveredSkills = jobSkills.filter((s) => candidateSkillsLower.has(s.toLowerCase()));
  // Which candidate skills are relevant (mentioned anywhere in the job text)?
  const jobText = (jobTitle + " " + jobDescription).toLowerCase();
  const bonusSkills = candidate.skills.filter(
    (s) => !jobSkillsLower.has(s.toLowerCase()) && jobText.includes(s.toLowerCase())
  );

  // Coverage score: how much of what the job needs does the candidate cover? (0–65)
  const coverageRatio = jobSkills.length > 0 ? coveredSkills.length / jobSkills.length : 0;
  const coverageScore = Math.round(coverageRatio * 65);

  // Bonus for additional relevant skills mentioned in the JD (0–10)
  const bonusScore = Math.min(10, bonusSkills.length * 3);

  // Seniority match (0–20)
  const jobSeniority = inferJobSeniority(jobTitle, jobDescription);
  let seniorityScore = 10; // neutral if we can't determine
  if (jobSeniority && candidate.seniorityLevel) {
    const jobIdx = SENIORITY_ORDER.indexOf(jobSeniority);
    const candIdx = SENIORITY_ORDER.indexOf(candidate.seniorityLevel);
    const diff = Math.abs(jobIdx - candIdx);
    seniorityScore = diff === 0 ? 20 : diff === 1 ? 12 : 3;
  }

  // Experience years (0–5 bonus)
  const expMatch = jobDescription.match(/(\d+)\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?experience/i);
  let expScore = 3;
  if (expMatch && candidate.experienceYears != null) {
    const required = parseInt(expMatch[1], 10);
    expScore = candidate.experienceYears >= required ? 5 : candidate.experienceYears >= required - 1 ? 3 : 1;
  }

  const total = Math.min(100, coverageScore + bonusScore + seniorityScore + expScore);

  // Build explanation
  const allMatched = [...coveredSkills, ...bonusSkills];
  const explanation = allMatched.length > 0
    ? `Strong match on ${allMatched.slice(0, 6).join(", ")}${allMatched.length > 6 ? ` +${allMatched.length - 6} more` : ""}. Covers ${coveredSkills.length} of ${jobSkills.length} required skill${jobSkills.length !== 1 ? "s" : ""}.`
    : jobSkills.length > 0
    ? `No overlap with the ${jobSkills.length} identified required skills.`
    : "Matched based on seniority and experience level.";

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

    // Extract required skills from the job description using the CV parser's skill dictionary
    const jobSkills = extractSkills((job.title ?? "") + " " + (job.description ?? ""));

    // Score all candidates against those required skills
    const scored = candidates
      .map((c) => ({ ...c, ...scoreCandidate(c, jobSkills, job.title, job.description ?? "") }))
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
