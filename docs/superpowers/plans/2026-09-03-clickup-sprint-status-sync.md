# ClickUp Sprint-Status Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronize explicitly mapped BMad sprint-status entries to ClickUp while preventing writes outside Workspace `90122019689`.

**Architecture:** A CommonJS Node command loads BMad YAML plus `clickup-sync.yaml`, verifies the configured Workspace, then updates only mapped tasks and configured Custom Fields. GitHub Actions invokes it with a secret token.

**Tech Stack:** Node.js 20, `js-yaml`, Node built-in `fetch` and `node:test`, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-03-clickup-sprint-status-sync-design.md`

## Global Constraints

- The only permitted ClickUp Workspace ID is `90122019689`.
- Repository `sprint-status.yaml` files are authoritative; ClickUp never writes them.
- Do not log `CLICKUP_API_TOKEN`.
- Do not create ClickUp tasks, Lists, folders, or Custom Fields.
- Use Node 20 built-in `fetch`; `js-yaml` is the only runtime dependency.

---

### Task 1: Synchronizer and configuration

**Files:**
- Modify: `package.json`, `package-lock.json`, `README.md`
- Create: `clickup-sync.yaml`, `scripts/sync-clickup.cjs`, `test/clickup-sync.test.cjs`

**Interfaces:**
- Produces `npm run sync:clickup`, `npm run test:clickup`, `collectSyncEntries(options)`, and `syncClickUp(options)`.

- [ ] Write failing tests proving YAML configuration produces a mapped entry and that a missing expected Workspace blocks all writes.
- [ ] Run `node --test test/clickup-sync.test.cjs` and confirm the failure is due to absent production interfaces.
- [ ] Add `js-yaml`, the empty safe `clickup-sync.yaml` contract, and minimal CommonJS implementation using built-in `fetch`.
- [ ] Run `npm run test:clickup`; commit with `feat: add guarded ClickUp status sync`.

### Task 2: Custom fields and failures

**Files:**
- Modify: `scripts/sync-clickup.cjs`, `test/clickup-sync.test.cjs`

**Interfaces:**
- Consumes configured `custom_fields.git_branch` and `custom_fields.validation_status` UUIDs and optional task values.
- Produces POST field writes only when a configured ID and non-empty value both exist.

- [ ] Write a failing test that asserts the exact status PUT and two applicable Custom Field POST requests, plus errors for malformed mapping and non-2xx API responses.
- [ ] Run that focused test and confirm it fails because field writes are missing.
- [ ] Add conditional field requests and contextual API error handling.
- [ ] Run all ClickUp tests; commit with `feat: sync ClickUp custom fields`.

### Task 3: Workflow and documentation

**Files:**
- Create: `.github/workflows/sync-clickup.yml`
- Modify: `README.md`, `.gitignore`, `test/clickup-sync.test.cjs`

**Interfaces:**
- Workflow runs `npm ci` and `npm run sync:clickup`; it receives only `secrets.CLICKUP_API_TOKEN` as `CLICKUP_API_TOKEN`.

- [ ] Write a failing behavior test by loading the workflow YAML and checking trigger paths, Node 20, and the secret-scoped run step.
- [ ] Add workflow and README setup details: field creation and IDs, mapping task IDs, GitHub secret, and Workspace assertion; ignore `.env`.
- [ ] Run `npm run test:clickup` and parse workflow YAML; commit with `ci: automate ClickUp sprint-status sync`.
