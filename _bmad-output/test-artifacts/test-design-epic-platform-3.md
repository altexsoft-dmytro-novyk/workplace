---
runScope: 'epic'
runKey: 'epic-platform-3'
epicId: 'PLAT-E3'
epicDomain: 'platform'
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicNumber: 3
workflowStatus: 'generated'
approvalStatus: 'ungranted'
validationStatus: 'CONCERNS (2026-09-12) — corrected 2026-09-12'
date: '2026-09-12'
---

# Test Design: PLAT-E3 — Access Control Kernel MVP

**Status:** Written — approval ungranted; last validation verdict CONCERNS (2026-09-12) against the pre-correction text; plan corrected the same day; **re-validation pending**.
**Scope:** Epic-level test design for the deployable, headless Access Control kernel.
**Canonical source:** `_bmad-output/planning-artifacts/platform/epics.md`, `## Epic 3: Access Control Kernel MVP`.

> **Correction record (2026-09-12).** This plan was corrected after
> [`test-design-validation-report-epic-platform-3.md`](test-design-validation-report-epic-platform-3.md)
> returned CONCERNS. That report evaluated the **pre-correction** text and is left exactly as its
> validation run wrote it — a verdict is an attestation and is never hand-edited. Its recorded
> hashes therefore no longer match this file. **A fresh Epic Validate run against this corrected
> text is required and pending**; until it completes, CONCERNS is the last verdict any validation
> actually produced. The corrections are listed in [Correction log](#correction-log).

## Executive Summary

PLAT-E3 establishes a real PostgreSQL-backed Access Control kernel: fail-closed
audience resolution, functional-role data and evaluation, a constrained base
section decision, composition in `AppModule`, and the ACM-9 resolver measurement.
The evidence boundary is intentionally headless: real Nest module, real Prisma
adapters, migrated PostgreSQL, and the public `AccessControlFacade`; no test-only
HTTP endpoint is permitted.

Eight risks score 6 or higher. The score-9 concern is a possible audience leak from
missing/inactive identities or cyclic relationship walks. The mitigation is
real-database facade evidence, not mocked repositories or a simulated route.
ACM-9 has a separate, append-only performance-evidence protocol. It is Contract B
(facade resolver) only and is never evidence for the All Employees list / `PG-04`
or the P6 resolver measurement.

Existing `test/access-control/` files and kernel scenario prose are an inventory
of intended or historical evidence, not a claim that tests pass, requirements are
covered, an approval exists, or a release gate is satisfied.

### Execution-state caveat — this epic is already implemented

**Recorded, not resolved.** Every Epic 3 story key (`3-1` … `3-8`) is `done` in
`_bmad-output/implementation-artifacts/platform/sprint-status.yaml`, and the epic's own
Requirements Inventory calls the Phase-0 ACF-1 / ACM-3 and ACM-5 acceptance criteria
**historical evidence** (SD-1). Three tracking surfaces disagree with each other, and this
plan corrects none of them:

| Surface | State | Note |
| --- | --- | --- |
| `platform/sprint-status.yaml` | `epic-2: done`, `epic-3: done` | All 8 child stories `done`. |
| `epics.md` `## Epic 2` / `## Epic 3` headers | `**Status:** in-progress` | Contradicts the tracker. |
| `epics.md` *Kernel MVP status caveat* | asserts `sprint-status.yaml` "still records `epic-3: in-progress`" | **Factually false at this HEAD** — the tracker records `done`. |
| `global-coverage/global-fr-epic-story-coverage.yaml:95` | `PLAT-E2-S2.1: in-progress` | Deliberate; lines 121–123 say it is held pending Platform Story 1.1. The epic caveat also cites this file at a `platform/` path it does not occupy. |

**Consequence for this plan.** The [QA effort estimate](#qa-effort-estimate) is *not* a forecast of
unstarted work. It sizes **evidence design and verification against already-shipped behaviour** —
writing or re-pointing the obligations below and confirming them against the current resolver — not
building the kernel. Reconciling the four surfaces above belongs to **Platform Story 1.1's
traceability matrix**; this plan neither performs nor claims it.

## Scope and Boundaries

| In scope | Explicitly not in scope | Boundary / owner |
| --- | --- | --- |
| ACM-0 root identity prerequisite | User Management API/CRUD or population import | ACM-0 only creates the one deploy-time root row; User Management owns its surfaces. |
| ACM-1 functional-role foundation | Runtime role management, `/roles`, grants API | Kernel MVP has a seed/migration-owned catalog only. UI-driven role administration (requirements §2.3) has **no named owner**; it is an open follow-up, not a silent exclusion. |
| ACM-2 FR decision, ACM-3/4 audience resolution, ACM-5 base section access | `/users` enforcement, projection, dismissed-target behavior, S2–S9/S12+ section semantics | User Management and owning projections consume the facade later. |
| ACM-8 module composition | Re-asserting the historical interim `ACCESS_CONTROL_PORT` binding | **Superseded — see `E3-C07`.** PLAT-E4-S4.1/S4.2 bound the port to `AccessControlFacadeAdapter`; the interim adapter no longer exists. |
| ACM-9 resolver evidence | Directory-list `PG-04` / DIR-A1 or P6 evidence | Contract B only; measurement job remains informational. |
| Base section **decision** for S1/S10/S11 | Colleague field-subset narrowing for S10/S11; S1 photo mutation; relationship-field writes | **Open dependency, owner unnamed** — see [Open items 6 and 7](#dependencies-assumptions-and-open-items). Requirements §3.3.4 forbids solving it in the frontend. |
| Kernel eligibility via `User.isActive` | Departure/due-date cutoff at request time | **PM/AD-20**, deferred until the Departure persistence seam exists (`docs/architecture/access-control.md:46–48`). Requirements §4.16 remains unmet by the kernel alone. |
| Revocation of platform-owned relations taking effect on the next facade call | The 15-minute project-assignment window (§5.1) | Project line is PLAT-E8. The **owned-relation** half is in scope here — see `E3-C03`…`E3-C07`. |
| HTTP denial oracle documentation alignment | Runtime 401/404/403 behaviour | `UM-E0-S0.1` (PM/AD-24). |
| PostgreSQL constraints and real deploy entrypoints | Frontend/browser tests and a new HTTP/debug endpoint | The epic is headless. |
| — | `AccessJournal` entries for relationship changes (§3.4) | `CC-07` / PM/AD-29, **P0 open** — no table exists. |

### Immutable operating rules

- Follow AD-1 ordering: scenario prose → committed-red Stage-2 evidence → production. Per-stage human approval was retired; ordinary review and CI remain.
- Stage-2 uses the public facade, real `AccessControlModule`, Prisma adapters, and migrated PostgreSQL. Do not fake a kernel-owned repository or override a User Management provider.
- Deploy-time evidence invokes `npm run db:seed` (ACM-0) and `npm run db:bootstrap:access-control` (ACM-1). Reimplementing their logic inside a test is invalid evidence.
- ACM-5 may proceed only when `acm-4-disposition.yaml` declares `disposition: no-gap`; its current artifact does so.
- ACM-8 and final ACM-9 require a persisted ACM-9 baseline with `status: PASS`; `FAIL` or `INCOMPLETE` halts them and requires separately gated remediation. The pinned baseline is named in [Open item 2](#dependencies-assumptions-and-open-items).
- **No obligation in this plan re-asserts a superseded acceptance criterion.** Where the canonical AC has been overtaken by later shipped work, the row states the superseding story and keeps only the surviving obligation.

## Risk Assessment

**Category legend.** `SEC` security · `BUS` business impact · `DATA` data integrity · `OPS` operational/deployment · `TECH` technical/architectural · `PERF` performance.
**Score** = probability × impact, each 1–3. 9 = critical, 6 = high, 4 = medium, ≤3 = low.

| ID | Category | Risk | P | I | Score | Mitigation | Owner | Timing |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |
| PLAT-E3-R01 | SEC / BUS | Missing/inactive identities, dead bridges, or cycles leak an audience. | 3 | 3 | 9 | Real PostgreSQL facade cases for viewer/target/bridge state, termination, cycles, and path-local visited state. | Platform backend | Before ACM-3 completion |
| PLAT-E3-R02 | SEC / DATA | FR and AR facts contaminate each other and widen feature or data access. | 2 | 3 | 6 | Type-separation constraint tests; FR-negative audience and `isAllowed` cases. | Platform backend | ACM-1/2/4 |
| PLAT-E3-R03 | DATA / OPS | Root normalization, bootstrap adoption/drift, or concurrent deploy leaves partial or wrong authority state. | 2 | 3 | 6 | Invoke production entrypoints; assert singleton, lock, rollback, diagnostics, restrictive FKs. | Platform backend | ACM-0/1 |
| PLAT-E3-R04 | SEC / BUS | Base section merge or an unknown section widens profile access. | 2 | 3 | 6 | Exact S1/S10/S11 access table, empty/missing target, merge precedence, and deny-by-default tests. | Platform backend | ACM-5 |
| PLAT-E3-R05 | TECH / SEC | Composition changes `/users` or exposes a debug route. | 2 | 3 | 6 | `AppModule` composition test plus scoped repository/module audit. | Platform backend | ACM-8 |
| PLAT-E3-R06 | PERF / OPS | A 500-target regression is hidden by incomplete/non-comparable evidence or misreported as list-route evidence. | 2 | 3 | 6 | `ACM9-MVP-v1` baseline/final protocol and immutable artifacts; preserve Contract B attribution. | Platform backend | ACM-9 |
| PLAT-E3-R07 | SEC | A resolution cached inside the facade or a consumer outlives a `Relationship` change, so a revoked audience survives into the next request (requirements §2.1 *Timing of revocation* [NORMATIVE]). | 2 | 3 | 6 | Same-process re-resolution evidence across a mutation, on every audience- and section-returning call. | Platform backend | ACM-3/4/5 |
| PLAT-E3-R08 | SEC / BUS | A consumer reads base `write` on `profile:identity` as a mandate over the S1 relationship fields, bypassing the dedicated permission, the self-assignment bar and the journal. | 2 | 3 | 6 | Negative obligation on `E3-C06`; the decision is asserted to be section-scoped, not field-scoped. | Platform backend | ACM-5 |

All eight risks require mitigation evidence. This table is a design-time risk register, not a final evidence assessment or release decision.

**Cross-scope risks this plan inherits** (registers owned by `test-design-architecture.md` §Risk register): **`PR-001`** projection and leak paths (SEC 3×3=9) — PLAT-E3 contributes the *decision* half only; the projection half is consumer-owned. **`PR-002`** stale graph state retains access (SEC 3×3=9, *"design in place, evidence absent"*) — `PLAT-E3-R07` is this epic's slice of it.

### Residual risk after planned mitigation

| Risk | Residual after this plan's evidence | Why it remains |
| --- | --- | --- |
| R01 | **Low.** | Fail-closed paths are directly observable through the facade on real PostgreSQL. |
| R02 | **Low.** | Enforced by database constraints, not only by test assertion. |
| R03 | **Low–medium.** | Concurrency evidence is inherently sampled; a rare interleaving can escape it. |
| R04 | **Medium.** | Only S1/S10/S11 exist. `AC-SECTION-MATRIX-01` (P1 open) covers S2–S8/S14–S16; deny-by-default is proven, correct-allow for those sections is not. |
| R05 | **Low.** | Composition and boundary are statically auditable. |
| R06 | **Medium.** | A measurement is a point observation; NFR-AC-1 re-baselining rides SD-8 for Epics 5/6/8. |
| R07 | **Medium–high.** | This plan proves *same-process* re-resolution only. Multi-instance, worker and consumer-side caching are outside the kernel boundary and remain `PR-002` evidence-absent. |
| R08 | **Medium.** | The kernel can prove its decision is section-scoped; it cannot prove a consumer honours that. Enforcement is `org:relationships:write`, owner `UM-E0-S0.1`. |

Residual risk is a design-time judgement. It is not an accepted-risk sign-off, and no waiver is granted here.

## NFR Planning

| Category | Requirement / threshold | Risk | Planned validation | Expected evidence |
| --- | --- | --- | --- | --- |
| Security | Missing/inactive data and unsupported sections fail closed. | R01, R02, R04, R05, R08 | Headless facade and constraint/entrypoint PostgreSQL tests. | Stage-2 results and module-boundary audit. |
| Security — revocation | Requirements §2.1 [NORMATIVE]: platform-owned relations (manager, PP, department) take effect on the **next request** — "no grace period, no re-login, no cache that outlives the change". No numeric window applies to the owned-relation half. | R07 | Mutate a `Relationship` between two facade calls in one process; assert the second call reflects it without restart or explicit invalidation. | Stage-2 result per audience- and section-returning call. |
| Performance | `ACM9-MVP-v1`: 500 active targets; warm p95 **and** absolute worst case ≤2 seconds, **per shape** (depths 5/25/50/100/200/300/400/499, each an independent gate — slow classes must not be aggregated away). | R06 | Baseline after ACF-1 and comparable final after ACM-8; stop on breach/timeout. | Reserved append-only ACM-9 JSON artifact with manifests, query count, and `EXPLAIN (ANALYZE, BUFFERS)`. |
| Reliability | Atomic, idempotent deploy entrypoints; no partial state after concurrent/error paths. | R03 | Real seed/bootstrap runs plus rollback and race cases. | Process result and row-level PostgreSQL assertions. |
| Maintainability | Facade/module boundary and no cross-context rewiring. | R05 | Module boot and scoped source/diff audit. | Focused E2E result, static/lint results, audit record. |

**ACM-9 framing used by this plan.** Story 3.8's own AC is *discovery* ("identify the first
target-count/depth shape that breaks two seconds"), while NFR-AC-1 / SD-8 state a pass/fail 2 s
gate. **This plan applies the discovery framing to PLAT-E3** and treats the pass/fail gate as
SD-8's obligation on Epics 5, 6 and 8, which formally carry it. `E3-C08` therefore records the
breach point; it does not assert a gate verdict.

**Unknown thresholds:** no numeric reliability or maintainability threshold is specified. No value is invented. Compliance, scalability, browser accessibility, and live third-party integration are outside PLAT-E3.

## Entry and Exit Criteria

### Entry

- [ ] Canonical PLAT-E3 acceptance criteria and the system pair remain readable.
- [ ] Migrated PostgreSQL is available; fixtures can be isolated and cleaned by ownership.
- [ ] Required Stage-1 scenario prose and committed-red Stage-2 change exist for new behavior.
- [ ] `ROOT_WORK_EMAIL` is controlled per scenario; deployment tests can invoke the named npm scripts.
- [ ] `acm-4-disposition.yaml` records `no-gap` before ACM-5; the pinned PASS ACM-9 baseline artifact is selected before ACM-8/final ACM-9.
- [ ] Each superseded canonical AC is identified with its superseding story before an obligation is written against it.

### Exit

- [ ] All PLAT-E3 P0 scenarios pass with the real module/database boundary.
- [ ] P1 failures are triaged; no open score-9 risk or unmitigated score-6+ risk remains.
- [ ] ACM-9 evidence, if executed, meets the immutable protocol and has correct Contract B attribution.
- [ ] No User Management rebinding, consumer HTTP behavior, or out-of-scope projection is claimed as PLAT-E3 evidence.
- [ ] **Defect gate (`PG-03`, restated from the platform pair):** zero unresolved leak, stale-access, self-assignment or due-departure defects in PLAT-E3 scope. Any open defect of those four classes blocks exit regardless of scenario pass count.
- [ ] Full NFR PASS/CONCERNS/FAIL assessment remains for `nfr-assess` after implementation evidence exists.

## Test Coverage Plan

Priorities describe business/security importance, not scheduling or dependency order.
Each row owns one behavioral boundary; the plan avoids a duplicate UI/API suite because
PLAT-E3 has no user-facing HTTP or browser behavior.

> **Identifier contract.** `E3-C01`…`E3-C08` follow **ACM order**, not table order:
> C01=ACM-0, C02=ACM-1, C03=ACM-2, C04=ACM-3, C05=ACM-4, C06=ACM-5, C07=ACM-8, C08=ACM-9.
> This plan and `test-design-progress-epic-platform-3.md` use the same mapping. The
> pre-correction plan numbered by priority-table position, which made `E3-C05`/`E3-C06`/`E3-C07`
> resolve to different families in each file.

### Priority criteria

- **P0** — a defect in this group can grant access that was not derived, or leave deploy-time authority state wrong. Fail-closed kernel behaviour and the authority substrate are P0 by default; the burden is on demoting a group, not promoting one. Six of eight groups qualify.
- **P1** — a defect degrades confidence or evidence quality but cannot itself widen access: a validation-only merge disposition (`E3-C05`, no production code) and an expensive measurement (`E3-C08`).
- **P2/P3** — none; see below.

> **Priority is not dependency order.** The epic's Kernel Dependency Graph makes P1 `E3-C05`
> (ACM-4) a prerequisite of P0 `E3-C06` (ACM-5), and P1 `E3-C08` (ACM-9 baseline) a gate on P0
> `E3-C07` (ACM-8). That inversion is deliberate: importance and sequencing are separate axes,
> and the gating artifacts (`acm-4-disposition.yaml` `no-gap`; a PASS ACM-9 baseline) are checked
> as **persisted state**, not as a scheduling claim. **Execution order follows the dependency
> graph; the P-label does not reorder it.**

### P0 — critical

| ID | Requirement / atomic scenarios | Level | Risk | Evidence owner | Notes |
| --- | --- | --- | --- | --- | --- |
| E3-C01 | ACM-0 normalization, blank/unmatched/ambiguous/inactive diagnostics, exact-one-before-active order, canonical storage, race convergence, no unintended CRUD. | Deploy entrypoint + PostgreSQL | R03 | Platform backend | Run the exact `db:seed` path. |
| E3-C02 | ACM-1 canonical FR bootstrap, all CAP-3 row shapes/constraints, adoption vs drift, AR `hr-admin` exclusion, rollback and concurrent runs. | Deploy entrypoint + PostgreSQL | R02, R03 | Platform backend | Run the exact bootstrap script; use direct SQL only to prove database constraints. Asserts the **shape** of the catalog, **not** its current membership — see Open item 3. |
| E3-C03 | ACM-2 active granted allow; missing/inactive/unknown/ungranted/orphan deny; no AR read or decision persistence; **no branch on `hr-admin` or on any individual permission name**; **decision re-read on each call after a grant is revoked mid-process**. | Headless facade + PostgreSQL | R02, R07 | Platform backend | No route or provider override. |
| E3-C04 | ACM-3 empty/duplicate target contract **with no relationship-graph read on an empty list**; **viewer validation ordering — viewer identity is confirmed before any audience derivation, Self included**; inactive/missing viewer/target; **no Colleague fallback for an inactive or missing party, and normal Colleague fallback for an active pair with no stronger audience**; bridge/PP failure; termination; cycles before/after viewer proof; per-target path state; **resolution re-run on each call across a `Relationship` mutation**. | Headless facade + PostgreSQL | R01, R07 | Platform backend | Assert every requested distinct key maps to an explicit set. |
| E3-C06 | ACM-5 supported S1/S10/S11 matrix, missing/empty result, `write > read > none`, unsupported sections deny; **section decision re-evaluated on each call across a `Relationship` mutation**. | Headless facade + PostgreSQL | R04, R07, R08 | Platform backend | Base decision only. **Negative obligation:** a `write` on `profile:identity` is never a mandate over the S1 *manager*, *people partner* or *department* fields — requirements §3.2 note ¹ and §2.1 *Changing a relationship is a distinct class of operation* [NORMATIVE] put those behind `org:relationships:write`, a dedicated screen, a self-assignment bar and a §3.4 journal entry. S1 photo mutation and the S10/S11 colleague field subsets remain owning-consumer projection/command rules (Open items 6–7). |
| E3-C07 | ACM-8 real `AppModule` composition; facade resolves; no User Management or HTTP/debug surface change. | Module E2E + scoped audit | R05 | Platform backend | Does not test `/users` authorization. **Superseded AC:** the canonical criterion "`ACCESS_CONTROL_PORT` remains bound to `InterimAccessControlAdapter`" was overtaken by **PLAT-E4-S4.1/S4.2** — the port binds `AccessControlFacadeAdapter` (`services/backend/src/user-management/user-management.module.ts:215`), `interim-access-control.adapter.ts` was deleted in backend `37a339a`, and `ACM8-KC-02` already asserts the facade-backed adapter. **Do not write an obligation against the interim binding and do not "restore" it.** The surviving obligations are the other three: `AppModule` imports and resolves the facade, no file under `src/user-management/**` changes, and no AC HTTP/test-only/debug endpoint is introduced. |

### P1 — high

| ID | Requirement / atomic scenarios | Level | Risk | Evidence owner | Notes |
| --- | --- | --- | --- | --- | --- |
| E3-C05 | ACM-4 Reporting+PP coexistence, Self exclusivity, Colleague floor, fact de-duplication, FR exclusion. | Headless facade + PostgreSQL | R01, R02 | Platform backend | Validation-only story; `no-gap` outcome must not conceal a behavior gap. |
| E3-C08 | ACM-9 500-target audience/depth shapes, manifests, query count, plans, baseline/final comparison and first-breach/timeout behavior; **the baseline run itself changes no file under `src/access-control/**`**. | Measurement | R06 | Platform backend | Expensive, append-only evidence; not a `PG-04` test. Discovery framing — see NFR Planning. |

### P2/P3

No separate P2 or P3 scenario is planned. Exploratory profile projection, `/users`
HTTP behavior, and frontend coverage belong to their owning consumer work, not a
lower-priority duplicate of this kernel plan.

## Acceptance-Criterion Traceability

Every canonical Epic 3 acceptance criterion maps to exactly one obligation, an explicitly
superseded marker, or a named external owner. **No row is a coverage or execution claim.**

| Story | Acceptance criterion (abbreviated) | Obligation |
| --- | --- | --- |
| 3.3 (ACM-0) | Normalize `ROOT_WORK_EMAIL` per DEC-UM-007 before validate/write/lookup | E3-C01 |
| 3.3 | Store the normalized value, then validate eligibility | E3-C01 |
| 3.3 | Count normalized matches **first**; non-one fails before `isActive` is consulted | E3-C01 |
| 3.3 | Unrelated active employees never affect the count | E3-C01 |
| 3.3 | Blank/unmatched/ambiguous/inactive fails with actionable diagnostics; a non-intended match is never adopted, mutated or reactivated | E3-C01 |
| 3.3 | Concurrent runs converge via the unique violation, re-read and re-validate; no partial state | E3-C01 |
| 3.3 | No permission/policy/grant/attachment, no UM route or runtime role management; DEC-UM-009 id reuse | E3-C01 |
| 3.3 | Unset `ROOT_WORK_EMAIL` becomes an actionable failure, not a warn-and-skip | E3-C01 |
| 3.3 | Stage-2 invokes the production entrypoint; inline reimplementation is invalid | Operating rule + E3-C01 |
| 3.4 (ACM-1) | Seed exactly the three canonical `user-management:*` permissions | E3-C02 — **shape only**; membership is Open item 3 |
| 3.4 | Exactly one `hr-admin` FR role and one bootstrap attachment | E3-C02 |
| 3.4 | Resolve the bootstrap user only via the normalized `ROOT_WORK_EMAIL`; no `position` or first-user fallback | E3-C02 |
| 3.4 | Absent/blank/unmatched/ambiguous/inactive/drifted root fails clearly and atomically | E3-C02 |
| 3.4 | Every CAP-3 database invariant (13 named constraints, `pg_indexes` assertion, `ON DELETE RESTRICT` ×4) | E3-C02 |
| 3.4 | Singleton-absent adoption rules; singleton-present drift fails atomically | E3-C02 |
| 3.4 | An AR row with `targetRole='hr-admin'` is never adopted, mutated, counted or reported as drift | E3-C02 |
| 3.4 | No `/roles` or `/users` route, no other role/permission/attachment/default grant | E3-C02 |
| 3.5 (ACM-2) | `isAllowed` reads live FR data and **contains no branch for `hr-admin` or an individual permission name** | E3-C03 |
| 3.5 | Inactive/missing users, unknown keys, absent grants, orphaned data return `false` | E3-C03 |
| 3.5 | Reads no audience data, persists/caches no decision, grants no profile audience or section access | E3-C03 |
| 3.1 (ACM-3) | One map entry per distinct requested target; duplicates collapse; **empty list returns an empty map with no relationship-graph read** | E3-C04 |
| 3.1 | **Viewer validation runs before any audience derivation, Self included**; Self exclusive only after both parties confirmed | E3-C04 |
| 3.1 | Inactive/missing viewer → empty set for every target; never Self, never Colleague floor | E3-C04 |
| 3.1 | Inactive/missing target → empty set; **never falls back to Colleague** | E3-C04 |
| 3.1 | Absent manager edge terminates cleanly; inactive endpoint treated as absent (before/after viewer proof); missing endpoint is defensive-only | E3-C04 |
| 3.1 | Inactive PP endpoint grants no PP audience and bridges nowhere | E3-C04 |
| 3.1 | Reaching the viewer is provisional; Reporting only on repeat-free termination; a cycle denies that target only | E3-C04 |
| 3.1 | **For an active pair, other valid audiences may apply; otherwise normal Colleague fallback** | E3-C04 |
| 3.1 | Ends at the audience result; owns no `canAccessSection`, no dismissed-target projection | Scope table (excluded) |
| 3.2 (ACM-4) | Reporting and direct PP may coexist | E3-C05 |
| 3.2 | Self exclusive after both confirmed; Colleague only when nothing stronger applies | E3-C05 |
| 3.2 | Duplicate facts do not duplicate results; FR never participates in merging | E3-C05 |
| 3.2 | Ends at merge; owns no `canAccessSection` | Scope table (excluded) |
| 3.2 | Validation-only exception; a gap halts Stage 2 and reopens AD-1 | Operating rule + Open item 1 |
| 3.6 (ACM-5) | Only S1/S10/S11 supported; every other section `none` | E3-C06 |
| 3.6 | Absent target entry or empty audience set → `none` | E3-C06 |
| 3.6 | S1 `read` for Self and Colleague, `write` for Reporting and direct PP | E3-C06 |
| 3.6 | S10 and S11 `read` for every Phase-0 audience | E3-C06 (decision) + Open item 6 (field narrowing) |
| 3.6 | Multiple audiences merge `write > read > none` | E3-C06 |
| 3.6 | S1 photo mutation and S10/S11 colleague subsets are owning-consumer rules | Open items 6–7 |
| 3.7 (ACM-8) | `AppModule` imports `AccessControlModule` and resolves `AccessControlFacade` | E3-C07 |
| 3.7 | No file under `src/user-management/**` changes | E3-C07 |
| 3.7 | `ACCESS_CONTROL_PORT` remains bound to `InterimAccessControlAdapter` | **SUPERSEDED** by PLAT-E4-S4.1/S4.2 — no obligation written; see E3-C07 |
| 3.7 | No `/users` behaviour change, no AC HTTP/test-only/debug endpoint | E3-C07 |
| 3.8 (ACM-9) | **Baseline runs after ACF-1 without changing behaviour under `src/access-control/**`** | E3-C08 |
| 3.8 | Record p50, p95, worst case, breadth/depth, query count, PG version, `EXPLAIN (ANALYZE, BUFFERS)` | E3-C08 |
| 3.8 | Identify the first target-count/depth shape that breaks two seconds | E3-C08 |
| 3.8 | Separately determine whether `SET LOCAL statement_timeout = '2s'` is the earlier failure point | E3-C08 |
| 3.8 | Rerun after ACM-8; optimization is a separate gated story; no `/users` NFR claim | E3-C08 |
| §2.1 [NORMATIVE] | Owned-relation revocation effective on the next request, no cache outliving the change | E3-C03, E3-C04, E3-C06 (R07) — **not** a canonical Epic 3 AC; added because the epic claims PM-FR-2 |
| §3.2 note ¹ / §2.1 | Manager, PP and department are not writable through S1 | E3-C06 negative obligation; enforcement owner `UM-E0-S0.1` |

## Execution Strategy

- **PR:** run all focused functional PLAT-E3 suites when they fit within the repository's normal test budget: ACM-0/1 entrypoints, ACM-2/3/4/5 facade suites, ACM-8 composition, plus unit/static checks. Use real PostgreSQL and owned fixture cleanup.
- **Nightly / release candidate:** run ACM-9 because it is deliberately expensive and emits immutable performance artifacts.
- **Weekly:** no additional PLAT-E3-only suite. Investigate persistent measurement or isolation flakes from recorded artifacts.

Run everything in PRs unless it is expensive or long-running; this plan does not create a redundant smoke/P0/P1 execution ladder.

## QA Effort Estimate

Sizing **evidence work against already-shipped behaviour** — see the
[execution-state caveat](#execution-state-caveat--this-epic-is-already-implemented). These are not
estimates to build the kernel.

| Priority | Scope | Estimated effort |
| --- | --- | --- |
| P0 | Six core scenario families, fixtures, deploy-entrypoint and module-boundary evidence | ~40–64 hours |
| P1 | Merge disposition and ACM-9 measurement evidence | ~16–30 hours |
| P2/P3 | No separate work planned | N/A |
| **Total** | Test-design implementation and evidence setup | **~56–94 hours (~2–4 weeks)** |

Ranges include PostgreSQL fixture/cleanup work and evidence capture. They are planning estimates, not progress tracking.

## Design Quality Criteria

**Thresholds carried from the platform pair** (`test-design-qa.md` § *Gate thresholds carried from the handoff*), quoted rather than paraphrased:

> Three thresholds survive unchanged: **P0 = 100 % covered · P1 = ≥ 95 % covered · the access-control suite passes.**

- All three are carried here unchanged, including the third. *Covered* is the pair's word and is **not** interchangeable with *passes*: the pair's own [coverage-state vocabulary](test-design-qa.md) keeps a present scenario document, a committed-red Stage-2 test, and green production code with the suite executing in CI as three states that must never collapse (`PR-009`).
- **This plan computes, asserts and publishes no coverage percentage against any of them.**
- Every score-6+ risk has the mitigation named in this plan; the score-9 audience-leak risk cannot be waived by a mock, debug endpoint, or consumer-route test.
- All in-scope acceptance-criterion groups have an explicitly selected evidence boundary — see [Acceptance-Criterion Traceability](#acceptance-criterion-traceability). No aggregate coverage percentage is claimed by this plan.
- Security, performance, reliability, and maintainability each have an identified evidence source. `nfr-assess` makes any later PASS/CONCERNS/FAIL assessment.
- These are design criteria, not an approval, test-execution result, or release-readiness gate.

## Dependencies, Assumptions, and Open Items

1. **ACM-4 prerequisite:** current `acm-4-disposition.yaml` says `disposition: no-gap` and `acm_5: unblocked`; a future missing scenario or behavior gap must halt and restart the AD-1 sequence rather than bypass it.
2. **ACM-9 prerequisite — baseline pinned.** Six baseline artifacts exist under `_bmad-output/test-artifacts/performance/` (five `PASS`, one `INCOMPLETE`). This plan pins the pair the platform QA document names as the immutable Contract B evidence at commit `3a3cd71`: baseline `acm9-baseline-acm9-1788721821722-afd2fdac4a45.json` with final `acm9-final-acm9-1788722145229-13b089a4cb9f.json`, which records that baseline's run ID. Selecting a different baseline is a deliberate change and must be stated. A `FAIL` or `INCOMPLETE` baseline halts composition/final evidence and requires separately gated remediation.
3. **FR catalog drift — owner named.** PLAT-E3's ACM-1 criterion states three canonical permissions; the shipped bootstrap holds six. The reconciliation is tracked as **DEPT-2** (return `CANONICAL_PERMISSIONS` to five by dropping `profile:timeline:write`, and make career-timeline write a dual gate) with test fallout as **DEPT-4** — both in `dept-epic.md`, **not** in Epic 4, which is `done`. Two corrections to the pre-correction text: the "older three-key test lock is stale" statement no longer holds — `acm1r-fr-foundation.e2e-spec.ts` derives its keys from the exported `CANONICAL_PERMISSIONS` (`dept-epic.md` GAP-1, closed 2026-09-08); and the sixth key is not merely a counting question. `profile:timeline:write` is a **recorded, PO-accepted, time-boxed deviation from requirements §2.2/§2.3** (`s42a-op-06`, ruling AF-2): its `canEditTimeline` gate has no audience half, so a seeded `hr-admin` can write any person's career timeline. Accordingly **`E3-C02` asserts the CAP-3 catalog's *shape* and must not canonize the present six-key membership as an invariant** while DEPT-2 is open.
4. **Reconciliation open at both ends.** This plan routes the three-versus-six `hr-admin` question to the E4 line; the `PLAT-E4` validation report records it as **unreceived** there. Until DEPT-2 is scheduled, the dependency has **no accepting owner** and is carried here as open, not as delegated.
5. **Consumer boundary:** `/users` rebinding, projection, and actual consumer HTTP E2E are deliberately not kernel proof. They need their separate User Management-owned story (`UM-E0-S0.1`).
6. **S10/S11 Colleague field narrowing — owner unnamed.** Requirements §3.2 gives Colleague only *dates without leave type* on S10 and *project name only* on S11, and §3.3.4 forbids implementing it by hiding fields in the frontend — "the API must not return them". ACM-5 grants Colleague plain `read` on both and delegates narrowing to the owning consumer, but **no epic, story or gate is named**. Open follow-up; a leak here is a §3.3.1 critical defect.
7. **S1 photo mutation** is likewise an owning-consumer command rule with no named owner in this epic.
8. **Departure / PM/AD-20:** kernel eligibility uses `User.isActive` only. Requirements §4.16 requires all access of a departed person to end immediately; request-time due/departure enforcement is **deferred until the Departure persistence seam exists** (`docs/architecture/access-control.md:46–48`). Recorded as a named deferral, not a silent exclusion.
9. **Journal (§3.4):** `CC-07` / PM/AD-29 is **P0 open** — no `AccessJournal` table exists, so no relationship-change journal obligation can be closed by this epic.
10. **Pact/browser tools:** PLAT-E3 has no consumer/provider or UI acceptance criterion. SmartBear Pact MCP was unavailable, and `playwright-cli` was not installed; neither absence blocks this headless plan.
11. **Not evaluated by this plan:** `test-design-architecture.md` and `test-design-qa.md` were read for the thresholds and contracts cited above. This plan does not attest that its isolation or execution choices are consistent with every other policy in that pair.

## Interworking and Regression

| Component | Impact | Regression boundary |
| --- | --- | --- |
| `services/backend/src/access-control/` | Owns kernel behavior. | Focused real-PostgreSQL ACM suites and ACM-9 protocol. |
| `AppModule` | Imports AccessControlModule at ACM-8. | Module composition only; no added HTTP endpoint. |
| `services/backend/src/user-management/` | Consumes the kernel through `ACCESS_CONTROL_PORT`, bound to `AccessControlFacadeAdapter` since PLAT-E4. | Audit that no file under it changes at ACM-8; adoption behaviour and `/users` authorization belong to `UM-E0-S0.1`. |
| PostgreSQL schema / deploy scripts | Enforces root/bootstrap and FR integrity. | Migrated DB, named seed/bootstrap entrypoints, raw constraint probes. |
| Platform system design pair | Owns shared evidence, NFR, isolation and gate policies. | This plan **quotes** the gate thresholds and the Contract B protocol where an obligation depends on them, and references the pair for everything else. It does not redefine a threshold or a contract. |

## Correction log

Applied 2026-09-12 after validation CONCERNS. Ordered by severity.

| # | Correction | Source finding |
| --- | --- | --- |
| 1 | `E3-C07` no longer re-asserts the interim `ACCESS_CONTROL_PORT` binding; the AC is marked superseded by PLAT-E4-S4.1/S4.2 with the three surviving obligations kept. Scope table, `R05` and the Interworking row corrected to match `main`. | Requirements review F1 |
| 2 | Coverage IDs renumbered to ACM order, matching the checkpoint; identifier contract stated. | Validation F-1 / review F7 |
| 3 | §2.1 revocation timing added as `PLAT-E3-R07`, an NFR row, and per-call obligations on `E3-C03`/`C04`/`C06`. | Requirements review F2 |
| 4 | Execution-state caveat added; the estimate is reframed as evidence work against shipped behaviour. | Validation F-2 |
| 5 | Acceptance-Criterion Traceability table added; the five previously unnamed ACs carry obligations. | Validation F-3 |
| 6 | Pair gate thresholds quoted verbatim, the access-control-suite clause restored, *covered* ≠ *pass* stated; the Interworking "references rather than restates" claim corrected. | Validation F-4 |
| 7 | Priority criteria added; the P1-gates-P0 inversion stated and reconciled with the Kernel Dependency Graph. | Validation F-5 |
| 8 | `E3-C06` negative obligation: base `write` on `profile:identity` is not a mandate over the §3.2 ¹ relationship fields; `PLAT-E3-R08` added. | Requirements review F5 |
| 9 | Open item 3 rewritten — DEPT-2/DEPT-4 named, the stale-test-lock claim retired, the AF-2 deviation stated, `E3-C02` scoped to catalog shape. | Requirements review F3 / validation F-7 |
| 10 | S10/S11 Colleague narrowing and S1 photo mutation recorded as open dependencies with owner unnamed. | Requirements review F6 |
| 11 | Added residual-risk table, `PG-03` defect exit gate, risk-category legend, per-priority criteria, `PR-001`/`PR-002` linkage. | Validation F-6 |
| 12 | ACM-9 baseline pinned to the `3a3cd71` pair; discovery-vs-gate framing stated. | Validation F-7 / review §4 |
| 13 | PM/AD-20 departure deferral named with its identifier; `CC-07` journal gap recorded. | Requirements review F8 |
| 14 | The `hr-admin` reconciliation recorded as open at both ends with no accepting owner. | Validation cross-link |

The pre-correction draft of this pass also appended a remediation record to the validation report
itself. That was withdrawn: the report is written by a Validate run, and a correction pass editing
it blurs who attested what. This log is the correction record; the report stays as its run left it.

Not applied: the canonical `epics.md` *Kernel MVP status caveat* is itself factually wrong about
`sprint-status.yaml` and cites `global-fr-epic-story-coverage.yaml` at a path it does not occupy.
Correcting the epic source is **Platform Story 1.1's** traceability work and is outside this
plan's allowed file set; the discrepancy is recorded in the execution-state caveat above.

## Approval

No approval is granted by this Create run or by this correction. Human review may approve this
plan; validation is a separate Epic Validate operation and returned **CONCERNS** on the
pre-correction text. A correction pass cannot clear a validation verdict — only a fresh Epic
Validate run against this text can, and it has not yet run.

## References

- Canonical epic: `_bmad-output/planning-artifacts/platform/epics.md` — `## Epic 3: Access Control Kernel MVP`.
- Shared policy: `_bmad-output/test-artifacts/test-design-architecture.md` and `_bmad-output/test-artifacts/test-design-qa.md`.
- Normative requirements: `docs/project-requirements.md` §2.1, §2.2, §2.3, §3.2 (incl. note ¹), §3.3, §3.4, §4.16.
- Binding architecture: `docs/architecture/access-control.md`, `testing-strategy.md`, `database-schema.md`, `nestjs-di-tokens.md`, and `domain-driven-design.md`.
- Cross-epic: `_bmad-output/planning-artifacts/platform/dept-epic.md` (DEPT-2, DEPT-4), `test-design-validation-report-epic-platform-4.md`.
- Existing evidence inventory: `services/backend/test/access-control/`, `services/backend/test/measurement/acm9/`, and `docs/test-cases/access-control-kernel/`.

### Knowledge-base appendix

Applied from `.agents/skills/bmad-testarch-test-design/resources/knowledge/`:
`risk-governance.md` (register shape, residual risk), `probability-impact.md` (1–3 scales, the
scores above), `test-levels-framework.md` (deploy-entrypoint / headless-facade / module-E2E /
measurement level selection), `test-priorities-matrix.md` (P0–P3 criteria), `nfr-criteria.md`
(the four NFR categories and the unknown-threshold rule), `overview.md`, `api-request.md`,
`auth-session.md`, `recurse.md`. **Not applicable:** `playwright-utils-mandate.md` and the six
`pactjs-*` / `pact-mcp.md` documents — PLAT-E3 is headless with no browser target and no
consumer/provider boundary.

**Workflow:** `bmad-testarch-test-design` · **Run key:** `epic-platform-3`
