"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { jobs, candidateProfiles, matches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractJobRequirements, scoreCandidatesForJob } from "@/lib/claude";
import { extractSkillsFromJD } from "@/lib/jd-parser";
import { yearsFromExperienceItems } from "@/lib/cv-parser";

// ─── Regex fallback (used when ANTHROPIC_API_KEY is not set) ──────────────────

const SENIORITY_ORDER = ["junior", "mid", "senior", "lead"];

function inferJobSeniority(text: string): string | null {
  const t = text.toLowerCase();
  if (/\bjunior\b|\bentry[\s-]level\b|\bgraduate\b|\bintern\b/.test(t)) return "junior";
  if (/\bsenior\b|\blead\b|\bprincipal\b|\bstaff\b/.test(t)) return "senior";
  if (/\bmid[\s-]level\b|\bintermediate\b/.test(t)) return "mid";
  return null;
}

function regexScore(
  candidate: { skills: string[]; seniorityLevel: string | null; experienceYears: number | null },
  jobSkills: string[],
  jobText: string
): { score: number; explanation: string } {
  const jobSkillsLower = new Set(jobSkills.map((s) => s.toLowerCase()));
  const candSkillsLower = new Set(candidate.skills.map((s) => s.toLowerCase()));
  const covered = jobSkills.filter((s) => candSkillsLower.has(s.toLowerCase()));
  const bonus = candidate.skills.filter(
    (s) => !jobSkillsLower.has(s.toLowerCase()) && jobText.toLowerCase().includes(s.toLowerCase())
  );

  const coverageScore = Math.round((jobSkills.length > 0 ? covered.length / jobSkills.length : 0) * 65);
  const bonusScore = Math.min(10, bonus.length * 3);

  const jobSeniority = inferJobSeniority(jobText);
  let seniorityScore = 10;
  if (jobSeniority && candidate.seniorityLevel) {
    const diff = Math.abs(SENIORITY_ORDER.indexOf(jobSeniority) - SENIORITY_ORDER.indexOf(candidate.seniorityLevel));
    seniorityScore = diff === 0 ? 20 : diff === 1 ? 12 : 3;
  }

  const expMatch = jobText.match(/(\d+)\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?experience/i);
  let expScore = 3;
  if (expMatch && candidate.experienceYears != null) {
    const required = parseInt(expMatch[1], 10);
    expScore = candidate.experienceYears >= required ? 5 : candidate.experienceYears >= required - 1 ? 3 : 1;
  }

  const total = Math.min(100, coverageScore + bonusScore + seniorityScore + expScore);
  const all = [...covered, ...bonus];
  const explanation =
    all.length > 0
      ? `Matches on ${all.slice(0, 6).join(", ")}${all.length > 6 ? ` +${all.length - 6} more` : ""}. Covers ${covered.length} of ${jobSkills.length} required skills.`
      : jobSkills.length > 0
      ? `No overlap with the ${jobSkills.length} required skills.`
      : "Matched on seniority and experience.";

  return { score: total, explanation };
}

// ─── Main action ──────────────────────────────────────────────────────────────

export async function triggerMatching(jobId: string): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Unauthorized" };

  const [job] = await db
    .select({ id: jobs.id, title: jobs.title, description: jobs.description, requirements: jobs.requirements })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

  if (!job) return { ok: false, error: "Job not found" };

  await db.update(jobs).set({ status: "matching" }).where(eq(jobs.id, jobId));

  try {
    const rawCandidates = await db
      .select({
        id: candidateProfiles.id,
        skills: candidateProfiles.skills,
        seniorityLevel: candidateProfiles.seniorityLevel,
        experienceYears: candidateProfiles.experienceYears,
        summary: candidateProfiles.summary,
        experienceItems: candidateProfiles.experienceItems,
      })
      .from(candidateProfiles)
      .where(eq(candidateProfiles.isVisible, true));

    if (rawCandidates.length === 0) {
      await db.update(jobs).set({ status: "complete" }).where(eq(jobs.id, jobId));
      return { ok: true };
    }

    // Calculate verified experience years from actual date ranges in work history
    const candidates = rawCandidates.map((c) => {
      const items = (c.experienceItems as { role: string; company: string; period: string }[] | null) ?? [];
      const calculatedYears = items.length > 0 ? yearsFromExperienceItems(items) : null;
      return {
        ...c,
        experienceItems: items,
        experienceYears: calculatedYears ?? c.experienceYears,
      };
    });

    const jdText = `${job.title}\n\n${job.description ?? ""}`;
    const useAI = !!process.env.ANTHROPIC_API_KEY;

    let scored: { id: string; score: number; explanation: string }[];
    let extractedSkills: string[];

    if (useAI) {
      const requirements = await extractJobRequirements(jdText);
      extractedSkills = requirements.skills;

      const aiScores = await scoreCandidatesForJob(
        { title: job.title, description: job.description ?? "", requirements },
        candidates
      );
      scored = aiScores.map((s) => ({ id: s.candidateId, score: s.score, explanation: s.explanation }));

      // Store AI-extracted skills back on the job
      const existingReqs = (job.requirements as Record<string, unknown> | null) ?? {};
      await db
        .update(jobs)
        .set({ requirements: { ...existingReqs, skills: extractedSkills, aiExtracted: true } })
        .where(eq(jobs.id, jobId));
    } else {
      extractedSkills = extractSkillsFromJD(jdText);
      scored = candidates.map((c) => {
        const { score, explanation } = regexScore(
          { skills: c.skills, seniorityLevel: c.seniorityLevel, experienceYears: c.experienceYears },
          extractedSkills,
          jdText
        );
        return { id: c.id, score, explanation };
      });
    }

    // Save updated experience years back to profiles where we have better data
    await Promise.all(
      candidates
        .filter((c) => c.experienceYears != null)
        .map((c) =>
          db
            .update(candidateProfiles)
            .set({ experienceYears: c.experienceYears })
            .where(eq(candidateProfiles.id, c.id))
        )
    );

    const top5 = scored.sort((a, b) => b.score - a.score).slice(0, 5);

    await db.delete(matches).where(eq(matches.jobId, jobId));
    await db.insert(matches).values(
      top5.map((s) => ({
        jobId,
        candidateProfileId: s.id,
        matchScore: s.score,
        matchExplanation: s.explanation,
      }))
    );

    await db.update(jobs).set({ status: "complete" }).where(eq(jobs.id, jobId));
    return { ok: true };
  } catch (err) {
    await db.update(jobs).set({ status: "pending" }).where(eq(jobs.id, jobId));
    return { ok: false, error: String(err) };
  }
}
