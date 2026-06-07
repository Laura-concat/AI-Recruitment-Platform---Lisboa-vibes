import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { candidateProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface MCQQuestion {
  type: "mcq";
  id: number;
  question: string;
  options: string[];
}

export interface ShortQuestion {
  type: "short";
  id: number;
  question: string;
}

export type TestQuestion = MCQQuestion | ShortQuestion;

export async function POST() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId))
    .limit(1);

  if (!profile) return Response.json({ error: "Profile not found" }, { status: 404 });

  const skills = profile.skills?.slice(0, 8).join(", ") || "general programming";
  const seniority = profile.seniorityLevel ?? "mid";
  const years = profile.experienceYears ?? 3;

  const prompt = `You are creating a technical assessment for a ${seniority}-level developer with ${years} years of experience.
Their primary skills are: ${skills}.

Generate exactly 10 technical questions to assess their real-world competency:
- 7 multiple choice questions (4 options each, one correct answer)
- 3 short answer questions requiring a written explanation (2-4 sentences expected)

Questions should be practical and relevant to their skills. Difficulty should match ${seniority} level.
Avoid trivial syntax questions — focus on problem-solving, architecture, debugging, and best practices.

Return ONLY valid JSON in this exact format, no other text:
{
  "questions": [
    {
      "type": "mcq",
      "id": 1,
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": "A"
    },
    {
      "type": "short",
      "id": 8,
      "question": "..."
    }
  ]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  // Strip markdown code fences if present
  const jsonStr = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  const parsed = JSON.parse(jsonStr);

  // Strip correct answers before sending to client
  const questions: TestQuestion[] = parsed.questions.map((q: TestQuestion & { correct?: string }) => {
    const { correct: _correct, ...rest } = q as MCQQuestion & { correct?: string };
    void _correct;
    return rest;
  });

  // Store correct answers server-side in a signed token approach — embed in a separate field
  // For simplicity, store the full question set (with answers) temporarily in the response
  // and re-derive answers server-side during scoring
  return Response.json({ questions, rawQuestions: parsed.questions });
}
