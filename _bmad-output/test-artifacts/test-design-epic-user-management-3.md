# Test Design — Epic: User Management 3, Career Timeline

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
>   `critical-review-existing-artifacts.md` and `test-design/people-management-handoff.md` as
>   they stood at `76a7220701ac6f16843dad8b303934f9a958b54c`. Several of those sources carried
>   a human approval dated 2026-08-25. **That approval does not transfer to this document.**

## Identity

| Field | Value |
| --- | --- |
| `epicId` | `UM-E3` |
| Epic title | Career Timeline |
| `epicDomain` | `user-management` |
| `epicNumber` | `3` |
| `epicSourcePath` | `_bmad-output/planning-artifacts/user-management/epics.md` |
| Source heading | `### Epic 3: Career Timeline`; `## Epic 3: Career Timeline` |
| Stories in scope | `UM-E3-S3.1` system auto-generates career timeline events · `UM-E3-S3.2` authorized actor manually adds a backfill entry · `UM-E3-S3.3` authorized actor edits or deletes an event |
| `runKey` | `epic-user-management-3` |
| Baseline commit | `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`) |
| Migration record | `_bmad-output/test-artifacts/test-design/migration-map.md` |

**Date:** 2026-09-10
**Author:** Test-design consolidation migration, Task 3 (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`)
**Status:** Draft — **approval ungranted**, validation **NOT RUN**

---

## What this plan owns, and what it does not

This plan owns **the scenario and risk coverage specific to `UM-E3`**. Everything shared is
owned elsewhere and is **referenced, never restated**:

| Shared rule | Owner |
| --- | --- |
| Risk identity, scores, rationale, residual risk, testability gaps, architecture seams | `test-design-architecture.md` § Risk register / § Testability gaps |
| Evidence contracts, execution and isolation policy, level strategy, gates, risk → evidence map, cross-epic regression map, NFR measurement contracts, QA improvement backlog | `test-design-qa.md` |
| Canonical epic identities and the `epic-{domain}-{number}` naming contract | `test-design-architecture.md` § Domain navigation |

**Level vocabulary.** `unit` is the in-process domain level; `api-e2e` means real HTTP against
a real PostgreSQL; `integration` here means the failure-path exercise of the paired-write seam.
`component` (jsdom with the network mocked) carries **no** obligation in this epic. Definitions
live in `test-design-qa.md` § Evidence levels and what each one proves.

---

## Risks carried by this epic

Scores and rationale are **defined** in `test-design-architecture.md`; this table records
which of them this epic is the mitigation owner for, and re-scores nothing.

| Risk | Category / score | Statement | Mitigation direction here |
| --- | --- | --- | --- |
| `legacy-um:R-002` | DATA 2 × 3 = **6** | A `User` mutation lands without its paired `UserEvents` write. | Owner: `UM-E3`. PM/AD-11's same-transaction rule is still binding (`docs/architecture/database-schema.md`). Evidence direction: `api-e2e` **plus an integration failure-path** — the happy path alone cannot show that a failed event write rolls the mutation back. |
| `legacy-um:R-014` | BUS **1** | A manual `mentorship_end` backfill is mistaken for the automatic path. | **Owner: `UM-E3`, with a cross-reference to mentorship `M-E1` — the risk spans two epics and is cross-referenced, not duplicated.** DEC-UM-011 records the manual-versus-automatic distinction; the **automatic** path now belongs to the mentorship domain (`M-E1-S1.4`), so the timeline side owns only the manual-backfill discrimination. See `test-design-epic-mentorship-1.md` § Coverage. Evidence direction: `api-e2e`. |

---

## Coverage

**Nothing below is a coverage claim.** Each row is an obligation with a named owner and a
named evidence level; no row asserts that the evidence exists or passes.

### Unit

| Obligation | Priority | Subject | Cases | Authority |
| --- | --- | --- | ---: | --- |
| `um-epic:cluster/career-event-ordering-and-source` | — | Career-event **ordering** and **source** attribution. | 5 | `UM-E3` Career Timeline. One of the nine level-rebalance clusters; the ledger states its count as 5. |
| `legacy-um:TD-UM-DOM-02` | `P2` | Event immutability, at the domain level. | — | **merge.** Origins: `legacy-um:TD-UM-DOM-02` and `legacy-um:S15#3-incorrect-test-levels` row 2 — the review found the obligation was written at the wrong level, and the merged successor is the unit one. Pairs with `TD-UM-CT-08` at `api-e2e`. |

### api-e2e (real HTTP + PostgreSQL)

| Obligation | Priority | Subject | Disposition and authority |
| --- | --- | --- | --- |
| `legacy-um:TD-UM-CT-02` | `P1` | A `position_change` event fires on `PATCH`. | preserve. `UM-E3-S3.1`; PM/AD-11. **This is the Epic 3 gate case** — see § Gate. |
| `legacy-um:TD-UM-CT-03` | `P1` | An assigned People Partner adds a manual entry. | preserve. `UM-E3-S3.2`; DEC-UM-001. The source states CT-03 and CT-04 jointly; they are two distinct IDs and each resolves independently. |
| `legacy-um:TD-UM-CT-04` | `P1` | A direct manager adds a manual entry. | preserve. Same authority. **DM/PM and transitive managers remain read-only** (DEC-UM-001) — that restriction is part of the obligation, not a separate one. |
| `legacy-um:TD-UM-CT-05` | `P1` | Correcting an event = **delete + append**, never edit in place. | preserve. `UM-E3-S3.3`. |
| `legacy-um:TD-UM-CT-06` | `P1` | An authorized actor deletes a manual entry. | preserve. `UM-E3-S3.3`. |
| `legacy-um:TD-UM-CT-07` | `P1` | A deleted event is absent from the read path. | preserve. `UM-E3-S3.3`. |
| `legacy-um:TD-UM-CT-08` | `P2` | **No `PATCH` on events** — immutability at the route surface. | preserve. Carries gap `legacy-um:G-14`; PM/AD-11 immutable facts. Evidence: `api-e2e` **+ `unit`** (the merged `TD-UM-DOM-02` above is the domain half). |
| `legacy-um:TD-UM-EXP-01` | `P3` | **Decision-drift audit** — a DM/PM manual timeline write remains denied. | preserve. DEC-UM-001. **`UM-E3` confirmed as owner; access control is a dependency, not the owner.** The obligation's scenario `docs/test-cases/user-management/career-timeline/um-ct-09-permission-without-s9-write-denied.md` lives in the **user-management** suite and traces itself to "requirements §4.9 · §3.2 row S9 · PRD FR-12 · epics.md Story 3.2 · DEC-UM-001 · access-control.md §2.2 dual gate". A dual gate has two sides: Access Control supplies the S9 write audience (`profile:timeline` `canAccessSection`, tracked as unbuilt at `implementation-artifacts/access-control/deferred-work.md:45`), and User Management owns the route, the denial and the scenario. **Recorded as a dependency; ownership is not split.** |

**Currently blocked, recorded, not discharged.** `TD-UM-EXP-01` is one of the five `it.todo`
deferrals — a real obligation with no runnable path today. `um-ct-03`, `um-ct-04` and `um-ct-09`
are `it.todo` pending the `OQ-PERM-01` FR-matrix grant plus DEC-UM-001 scoping. **Nothing here
claims any of that is resolved.**

---

## Decisions and gaps landing here

| Item | Statement | Evidence level | Authority |
| --- | --- | --- | --- |
| `legacy-um:G-14` | `PATCH /users/:id/events/:id` must not exist — immutability (P2). | `api-e2e` | PM/AD-11; carried by `TD-UM-CT-08`. Preserved, not discharged. |

---

## NFR

This epic carries **no epic-local NFR obligation** in the ledger. The shared measurement
contracts — including the three performance contracts that must stay separate, whose
statistic, environment and load model are **UNKNOWN** for contract A and whose harness is
**UNDECIDED** — are owned by `test-design-qa.md` § NFR measurement contracts. Nothing in this
plan measures any of them.

---

## Gate

| Gate | Content |
| --- | --- |
| `legacy-um:handoff/Epic 3 "Career Timeline"` gate (was `CT-01`) | **replace.** `CT-01`'s trigger moved to import under DEC-UM-008, so it now gates **`UM-E1`, not `UM-E3`**; the Epic 3 gate must name a timeline-owned case. The gate case becomes **`legacy-um:TD-UM-CT-02`** (`position_change` on `PATCH`, `UM-E3-S3.1`), with **`TD-UM-CT-05/06/07`** (correct = delete + append; deleted event absent from read) as the Story 3.3 gate. **Why `CT-02`:** `UM-E3-S3.1` "System Auto-Generates Career Timeline Events" is the story with a production path today — `career-timeline/` holds 14 scenarios and `um-ct-10` / `um-ct-12` are live. **Deliberately not chosen:** `TD-UM-CT-03/04` (manual add by PP/UM), because `um-ct-03`/`04`/`09` are `it.todo` pending the `OQ-PERM-01` FR-matrix grant plus DEC-UM-001 scoping — **a gate case that cannot run is not a gate.** Evidence level: `api-e2e`. **Ungranted — no gate is asserted green.** |

Gate identity, thresholds and the `allow_gate=false` boundary are owned by
`test-design-qa.md` § Release and design gates.

---

## Entry and exit criteria

Owned by `test-design-qa.md` § Entry criteria and § Exit criteria. This plan states no
separate thresholds and ticks no boxes.

---

## Regression

Owned by `test-design-qa.md` § Cross-epic regression map. Three triggers name this epic:

- **`UM-E1` → `UM-E3`** — a profile-mutation route changes, so re-run `CT-02` (a `PATCH` fires
  the paired timeline event; PM/AD-11).
- **`UM-E3` → `M-E1`** — the old `legacy-um:reg/Epic 3 → Epic 4` trigger survives but its
  targets `REL-04`/`REL-05` moved to mentorship, so **the arrow is now `UM-E3` → `M-E1`**.
  When the event writer changes, re-run the mentorship pair/unpair event cases in
  `test-design-epic-mentorship-1.md`.
- **Mentorship and lifecycle → timeline** — missing or incorrect events, and closure notes
  (PM/AD-17, AD-20).

---

## Open questions

Open, and **answered nowhere in this document**. Register of record:
`test-design/migration-map.md` §10.

| Question | Subject | Owner |
| --- | --- | --- |
| **U-17** | What closes the remaining register entries at implementation, including `OQ-PERM-01` (P1 open) — the FR-matrix grant that the `it.todo` timeline cases above wait on. | Product + Architect + the named blocker owners |
| **U-21** | Whether the 20 history-only retired scenario files should remain on disk. Recorded here only because this epic's suite sits alongside them; **this plan resurrects nothing.** | Owner of `docs/test-cases/user-management/**` |

---

## Retired at migration — recorded so it is not reintroduced

No obligation retires **into** this plan. `legacy-um:handoff/Epic 3` gate case `CT-01` is
**not** retired — it is `replace`d and re-homed to `UM-E1`, and is recorded above rather than
here. Retired scenario files are **not** resurrected by this plan.

---

## Obligation trace

**Every ledger row whose `target_path_and_anchor` names this file.** Extracted mechanically
from `test-design/migration-map.md` under a parser that reproduces the ledger's own certified
totals (565 rows; 328 `preserve` / 90 `merge` / 96 `replace` / 51 `retire`; every row exactly
eight cells). **No ledger row targeting this file carries a bare `same` / `same pattern`
target cell.**

**Machine-counted at the moment this section was written: 14 rows — 12 `preserve`, 1 `merge`,
1 `replace`. 0 `retire`.**

| Ledger § | Rows | Dispositions | Resolved in this document |
| --- | ---: | --- | --- |
| §4.1 | 2 | 2 preserve | § Risks (`R-002`, `R-014`) |
| §4.3b | 1 | 1 preserve | § Coverage → Unit (`career-event-ordering-and-source`) |
| §4.3c | 9 | 8 preserve · 1 merge | § Coverage (`CT-02..08`, `DOM-02`, `EXP-01`) |
| §4.3e | 1 | 1 replace | § Gate |
| §5.5 | 1 | 1 preserve | § Decisions and gaps (`G-14`) |
| **Total** | **14** | **12 · 1 · 1 · 0** | |

**Net-new cases routed to this plan: 5** — the `um-epic:cluster/career-event-ordering-and-source`
unit cluster, whose count the ledger states as 5. **No share of the 5 `um-epic` net-new e2e
cases is claimed**: the ledger states that figure only as a total (`um-epic:est/59 net-new
cases (54 unit + 5 e2e)`) and gives no per-epic breakdown, so none is invented here. No
frontend net-new case routes to this plan.

These 5 fall inside the **112** net-new cases (59 User Management + 53 frontend) that land in
epic plans; the further **32** frontend cases in `test-design-qa.md` § QA improvement backlog
are **not** coverage and are not counted here.
