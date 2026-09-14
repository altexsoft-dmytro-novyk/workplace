
- source_spec: `_bmad-output/implementation-artifacts/platform/spec-ci-promote-backend-unit-frontend-e2e-gates.md`
  summary: No test pins the `continue-on-error` map in `.github/workflows/tests.yml`, so either promoted gate can be silently demoted again.
  evidence: `test/clickup-sync.test.cjs:585-595` is the only code that reads the workflow; it asserts triggers, permissions and the `clickup` job's steps only. Re-adding `continue-on-error` to the `Unit tests` step leaves `npm run test:clickup` at 75/75 green. A sibling assertion in that file would ride the one always-gating suite.

- source_spec: `_bmad-output/implementation-artifacts/platform/spec-ci-promote-backend-unit-frontend-e2e-gates.md`
  summary: `Container logs on failure` in the `backend-e2e` job is unreachable — `if: failure()` can never be true while every preceding step and the job itself are soft.
  evidence: The job's diagnostic output has therefore never been captured on a red e2e run. Needs `if: always()` or a step-outcome condition. Left untouched here because `backend-e2e` was explicitly out of scope.

- source_spec: `_bmad-output/implementation-artifacts/platform/spec-ci-promote-backend-unit-frontend-e2e-gates.md`
  summary: `live-verification`'s `download-artifact` step (`pattern: report-*`) has no zero-match tolerance, a path now more reachable since promoted jobs can die before uploading.
  evidence: Uploads use `if-no-files-found: warn`, so a job that dies before writing its report publishes no artifact. With every service job dead the pattern matches nothing and the download step errors, so the producer never runs and the run yields no evidence file.

- source_spec: `_bmad-output/implementation-artifacts/platform/spec-ci-promote-backend-unit-frontend-e2e-gates.md`
  summary: Neither promoted job sets `timeout-minutes`, so a hung Playwright `webServer` or `npm ci` now holds a gating check pending for up to the 6-hour default.
  evidence: Consequence changed with this promotion: previously a hang delayed only an advisory job.

- source_spec: `_bmad-output/implementation-artifacts/platform/spec-ci-promote-backend-unit-frontend-e2e-gates.md`
  summary: AD-1 and the new gates conflict for the two promoted suites, and no rule says how a developer lands a deliberately-red Stage-2 test there.
  evidence: AD-1 commits the test before the production code. That is now a merge-blocking red in `backend-unit` and `frontend-e2e`. Needs a stated convention (todo/skip, separate suite, or temporary re-softening).

- source_spec: `_bmad-output/implementation-artifacts/platform/spec-ci-promote-backend-unit-frontend-e2e-gates.md`
  summary: `_bmad-output/test-artifacts/ci-pipeline-progress.md` Step 3 still records all three service jobs as informational, contradicting the workflow.
  evidence: Left unedited because it is a dated point-in-time record of the 2026-09-04 run, and this change was scoped to `docs/ci.md`. Worth an appended dated note so an operator does not re-apply the old posture.

- source_spec: `_bmad-output/implementation-artifacts/platform/spec-ci-promote-backend-unit-frontend-e2e-gates.md`
  summary: Backend eslint is currently failing in CI (exit 1), masked by the deliberately-soft `Lint` step in a job now presented as a gate.
  evidence: Observed on run 33924217623 — the step logs `##[error]Process completed with exit code 1` while the jobs API reports `"conclusion":"success"`. Promoting lint is separate work, but the standing red should be known.

- source_spec: `_bmad-output/implementation-artifacts/platform/spec-ci-promote-backend-unit-frontend-e2e-gates.md`
  summary: A `SUBMODULES_TOKEN` expiry now hard-fails two jobs rather than producing three neutral conclusions.
  evidence: `docs/ci-secrets-checklist.md:22` notes fine-grained PATs expire. After this promotion a credential lapse, not a code regression, turns the run red; the rotation note was not updated for the changed consequence.

- source_spec: `_bmad-output/implementation-artifacts/platform/spec-ci-promote-backend-unit-frontend-e2e-gates.md`
  summary: The `it.todo` count in `docs/ci.md` is stale — it says 19; there are 31, all under `services/backend/test/` (e2e), none in `src/`.
  evidence: Pre-existing sentence, left alone to respect the "do not rewrite beyond the affected passage" scope. Misleading next to the "19 cases" backend-unit figure.

- source_spec: `_bmad-output/implementation-artifacts/platform/spec-r10-late-ratification-policy.md`
  summary: Nine historical Access Control Foundation scenario documents retain `Approved:` metadata and need a separately scoped metadata migration.
  evidence: The live authoring pattern now forbids approval-status lifecycle, but `docs/test-cases/access-control-foundation/**/*.md` retains nine historical `Approved:` lines. They are preserved as evidence rather than silently rewritten in this policy correction.

- source_spec: `_bmad-output/implementation-artifacts/platform/spec-r10-late-ratification-policy.md`
  summary: Historical scenario-area READMEs and stored dispatch artifacts still contain withdrawn AD-1 approval-gate wording and need a dedicated preservation-aware migration.
  evidence: The correction updates canonical authority, the root authoring pattern, currently referenced specifications, and live dispatch indexes. A repository-wide rewrite would also change historical scenario records and stored stage artifacts across Access Control, User Management, Mentorship, and Frontend, exceeding this R10 policy correction.

- source_spec: `_bmad-output/implementation-artifacts/platform/spec-plat-e2-e3-status-surface-correction.md`
  summary: `_bmad-output/test-artifacts/test-design-epic-platform-3.md:58-77` describes the pre-correction HEAD and is now stale — its "Four tracking surfaces" count, its `epics.md` header row (`**Status:** in-progress`) and its caveat row ("Factually false at this HEAD") no longer match `epics.md`. Needs a test-design **Edit** run, not an inline fix from here.
  evidence: This pass corrected `epics.md:39-44`, `:403` and `:427`, so rows 2-3 of that table now misdescribe the file and only one divergence (`PLAT-E2-S2.1` coverage vs tracker) survives of the four surfaces it tabulates. The artifact is governed by `docs/test-design-workflow-contract.md`, which reserves edits to its canonical epic plan for a scoped Edit run and keeps approval and validation as separate states; it currently carries `approvalStatus: granted` with `validationStatus: CONCERNS (2026-09-12, re-validation)`, and per that contract an Edit cannot clear the verdict. Left untouched here because the spec's boundaries forbid touching `test-artifacts/**`.

- source_spec: `_bmad-output/implementation-artifacts/platform/spec-readiness-map-snapshot-freshness.md`
  summary: Re-audit and replace the 42 manual implementation notes in the readiness-map snapshot with evidence tied to a new repository revision.
  evidence: The snapshot currently records 2026-09-07 implementation conclusions. The generator now identifies that provenance and prevents it from being relabelled, but it cannot infer fresh implementation assessments from planning status or CI results.
