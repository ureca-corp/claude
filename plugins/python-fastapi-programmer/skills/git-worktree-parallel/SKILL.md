---
name: python-fastapi-programmer:git-worktree-parallel
description: Git Worktree patterns for parallel domain development with isolated workspaces. Use when implementing multiple domains in parallel using Topological Sort, team-based execution, and worktree-based code isolation to prevent conflicts.
---

# Git Worktree Parallel Execution

## Pattern

1. Create worktree per domain (.worktrees/{domain}/)
2. Teams work in isolation
3. Merge to main when complete
4. Clean up worktrees

## Workflow

See [worktree-workflow.md](references/worktree-workflow.md) for complete guide.

## Quick Commands

```bash
# Create worktree
git worktree add .worktrees/users -b users-dev

# Work in worktree
cd .worktrees/users
git commit -m "feat: users domain"

# Merge to main
git checkout main
git merge --no-ff users-dev

# Clean up
git worktree remove .worktrees/users
git branch -d users-dev
```

## Benefits

- ✅ Complete code isolation
- ✅ No conflicts between domains
- ✅ Parallel commits
- ✅ Clear Git history
