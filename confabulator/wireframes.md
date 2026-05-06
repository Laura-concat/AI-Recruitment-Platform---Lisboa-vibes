# Wireframes: Recruitment AI Tool

## Overview & User Story Mapping

**Design Approach:** This design prioritizes accessibility and efficiency, targeting refugee and female developers in the MENA region, ensuring an intuitive and inclusive user experience.

**User Story → Screen Mapping:**
- US-1: CV Uploader → [CV Upload Screen]
- US-2: AI Profile Analysis → [Profile Analysis Screen]
- US-3: Job Description Uploader → [Job Upload Screen]
- US-4: AI Matchmaker → [Matchmaking Screen]

## Screen Flow Diagram

Show the high-level navigation flow between screens:
```
[Home] → [CV Upload] → [Profile Analysis] → [Dashboard]
   ↓          ↓
[Login]  [Job Upload] → [Matchmaking]
```

## ASCII Wireframes

### 1. Landing/Home Screen
**User Stories Enabled:** [US-1, US-2]

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]     <Home> <Features> <Pricing>      [Sign In]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              Connect with Opportunities                     │
│           Empowering MENA Developers through AI             │
│                                                             │
│              [Get Started Free →]  <Learn More>            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Feature 1         Feature 2         Feature 3             │
│  Icon/Image        Icon/Image        Icon/Image            │
│  Description       Description       Description           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Footer: <About> | <Contact> | <Terms> | <Privacy>        │
└─────────────────────────────────────────────────────────────┘

        ↓ User clicks [Get Started Free]
```

### 2. Authentication Screen (Enables US-X)

```
┌──────────────────────────────────────┐
│           [Logo]                     │
│                                      │
│        Sign Up / Log In              │
│                                      │
│  {Email................}             │
│  {Password.............}             │
│  [ ] Remember me                     │
│                                      │
│  [Log In / Sign Up →]                │
│                                      │
│  ─────────── OR ───────────          │
│                                      │
│  [Continue with Google]              │
│  [Continue with GitHub]              │
│                                      │
│  <Forgot password?>                  │
│  <Need an account? Sign up>          │
│                                      │
└──────────────────────────────────────┘

        ↓ After successful auth
```

### 3. CV Upload Screen (Enables US-1)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Profile> <Jobs>    [User ▼]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│            Upload Your CV to Get Started                    │
│                                                             │
│  {Choose File.............}  [Upload CV]                   │
│                                                             │
│  Supported formats: PDF, DOCX                               │
│                                                             │
│  <View Sample CV Format>                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ User uploads CV
```

### 4. Profile Analysis Screen (Enables US-2)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Profile> <Jobs>    [User ▼]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│               Profile Analysis Complete                     │
│                                                             │
│  Skills Extracted:                                          │
│  - Skill 1                                                  │
│  - Skill 2                                                  │
│  - Skill 3                                                  │
│                                                             │
│  [View Detailed Profile →]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ User views detailed profile
```

### 5. Job Upload Screen (Enables US-3)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Profile> <Jobs>    [User ▼]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Upload Job Description to Find Candidates                  │
│                                                             │
│  {Job Title..............}                                  │
│  {Job Description...............}                           │
│  {Requirements.................}                            │
│  [Upload Job Description]                                    │
│                                                             │
│  Supported formats: PDF, DOCX                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ User uploads job description
```

### 6. Matchmaking Screen (Enables US-4)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Profile> <Jobs>    [User ▼]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AI-Generated Candidate Matches                             │
│                                                             │
│  ┌───────────────────────────────┐                         │
│  │ Candidate 1                   │  [View Profile]        │
│  │ Match Score: 85%              │                         │
│  └───────────────────────────────┘                         │
│  ┌───────────────────────────────┐                         │
│  │ Candidate 2                   │  [View Profile]        │
│  │ Match Score: 88%              │                         │
│  └───────────────────────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ Client selects candidate
```

## Mobile Responsive Variations

### Landing Page (Mobile)

```
┌─────────────────────┐
│  [☰]   Logo  [User] │
├─────────────────────┤
│                     │
│    Connect with     │
│    Opportunities    │
│                     │
│  [Get Started]      │
│  <Learn More>       │
│                     │
│  ┌───────────────┐  │
│  │   Feature 1   │  │
│  │   Icon + Text │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │   Feature 2   │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │   Feature 3   │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

## Interactive States

### Button States
```
[Normal Button]  [Hover: underline]  [Disabled: gray]  [Loading: spinner]
```

### Form Validation
```
{Valid Input✓}   {Invalid Input✗ Error message}
```

## Design System Quick Reference

- **Primary Action:** [Button] style
- **Secondary Action:** <Link> style
- **Input Fields:** {Field Name..........} style
- **Dropdowns:** (Select Option ▼) style
- **Navigation:** Top bar or sidebar with <Links>
- **Cards:** Boxes with ┌─┐└┘ characters

---

**REMEMBER:** Generate VISUAL ASCII wireframes with boxes and layout diagrams, NOT textual descriptions. Every screen must be drawn using ASCII art.