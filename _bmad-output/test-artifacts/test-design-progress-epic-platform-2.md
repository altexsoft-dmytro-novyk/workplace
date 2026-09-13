---
epicId: 'PLAT-E2'
epicDomain: 'platform'
epicNumber: 2
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicSourceHeading: '## Epic 2: Access Control Foundation'
runScope: 'epic'
runKey: 'epic-platform-2'
workflowStatus: 'generated'
approvalStatus: 'granted'
approvalGrantedBy: 'Anna Pikula'
approvalGrantedDate: '2026-09-12'
validationStatus: 'PASS'
validationDate: '2026-09-13'
validationReport: '_bmad-output/test-artifacts/test-design-validation-report-epic-platform-2.md'
totalSteps: 5
stepsCompleted:
  [
    'step-01-detect-mode',
    'step-02-load-context',
    'step-03-risk-and-testability',
    'step-04-coverage-plan',
    'step-05-generate-output',
  ]
lastStep: 'step-05-generate-output'
nextStep: 'document generation is complete; no Create step remains; proceed with human review, then choose Validate, Edit, or a fresh Create'
lastSaved: '2026-09-13'
runBaselineHead: '28d8e2049d457b103cd7eee31587add7a970f4fc'
planPath: '_bmad-output/test-artifacts/test-design-epic-platform-2.md'
---

# Test-Design Progress — `epic-platform-2`

**Identity tuple:** `PLAT-E2` · domain `platform` · number `2` ·
`_bmad-output/planning-artifacts/platform/epics.md` `## Epic 2: Access Control Foundation`
**Run key:** `epic-platform-2`
**Run baseline `HEAD`:** `28d8e2049d457b103cd7eee31587add7a970f4fc` (captured before this run's first write)

> **`workflowStatus: generated` means only that documents were written.** Approval, validation,
> coverage, execution evidence, and release readiness are separate fields; current values are
> stated below (contract §5).
>
> - Approval: **granted 2026-09-12 by Anna Pikula, the requester**
> - Validation: **PASS (2026-09-13, fresh independent Epic-Level validation)** —
>   `test-design-validation-report-epic-platform-2.md`, synchronized with
>   `test-design/README.md`. Supersedes the prior PASS (2026-09-12, same report path); see Steps 7–8
>   below.
> - Coverage: **none asserted**
>
> This is the canonical **terminal successful document-generation state** of contract §4.4. Resume
> on this checkpoint has no Create step to continue; it should direct the reader to human review and
> then Validate, Edit, or a fresh Create.

---

## Step 1 — Detect mode & resolve identity

**Mode:** Epic-Level, from explicit user intent (Create, Epic-Level, `PLAT-E2` named with a complete
tuple). File-based mode detection was **not** used.

**Scope resolution** (contract §3, in order):

1. Read `_bmad-output/test-artifacts/test-design/README.md` (current-artifact index) and
   `docs/test-design-workflow-contract.md`.
2. The user supplied a **complete** epic tuple: canonical epic ID `PLAT-E2`, domain `platform`,
   source path, and heading. No completion from a bare number or title was needed.
3. Canonical source verified. `_bmad-output/planning-artifacts/platform/epics.md` contains **exactly
   one authoritative body** for this epic, at `## Epic 2: Access Control Foundation` (line 392). The
   second occurrence at line 134 is a `### Epic 2: Access Control Foundation` entry **inside the
   `## Epic List` summary**, which §3.3 admits as a repeated identity mention rather than a second
   body. Domain, canonical ID, number, and heading agree; `PLAT-E2` is corroborated by
   `PLAT-E2-S2.1` in `global-fr-epic-story-coverage.yaml` and throughout the epic source.
4. Derived once and carried unchanged:
   - `runKey` = `epic-platform-2`
   - plan = `_bmad-output/test-artifacts/test-design-epic-platform-2.md`
   - checkpoint = `_bmad-output/test-artifacts/test-design-progress-epic-platform-2.md`
   - validation report (**not written**) = `_bmad-output/test-artifacts/test-design-validation-report-epic-platform-2.md`
   - `domain` token `platform` and number `2` are both well-formed; the identity collides with no
     indexed scope (`epic-platform-capabilities-1` is a different domain token).
5. Pre-write identity check: **neither** the plan **nor** the checkpoint existed at the run baseline,
   so there was no existing artifact to compare identity against and no inconsistent partial run.
   This is the §4.1 case "a real canonical epic has no plan yet" — Create may write exactly the
   domain-qualified plan and checkpoint and **must** add the scope to the index in the same run.

**Policy applied to this run:** one test-design plan per active canonical epic, independent of
transferred obligations. The index's blanket `No plan is created for … any PLAT-E* …` rule is
retired as a routing rule in this same run. The underlying ledger fact is unchanged and unrewritten:
`test-design/migration-map.md` routes **zero** rows to `test-design-epic-platform-2.md`.

---

## Step 2 — Load context

Loaded per contract §4.2 — the index, the canonical system pair, and the **one** canonical epic
source. **No other epic's plan or checkpoint was loaded.**

| Input | Role |
| --- | --- |
| `test-design/README.md` | Current-artifact index |
| `docs/test-design-workflow-contract.md` | Routing contract (persistent fact) |
| `test-design-architecture.md` · `test-design-qa.md` | Canonical system pair — shared risk, NFR, evidence, execution rules |
| `planning-artifacts/platform/epics.md` `## Epic 2` | The one canonical epic source |
| `specs/spec-access-control-audience-foundation/SPEC.md` | Story contract for `ACF-1` |
| `docs/test-cases/access-control-foundation/` (9 scenarios + README) | Stage-1 evidence boundary |
| `services/backend/test/access-control/audience-resolution.e2e-spec.ts` | Stage-2 evidence boundary |
| `implementation-artifacts/access-control/deferred-work.md` | Recorded open/resolved findings |
| `…ratification-2026-09-02/blockers.yaml` | `SEC-AUTH-01` |
| `performance/p6-resolve-audiences-postgresql.md` | Contract C measurement record |
| `implementation-artifacts/platform/sprint-status.yaml` · `global-coverage/global-fr-epic-story-coverage.yaml` | Read **only** to record the tracking-surface conflict; neither was modified |

**Config:** `test_artifacts` = `_bmad-output/test-artifacts`; `communication_language` = English;
`user_name` = the unset placeholder `User`. **Detected stack:** fullstack (NestJS/Prisma backend +
frontend); the epic's subject is backend-only. **Execution mode:** sequential — epic-level Create is
single-worker by one output artifact, and no subagents were used.

Existing tests were inspected **for evidence boundaries only**. Unrelated epic plans and superseded
test-design artifacts were not used as discovery inputs.

---

## Step 3 — Risk & testability

**9 risks** recorded. Category spread: SEC 1, TECH 6, PERF 1, OPS 1.

| Risk | Score | One-line |
| --- | --- | --- |
| `R-PLAT2-01` | **9** | `SEC-AUTH-01` (P0, open) — every HTTP allow case runs on a fail-open auth substrate |
| `R-PLAT2-02` | **6** | Stage-1 and Stage-2 disagree: `da7d1fa` reworked the tests while the three scenario docs still say `403` and "needs fresh approval" |
| `R-PLAT2-03` | **6** | `ACF-AU-01..04` assert `200` on a route that returns `200` to any active viewer — they can pass for the wrong reason |
| `R-PLAT2-04` | 4 | The empty-set rule for a deactivated target is stated by no approved scenario |
| `R-PLAT2-05` | 4 | P6 depth-499 (warm p95 **983.087 ms**) misread as production load; real chains are 5–10 levels (balanced depth-5 warm p95 **9.139 ms**) |
| `R-PLAT2-06` | 4 | Suite README still claims "one audience per viewer×target"; untrue since `f36d1b2` |
| `R-PLAT2-07` | 3 | `PLAT-E2` status disagrees across four tracking surfaces |
| `R-PLAT2-08` | 2 | `ACF-FC-01` cannot separate blocked bridge from blocked target — closed by `PLAT-E3`'s `ACM3-II-01/03`, monitored here |
| `R-PLAT2-09` | 1 | Cross-context `ACCESS_CONTROL_PORT` import — recorded irreducible |

**NFR:** Contracts **A / B / C** kept separate; `PLAT-E2` owns only **C** (P6), which has **no
threshold and is never a gate**. The `backend-acm9` job's informational status is **not disturbed**
and no promotion to blocking is proposed. Database-timeout headroom and `SQLSTATE 57014`
classification remain **UNKNOWN** — no value was invented.

---

## Step 4 — Coverage plan

Planned, not achieved: **8 API-E2E cases + 1 measurement run + 9 document/audit items**,
~31–53 h (~1–2 weeks). Counts separate executable tests from evidence-maintenance work; current
AD-1 has no per-stage approval latency.

| Priority | Obligations | Tests | Hours |
| --- | --- | --- | --- |
| P0 | `ACF-RW-01..04`, `ACF-AU-R1` | 4 API-E2E + 4 docs | ~16–26 |
| P1 | `ACF-FC-05`, `ACF-NC-01` | 3 API-E2E + 1 audit | ~9–15 |
| P2 | `ACF-PERF-01`, `ACF-TR-01`, `ACF-DOC-01`, `ACF-SCOPE-01/02` | 1 run + 4 audits | ~5–10 |
| P3 | `ACF-FC-07` | 1 | ~1–2 |

All functional scenarios are API E2E through the headless facade against real PostgreSQL and fit
the PR budget; `ACF-PERF-01` is opt-in and wired into no gate. `ACM3-II-01/03` and `ACM-4R` are
**consumed** as cross-epic evidence rather than duplicated.

---

## Step 5 — Generate output

**Written:** `_bmad-output/test-artifacts/test-design-epic-platform-2.md`, from
`test-design-template.md`, carrying `epicId`, `epicDomain`, `epicSourcePath`, `epicNumber`, and
`runKey`. No handoff was generated — the handoff is system-scope only, and
`test-design/people-management-handoff.md` remains the single literal handoff, untouched.

**Index updated:** `test-design/README.md`. Permitted by §4.1 because this run changed an indexed
path, identity, and status fact. Three edits:

1. Added the `epic-platform-2` row to §3, placed after `PLAT-E1` in numeric order.
2. Removed `PLAT-E2` from the "still unplanned" list (`PLAT-E2`–`PLAT-E8` → `PLAT-E3`–`PLAT-E8`).
3. Reworded that paragraph's closing sentence, which said *"this run created only
   `epic-platform-1`"* — true of the run that wrote it, but false as the document's standing voice
   once a second run had landed. It now names both 2026-09-11 runs.

**Concurrency note.** This run read the index at session start, when it still carried the blanket
`No plan is created for … any PLAT-E* …` rule and had no `PLAT-E1` row. Between that read and this
run's first write, a **separate `epic-platform-1` Create run** wrote
`test-design-epic-platform-1.md`, `test-design-progress-epic-platform-1.md`, and the index's
retirement of that blanket rule. **That run, not this one, retired the rule.** This run's index work
was therefore reduced to adding its own row and correcting the two residual facts its own write
made false. No content written by the `epic-platform-1` run was reverted, and its plan and
checkpoint were not read as inputs (contract §4.2).

**Files written by this run (3):**

- `_bmad-output/test-artifacts/test-design-epic-platform-2.md`
- `_bmad-output/test-artifacts/test-design-progress-epic-platform-2.md`
- `_bmad-output/test-artifacts/test-design/README.md`

**Files deliberately unchanged:** the system pair, the literal handoff, the system checkpoint and
system validation report, `test-design/migration-map.md`, **every** other epic plan and checkpoint,
`implementation-artifacts/platform/sprint-status.yaml`,
`global-coverage/global-fr-epic-story-coverage.yaml`, `planning-artifacts/platform/epics.md`, every
file under `docs/test-cases/`, all trace and coverage JSON, service code, service gitlinks, and
ClickUp data.

**Not done by this run:** no validation report, no approval, no coverage claim, no gate decision, no
sprint-status or ClickUp change, and no promotion of the informational ACM-9 job.

---

## Post-generation action (2026-09-11, same session)

Anna Pikula directed execution of this plan's P0 item `ACF-RW-01..03` (risk `R-PLAT2-02`, score 6)
immediately after the plan was written. This is **execution of a planned obligation, not a
Create/Edit/Resume/Validate workflow step**, and it is recorded here because it changes what the
plan and this checkpoint should say about that risk's status.

**Done:**

- Rewrote `docs/test-cases/access-control-foundation/audience/acf-au-05-colleague-denied.md`,
  `.../fail-closed/acf-fc-01-broken-reports-to-edge.md`, and
  `.../fail-closed/acf-fc-02-pp-hr-line-withheld.md` from the invalidated `403` expected result to
  the resolver audience-set assertion already shipped and tested at `services/backend` commit
  `da7d1fa` (2026-09-03), matching the pattern `ACF-FC-04`/`ACF-FC-03` already use.
- Added a `**Reworked & approved:** Anna Pikula, 2026-09-11` marker to each file, explicitly
  recorded as a **retro-anchor** (the code and green test predate this approval) rather than a
  scenario-first AD-1 pass or a mechanical status swap.
- Updated `docs/test-cases/access-control-foundation/README.md` (top note, provisional-mapping
  section, "what this suite cannot prove," layout table) so it no longer says the three files
  "need rework + re-approval."
- Updated `test-design-epic-platform-2.md` itself: `R-PLAT2-02` marked mitigated, the corresponding
  P0/exit/entry rows marked done, the mitigation plan closed.

**Explicitly not done**, and out of this action's scope:

- `test-design-qa.md` § U-19's normative-coverage table still parenthesizes `ACF-FC-01` and
  `ACF-FC-02` as `(invalidated)`. That is the **platform pair** — approved and validated PASS
  (2026-09-11) — and correcting it needs its own Edit run under contract §4.3, not a side effect of
  epic-plan execution.
- `ACF-AU-01..04` (the `R-PLAT2-01`/`R-PLAT2-03` allow-case rework, `ACF-AU-R1`) — not requested,
  remains planned.
- No sprint-status, coverage YAML, trace, or gate-decision file was touched.

**State at the prior validation:** `workflowStatus: generated`, approval of *this plan* still
**ungranted**, validation was **CONCERNS (2026-09-12)**. The fresh approval recorded above is an AD-1 approval
of three Stage-1 scenario documents — a different approval from, and not a substitute for, human
approval of this test-design plan.

## Result

**Prior validation result:** **WRITTEN · approval ungranted · validation CONCERNS (2026-09-12).** `ACF-RW-01..03` were
executed as validation-only characterization repairs with voluntary attribution; the plan was
still unapproved at that point. A fresh Validate was required after the remediation below.

## Step 6 — Post-validation remediation after independent reviews (2026-09-12)

Two read-only agents independently reviewed the plan: one against the full Epic-Level TEA
checklist, one against all five Story 2.1 acceptance criteria and current primary sources. The Edit
addressed every plan-quality blocker they agreed would prevent PASS:

- added explicit AC1–AC5 traceability and repository-audit obligations for AC4/AC5;
- required exact `{self}` and other exact audience sets;
- reclassified real-Nest/PostgreSQL facade checks as API E2E, not Component;
- replaced Smoke/P-tier execution timing with PR/Nightly/Weekly;
- corrected the tracker section to the single deliberate coverage divergence;
- removed duplicate PLAT-E3 multi-audience work and made `ACF-DOC-01` concrete;
- captured the still-contradictory `ACF-FC-04` as open `ACF-RW-04`;
- added non-cache/non-persistence verification, reconciled counts/estimates, and removed obsolete
  scenario-approval and “Validate not run” language.

External source/scenario inconsistencies are planned obligations, not claims of completed work.
This Edit changed neither approval nor the prior validation verdict; the fresh Validate below
supersedes that prior CONCERNS result. No runtime code, scenario file, source SPEC, tracker, ClickUp, trace, gate, or
other epic artifact was changed.

## Validation projection (2026-09-12)

**Fresh independent Epic-Level Validate:** **PASS.** The selected plan and canonical system pair
were re-evaluated against the complete checklist. ACF-NC-01 now counts its dynamic API-E2E proof
and repository audit consistently across the P1 row and all totals; current §U-19 no longer states
a live per-file AD-1 approval gate or that `GET /users/:id` is unprotected/not adopted; and the
checkpoint retains the canonical five Create steps and terminal Resume metadata. No runtime
coverage, approval, gate, or release-readiness claim is made. Canonical report:
`test-design-validation-report-epic-platform-2.md`.

## Human approval (2026-09-12)

Anna Pikula, the requester, explicitly approved this PLAT-E2 test design after the independent
validation returned PASS. Approval covers the plan's design content only and remains separate
from validation. It grants no runtime coverage, execution evidence, gate result, NFR verdict, or
release-readiness state, and it closes none of the plan's open implementation/evidence
obligations. The validation report is retained unchanged as the evidence record of its run; its
approval wording describes the state at validation time.

---

## Step 7 — Edit: record 2026-09-13 completions

**Edit run under `docs/test-design-workflow-contract.md` §4.3.** Target confirmed as the sole
canonical `epic-platform-2` plan (`test-design-epic-platform-2.md`); loaded in full before any
write. No other epic's plan or checkpoint was read or touched.

**What changed in the plan:** coverage-table statuses, risk mitigation statuses, entry/exit
criteria checkboxes, the Acceptance-Criterion Traceability table, the mitigation plans for
`R-PLAT2-01/02/03`, and a new "Correction Log" section recording six 2026-09-13 completions —
`ACF-AU-R1`, `ACF-FC-05`, `ACF-RW-04`, `ACF-DOC-01` (docs/ half only), `ACF-SCOPE-01`,
`ACF-SCOPE-02` — plus the still-open items `ACF-TR-01`, `ACF-NC-01`, `ACF-PERF-01`, and
`ACF-DOC-01`'s SPEC.md half. Evidence for each item was independently spot-checked before writing:

- `b714327` confirmed present in `services/backend` git log for
  `test/access-control/audience-resolution.e2e-spec.ts`.
- `SEC-AUTH-01` re-checked against `.../blockers.yaml`: `status: closed` (2026-09-12), but its
  stated reopen condition (branch `fix/sec-auth-01-refuse-test-tokens-in-production`, `45a671e`,
  merged to `services/backend` `main`) was verified **unmet** — `git merge-base --is-ancestor
  45a671e origin/main` returned false; `origin/main` is at `d1ef680`. This plan records that fact
  without re-adjudicating the risk score or the blocker's open/closed status — that call belongs
  to Architect + Security per `blockers.yaml`'s own owner field, consistent with this repository's
  standing rule that QA does not re-score a security risk unilaterally.
- `docs/test-cases/access-control-foundation/README.md:19` read directly: confirmed it now states
  the applicable-set rule.
- `docs/test-cases/access-control-foundation/fail-closed/acf-fc-04-cyclic-reporting-chain.md` read
  directly: confirmed the `403` expectation is gone and the reworked-and-approved marker is present.
- `test-review-plat-e2-e4-2026-09-13.md` read directly: confirmed the 100/100 per-file score for
  `audience-resolution.e2e-spec.ts` (the file's overall 95/100 with two HIGH findings belongs to a
  different file, `s42a-op-root-operator-set.e2e-spec.ts`, not cited as evidence for this epic).

**What did not change:** no trace artifact (`traceability-matrix.md`, `e2e-trace-summary.json`,
`tea-trace-coverage-matrix.json`, `live-verification-results.json`, `gate-decision.json`), no
`sprint-status.yaml`, no other epic's plan or checkpoint, no service code, no gitlink, no ClickUp
data. `_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md` was read but not
edited — it is outside this Edit's writable file set (not the plan, checkpoint, or index); its
still-stale "exactly one" wording is recorded in the plan as a remaining open item instead.

**Index:** `test-design/README.md` was not edited by this Step — its `epic-platform-2` status
prose is updated together with the fresh Validate below, per contract §4.5's synchronous
projection requirement, rather than twice.

**This Edit claims no approval, gate, coverage, or release-readiness status.** It is followed
immediately, in the same session, by a fresh independent Validate for `epic-platform-2`.

## Step 8 — Validate: fresh independent Epic-Level validation (2026-09-13)

See `test-design-validation-report-epic-platform-2.md` for the full record. Summary projected
here per contract §4.5:

**Verdict: PASS.** Every 2026-09-13 completion claim added by Step 7's Edit (`ACF-AU-R1`,
`ACF-FC-05`, `ACF-RW-04`, `ACF-DOC-01` docs/ half, `ACF-SCOPE-01`, `ACF-SCOPE-02`) was
independently re-verified against its cited primary source (backend commit, scenario doc,
`blockers.yaml`, or the 2026-09-13 test-review record) rather than trusted on the Edit's own word;
all held, including their self-declared boundaries (the `ACF-DOC-01` SPEC.md residual and the
`SEC-AUTH-01` unmet reopen condition). No approval, gate, coverage, or release-readiness claim
follows. **Validation date:** 2026-09-13. **Report path:**
`_bmad-output/test-artifacts/test-design-validation-report-epic-platform-2.md`. This supersedes
the 2026-09-12 validation projection above as the current validation state; the 2026-09-12 report
remains unchanged as historical evidence of what it evaluated at the time.
