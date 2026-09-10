# Test Design — Epic: User Management 2, Magic-Link Authentication

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
>   a human approval dated 2026-08-25. **That approval does not transfer to this document**,
>   and it never covered `DEC-UM-012` in the first place.

## Identity

| Field | Value |
| --- | --- |
| `epicId` | `UM-E2` |
| Epic title | Magic-Link Authentication |
| `epicDomain` | `user-management` |
| `epicNumber` | `2` |
| `epicSourcePath` | `_bmad-output/planning-artifacts/user-management/epics.md` |
| Source heading | `### Epic 2: Magic-Link Authentication`; `## Epic 2: Magic-Link Authentication` |
| Stories in scope | `UM-E2-S2.1` request a magic link by work email · `UM-E2-S2.2` consume a magic-link token to establish a session |
| `runKey` | `epic-user-management-2` |
| Baseline commit | `76a7220701ac6f16843dad8b303934f9a958b54c` (backend `f1eea3c0…`, frontend `fa3d3198…`) |
| Migration record | `_bmad-output/test-artifacts/test-design/migration-map.md` |

**Date:** 2026-09-10
**Author:** Test-design consolidation migration, Task 3 (`docs/superpowers/plans/2026-09-10-test-design-consolidation.md`)
**Status:** Draft — **approval ungranted**, validation **NOT RUN**

---

## What this plan owns, and what it does not

This plan owns **the scenario and risk coverage specific to `UM-E2`**, across **both** of its
test levels: the backend magic-link request/consume obligations and the frontend
session-parsing, route-guard and account-menu obligations belong to the same product epic, so
they live in **one** plan with separate test-level subsections. Everything shared is owned
elsewhere and is **referenced, never restated**:

| Shared rule | Owner |
| --- | --- |
| Risk identity, scores, rationale, residual risk, testability gaps, architecture seams | `test-design-architecture.md` § Risk register / § Testability gaps |
| Evidence contracts, execution and isolation policy, level strategy, gates, risk → evidence map, cross-epic regression map, NFR measurement contracts, QA improvement backlog | `test-design-qa.md` |
| Canonical epic identities and the `epic-{domain}-{number}` naming contract | `test-design-architecture.md` § Domain navigation |

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
| `legacy-um:R-009` | BUS **4** | A deactivated user can still request a magic link. | Owner: `UM-E2`. **Its approval status is `draft-decision`, not `ungranted`** — the risk survives as the subject of draft `DEC-UM-012`, which is explicitly "not covered by the 2026-08-25 product approval that settled DEC-UM-001..011". Evidence direction: `api-e2e`. Stays open as **U-6**. |
| `fe-epic:R-FE-01` *(frontend subsection)* | SEC 3 × 3 = **9** | `decodeJwtSub` / `isJwtExpired` are untested at any level. | Session parsing decides who is logged in, and magic-link authentication is `UM-E2`, so the frontend half lives in this plan rather than in a fictitious `frontend` epic. Evidence direction: `unit`. |
| `fe-epic:R-FE-06` *(frontend subsection)* — **predicate-testing half** | TECH **4** | No proactive session-expiry handling. | **Split 1 of 2, and only this half is a test obligation.** The source's own mitigation is "unit-test the predicate now", so `isJwtExpired` predicate testing sits here with `UM-E2`. Corroborated by `_bmad-output/implementation-artifacts/user-management/deferred-work.md:23–25` — `AuthContext` evaluates `isJwtExpired` only at mount, and the 401 interceptor is the only safety net. **Half 2 — whether the app should proactively log out on a timer or `visibilitychange` — is a product decision and stays open as U-13. It is not answered here.** Evidence direction: `unit`. |

---

## Coverage — backend

**Nothing below is a coverage claim.** Each row is an obligation with a named owner and a
named evidence level; no row asserts that the evidence exists or passes.

### api-e2e (real HTTP + PostgreSQL)

| Obligation | Priority | Subject | Disposition and authority |
| --- | --- | --- | --- |
| `legacy-um:TD-UM-AUTH-01` | `P0` | Request a magic link for a known work email. | preserve. `UM-E2-S2.1`; DEC-UM-004. |
| `legacy-um:TD-UM-AUTH-02` | `P1` | Enumeration-safe response for an unknown email; **zero dispatch**. | preserve. DEC-UM-004. **The remediation travels with the case:** `legacy-um:S15#7` records that the response schema must be **frozen and asserted by deep equality** — a shape-only assertion would let an enumeration oracle back in. Carries gap `legacy-um:G-08`. |
| `legacy-um:TD-UM-AUTH-03` | `P0` | Consuming a token establishes a working session. | preserve. `UM-E2-S2.2`. |
| `legacy-um:TD-UM-AUTH-04` | `P1` | An expired token → `401`. | preserve. DEC-UM-004: the TTL is **configuration-owned**, boundary-tested with an **injected deterministic TTL and a controllable clock**. **No production duration is invented here** — see `test-design-qa.md` § NFR measurement contracts — configuration-owned note. Evidence level: `api-e2e` with an injected clock. |
| `legacy-um:TD-UM-AUTH-05` | `P1` | Replaying a consumed token → `401`. | preserve. DEC-UM-004 single-use. |
| `legacy-um:TD-UM-AUTH-06` | `P0` | A deactivated user's login is denied. | preserve, **with `draft-decision` approval status**. The *case* survives; the *decision* behind it does not become settled by being written down here. `DEC-UM-012` is **Proposed**, and explicitly outside the 2026-08-25 approval. Carries gap `legacy-um:G-07` (P0). Open as **U-6**. |

### Dispatch reliability — a surviving half of a retired obligation

| Obligation | Priority | Subject | Disposition and authority |
| --- | --- | --- | --- |
| `DEC-UM-004:magic-link-dispatch-reliability` | `P1` | Email transport failure must not lose the dispatch intent. | Successor to retired `legacy-um:TD-UM-NFR-REL-01`, **not a reuse of that retired ID**. DEC-UM-008 retires the original registration subject: "there is no create-time dispatch to make durable". The distinct surviving obligation is dispatch reliability for **`POST /auth/magic-link`** under DEC-UM-004. Evidence level: `api-e2e` with a throwing fake. Approval: ungranted. |

---

## Coverage — frontend

**`component` = jsdom with the network mocked.** These are not Playwright e2e cases and must
never be counted as such.

### Unit

| Obligation | Subject | Cases | Authority |
| --- | --- | ---: | --- |
| `fe-epic:unit/session.ts` | `decodeJwtSub`, `isJwtExpired`, session read / write / clear. | 12 (P0) | Mitigates `fe-epic:R-FE-01`; also carries the predicate half of `fe-epic:R-FE-06`. |

### Component (jsdom, network mocked)

| Obligation | Subject | Cases | Authority |
| --- | --- | ---: | --- |
| `fe-epic:component/RequireAuth` | The route guard admits and refuses correctly. | 4 (P0) | The route guard is part of the authenticated-session obligation, `UM-E2`. |
| `fe-epic:component/AccountMenu` | Sign-out and session interaction. | 3 (P1) | `UM-E2` session interaction. |

**A recorded coverage gap, not a closed one.** `fe-epic:unit/session.ts` covers the *decoder*,
not a component's *consumption* of `useAuth().userId` / `decodeJwtSub` output. No G1 component
reads it, and nothing in this plan closes that. It stays open as **U-22**.

---

## Decisions and gaps landing here

| Item | Statement | Approval | Evidence level | Authority |
| --- | --- | --- | --- | --- |
| `legacy-um:DEC-UM-012` | Whether a deactivated user's `workEmail` is treated identically to an unknown email for `POST /auth/magic-link`; extends DEC-UM-004. | **`draft-decision` — marked draft, and it stays draft.** | `api-e2e` | `docs/architecture/user-management-test-decisions.md`: "Proposed 2026-08-25 by TEA per-file scenario review — **not covered by the 2026-08-25 product approval that settled DEC-UM-001..011**; treat as draft until explicitly confirmed." **It must not inherit the DEC-UM-001..011 approval, and its answer is not invented here** (**U-6**). |
| `legacy-um:G-07` | Magic link for a **deactivated** user (P0). | `draft-decision` | `api-e2e` | Subject of draft `DEC-UM-012`; carried by `TD-UM-AUTH-06`. |
| `legacy-um:G-08` | Magic link for an **unknown** email — no dispatch (P1). | ungranted | `api-e2e` | DEC-UM-004; carried by `TD-UM-AUTH-02`. |

---

## NFR

The shared measurement contracts — including the **three performance contracts that must stay
separate** — are owned by `test-design-qa.md` § NFR measurement contracts. Two things matter to
a reader of this plan:

| NFR | Statement | Evidence level | Authority |
| --- | --- | --- | --- |
| `fe-epic:nfr/security` | A malformed or expired token **never** yields an authenticated shell. | `unit` + the existing `fe-auth-*` e2e | Mitigates `fe-epic:R-FE-01`. Naming the existing `fe-auth-*` specs records where the evidence would live; **it is not an assertion that they exist, run, or pass.** |

**Configuration-owned thresholds.** The magic-link TTL is production configuration, not a test
constant. Tests inject a deterministic value and verify the boundary. No production duration
appears in this plan.

---

## Gate

| Gate | Content |
| --- | --- |
| `legacy-um:handoff/Epic 2 "Magic-Link Auth"` gate (`AUTH-01`, `AUTH-03`, `AUTH-06`) | **preserve.** Canonical Epic 2 is "Magic-Link Authentication" (`UM-E2`), so the handoff gate and the canonical epic match and the gate carries over intact. Evidence level: `api-e2e`. **`AUTH-06`'s underlying decision stays `draft-decision`** — a gate case whose decision is draft is recorded as such, not promoted. **Ungranted — no gate is asserted green.** |

Gate identity, thresholds and the `allow_gate=false` boundary are owned by
`test-design-qa.md` § Release and design gates.

---

## Entry and exit criteria

Owned by `test-design-qa.md` § Entry criteria and § Exit criteria. This plan states no
separate thresholds and ticks no boxes.

---

## Regression

Owned by `test-design-qa.md` § Cross-epic regression map. The trigger that names this epic is
preserved there: **`legacy-um:reg/Epic 2 → all suites`** — session tokens underpin every other
suite, so **any change to the auth/session path triggers the auth smoke on every PR**. The
controllable-clock and outbound-fake conventions this epic's TTL and dispatch cases depend on
are owned by `test-design-qa.md` § Cross-epic regression map — controllable time and outbound
fakes.

---

## Open questions

Open, and **answered nowhere in this document**. Register of record:
`test-design/migration-map.md` §10.

| Question | Subject | Owner |
| --- | --- | --- |
| **U-6** | `DEC-UM-012` — whether a deactivated user's `workEmail` is treated identically to an unknown email for `POST /auth/magic-link`. | Product (explicit confirmation required) |
| **U-13** | Whether the app should proactively log out on a timer / `visibilitychange`, rather than relying on the 401 interceptor. Only the predicate-testing half of `fe-epic:R-FE-06` is a test obligation, and that half is placed above. | Product |
| **U-22** | What covers the "`useAuth().userId` / `decodeJwtSub` output is unverified — no G1 component reads it" gap. | DEV + QA |
| **U-12** | Test-file location conventions, the second vitest config and `@testing-library/react` — a **prerequisite for the frontend net-new cases in this plan**. | DEV |

---

## Obligation trace

**Every ledger row whose `target_path_and_anchor` names this file.** Extracted mechanically
from `test-design/migration-map.md` under a parser that reproduces the ledger's own certified
totals (565 rows; 328 `preserve` / 90 `merge` / 96 `replace` / 51 `retire`; every row exactly
eight cells). **No ledger row targeting this file carries a bare `same` / `same pattern`
target cell.**

**Machine-counted at the moment this section was written: 18 rows — 17 `preserve`, 1 `retire`.
0 `merge`, 0 `replace`.**

| Ledger § | Rows | Dispositions | Resolved in this document |
| --- | ---: | --- | --- |
| §4.1 | 1 | 1 preserve | § Risks (`R-009`) |
| §4.3c | 7 | 6 preserve · 1 retire | § Coverage — backend (`AUTH-01..06`; `NFR-REL-01` auth half) |
| §4.3e | 1 | 1 preserve | § Gate |
| §4.4 | 5 | 5 preserve | § Risks (`R-FE-01`, `R-FE-06` half 1), § Coverage — frontend (`session.ts`, `RequireAuth`, `AccountMenu`) |
| §5.4 | 1 | 1 preserve | § Decisions and gaps (`DEC-UM-012`, draft) |
| §5.5 | 2 | 2 preserve | § Decisions and gaps (`G-07`, `G-08`) |
| §7.1 | 1 | 1 preserve | § NFR (`fe-epic:nfr/security`) |
| **Total** | **18** | **17 · 0 · 0 · 1** | |

**Net-new cases routed to this plan: 19, all frontend** — `fe-epic:unit/session.ts` **12**,
`fe-epic:component/RequireAuth` **4**, `fe-epic:component/AccountMenu` **3**. No `um-epic`
level-rebalance unit cluster routes here, and **no share of the 5 `um-epic` net-new e2e cases
is claimed**: the ledger states that figure only as a total (`um-epic:est/59 net-new cases
(54 unit + 5 e2e)`) and gives no per-epic breakdown, so none is invented here.

All 19 fall inside the **112** net-new cases (59 User Management + 53 frontend) that land in
epic plans; the further **32** frontend cases in `test-design-qa.md` § QA improvement backlog
are **not** coverage and are not counted here.
