# Test Design — Epic: User Management 0, Access Control Adoption

> ## Status: **ungranted**. This is a new document and inherits nothing.
>
> - **Approval:** ungranted. No human has approved this document.
> - **Validation:** NOT RUN. No verdict of any kind is claimed here.
> - **Coverage:** none asserted. This document plans and records; it does not state that any
>   test exists, that any suite passes, or that any gate is green. **No pass rate appears
>   anywhere in it.**
> - **Provenance:** the obligations below were migrated out of `test-design-qa.md`,
>   `test-design-architecture.md` and
>   [`test-design-epic-user-management.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-epic-user-management.md) as they stood at
>   `76a7220701ac6f16843dad8b303934f9a958b54c`. Two of those sources carried a human approval
>   dated 2026-08-25. **That approval does not transfer to this document.**

## Identity

| Field | Value |
| --- | --- |
| `epicId` | `UM-E0` |
| Epic title | Access Control Adoption |
| `epicDomain` | `user-management` |
| `epicNumber` | `0` |
| `epicSourcePath` | `_bmad-output/planning-artifacts/user-management/epics.md` |
| Source heading | `### Epic 0: Access Control Adoption`; `## Epic 0: Access Control Adoption` |
| `runKey` | `epic-user-management-0` |
| Baseline commit | `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`) |
| Migration record | `_bmad-output/test-artifacts/test-design/migration-map.md` — the disposition ledger this document was written from |

**Date:** 2026-09-10
**Author:** Test-design consolidation migration, Task 3 (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`)
**Status:** Draft — **approval ungranted**, validation **NOT RUN**

---

## What this plan owns, and what it does not

This plan owns **the scenario and risk coverage specific to `UM-E0`**. Everything shared is
owned elsewhere and is **referenced, never restated**:

| Shared rule | Owner |
| --- | --- |
| Risk identity, scores, rationale, residual risk, testability gaps, architecture seams | `test-design-architecture.md` § Risk register / § Testability gaps |
| Evidence contracts, execution and isolation policy, level strategy, gates, risk → evidence map, cross-epic regression map, NFR measurement contracts, QA improvement backlog | `test-design-qa.md` |
| Canonical epic identities and the `epic-{domain}-{number}` naming contract | `test-design-architecture.md` § Domain navigation |

**Level vocabulary.** `component` means jsdom with the network mocked — no browser, no HTTP,
no database. It is **not** interchangeable with Playwright e2e figures. `api-e2e` means real
HTTP against a real PostgreSQL. The full definitions live in
`test-design-qa.md` § Evidence levels and what each one proves.

---

## Risks carried by this epic

Scores and rationale are **defined** in `test-design-architecture.md`; this table records
which of them this epic is the mitigation owner for, and does not re-score anything.

| Risk | Category / score | Statement | Mitigation direction here |
| --- | --- | --- | --- |
| `legacy-um:R-001` | SEC 3 × 3 = **9** | A controller bypasses the `AccessControl` facade. | `UM-E0` "Access Control Adoption" is the canonical owner. Score 9 is preserved and **not** renormalised. Evidence direction: `api-e2e` per route class. Authority: `docs/architecture/README.md` non-negotiable 7 (facade only), PM/AD-9. |
| `um-epic:R-UM-02` | SEC **9** | `org:relationships:write`, `profile:timeline:write` and `employee:departure:record` exist only as string literals; bootstrap seeds three other keys. | The access-control adoption seam is `UM-E0`; the permission catalog itself is `RA-E1-S1.1`, so this is **cross-referenced to `role-administration` `RA-E1`, not owned there and not duplicated**. **The fix is a product + Access Control decision, not a test decision** — the source says so explicitly. Remains open as **U-9**. |

---

## Coverage

**Nothing below is a coverage claim.** Each row is an obligation with a named owner and a
named evidence level. No row asserts that the evidence exists or passes.

### Unit

| Obligation | Subject | Cases | Authority |
| --- | --- | ---: | --- |
| `um-epic:cluster/permission-key-seed-vs-gate-set` | The seeded permission-key set is compared against the key set the code actually gates on. | 1 | `UM-E0`; mitigates `um-epic:R-UM-02`. The source design calls this "the highest value/effort ratio in this document". |

### api-e2e (real HTTP + PostgreSQL)

| Obligation | Priority | Subject | Authority |
| --- | --- | --- | --- |
| `legacy-um:TD-UM-AC-01` | `P0` | Mutations call `AccessControl`; sample each controller. | `UM-E0-S0.2` write-path dual gate; mitigates `legacy-um:R-001`. Evidence level: `api-e2e` **per controller**. |

### Cross-referenced, owned elsewhere

These are recorded so a reader of this plan finds them, and so they are not counted twice.
**They are not this epic's coverage.**

| Obligation | Owner | Why it is referenced here |
| --- | --- | --- |
| `legacy-um:TD-UM-REG-02` — unauthenticated import → `401` (`seed/um-seed-11-import-unauthenticated.md`) | `test-design-epic-user-management-1.md` § Coverage | One **instance** of the PM/AD-24 route-class denial oracle, which `UM-E0` owns per route class. The instance is not duplicated here. |
| `legacy-um:TD-UM-PF-05` — self cannot `PATCH` another person's record | `test-design-qa.md` § Access-boundary evidence (platform) | Ownership was resolved to the platform pair: "who may write another person's record" is an access-control decision under non-negotiable 7, and `UM-E0-S0.2` is the seam that proves adoption. Placing the **rule** in the platform pair and the **instance** in `UM-E0` avoids a second source of shared policy. Corroborating scenarios: `docs/test-cases/user-management/access-control-adoption/` (24 files). |

**Dependency on an open blocker, recorded, not discharged.** `SEC-AUTH-01` is **P0 open**:
`isAllowedForTarget` was `Boolean(userId)` at `e6049c8` and, although the real facade adapter
is now bound, `interim-session-resolver.adapter.ts` still self-provisions
`position: 'HR Admin'`. A green result on the access-boundary obligations today would
therefore not be trustworthy evidence. This is recorded as a dependency; nothing here claims
it is resolved.

---

## NFR

The shared measurement contracts — including the three performance contracts that must stay
separate — are owned by `test-design-qa.md` § NFR measurement contracts. This epic carries
one epic-local NFR obligation:

| NFR | Statement | Evidence level | Authority |
| --- | --- | --- | --- |
| `um-epic:nfr/security` | The seeded permission-key set is a **superset** of the keys the code gates on. | `unit` | Mitigates `um-epic:R-UM-02`. Whether the keys get seeded at all is an open **product + Access Control** decision (**U-9**), not a test decision. |

---

## Denial oracle

`UM-E0` owns the **PM/AD-24 three-code denial oracle** per route class — `401` for an invalid
or inactive session, `404` for a hidden or missing target, `403` for a target that is visible
but forbidden. Individual instances of it live with the routes they guard (for example the
import-route instances in `test-design-epic-user-management-1.md`). The actor-selection
convention (`legacy-um:C-04` — Ida for a generic feature-permission denial, Bob only for a
manager-specific probe) is owned by `test-design-qa.md` § Persona and denial-actor conventions.

---

## Entry and exit criteria

Owned by `test-design-qa.md` § Entry criteria and § Exit criteria. This plan states no
separate thresholds and ticks no boxes.

---

## Regression

Owned by `test-design-qa.md` § Cross-epic regression map. The trigger most relevant to this
epic is preserved there: **any change to any endpoint → the full access-control E2E on every
PR**, and **the `AccessControl` facade → every consumer**.

---

## Open questions

Open, and **answered nowhere in this document**. The register of record is
`test-design/migration-map.md` §10.

| Question | Subject | Owner |
| --- | --- | --- |
| **U-9** | Whether `org:relationships:write`, `profile:timeline:write` and `employee:departure:record` get seeded into the permission catalog, or the gap becomes an accepted recorded decision. | Product + Access Control |

---

## Obligation trace

**Every ledger row whose `target_path_and_anchor` names this file.** Extracted mechanically
from `test-design/migration-map.md` under a parser that reproduces the ledger's own certified
totals (565 rows; 328 `preserve` / 90 `merge` / 96 `replace` / 51 `retire`; every row exactly
eight cells). **No ledger row targeting this file carries a bare `same` / `same pattern`
target cell**, so nothing is lost by a filename match here.

**Machine-counted at the moment this section was written: 7 rows — 5 `preserve`, 1 `merge`,
1 `replace`. 0 `retire`.**

| Ledger § | `source_anchor_or_id` | Disposition | Resolved in this document |
| --- | --- | --- | --- |
| §4.1 | `legacy-um:R-001` | preserve | § Risks carried by this epic |
| §4.3a | `um-epic:R-UM-02` | preserve | § Risks carried by this epic |
| §4.3b | `um-epic:cluster/permission-key-seed-vs-gate-set` | preserve | § Coverage → Unit |
| §4.3c | `legacy-um:TD-UM-AC-01` | preserve | § Coverage → api-e2e |
| §4.3c | `legacy-um:TD-UM-REG-02` | replace | § Coverage → Cross-referenced (owned by `UM-E1`) |
| §4.3c | `legacy-um:TD-UM-PF-05` | merge | § Coverage → Cross-referenced (owned by the platform pair) |
| §7.1 | `um-epic:nfr/security` | preserve | § NFR |

**Net-new case count routed to this plan: 1** (unit). It is part of the 112 net-new cases
(59 User Management + 53 frontend) that land in epic plans; the further 32 frontend cases in
`test-design-qa.md` § QA improvement backlog are **not** coverage and are not counted here.
