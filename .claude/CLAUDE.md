# Recruitment AI Tool

I want to build a recruitment platform for refugee and female developers in the MENA region. They can apply on the application with their cv's and they get ranked by their skillsets and experience level and have to create a profile with their experience etc. Then there is a client portal where clients can pay a membership fee for access to the platform and developer talent, they can upload their own job descriptions to the platform and get automatically matched through AI to the best / most relevant developers on the platform.

## Quick Reference

### Bash Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
npm run test         # Run tests

# Database (if applicable)
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
```

### Project Structure
```
mocks/               # UI DESIGN SOURCE OF TRUTH (read these before building any UI)
├── 01-landing-page.png
├── 02-sign-up-role-selection.png
├── 03-login.png
├── 04-candidate-cv-upload.png
├── 05-ai-analysis-processing.png
├── 06-candidate-profile.png
├── 07-candidate-dashboard.png
├── 08-client-dashboard.png
├── 09-client-post-job.png
├── 10-client-match-results.png
├── 11-client-candidate-view.png
└── 12-pricing-page.png
confabulator/        # Project documentation
├── PRD.md           # Product requirements and features
├── project-vision.md # Vision and problem statement
├── implementation-plan.md # Technical architecture and roadmap
├── wireframes.md    # UI/UX wireframes (superseded by mocks/)
├── business-model-canvas.md # Business model
└── PR-FAQ.md        # Press release and FAQ
src/                 # Source code
├── app/             # Next.js app router (if applicable)
├── components/      # UI components
├── lib/             # Utility functions and services
└── types/           # TypeScript types
```

## Project Context

### Target Customer
A SME or MME in the MENA region or the gulf, or even Europe who is looking for a developer, CTO, project/product manager. Probably not for the big corporates in the world but definitely start-ups, sme's or mme's. Also arab speaking companies that have a cto whos from the arab region, as all of the developers on the platform will be arab speakers. So ideal customer is a CTO or head of HR in a start-up or SME based in the Gulf or MENA region, aged 25-50. Using Linkedin previously to network and headhunt and now looking for a more specific way to headhunt the best talent in the region.

### Value Proposition
Because it will be very personalised, the talent on there will be the best of the best and the AI matching tool will be very accurate to make sure they are getting access to the best talent. Also I am known the field for having access to top talent already. Also hundreds of people always access me for arabic speaking developers. This will be the best solution because we won't have hundreds of thousands of developers to choose from on the platform, we will just have the right amount of profiles so each company can test 2 or 3 profiles to save the companies time.

### Platform
both

## Tech Stack

TypeScript, JavaScript, Next.js, React, Shadcn, Tailwind, shadcn/ui, Radix UI, React Hook Form, Zod, Drizzle, Nextauth, Clerk, Vercel, DrizzleORM, Stripe, NextAuth.js, Postgresql

## UI Design Source of Truth

**CRITICAL**: The `mocks/` directory contains the authoritative screen designs for all user-facing front-end work. These are exported from Frame0 and must be used as the reference for layout, spacing, components, copy, and visual hierarchy when building any UI.

| Screen | File | Route |
|--------|------|-------|
| Landing Page | `mocks/01-landing-page.png` | `/` |
| Sign Up Role Selection | `mocks/02-sign-up-role-selection.png` | `/sign-up` |
| Login | `mocks/03-login.png` | `/login` |
| Candidate CV Upload | `mocks/04-candidate-cv-upload.png` | `/onboarding/upload` |
| AI Analysis Processing | `mocks/05-ai-analysis-processing.png` | `/onboarding/analysing` |
| Candidate Profile | `mocks/06-candidate-profile.png` | `/profile` |
| Candidate Dashboard | `mocks/07-candidate-dashboard.png` | `/dashboard` (candidate) |
| Client Dashboard | `mocks/08-client-dashboard.png` | `/dashboard` (client) |
| Client Post Job | `mocks/09-client-post-job.png` | `/jobs/new` |
| Client Match Results | `mocks/10-client-match-results.png` | `/jobs/[id]/matches` |
| Client Candidate View | `mocks/11-client-candidate-view.png` | `/candidates/[id]` |
| Pricing Page | `mocks/12-pricing-page.png` | `/pricing` |

When building any front-end screen:
1. **Open the corresponding mock** in `mocks/` first
2. Match the layout, components, colours, and copy exactly
3. `confabulator/wireframes.md` is superseded by `mocks/` — use `mocks/` for all UI decisions

## Key Documentation

**CRITICAL**: Before starting any work, familiarize yourself with the Confabulator documentation in `confabulator/`:

| Document | Purpose | When to Reference |
|----------|---------|-------------------|
| `PRD.md` | Feature specs, user stories, acceptance criteria | Before implementing any feature |
| `project-vision.md` | Problem statement, target users, goals | For strategic decisions |
| `implementation-plan.md` | Architecture, tech stack, data model, API routes | Technical implementation |
| `wireframes.md` | UI layouts (superseded by `mocks/`) | Legacy reference only |
| `business-model-canvas.md` | Revenue, costs, partnerships | Business logic decisions |

## Development Guidelines

### Code Style
- Use TypeScript for all code; prefer interfaces over types
- Use functional and declarative programming patterns
- Use descriptive variable names with auxiliary verbs (isLoading, hasAccess, canSubmit)
- Use lowercase-with-dashes for directories (components/user-profile)
- Favor named exports for components and utilities

### Before Implementing Features
1. Read the relevant user story in `confabulator/implementation-plan.md`
2. Check acceptance criteria in `confabulator/PRD.md`
3. **Open the corresponding mock in `mocks/`** — this is the source of truth for all UI
4. Follow the data model and API routes in the implementation plan

### Error Handling
- Implement comprehensive error handling at all levels
- Use try-catch blocks for async operations
- Provide user-friendly error messages
- Log errors appropriately for debugging

## Ralph Wiggum Build System

This project uses the Ralph Wiggum autonomous build loop for processing GitHub issues.

### Commands

| Command | Purpose |
|---------|---------|
| `/ralphify <issue>` | Generate Ralph files for a single issue |
| `/ralph-cleanup` | Archive completed session and close issue |
| `/ralph-orchestrate` | Process multiple issues automatically |

### Issue Convention for Orchestration

For issues to work with `/ralph-orchestrate`:

1. **Label**: Add `ralph:ready` label to issues ready for processing
2. **Dependencies**: Declare explicitly in issue body:
   ```
   depends-on: #42
   ```
3. **Content**: Include clear acceptance criteria or checklist items

### Orchestration Labels

| Label | Purpose |
|-------|---------|
| `ralph:ready` | Ready for orchestration |
| `ralph:queued` | In the orchestration queue |
| `ralph:in-progress` | Currently being processed |
| `ralph:complete` | Successfully processed (PR created) |
| `ralph:failed` | Processing failed, needs intervention |

### Workflow

1. Label issues with `ralph:ready`
2. Run `/ralph-orchestrate` (or `--dry-run` to preview)
3. Run the generated script: `./.ralph/ralph-orchestrate.sh`
4. Script creates feature branches and PRs for each issue (with fresh Claude sessions)
5. Review and merge PRs

**Note:** The orchestrator uses a two-phase approach to avoid context degradation:
- Phase 1: `/ralph-orchestrate` triages issues and generates an execution script
- Phase 2: The bash script invokes fresh Claude sessions per issue

## Database Environments

**IMPORTANT: Default to the local/dev database at all times. Only interact with the production database when explicitly asked.**

| Environment | Database | Location |
|-------------|----------|----------|
| **Local development** | Neon (dev) | `DATABASE_URL` in `talentbridge-app/.env.local` |
| **Production** | Neon (`talentbridge-production` project) | `DATABASE_URL` on Vercel — eu-west-2 |

### Rules
- All local work, testing, and migrations use the **dev database** in `.env.local`
- The **production database** is only touched when deploying or explicitly asked to interact with production data
- Never run destructive queries (DELETE, DROP, TRUNCATE) on production without explicit confirmation
- To run migrations on production: use the `neon()` client with the production connection string, not `sql.unsafe()` — use template literals which commit correctly

## Deployment

- **Frontend**: Vercel — https://talentbridge-app-alpha.vercel.app
- **Production DB**: Neon `talentbridge-production` project (eu-west-2)
- **Deploy command**: `vercel --prod --yes` from `talentbridge-app/`
- All env vars are set on Vercel (12 variables including Clerk, Neon, Blob, Stripe, Anthropic, Voyage, Inngest)

## Current Focus

The MVP is live at https://talentbridge-app-alpha.vercel.app. Core features built:
- CV upload + local skill/experience parsing
- Candidate profile with AI-extracted data
- Client dashboard with job posting and skill-based candidate matching
- In-app notifications + intro request flow with email (Resend)
- Admin page at `/admin` for laura@concat.tech

Remaining to fully activate in production:
1. Clerk — add production domain to allowed URLs
2. Stripe — add price IDs + register webhook
3. Resend — add `RESEND_API_KEY` to Vercel for emails
4. Inngest — register app for AI CV analysis + matching pipelines
5. Custom domain (optional)

See `confabulator/implementation-plan.md` for the complete development roadmap.

## Repository

https://github.com/Laura-concat/AI-Recruitment-Platform---Lisboa-vibes

---

*Generated by [Confabulator](https://vibecodelisboa.com/confabulator)*
