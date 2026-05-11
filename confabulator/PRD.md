# Product Requirements Document

## Document Information
- Product Name: Recruitment AI Tool
- Version: 1.1
- Last Updated: 2026-05-11
- Status: Draft

## Product Overview

The Recruitment AI Tool is a specialized recruitment platform aimed at empowering refugee and female developers in the MENA region. It facilitates a streamlined hiring process by leveraging AI to match developers with potential employers, primarily targeting SMEs and MMEs in the Gulf, MENA, and European regions. 

This platform addresses the saturation and inefficiency of the current recruitment market, where platforms like LinkedIn fail to filter candidates effectively. By focusing on a curated pool of top-tier Arab-speaking developers, this tool promises precise matchmaking, thus saving companies time and resources while ensuring high-quality hires. This initiative is pivotal for both the developers seeking opportunities and the companies in need of skilled, culturally aligned talent.

## Objectives & Success Metrics

### Primary Objectives
1. Establish a platform that accurately matches candidates with job opportunities using AI-driven analytics.
2. Build a community of skilled refugee and female developers in the MENA region.
3. Achieve a user-friendly experience for both developers and hiring companies.

### Key Performance Indicators (KPIs)
- 500 active candidates on the platform.
- At least 150 companies registered and actively hiring.
- 1,500 total application downloads.
- Match success rate of over 80% for job placements.

### Success Criteria for MVP Launch
- Successful onboarding of at least 200 candidates and 50 clients.
- Positive feedback from users with a satisfaction rate of 80% or higher.
- Minimum of 50 job placements within the first three months.

## User Personas

### Persona 1: Ahmed - CTO at a Medium-Sized Enterprise
- **Demographics and Background**: 38 years old, based in Dubai, fluent in Arabic and English, responsible for hiring technical teams.
- **Goals and Motivations**: Wants to find skilled developers quickly and efficiently, prefers candidates with cultural and linguistic alignment.
- **Pain Points and Frustrations**: Overwhelmed by the number of unqualified applicants on traditional platforms, lacks time to sift through resumes.
- **Success Scenario with the Product**: Ahmed uses the platform to quickly find a shortlist of qualified Arab-speaking developers, hires the right talent in less than a month.

### Persona 2: Leila - Refugee Developer
- **Demographics and Background**: 28 years old, originally from Syria, currently residing in Lebanon, experienced in software development.
- **Goals and Motivations**: Seeks stable employment opportunities, desires a platform that recognizes her skills and connects her with suitable employers.
- **Pain Points and Frustrations**: Finds it challenging to stand out in saturated markets, often faces language and cultural barriers.
- **Success Scenario with the Product**: Leila uploads her CV, gets matched with a job that suits her skills and aspirations, and starts working remotely for a tech company in the Gulf.

## Core Features

### Feature 1: CV Uploader
- **Description**: Allows candidates to upload their resumes for profiling.
- **User Story**: "As a developer, I want to upload my CV so that I can create an accurate profile for potential employers to view."
- **Acceptance Criteria**:
  1. The system accepts PDF and DOCX formats (validated by file type, not just extension).
  2. Upload is rejected immediately if the file is not a valid PDF or DOCX.
  3. Successful upload confirmation is provided immediately; processing begins in the background.
  4. Arabic, English, and bilingual CVs are all supported.
  5. Candidates may upload a maximum of 3 CVs per day (rate-limited to control AI costs).
- **Priority**: P0

### Feature 2: AI Profile Analysis
- **Description**: Analyzes uploaded CVs using Claude API to populate a structured candidate profile.
- **User Story**: "As a candidate, I want the AI to analyze my CV so that my profile reflects my true capabilities."
- **Acceptance Criteria**:
  1. Profiles are automatically populated with: skills, experience years, seniority level, work history, education, and languages.
  2. A live progress indicator is shown during processing (typically 15–45 seconds).
  3. Candidates receive an analysis summary once processing completes.
  4. Candidates can edit any field the AI populated.
- **Priority**: P0

### Feature 3: Job Description Uploader
- **Description**: Allows clients with an active subscription to upload job descriptions.
- **User Story**: "As a client, I want to upload job descriptions so that I can find suitable candidates."
- **Acceptance Criteria**:
  1. The system accepts PDF, DOCX, and plain text input.
  2. Job descriptions can be edited after upload.
  3. Confirmation provided post-upload.
  4. Only clients with an active subscription can post jobs.
- **Priority**: P1

### Feature 4: AI Matchmaker
- **Description**: Matches the most relevant candidates to job postings using a two-stage AI pipeline (embedding similarity + Claude re-ranking).
- **User Story**: "As a client, I want the AI to match candidates to my job description so that I get the best fit for my needs."
- **Acceptance Criteria**:
  1. Matching begins automatically when a job is posted; results are typically available within minutes, guaranteed within 2 hours.
  2. Only candidate profiles marked as visible are included in matching.
  3. At least 80% match accuracy based on skills and job requirements (measured via client outcome feedback).
  4. Clients can rate each match (1–5 stars) and mark outcome (shortlisted / interviewing / hired / rejected).
  5. Matching is rate-limited to 1 trigger per job per 24 hours.
- **Priority**: P0

### Feature 5: Subscription & Access Control
- **Description**: Stripe-powered subscription billing for client access to the platform.
- **User Story**: "As a client, I want to pay for a membership so that I can access candidate profiles and job matching."
- **Acceptance Criteria**:
  1. Clients can subscribe via a Stripe Checkout flow.
  2. Clients can manage or cancel their subscription via a Stripe Customer Portal link.
  3. Access to match results and candidate profiles is gated behind an active subscription.
  4. Subscription status updates in real-time via Stripe webhooks.
- **Priority**: P0

## User Flows

### User Flow: Candidate CV Upload and Profile Creation
1. **Entry Point**: Candidate logs into the platform.
2. **Steps**:
   - Navigate to the profile section.
   - Upload CV.
   - Confirm successful upload.
   - Review auto-generated profile.
3. **Exit Point**: Candidate profile is complete and saved.

### User Flow: Client Job Description Upload and Matchmaking
1. **Entry Point**: Client logs into the platform.
2. **Steps**:
   - Navigate to the job posting section.
   - Upload job description.
   - Confirm successful upload.
   - View AI-generated candidate matches.
3. **Exit Point**: Client receives a shortlist of qualified candidates.

## Technical Considerations

- **Platform Requirements**: Responsive web application, accessible on desktop and mobile browsers.
- **Authentication**: Clerk (managed auth) with Google OAuth and magic-link email sign-in.
- **AI Processing**: All Claude API calls are asynchronous background jobs (Inngest); the UI shows live status while processing. No synchronous LLM calls on API routes.
- **Matching Architecture**: Two-stage pipeline — Voyage AI multilingual embeddings for initial candidate retrieval via pgvector similarity search, followed by Claude re-ranking with match explanation.
- **Payments**: Stripe subscription billing. Client access to match results and candidate profiles is gated behind an active subscription.
- **File Handling**: CVs stored in Vercel Blob as private objects; accessed via signed URLs only.
- **Arabic Language Support**: The platform must correctly parse and process Arabic, English, and bilingual CVs. Voyage AI's multilingual embedding model is used specifically for Arabic/English support.
- **Scalability**: Serverless deployment on Vercel; Neon auto-scales PostgreSQL. At 500 candidates and 150 companies, no additional infrastructure is needed.
- **Performance**: Matching results typically available within minutes of job posting. CV analysis typically completes within 45 seconds.

## Success Criteria

### MVP Completion Criteria
- All core features implemented and tested.
- User feedback loop established for continuous improvement.
- Initial marketing campaign executed to onboard early adopters.

### Launch Readiness Checklist
- Comprehensive testing completed with no critical bugs.
- User documentation and support resources available.
- Marketing and sales teams briefed on product features and benefits.

### Key Metrics to Track Post-Launch
- User retention rate.
- Matchmaking accuracy and success rate.
- Customer satisfaction scores.

## Out of Scope (for MVP)
- Advanced analytics dashboard for clients.
- Multi-language UI support beyond English (Arabic UI is post-MVP; Arabic CV *content* is in-scope).
- Integration with external HR management systems.
- Integration with job boards (LinkedIn, Indeed, etc.) — out of scope entirely for v1.
- Mobile native apps (iOS/Android).

---

This PRD provides a comprehensive guideline to develop the Recruitment AI Tool, focusing on solving core user problems and delivering measurable success in the recruitment process.