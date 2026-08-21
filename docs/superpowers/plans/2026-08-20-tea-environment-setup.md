# TEA Environment Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install the local toolchain required by the BMAD/TEA workspace, install locked service dependencies, verify the starter projects, and prepare the TEA repository changes for review without pushing them.

**Architecture:** Machine-level tools are installed from their official upstream distributions. Application dependencies remain isolated in the backend and frontend submodules, while BMAD/TEA artifacts remain in the workspace repository.

**Tech Stack:** uv, nvm, Node.js 22, npm, Docker Desktop, NestJS/Jest/Prisma, React/Vite/Playwright, BMAD TEA.

**Spec:** `/Users/home/bootcamp/workplace/docs/project-requirements.md`

## Global Constraints

- Keep application code in `services/backend` and `services/frontend`; the workspace repository stores BMAD artifacts and gitlinks only.
- Use Node.js 22 as pinned by the backend `.nvmrc`.
- Commit only the TEA `test-design`, `ci`, and `trace` workflows for both Codex (`.agents/skills`) and Claude (`.claude/skills`); preserve all existing non-TEA integrations unchanged.
- Do not push the branch or create a remote pull request; the user performs the push after local review.
- Do not commit machine-local dependencies, browser binaries, secrets, or `_bmad/config.user.toml.bak`.

---

### Task 1: Isolate the repository changes

**Files:**
- Create: `docs/superpowers/plans/2026-08-20-tea-environment-setup.md`
- Modify: BMAD installer-managed files under `_bmad/`, `.agents/skills/`, and `.claude/skills/`

**Interfaces:**
- Consumes: Existing uncommitted TEA installation on local `main`.
- Produces: Local branch `chore/install-tea-toolchain` containing reviewable TEA changes.

- [x] **Step 1: Create the local branch**

  Run: `git switch -c chore/install-tea-toolchain`

- [x] **Step 2: Confirm no remote push occurred**

  Run: `git status --short --branch`

### Task 2: Install machine-level toolchain

**Files:**
- Machine-local: `~/.local/bin/uv`, `~/.nvm/`, `/Applications/Docker.app`

**Interfaces:**
- Consumes: Official uv, nvm, Node.js, and Docker Desktop distributions.
- Produces: `uv`, Node.js 22 through nvm, and Docker Desktop commands available locally.

- [x] **Step 1: Install uv from the official standalone installer**

  Run: `sh /private/tmp/uv-install.sh`

- [x] **Step 2: Install nvm from its pinned official installer**

  Run: `PROFILE=/Users/home/.zshrc bash /private/tmp/nvm-install.sh`

- [x] **Step 3: Install and select Node.js 22**

  Run: `source /Users/home/.nvm/nvm.sh && nvm install 22 && nvm alias default 22 && nvm use 22`

- [x] **Step 4: Install Docker Desktop from the architecture-appropriate official disk image**

  Run: `hdiutil attach /private/tmp/Docker.dmg && ditto /Volumes/Docker/Docker.app /Applications/Docker.app && hdiutil detach /Volumes/Docker`

### Task 3: Install service dependencies

**Files:**
- Generated and ignored: `services/backend/node_modules/`, `services/frontend/node_modules/`, `services/backend/src/generated/prisma/`

**Interfaces:**
- Consumes: Git submodule pins and both package lockfiles.
- Produces: Reproducible backend and frontend dependency trees.

- [x] **Step 1: Initialize the service submodules**

  Run: `git submodule update --init --recursive`

- [x] **Step 2: Install backend dependencies from the lockfile**

  Run: `source /Users/home/.nvm/nvm.sh && nvm use 22 && npm ci --prefix services/backend`

- [x] **Step 3: Install frontend dependencies from the lockfile**

  Run: `source /Users/home/.nvm/nvm.sh && nvm use 22 && npm ci --prefix services/frontend`

### Task 4: Install browser runtime and verify

**Files:**
- Machine-local Playwright browser cache.

**Interfaces:**
- Consumes: Frontend Playwright package installed by `npm ci`.
- Produces: Chromium browser runtime and fresh build/test evidence.

- [x] **Step 1: Install Chromium**

  Run: `cd services/frontend && npx playwright install chromium`

- [x] **Step 2: Verify versions and BMAD customization resolver**

  Run: `uv --version && node --version && npm --version && uv run _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-testarch-test-design --key workflow`

- [x] **Step 3: Verify backend**

  Run: `npm --prefix services/backend run build && npm --prefix services/backend test -- --runInBand`

- [x] **Step 4: Verify frontend**

  Run: `npm --prefix services/frontend run build && npm --prefix services/frontend test`

### Task 5: Prepare the local pull-request commit

**Files:**
- Commit: BMAD/TEA installer artifacts and this plan.
- Exclude: `_bmad/config.user.toml.bak` and all machine-local dependencies.

**Interfaces:**
- Consumes: Verified workspace diff.
- Produces: One local commit plus a ready-to-copy pull-request title and description.

- [x] **Step 1: Validate generated changes**

  Run: `git diff --check && git status --short`

- [x] **Step 2: Stage only repository artifacts**

  Run: `git add .agents/skills .claude/skills _bmad docs/superpowers/plans/2026-08-20-tea-environment-setup.md`

- [x] **Step 3: Commit locally without pushing**

  Run: `git commit -m "chore: install BMAD TEA workflows"`
