# Test Design — Epic: Mentorship 1, Mentorship Hub

> ## Status: **ungranted**. This is a new document and inherits nothing.
>
> - **Approval:** ungranted. No human has approved this document.
> - **Validation:** NOT RUN. No verdict of any kind is claimed here.
> - **Coverage:** none asserted. This document plans and records; it does not state that any
>   test exists, that any suite passes, or that any gate is green. **No pass rate appears
>   anywhere in it.**
> - **Provenance:** the obligations below were migrated out of `test-design-qa.md` and
>   `critical-review-existing-artifacts.md` as they stood at
>   `76a7220701ac6f16843dad8b303934f9a958b54c`. Both carried a human approval dated
>   2026-08-25. **That approval does not transfer to this document.** These obligations were
>   written under the old `legacy-um` `REL-*` family, before mentorship became its own domain;
>   they arrive here by re-homing, not by inheritance.

## Identity

| Field | Value |
| --- | --- |
| `epicId` | `M-E1` |
| Epic title | Mentorship Hub |
| `epicDomain` | `mentorship` |
| `epicNumber` | `1` |
| `epicSourcePath` | `_bmad-output/planning-artifacts/mentorship/epics.md` |
| Source heading | `### Epic 1: Mentorship Hub` |
| Stories in scope | `M-E1-S1.3` create a mentorship pair · `M-E1-S1.4` end a mentorship pair (the epic also defines `S1.1` open-to-mentoring flag, `S1.2` willing-mentor pool, `S1.5` S13 projection, `S1.6` departure auto-close; **no migrated obligation routes to those, which is not a statement that they need no test design**) |
| `runKey` | `epic-mentorship-1` |
| Baseline commit | `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`) |
| Migration record | `_bmad-output/test-artifacts/test-design/migration-map.md` |

**Date:** 2026-09-10
**Author:** Test-design consolidation migration, Task 3 (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`)
**Status:** Draft — **approval ungranted**, validation **NOT RUN**

---

## What this plan owns, and what it does not

This plan owns **the scenario coverage specific to `M-E1`** that the migration re-homed out of
the User Management `REL-*` family. Everything shared is owned elsewhere and is **referenced,
never restated**:

| Shared rule | Owner |
| --- | --- |
| Risk identity, scores, rationale, residual risk, testability gaps, architecture seams | `test-design-architecture.md` § Risk register / § Testability gaps |
| Evidence contracts, execution and isolation policy, level strategy, gates, risk → evidence map, cross-epic regression map, NFR measurement contracts, QA improvement backlog | `test-design-qa.md` |
| Canonical epic identities and the `epic-{domain}-{number}` naming contract | `test-design-architecture.md` § Domain navigation |

**Level vocabulary.** `api-e2e` means real HTTP against a real PostgreSQL. **No `unit`,
`component` or `contract (Pact)` obligation routes to this plan in the ledger**, and none is
invented. Definitions live in `test-design-qa.md` § Evidence levels and what each one proves.

### Why these obligations are here at all

Mentorship is now **its own domain** (`_bmad-output/planning-artifacts/mentorship/epics.md`)
with **28 scenario files on disk**. The old `legacy-um:TD-UM-REL-04/05/06` were written when
mentorship was part of the User Management relationship family; the migration splits that
family to its current canonical owners. `TD-UM-REL-01/02/03/08` stay with `UM-E4`
Organizational Relationships (`test-design-epic-user-management-4.md`); `REL-04/05/06` and the
mentorship half of `REL-07` come here. **Nothing is renumbered** — the `legacy-um:` scope key
is retained so the identifiers remain traceable to their source.

---

## Risks carried by this epic

**No risk identifier is routed to this plan by the ledger**, and none is invented. Risk
identity, scores and rationale are defined in `test-design-architecture.md` § Risk register.

### Cross-referenced risk — owned elsewhere

| Risk | Owner | Why it is referenced here |
| --- | --- | --- |
| `legacy-um:R-014` (BUS 1) — a manual `mentorship_end` backfill is mistaken for the automatic path | `test-design-epic-user-management-3.md` § Risk | DEC-UM-011 records the manual-versus-automatic distinction. The **automatic** path is `M-E1-S1.4`, so **the risk spans two epics and is cross-referenced, not duplicated.** The timeline side owns the manual-backfill discrimination; this plan owns the automatic unpair-and-`mentorship_end` behaviour below. |

---

## Coverage

**Nothing below is a coverage claim.** Each row is an obligation with a named owner and a
named evidence level; no row asserts that the evidence exists or passes.

### api-e2e (real HTTP + PostgreSQL)

| Obligation | Priority | Subject | Disposition and authority |
| --- | --- | --- | --- |
| `legacy-um:TD-UM-REL-04` | `P1` | Creating a mentorship pair writes the pair **and** a `mentorship_start` event. | preserve. **Split 1 of 3** of the old `REL-*` family to its current canonical owner, `M-E1-S1.3`. Carries gap `legacy-um:G-05` (atomicity, P0). |
| `legacy-um:TD-UM-REL-05` | `P1` | Unpairing writes the `mentorship_end` event. | preserve. **Split 2 of 3.** `M-E1-S1.4`. This is the **automatic** path that `legacy-um:R-014` warns must not be confused with a manual backfill. |
| `legacy-um:TD-UM-REL-06` | `P1` | **Multiple mentors are allowed** for one mentee. | preserve. **Split 3 of 3.** `M-E1-S1.3`; PM/AD-11 / PM/AD-17. **Cardinality confirmed against the architecture, and `preserve` stands:** `docs/architecture/mentorship.md:129` states the constraint as a partial `UNIQUE (mentorUserId, menteeUserId) WHERE status = 'active'` — "at most one **active** pair per **ordered** (mentor, mentee); recurrence after ending is allowed (Decision 4)". **An ordered-pair uniqueness constraint does not bound how many distinct mentors one mentee may have**, so "multiple mentors allowed" is correct and survives unchanged. |
| `legacy-um:TD-UM-REL-07` — **mentorship half** | `P1` | A non-HR-Admin actor → `403` on a mentorship write. | preserve, **Split 2 of 2**. The mentorship-write denial follows the pair/unpair cases to the mentorship domain, on the same authority that moves `REL-04/05/06`; **the relationships half stays with `UM-E4`** (`test-design-epic-user-management-4.md`). Actor rule (Ida for a generic feature-permission denial) preserved via `legacy-um:C-04`, owned by `test-design-qa.md` § Persona and denial-actor conventions. |

### A distinct obligation the source did not state, recorded here

The `mentorship.md:129` constraint carries a second obligation that the source `REL-06` row
does not state: **re-pairing after an ended pair is legal** ("recurrence after ending is
allowed", Decision 4). It is a **distinct case** from "multiple mentors allowed", and the
ledger records that this plan should cover it. It is written down here as an obligation with
its authority; **no case count is attached to it, because the ledger states none and none is
invented.**

**A scenario suite with no production path.** `CC-10-MENTORSHIP` is **P1 open** —
`src/mentorship` does not exist. All four obligations above therefore have **scenarios and no
production path**. This is recorded as a dependency; **nothing here claims it is resolved, and
no evidence is asserted.**

---

## Decisions and gaps landing here

| Item | Statement | Evidence level | Authority |
| --- | --- | --- | --- |
| `legacy-um:G-05` | Mentorship attach → `mentorship_start` **atomicity** (P0). | `api-e2e` | `M-E1-S1.3`. Carried by `TD-UM-REL-04`. **Preserved, not discharged** — the atomicity property is the obligation; `CC-10-MENTORSHIP` gates its exercise. |

---

## NFR

This epic carries **no epic-local NFR obligation** in the ledger, and none is invented. The
shared measurement contracts — including the three performance contracts that must stay
separate — are owned by `test-design-qa.md` § NFR measurement contracts.

---

## Gate

No handoff epic/story gate routes to this plan in the ledger. The `legacy-um` handoff gates
were written against User Management epic identities; none of them names a mentorship case.
Gate identity, thresholds and the `allow_gate=false` boundary are owned by
`test-design-qa.md` § Release and design gates. **No gate is asserted green here, and none is
invented.**

---

## Entry and exit criteria

Owned by `test-design-qa.md` § Entry criteria and § Exit criteria. This plan states no
separate thresholds and ticks no boxes.

---

## Regression

Owned by `test-design-qa.md` § Cross-epic regression map. Two triggers name this epic:

- **`UM-E3` → `M-E1`** — the re-pointed `legacy-um:reg/Epic 3 → Epic 4` trigger. The trigger
  survives; its targets `REL-04`/`REL-05` moved here, so **when the event writer changes,
  re-run the mentorship pair/unpair event cases above**.
- **Mentorship and lifecycle → timeline** — missing or incorrect events, and closure notes
  (PM/AD-17, AD-20). Departure auto-close (`M-E1-S1.6`) is the seam to
  `test-design-epic-user-management-5.md`.

---

## Open questions

Open, and **answered nowhere in this document**. Register of record:
`test-design/migration-map.md` §10.

| Question | Subject | Owner |
| --- | --- | --- |
| **U-17** | What closes the register entries that remain open at implementation — for this epic, `CC-10-MENTORSHIP` (P1 open), which gates every obligation above. | Product + Architect + the named blocker owners |

---

## Obligation trace

**Every ledger row whose `target_path_and_anchor` names this file.** Extracted mechanically
from `test-design/migration-map.md` under a parser that reproduces the ledger's own certified
totals (565 rows; 328 `preserve` / 90 `merge` / 96 `replace` / 51 `retire`; every row exactly
eight cells). **No ledger row targeting this file carries a bare `same` / `same pattern`
target cell.**

**Machine-counted at the moment this section was written: 5 rows — 5 `preserve`. 0 `merge`,
0 `replace`, 0 `retire`.**

| Ledger § | Rows | Dispositions | Resolved in this document |
| --- | ---: | --- | --- |
| §4.3c | 4 | 4 preserve | § Coverage (`REL-04`, `REL-05`, `REL-06`, `REL-07` half 2) |
| §5.5 | 1 | 1 preserve | § Decisions and gaps (`G-05`) |
| **Total** | **5** | **5 · 0 · 0 · 0** | |

**Net-new cases routed to this plan: 0.** None of the nine `um-epic` level-rebalance unit
clusters and none of the eight `fe-epic` net-new case groups routes here — the four
obligations above are **existing `legacy-um` test IDs re-homed to their canonical owner**, not
net-new cases. **No share of the 5 `um-epic` net-new e2e cases is claimed**: the ledger states
that figure only as a total (`um-epic:est/59 net-new cases (54 unit + 5 e2e)`) and gives no
per-epic breakdown, so none is invented here. The re-pairing-after-ending obligation recorded
above likewise carries **no invented count**.

This plan therefore consumes **none** of the **112** net-new cases (59 User Management + 53
frontend) that land in epic plans, and none of the further **32** frontend cases in
`test-design-qa.md` § QA improvement backlog, which are **not** coverage in any case.
