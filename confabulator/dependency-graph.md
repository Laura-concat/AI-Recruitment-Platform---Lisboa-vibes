# Dependency Graph

```mermaid
graph TD

  1[[#1: Candidate Profile Management]]
  2[#2: Implement CV Uploader]
  3[#3: Develop AI Profile Analysis]
  4[[#4: Job Posting and Matching]]
  5[#5: Create Job Description Uploader]
  6[#6: Implement AI Matchmaker]
  7[[#7: Technical Foundation]]

  7 -->|Models before services| 3
  7 -->|Models before services| 6
  7 -->|Setup before features| 2
  7 -->|Setup before features| 5

  classDef epicStyle fill:#e1f5ff,stroke:#01579b,stroke-width:2px
  classDef taskStyle fill:#fff3e0,stroke:#e65100,stroke-width:1px
  class 1,4,7 epicStyle
  class 2,3,5,6 taskStyle
```

## Legend
- **Double box**: Epic
- **Single box**: Task
- **Arrow direction**: Dependency flow (A → B means B depends on A)

## About This Diagram

This diagram shows the dependencies between epics and tasks in your project. Use it to understand the order in which work should be completed and merged.

- **Epics** (double boxes) represent major features or components
- **Tasks** (single boxes) are specific implementation work items
- **Arrows** show dependencies (A → B means B depends on A completing first)

For parallel development using git worktrees, run:
```bash
./confabulator/setup-worktrees.sh
```
