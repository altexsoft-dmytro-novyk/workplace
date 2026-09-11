---
epicId: 'PLAT-E2'
epicDomain: 'platform'
epicNumber: 2
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicSourceHeading: '## Epic 2: Access Control Foundation'
runScope: 'epic'
runKey: 'epic-platform-2'
workflowStatus: 'generated'
approvalStatus: 'ungranted'
validationStatus: 'not-run'
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
lastSaved: '2026-09-11'
runBaselineHead: '28d8e2049d457b103cd7eee31587add7a970f4fc'
planPath: '_bmad-output/test-artifacts/test-design-epic-platform-2.md'
---

# Test-Design Progress — `epic-platform-2`

**Identity tuple:** `PLAT-E2` · domain `platform` · number `2` ·
`_bmad-output/planning-artifacts/platform/epics.md` `## Epic 2: Access Control Foundation`
**Run key:** `epic-platform-2`
**Run baseline `HEAD`:** `28d8e2049d457b103cd7eee31587add7a970f4fc` (captured before this run's first write)

> **`workflowStatus: generated` means only that documents were written.** Approval, validation,
> coverage, execution evidence, and release readiness are separate states and none of them is
> claimed here (contract §5).
>
> - Approval: **ungranted**
> - Validation: **NOT RUN** — `test-design-validation-report-epic-platform-2.md` does not exist
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

Planned, not achieved: **12 tests + 1 measurement run + 1 documentation item**, ~25–42 h (~4–6 days),
excluding human AD-1 approval latency.

| Priority | Obligations | Tests | Hours |
| --- | --- | --- | --- |
| P0 | `ACF-RW-01..03`, `ACF-AU-R1` | 7 | ~14–22 |
| P1 | `ACF-AU-06`, `ACF-FC-05` | 3 | ~6–10 |
| P2 | `ACF-PERF-01`, `ACF-TR-01` | 1 run + 1 doc | ~4–8 |
| P3 | `ACF-FC-07` | 1 | ~1–2 |

All functional scenarios are facade-level against real PostgreSQL and fit the PR budget;
`ACF-PERF-01` is opt-in and is wired into no gate. `ACM3-II-01/03` and `ACM-4R` are **consumed** as
cross-epic evidence rather than duplicated.

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

**State unchanged by this action:** `workflowStatus: generated`, approval of *this plan* still
**ungranted**, validation still **NOT RUN**. The fresh approval recorded above is an AD-1 approval
of three Stage-1 scenario documents — a different approval from, and not a substitute for, human
approval of this test-design plan.

## Result

**WRITTEN · approval ungranted · validation NOT RUN.** One planned P0 obligation (`ACF-RW-01..03`)
was executed and its scenario documents carry a fresh AD-1 approval; the plan itself remains
unapproved and unvalidated.
