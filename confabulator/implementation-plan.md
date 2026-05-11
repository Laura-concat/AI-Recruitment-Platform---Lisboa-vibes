# Implementation Plan: Recruitment AI Tool

## Executive Summary

### Core Value Proposition
The Recruitment AI Tool empowers refugee and female developers in the MENA region by matching them with job opportunities using AI-driven analytics, ensuring precise, culturally aligned, and efficient recruitment for SMEs and MMEs.

### MVP Scope
The MVP includes a CV uploader, AI profile analysis, job description uploader, and AI matchmaker, as outlined in the PRD. These features facilitate a streamlined hiring process.

### Success Criteria
- **Feature Completion:** All P0 features from PRD implemented and tested.
- **User Validation:** At least 200 candidates and 50 clients successfully onboarded.
- **Technical Quality:** Core features work reliably with <5% error rate.

## Technical Architecture

### Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 15 + React | App Router, Server Components, Server Actions |
| Auth | **Clerk** | Managed auth; built-in roles, webhooks, pre-built UI |
| Database | Neon (Serverless PostgreSQL) + **pgvector** | pgvector for embedding similarity search |
| ORM | Drizzle ORM | |
| File Storage | **Vercel Blob** | Private signed URLs; upgrade to Cloudflare R2 if egress costs grow |
| AI (CV parsing) | **Claude API (Anthropic)** | Files API handles PDFs natively; tool use for structured extraction |
| AI (Embeddings) | **Voyage AI** (`voyage-multilingual-2`) | Best multilingual (Arabic/English) embedding quality |
| Background Jobs | **Inngest** | Serverless-native; all AI processing runs asynchronously |
| Payments | **Stripe** | Subscription billing for client access tiers |
| UI Components | shadcn/ui + Tailwind CSS | |
| Server state | **TanStack Query** | Polling for async job status; cache management |
| Hosting | Vercel | |

### Architecture Patterns
- **Server Actions for mutations:** CV upload, job creation, profile edits — CSRF-safe, no boilerplate fetch layer needed.
- **API routes for external callbacks:** Stripe webhooks, Inngest event endpoints only.
- **Async-first AI processing:** All Claude API calls run as Inngest background jobs; HTTP responses are immediate with a `{ status: "processing" }` payload.
- **pgvector similarity search:** Embeddings stored on `candidate_profiles` and `jobs`; initial match candidates retrieved via vector distance, then re-ranked by Claude.
- **Server-side rendering:** Optimized for SEO and performance; most pages are Server Components.

### Data Model

#### Entity Relationship Diagram (Text)
```
[User] 1──────1 [CandidateProfile]
[User] 1──────M [CV]
[User] 1──────M [Job]
[User] 1──────1 [Subscription]
[CandidateProfile] 1──────M [Match]
[Job] 1──────M [Match]
```

#### Core Entities

- **User** (managed by Clerk; minimal local record for FK relationships)
  - Fields: id (uuid, matches Clerk user ID), email (string, unique), role (enum: candidate/client), createdAt, updatedAt
  - Relationships: has_one CandidateProfile, has_many CVs, has_many Jobs, has_one Subscription
  - Indexes: email for lookup

- **CandidateProfile** (structured data extracted from CV — separate from the raw file)
  - Fields: id (uuid), userId (uuid), skills (text[]), experienceYears (int), seniorityLevel (enum: junior/mid/senior/lead), languages (text[]), experienceItems (json), education (json), embedding (vector(1024)), isVisible (bool, default true), updatedAt
  - Relationships: belongs_to User, has_many Matches
  - Indexes: userId; GIN index on skills array; ivfflat index on embedding for pgvector ANN search
  - Notes: `embedding` populated by Voyage AI after CV analysis; used for pgvector similarity search during matching

- **CV** (the raw uploaded file — source of truth for re-analysis)
  - Fields: id (uuid), userId (uuid), fileUrl (string), status (enum: pending/processing/complete/failed), uploadedAt
  - Relationships: belongs_to User
  - Indexes: userId, status

- **Job**
  - Fields: id (uuid), userId (uuid), title (string), description (text), requirements (json), embedding (vector(1024)), status (enum: pending/matching/complete), createdAt, updatedAt
  - Relationships: belongs_to User, has_many Matches
  - Indexes: userId; ivfflat index on embedding for pgvector ANN search
  - Notes: `embedding` populated by Voyage AI on job creation; used for initial candidate retrieval

- **Match**
  - Fields: id (uuid), candidateProfileId (uuid), jobId (uuid), matchScore (float), matchExplanation (text), rating (int, 1–5, nullable), outcome (enum: shortlisted/interviewing/hired/rejected, nullable), createdAt, updatedAt
  - Relationships: belongs_to CandidateProfile, belongs_to Job
  - Indexes: candidateProfileId, jobId

- **Subscription** (Stripe billing state for client users)
  - Fields: id (uuid), userId (uuid), stripeCustomerId (string), stripeSubscriptionId (string), tier (enum: basic/pro), status (enum: active/canceled/past_due/trialing), currentPeriodEnd (timestamp), createdAt, updatedAt
  - Relationships: belongs_to User
  - Indexes: userId, stripeCustomerId, stripeSubscriptionId

### API Routes / Endpoints

Authentication is handled by Clerk (no custom auth routes needed).

Most mutations use **Next.js Server Actions** (CV upload, job creation, profile edits). API routes are reserved for external callbacks.

#### External Callback Routes

**Stripe Webhooks:**
- `POST /api/webhooks/stripe` - Handle subscription lifecycle events (`subscription.created`, `subscription.updated`, `subscription.deleted`, `invoice.payment_failed`)

**Inngest Event Endpoint:**
- `POST /api/inngest` - Inngest event receiver for background job orchestration

#### Data Fetch Routes (for TanStack Query polling)

**CV / Profile:**
- `GET /api/cvs/:id` - Returns CV record including `status` (for polling during processing)
- `GET /api/profile` - Returns authenticated candidate's CandidateProfile

**Jobs & Matches:**
- `GET /api/jobs` - Returns client's job listings
- `GET /api/jobs/:id` - Returns single job with current `status`
- `GET /api/jobs/:id/matches` - Returns match results once matching is complete
- `PATCH /api/jobs/:id/matches/:matchId` - Update match rating and outcome (client feedback)

#### Inngest Background Jobs (not HTTP routes — triggered internally)

- `cv/upload.received` → extract text from PDF/DOCX → call Claude for structured extraction → update CandidateProfile → generate Voyage AI embedding → update CV status to `complete`
- `job/created` → generate Voyage AI embedding → pgvector ANN search for top-N candidates → Claude re-ranking with match explanations → create Match records → update Job status to `complete`

## User Stories

### User Story 1: CV Uploader
**Story:** As a developer, I want to upload my CV so that I can create an accurate profile for potential employers to view.

**Priority:** P0

**Acceptance Criteria:**
- [ ] System accepts all standard CV formats.
- [ ] Successful upload confirmation is provided.
- [ ] Platform extracts key data to populate the candidate's profile.

**Dependencies:** None

**Estimated Complexity:** Medium

### User Story 2: AI Profile Analysis
**Story:** As a candidate, I want the AI to analyze my CV so that my profile reflects my true capabilities.

**Priority:** P0

**Acceptance Criteria:**
- [ ] Profiles are automatically populated with accurate skills and experience.
- [ ] Candidates receive an analysis summary.
- [ ] Profiles are updated in real-time.

**Dependencies:** User Story 1

**Estimated Complexity:** Large

### User Story 3: Job Description Uploader
**Story:** As a client, I want to upload job descriptions so that I can find suitable candidates.

**Priority:** P1

**Acceptance Criteria:**
- [ ] System accepts various document formats.
- [ ] Job descriptions can be edited after upload.
- [ ] Confirmation provided post-upload.

**Dependencies:** None

**Estimated Complexity:** Medium

### User Story 4: AI Matchmaker
**Story:** As a client, I want the AI to match candidates to my job description so that I get the best fit for my needs.

**Priority:** P0

**Acceptance Criteria:**
- [ ] Matches are presented within 24 hours.
- [ ] At least 80% match accuracy based on skills and job requirements.
- [ ] Clients can rate match accuracy.

**Dependencies:** User Story 3

**Estimated Complexity:** Large

## Development Epics

### Epic 1: Candidate Profile Management
**Goal:** Enable candidates to create and manage their profiles through CV uploads and AI analysis.

**User Stories Included:** US-1, US-2

**Tasks:**

#### Task 1.1: Implement CV Uploader
**Description:** Build the feature allowing developers to upload CVs.

**Acceptance Criteria:**
- [ ] Handle file uploads securely.
- [ ] Validate file formats and sizes.
- [ ] Store CVs and generate file URLs.

**Dependencies:** None

**Estimated Effort:** 16 hours

#### Task 1.2: Develop AI Profile Analysis
**Description:** Integrate AI to analyze and populate candidate profiles.

**Acceptance Criteria:**
- [ ] Connect to AI service for CV parsing.
- [ ] Populate profile fields with extracted data.
- [ ] Provide feedback to candidates.

**Dependencies:** Task 1.1

**Estimated Effort:** 32 hours

### Epic 2: Job Posting and Matching
**Goal:** Allow clients to post jobs and receive matched candidates through AI.

**User Stories Included:** US-3, US-4

**Tasks:**

#### Task 2.1: Create Job Description Uploader
**Description:** Implement feature for clients to upload and manage job descriptions.

**Acceptance Criteria:**
- [ ] Support multiple formats (e.g., PDF, DOCX).
- [ ] Allow job description edits.
- [ ] Confirm successful uploads.

**Dependencies:** None

**Estimated Effort:** 16 hours

#### Task 2.2: Implement AI Matchmaker
**Description:** Develop AI matching logic to connect candidates with jobs.

**Acceptance Criteria:**
- [ ] Integrate AI service for matching.
- [ ] Display matched candidates to clients.
- [ ] Allow clients to provide feedback.

**Dependencies:** Task 2.1

**Estimated Effort:** 32 hours

### Epic 3: Technical Foundation
**Goal:** Establish the technical infrastructure needed to support feature development.

**Tasks:**
- Initialize Next.js 15 project and configure serverless deployment on Vercel.
- Enable pgvector extension on Neon; set up database schema and migrations with Drizzle ORM.
- Implement authentication with Clerk (candidate and client roles, webhook sync to local User table).
- Configure Vercel Blob for private CV file storage.
- Set up Inngest for background job processing.
- Configure TanStack Query for client-side polling.
- Set up basic error handling and logging.
- Validate Arabic CV parsing: run test CVs through Claude and confirm field extraction quality.

### Epic 4: Subscription & Billing
**Goal:** Gate client access behind a Stripe subscription and handle the full billing lifecycle.

**Tasks:**

#### Task 4.1: Stripe Checkout Integration
- Create subscription products and prices in Stripe dashboard.
- Implement Stripe Checkout session creation (Server Action).
- Redirect client to Checkout on sign-up; redirect back to dashboard on success.

#### Task 4.2: Stripe Webhook Handler
- Implement `POST /api/webhooks/stripe` to handle `subscription.created`, `subscription.updated`, `subscription.deleted`, `invoice.payment_failed`.
- Sync Subscription entity in DB on each event.

#### Task 4.3: Access Control Middleware
- Middleware that checks `Subscription.status === 'active'` before serving job matches and candidate profile pages.
- Non-subscribed clients see an upgrade prompt.

#### Task 4.4: Customer Portal
- Link to Stripe Customer Portal for subscription management and cancellation.

**Estimated Effort:** 24 hours

## Implementation Phases

> **Realistic timeline:** 8–10 weeks solo developer. 5–6 weeks with two developers. The AI pipeline (CV parsing, embedding, matching) requires significant prompt engineering time and should not be rushed.

### Phase 1: Foundation (Weeks 1–2)
**Epics:** Epic 3

**Key Deliverables:**
- Next.js 15 project with Clerk auth, Neon + pgvector, Drizzle schema, Vercel Blob, Inngest configured
- Arabic CV parsing spike: validate Claude extracts correct fields from a sample of Arabic/bilingual CVs
- Subscription-gating middleware (Stripe webhook handler + Subscription DB entity)

**Exit Criteria:**
- [ ] Full-stack dev environment running locally and on Vercel preview
- [ ] Arabic CV parsing produces accurate structured output for 5 sample CVs
- [ ] Stripe webhook syncs subscription state correctly in test mode

### Phase 2: Candidate Flow (Weeks 3–4)
**Epics:** Epic 1

**Key Deliverables:**
- CV upload → Inngest job → Claude analysis → CandidateProfile populated
- Candidate UI: upload screen, processing screen, profile review/edit screen, dashboard

**Exit Criteria:**
- [ ] End-to-end candidate flow works for PDF and DOCX, Arabic and English
- [ ] Profile fields accurately reflect CV content
- [ ] Candidate can edit any AI-populated field

### Phase 3: Client Flow + Matching (Weeks 5–7)
**Epics:** Epic 2, Epic 4

**Key Deliverables:**
- Stripe subscription checkout and customer portal
- Job description upload → Inngest job → embedding → pgvector retrieval → Claude re-ranking → Match records
- Client UI: dashboard, post job, match results, candidate view

**Exit Criteria:**
- [ ] Client can subscribe, post a job, and receive ranked matches
- [ ] Matches show explanation text generated by Claude
- [ ] Client can rate matches (1–5 stars) and record outcome

### Phase 4: Polish & Launch Prep (Weeks 8–10)
**Key Deliverables:**
- Rate limiting on CV upload and match triggering (Upstash Redis or DB counter)
- Error states and edge cases in UI
- Bug fixes and performance optimisation
- UAT with a small group of real candidates and clients

**Exit Criteria:**
- [ ] All features meet acceptance criteria
- [ ] Error rate < 5% on AI processing jobs
- [ ] Ready for UAT

## Testing Strategy

### Unit Testing
- Components: CV uploader, Job uploader, Matchmaker
- Framework: Jest and React Testing Library

### Integration Testing
- Test API endpoints and AI service interactions
- Verify critical user flows: profile creation, job posting, candidate matching

### User Acceptance Testing
- Conduct with a sample group of candidates and clients
- Success criteria: 80% satisfaction rate

## Deployment Plan

### Environments
- **Development:** Local setup with hot-reloading for rapid iteration
- **Staging:** Vercel staging environment for testing
- **Production:** Vercel production environment with CDN

### Deployment Process
1. Code review and testing in development
2. Deploy to staging and conduct UAT
3. Finalize and deploy to production

### Rollback Plan
- Use Vercel's instant rollback features for quick reversion to stable state

## Risk Assessment

### Technical Risks

- **Arabic CV parsing quality:** Claude may struggle with complex Arabic layouts, mixed RTL/LTR documents, or scanned PDFs.
  - *Mitigation:* Run an Arabic CV parsing spike in Phase 1 before building the full pipeline. Test 10+ sample CVs. If Claude underperforms, evaluate Mistral or GPT-4o for this specific task.

- **Embedding quality for Arabic:** Standard English embedding models produce poor Arabic similarity scores.
  - *Mitigation:* Use Voyage AI's `voyage-multilingual-2` model, which is optimised for multilingual (including Arabic). Validate match quality on sample data before launch.

- **AI cost overrun:** Uncontrolled CV uploads or match triggers could accumulate significant API costs.
  - *Mitigation:* Rate-limit CV uploads (3/day/user) and match triggers (1/job/24h). Set hard spend caps in Anthropic and Voyage AI dashboards. Monitor cost per operation from day one.

- **Inngest job failures:** Background jobs that fail silently leave users with stuck `processing` status indefinitely.
  - *Mitigation:* Implement Inngest retry config (3 retries with backoff) and a dead-letter notification. Set a maximum processing time of 2 minutes; jobs that exceed it fail with a user-visible error and allow re-trigger.

- **Data privacy (candidate PII):** CVs contain sensitive personal data including nationality, location, and career history.
  - *Mitigation:* CV files stored as private Vercel Blob objects (signed URLs, never public). Row-level access control: candidates can only access their own data; clients can only access profiles of visible candidates. No CV file is ever exposed directly to clients — only extracted profile fields.

- **Stripe webhook reliability:** Missing a `subscription.deleted` event leaves a client with free access.
  - *Mitigation:* Idempotent webhook handler; also poll Stripe on each client session start to verify subscription status.

## Success Metrics

### Feature Adoption
- Number of active candidate profiles
- Number of job postings by clients

### Technical Metrics
- API response time
- Error rate in AI processing

### User Satisfaction
- Feedback scores from candidates and clients
- Match success rate

---

**Implementation Principles:**
1. **Feature-First:** Work is organized around delivering complete user-facing features.
2. **Incremental Delivery:** Build and test features incrementally for continuous feedback.
3. **User-Centric:** Prioritize stories that deliver the most user value.
4. **Quality Bar:** Ensure each feature meets acceptance criteria before proceeding.
5. **Adaptability:** Be ready to adjust based on user feedback and technical discoveries.