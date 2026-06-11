import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Job matching ──────────────────────────────────────────────────────────────

export interface JobRequirements {
  skills: string[];
  seniorityLevel: "junior" | "mid" | "senior" | "lead" | null;
  experienceYears: number | null;
  roleType: string;
}

export interface CandidateScore {
  candidateId: string;
  score: number;
  explanation: string;
}

/** Use Claude to extract structured requirements from a job description. */
export async function extractJobRequirements(jdText: string): Promise<JobRequirements> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    tools: [
      {
        name: "extract_job_requirements",
        description: "Extract structured requirements from a job description.",
        input_schema: {
          type: "object" as const,
          properties: {
            skills: {
              type: "array",
              items: { type: "string" },
              description: "All required and preferred technical skills, frameworks, and tools.",
            },
            seniorityLevel: {
              type: "string",
              enum: ["junior", "mid", "senior", "lead"],
              description: "Inferred seniority: junior 0-2 yrs, mid 2-5 yrs, senior 5-10 yrs, lead 10+.",
            },
            experienceYears: {
              type: "number",
              description: "Minimum years of experience required. Null if not specified.",
            },
            roleType: {
              type: "string",
              description: "Short role label, e.g. 'Full-Stack Developer', 'Data Scientist'.",
            },
          },
          required: ["skills", "roleType"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "extract_job_requirements" },
    messages: [
      {
        role: "user",
        content: `Extract the requirements from this job description:\n\n${jdText.slice(0, 4000)}`,
      },
    ],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new Error("No tool_use in response");
  const input = toolUse.input as {
    skills: string[];
    seniorityLevel?: string;
    experienceYears?: number;
    roleType: string;
  };
  return {
    skills: input.skills ?? [],
    seniorityLevel: (input.seniorityLevel as JobRequirements["seniorityLevel"]) ?? null,
    experienceYears: input.experienceYears ?? null,
    roleType: input.roleType,
  };
}

export interface CandidateForScoring {
  id: string;
  skills: string[];
  seniorityLevel: string | null;
  experienceYears: number | null;
  summary: string | null;
  experienceItems?: { role: string; company: string; period: string }[] | null;
}

function formatWorkHistory(items: { role: string; company: string; period: string }[]): string {
  if (!items.length) return "No work history provided.";
  return items.map((i) => `• ${i.role} at ${i.company} (${i.period})`).join("\n");
}

/** Score all candidates against a job in parallel Claude calls. */
export async function scoreCandidatesForJob(
  job: { title: string; description: string; requirements: JobRequirements },
  candidates: CandidateForScoring[]
): Promise<CandidateScore[]> {
  const jdSummary = `Role: ${job.title}\nRequired skills: ${job.requirements.skills.join(", ")}\nSeniority: ${job.requirements.seniorityLevel ?? "not specified"}\nMin experience: ${job.requirements.experienceYears ? `${job.requirements.experienceYears}+ years` : "not specified"}\n\nJob description:\n${job.description.slice(0, 2000)}`;

  const results = await Promise.all(
    candidates.map(async (candidate) => {
      const workHistory = candidate.experienceItems?.length
        ? `\nWork history (use these dates to verify actual experience):\n${formatWorkHistory(candidate.experienceItems)}`
        : "";
      const candidateSummary = `Skills: ${candidate.skills.join(", ")}\nSeniority: ${candidate.seniorityLevel ?? "unknown"}\nCalculated experience: ${candidate.experienceYears != null ? `${candidate.experienceYears} years` : "unknown"}${workHistory}\nSummary: ${candidate.summary ?? ""}`;

      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        tools: [
          {
            name: "score_candidate",
            description: "Score how well a candidate matches a job based on their skills and verified experience.",
            input_schema: {
              type: "object" as const,
              properties: {
                score: {
                  type: "number",
                  description: "Match score 0-100. Consider: skill overlap with required skills (most important), seniority match, and verified years of experience from work history dates. 80+ = strong match, 50-79 = partial, below 50 = weak.",
                },
                explanation: {
                  type: "string",
                  description: "2-3 sentence explanation. State which required skills they have, any critical gaps, and whether their experience level matches. Be specific about skill gaps.",
                },
              },
              required: ["score", "explanation"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "score_candidate" },
        messages: [
          {
            role: "user",
            content: `Score this candidate against the job. Verify their experience by looking at the actual work history dates, not just the summary number.\n\nJOB:\n${jdSummary}\n\nCANDIDATE:\n${candidateSummary}`,
          },
        ],
      });

      const toolUse = message.content.find((b) => b.type === "tool_use");
      if (!toolUse || toolUse.type !== "tool_use") return { candidateId: candidate.id, score: 0, explanation: "Could not score." };
      const input = toolUse.input as { score: number; explanation: string };
      return {
        candidateId: candidate.id,
        score: Math.round(Math.max(0, Math.min(100, input.score))),
        explanation: input.explanation,
      };
    })
  );

  return results;
}

const SYSTEM_PROMPT = `You are an expert technical recruiter. Extract structured information from this CV.
The CV may be in Arabic, English, or bilingual — extract all fields accurately regardless of language.
For skills: include technical skills (languages, frameworks, tools) and relevant soft skills.
For seniority_level: junior (0–2 yrs), mid (2–5 yrs), senior (5–10 yrs), lead (10+ yrs or explicit leadership).
Return only information present in the CV — do not infer or assume.`;

export interface CvExtraction {
  full_name: string;
  skills: string[];
  experience_years: number;
  seniority_level: "junior" | "mid" | "senior" | "lead";
  languages: string[];
  experience_items: { role: string; company: string; period: string; description?: string }[];
  education: { degree: string; institution: string; year?: number } | null;
  summary: string;
}

/** Upload a CV file from its Blob URL to the Claude Files API. Returns the file ID. */
export async function uploadCvToFiles(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error(`Failed to fetch CV from blob: ${response.status}`);

  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const arrayBuffer = await response.arrayBuffer();
  const file = new File([arrayBuffer], "cv", { type: contentType });

  const fileMetadata = await anthropic.beta.files.upload({ file });
  return fileMetadata.id;
}

/** Call Claude with a Files API file reference to extract structured CV data. */
export async function extractCvData(fileId: string): Promise<CvExtraction> {
  const message = await anthropic.beta.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    betas: ["files-api-2025-04-14", "prompt-caching-2024-07-31"],
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [
      {
        name: "extract_cv_data",
        description: "Extract structured information from a CV document.",
        input_schema: {
          type: "object" as const,
          properties: {
            full_name: { type: "string", description: "Candidate's full name" },
            skills: {
              type: "array",
              items: { type: "string" },
              description: "Technical and relevant soft skills",
            },
            experience_years: {
              type: "number",
              description: "Total years of professional experience",
            },
            seniority_level: {
              type: "string",
              enum: ["junior", "mid", "senior", "lead"],
              description: "Seniority based on years: junior 0-2, mid 2-5, senior 5-10, lead 10+",
            },
            languages: {
              type: "array",
              items: { type: "string" },
              description: "Spoken or written languages",
            },
            experience_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string" },
                  company: { type: "string" },
                  period: { type: "string" },
                  description: { type: "string" },
                },
                required: ["role", "company", "period"],
              },
              description: "Work experience entries in chronological order",
            },
            education: {
              type: "object",
              properties: {
                degree: { type: "string" },
                institution: { type: "string" },
                year: { type: "number" },
              },
              required: ["degree", "institution"],
              description: "Highest or most relevant education",
            },
            summary: {
              type: "string",
              description: "2-4 sentence professional summary based on CV content",
            },
          },
          required: [
            "full_name",
            "skills",
            "experience_years",
            "seniority_level",
            "languages",
            "experience_items",
            "summary",
          ],
        },
      },
    ],
    tool_choice: { type: "tool", name: "extract_cv_data" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "file",
              file_id: fileId,
            },
          },
          {
            type: "text",
            text: "Please extract the structured information from this CV.",
          },
        ],
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a tool_use block");
  }

  return toolUse.input as CvExtraction;
}
