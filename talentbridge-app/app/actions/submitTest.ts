"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { candidateProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const PASS_THRESHOLD = 60;

interface RawQuestion {
  type: "mcq" | "short";
  id: number;
  question: string;
  options?: string[];
  correct?: string;
}

export async function submitTest(
  rawQuestions: RawQuestion[],
  answers: Record<number, string>
): Promise<{ score: number; passed: boolean; feedback: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [profile] = await db
    .select({ id: candidateProfiles.id, seniorityLevel: candidateProfiles.seniorityLevel })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId))
    .limit(1);

  if (!profile) throw new Error("Profile not found");

  // Score MCQs directly (deterministic)
  let mcqCorrect = 0;
  let mcqTotal = 0;
  const shortAnswers: { question: string; answer: string }[] = [];

  for (const q of rawQuestions) {
    if (q.type === "mcq") {
      mcqTotal++;
      const given = (answers[q.id] ?? "").trim().toUpperCase().charAt(0);
      const expected = (q.correct ?? "").trim().toUpperCase().charAt(0);
      if (given && given === expected) mcqCorrect++;
    } else {
      shortAnswers.push({
        question: q.question,
        answer: answers[q.id] ?? "",
      });
    }
  }

  // Score short answers with Claude
  let shortScore = 0;
  if (shortAnswers.length > 0) {
    const shortPrompt = `You are evaluating technical answers from a ${profile.seniorityLevel ?? "mid"}-level developer.

Score each answer from 0 to 3:
- 0: No answer, completely wrong, or irrelevant
- 1: Partially correct or missing key points
- 2: Mostly correct with minor gaps
- 3: Accurate, clear, and demonstrates real understanding

${shortAnswers.map((s, i) => `Question ${i + 1}: ${s.question}\nAnswer: ${s.answer || "(no answer provided)"}`).join("\n\n")}

Return ONLY valid JSON: { "scores": [0, 2, 3] }`;

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      messages: [{ role: "user", content: shortPrompt }],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text : "{}";
    const jsonStr = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const result = JSON.parse(jsonStr);
    shortScore = (result.scores as number[]).reduce((a: number, b: number) => a + b, 0);
  }

  // Calculate overall score out of 100
  // MCQs: 7 questions × ~9.5pts each ≈ 66.5 pts total
  // Short answers: 3 questions × 3pts max = 9pts → mapped to 33.5pts
  const mcqPoints = mcqTotal > 0 ? (mcqCorrect / mcqTotal) * 66.5 : 0;
  const shortMax = shortAnswers.length * 3;
  const shortPoints = shortMax > 0 ? (shortScore / shortMax) * 33.5 : 33.5;
  const score = Math.round(mcqPoints + shortPoints);
  const passed = score >= PASS_THRESHOLD;

  await db
    .update(candidateProfiles)
    .set({
      testScore: score,
      testStatus: passed ? "passed" : "failed",
      testTakenAt: new Date(),
      isVisible: passed,
      updatedAt: new Date(),
    })
    .where(eq(candidateProfiles.id, profile.id));

  const feedback = passed
    ? `Great work! You scored ${score}% and your profile is now visible to clients.`
    : `You scored ${score}%. A score of ${PASS_THRESHOLD}% or higher is needed to be listed on the platform. You can retake the test to improve your score.`;

  return { score, passed, feedback };
}
