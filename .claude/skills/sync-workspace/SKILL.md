---
name: sync-workspace
description: Synchronize workspace and all submodules by pulling latest changes from remote. Checks for uncommitted changes first, pulls workspace, updates submodules, and verifies results. Use when user asks to sync, pull, update, or get latest changes.
---

# Sync Workspace

## Algorithm

Follow these steps to safely sync workspace with remote:

### Step 1: Safety Check - Verify Clean State

**CRITICAL:** Before syncing, check for uncommitted changes using `workspace-status` skill.

```bash
# Check workspace
git status

# Check each submodule
cd services/backend && git status && cd ../..
cd services/frontend && git status && cd ../..
```

**Decision point:**
- **If ANY repository has uncommitted changes** → STOP and tell user:
  - "⚠️ Cannot sync - uncommitted changes detected in [repo name]"
  - "Please commit your changes first or stash them"
  - Suggest: "Would you like me to commit these changes?" (use `commit-and-push-services` skill)
  - **Do NOT proceed with sync**

- **If all clean** → Continue to Step 2

### Step 2: Pull Workspace Repository

Sync the main workspace repository:

```bash
echo "=== Syncing Workspace Repository ==="
git pull origin main
```

**Check result:**
- If pull succeeds → Continue to Step 3
- If conflicts → Stop, explain conflicts, suggest manual resolution

### Step 3: Update All Submodules

Use the npm script we created:

```bash
echo "=== Updating Submodules ==="
npm run services:sync
```

This runs `git submodule update --remote` which updates all submodules.

### Step 4: Verify Sync Results

Check what was updated:

```bash
echo "=== Verification ==="
npm run services:status
git status
```

### Step 5: Report Results to User

Analyze and report what changed:

**If everything updated successfully:**
- "✅ Workspace synced successfully"
- List what was updated: "Updated workspace: [commits info]"
- List submodules updated: "Backend: [old hash] → [new hash]"
- List submodules updated: "Frontend: [old hash] → [new hash]"

**If nothing changed:**
- "✅ Already up-to-date with remote"
- "No changes to sync"

**If sync failed:**
- Explain which step failed
- Show error message
- Suggest next action (e.g., resolve conflicts manually)

### Step 6: Suggest Next Actions

After successful sync:
- "You can now start working with the latest code"
- If user was trying to make changes: "You can now make your changes"

## Safety Rules

⚠️ **NEVER sync with uncommitted changes** - data loss risk  
⚠️ **Always verify results** after sync  
⚠️ **Stop on conflicts** - don't force through

## Important Notes

- Always run `workspace-status` skill first
- Sync updates to latest remote commits
- Does not create any commits
- Safe operation if working tree is clean
