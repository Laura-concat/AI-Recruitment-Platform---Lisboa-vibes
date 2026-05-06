#!/bin/bash
#
# Git Worktree Status Script
# Project: Recruitment AI Tool
# Generated: 2026-05-06T09:41:21.530Z
#
# Shows the status of all worktrees and their dependencies.
#

echo "📊 Worktree Status - Recruitment AI Tool"
echo "="
echo ""

echo "📂 Active Worktrees:"
git worktree list
echo ""

echo "🔗 Dependency Summary:"
echo ""
echo "Epics:"
echo "  ✅ #1 - Candidate Profile Management (no dependencies)"
echo "  ✅ #4 - Job Posting and Matching (no dependencies)"
echo "  ✅ #7 - Technical Foundation (no dependencies)"
echo ""
echo "Tasks:"
echo "  ⚠️  #2 - Implement CV Uploader (depends on: #7)"
echo "  ⚠️  #3 - Develop AI Profile Analysis (depends on: #7)"
echo "  ⚠️  #5 - Create Job Description Uploader (depends on: #7)"
echo "  ⚠️  #6 - Implement AI Matchmaker (depends on: #7)"
echo ""
echo "🔀 Recommended Merge Order:"
echo "  1. 📦 #1 - Candidate Profile Management"
echo "  2. 📝 #2 - Implement CV Uploader"
echo "  3. 📝 #3 - Develop AI Profile Analysis"
echo "  4. 📦 #4 - Job Posting and Matching"
echo "  5. 📝 #5 - Create Job Description Uploader"
echo "  6. 📝 #6 - Implement AI Matchmaker"
echo ""
echo "💡 Tips:"
echo "  - Work on tasks with no dependencies first"
echo "  - Merge branches in the order shown above"
echo "  - Check GitHub issues for detailed requirements"
echo ""