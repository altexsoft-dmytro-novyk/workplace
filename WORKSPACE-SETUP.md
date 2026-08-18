# AI Bootcamp Workspace Setup

## Step 1: Setup Submodules


```bash
# Create services folder
mkdir services

# Add backend as submodule
git submodule add -b main git@gitlab.altexsoft.pro:gr_ai-bootcamp/backend.git services/backend

# Add frontend as submodule  
git submodule add -b main git@gitlab.altexsoft.pro:gr_ai-bootcamp/frontend.git services/frontend

# Verify submodules created
cat .gitmodules
git status

# Commit changes
git add .
git commit -m "Add backend and frontend as submodules"

# Push to remote
git push origin main
```

---

## Step 2: Setup Package.json and Management Scripts

```bash
# Create package.json
npm init -y

# This will create a basic package.json file
```

Now edit `package.json` and add the following scripts section:

```json
{
  "name": "ai-bootcamp-workspace",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "services:init": "git submodule update --init --recursive",
    "services:status": "git submodule status",
    "services:sync": "git submodule update --remote"
  }
}
```

**What these commands do:**
- `npm run services:init` - Initialize all submodules (use after cloning workspace)
- `npm run services:status` - Show status of all submodules
- `npm run services:sync` - Update submodules from remote

**Commit the changes:**

```bash
git add .
git commit -m "Add package.json with submodule management scripts"
git push origin main
```

---

## Step 3: Setup Claude Code Skills for Git Management

```bash
mkdir -p .claude/skills/workspace-status
mkdir -p .claude/skills/sync-workspace
mkdir -p .claude/skills/commit-and-push-services
```

Copy the SKILL.md files into each directory.

Three skills:
- `workspace-status` - Check status
- `sync-workspace` - Pull changes
- `commit-and-push-services` - Commit and push

---

## Step 4: Install BMAD for Spec-Driven Development

```bash
# Install BMAD method
npx bmad-method install
```

This will setup BMAD framework for specification-driven development in your workspace.
