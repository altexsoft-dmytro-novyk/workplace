# Test Design — Epic: User Management 5, Employment Lifecycle

> ## Status: **ungranted**. This is a new document and inherits nothing.
>
> - **Approval:** ungranted. No human has approved this document.
> - **Validation:** NOT RUN. No verdict of any kind is claimed here.
> - **Coverage:** none asserted. This document plans and records; it does not state that any
>   test exists, that any suite passes, or that any gate is green. **No pass rate appears
>   anywhere in it.**
> - **Provenance:** the obligations below were migrated out of `test-design-qa.md`,
>   [`test-design-epic-user-management.md` at `76a7220`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/76a7220701ac6f16843dad8b303934f9a958b54c/_bmad-output/test-artifacts/test-design-epic-user-management.md) and `test-design/people-management-handoff.md` as
>   they stood at `76a7220701ac6f16843dad8b303934f9a958b54c`. Some of those sources carried a
>   human approval dated 2026-08-25. **That approval does not transfer to this document.**

## Identity

| Field | Value |
| --- | --- |
| `epicId` | `UM-E5` |
| Epic title | Employment Lifecycle |
| `epicDomain` | `user-management` |
| `epicNumber` | `5` |
| `epicSourcePath` | `_bmad-output/planning-artifacts/user-management/epics.md` |
| Source heading | `### Epic 5: Employment Lifecycle`; `## Epic 5: Employment Lifecycle` |
| Stories in scope | `UM-E5-S5.1` record a departure · `UM-E5-S5.2` apply an effective departure |
| `runKey` | `epic-user-management-5` |
| Baseline commit | `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`) |
| Migration record | `_bmad-output/test-artifacts/test-design/migration-map.md` |

**Date:** 2026-09-10
**Author:** Test-design consolidation migration, Task 3 (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`)
**Status:** Draft — **approval ungranted**, validation **NOT RUN**

---

## What this plan owns, and what it does not

This plan owns **the scenario and risk coverage specific to `UM-E5`**. Everything shared is
owned elsewhere and is **referenced, never restated**:

| Shared rule | Owner |
| --- | --- |
| Risk identity, scores, rationale, residual risk, testability gaps, architecture seams | `test-design-architecture.md` § Risk register / § Testability gaps |
| Evidence contracts, execution and isolation policy, level strategy, gates, risk → evidence map, cross-epic regression map, NFR measurement contracts, QA improvement backlog | `test-design-qa.md` |
| Canonical epic identities and the `epic-{domain}-{number}` naming contract | `test-design-architecture.md` § Domain navigation |
| Controllable time, injected clocks and outbound fakes | `test-design-qa.md` § Cross-epic regression map — controllable time and outbound fakes |

**Level vocabulary.** `unit` here is the in-process state-transition and time-arithmetic level;
`api-e2e` means real HTTP against a real PostgreSQL. **`component` (jsdom with the network
mocked) carries no obligation in this epic** — the frontend departure `409` shapes are carried
once, by the error-extractor row in `test-design-qa.md` § QA improvement backlog, which is
**backlog, not coverage**. Definitions live in `test-design-qa.md` § Evidence levels and what
each one proves.

---

## Risks carried by this epic

Scores and rationale are **defined** in `test-design-architecture.md`; this table records
which of them this epic is the mitigation owner for, and re-scores nothing.

| Risk | Category / score | Statement | Mitigation direction here |
| --- | --- | --- | --- |
| `um-epic:R-UM-03` | DATA 2 × 3 = **6** | The departure state machine is only ever asserted through the worker, over HTTP. | Owner: `UM-E5` Employment Lifecycle (`UM-E5-S5.1`, `UM-E5-S5.2`); PM/AD-20 governs. Evidence direction: a **unit state-transition table** plus an `api-e2e` happy path plus the blocked-`409` path — the point of the rebalance is that the state machine gets a direct oracle instead of being inferred from worker output. |

---

## Coverage

**Nothing below is a coverage claim.** Each row is an obligation with a named owner and a
named evidence level; no row asserts that the evidence exists or passes.

### Unit

| Obligation | Subject | Cases | Authority |
| --- | --- | ---: | --- |
| `um-epic:cluster/departure-state-machine` | The departure state machine as a direct transition table. | 11 | `UM-E5` Employment Lifecycle; PM/AD-20. Evidence: **unit table + 2 `api-e2e`** — the two `api-e2e` cases are the happy path and the blocked-`409` path named on `R-UM-03`, not additional net-new unit cases. |
| `um-epic:cluster/departure-due-time` | `effectiveDate` + `effectiveTimeZone` → `dueAt`. | 8 | Same epic. AD-20's "one validated business timezone/database" constraint. Time arithmetic is exercised with an injected deterministic clock; **no production schedule value is invented.** |
| `um-epic:cluster/blocker-digest` | `expectedBlockerVersion` — the blocker digest. | 4 | Same epic; `UM-E5-S5.1` blocker matrix. |

### api-e2e (real HTTP + PostgreSQL)

| Obligation | Priority | Subject | Disposition and authority |
| --- | --- | --- | --- |
| `legacy-um:TD-UM-DEACT-03` | `P1` | Departure-permission denial. | **replace.** DEC-UM-002's traceability row re-points this to "Epic 5 departure-permission denial", and DEC-UM-002's v1.5 note states the surviving principle precisely: any capability check — **including the departure command** — is a **no-target `AccessControl` feature-capability** check through the facade, and "no controller, action, domain service, or adapter hard-codes a role name or `User.position`". **That principle is the load-bearing half; the `DELETE /users/:id` surface is not**, and it is not carried forward. Actor rule (Ida for a generic feature-permission denial) preserved via `legacy-um:C-04`, owned by `test-design-qa.md` § Persona and denial-actor conventions. |

**A successor obligation with a scenario and no production path.** `UM-E5` implementation is
blocked on **`CC-06`, P1 open**. The departure obligations above have scenarios in
`docs/test-cases/user-management/departure/` and **no production path yet**. This is recorded
as a dependency; **nothing here claims it is resolved, and no evidence is asserted.**

---

## Retired at migration — recorded so it is not reintroduced

| Retired | Authority | What survives |
| --- | --- | --- |
| `legacy-um:TD-UM-DEACT-01` (HR Admin soft delete; the row survives) | **Confirmed `retire`, on the suite's own recorded authority.** `docs/test-cases/user-management/deactivation/README.md` states it directly: `um-deact-01..03` "tested a generic `DELETE /users/:id` deactivation capability. That capability is removed in v1.5 (AD-16): `isActive` is an internal account/row-retention flag only, not employment status and not a product deactivation operation", and "Employment lifecycle … is **Epic 5**". PM/AD-22 and PM/AD-21 corroborate. | The **"the record survives, it is not hard-deleted"** intent survives inside `UM-E5` departure (`departure/um-dep-01..08`), implementation blocked on `CC-06` (P1 open). The `DELETE /users/:id` **capability** has no successor. The README also records that `services/backend/test/user-management/deactivation.e2e-spec.ts` is a corresponding retirement — **this migration does not touch that file.** |

Retired scenario files are **not** resurrected by this plan.

---

## NFR

The shared measurement contracts — including the three performance contracts that must stay
separate — are owned by `test-design-qa.md` § NFR measurement contracts. This epic carries one
epic-local NFR obligation:

| NFR | Statement | Evidence level | Authority |
| --- | --- | --- | --- |
| `um-epic:nfr/reliability` | The departure worker is **idempotent under retry and partial failure**. | `unit` state table + `api-e2e` | PM/AD-20's durable, retrying, fail-closed executor. |

**Operational thresholds are not invented here.** Uptime SLO, RTO, RPO, backup and retention,
timeout / retry / backoff counts, circuit thresholds and non-departure observability thresholds
are all **UNKNOWN** and gated by `PR-B-09` (`OPERATIONAL-ENVELOPE`, **P0 open**). They stay open
as **U-5**. This plan asserts the idempotency *property*; it names no retry count and no
backoff.

---

## Entry and exit criteria

Owned by `test-design-qa.md` § Entry criteria and § Exit criteria. This plan states no
separate thresholds and ticks no boxes.

---

## Regression

Owned by `test-design-qa.md` § Cross-epic regression map. Two triggers reach this epic:

- **Departure → auth / access control / tasks / mentorship** — partial offboarding (PM/AD-20).
  A departure change must be re-checked against every downstream consumer, not just the worker.
- **Mentorship and lifecycle → timeline** — missing or incorrect events, and closure notes
  (PM/AD-17, AD-20). See `test-design-epic-user-management-3.md` and
  `test-design-epic-mentorship-1.md`.

The **TTL / controllable-time and outbound-fake** conventions this epic's `dueAt` and worker
cases depend on are preserved in `test-design-qa.md` § Cross-epic regression map — controllable
time and outbound fakes.

---

## Gate

No handoff epic/story gate routes to this plan in the ledger. Gate identity, thresholds and the
`allow_gate=false` boundary are owned by `test-design-qa.md` § Release and design gates. **No
gate is asserted green here, and none is invented.**

---

## Open questions

Open, and **answered nowhere in this document**. Register of record:
`test-design/migration-map.md` §10.

| Question | Subject | Owner |
| --- | --- | --- |
| **U-5** | Uptime SLO, RTO, RPO, backup / retention, timeout / retry / backoff counts, circuit thresholds, non-departure observability thresholds. Gated by `PR-B-09` (`OPERATIONAL-ENVELOPE`, P0 open). | DevOps + Architect + Security |
| **U-17** | What closes the register entries that remain open at implementation — for this epic, `CC-06`, which gates every departure obligation above. | Product + Architect + the named blocker owners |

---

## Obligation trace

**Every ledger row whose `target_path_and_anchor` names this file.** Extracted mechanically
from `test-design/migration-map.md` under a parser that reproduces the ledger's own certified
totals (565 rows; 328 `preserve` / 90 `merge` / 96 `replace` / 51 `retire`; every row exactly
eight cells). **No ledger row targeting this file carries a bare `same` / `same pattern`
target cell.**

**Machine-counted at the moment this section was written: 7 rows — 5 `preserve`, 1 `replace`,
1 `retire`. 0 `merge`.**

| Ledger § | Rows | Dispositions | Resolved in this document |
| --- | ---: | --- | --- |
| §4.3a | 1 | 1 preserve | § Risks (`R-UM-03`) |
| §4.3b | 3 | 3 preserve | § Coverage → Unit (three clusters) |
| §4.3c | 2 | 1 replace · 1 retire | § Coverage → api-e2e (`DEACT-03`), § Retired at migration (`DEACT-01`) |
| §7.1 | 1 | 1 preserve | § NFR (`um-epic:nfr/reliability`) |
| **Total** | **7** | **5 · 0 · 1 · 1** | |

**Net-new cases routed to this plan: 23, all backend unit** — `departure-state-machine` **11**,
`departure-due-time` **8**, `blocker-digest` **4**. The two `api-e2e` cases named on
`R-UM-03` (happy path, blocked-`409`) are part of that cluster's evidence contract and are
**not** counted again as net-new. **No share of the 5 `um-epic` net-new e2e cases is claimed**:
the ledger states that figure only as a total (`um-epic:est/59 net-new cases (54 unit + 5
e2e)`) and gives no per-epic breakdown, so none is invented here. No frontend net-new case
routes to this plan.

These 23 fall inside the **112** net-new cases (59 User Management + 53 frontend) that land in
epic plans; the further **32** frontend cases in `test-design-qa.md` § QA improvement backlog
are **not** coverage and are not counted here.
