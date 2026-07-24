---
name: Git Worktree Management
description: This skill should be used when working with "git worktree", "parallel git branches", "worktree merge", "isolated development", or managing multiple branches simultaneously for team-based code generation.
version: 0.1.0
---

# Git Worktree Management

Provides patterns for using git worktree to enable parallel development by multiple agents working on independent branches without conflicts.

## Purpose

Enable safe parallel code generation by:
- Creating isolated worktrees for each domain/feature
- Managing concurrent development without file conflicts
- Merging completed work back to main branch
- Cleaning up worktrees after integration

## When to Use

Load this skill when:
- Creating worktrees for parallel agent work
- Merging worktree branches back to main
- Cleaning up after team-based code generation
- Managing branch conflicts
- Working with temporary development branches

## Worktree Workflow Overview

### Standard Pattern

```bash
# 1. Create worktree for domain
git worktree add ../project-auth feature/auth-domain

# 2. Work in isolated directory
cd ../project-auth
# ... make changes ...

# 3. Commit in worktree
git add .
git commit -m "feat(auth): implement auth domain"

# 4. Switch back to main and merge
cd ../project
git merge --no-ff feature/auth-domain

# 5. Remove worktree
git worktree remove ../project-auth
git branch -d feature/auth-domain
```

## Creating Worktrees

### For Domain Implementation

```bash
# Pattern: ../project-{domain}
# Branch: feature/{domain}-domain

# Auth domain
git worktree add -b feature/auth-domain ../project-auth

# Post domain
git worktree add -b feature/post-domain ../project-post

# Chat domain
git worktree add -b feature/chat-domain ../project-chat
```

### For UI Implementation

```bash
# Pattern: ../project-ui-{screen}
# Branch: feature/ui-{screen}

# Login screen
git worktree add -b feature/ui-login ../project-ui-login

# Home screen
git worktree add -b feature/ui-home ../project-ui-home
```

### Naming Conventions

**Branch prefix:** `feature/`
**Branch format:** `feature/{domain}-domain` or `feature/ui-{screen}`
**Worktree directory:** `../{project}-{domain}` or `../{project}-ui-{screen}`

## Working in Worktrees

### Teammate Workflow

Each teammate works in its own worktree:

```bash
# Teammate receives worktree path
WORKTREE_PATH="../project-auth"

# Navigate to worktree
cd $WORKTREE_PATH

# Verify branch
git branch  # Should show feature/auth-domain

# Make changes
# ... create models, services ...

# Stage and commit
git add lib/apps/domain/auth/
git commit -m "feat(auth): add UserModel and AuthService

Co-Authored-By: auth-implementer <agent@flutter-ddd-builder>
"

# Return to main project (orchestrator will merge)
cd -
```

### Orchestrator Workflow

Orchestrator creates worktrees and assigns to teammates:

```bash
# Create worktree for each domain
for domain in auth post chat; do
  git worktree add -b feature/${domain}-domain ../${PROJECT_NAME}-${domain}
done

# Spawn teammates with worktree paths
# Each teammate works in assigned worktree

# After all teammates complete, merge each branch
for domain in auth post chat; do
  git merge --no-ff feature/${domain}-domain
done

# Cleanup worktrees
for domain in auth post chat; do
  git worktree remove ../${PROJECT_NAME}-${domain}
  git branch -d feature/${domain}-domain
done
```

## Merging Strategies

### No-FF Merge (Recommended)

Preserves branch history with merge commit:

```bash
git merge --no-ff feature/auth-domain -m "Merge auth domain implementation

- UserModel with Freezed
- AuthService with Riverpod
- API client integration
"
```

**Benefits:**
- Clear history of what was integrated
- Easy to identify changes per domain
- Can revert entire domain if needed

### Squash Merge

Combines all commits into one:

```bash
git merge --squash feature/auth-domain
git commit -m "feat(auth): implement auth domain

- UserModel with Freezed
- AuthService with Riverpod
- API client integration
"
```

**Benefits:**
- Clean linear history
- Single commit per domain
- Smaller git log

### Fast-Forward Merge

Only when no divergence:

```bash
git merge --ff-only feature/auth-domain
```

**Use when:**
- No commits on main since branch creation
- Want linear history
- Branch is up-to-date

## Conflict Resolution

### Automatic Resolution (Ours Strategy)

When multiple domains modify same files:

```bash
# Attempt automatic resolution
git merge feature/auth-domain

# If conflict occurs
git checkout --ours conflicted-file.dart  # Keep main version
# OR
git checkout --theirs conflicted-file.dart  # Keep branch version

git add conflicted-file.dart
git commit -m "Merge auth domain (resolved conflicts)"
```

### Manual Resolution

For complex conflicts:

```bash
# Merge and identify conflicts
git merge feature/auth-domain
git status  # Shows conflicted files

# Edit files to resolve
# Look for <<<<<<< HEAD markers
vim lib/apps/ui/router/routes.dart

# After resolution
git add lib/apps/ui/router/routes.dart
git commit -m "Merge auth domain (manual conflict resolution)"
```

## Cleanup

### Remove Worktree

```bash
# Remove worktree directory
git worktree remove ../project-auth

# Delete branch (if merged)
git branch -d feature/auth-domain

# Force delete (if not merged)
git branch -D feature/auth-domain
```

### Cleanup All Worktrees

```bash
# List all worktrees
git worktree list

# Remove each
git worktree remove ../project-auth
git worktree remove ../project-post
git worktree remove ../project-chat

# Delete branches
git branch -d feature/auth-domain
git branch -d feature/post-domain
git branch -d feature/chat-domain
```

### Prune Stale Worktrees

```bash
# Remove worktrees that no longer exist
git worktree prune
```

## Common Patterns

### Parallel Domain Implementation

```bash
# Orchestrator creates 3 worktrees
git worktree add -b feature/auth-domain ../project-auth
git worktree add -b feature/post-domain ../project-post
git worktree add -b feature/chat-domain ../project-chat

# 3 teammates work concurrently
# teammate-1: cd ../project-auth && ...
# teammate-2: cd ../project-post && ...
# teammate-3: cd ../project-chat && ...

# Orchestrator merges sequentially
cd project
git merge --no-ff feature/auth-domain
git merge --no-ff feature/post-domain
git merge --no-ff feature/chat-domain

# Orchestrator cleanups
git worktree remove ../project-auth && git branch -d feature/auth-domain
git worktree remove ../project-post && git branch -d feature/post-domain
git worktree remove ../project-chat && git branch -d feature/chat-domain
```

### UI Screen Implementation

```bash
# Similar pattern for UI screens
git worktree add -b feature/ui-login ../project-ui-login
git worktree add -b feature/ui-home ../project-ui-home
git worktree add -b feature/ui-profile ../project-ui-profile

# Work, merge, cleanup (same as above)
```

## Error Handling

### Worktree Already Exists

```bash
# Error: worktree '../project-auth' already exists
# Solution: Remove first
git worktree remove ../project-auth
# Then recreate
git worktree add -b feature/auth-domain ../project-auth
```

### Branch Already Exists

```bash
# Error: branch 'feature/auth-domain' already exists
# Solution 1: Delete branch
git branch -D feature/auth-domain
# Solution 2: Use existing branch
git worktree add ../project-auth feature/auth-domain
```

### Cannot Remove Worktree (Locked)

```bash
# Error: worktree is locked
# Solution: Unlock first
git worktree unlock ../project-auth
git worktree remove ../project-auth
```

## Best Practices

### Do's
✅ Use descriptive branch names (`feature/auth-domain`)
✅ Create worktrees outside main project (`../project-auth`)
✅ Commit in worktrees before merging
✅ Use `--no-ff` for clear merge history
✅ Clean up worktrees after merge
✅ Run `git worktree prune` periodically

### Don'ts
❌ Create worktrees inside main project
❌ Share worktree directories between teammates
❌ Leave worktrees after project completion
❌ Force push from worktrees
❌ Modify same files in multiple worktrees simultaneously

## Reference

For detailed patterns and troubleshooting:
- **`references/worktree-best-practices.md`** - Advanced worktree patterns

## Quick Reference Commands

```bash
# Create
git worktree add -b feature/new-branch ../project-feature

# List
git worktree list

# Remove
git worktree remove ../project-feature
git branch -d feature/new-branch

# Prune stale
git worktree prune

# Merge (in main project)
git merge --no-ff feature/new-branch
```

Follow these patterns for safe parallel development with git worktrees in Flutter DDD Builder workflows.
