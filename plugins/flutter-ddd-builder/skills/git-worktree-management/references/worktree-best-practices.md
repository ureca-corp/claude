# Git Worktree Best Practices

## Creating Worktrees

```bash
# Get project name dynamically
PROJECT_NAME=$(basename $(pwd))

# Create worktree for each domain
git worktree add -b feature/auth-domain ../${PROJECT_NAME}-auth
git worktree add -b feature/post-domain ../${PROJECT_NAME}-post
```

## Verification

```bash
# List all worktrees
git worktree list

# Expected output:
# /path/to/project       abc123 [main]
# /path/to/project-auth  def456 [feature/auth-domain]
```

## Merging Worktrees

```bash
# Return to main project
cd /path/to/project

# Merge each domain
git merge --no-ff feature/auth-domain -m "Merge auth domain"

# Handle conflicts
if [ $? -ne 0 ]; then
  git status --short | grep '^UU' | cut -d' ' -f2 | while read file; do
    git checkout --ours "$file"
    git add "$file"
  done
  git commit -m "Merge auth domain (resolved conflicts)"
fi
```

## Cleanup

```bash
# Remove worktrees
git worktree remove ../${PROJECT_NAME}-auth
git branch -d feature/auth-domain

# Clean stale references
git worktree prune
```

## Key Rules

1. Always use dynamic project names: `$(basename $(pwd))`
2. Create worktrees in parent directory: `../`
3. Use `--no-ff` for merge to preserve history
4. Remove worktrees and branches after merging
5. Run `git worktree prune` to clean up
