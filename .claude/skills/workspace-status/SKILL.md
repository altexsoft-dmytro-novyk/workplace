---
name: workspace-status
description: Check Git status of workspace and all submodules in services/ folder (backend, frontend). Analyzes uncommitted changes, unpushed commits, and suggests next actions. Use when user asks to check status, see what changed, before sync/commit, or to verify clean state.
---

# Workspace Status

## Algorithm

Follow these steps to check complete workspace status:

### Step 1: Check Workspace Root Status

Check the main workspace repository status:

```bash
echo "=== Workspace Repository Status ==="
git status
git branch -vv
```

Analyze:
- Are there uncommitted changes in workspace?
- Is workspace ahead/behind remote?

### Step 2: Check All Submodules Overview

Use the npm script we created:

```bash
echo "=== All Submodules Overview ==="
npm run services:status
```

This shows quick overview of all submodules.

### Step 3: Check Each Submodule Detailed

Go into each submodule in `services/` folder and check detailed status:

**Backend (services/backend):**
```bash
echo "=== Backend Detailed Status ==="
cd services/backend
git status
git branch -vv
cd ../..
```

**Frontend (services/frontend):**
```bash
echo "=== Frontend Detailed Status ==="
cd services/frontend
git status
git branch -vv
cd ../..
```

### Step 4: Analyze Results

Interpret the output for each repository:

**Status meanings:**
- **Clean working tree** = no uncommitted changes
- **Changes not staged** = files modified but not added to git
- **Changes to be committed** = files staged for commit
- **Untracked files** = new files not in git yet
- **Your branch is ahead** = local commits not pushed to remote
- **Your branch is behind** = remote has commits you don't have locally

**Categorize changes:**
- **Workspace changes** = changes in workspace root (not in services/)
- **Service changes** = changes in services/backend or services/frontend

### Step 5: Suggest Next Actions to User

Analyze the changes and suggest appropriate actions:

**If there are changes in services (backend/frontend):**
- List which services have changes and what changed
- Suggest: "Would you like me to commit and push these changes?"
- Can use `commit-and-push-services` skill

**If there are changes in workspace root:**
- List what changed in workspace (e.g., new files, modified files)
- Suggest: "Would you like to commit these workspace changes?"
- Explain these are workspace-level changes (not service code)

**If both workspace and services have changes:**
- Explain both have changes
- Suggest committing services first (using `commit-and-push-services`)
- Then commit workspace changes separately

**If working trees are clean but behind remote:**
- Tell user which repositories are behind remote
- Suggest: "Would you like to sync with remote to get latest changes?"
- Can use `sync-workspace` skill

**If everything is clean and up-to-date:**
- Confirm: "✅ All repositories are clean and up-to-date"
- "Ready for new work"

**If there are conflicts or errors:**
- Explain the problem clearly
- Suggest manual resolution steps or specific commands

## Important Notes

- This skill is **READ-ONLY** - never modifies anything
- Always run before sync or commit operations
- Provides clear actionable recommendations
