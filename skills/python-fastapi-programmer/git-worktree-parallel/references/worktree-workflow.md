# Git Worktree Workflow

## Step 1: Create Worktree

```bash
git worktree add .worktrees/{domain} -b {domain}-dev
```

## Step 2: Work in Worktree

```bash
cd .worktrees/{domain}

# Make changes
# ...

# Commit
git add .
git commit -m "feat: {domain} domain implementation"
```

## Step 3: Merge to Main

```bash
# Return to main
git checkout main

# Merge with merge commit
git merge --no-ff {domain}-dev -m "feat: {domain} domain 구현 완료"
```

## Step 4: Clean Up

```bash
# Remove worktree
git worktree remove .worktrees/{domain}

# Delete branch
git branch -d {domain}-dev
```

## Structure

```
project/
├── .git/
├── main.py (main branch)
└── .worktrees/
    ├── users/ (users-dev branch)
    ├── community/ (community-dev branch)
    └── teachers/ (teachers-dev branch)
```

## Topological Sort

```python
# Level 0: Independent domains (parallel)
domains_l0 = ["users"]

# Level 1: Dependent domains (parallel after L0)
domains_l1 = ["community", "teachers"]

# Round 1
for domain in domains_l0:
    create_worktree(domain)
    # work...
    merge_worktree(domain)

# Round 2
for domain in domains_l1:
    create_worktree(domain)
    # work...
    merge_worktree(domain)
```
