#!/bin/bash
#
# Git Worktree Cleanup Script
# Project: Recruitment AI Tool
# Generated: 2026-05-06T09:41:21.530Z
#
# This script removes all worktrees created by the setup script.
#

set -e  # Exit on error

echo "🧹 Cleaning up git worktrees..."
echo ""

# Confirm before proceeding
read -p "This will remove all worktrees. Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cleanup cancelled."
  exit 0
fi

echo "Removing worktree: ../epic-1-worktree..."
git worktree remove ../epic-1-worktree --force 2>/dev/null || echo "  Worktree not found or already removed"
echo "Removing worktree: ../task-2-worktree..."
git worktree remove ../task-2-worktree --force 2>/dev/null || echo "  Worktree not found or already removed"
echo "Removing worktree: ../task-3-worktree..."
git worktree remove ../task-3-worktree --force 2>/dev/null || echo "  Worktree not found or already removed"
echo "Removing worktree: ../epic-4-worktree..."
git worktree remove ../epic-4-worktree --force 2>/dev/null || echo "  Worktree not found or already removed"
echo "Removing worktree: ../task-5-worktree..."
git worktree remove ../task-5-worktree --force 2>/dev/null || echo "  Worktree not found or already removed"
echo "Removing worktree: ../task-6-worktree..."
git worktree remove ../task-6-worktree --force 2>/dev/null || echo "  Worktree not found or already removed"
echo "Removing worktree: ../epic-7-worktree..."
git worktree remove ../epic-7-worktree --force 2>/dev/null || echo "  Worktree not found or already removed"

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "To recreate worktrees: ./confabulator/setup-worktrees.sh"
