---
title: "ACM-1 CAP-3 Stage-1 coverage audit"
date: "2026-08-31"
status: "gap"
adoption: "not-adopted — pending user disposition"
spec: "SPEC-access-control-kernel-mvp"
story: "ACM-1-scenarios"
audited_scenarios_commit: "9c3b450"
---

# ACM-1 CAP-3 Stage-1 coverage audit — HALT on `ACM-1-red-tests`

## Verdict

**Coverage gap found.** The nine `ACM1-FB-01 .. ACM1-FB-09` scenario documents
are independently approved and each verifies at its recorded commit
(`approvals.yaml`, workspace `9c3b450`). They are nonetheless **not** a complete
CAP-3 Stage 1.

Two persisted rules make this decisive, and neither is a reading of mine:

- SPEC CAP-3 — "Stage-1 and Stage-2 **each** cover all thirteen database
  invariants enumerated in `database-schema.md`."
- `docs/architecture/database-schema.md` § CAP-3 invariant coverage checklist —
  "ACM-1 Stage-1 scenarios and Stage-2 evidence must each cover **every**
  invariant below. **Partial coverage is not a passing ACM-1.**"

The gap is already self-declared in the suite itself.
`docs/test-cases/access-control-kernel/README.md` states, under *Scope of this
partial dispatch*, that for `ACM-1-scenarios` "the absent-singleton adoption
cases, post-bootstrap drift and rollback, concurrency, the cross-type
`hr-admin` collision, an allowed fourth permission, and the `pg_indexes`
permission-first-index assertion are still unwritten." This audit does not
discover a new problem; it measures the declared one against the gate and
records the consequence for `ACM-1-red-tests`.

## The thirteen CAP-3 invariants against the nine approved scenarios

| # | Invariant | Status | Evidence |
| --- | --- | --- | --- |
| 1 | `Policies.type` non-null, restricted to `FR\|AR` | **Covered** | `ACM1-FB-08` cases 3 and 4 — null `type` and a third value are each rejected. |
| 2 | FR/AR row-shape `CHECK` | **Covered** | `ACM1-FB-08` cases 1 and 2 — FR-with-target and AR-without-target are each rejected. |
| 3 | Partial unique index `targetRole WHERE type='FR'` | **Partial** | `ACM1-FB-02` asserts `count = 1` after bootstrap and names the index in prose, but no scenario attempts a **second FR `hr-admin` insert** (must be rejected) or an **AR row with the same `targetRole`** (must be accepted). The checklist requires both observable outcomes. |
| 4 | Unique support key `Policies(id, type)` | **Missing** | No scenario asserts the support key exists or that the composite foreign key references it. |
| 5 | `Permissions.key` unique and immutable | **Partial** | `ACM1-FB-09` case 1 covers duplicate-key rejection. **Immutability** — "in-place key update refused at the owned mutation boundary" — is uncovered. |
| 6 | `PolicyPermissions` PK `(policyId, permissionId)` | **Covered** | `ACM1-FB-09` case 2. |
| 7 | `policyType` non-null, default `'FR'`, `CHECK (policyType = 'FR')` | **Missing** | No scenario inserts any other `policyType` value, and none asserts the default. |
| 8 | Restrictive composite FK `(policyId, policyType) → Policies(id, type)` — **AR-policy grant rejected at the database boundary** | **Missing** | Uncovered, despite being named twice as mandatory: the checklist bolds it, and `ACM-1-scenarios.invoke_dev_with` required "database rejection of AR-policy grants." |
| 9 | Restrictive FK `permissionId → Permissions.id` | **Missing** | No scenario grants an unknown `permissionId`. |
| 10 | Permission-first index `(permissionId, policyId)` via `pg_indexes` | **Missing** | Named as unwritten in the suite README. The checklist calls this out explicitly "so the story cannot stall on how to observe an index" — the observation method was supplied and still not used. |
| 11 | `UserPolicies` integrity — PK `(userId, policyId)`, FKs to `User` and `Policies` | **Partial** | `ACM1-FB-09` case 3 covers the duplicate attachment. **Bad-user** and **bad-policy** attachment rejection are uncovered. |
| 12 | `AccessControlBootstrap` — PK `key`, `CHECK (key = 'root-hr-admin')`, unique `normalizedRootEmail`, unique restricted `rootUserId`, unique restricted `policyId` | **Missing** | `ACM1-FB-04` asserts the singleton's *contents* after a successful bootstrap. No scenario attempts a second singleton, a wrong `key`, or a duplicate reference. |
| 13 | `ON DELETE RESTRICT` on all four functional-role-side foreign keys | **Missing** | No scenario deletes a granted permission, a granted policy, an attached user, or a singleton-referenced row. |

**Score: 3 of 13 fully covered, 3 partial, 7 missing.**

## CAP-3 behavior required by the Stage-1 dispatch and not authored

Each item below was named in `ACM-1-scenarios.invoke_dev_with` and/or in CAP-3's
success criteria, and has no approved scenario:

| Required CAP-3 behavior | Where it is required |
| --- | --- |
| DEC-UM-007 normalization of `ROOT_WORK_EMAIL` at lookup | CAP-3 success; `invoke_dev_with` |
| Common transaction advisory lock derived from `access-control:bootstrap:root-hr-admin`, and lock timeout failing atomically | CAP-3 success; `database-schema.md` seed contract |
| Lock-and-revalidate of singleton, User, and attachment before writes **and again before commit** | SPEC constraint "ACM-1 locks and revalidates …" |
| Absent-singleton adoption — FR `hr-admin` policy by natural key after verifying `operator`, `managedBy`, null targets | CAP-3 success; `invoke_dev_with` (explicitly "COVER … EXPLICITLY") |
| Absent-singleton adoption — an existing attachment **only** when it already belongs to the located root | same |
| Absent-singleton — attachments belonging to anyone else preserved, never adopted or transferred | same |
| Absent-singleton — a changed configured root is adopted, because nothing recorded provenance | same |
| Singleton-present — changed root email is conflicting drift: no transfer, no second attachment | CAP-3 success; SPEC constraint |
| Cross-type collision — an AR policy carrying `targetRole='hr-admin'` is never adopted, mutated, counted, or reported as drift | CAP-3 success; SPEC constraint; `invoke_dev_with` |
| Concurrent identical seeds converge to one bootstrap set with no partial state; conflicting execution fails atomically | SPEC constraint; `invoke_dev_with` ("first-run/differing-root concurrency") |
| Per-field FR-AMD-1 drift table — restore missing owned rows, preserve descriptive fields and generated ids, fail before writes on identity/authorization-bearing drift | SPEC constraint; `invoke_dev_with` |
| Atomic rollback on any conflicting drift or failure | CAP-3 success; `invoke_dev_with` |
| An approved fourth permission survives a rerun | SPEC constraint; `invoke_dev_with` |
| Later administrator attachments remain distinct and are never deleted or rewritten | CAP-3 success; SPEC constraint |

`ACM1-FB-05` is the nearest neighbour to several of these, but it is
deliberately scoped to the **undrifted** rerun: "no drift since that run (root
identity, policy fields, and grants all still match)." It proves the no-op path
only, not restore, preserve, or fail-before-write.

## Why `ACM-1-red-tests` cannot run as dispatched

`ACM-1-red-tests` carries two instructions that the current Stage-1 state puts
in direct conflict:

1. "Translate **only** the approved … scenarios into committed-red PostgreSQL
   tests."
2. "Prove **ALL THIRTEEN** CAP-3 invariants … Also prove common lock/singleton
   provenance, every absent-singleton adoption case, cross-type AR `hr-admin`
   preservation, absent-row and conflicting-email concurrency, per-field drift
   restore/preserve/fail behavior, and atomic rollback."

Nothing satisfies both. Writing the tests instruction 2 demands means authoring
the missing scenario contracts in test form — a Stage-1 act performed inside a
Stage-2 dispatch, which AD-1 prohibits ("No automated workflow or agent may
author or cross two stages in one dispatch") and which no human has approved.
Writing only what instruction 1 permits produces a Stage 2 that
`database-schema.md` already classifies as "not a passing ACM-1", so it cannot
carry `ACM-1-production`.

The consequence is asymmetric and worth stating plainly: a partial Stage 2 is a
legitimate *increment* — the approved `ACM-3-red-tests` record is exactly that,
and ACM-3 remains `in-progress` rather than done — but it is **not** a basis for
`ACM-1-production`. CAP-3's Stage-3 subject is the reviewed migration itself.
Approving a migration whose invariants 3, 4, 7, 8, 9, 10, 12, and 13 have no red
test would ship the constraints that make FR/AR type separation real with no
evidence that any of them was ever exercised.

## Mandatory halt

Do **not** dispatch `ACM-1-red-tests` as written, and do **not** dispatch
`ACM-1-production`. Downstream of ACM-1 this also holds `ACM-2` (all three
stages) and the `ACM-4R-tests` fixtures that the suite README records as
requiring "completed ACM-1 production."

This audit writes no scenario, no test, no Prisma schema, no migration, no
production code, and no `approvals.yaml` entry, and it changes neither `SPEC.md`
nor `stories.yaml`. It is not yet an adopted companion: adoption is the user's
disposition decision, on the `ACM-4` audit precedent of 2026-08-31.

## Recovery condition

Mirror the approved `ACM-4R` shape, preserving every existing story ID:

- **`ACM-1R-scenarios`** — author the missing CAP-3 contracts: invariants 3, 4,
  7, 8, 9, 10, 12, 13, the partial halves of 5 and 11, and the fourteen
  behavioral rows above. Independent Stage-1 approval, `author != approver`.
- **`ACM-1R-tests`** — one committed-red Stage-2 suite over the union of
  `ACM1-FB-01 .. 09` and the `ACM-1R` scenarios, against migrated PostgreSQL,
  invoking `npm run db:bootstrap:access-control` rather than re-implementing the
  bootstrap inline. Independent Stage-2 approval.
- **`ACM-1-production`** — unchanged in subject and scope; it becomes eligible
  only once that single complete Stage-2 record exists and verifies.

A single combined Stage 2 is preferable to two partial ones here: the thirteen
invariants are properties of one migration, and splitting them across two
approvals would leave no single record an approver could read as "CAP-3 is
proven."
