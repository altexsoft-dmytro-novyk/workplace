# Test Design — Epic: User Management 4, Organizational Relationships

> ## Status: **ungranted**. This is a new document and inherits nothing.
>
> - **Approval:** ungranted. No human has approved this document.
> - **Validation:** NOT RUN. No verdict of any kind is claimed here.
> - **Coverage:** none asserted. This document plans and records; it does not state that any
>   test exists, that any suite passes, or that any gate is green. **No pass rate appears
>   anywhere in it.**
> - **Provenance:** the obligations below were migrated out of `test-design-qa.md`,
>   `test-design-architecture.md`,
>   [`test-design-epic-frontend.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-epic-frontend.md),
>   `critical-review-existing-artifacts.md` and `test-design/people-management-handoff.md` as
>   they stood at `76a7220701ac6f16843dad8b303934f9a958b54c`. Several of those sources carried
>   a human approval dated 2026-08-25. **That approval does not transfer to this document.**

## Identity

| Field | Value |
| --- | --- |
| `epicId` | `UM-E4` |
| Epic title | Organizational Relationships |
| `epicDomain` | `user-management` |
| `epicNumber` | `4` |
| `epicSourcePath` | `_bmad-output/planning-artifacts/user-management/epics.md` |
| Source heading | `### Epic 4: Organizational Relationships`; `## Epic 4: Organizational Relationships` |
| Stories in scope | `UM-E4-S4.1` change an employee's manager · `UM-E4-S4.2` change an employee's People Partner · `UM-E4-S4.3` change employee department or department manager |
| `runKey` | `epic-user-management-4` |
| Baseline commit | `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`) |
| Migration record | `_bmad-output/test-artifacts/test-design/migration-map.md` |

**Date:** 2026-09-10
**Author:** Test-design consolidation migration, Task 3 (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`)
**Status:** Draft — **approval ungranted**, validation **NOT RUN**

---

## What this plan owns, and what it does not

This plan owns **the scenario and risk coverage specific to `UM-E4`**, across **both** of its
test levels: the backend reports-to / People Partner relationship-write obligations and the
frontend optimistic-concurrency mutation-hook obligations belong to the same product epic, so
they live in **one** plan with separate test-level subsections. Everything shared is owned
elsewhere and is **referenced, never restated**:

| Shared rule | Owner |
| --- | --- |
| Risk identity, scores, rationale, residual risk, testability gaps, architecture seams | `test-design-architecture.md` § Risk register / § Testability gaps |
| Evidence contracts, execution and isolation policy, level strategy, gates, risk → evidence map, cross-epic regression map, NFR measurement contracts, QA improvement backlog | `test-design-qa.md` |
| Canonical epic identities and the `epic-{domain}-{number}` naming contract | `test-design-architecture.md` § Domain navigation |
| The `@concurrency` tag and its execution mechanism | `test-design-qa.md` § Execution strategy → Backend, § Appendix — tags |

**Level vocabulary.** `component` means jsdom with the network mocked — no browser, no HTTP,
no database. It is **not** interchangeable with Playwright e2e figures. `api-e2e` means real
HTTP against a real PostgreSQL. Definitions live in `test-design-qa.md` § Evidence levels and
what each one proves.

---

## Risks carried by this epic

Scores and rationale are **defined** in `test-design-architecture.md`; this table records
which of them this epic is the mitigation owner for, and re-scores nothing.

| Risk | Category / score | Statement | Mitigation direction here |
| --- | --- | --- | --- |
| `legacy-um:R-010` | TECH **3** | AD-11 `CHECK` / `UNIQUE` constraints written as raw SQL drift from the schema. | Owner: `UM-E4`. Authority: PM/AD-11 constraints in `docs/architecture/database-schema.md`. Evidence direction: **migration review** + `api-e2e` — a constraint that exists only in a migration file is not observable from the API alone. |

### Cross-referenced risk — consumed here, owned elsewhere

**Not this epic's risk, and not counted as this epic's coverage.**

| Risk | Owner | Why it is referenced here |
| --- | --- | --- |
| `fe-epic:R-FE-05` (BUS 2 × 2 = 4) — `PersonPicker` sees only the first directory page and filters client-side | `test-design-epic-platform-capabilities-1.md` § Risk | The `PersonPicker` component is **consumed** by this epic's relationship-mutation flows (and by `UM-E6`), so a reader of this plan must be able to find the limitation. Ownership sits with `PMC-E1-S1.3`, on User Management's own boundary: `user-management/epics.md:610` lists substring/typeahead search on `GET /users` among three gaps explicitly **outside** the UM epic, assigning it to "platform §4.1 directory scope (FR-15)". **Recorded consequence, not inherited** — a target past row ~100 is unreachable through the picker, which constrains how these relationship flows can be exercised. |

---

## Coverage — backend

**Nothing below is a coverage claim.** Each row is an obligation with a named owner and a
named evidence level; no row asserts that the evidence exists or passes.

### api-e2e (real HTTP + PostgreSQL)

| Obligation | Priority | Subject | Disposition and authority |
| --- | --- | --- | --- |
| `legacy-um:TD-UM-REL-01` | `P0` | Assign a reports-to relationship. | preserve. `UM-E4-S4.1`. **This is the Epic 4 gate case** — see § Gate. |
| `legacy-um:TD-UM-REL-02` | `P1` | Revoke a reports-to relationship — **hard delete**, not a soft flag. | preserve. `UM-E4-S4.1`. |
| `legacy-um:TD-UM-REL-03` | `P1` | A second reports-to `POST` → `409`. | preserve. DEC-UM-005 **reject-then-retry**. This is the server-side half of the same contract the frontend mutation hooks see as a `409` recovery path. |
| `legacy-um:TD-UM-REL-07` — **relationships half** | `P1` | A non-HR-Admin actor → `403` on a relationship write. | preserve, **Split 1 of 2**. The single source case covered two domains that are now separate epics. The reports-to / People Partner relationship-write denial stays with `UM-E4`, alongside `REL-01/02/03/08`; **the mentorship-write half travels to `test-design-epic-mentorship-1.md`**. Actor rule — Ida for a generic feature-permission denial — is preserved via `legacy-um:C-04` and owned by `test-design-qa.md` § Persona and denial-actor conventions. |
| `legacy-um:TD-UM-REL-08` | `P2` | Concurrent reports-to assignment, `@concurrency`. | preserve. Carries gap `legacy-um:G-13`. Evidence level: `api-e2e @concurrency`. |

**A recorded gap, not a discharged one.** `legacy-um:G-13` (concurrent duplicate reports-to
assign, P2) is **preserved rather than retired** because it is not discharged: DEC-UM-005 makes
a second reports-to `POST` a `409`, but **only one `@concurrency` case (`um-reg-08`) exists on
disk**, and `legacy-um:G-15` records that **no parallel reports-to case exists**. Its successor
obligation `TD-UM-REL-08` is itself preserved above and carries the `@concurrency` mechanism.
**Nothing here claims the case has been written.**

---

## Coverage — frontend

**`component` = jsdom with the network mocked.** These are not Playwright e2e cases and must
never be counted as such.

### Component (jsdom, network mocked)

| Obligation | Subject | Cases | Authority |
| --- | --- | ---: | --- |
| `fe-epic:component/mutation-hooks` | The optimistic-concurrency token and the `409` recovery path. | 6 (P1) | **`UM-E4` confirmed.** The `409` recovery path is the DEC-UM-005 reject-then-retry contract seen from the client. The row carries **no risk ID** at source, and its subject is the optimistic-concurrency token — `expectedCurrentTargetId` / `expectedCurrentManagerId`, the DEC-UM-005 relationship-mutation contract. Corroborated by `_bmad-output/implementation-artifacts/user-management/deferred-work.md:74–77`, where exactly those two token names are the item's subject. |

> **The departure-`409` question is answered elsewhere, not here.** The source assigns the
> departure `409` shapes to a *different* row:
> [`test-design-epic-frontend.md:170` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-epic-frontend.md#L170) puts "Incl.
> the departure `409` shapes" on the **error-extractor unit** obligation (`fe-epic:unit/http.ts`,
> `R-FE-03`, 9 cases), which routes to `test-design-qa.md` § QA improvement backlog with an
> explicit `UM-E5` cross-reference. **These 6 cases are therefore not split across `UM-E4` and
> `UM-E5`**, and the departure obligation is carried once, by the error-extractor row — which
> is **backlog, not coverage**.

---

## Decisions and gaps landing here

| Item | Statement | Evidence level | Authority |
| --- | --- | --- | --- |
| `legacy-um:G-13` | Concurrent duplicate reports-to assign (P2). | `api-e2e @concurrency` | DEC-UM-005; carried by `TD-UM-REL-08`. Owner `UM-E4`, which owns `REL-01/02/03`. **Preserved, not discharged** — see the note under § Coverage — backend. |

---

## NFR

This epic carries **no epic-local NFR obligation** in the ledger. The shared measurement
contracts — including the three performance contracts that must stay separate — are owned by
`test-design-qa.md` § NFR measurement contracts. Nothing in this plan measures any of them.

---

## Gate

| Gate | Content |
| --- | --- |
| `legacy-um:handoff/Epic 4 "Organizational Relationships"` gate (`REL-01`) | **preserve.** Canonical Epic 4 is "Organizational Relationships" (`UM-E4`), so the handoff gate and the canonical epic match and the gate carries over intact, with `TD-UM-REL-01` as its case. Evidence level: `api-e2e`. **Ungranted — no gate is asserted green.** |

Gate identity, thresholds and the `allow_gate=false` boundary are owned by
`test-design-qa.md` § Release and design gates.

---

## Entry and exit criteria

Owned by `test-design-qa.md` § Entry criteria and § Exit criteria. This plan states no
separate thresholds and ticks no boxes.

---

## Regression

Owned by `test-design-qa.md` § Cross-epic regression map. The trigger most relevant to this
epic is the one the migration re-pointed: the old `legacy-um:reg/Epic 3 → Epic 4` arrow
**no longer ends here** — its targets `REL-04`/`REL-05` moved to mentorship, so the arrow is
now `UM-E3` → `M-E1`. What still reaches this epic is the platform-wide rule that **any change
to any endpoint triggers the full access-control E2E on every PR**, which covers the
`REL-07` relationship-write denial.

---

## Open questions

Open, and **answered nowhere in this document**. Register of record:
`test-design/migration-map.md` §10.

| Question | Subject | Owner |
| --- | --- | --- |
| **U-12** | Test-file location conventions, the second vitest config and `@testing-library/react` — a **prerequisite for the frontend net-new cases in this plan**. | DEV |
| **U-14** *(recorded as resolved, listed for navigation)* | Which epic owns the directory/list boundary cases. Resolved with authority: `PersonPicker` → `PMC-E1`. This plan consumes it and does not own it. | QA + the two domain owners |

---

## Obligation trace

**Every ledger row whose `target_path_and_anchor` names this file.** Extracted mechanically
from `test-design/migration-map.md` under a parser that reproduces the ledger's own certified
totals (565 rows; 328 `preserve` / 90 `merge` / 96 `replace` / 51 `retire`; every row exactly
eight cells). **No ledger row targeting this file carries a bare `same` / `same pattern`
target cell.**

**Machine-counted at the moment this section was written: 9 rows — 9 `preserve`. 0 `merge`,
0 `replace`, 0 `retire`.**

| Ledger § | Rows | Dispositions | Resolved in this document |
| --- | ---: | --- | --- |
| §4.1 | 1 | 1 preserve | § Risks (`R-010`) |
| §4.3c | 5 | 5 preserve | § Coverage — backend (`REL-01`, `REL-02`, `REL-03`, `REL-07` half 1, `REL-08`) |
| §4.3e | 1 | 1 preserve | § Gate |
| §4.4 | 1 | 1 preserve | § Coverage — frontend (`mutation-hooks`) |
| §5.5 | 1 | 1 preserve | § Decisions and gaps (`G-13`) |
| **Total** | **9** | **9 · 0 · 0 · 0** | |

> **Note on the raw filename count.** A naive grep for this filename across the ledger returns
> **10** hits. The tenth is in the `authority_and_reason` cell of the `fe-epic:R-FE-05` row,
> whose `target_path_and_anchor` is `test-design-epic-platform-capabilities-1.md` — it is the
> cross-reference recorded above, **not** an obligation routed here. Nine rows target this file.

**Net-new cases routed to this plan: 6, all frontend** — `fe-epic:component/mutation-hooks`
**6**. No `um-epic` level-rebalance unit cluster routes here, and **no share of the 5 `um-epic`
net-new e2e cases is claimed**: the ledger states that figure only as a total and gives no
per-epic breakdown, so none is invented here. `fe-epic:component/PersonPicker` (8 cases) is
**not** counted here — it belongs to `test-design-epic-platform-capabilities-1.md`.

These 6 fall inside the **112** net-new cases (59 User Management + 53 frontend) that land in
epic plans; the further **32** frontend cases in `test-design-qa.md` § QA improvement backlog
are **not** coverage and are not counted here.
