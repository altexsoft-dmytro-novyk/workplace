<!-- bmad:context -->
<!-- Verified 2026-08-13 against 26b53fc. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## workspace (people management)

Spec-driven development workspace for the "people management" product, run with the
BMad Method. Application code lives in two git submodules — `services/backend`
(NestJS 11 + Prisma 7 + PostgreSQL) and `services/frontend` (React 19 + Vite 8) —
each a separate GitLab repository. This root repo holds only BMad planning/spec
artifacts, workspace skills, and submodule gitlinks.

## Policy

- Never put application code in this repo — it belongs in `services/backend` or
  `services/frontend`. The root commits only BMad artifacts and gitlink updates.
- Commit each service in its own repository first, then update the workspace
  gitlink — the `commit-and-push-services` skill runs the full sequence.

## Where things are

- Product owner requirements: `docs/project-requirements.md` (configured as BMad
  `project_knowledge`) — the source scope for all planning work.
- Planning artifacts: `_bmad-output/planning-artifacts/`; implementation artifacts:
  `_bmad-output/implementation-artifacts/`
- Backend agent guide: `services/backend/CLAUDE.md` + per-area rules in
  `services/backend/.claude/rules/`
- Frontend agent guide: `services/frontend/CLAUDE.md` + per-area rules in
  `services/frontend/.claude/rules/`
- BMad config: `_bmad/config.toml`, merged via
  `uv run _bmad/scripts/resolve_config.py --project-root .`

## Running and verifying

- Nothing runs from the root — root `npm test` is a stub. Run service commands from
  inside each service directory, per its own guide.
- Fresh clone: `npm run services:init` pulls both submodules.

<!-- /bmad:context -->
