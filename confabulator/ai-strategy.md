# AI Strategy

## Overview

The platform has two distinct AI operations:
1. **CV Analysis** — extract structured profile data from an uploaded CV file
2. **Job Matching** — rank candidate profiles against a job description

Both run as async background jobs (Inngest), never as synchronous HTTP responses.

---

## Operation 1: CV Analysis

### Pipeline

```
Candidate uploads CV (PDF or DOCX)
  → Vercel Blob stores file
  → Inngest job triggered: cv/upload.received
      Step 1: Send file to Claude Files API (handles PDF natively)
      Step 2: Claude extracts structured profile data (tool use / JSON mode)
      Step 3: Update CandidateProfile in DB
      Step 4: Generate Voyage AI embedding from profile summary text
      Step 5: Store embedding on CandidateProfile
      Step 6: Update CV.status = 'complete'
  → Frontend polling detects status change, navigates to profile review
```

### Model

**Claude claude-sonnet-4-6** (or latest Sonnet) for extraction.
- Use the Files API to upload the PDF directly — no client-side text extraction needed.
- Use tool use (structured output) to guarantee a typed JSON response.

### Extraction Schema (Claude tool definition)

```typescript
{
  name: "extract_candidate_profile",
  description: "Extract structured candidate data from a CV",
  input_schema: {
    type: "object",
    properties: {
      full_name: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      location: { type: "string" },
      languages: { type: "array", items: { type: "string" } },
      skills: { type: "array", items: { type: "string" } },
      seniority_level: { type: "string", enum: ["junior", "mid", "senior", "lead"] },
      experience_years: { type: "integer" },
      experience_items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            company: { type: "string" },
            title: { type: "string" },
            start_date: { type: "string" },
            end_date: { type: "string" },
            description: { type: "string" }
          }
        }
      },
      education: {
        type: "array",
        items: {
          type: "object",
          properties: {
            institution: { type: "string" },
            degree: { type: "string" },
            field: { type: "string" },
            graduation_year: { type: "integer" }
          }
        }
      },
      summary: { type: "string" }
    },
    required: ["skills", "seniority_level", "experience_years"]
  }
}
```

### System Prompt (CV Analysis)

```
You are an expert technical recruiter. Extract structured information from this CV.
The CV may be in Arabic, English, or bilingual. Extract all fields accurately regardless of language.
For skills, include both technical skills (programming languages, frameworks, tools) and relevant soft skills.
For seniority_level, use: junior (0–2 years), mid (2–5 years), senior (5–10 years), lead (10+ years or explicit leadership role).
Return only the extracted data — do not add inferred or assumed information.
```

### Cost Estimate (CV Analysis)

- Claude Sonnet: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- Average CV: ~1,500 tokens input, ~400 tokens output
- Per CV analysis: ~$0.006 (less than 1 cent)
- 500 CVs total: ~$3

---

## Operation 2: Job Matching

### Pipeline

```
Client posts job description
  → Job stored in DB (status: pending)
  → Inngest job triggered: job/created
      Step 1: Generate Voyage AI embedding for job description text
      Step 2: pgvector ANN search: find top-20 CandidateProfiles by embedding similarity
              (WHERE isVisible = true)
      Step 3: For each of top-20, call Claude with: job description + candidate profile summary
              → Claude returns: match_score (0–100), match_explanation (2–3 sentences)
      Step 4: Sort by match_score, take top-5
      Step 5: Create Match records in DB
      Step 6: Update Job.status = 'complete'
  → Client UI updates to show match results
```

### Why Two Stages?

Running Claude against all 500 candidates for every job = 500 LLM calls per job posting = expensive and slow.

Two-stage approach:
- **Stage 1 (embedding similarity):** Fast, cheap, retrieves top-20 semantically relevant candidates in milliseconds via pgvector.
- **Stage 2 (LLM re-ranking):** Claude evaluates only 20 candidates with full context, generates a match score and explanation. 20 calls per job posting.

### Embedding Model

**Voyage AI `voyage-multilingual-2`**
- Dimensions: 1024
- Supports Arabic, English, and mixed-language text natively
- Significantly outperforms OpenAI's `text-embedding-3-small` on Arabic text similarity tasks
- Cost: $0.12 per 1M tokens (negligible)

Embed the following text per candidate:
```
{candidate.summary} Skills: {candidate.skills.join(', ')}. 
Experience: {candidate.experience_years} years, {candidate.seniority_level} level.
Languages: {candidate.languages.join(', ')}.
```

### Model (Re-ranking)

**Claude claude-sonnet-4-6** for re-ranking.

### Prompt (Re-ranking, per candidate)

```
You are a technical recruiter evaluating a candidate for a specific role.

JOB DESCRIPTION:
{jobDescription}

CANDIDATE PROFILE:
Name: {name}
Skills: {skills}
Experience: {experienceYears} years ({seniorityLevel})
Languages: {languages}
Recent roles: {experienceItems summary}

Rate this candidate's fit for the role on a scale of 0–100.
Return JSON: { "score": number, "explanation": "2-3 sentence explanation for the client" }

Be honest. A score below 50 means the candidate is not a good fit. Prioritise skill match, then experience level, then language alignment.
```

### Cost Estimate (Matching)

- Voyage AI embedding (job): negligible (~$0.0001)
- Claude re-ranking (20 candidates × ~1,500 tokens each): ~$0.04 per job posting
- 150 companies × 2 jobs/month average = 300 job postings/month
- Monthly matching cost: ~$12

---

## Rate Limiting

| Operation | Limit | Mechanism |
|-----------|-------|-----------|
| CV upload | 3 per user per day | DB counter on `cvs` table; reset at midnight UTC |
| Match trigger | 1 per job per 24 hours | Check `job.lastMatchedAt`; reject if < 24h ago |

---

## Arabic Language Validation (Phase 1 Spike)

Before building the full pipeline, validate on a sample of 10 CVs:
- 3 Arabic-only CVs
- 3 English-only CVs
- 4 bilingual (Arabic/English) CVs

Check:
1. Does Claude extract `skills`, `experience_years`, and `seniority_level` correctly?
2. Does Voyage AI produce semantically meaningful embeddings (i.e., an Arabic "React developer" CV ranks close to an English "React developer" CV)?

If Arabic extraction quality is poor, evaluate: Google Gemini 1.5 Flash (strong multilingual), or a pre-processing step using an Arabic OCR + translation layer before Claude.

---

## Prompt Caching

Enable Anthropic prompt caching on the system prompt for CV analysis (it's identical for every CV). At 500 CVs, this saves ~$0.50 — marginal for MVP, but worth enabling as a habit.

For re-ranking, cache the job description portion of the prompt across the 20 candidate calls in a single job run.
