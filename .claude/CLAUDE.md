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
confabulator/        # Project documentation (IMPORTANT - read these first)
├── PRD.md           # Product requirements and features
├── project-vision.md # Vision and problem statement
├── implementation-plan.md # Technical architecture and roadmap
├── wireframes.md    # UI/UX wireframes and screen flows
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

## Key Documentation

**CRITICAL**: Before starting any work, familiarize yourself with the Confabulator documentation in `confabulator/`:

| Document | Purpose | When to Reference |
|----------|---------|-------------------|
| `PRD.md` | Feature specs, user stories, acceptance criteria | Before implementing any feature |
| `project-vision.md` | Problem statement, target users, goals | For strategic decisions |
| `implementation-plan.md` | Architecture, tech stack, data model, API routes | Technical implementation |
| `wireframes.md` | UI layouts, screen flows, component placement | Building UI components |
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
3. Reference wireframes in `confabulator/wireframes.md` for UI guidance
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

## Current Focus

The MVP focuses on these core capabilities:

- CV uploader for the candidates
- AI analysis of the CV's to automatically fill out a candidate profile in the platform
- Job description uploader for the clients

See `confabulator/implementation-plan.md` for the complete development roadmap.

## Repository

https://github.com/Laura-concat/AI-Recruitment-Platform---Lisboa-vibes

---

*Generated by [Confabulator](https://vibecodelisboa.com/confabulator)*
