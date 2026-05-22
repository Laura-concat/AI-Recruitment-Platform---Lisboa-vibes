import { NonRetriableError } from "inngest";
import { eq, sql } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { inngest } from "../client";
import { db } from "@/lib/db";
import { jobs, candidateProfiles, matches } from "@/lib/db/schema";
import { generateEmbedding } from "@/lib/voyage";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Cached system prompt — billed once per hour per Anthropic cache TTL
const RANKING_SYSTEM_PROMPT = `You are a technical recruiter evaluating candidate fit for a role.
Rate the candidate on a scale of 0–100 and explain your reasoning in 2–3 sentences.
Be honest. Below 50 means not a good fit.
Prioritise skill match, then experience level, then language alignment.
Respond ONLY with valid JSON: { "score": number, "explanation": "..." }`;

interface RankResult {
  candidateProfileId: string;
  score: number;
  explanation: string;
}

async function rankCandidate(
  jobDescription: string,
  candidate: {
    id: string;
    skills: string[];
    experienceYears: number | null;
    seniorityLevel: string | null;
    languages: string[];
    summary: string | null;
  }
): Promise<RankResult> {
  const profileText = [
    `Skills: ${candidate.skills.join(", ")}`,
    `Experience: ${candidate.experienceYears ?? "?"} years${candidate.seniorityLevel ? ` (${candidate.seniorityLevel})` : ""}`,
    `Languages: ${candidate.languages.join(", ")}`,
    candidate.summary ? `Summary: ${candidate.summary}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    system: [
      {
        type: "text",
        text: RANKING_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ] as Anthropic.TextBlockParam[],
    messages: [
      {
        role: "user",
        content: `JOB DESCRIPTION:\n${jobDescription}\n\nCANDIDATE PROFILE:\n${profileText}`,
      },
    ],
  });

  const text = message.content[0]?.type === "text" ? message.content[0].text.trim() : "{}";

  let parsed: { score?: number; explanation?: string } = {};
  try {
    // Strip markdown code fences if present
    const clean = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    parsed = JSON.parse(clean);
  } catch {
    parsed = { score: 0, explanation: "Unable to rank candidate." };
  }

  return {
    candidateProfileId: candidate.id,
    score: Math.min(100, Math.max(0, Math.round(parsed.score ?? 0))),
    explanation: parsed.explanation ?? "",
  };
}

export const matchJob = inngest.createFunction(
  {
    id: "match-job",
    retries: 3,
    triggers: [{ event: "job/created" }],
    onFailure: async ({ event, step }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jobId = (event.data as any).event?.data?.jobId as string | undefined;
      if (!jobId) return;
      await step.run("mark-job-failed", async () => {
        // No explicit failed status — leave as pending so client can retry
        await db.update(jobs).set({ status: "pending" }).where(eq(jobs.id, jobId));
      });
    },
  },
  async ({ event, step }) => {
    const { jobId } = event.data as { jobId: string };

    // ── Step 1: Fetch job and mark as matching ────────────────────────────────
    const job = await step.run("fetch-job", async () => {
      const [record] = await db.select().from(jobs).where(eq(jobs.id, jobId));
      if (!record) throw new NonRetriableError(`Job not found: ${jobId}`);

      // Idempotency: skip if already matched within 24 hours
      const updatedAt = new Date(record.updatedAt);
      const hoursSince = (Date.now() - updatedAt.getTime()) / 3_600_000;
      if (record.status === "complete" && hoursSince < 24) {
        throw new NonRetriableError("Matching already completed within 24 hours. Skipping.");
      }

      await db.update(jobs).set({ status: "matching" }).where(eq(jobs.id, jobId));
      return record;
    });

    // ── Step 2: Embed job description + store on Job ──────────────────────────
    const jobEmbedding = await step.run("embed-job", async () => {
      const embedding = await generateEmbedding(
        `${job.title}\n\n${job.description}`
      );
      await db
        .update(jobs)
        .set({ embedding: embedding as unknown as null })
        .where(eq(jobs.id, jobId));
      return embedding;
    });

    // ── Step 3: pgvector ANN search — top 20 visible candidates ──────────────
    const topCandidates = await step.run("retrieve-candidates", async () => {
      const embeddingLiteral = `[${jobEmbedding.join(",")}]`;
      const results = await db
        .select({
          id: candidateProfiles.id,
          skills: candidateProfiles.skills,
          experienceYears: candidateProfiles.experienceYears,
          seniorityLevel: candidateProfiles.seniorityLevel,
          languages: candidateProfiles.languages,
          summary: candidateProfiles.summary,
        })
        .from(candidateProfiles)
        .where(eq(candidateProfiles.isVisible, true))
        .orderBy(sql`embedding <=> ${embeddingLiteral}::vector`)
        .limit(20);

      return results;
    });

    if (topCandidates.length === 0) {
      await step.run("mark-complete-no-candidates", async () => {
        await db.update(jobs).set({ status: "complete" }).where(eq(jobs.id, jobId));
      });
      return { matched: 0 };
    }

    // ── Step 4: Claude re-ranking — 20 parallel calls ─────────────────────────
    const rankings = await step.run("rank-candidates", async () => {
      const results = await Promise.all(
        topCandidates.map((c) =>
          rankCandidate(job.description, {
            id: c.id,
            skills: c.skills,
            experienceYears: c.experienceYears,
            seniorityLevel: c.seniorityLevel,
            languages: c.languages,
            summary: c.summary,
          })
        )
      );
      return results.sort((a, b) => b.score - a.score).slice(0, 5);
    });

    // ── Step 5: Create Match records for top 5 ────────────────────────────────
    await step.run("create-matches", async () => {
      // Delete any existing matches for this job (idempotent re-run)
      await db.delete(matches).where(eq(matches.jobId, jobId));

      await db.insert(matches).values(
        rankings.map((r) => ({
          jobId,
          candidateProfileId: r.candidateProfileId,
          matchScore: r.score,
          matchExplanation: r.explanation,
        }))
      );
    });

    // ── Step 6: Mark job complete ─────────────────────────────────────────────
    await step.run("mark-complete", async () => {
      await db.update(jobs).set({ status: "complete" }).where(eq(jobs.id, jobId));
    });

    return { matched: rankings.length, topScore: rankings[0]?.score };
  }
);
