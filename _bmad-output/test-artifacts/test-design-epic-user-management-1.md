# Test Design — Epic: User Management 1, Employee Record Management

> ## Status: **ungranted**. This is a new document and inherits nothing.
>
> - **Approval:** ungranted. No human has approved this document.
> - **Validation:** NOT RUN. No verdict of any kind is claimed here.
> - **Coverage:** none asserted. This document plans and records; it does not state that any
>   test exists, that any suite passes, or that any gate is green. **No pass rate appears
>   anywhere in it.**
> - **Provenance:** the obligations below were migrated out of `test-design-qa.md`,
>   `test-design-architecture.md`,
>   [`test-design-epic-user-management.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-epic-user-management.md),
>   [`test-design-epic-frontend.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-epic-frontend.md) and `test-design/people-management-handoff.md` as they
>   stood at `76a7220701ac6f16843dad8b303934f9a958b54c`. Several of those sources carried a
>   human approval dated 2026-08-25. **That approval does not transfer to this document.**

## Identity

| Field | Value |
| --- | --- |
| `epicId` | `UM-E1` |
| Epic title | Employee Record Management |
| `epicDomain` | `user-management` |
| `epicNumber` | `1` |
| `epicSourcePath` | `_bmad-output/planning-artifacts/user-management/epics.md` |
| Source heading | `### Epic 1: Employee Record Management`; `## Epic 1: Employee Record Management` |
| Stories in scope | `UM-E1-S1.1` import seeded population · `UM-E1-S1.2` identity card and profile `PATCH` · `UM-E1-S1.3` self uploads own photo · `UM-E1-S1.5` list with pagination and filters |
| `runKey` | `epic-user-management-1` |
| Baseline commit | `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`) |
| Migration record | `_bmad-output/test-artifacts/test-design/migration-map.md` |

**Date:** 2026-09-10
**Author:** Test-design consolidation migration, Task 3 (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`)
**Status:** Draft — **approval ungranted**, validation **NOT RUN**

---

## What this plan owns, and what it does not

This plan owns **the scenario and risk coverage specific to `UM-E1`**, across **both** of its
test levels: the backend record/list obligations and the frontend identity-card and
import-summary obligations belong to the same product epic, so they live in **one** plan with
separate test-level subsections. Everything shared is owned elsewhere and is **referenced,
never restated**:

| Shared rule | Owner |
| --- | --- |
| Risk identity, scores, rationale, residual risk, testability gaps | `test-design-architecture.md` § Risk register / § Testability gaps |
| Evidence contracts, execution and isolation policy, level strategy, gates, risk → evidence map, cross-epic regression map, NFR measurement contracts, QA improvement backlog | `test-design-qa.md` |
| Canonical epic identities and the `epic-{domain}-{number}` naming contract | `test-design-architecture.md` § Domain navigation |

**Level vocabulary.** `component` means jsdom with the network mocked — no browser, no HTTP,
no database. It is **not** interchangeable with Playwright e2e figures. `api-e2e` means real
HTTP against a real PostgreSQL. `contract (Pact)` is the consumer/provider oracle across the
frontend↔backend seam. Definitions live in `test-design-qa.md` § Evidence levels and what each
one proves.

---

## Risks carried by this epic

Scores and rationale are **defined** in `test-design-architecture.md`; this table records
which of them this epic is the mitigation owner for, and re-scores nothing.

| Risk | Category / score | Statement | Mitigation direction here |
| --- | --- | --- | --- |
| `legacy-um:R-006` | TECH **4** | A Prisma unique violation surfaces as `500` instead of `409`. | Owner: `UM-E1` (import/profile writers). Authority: `docs/architecture/api-conventions.md` stable error mapping. Evidence direction: `unit` (mapper) + `api-e2e`. |
| `legacy-um:R-007` | DATA **4** | Normalization drift between the API and the database. | DEC-UM-007 **KEPT** and reconciled to the import writer; normalization is **canonical at write**. Evidence direction: `unit` + `api-e2e`. |
| `legacy-um:R-011` | BUS **2** | A rehire could create a second identity. | DEC-UM-009 **KEPT** and reframed to the seed/import writer: *no writer creates a second row for a normalized email that already exists*. Evidence direction: `api-e2e` (import). |
| `um-epic:R-UM-06` | DATA 3 × 1 = **3** | Nullable identity fields are never asserted null. | The same product epic owns the backend projection and the frontend card render, so both test levels live in this one plan. Merges with the identity-card null case of `fe-epic:R-FE-02`. Evidence direction: `unit` (projection) + `component` (render) + `contract (Pact)`. |
| `um-epic:R-UM-08` | TECH **2** | E2E specs address `/users` while production serves `/api/v1/users`. | Covered by the `contract (Pact)` provider run, per the source. **Status "Monitor" is preserved; it is not upgraded to closed.** |
| `fe-epic:R-FE-02` *(frontend subsection)* | TECH 3 × 3 = **9** | E2E fixtures are the only definition of what the backend sends; a contract run found nulls that no fixture produces. | **Merged** with `um-epic:R-UM-06` — the two are the nullable-identity-field gap on opposite sides of the same seam, and the `contract (Pact)` suite is the shared oracle. Evidence direction: `component` + `contract (Pact)`. |

---

## Coverage — backend

**Nothing below is a coverage claim.** Each row is an obligation with a named owner and a
named evidence level; no row asserts that the evidence exists or passes.

### Unit

| Obligation | Priority | Subject | Cases | Authority |
| --- | --- | --- | ---: | --- |
| `um-epic:cluster/s1-card-projection-nullables` | — | Identity-card field projection with nullable fields. | 6 | `UM-E1-S1.2`. Pairs with the frontend identity-card cases in this same plan. |
| `um-epic:cluster/directory-pagination-arithmetic` | — | `totalPages` and page-boundary arithmetic. | 3 | `UM-E1-S1.5`. Pagination arithmetic stays with `UM-E1`: its acceptance criteria own "a page of results plus pagination metadata (FR-15)", and only dynamic custom fields, saved views, export and inline editing pass to the platform directory scope. Owning scenario: `list/um-list-01-pagination-and-metadata.md`. |
| `um-epic:cluster/directory-filter-pruning-and-whitelist` — **half (a)** | — | Rejecting unsafe and unknown filters on the **existing identity-field** list. | see note | `UM-E1-S1.5` scope: "permission-safe visible identity fields and employment status. Technical `ttId` and `isActive` are **never** public filters." Owning scenario: `list/um-list-09-unsafe-and-unknown-filters-rejected.md`. |
| `um-epic:cluster/import-row-parsing-skip-taxonomy` | — | CSV row parsing and the skip/error taxonomy. | 9 | `UM-E1-S1.1` "import seeded population"; DEC-UM-007's import-source paragraph names the exact CSV contract. |
| `legacy-um:TD-UM-DOM-01` | `P2` | Uniqueness mapper unit. | — | **Merge.** Origins: `legacy-um:TD-UM-DOM-01` and the error-mapping half of `um-epic:cluster/import-row-parsing-skip-taxonomy`. Already at the right level in the source. |

> **Note on the split cluster.** `um-epic:cluster/directory-filter-pruning-and-whitelist` is a
> **7-case** cluster split across two owners: half (a) here, half (b) the `PM-FR-5`
> anti-inference property (including **result-count differencing**) on custom fields in
> `test-design-epic-user-management-7.md`. **The ledger states no per-half case count, and
> none is invented here.** The 7 cases are counted once, across the two plans.

### api-e2e (real HTTP + PostgreSQL)

| Obligation | Priority | Subject | Disposition and authority |
| --- | --- | --- | --- |
| `legacy-um:TD-UM-REG-02` | `P1` | Unauthenticated import → `401`. | **replace.** The `401`-on-no-session invariant survives with a changed subject: DEC-UM-006's 2026-09-02 transport note fixes the route as `POST /users/import`. Successor scenario `seed/um-seed-11-import-unauthenticated.md` exists. Cross-referenced from `test-design-epic-user-management-0.md` as one **instance** of the PM/AD-24 route-class oracle. |
| `legacy-um:TD-UM-REG-03` | `P1` | Import without capability → `403`. | **replace.** The same `user-management:create` permission key gates the same class of denial on the replacement route (DEC-UM-006 transport note). Successor scenario `seed/um-seed-10-import-without-capability-forbidden.md`. Actor rule (`legacy-um:C-04`) applies and is owned by `test-design-qa.md`. |
| `legacy-um:TD-UM-REG-04` | `P1` | Import-writer identity reuse. | **replace, and the assertion is restated, not relocated. The expected outcome inverts.** DEC-UM-009: no writer creates a second row for an existing normalized email, and a CSV row matching `ROOT_WORK_EMAIL` **updates the ACM-0 root `User` in place**. A duplicate normalized email therefore **no longer produces `409`**. The surviving invariant is "exactly one `User` row per normalized email, ever", evidenced by idempotent re-import (`seed/um-seed-08-idempotent-re-import.md`, `seed/um-seed-03-bootstrap-hr-admin-and-root-id-reuse.md`). DEC-UM-007 records that `users_workEmail_key` indexes the **raw** stored value, so normalized uniqueness is a **writer-side** guarantee — the test targets the writer, not the constraint. |
| `legacy-um:TD-UM-REG-05` *(no-session half)* | `P1` | Completing seed/import establishes **no** session. | **replace.** DEC-UM-008 states it ("completing seed/import does not establish a session, and there is no separate invite path"), but the trigger moves from a create route to the import writer. Scenarios: `seed/um-seed-02-no-post-users-create-path.md`, plus the no-session assertion on the import response. `legacy-um:C-07` carries the "no session in body or headers" check. |
| `legacy-um:TD-UM-REG-06` | `P1` | Invalid import input. | **replace, with two successors.** DEC-UM-006's transport note splits it: (a) a structurally invalid file (no `file` part, non-CSV, header mismatch, unparseable) → **`400`, nothing written** — an HTTP assertion unit-level parsing cannot make; (b) row-level errors → **`200` with a per-row `skipped` / `errors[]` summary** (`seed/um-seed-09-malformed-rows-skipped.md`). The unit cluster above covers half (b) only. |
| `legacy-um:TD-UM-REG-07` | `P1` | Duplicate `ttId` → `409`. | **preserve, recorded as an obligation with no current trigger and no closable path.** The delivered `docs/Accounts_template.csv` has no employee-id column (DEC-UM-007), so `ttId` (PM/AD-13) has no source and is `null` at import — no writer can produce a duplicate. Blocker **`TT-IDENTITY-01` is P0 open** and names the cause. **Evidence contract: `none-yet`, blocked on `TT-IDENTITY-01`.** The `ttId is null` half is exercised by `seed/um-seed-07-null-source-fields.md`. Not dropped: it is a real PM/AD-13 invariant with a named unblock condition. |
| `legacy-um:TD-UM-REG-08` | `P1` | Concurrent duplicate `workEmail`, `@concurrency`. | **replace, with a coverage gap recorded rather than assumed closed.** The subject moves to the import writer. **No `@concurrency` scenario exists in the `seed/` suite** — `um-seed-08` is a *sequential* re-import, a different property. Under DEC-UM-009 the relevant race is two writers reaching the same normalized email at once, and the DB index is on the **raw** value, so the writer-side guarantee is exactly what a race defeats. Feeds the open concurrency-coverage item `legacy-um:G-15`. Evidence: `api-e2e @concurrency` — **no current scenario**. |
| `legacy-um:TD-UM-REG-09` | `P1` | Malformed `workEmail`. | **replace.** This one falls entirely on the **row-level** half: a malformed `Email` in one CSV row is a row error, not a structurally invalid file, so the outcome is `200` with that row in `skipped`/`errors[]` — **not `400`**. Carrying the `400` forward would assert the wrong status. Scenario: `seed/um-seed-09-malformed-rows-skipped.md`. |
| `legacy-um:TD-UM-REG-11` | `P2` | Email normalization — trim + lowercase on write and lookup. | **preserve, for the normalization half only.** DEC-UM-007 is KEPT; identity is canonical **at write** (`seed/um-seed-01-import-success.md`). **The source row's "normalized duplicates → `409`" clause does not survive** and is not carried — it is the same inverted outcome recorded on `TD-UM-REG-04`. Recorded explicitly so the `409` is not transported inside a `preserve`. |
| `legacy-um:TD-UM-REG-12` | `P2` | Rehire identity preservation. | **preserve.** DEC-UM-009 KEPT, reframed: a CSV row matching `ROOT_WORK_EMAIL` updates the ACM-0 root `User` in place with the same `id` / `createdAt` / `createdBy`. Scenario: `seed/um-seed-03-bootstrap-hr-admin-and-root-id-reuse.md`. DEC-UM-009 also records that a dedicated rehire/reactivation endpoint stays out of scope and must reuse the existing `User` id when it lands — carried as a **forward constraint, not a current obligation**. |
| `legacy-um:TD-UM-PF-01` | `P1` | Manager-line `PATCH` persists. | preserve. `UM-E1-S1.2`. |
| `legacy-um:TD-UM-PF-02` | `P2` | Self photo upload. | preserve. `UM-E1-S1.3`. **Priority P2 is preserved with its recorded rationale** — "acceptable workaround; does not block identity/authentication" — an explicit 2026-08-25 decision. It is not renormalised. |
| `legacy-um:TD-UM-PF-03` | `P1` | `PATCH` uniqueness conflict. | preserve. `UM-E1-S1.2`; DEC-UM-007. The source states PF-03 and PF-04 jointly; they are two distinct IDs so each resolves independently. |
| `legacy-um:TD-UM-PF-04` | `P1` | `PATCH` uniqueness conflict, second case. | preserve. `UM-E1-S1.2`; DEC-UM-007 normalized-email uniqueness. |
| `legacy-um:TD-UM-DEACT-02` + `legacy-um:TD-UM-LIST-04` | `P1` | A dismissed employee is hidden by default and findable through an **authorized employment-status filter**. | **merge — two origins, one successor behaviour.** `P1` is inherited from `TD-UM-DEACT-02`, the higher-priority origin; that source classification is the authority for the `TD-UM-LIST-04` `P2` → result `P1` change. `deactivation/README.md` names it "the one surviving observable behaviour" and `UM-E1-S1.5`'s acceptance criteria state it verbatim. The subject changes from `isActive` to the lifecycle-owned employment status (PM/AD-22; DEC-UM-007 sets `isActive: true` for **every** imported row). **`isActive=false` as a filter has no successor as written** and is not transported: `UM-E1-S1.5` says `ttId` and `isActive` are never public filters. Scenarios: `list/um-list-05-dismissed-hidden-by-default.md` + `list/um-list-06-dismissed-findable-via-authorized-filter.md`. **Dead citation recorded (ledger §6, F-16), source not modified:** `deactivation/README.md` still points at the pre-split `um-list-05-dismissed-employee-filterable.md`. |
| `legacy-um:TD-UM-LIST-01` | `P1` | Pagination metadata. | preserve. `UM-E1-S1.5`. Evidence: `unit` (arithmetic) + `api-e2e`. |
| `legacy-um:TD-UM-LIST-02` | `P1` | Single filter, country. | preserve. `UM-E1-S1.5`. |
| `legacy-um:TD-UM-LIST-03` | `P1` | Compound filters. | preserve. `UM-E1-S1.5`. |
| `legacy-um:TD-UM-CT-01` | `P0` | `joined_company` written in the **import row transaction**. | **replace.** DEC-UM-008: the `joined_company` `UserEvents` row is still written at import — synchronously, in the same transaction as the row insert (AD-11 / Epic 3 pattern). The trigger changes; the **atomicity obligation is unchanged**. Scenario: `seed/um-seed-13-joined-company-event-in-row-transaction.md`. Cross-references `UM-E3`. Related open blocker recorded, not inherited: `CC-09` stays **P0 open** because `idempotencyKey` exists nowhere in the schema or `src/` — that gates retry-safety, not this atomicity assertion. |
| `legacy-um:TD-UM-EXP-03` — **half (a)** | `P2` | Deterministic **default** sort on the existing list. | **replace, split across two owners.** Half (a) is `UM-E1-S1.5` (`list/um-list-11-deterministic-default-sort.md`); half (b), the server-side **sort control** and its stability across sortable columns, is `PMC-E1-S1.3` in `test-design-epic-platform-capabilities-1.md`. The source's conditional ("if sort specified") is discharged — both halves now have a named owner. The current aggregate priority is `P2`, fixed by `P2-PLAT-02`; this is the authority for the source `P3` → result `P2` change. Evidence: `api-e2e` + `unit`. |

---

## Coverage — frontend

**`component` = jsdom with the network mocked.** These are not Playwright e2e cases and must
never be counted as such.

### Unit

| Obligation | Subject | Cases | Authority |
| --- | --- | ---: | --- |
| `fe-epic:unit/employeeFormatters.ts` | `getInitials`, `formatBirthday`, `formatIsoDate`, `fullName`. | 12 (P1) | Identity-card presentation; `UM-E1-S1.2`. |

### Component (jsdom, network mocked)

| Obligation | Subject | Cases | Authority |
| --- | --- | ---: | --- |
| `fe-epic:component/identity-card-nulls` | One case per nullable identity field. | 5 (P0) | **Merge.** Origins: `fe-epic:component/identity-card-nulls` and `um-epic:cluster/s1-card-projection-nullables` — the same defect class on both sides of the seam. |
| `fe-epic:component/import-summary` | Partial success is **not** an error. | 3 (P2) | `UM-E1-S1.1` import. |

### Contract (Pact)

The nullable-identity-field seam (`um-epic:R-UM-06` / `fe-epic:R-FE-02`) and the
`/api/v1` prefix risk (`um-epic:R-UM-08`) are both discharged through the provider run.
The contract suite's execution slot and isolation policy are owned by
`test-design-qa.md` § Execution strategy → Contract.

---

## Decisions and gaps landing here

| Item | Statement | Evidence level | Authority |
| --- | --- | --- | --- |
| `legacy-um:A-05` | Nullable omitted columns return present-and-`null` (both test levels). | `unit` + `component` + `contract (Pact)` | **Independently re-derived twice since 2026-08-25** — `um-epic:R-UM-06` and `fe-epic:R-FE-02` both found this exact gap, and the contract run confirmed the backend returns nulls that no fixture produced. The old "not explicitly sourced" flag is now a live, evidenced obligation. |
| `legacy-um:G-04` | Import → `joined_company` atomicity. | `api-e2e` | **replace** — trigger changed to import (DEC-UM-008); the atomicity obligation is unchanged. |
| `legacy-um:G-06` | Self `PUT /users/:id/photo` negative — self cannot upload **for another user**. | `api-e2e` | **`UM-E1-S1.3` confirmed as owner; access control is a dependency, not the owner.** `epics.md` defines "Story 1.3: Self Uploads Own Photo" and states "Self reads S1 and can write only their photo through Story 1.3". The denial half travels with that story; Access Control supplies the PM/AD-24 denial oracle as a **dependency**. The source's `(or access-control)` alternative is resolved: it is not access-control-owned. |
| `legacy-um:G-10` | `workEmail` trim/lowercase normalization and normalized uniqueness. | `unit` + `api-e2e` | DEC-UM-007; carried by `TD-UM-REG-11`. |
| `legacy-um:G-12` | Rehire reuses the existing `User`; no duplicate normalized identity. | `api-e2e` | DEC-UM-009; carried by `TD-UM-REG-12`. |

---

## Gate

| Gate | Content |
| --- | --- |
| `legacy-um:handoff/Epic 1` gate | **replace.** The handoff named `TD-UM-REG-01`, `TD-UM-DEACT-01` and `TD-UM-AC-01`. Canonical Epic 1 is **"Employee Record Management"** (`UM-E1`, stories 1.1 / 1.2 / 1.3 / 1.5). **Two of the three named gate scenarios retire under [v1.5-no-create]**, and `TD-UM-AC-01` moves to `UM-E0`. The gate is restated against the surviving import/list/profile obligations above. Evidence level: `api-e2e`. **Ungranted — no gate is asserted green.** |

Gate identity, thresholds and the `allow_gate=false` boundary are owned by
`test-design-qa.md` § Release and design gates.

---

## Retired at migration — recorded so it is not reintroduced

| Retired | Authority | What survives |
| --- | --- | --- |
| `legacy-um:TD-UM-REG-01` (HR Admin creates a user, `201`, `isActive:true`) | **[v1.5-no-create].** `registration/README.md` names the successor by file: `seed/um-seed-01-import-success.md` ("one canonical `User` row per seeded employee; normalized `workEmail`; `joined_company` per row"). | The "an employee row exists after the population enters the system" intent, at `UM-E1-S1.1`. **The `201` HTTP-create assertion has no successor.** The `isActive:true` half survives for a *different* reason than it was written for: DEC-UM-007 sets `isActive: true` for every imported row including dismissed ones, making it a **row-retention flag, not a status assertion**. |

Retired scenario files are **not** resurrected by this plan.

---

## NFR

The shared measurement contracts are owned by `test-design-qa.md` § NFR measurement contracts.
Two boundaries matter to a reader of this plan and are **referenced, not restated**:

- **The All Employees list ≤ 2-second requirement is P0**, and it is **contract A** of three
  contracts that must stay separate. Its **statistic, target environment and load model are
  UNKNOWN**, and its **harness is UNDECIDED** (open as **U-24**). It is **not** ACM-9 and
  **not** P6. Nothing in this plan measures it or names a harness for it.
- **Configuration-owned thresholds** (production TTLs, rate limits, retry counts and backoff)
  stay operational configuration; tests inject deterministic values and verify boundaries.

---

## Entry and exit criteria

Owned by `test-design-qa.md` § Entry criteria and § Exit criteria. This plan states no
separate thresholds and ticks no boxes.

---

## Regression

Owned by `test-design-qa.md` § Cross-epic regression map. Triggers that name this epic:
**a profile-mutation route changes → `UM-E1` → `UM-E3`**, re-run `CT-02` (a `PATCH` fires the
paired timeline event, `api-e2e`, PM/AD-11); and **a directory projection or custom field
changes → hidden-value inference and audience-drift cases**.

---

## Effort

`um-epic:est/59 net-new cases (54 unit + 5 e2e), ~8–12 days` and
`fe-epic:est/85 net-new cases (45 unit + 40 component), ~7–11 days` are preserved **with their
own caveat**: each is "a planning range, not a commitment; no historical velocity data exists
in this repository to calibrate against". **The 85 figure is split across destinations and does
not survive as one number attached to one plan**, and none of these ranges may be added to any
other estimate. The re-estimate of remaining work is owned by `test-design-qa.md` § Effort.

---

## Open questions

Open, and **answered nowhere in this document**. Register of record:
`test-design/migration-map.md` §10.

| Question | Subject | Owner |
| --- | --- | --- |
| **U-11** | Photo-upload size limits (with frontend performance budgets and accessibility requirements). | Product Owner |
| **U-12** | Test-file location conventions, the second vitest config and `@testing-library/react` — a **prerequisite for all 85 frontend net-new cases**. | DEV |
| **U-23** | The current implemented-test count, and which of "340 e2e" / "406 cases / 43 files" is right. | QA |
| **U-24** | Which harness measures the All Employees list ≤ 2-second requirement. | Platform / DevOps |

---

## Obligation trace

**Every ledger row whose `target_path_and_anchor` names this file.** Extracted mechanically
from `test-design/migration-map.md` under a parser that reproduces the ledger's own certified
totals (565 rows; 328 `preserve` / 90 `merge` / 96 `replace` / 51 `retire`; every row exactly
eight cells). **No ledger row targeting this file carries a bare `same` / `same pattern`
target cell.**

**Machine-counted at the moment this section was written: 42 rows — 25 `preserve`,
5 `merge`, 11 `replace`, 1 `retire`.**

| Ledger § | Rows | Dispositions | Resolved in this document |
| --- | ---: | --- | --- |
| §4.1 | 3 | 3 preserve | § Risks (`R-006`, `R-007`, `R-011`) |
| §4.3a | 2 | 2 preserve | § Risks (`R-UM-06`, `R-UM-08`) |
| §4.3b | 4 | 4 preserve | § Coverage — backend → Unit (4 clusters; one of them split with `UM-E7`) |
| §4.3c | 23 | 9 preserve · 3 merge · 10 replace · 1 retire | § Coverage — backend (api-e2e and unit), § Retired at migration |
| §4.3e | 1 | 1 replace | § Gate |
| §4.4 | 3 | 2 preserve · 1 merge | § Risks (`R-FE-02`), § Coverage — frontend |
| §5.4 | 1 | 1 preserve | § Decisions and gaps (`A-05`) |
| §5.5 | 4 | 3 preserve · 1 replace | § Decisions and gaps (`G-04`, `G-06`, `G-10`, `G-12`) |
| **Total** | **42** | **25 · 5 · 11 · 1** | |

**Net-new cases routed to this plan.** Backend unit: **18** stated cases (6 + 3 + 9) plus
half (a) of the 7-case filter-pruning cluster, whose per-half count the ledger does not state
and which is **not invented here**. Frontend: **20** (12 unit + 8 component, the component
half being 5 identity-card-null + 3 import-summary). All of these fall inside the **112**
net-new cases (59 User Management + 53 frontend) that land in epic plans; the further **32**
frontend cases in `test-design-qa.md` § QA improvement backlog are **not** coverage and are
not counted here.
