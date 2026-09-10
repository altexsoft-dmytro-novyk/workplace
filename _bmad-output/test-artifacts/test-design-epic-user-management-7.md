# Test Design — Epic: User Management 7, Visibility-Safe Filtering and Columns

> ## Status: **ungranted**. This is a new document and inherits nothing.
>
> - **Approval:** ungranted. No human has approved this document.
> - **Validation:** NOT RUN. No verdict of any kind is claimed here.
> - **Coverage:** none asserted. This document plans and records; it does not state that any
>   test exists, that any suite passes, or that any gate is green. **No pass rate appears
>   anywhere in it.**
> - **Provenance:** the single obligation below was migrated out of
>   [`test-design-epic-user-management.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-epic-user-management.md) as it stood at
>   `76a7220701ac6f16843dad8b303934f9a958b54c`. That source was itself a **draft** and carried
>   no approval; **this document carries none either.**

## Identity

| Field | Value |
| --- | --- |
| `epicId` | `UM-E7` |
| Epic title | Visibility-Safe Filtering and Columns |
| `epicDomain` | `user-management` |
| `epicNumber` | `7` |
| `epicSourcePath` | `_bmad-output/planning-artifacts/user-management/epics.md` |
| Source heading | `### Epic 7: Visibility-Safe Filtering and Columns`; `## Epic 7: Visibility-Safe Filtering and Columns` |
| Stories in scope | `UM-E7-S7.1` S16 section-matrix resolution for custom fields · `UM-E7-S7.2` custom-field columns and filters read only entitled values |
| `runKey` | `epic-user-management-7` |
| Baseline commit | `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`) |
| Migration record | `_bmad-output/test-artifacts/test-design/migration-map.md` |

**Date:** 2026-09-10
**Author:** Test-design consolidation migration, Task 3 (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`)
**Status:** Draft — **approval ungranted**, validation **NOT RUN**

---

## Why this plan is short

**Exactly one ledger row targets this file**, and this plan is scoped to it. That is a
statement about what the *migration* re-homed here, **not** a statement that `UM-E7` needs
only one test obligation. The epic's own acceptance criteria are the authority on its full
scope; nothing in this plan bounds it.

---

## What this plan owns, and what it does not

This plan owns **the scenario coverage specific to `UM-E7`** that the migration routed here.
Everything shared is owned elsewhere and is **referenced, never restated**:

| Shared rule | Owner |
| --- | --- |
| Risk identity, scores, rationale, residual risk, testability gaps, architecture seams | `test-design-architecture.md` § Risk register / § Testability gaps |
| Evidence contracts, execution and isolation policy, level strategy, gates, risk → evidence map, cross-epic regression map, NFR measurement contracts, QA improvement backlog | `test-design-qa.md` |
| Canonical epic identities and the `epic-{domain}-{number}` naming contract | `test-design-architecture.md` § Domain navigation |

**Level vocabulary.** `unit` is the in-process level; `api-e2e` means real HTTP against a real
PostgreSQL. **`component` (jsdom with the network mocked) carries no obligation in this epic.**
Definitions live in `test-design-qa.md` § Evidence levels and what each one proves.

---

## Risks carried by this epic

**No risk identifier is routed to this plan by the ledger**, and none is invented. Risk
identity, scores and rationale are defined in `test-design-architecture.md` § Risk register.

---

## Coverage

**Nothing below is a coverage claim.** The row is an obligation with a named owner and a named
evidence level; it does not assert that the evidence exists or passes.

### Unit + api-e2e

| Obligation | Subject | Cases | Authority |
| --- | --- | ---: | --- |
| `um-epic:cluster/directory-filter-pruning-and-whitelist` — **half (b)** | `PM-FR-5` anti-inference across filter combinations, **including result-count differencing**, on **custom fields**. | see note | `UM-E7` "Visibility-Safe Filtering and Columns". Evidence level: `unit` + `api-e2e`. |

> **Note on the split cluster.** `um-epic:cluster/directory-filter-pruning-and-whitelist` is a
> **7-case** cluster split across two owners: half (a) — rejecting unsafe and unknown filters
> on the existing **identity-field** list — is `UM-E1-S1.5` in
> `test-design-epic-user-management-1.md` (`list/um-list-09-unsafe-and-unknown-filters-rejected.md`);
> half (b) is here. **The ledger states no per-half case count, and none is invented here.**
> The 7 cases are counted once, across the two plans.

**Why this is not the same obligation at a different level.** `UM-E1-S1.5`'s scope —
"permission-safe visible identity fields and employment status. Technical `ttId` and
`isActive` are **never** public filters" — makes the whitelist over *identity* fields a
`UM-E1` obligation, and `list/um-list-09` already exists for it. `UM-E7` covers `PM-FR-5`
anti-inference **completion**: "no combination of filters, **including result-count
differencing**, lets a viewer infer a value they cannot see" — **a strictly harder property,
on custom fields, that `um-list-09` does not address.**

**Recorded dependencies, not inherited.** `UM-E7` depends on **`UM-E8` (custom fields as
data)**, and **PM/AD-32 puts the enforcement point in the `AccessControl` facade *before*
filter execution**. Both are recorded as dependencies; **nothing here claims either is
resolved**, and neither moves ownership of this obligation.

---

## NFR

This epic carries **no epic-local NFR obligation** in the ledger, and none is invented. The
shared measurement contracts — including the three performance contracts that must stay
separate, whose statistic, environment and load model are **UNKNOWN** for contract A and whose
harness is **UNDECIDED** — are owned by `test-design-qa.md` § NFR measurement contracts.
Nothing in this plan measures any of them.

---

## Gate

No handoff epic/story gate routes to this plan in the ledger. Gate identity, thresholds and the
`allow_gate=false` boundary are owned by `test-design-qa.md` § Release and design gates. **No
gate is asserted green here, and none is invented.**

---

## Entry and exit criteria

Owned by `test-design-qa.md` § Entry criteria and § Exit criteria. This plan states no
separate thresholds and ticks no boxes.

---

## Regression

Owned by `test-design-qa.md` § Cross-epic regression map. The trigger that names this epic is
preserved there: **Directory → profile / custom fields / export / campaigns** — **hidden-value
inference and audience drift** (v1.5 §3.3; `PR-B-01`). A directory projection or custom-field
change re-runs exactly the anti-inference property above. The directory-search and
sort-control side of that seam is owned by `test-design-epic-platform-capabilities-1.md`.

---

## Open questions

Open, and **answered nowhere in this document**. Register of record:
`test-design/migration-map.md` §10.

| Question | Subject | Owner |
| --- | --- | --- |
| **U-14** *(recorded as resolved, listed for navigation)* | Which epic owns the directory/list boundary cases. Resolved with authority: filter pruning is a **split**, `UM-E1-S1.5` (identity fields) / `UM-E7` (custom-field anti-inference). This plan owns half (b) only. | QA + the two domain owners |

---

## Obligation trace

**Every ledger row whose `target_path_and_anchor` names this file.** Extracted mechanically
from `test-design/migration-map.md` under a parser that reproduces the ledger's own certified
totals (565 rows; 328 `preserve` / 90 `merge` / 96 `replace` / 51 `retire`; every row exactly
eight cells). **No ledger row targeting this file carries a bare `same` / `same pattern`
target cell.**

**Machine-counted at the moment this section was written: 1 row — 1 `preserve`. 0 `merge`,
0 `replace`, 0 `retire`.**

| Ledger § | Rows | Dispositions | Resolved in this document |
| --- | ---: | --- | --- |
| §4.3b | 1 | 1 preserve | § Coverage (`directory-filter-pruning-and-whitelist` half (b)) |
| **Total** | **1** | **1 · 0 · 0 · 0** | |

**Net-new cases routed to this plan: half (b) of the 7-case
`um-epic:cluster/directory-filter-pruning-and-whitelist` cluster. The ledger states no
per-half count, and none is invented here.** The cluster's 7 cases are counted **once**,
across this plan and `test-design-epic-user-management-1.md`, and they sit inside the 54
`um-epic` net-new unit cases. **No share of the 5 `um-epic` net-new e2e cases is claimed**:
the ledger states that figure only as a total and gives no per-epic breakdown. No frontend
net-new case routes to this plan.

Whatever half (b) amounts to falls inside the **112** net-new cases (59 User Management + 53
frontend) that land in epic plans; the further **32** frontend cases in `test-design-qa.md`
§ QA improvement backlog are **not** coverage and are not counted here.
