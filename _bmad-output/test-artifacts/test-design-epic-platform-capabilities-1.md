# Test Design — Epic: Platform Capabilities 1, Permission-Safe People Directory

> ## Status: **ungranted**. This is a new document and inherits nothing.
>
> - **Approval:** ungranted. No human has approved this document.
> - **Validation:** NOT RUN. No verdict of any kind is claimed here.
> - **Coverage:** none asserted. This document plans and records; it does not state that any
>   test exists, that any suite passes, or that any gate is green. **No pass rate appears
>   anywhere in it.**
> - **Provenance:** the obligations below were migrated out of `test-design-qa.md` and
>   [`test-design-epic-frontend.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-epic-frontend.md) as they stood at
>   `76a7220701ac6f16843dad8b303934f9a958b54c`. One of those sources carried a human approval
>   dated 2026-08-25. **That approval does not transfer to this document.**

## Identity

| Field | Value |
| --- | --- |
| `epicId` | `PMC-E1` |
| Epic title | Permission-Safe People Directory |
| `epicDomain` | `platform-capabilities` |
| `epicNumber` | `1` |
| `epicSourcePath` | `_bmad-output/planning-artifacts/platform-capabilities/epics.md` |
| Source heading | `### Epic 1: Permission-Safe People Directory`; `## Epic 1: Permission-Safe People Directory` |
| Stories in scope | `PMC-E1-S1.3` sort, filter and search the directory (the epic also defines `S1.1`, `S1.2`, `S1.4`–`S1.9`; **no migrated obligation routes to those, which is not a statement that they need no test design**) |
| `runKey` | `epic-platform-capabilities-1` |
| Baseline commit | `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`) |
| Migration record | `_bmad-output/test-artifacts/test-design/migration-map.md` |

**Date:** 2026-09-10
**Author:** Test-design consolidation migration, Task 3 (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`)
**Status:** Draft — **approval ungranted**, validation **NOT RUN**

---

## What this plan owns, and what it does not

This plan owns **the scenario and risk coverage specific to `PMC-E1`** that the migration
routed here, across **both** of its test levels: the backend sort-control obligation and the
frontend directory-search component obligations belong to the same product epic, so they live
in **one** plan with separate test-level subsections. Everything shared is owned elsewhere and
is **referenced, never restated**:

| Shared rule | Owner |
| --- | --- |
| Risk identity, scores, rationale, residual risk, testability gaps, architecture seams | `test-design-architecture.md` § Risk register / § Testability gaps |
| Evidence contracts, execution and isolation policy, level strategy, gates, risk → evidence map, cross-epic regression map, NFR measurement contracts, QA improvement backlog | `test-design-qa.md` |
| Canonical epic identities and the `epic-{domain}-{number}` naming contract | `test-design-architecture.md` § Domain navigation |

**Level vocabulary.** `component` means jsdom with the network mocked — no browser, no HTTP,
no database. It is **not** interchangeable with Playwright e2e figures. `api-e2e` means real
HTTP against a real PostgreSQL. Definitions live in `test-design-qa.md` § Evidence levels and
what each one proves.

### The `PMC-E1` / `UM-E1-S1.5` boundary

Two obligations here sit next to User Management's list epic, and both boundaries were
resolved with named authority rather than by adjacency:

- **The sort obligation is a split, not a choice.** `UM-E1-S1.5`'s own scope sentence —
  "Dynamic custom fields, saved views, export, and inline editing remain owned by the
  **platform directory scope** rather than this bounded-context epic" — leaves the *existing*
  list, **including its default ordering**, with `UM-E1`. `PMC-E1-S1.3` "Sort, Filter, and
  Search the Directory" owns the sort **control**.
- **Directory search is `PMC-E1`, on User Management's own disclaimer.**
  `_bmad-output/planning-artifacts/user-management/epics.md:610` lists "substring / typeahead
  search on `GET /users`" among three gaps explicitly **outside** the UM epic, assigning it to
  "platform §4.1 directory scope (FR-15)". **The owning epic disclaiming the capability is
  stronger than inferring ownership from adjacency.**

---

## Risks carried by this epic

Scores and rationale are **defined** in `test-design-architecture.md`; this table records
which of them this epic is the mitigation owner for, and re-scores nothing.

| Risk | Category / score | Statement | Mitigation direction here |
| --- | --- | --- | --- |
| `fe-epic:R-FE-05` | BUS 2 × 2 = **4** | `PersonPicker` sees only the first directory page and filters client-side. | Owner: `PMC-E1-S1.3`, which is the canonical owner of directory search. **The source itself says "the real fix is backend typeahead (platform §4.1)"** — the remedy is a platform capability, not a frontend patch. Corroborated by `_bmad-output/implementation-artifacts/user-management/deferred-work.md:59`, which records the same limitation ("cannot substring-search — a target past row ~100 … is unreachable") as **unbuilt work**. Evidence direction: `component`. **Recorded consequence, not inherited:** the component is *consumed* by the UM relationship-mutation flows (`UM-E4`, `UM-E6`), so `test-design-epic-user-management-4.md` carries a cross-reference to this risk; it does not own it. |

---

## Coverage — backend

**Nothing below is a coverage claim.** Each row is an obligation with a named owner and a
named evidence level; no row asserts that the evidence exists or passes.

### api-e2e (real HTTP + PostgreSQL) + unit

| Obligation | Priority | Subject | Disposition and authority |
| --- | --- | --- | --- |
| `legacy-um:TD-UM-EXP-03` — **half (b)** | `P2` | The server-side **sort control** and its **stability across sortable columns**. | **replace, split across two owners.** Half (a) — deterministic **default** sort on the existing list — is `UM-E1-S1.5` (`list/um-list-11-deterministic-default-sort.md`, in `test-design-epic-user-management-1.md`). Half (b) is here, at `PMC-E1-S1.3`. **The source's conditional ("if sort specified") is discharged** — both halves now have a named owner, so neither is left contingent. The current aggregate priority is `P2`, fixed by `P2-PLAT-02`; this is the authority for the source `P3` → result `P2` change. Repository state corroborates the split: `_bmad-output/implementation-artifacts/user-management/deferred-work.md` records that "the repository sorts by a fixed `lastName,firstName`" and that a **server-side sort control is directory work the list endpoint does not yet have.** Evidence level: `api-e2e` + `unit`. |

**An obligation with no production path.** The sort control does not exist at the baseline
commit. This obligation is recorded so it is not lost; **nothing here claims it is
implemented, and no evidence is asserted.**

---

## Coverage — frontend

**`component` = jsdom with the network mocked.** These are not Playwright e2e cases and must
never be counted as such.

### Component (jsdom, network mocked)

| Obligation | Subject | Cases | Authority |
| --- | --- | ---: | --- |
| `fe-epic:component/PersonPicker` | Directory search, pagination boundary, empty result. | 8 (P1) | With `fe-epic:R-FE-05`, on the same authority: `user-management/epics.md:610` places substring/typeahead directory search **outside** UM and inside platform §4.1 directory scope. The source's own case list — "Search, pagination boundary, empty result" ([`test-design-epic-frontend.md:144` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-epic-frontend.md#L144)) — is **directory-search behaviour**, so **all 8 cases follow the capability, not the consuming flow.** Cross-referenced from `UM-E4` / `UM-E6` as a consumer. |

---

## NFR

This epic carries **no epic-local NFR obligation** in the ledger, and none is invented.

**A boundary that matters to a reader of this plan, referenced and not restated.** The
**All Employees list ≤ 2-second requirement is P0**, and it is **contract A** of the three
performance contracts that must stay separate, owned by `test-design-qa.md` § NFR measurement
contracts → The three performance contracts must stay separate. Its **statistic, environment
and load model are bound by `DIRA1-MVP-v1`** (U-3 and U-24 resolved; see
`docs/architecture/testing-strategy.md` § DIR-A1). It is **not** ACM-9 (the facade resolver)
and **not** P6 (`resolveAudiences`). `PMC-E1-S1.9` "Directory Performance Evidence at 500+
Rows" is the story that will carry that evidence, and **no obligation for it is routed to this
plan by the ledger**. **Nothing in this plan runs the harness or records the artifact.**

**Gate identity (U-25 resolved):** `QUALITY-GATE-AC-NFR` governs contract **B** (ACM-9 facade)
only. Directory-list evidence is evaluated against release gate **`PG-04`** / contract **A**;
`PMC-E1-S1.9` cites `PG-04`.

---

## Gate

No handoff epic/story gate routes to this plan in the ledger — the `legacy-um` handoff gates
were written against User Management epic identities. Gate identity, thresholds and the
`allow_gate=false` boundary are owned by `test-design-qa.md` § Release and design gates. **No
gate is asserted green here, and none is invented.**

---

## Entry and exit criteria

Owned by `test-design-qa.md` § Entry criteria and § Exit criteria. This plan states no
separate thresholds and ticks no boxes.

---

## Regression

Owned by `test-design-qa.md` § Cross-epic regression map. The trigger that names this epic is
preserved there: **Directory → profile / custom fields / export / campaigns** — hidden-value
inference and audience drift (v1.5 §3.3; `PR-B-01`). A directory projection or custom-field
change re-runs the anti-inference cases, whose custom-field half is owned by
`test-design-epic-user-management-7.md`.

---

## Open questions

Open, and **answered nowhere in this document**. Register of record:
`test-design/migration-map.md` §10.

| Question | Subject | Owner |
| --- | --- | --- |
| **U-3** | Percentile definition, concurrent-user / load model and target environment for the All Employees ≤ 2-second requirement. Partially resolved by `PMC-E1-S1.9`; **three parameters stay open.** | Product Owner (threshold), Platform / DevOps (environment) |
| **U-24** | **Resolved** — `DIRA1-MVP-v1` (`docs/architecture/testing-strategy.md` § DIR-A1) | Platform / DevOps + QA |
| **U-25** | **Resolved** — `QUALITY-GATE-AC-NFR` = contract **B** only; `PG-04` = contract **A** | Platform epic owner + QA |
| **U-12** | Test-file location conventions, the second vitest config and `@testing-library/react` — a **prerequisite for the frontend net-new cases in this plan**. | DEV |
| **U-10** | Browser support beyond Chromium. | Product Owner |

---

## Obligation trace

**Every ledger row whose `target_path_and_anchor` names this file.** Extracted mechanically
from `test-design/migration-map.md` under a parser that reproduces the ledger's own certified
totals (565 rows; 328 `preserve` / 90 `merge` / 96 `replace` / 51 `retire`; every row exactly
eight cells). **No ledger row targeting this file carries a bare `same` / `same pattern`
target cell.**

**Machine-counted at the moment this section was written: 3 rows — 2 `preserve`, 1 `replace`.
0 `merge`, 0 `retire`.**

| Ledger § | Rows | Dispositions | Resolved in this document |
| --- | ---: | --- | --- |
| §4.3c | 1 | 1 replace | § Coverage — backend (`TD-UM-EXP-03` half (b)) |
| §4.4 | 2 | 2 preserve | § Risks (`R-FE-05`), § Coverage — frontend (`PersonPicker`) |
| **Total** | **3** | **2 · 0 · 1 · 0** | |

**Net-new cases routed to this plan: 8, all frontend** — `fe-epic:component/PersonPicker`
**8**. The `TD-UM-EXP-03` half (b) sort obligation is an **existing `legacy-um` test ID**, not
a net-new case, and **the ledger states no per-half case count for that split, so none is
invented here.** No `um-epic` level-rebalance unit cluster routes to this plan, and **no share
of the 5 `um-epic` net-new e2e cases is claimed**: the ledger states that figure only as a
total and gives no per-epic breakdown.

These 8 fall inside the **112** net-new cases (59 User Management + 53 frontend) that land in
epic plans; the further **32** frontend cases in `test-design-qa.md` § QA improvement backlog
are **not** coverage and are not counted here.
