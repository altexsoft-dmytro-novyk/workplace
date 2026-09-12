---
epicId: 'PLAT-E4'
epicDomain: 'platform'
epicNumber: 4
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicSourceHeading: '## Epic 4: Access Control Authorization Consolidation'
runKey: 'epic-platform-4'
validationScope: 'epic'
validationDate: '2026-09-12'
runBaselineHead: '8f348fc0f722840f3173a2cb8860e743ab0c3362'
verdict: 'PASS'
---

# Test Design Validation Report — Epic `PLAT-E4` (Access Control Authorization Consolidation)

**Scope kind:** `epic` · **Identity tuple:** `PLAT-E4` · domain `platform` · number `4` ·
`_bmad-output/planning-artifacts/platform/epics.md` `## Epic 4: Access Control Authorization Consolidation`
**Run key:** `epic-platform-4`
**Repository `HEAD` (captured before this run's first write, run baseline):** `8f348fc0f722840f3173a2cb8860e743ab0c3362`
— unchanged across all four 2026-09-12 Validate runs; no commit has landed in `workplace`.
`services/backend` remains an uncommitted submodule working tree on branch `feat/plat-e4-dev-seed-journal`.

> **What this report is not.** It grants no approval, asserts no coverage achieved, records no
> execution result, and changes no sprint status, gate, scenario file, trace artifact, service code,
> gitlink, or ClickUp mapping. Per `docs/test-design-workflow-contract.md` §5, `workflowStatus:
> generated` on the plan's checkpoint means only that documents were written. This validation
> evaluates the plan's internal quality and its alignment with the epic's stated acceptance criteria
> and the canonical system pair — nothing more. Approval for this plan was already recorded
> separately (2026-09-12, requester Anna Pikula) and is **not touched by this run** — this report
> neither grants nor withdraws it.

---

## Why this is a fourth run

Since the third PASS report, the **AF-3 decision changed**: Anna Pikula, acting as PO and Architect,
**declined** the `spec-4-2d` development-fixture journal exception on 2026-09-12. Seeded dev-spine
edges must now be journaled like any other manager change. This is a substantive change (unlike the
prior run's single-line grep-pattern fix): it touches the epic source, the increment spec, the plan
(risk register, NFR audit row, coverage row, traceability, mitigation, dependencies, interworking,
Not-in-Scope, Executive Summary counts), the checkpoint, a new Stage-1 scenario document, and
uncommitted backend code and tests on `feat/plat-e4-dev-seed-journal`.

---

## Independent re-verification

### The backend script now matches `assignManager`'s journaling shape

Read `git -C services/backend diff -- scripts/dev-seed-org.ts` in full and compared against
`src/user-management/infrastructure/org-relationship.repository.ts`'s `assignManager` (lines
60-100+). Both now: generate the relationship's `uuidv7()` id before the transaction so it can be
embedded in the journal snapshot; write `kind: 'manager'`, `before: Prisma.DbNull`, `after: {
relationshipId, userId, type: 'direct', reportsToUserId }`; derive the idempotency key via
`accessJournalIdempotencyKey(actorId, subjectId, 'manager', relationshipId, 'create')`; and commit
both writes in one transaction (the script uses the Prisma array form
`$transaction([relationship.createMany(...), accessJournal.createMany({..., skipDuplicates: true})])`,
which is one database transaction, functionally equivalent to `assignManager`'s interactive-callback
form for this purpose). The script's actor is `root.id`, matching the precedent of
`access-control-bootstrap.ts`'s `seedFullProfileGrantIfNone`, which also journals a seed-time grant
with root as actor. This is an accurate implementation of the declared decision, not merely a claim
about one.

### The new scenario doc matches the new tests exactly

`s42d-ds-07-seeded-edges-are-journaled.md` specifies: Run 1 → 8 `manager` rows (7 script-written
edges + the one pre-existing administrator-written `betaMember` edge, untouched); Run 2 (no-op
rerun) → 0 new rows; Run 3 (after a new import) → 3 new rows, total 11. Read
`git -C services/backend diff -- test/access-control/s42d-ds-dev-seed-spine.e2e-spec.ts` in full:
`s42d-ds-07` Test 1 asserts exactly 8 rows across the named users; Test 2 asserts the rerun's
journal snapshot is unchanged; Test 3 asserts 11 total with only the three new users gaining a row.
Numbers and shape match the scenario document exactly.

### Test execution (this run, from `services/backend`, local PostgreSQL up)

```
npm run test:e2e -- test/access-control/s42d-ds-dev-seed-spine.e2e-spec.ts
```
Result, run twice for stability: **24/24 tests passed, both times** (1 suite, 0 failures).

```
npm run test:e2e -- test/user-management/access-control-adoption/s42d-ds-root-resolves-over-seeded-population.e2e-spec.ts test/user-management/epic-4/access-journal.e2e-spec.ts test/access-control/acm1r-fr-foundation.e2e-spec.ts
```
Result: **53/53 tests passed** (3 suites, 0 failures) — matching the checkpoint's claim for these
three suites exactly.

**Discrepancy found, and reported plainly.** The checkpoint's "AF-3 decision record" and the
coordinator's report both state the main suite passes **23/24**, with `s42d-ds-05` Test 2
("`npm run db:dev:grant-root` fails with npm's own Missing script text") failing and reproducing on
the unmodified suite. This run's two independent executions of the exact same command both show
**24/24 — no failure, including `s42d-ds-05` Test 2**. Structural confirmation was also performed:
`git -C services/backend diff -- test/access-control/s42d-ds-dev-seed-spine.e2e-spec.ts | grep
"s42d-ds-05"` shows only a table-of-contents comment line touched, not the test body — so *if* that
test fails elsewhere, this change is confirmed not its cause. But this run cannot confirm the
specific "23/24, pre-existing failure" claim itself: it did not reproduce, twice, in this
environment. The more likely explanations are environment/timing variance in an earlier run rather
than a real defect, since the actual behaviour observed here is strictly better than claimed (zero
failures, not one). This is recorded as a finding below because a specific empirical count in the
checkpoint does not match this run's reproducible result, not because it indicates any defect in the
design or the journaling implementation.

### Plan/checkpoint/epic-source consistency

- **Risk arithmetic**, checked line by line: R01 3×3=9, R02 2×3=6, R03 2×3=6, R04 2×3=6, R05 2×3=6,
  R08 3×2=6 (six risks ≥6, matching "Six high"); R06 2×2=4 (matching "One medium (score 4), P2");
  R07 1×2=2 (matching the new "One low (score 2)" table and the checkpoint's identical P/I/score).
  Total risks = 8, matching "The register has eight risks" in the Executive Summary. All arithmetic
  correct and consistent across the Executive Summary, the Risk Assessment tables (now including a
  new Low-priority table), and the checkpoint's Step-3 table.
- **No leftover stale wording.** Searched the plan, checkpoint, and epic source for "bounded" /
  "ratification" / "unjournaled" language describing the *current* state of the AF-3 exception: none
  remains. The plan's Not-in-Scope table no longer carries the "Ratification of the dev-seed journal
  exception" row (confirmed removed). The one residual mention of "the bounded AF-3
  development-fixture exception" (checkpoint line 149) is inside the **historical** 2026-09-12 Edit
  record describing what that earlier edit did — correctly left as history, not a claim about
  current behaviour, and immediately followed by the new "AF-3 decision record" section documenting
  the supersession.
- **Epic source**: the Story 4.2 "Development-fixture journal exception — DECLINED 2026-09-12" block
  and the corrected last Story 4.2 AC ("Seeded spine edges are journaled") both read consistently
  with the plan and the code.
- **`spec-4-2d-dev-seed-spine.md`**: the AF-3 row now carries a dated "SUPERSEDED 2026-09-12" note
  naming the decision, the new scenario, and the branch — consistent with everything else.

No new contradiction found beyond the test-count discrepancy above.

---

## Evaluated artifacts and content hashes (this run)

| Artifact | Role | SHA-256 |
| --- | --- | --- |
| `_bmad-output/test-artifacts/test-design-epic-platform-4.md` | Evaluated epic plan — changed (AF-3 decline reflected throughout) | `7dec0cc3eb0762483f313d4bf78630cf07b109c434290b7d71876ff05b909d8f` |
| `_bmad-output/test-artifacts/test-design-architecture.md` | Canonical system pair (architecture) | `133efa612ad55b012fc8be9bc6a77d1d6f55e4bbdba99a8ee0404acccb648ec5` |
| `_bmad-output/test-artifacts/test-design-qa.md` | Canonical system pair (QA) | `b5a9468c206a8017a04febf58c974a1ab72bc2d37258e203167c0307ea6f858d` |
| `_bmad-output/test-artifacts/test-design-progress-epic-platform-4.md` | Epic checkpoint — changed (R07 row, counts, AF-3 decision record) | `9fa3317506dd77b4e543ae421ff375e7d27a80496dc934fba951f9451df65700` |
| `_bmad-output/planning-artifacts/platform/epics.md` | Canonical epic source — changed (Story 4.2 DECLINED block, corrected AC) | `50168c4ed396be347fd3d46074fd9bfd5d94b8e02ef600bc2ddceaa7a20b9c5b` |
| `_bmad-output/test-artifacts/test-design/README.md` | Current-artifact index (updated by this run) | `1ded8b4bd4ea533e76fe97d204c9bab2d85021b745c8df3a68ff0ac6a29d7360` |
| `_bmad-output/implementation-artifacts/platform/story-4-1-generalise-section-access-authorisation.md` | Story 4.1 ticket | `6d9f925434d7c750a28e12037b23e1974c89eb2c6564b483f9447eacc8592d7f` |
| `_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md` | Story 4.2 ticket | `de923d55194b531188bec9d9b42ea05f4a56d6eecbc8fb769c4415ad6db78e82` |
| `_bmad-output/implementation-artifacts/platform/spec-4-2a-root-operator-permission-set.md` | Increment spec (AF-2) | `372a89785a0615ca4774ee68580e19b48c41ecd4be87106404a7d346f01875f7` |
| `_bmad-output/implementation-artifacts/platform/spec-4-2d-dev-seed-spine.md` | Increment spec — changed (AF-3 row SUPERSEDED note) | `3e7d6fa8c200c608d9060cba1267afbe64b8ea381cf11ac566853f2499ae8558` |
| `docs/architecture/access-control.md` | Architecture | `bdbe74a27a04a159b547c2a9c5ac990c2703a51cb504707e71568473661fee34` |
| `docs/architecture/testing-strategy.md` | Architecture (ACM-9 protocol, evidence rules) | `ffdf5b2c15838adeb8ad36d83baba7b0c51ad97ca634f6231e6c99a3785c6fac` |
| `docs/project-requirements.md` | Normative requirements (§2.1, §3.4) | `495017d0bc2f1c01ae5c7b1cdd6d4753f9c32410eb2ba1e2e3ca88003f4bf0d8` |
| `_bmad-output/planning-artifacts/platform/dept-epic.md` | Forward-work register | `9100bb6785eed6920bceaeac6028f4a075136ffaf6aa074b1da9c41c0b052e15` |
| `_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml` | Blocker register (`CONFLICT-UM-01`) | `264798875dd1bfe1f79978193ee72a26e4e99b23ba15fc0255786b0262658258` |
| `_bmad-output/implementation-artifacts/access-control/deferred-work.md` | Deferred-work register | `45b97a1f427066389645b8723d1e4ef9bae99d1a85fe44ca1f0164142d29d34f` |
| `docs/test-cases/access-control-kernel/dev-seed-spine/s42d-ds-07-seeded-edges-are-journaled.md` | **New** Stage-1 scenario (supporting input) | `8673b854fa8e48f9d2f7822f0f8bcae7c5b1c73dcef14f76505b20c16dfa3691` |
| `services/backend/scripts/dev-seed-org.ts` | Backend script (uncommitted, supporting input) | `d722cd4bf4d0425cf9edc97bddb59d1e558604bfc47cf183f63a484da707e062` |
| `services/backend/test/access-control/s42d-ds-dev-seed-spine.e2e-spec.ts` | Backend E2E suite (uncommitted, supporting input) | `b62bb3a99f321a92b8f3cda85284200c8950998779934b4dbb1ba1f4cdca0243` |
| `services/backend/src/user-management/infrastructure/org-relationship.repository.ts` | Reference journaling pattern (`assignManager`, supporting input) | `4e3b9b92ff65228cd88cde12258962c10ced0d6912405f41d1660f24e86fc537` |

**Also read, not hashed:** `docs/test-design-workflow-contract.md`;
`_bmad-output/implementation-artifacts/platform/sprint-status.yaml`;
`services/backend/src/user-management/infrastructure/access-journal-idempotency.ts`.

**Identity cross-check.** Plan frontmatter, checkpoint frontmatter, and the canonical source heading
all still agree on `PLAT-E4` / `platform` / `4` / `## Epic 4: Access Control Authorization
Consolidation`. No mismatch found.

---

## Scope resolution (contract §3)

1. Current-artifact index and routing contract re-read before this run's first write.
2. Target resolved to the same `PLAT-E4` tuple as every prior run; no bare epic number used.
3. Canonical source re-verified: it changed since the last run (the AF-3 decline block); one
   matching authoritative `## Epic 4` body still present.
4. `runKey` `epic-platform-4` unchanged.
5. Pre-write identity check passed on both plan and checkpoint.

**Files this run was allowed to change:** this report, the `PLAT-E4` validation entry in the
current-artifact index, and the plan's/checkpoint's projection fields and verdict-stating prose —
**not their approval fields**, which were already recorded 2026-09-12 by the requester and are
untouched by this run. **Files that had to remain unchanged, and did:** the system pair, the system
validation report, every other epic report and plan, and all service, scenario, trace, and tracker
artifacts outside the PLAT-E4/AF-3 change set the coordinator described.

---

## Verdict: **PASS**

No blocking finding remains. The AF-3 decision is accurately implemented in backend code (verified
against `assignManager`'s own pattern), accurately specified in a new Stage-1 scenario that matches
its Stage-2 tests exactly, and accurately reflected — with correct arithmetic and no stale wording —
throughout the plan, checkpoint, and epic source. The declined exception in fact *strengthens* the
epic's §3.4/PM/AD-29 compliance relative to the prior (bounded-exception) state: there is no longer
even a scoped carve-out from "every change is journaled."

**One non-blocking finding** is recorded below concerning a specific test-count claim in the
checkpoint that this run could not reproduce.

---

## Findings

### G-1 — LOW/MEDIUM, non-blocking. Checkpoint's "23/24, pre-existing `s42d-ds-05` Test 2 failure" claim did not reproduce

**Location:** `_bmad-output/test-artifacts/test-design-progress-epic-platform-4.md`, "AF-3 decision
record" § Stage 3, and the coordinator's report of the same figures.

**What was checked:** ran `npm run test:e2e -- test/access-control/s42d-ds-dev-seed-spine.e2e-spec.ts`
from `services/backend` twice, against the current uncommitted `feat/plat-e4-dev-seed-journal`
working tree, with local PostgreSQL up.

**What was found:** 24/24 passed both times, with no failure anywhere in the suite, including
`s42d-ds-05` Test 2.

**Why this is not a blocking finding:** the actual, twice-reproduced behaviour is strictly better
than the recorded claim (zero failures instead of one), and it does not contradict anything the plan
or epic source assert about coverage or risk — R07 and E4-C06(7) claim only that `s42d-ds-07`
passes, which it does. The likeliest explanation is environment or ordering variance in whatever run
produced the "23/24" figure (for example a stale compiled artifact, a leftover row from a prior
partial run, or a one-off flake), not a substantive defect this validation is positioned to diagnose
further without access to that original run's logs.

**Required fix (non-blocking, recommended for a future Edit):** correct the checkpoint's Stage-3
outcome line to state the actually-reproducible count, or re-run the suite once more in the same CI
environment the "23/24" figure came from and record whichever count is reproducible there, so the
checkpoint's evidentiary claim matches an environment someone can reproduce it in.

Nothing else found this run rises to a finding.

---

## Checklist results (delta from the third PASS run only)

Unchanged in every section except **Risk Assessment Matrix** and **NFR Planning**, both still
**PASS**: the new Low-priority risk table and R07's re-score are arithmetically correct and
consistently projected; the Security (audit) NFR row now describes a fully-journaled dev seed rather
than a bounded exception, matching both the code and the epic source.

---

## Required to clear CONCERNS

None — verdict is PASS. G-1 is a recommended documentation correction, not a requirement for this
verdict.

---

## Index update

Per contract §4.5, this run updates **only** the `PLAT-E4` validation entry in
`_bmad-output/test-artifacts/test-design/README.md` and the `PLAT-E4` plan/checkpoint projection
fields (not their approval fields, which stay exactly as previously recorded). It does not touch the
system validation report, any other epic's report, plan, or checkpoint, or any other index row.

**Validated by:** BMad TEA Test Design workflow, Validate / Epic-Level, acting as Master Test
Architect.
**Date:** 2026-09-12 (fourth same-day re-validation, after the AF-3 development-fixture exception
was declined and the dev seed was changed to journal every edge).
**Approval:** already recorded separately (2026-09-12, requester Anna Pikula); not touched, not
re-granted, and not withdrawn by this report.
