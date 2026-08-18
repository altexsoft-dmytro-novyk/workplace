---
name: commit-and-push-services
description: Commit and push changes in service submodules (backend/frontend), then update workspace gitlinks. Asks user for commit messages, commits each service separately, pushes to remote, updates workspace. Use when user asks to save changes, commit, push, or save work.
---

# Commit and Push Services

## Algorithm

Follow these steps to safely commit and push changes:

### Step 1: Identify What Changed

Check which repositories have uncommitted changes:

```bash
echo "=== Checking for Changes ==="
git status
cd services/backend
git status
cd ../frontend
git status
cd ../..
```

Analyze the output to determine:
- Does **workspace** have changes? What files?
- Does **backend** (services/backend) have changes?
- Does **frontend** (services/frontend) have changes?
- Are changes staged or unstaged?

### Step 1.5: Show Plan and Get Approval

**CRITICAL: Human-in-the-loop checkpoint**

Before committing anything, present the plan to user:

```
I see the following changes:

Workspace:
- New files: [list files]
- Modified files: [list files]
- Untracked files: [list files]

Backend (services/backend):
- [list changes or "no changes"]

Frontend (services/frontend):
- [list changes or "no changes"]

Plan:
1. [What will be committed in each repo]
2. [What commit messages will be used]

⚠️ IMPORTANT: I will commit ALL changes as-is.
- I will NOT create .gitignore entries
- I will NOT skip any files
- I will NOT make decisions about what should/shouldn't be committed

Do you approve this plan?
```

**STOP and wait for user confirmation.**

If user says NO or wants changes → Ask what to modify
If user approves → Proceed to Step 2

### Step 2: Process Backend Changes (if any)

**If backend has changes:**

1. **Ask user for commit message:**
   - "I see changes in backend. What commit message should I use?"
   - Wait for user's response

2. **Commit and push backend:**
   ```bash
   cd services/backend
   git add .
   git commit -m "USER_PROVIDED_MESSAGE"
   git push origin main
   cd ../..
   ```

3. **Check push result:**
   - If successful → Report: "✅ Backend committed: [commit hash]"
   - If failed → Show error, suggest solution (see Step 6)

**If no backend changes:**
- Skip to Step 3

### Step 3: Process Frontend Changes (if any)

**If frontend has changes:**

1. **Ask user for commit message:**
   - "I see changes in frontend. What commit message should I use?"
   - Wait for user's response

2. **Commit and push frontend:**
   ```bash
   cd services/frontend
   git add .
   git commit -m "USER_PROVIDED_MESSAGE"
   git push origin main
   cd ../..
   ```

3. **Check push result:**
   - If successful → Report: "✅ Frontend committed: [commit hash]"
   - If failed → Show error, suggest solution (see Step 6)

**If no frontend changes:**
- Skip to Step 4

### Step 4: Commit Workspace Changes (if any)

**If workspace has changes (from Step 1):**

1. **Ask user for workspace commit message:**
   - "I see changes in workspace. What commit message should I use?"
   - Wait for user's response

2. **Commit workspace:**
   ```bash
   git add .
   git commit -m "USER_PROVIDED_MESSAGE"
   git push origin main
   ```

3. **Check push result:**
   - If successful → Report: "✅ Workspace committed: [commit hash]"
   - If failed → Show error, suggest solution

**If no workspace changes:**
- Skip to Step 5

### Step 5: Update Workspace Gitlinks (if services changed)

If services were committed in Steps 2-3, workspace will show submodules as modified.

Check workspace status:
```bash
git status
```

**If submodules show as modified:**

```bash
# Stage gitlink updates
git add services/

# Commit workspace
git commit -m "Update services to latest commits"

# Push workspace
git push origin main
```

Report: "✅ Workspace gitlinks updated"

### Step 6: Final Verification

Verify everything is clean and pushed:

```bash
echo "=== Final Status ==="
git status
npm run services:status
```

### Step 7: Handle Errors

**If git push fails:**

Analyze the error and provide specific guidance:

- **"Permission denied"** → "Cannot access remote. Check SSH keys or credentials"
- **"Updates were rejected"** → "Remote has changes you don't have. Run `sync-workspace` first"
- **"Protected branch"** → "Branch is protected. You may need to create a Pull Request"
- **Network error** → "Network issue. Check internet connection"

**Suggest recovery:**
- If behind remote: "Would you like me to sync with remote first?" (use `sync-workspace` skill)
- If access issue: "Please check your Git credentials"

### Step 8: Report Final Summary

**If all operations succeeded:**
```
✅ All changes saved successfully:
- Backend: committed and pushed [hash]
- Frontend: committed and pushed [hash]  
- Workspace: gitlinks updated [hash]
```

**If nothing to commit:**
- "No uncommitted changes found"
- "All repositories are already up-to-date"

**If partial success:**
- List what succeeded
- List what failed and why
- Suggest next steps

## Safety Rules

⚠️ **NEVER use --force flag** - can destroy remote history  
⚠️ **Always ask user for commit messages** - never generate automatically  
⚠️ **Commit each service separately** - clearer history  
⚠️ **Check branch before pushing** - should be on main  
⚠️ **NEVER create or modify .gitignore** - user decides what to ignore  
⚠️ **NEVER skip files automatically** - commit everything or ask user  
⚠️ **Show plan and get approval BEFORE committing** - human-in-the-loop required

## Important Notes

- **Always show plan first, then wait for approval**
- Each repository gets its own commit message from user
- Never create or modify .gitignore automatically
- Never skip files without asking user
- Workspace gitlink updates use automatic message: "Update services to latest commits"
- If push fails, changes remain committed locally (safe)

## Example Flow

```
User: "Save my changes"

Agent:
1. Checks status → sees .claude/ in workspace, changes in backend
2. Shows plan:
   "I see the following changes:
   
   Workspace:
   - New directory: .claude/ (3 skill files)
   
   Backend:
   - Modified: src/auth/auth.service.ts
   
   Plan:
   1. Commit workspace with all files in .claude/
   2. Commit backend changes
   3. Update workspace gitlinks
   
   ⚠️ I will commit ALL files as-is, no .gitignore changes.
   
   Do you approve?"

3. Waits for user confirmation
4. User: "Yes, approve"
5. Asks: "What commit message for workspace?"
6. User: "Add Claude Code skills"
7. Commits workspace
8. Asks: "What commit message for backend?"
9. User: "Add JWT authentication"
10. Commits backend
11. Updates workspace gitlinks
12. Reports: "✅ All changes saved"
```
