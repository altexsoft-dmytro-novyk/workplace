---
title: 'Promote backend-unit and frontend-e2e to blocking CI gates'
type: 'chore'
created: '2026-09-06'
status: 'done'
baseline_commit: 'd8faa81ff914d9d198b33f76242fa47a0ef713bf'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/test-artifacts/ci-pipeline-progress.md'
  - '{project-root}/docs/ci.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `.github/workflows/tests.yml` marks all three service suites informational with
`continue-on-error: true` at job level *and* on their test steps. That blanket posture was correct
while every suite was red, but backend unit (19/19) and frontend Playwright (124/124, 0 flaky) are
now verified green at the current SHAs, so neither can ever block a merge on a genuine regression.

**Approach:** Execute step 5 of the recorded promotion path in
`_bmad-output/test-artifacts/ci-pipeline-progress.md` for exactly those two jobs: drop
`continue-on-error` at job level and on their test steps, leave `backend-e2e` fully informational
(29 mentorship Stage-2 cases are red by design under AD-1), and bring the workflow comment block and
`docs/ci.md` in line with the new two-gate/one-informational reality.

## Boundaries & Constraints

**Always:**

- Keep step-level `continue-on-error: true` on the `Lint` steps of both promoted jobs — lint is not
  part of this promotion.
- Keep `backend-e2e` untouched: job level and every step stays informational.
- Keep `live-verification` running on a hard-failing dependency — `needs:` plus `if: always()` must
  still hold after the edit.
- Keep `if: always()` on every `upload-artifact` step so reports still upload on a red run.
- Documentation edits stay scoped to the passages this change invalidates.

**Ask First:**

- Any change to job structure, Node versions, caching, or the set of jobs.
- Adding branch-protection instructions or required-check configuration.
- Committing or pushing — this change is left in the working tree for human review.

**Never:**

- Do not promote `backend-e2e` or either `Lint` step.
- Do not commit, push, or open a PR.
- Do not rewrite `docs/ci.md` beyond the passages made false by this change.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Backend unit regresses | `npm test` exits non-zero in `backend-unit` | Job conclusion is **failure**; the run is red and can be a required check | Report artifact still uploads (`if: always()`) |
| Frontend suite regresses | `npm test` exits non-zero in `frontend-e2e` | Job conclusion is **failure** | JSON + HTML report artifacts still upload |
| Lint fails in either promoted job | `eslint` / `npm run lint` exits non-zero | Step is soft; job continues and can still conclude success | Step-level `continue-on-error: true` retained |
| Backend e2e red by design | Mentorship Stage-2 cases fail | Job conclusion stays **neutral**; no merge is blocked | Unchanged — job- and step-level flags retained |
| A promoted job fails hard | `backend-unit` concludes failure | `live-verification` still runs and aggregates whatever reports exist | `if: always()` on the job; missing report degrades to `missing_reports` |

</frozen-after-approval>

## Code Map

- `.github/workflows/tests.yml` -- the only behavioural file. Relevant anchors: comment block at
  L36-42 ("Informational suites"), `backend-unit` job L44-89 (job-level flag L47, `Lint` step flag
  L73, `Unit tests` step flag L80), `backend-e2e` job L91-160 (**read-only** — flags at L94, L126,
  L139, L143 all stay), `frontend-e2e` job L162-228 (job-level flag L164, `Lint` step flag L185,
  `E2E tests` step flag L207), `live-verification` job L233-236 (`needs:` + `if: always()` — verify,
  do not edit), job-summary text at L282 ("These suites run informationally") which becomes false.
- `docs/ci.md` -- job table L8-14 (three "(informational)" rows and their "Gates a merge?" column),
  section heading + body L16-32 ("Why three of them are informational", the `continue-on-error`
  policy paragraph, and the promotion-path paragraph), and L109 ("Revisit after the first suite is
  promoted to a gate").
- `_bmad-output/test-artifacts/ci-pipeline-progress.md` -- **read-only** provenance. Step 3 records
  the informational posture as a deliberate departure; "Next steps for the operator" step 5 is the
  promotion path this change executes. Not edited here; it is a dated record of that run.
- `scripts/build-live-verification-results.cjs` -- **read-only**. Consumer of the uploaded reports;
  degrades to `missing_reports` when a job dies before writing one. Nothing to change.

## Tasks & Acceptance

**Execution:**

- [x] `.github/workflows/tests.yml` -- remove job-level `continue-on-error: true` from `backend-unit`
      and `frontend-e2e`; remove step-level `continue-on-error: true` from their `Unit tests` and
      `E2E tests` steps -- a step-level flag left behind would keep a red suite reporting green even
      after the job-level flag is gone.
- [x] `.github/workflows/tests.yml` -- rename the two promoted jobs' `name:` away from
      "(informational)" and rewrite the "Informational suites" comment block so it states that two
      suites now gate and only `backend-e2e` reports -- the old text asserts all three are neutral.
- [x] `.github/workflows/tests.yml` -- correct the `live-verification` job-summary line that tells
      the reader "These suites run informationally — a red result never blocks a merge", which is now
      true only of `backend-e2e`.
- [x] `docs/ci.md` -- update the job table's gating column and job names, retitle and rewrite the
      "Why three of them are informational" section to describe one informational suite plus the two
      promoted gates, and adjust the burn-in "Revisit after the first suite is promoted" note.

**Acceptance Criteria:**

- Given the edited workflow, when it is parsed by a YAML loader, then it loads without error and the
  validator used and its output are reported.
- Given the edited workflow, when `continue-on-error` is grepped for, then it appears **only** on the
  two `Lint` steps and inside the `backend-e2e` job — nowhere else.
- Given `backend-unit` concludes failure, when the run proceeds, then `live-verification` still
  executes, because it declares `needs: [backend-unit, backend-e2e, frontend-e2e]` with
  `if: always()` and no `needs:` entry was added or removed.
- Given a red run, when it finishes, then every `upload-artifact` step still carries `if: always()`.
- Given the change is complete, when `git status` is inspected, then the edits are unstaged in the
  working tree with no new commit.

## Design Notes

Two flags per job, not one. GitHub evaluates step-level `continue-on-error` first: a soft step that
fails is recorded as *successful* for the purpose of the job's conclusion, so removing only the
job-level flag on `backend-unit` would leave `Unit tests` swallowing its own exit code and the job
would keep concluding green. Both must go, together, for the gate to be real.

`live-verification` is unaffected by design: `if: always()` runs a job regardless of whether its
`needs` succeeded, failed, or were skipped. Job-level `continue-on-error` only changes a job's
*conclusion* (failure becomes neutral); it never changes whether a dependent job with `if: always()`
is scheduled. So dropping it strengthens the gate without touching aggregation.

## Verification

**Commands:**

- `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/tests.yml')); print('OK')"` --
  expected: prints `OK`, no traceback. (The `yaml` npm package is not installed in this workspace;
  PyYAML 6.0.3 is available, so this is the validator of record.)
- `grep -cE '^\s+continue-on-error: true' .github/workflows/tests.yml` -- expected: exactly **six**
  flag lines — the `Lint` step in `backend-unit` (1), the four inside `backend-e2e` (job level,
  `Start Postgres + LocalStack`, `Apply migrations`, `E2E tests`), and the `Lint` step in
  `frontend-e2e` (1).
- `git status --short` -- expected: `.github/workflows/tests.yml` and `docs/ci.md` modified, nothing
  committed.

**Manual checks (if no CLI):**

- `live-verification` still declares `needs: [backend-unit, backend-e2e, frontend-e2e]` and
  `if: always()`, unchanged.
- Every `actions/upload-artifact@v4` step still carries `if: always()`.

## Suggested Review Order

**The gate flip itself**

- Both flags gone: job level and test step. This is the whole change.
  [`tests.yml:55`](../../../.github/workflows/tests.yml#L55)

- The step that now owns its exit code — nothing swallows a red unit run.
  [`tests.yml:89`](../../../.github/workflows/tests.yml#L89)

- Same flip on the Playwright job.
  [`tests.yml:171`](../../../.github/workflows/tests.yml#L171)

- Playwright step, likewise hard-failing now.
  [`tests.yml:214`](../../../.github/workflows/tests.yml#L214)

**What deliberately did not change**

- `backend-e2e` job level: still soft, still AD-1. Verify this hunk is absent from the diff.
  [`tests.yml:151`](../../../.github/workflows/tests.yml#L151)

- `live-verification` still `needs:` all three with `if: always()` — unchanged, but the thing most at risk.
  [`tests.yml:240`](../../../.github/workflows/tests.yml#L240)

**Statements about gating that had to follow**

- Comment block rewritten; check the four-flag count for the next promoter is right.
  [`tests.yml:36`](../../../.github/workflows/tests.yml#L36)

- Job-summary line no longer tells readers a red never blocks a merge.
  [`tests.yml:289`](../../../.github/workflows/tests.yml#L289)

- Doc table column renamed to "Can fail the run?" — merge-blocking is branch protection, not this file.
  [`ci.md:8`](../../../docs/ci.md#L8)

- Section retitled and rewritten around one informational suite, not three.
  [`ci.md:22`](../../../docs/ci.md#L22)

**Peripheral**

- Burn-in deferral, now partly unblocked by a green baseline.
  [`ci.md:126`](../../../docs/ci.md#L126)
