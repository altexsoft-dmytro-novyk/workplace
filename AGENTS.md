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


## Architecture authority (do not confuse)

1. **Default:** PM spine = `_bmad-output/.../architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md`
2. **Bare `AD-n`** in `docs/architecture/*` = **PM/AD-n**
3. **ACF spine** = slice-scope only for Kernel MVP (`spec-access-control-kernel-mvp`, `ACM-*`). Cite as **ACF/AD-n**, never bare `AD-n`
4. **Never** use ACF deferrals (e.g. "section matrices deferred") as product-wide scope — PM/AD-7, PM/AD-10 define the full model
5. **Historical** = `prd-user-management-*`, `prd-mentorship-*` only — not PM spine, not `docs/project-requirements.md` v1.5
<!-- /bmad:context -->

## Trace artifacts (`_bmad-output/test-artifacts/`)

One file per artifact, always the current state, always the undated name. A re-trace overwrites `traceability-matrix.md`, `e2e-trace-summary.json` and `tea-trace-coverage-matrix.json` in place; superseded states live in git history, not beside them. Do not reintroduce dated copies (`*-repo-YYYY-MM-DD.*`) — that naming was the workflow's `/tmp` timestamp leaking into the repo, and the pile it produced is what this convention replaced. `test/trace-artifact-naming.test.cjs` fails the moment one reappears.

- **Cite these files by commit, never by name alone.** Because the names are overwritten, `gate-decision.json shows gate_status=PASS` is a claim with no anchor — the file will say something else after the next run, and the citation silently starts describing a state that no longer exists. `gate-decision.json` alone has held three different verdicts under one name — `c342138` FAIL, `a62e705` PASS, `b074364` FAIL — so unanchored citations to it were describing three different states with identical wording. The existing ones now carry anchors; a few deliberately do not, because they make no claim about content (an evidence-list path, a "not examined" note) or because the run they cite was never committed. In prose, link the superseded file at its commit (`https://github.com/altexsoft-dmytro-novyk/workplace/blob/<sha>/<path>`) so the citation stays clickable after the file is gone; in a machine-readable artifact, keep the filename in its own field and put the commit beside it rather than embedding a retrieval command.
- `gate-decision.json` exists only when a run actually issues a verdict, and none is in force now: the current trace is a whole-repository planning audit, which runs with `allow_gate=false` and must never have its aggregate percentage presented as release readiness. A verdict requires an explicitly declared MVP/demo target. Thresholds and the reasoning behind them live in `_bmad/custom/bmad-testarch-trace.toml`.
- `tea-trace-coverage-matrix.json` is not a workflow output. Step 4 writes it to `/tmp` as a Phase 1→2 handoff and this repo persists a copy, because `scripts/build-readiness-map.cjs` and `scripts/build-live-verification-results.cjs` read it. That copy is made by the `on_complete` hook in `_bmad/custom/bmad-testarch-trace.toml`, not by hand — copying it manually is how the timestamp got into the repo in the first place. The latter globs `tea-trace-coverage-matrix*.json` and picks the newest by `generated_at`; the former reads whichever path `live-verification-results.json` names in `matrix_used` and throws if it is missing, so keep that pointer on the canonical name.

## Installed skills are duplicated

`bmad-testarch-trace` is installed twice, under `.claude/skills/` and `.agents/skills/`. Claude Code loads the `.claude/` copy. Apply every fix to both: patching one leaves the other running the old logic, which is how the configurable gate thresholds sat inert for days after they were introduced while the test suite stayed green against the copy nobody ran. `test/trace-gate-thresholds.test.cjs` now fails when the copies drift.
