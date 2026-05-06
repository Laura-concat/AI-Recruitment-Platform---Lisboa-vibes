#!/bin/bash
#
# Git Worktree Setup Script
# Project: Recruitment AI Tool
# Repository: https://github.com/Laura-concat/AI-Recruitment-Platform---Lisboa-vibes
# Generated: 2026-05-06T09:41:21.530Z
#
# This script creates separate git worktrees for each task and epic,
# enabling parallel development without branch conflicts.
#

set -e  # Exit on error

echo "🌳 Setting up git worktrees for parallel development..."
echo ""

# ================================================
# EPICS
# ================================================

# Epic #1: Candidate Profile Management
# ✅ No dependencies - can start immediately
echo "Creating worktree for Epic #1..."
git worktree add ../epic-1-worktree -b epic/1-candidate-profile-management 2>/dev/null || echo "  Worktree already exists"

# Epic #4: Job Posting and Matching
# ✅ No dependencies - can start immediately
echo "Creating worktree for Epic #4..."
git worktree add ../epic-4-worktree -b epic/4-job-posting-and-matching 2>/dev/null || echo "  Worktree already exists"

# Epic #7: Technical Foundation
# ✅ No dependencies - can start immediately
echo "Creating worktree for Epic #7..."
git worktree add ../epic-7-worktree -b epic/7-technical-foundation 2>/dev/null || echo "  Worktree already exists"

# ================================================
# TASKS
# ================================================

# Task #2: Implement CV Uploader
# ⚠️  Dependencies: #7
echo "Creating worktree for Task #2..."
git worktree add ../task-2-worktree -b task/2-implement-cv-uploader 2>/dev/null || echo "  Worktree already exists"

# Task #3: Develop AI Profile Analysis
# ⚠️  Dependencies: #7
echo "Creating worktree for Task #3..."
git worktree add ../task-3-worktree -b task/3-develop-ai-profile-analysis 2>/dev/null || echo "  Worktree already exists"

# Task #5: Create Job Description Uploader
# ⚠️  Dependencies: #7
echo "Creating worktree for Task #5..."
git worktree add ../task-5-worktree -b task/5-create-job-description-uploader 2>/dev/null || echo "  Worktree already exists"

# Task #6: Implement AI Matchmaker
# ⚠️  Dependencies: #7
echo "Creating worktree for Task #6..."
git worktree add ../task-6-worktree -b task/6-implement-ai-matchmaker 2>/dev/null || echo "  Worktree already exists"

echo ""
echo "✅ Worktree setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. View all worktrees: git worktree list"
echo "2. Check dependencies: ./confabulator/worktree-status.sh"
echo "3. Start working: cd <worktree-directory>"
echo ""
echo "🔀 Recommended merge order (dependencies first):"
echo "  1. #1 - Candidate Profile Management"
echo "  2. #2 - Implement CV Uploader"
echo "  3. #3 - Develop AI Profile Analysis"
echo "  4. #4 - Job Posting and Matching"
echo "  5. #5 - Create Job Description Uploader"
echo "  6. #6 - Implement AI Matchmaker"
echo ""
echo "To cleanup all worktrees: ./confabulator/cleanup-worktrees.sh"
