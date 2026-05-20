import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
