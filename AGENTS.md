<!-- bmad:context -->
<!-- Verified 2026-09-03 against 4b00eef. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## workspace (people management)

Spec-driven BMad workspace for the people-management product. Application code lives in git submodules `services/backend` (NestJS 11 + Prisma 7) and `services/frontend` (React 19 + Vite 8). This repo holds BMad planning/spec artifacts, workspace skills, and submodule gitlinks only.

## Policy

- Never put application code in this repo — commit it in `services/backend` or `services/frontend`. This root commits only BMad artifacts and gitlink updates.
- When saving service work, commit and push each service repo first, then update workspace gitlinks — use the `commit-and-push-services` skill for the full sequence.
- Never reuse the `9-9-clickup-sync-smoke-test` key for a live `create:clickup` run — already mapped to ClickUp task `869euv7rn`; use a disposable `1-99-*` key instead.

## Where things are

- Product requirements: `docs/project-requirements.md` (BMad `project_knowledge` is `docs/`)
- Architecture spine: `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md`
- Before implementing or changing backend behavior, read `docs/architecture/README.md` and the relevant linked binding documents, including DDD, API conventions, testing strategy, and Access Control.
- Domain specs: `_bmad-output/specs/spec-*/SPEC.md`
- Planning artifacts: `_bmad-output/planning-artifacts/`; implementation artifacts: `_bmad-output/implementation-artifacts/{active-domain}`
- Backend agent instructions: `services/backend/AGENTS.md`; frontend: `services/frontend/AGENTS.md`
- BMad config: `_bmad/config.toml`, merged via `uv run python _bmad/scripts/resolve_config.py --project-root .`
- Changing ClickUp sync scripts (`scripts/clickup-*.cjs`, `clickup-sync.yaml`)? Run the gate in `docs/clickup-merge-gate.md` first — CI (`sync-clickup.yml`) runs them live against ClickUp on every push to `main`; there's no sandbox.

## Running and verifying

- Root `npm test` is a stub — use `npm run services:test`, `services:build`, or `services:lint` to fan out to both services, or run commands inside each service directory.

<!-- /bmad:context -->
