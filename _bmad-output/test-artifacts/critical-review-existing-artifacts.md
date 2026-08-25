# Critical Review — Existing User-Management Test Artifacts

**Date:** 2026-08-25  
**Reviewer:** TEA (system-level test design run)  
**Status:** Approved 2026-08-25 — decisions propagated to normative sources; stage-1 scenarios updated. No production code or stage-2 E2E modified by this reconciliation.  
**Subjects reviewed (not sources of truth):**
- `docs/architecture/testing-strategy.md`
- `_bmad-output/specs/spec-user-management-test-cases/SPEC.md`
- `docs/test-cases/user-management/**/*.md` (28 scenario files)

**Authoritative sources used instead:**
- `docs/project-requirements.md`
- `_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` (AD-1..AD-14)
- `docs/architecture/*.md` (access-control, api-conventions, database-schema)

**Additional decision context (intent evidence, not a source of truth):**
- `../workplace/docs/requirements-qa-addendum.md` — confirms the Manager-vs-PP question was deferred rather than resolved
- workspace branch `dn-user-management` — story/spec intent through `6fb1040`
- backend branch `user-management` — Prisma/test intent at `865df5f`; not a working implementation
- abandoned PRD draft `f77a11c` — corroborating `DEC-106` wording only; never merged and therefore non-normative

---

## Executive Summary

At the time of the initial review, the existing 28-file stage-1 suite was a solid start on workflow correctness for Epics 1–3, but it **could not serve as the system-level test design** because:

1. **Two epics have zero scenario coverage** (Epic 4 relationships; Story 1.5 list endpoint).
2. **Several scenarios rest on unsourced assumptions** that contradict or extend requirements without product sign-off.
3. **Requirements contradictions** (timeline editors, deactivation actor) are papered over rather than escalated.
4. **NFR and concurrency coverage** is largely absent or placed at the wrong test level.
5. **Test isolation and observability** are undocumented, making concurrent and ordering-sensitive cases unreliable in CI.

This review informs the rebuilt test design in `test-design-architecture.md` and `test-design-qa.md`. Existing files should not be updated until this design receives explicit human approval.

## Reconciliation Ledger — 2026-08-25

The findings below remain an audit snapshot. This ledger records the subsequently approved **planning interpretation** after reviewing Dmytro's workspace/backend branches and the requirements Q&A addendum. The user approved the complete decision set on 2026-08-25. These decisions are binding for the derived QA/test-design artifacts, but they still need to be copied into the normative decision log or requirements before implementation artifacts are treated as authoritative.

### Source contradictions

| ID | Disposition | Planning rule / remediation | Formal status |
| --- | --- | --- | --- |
| **C-01** | **Planning decision approved** | S9 read follows the matrix: the full Manager line and PP may read. Manual add/correct/delete follows the more specific §4.9 workflow: the assigned PP and the employee's **direct UM** may write; project-derived DM/PM and transitive managers are read-only. This matches Stories 3.2/3.3 and backend intent. | Publish this approved rule in the normative decision log/requirements before implementation approval. |
| **C-02** | **Correction required** | Story 1.1 keeps its core behavior groups, but its traceability table and I/O matrix must map all **nine** current registration scenarios, not only four. The Story 1.1 task ledger already admits this drift. | Planning drift, not a product decision. |
| **C-03** | **Already resolved** | Current scenario files cite baseline sections, PRD FR-1..4, data-model notes, or ADs. Derived FR-5..16 are identified as `epics.md` requirements rather than mislabeled as PRD FRs. | The finding described an earlier revision; retain TD-UM-DOC-01 as a regression audit. |
| **C-04** | **Test strategy adopted** | Use **Ida** (holds an unrelated functional permission but lacks the capability under test) for generic feature-permission denials. Use Bob only for a separate manager-specific denial. This catches an incorrect "any functional role" gate. | Reconcile stale deactivation/backend tests after the deactivation capability is formalized. |
| **C-05** | **Clarified** | Timetracker supplies projects, people, PM, and DM; those assignments drive project-derived Manager access. It supplies **no reports-to hierarchy**. Reports-to is a manual HR-Admin-managed `direct` relationship. Correct PRD/epic wording that currently collapses "no reports-to" into "no project data." | Baseline §5.1 and AD-10 already support this distinction. |
| **C-06** | **Accepted as intentional** | A manual historical entry may use any documented `UserEvents` type, including `mentorship_end`, even if that type's automatic trigger path is not implemented yet. Scenario prose must state that this proves the manual backfill path only and does not simulate Epic 4 relationship lifecycle behavior. | No product contradiction once the two paths are distinguished explicitly. |
| **C-07** | **Already resolved in stage 1** | `um-reg-05` now requires the stage-2 email-adapter fake to record exactly one dispatch to the new hire and no session in body or headers. Backend E2E `865df5f` is stale because it checks only the HTTP response. | Reconcile stage-2 E2E after scenario approval; no further product decision needed. |

### Approved intent decisions exposed by the review

| Finding | Approved planning intent | Follow-through |
| --- | --- | --- |
| **A-01 / R-003** magic-link security | Same `200` response shape for known/unknown email; zero dispatch for unknown; tokens expire and are single-use. TTL is configuration-owned and boundary-tested with a controllable clock; the QA design does not invent a production duration. | Record the behavior in the security decision log. Rate limits are separate hardening, not a blocker for these scenarios. |
| **A-02 / B-02** deactivation actor | A no-target AccessControl **feature-capability** check; the seeded HR Admin role holds that capability. Do not hard-code the role name in controller/domain code. | Add the capability to the formal permission catalog; its final identifier is an implementation detail. |
| **A-03 / B-05** `customFields` | Database default is JSON object `{}`; registration need not supply it. Dmytro's Prisma schema and SQL migration both encode this intent. | Copy the default into the binding database-schema/ADR when implementation begins. |
| **A-06 / R-004** reports-to reassignment | Reject-then-retry: a second `POST` while a `direct` edge exists returns `409`; reassignment is explicit `DELETE` then `POST`. | Copy the rule into Epic 4/normative API behavior. |

### Previously open questions — approved resolutions

1. **OQ1 — server-owned fields:** reject `id`, `createdAt`, and `createdBy` in a create payload with `400`; do not silently strip caller mistakes.
2. **OQ2 — `workEmail` normalization:** trim outer whitespace and lowercase before validation, storage, lookup, and uniqueness comparison. The database constraint applies to the normalized value.
3. **OQ3 / B-04 — dispatch failure:** the registration transaction commits the `User`, `joined_company` event, and durable magic-link dispatch intent; successful registration returns `201`. A downstream transport failure does not roll back the employee. It is observable as pending/failed and retryable. Retry count/backoff is an operational setting, not a scenario blocker.
4. **OQ4 — rehire:** a deactivated employee keeps the same identity and history. Rehire/reactivation operates on that existing `User`; `POST /users` must never create a second row for the normalized email. The dedicated rehire endpoint shape remains outside this test-design scope.
5. **OQ5 / B-03 — E2E isolation:** the initial PR gate runs E2E files with one worker. Each run/test uses a collision-proof UUID namespace and deletes only data it owns. `Date.now()` alone is not sufficient. Before enabling parallel workers, give each worker a separate PostgreSQL schema and clean up that schema after the run.

No unresolved item in this decision set is a global implementation blocker. Exact production TTL, retry backoff, permission identifier, and rehire endpoint shape are configuration/interface follow-through, not contradictions in expected behavior.

---

## 1. Unsupported Assumptions

| ID | Location | Assumption | Risk |
| --- | --- | --- | --- |
| A-01 | `um-auth-02`, `um-auth-04`, `um-auth-05`, SPEC Assumptions | Account-enumeration-safe identical `200` for unknown emails; token expiry; single-use replay — **none sourced from project-requirements or PRD** | Security posture decided by tests, not product; may over- or under-specify auth |
| A-02 | `um-deact-01/03`, SPEC Assumptions | Deactivation is HR-Admin-gated "by symmetry with registration" — **`isActive` has no §3.2 matrix audience** | Wrong actor gate ships if assumption is wrong |
| A-03 | SPEC Assumptions | `customFields` defaults to `{}` on create — **database-schema names column non-nullable but no default documented** | Registration may 400/500 on every create |
| A-04 | `um-ct-03/04`, SPEC Assumptions | Manual timeline actors are **PP and UM only**, not full Manager line — §3.2 S9 says **Manager line RW** | DM/PM may be wrongly denied or wrongly granted write |
| A-05 | `um-reg-01` | Nullable omitted columns return present-and-`null` — **not explicitly sourced** | API contract ambiguity |
| A-06 | Story 4.1 (epics.md) | Reports-to reassignment is reject-then-retry (`409`), not implicit replace — **flagged as design call, not sourced** | HR workflow friction vs data integrity trade-off undecided |
| A-07 | `testing-strategy.md` | All gate tests are E2E via real HTTP — **correct per AD-1/AD-3**, but no guidance on when unit tests supplement domain logic | Domain invariants (immutability, uniqueness mapping) may be undertested below the gate |

---

## 2. Contradictions Between Sources

| ID | Source A | Source B | Impact on existing suite |
| --- | --- | --- | --- |
| C-01 | `project-requirements.md` §4.9: "PP and **UM** can edit, delete and manually add" | §3.2 S9: **Manager line RW** | `um-ct-03/04/05/06` test PP+UM only; DM/PM coverage missing; OQ5 in access-control SPEC unresolved |
| C-02 | `epics.md` Story 1.1: four registration ACs | `registration/` folder: nine scenario files | Traceability matrix out of sync; reviewers cannot map AC → file without manual reconciliation |
| C-03 | SPEC Constraints: "FR-5..FR-16 exist solely in epics.md" | Several files trace "PRD FR-n" for derived FRs | Misleading trace lines; weak audit trail to normative requirements |
| C-04 | `um-reg-03`: Ida (custom FR holder) for 403 probe | `um-deact-03`: Bob (Manager, no HR Admin) for 403 probe | Inconsistent negative-actor strategy; Bob could pass a coarse "any non-Root" gate that Ida would catch |
| C-05 | PRD Scope: timetracker provides **no hierarchy data** for reports-to | `project-requirements.md` §5.1: project assignment from timetracker drives **Manager access** | Not a suite bug, but README/SPEC do not warn authors against conflating reports-to (`direct` edge) with project-manager access (policy attachments) |
| C-06 | SPEC Non-goals: six `UserEvents` types not triggerable | `um-ct-03`: manual backfill uses `mentorship_end` | Uses an event type whose **system-trigger path** is Epic 4 — conflates manual backfill with relationship lifecycle |
| C-07 | Story 1.1 AC: magic-link dispatch side effect | SPEC Constraint: registration asserts **only through `POST /users`** | `um-reg-05` cannot observe email dispatch in stage 1; stage 2 must use adapter fake — observability gap not specified in scenario prose |

---

## 3. Incorrect Test Levels

| Scenario / Topic | Current implicit level | Correct level | Issue |
| --- | --- | --- | --- |
| Domain uniqueness mapping (`409` vs `500`) | E2E only (`um-reg-04/08`) | E2E **+** unit/integration for error mapper | E2E alone cannot pinpoint unmapped Prisma violation handler |
| `UserEvents` immutability (no in-place PATCH) | E2E multi-step (`um-ct-05`) | E2E gate **+** domain unit test | Gate test is slow feedback for a pure domain rule |
| `GET /users` NFR-2 (500 rows / 2 s) | Not covered | **k6/load** (nightly), smoke subset in PR | Cannot prove SLA in functional E2E |
| Access matrix §3.2 | Correctly excluded from user-management suite | **access-control E2E** (separate suite) | Platform DoD (§9) requires matrix tests — must not be inferred from user-management pass |
| Permission granularity (`um-reg-03`) | user-management E2E | **Primary owner: access-control**; user-management keeps one endpoint-honoring probe | Duplicated risk if both suites assert the same FR-permission matrix |
| Concurrent registration (`um-reg-08`) | E2E | E2E with **parallel HTTP** + isolated DB | Wrong level if run sequentially — race never exercised |
| Mentorship/reports-to (Epic 4) | Missing | E2E gate per AD-1 | Entire epic lacks stage-1 artifacts |

---

## 4. Duplicated Coverage

| Pair | Verdict | Recommendation |
| --- | --- | --- |
| `um-reg-04` vs `um-reg-08` | **Not duplicate** — sequential vs concurrent uniqueness | Keep both; tag concurrent as `@concurrency` |
| `um-reg-04` vs `um-pf-03` | **Not duplicate** — create vs PATCH path | Keep both |
| `um-reg-03` vs `access-control/users/roles/permissions-are-independent.md` | **Partial duplicate** — rule vs endpoint enforcement | user-management keeps one probe; access-control owns the rule |
| `um-reg-05` vs `um-auth-03` | **Acceptable overlap** — create must not session; consume establishes session | Link as parent/child in trace matrix |
| `um-ct-03` vs `um-ct-04` | **Not duplicate** — PP vs UM actor | Keep both until C-01 is resolved |
| `um-deact-02` vs Story 1.5 list filter | **Dependency, not duplicate** — deact-02 requires `GET /users?isActive=true` (Story 1.5) | Cannot run deact-02 E2E until Story 1.5 lands — ordering risk |

---

## 5. Coverage Gaps

### 5.1 Positive paths missing entirely

| Gap | Requirement | Priority |
| --- | --- | --- |
| G-01 | Epic 4 Story 4.1 — reports-to assign/revoke/reassign-denied | P0 |
| G-02 | Epic 4 Story 4.2 — mentorship pair/unpair + `mentorship_start/end` events | P0 |
| G-03 | Story 1.5 — `GET /users` pagination, multi-filter, metadata | P1 |
| G-04 | Registration → `joined_company` event atomicity (same transaction) | P0 |
| G-05 | Mentorship attach → `mentorship_start` atomicity | P0 |
| G-06 | Self `PUT /users/:id/photo` negative — cannot upload for another user | P1 (access-control may own) |

### 5.2 Negative / edge paths missing

| Gap | Requirement | Priority |
| --- | --- | --- |
| G-07 | Magic link for **deactivated** user (`isActive: false`) | P0 |
| G-08 | Magic link for **unknown** email — dispatch must not occur (partially in um-auth-02) | P1 |
| G-09 | `POST /users` with client-supplied `id`/`createdAt`/`createdBy` → `400` (OQ1 resolved) | P1 |
| G-10 | `workEmail` trim/lowercase normalization and normalized uniqueness (OQ2 resolved) | P1 |
| G-11 | Email transport failure preserves User + durable dispatch intent and becomes retryable (OQ3 resolved) | P1 |
| G-12 | Rehire reactivates the existing User; no duplicate normalized `workEmail` identity (OQ4 resolved) | P2 |
| G-13 | Concurrent duplicate reports-to assign | P2 |
| G-14 | `PATCH /users/:id/events/:id` attempted — must not exist (immutability) | P2 |

### 5.3 Concurrency

| Gap | Notes |
| --- | --- |
| G-15 | Only `um-reg-08` addresses concurrency; no parallel mentorship/reports-to, no concurrent PATCH same field |
| G-16 | Implement the approved CI progression: one worker + UUID namespace now; schema-per-worker before parallel worker execution |

### 5.4 NFR

| NFR | Existing coverage | Gap |
| --- | --- | --- |
| NFR-1 (pseudonymised data) | Persona names only | No automated scan for PII in fixtures/logs |
| NFR-2 (500+/2s list) | None | No load test plan |
| NFR-3 (graceful degradation) | None | Email/timetracker failure behavior untested |
| NFR-4 (access-control composition) | Explicitly out of scope | user-management must still prove it **calls** AccessControl — integration contract test missing |

---

## 6. Controllability, Observability, Reliability, Isolation

| Dimension | Finding | Severity |
| --- | --- | --- |
| **Controllability** | Stories rely on Prisma direct seed in module setup (AD-3); apply the approved one-worker + UUID-owned-slice model until schema-per-worker parallelism exists | Medium |
| **Controllability** | Email port must be fake-bound for magic-link tests — mentioned in epics Story 1.1 note but not in scenario files | Medium |
| **Observability** | `um-reg-05` asserts no session in response but stage-1 does not require `Set-Cookie` header check (SPEC Constraint adds this — good) | Low |
| **Observability** | Career-timeline corrections require multi-step read — good pattern | OK |
| **Reliability** | Nina created in `um-reg-01` — if fixtures persist across files, downstream tests see polluted state | High |
| **Reliability** | `um-reg-08` outcome depends on true concurrent dispatch — sequential CI gives false confidence | High |
| **Isolation** | OQ5 resolved: one worker + UUID-owned cleanup initially; schema-per-worker is a gate only for enabling parallel workers | Scoped CI gate |

---

## 7. Scenarios That Cannot Reliably Prove Expected Outcomes

| Scenario | Problem | Remediation |
| --- | --- | --- |
| `um-auth-02` | "Same body shape as um-auth-01" — schema not frozen | Define exact JSON schema in scenario; assert deep equality |
| `um-reg-08` | Race requires concurrent clients | Use `Promise.all` on two requests; fail if run serially |
| `um-deact-02` | Depends on Story 1.5 `GET /users` | Mark blocked until list endpoint exists; do not stub via Prisma |
| `um-ct-03` | `mentorship_end` as "Excel backfill" — weak domain signal | Prefer `position_change` or `grade_change` backfill once fields exist; or document why mentorship_end is valid |
| `um-reg-05` | Magic-link dispatch side effect | Stage 2 must assert email fake received dispatch — response-only check insufficient |
| Any NFR-2 assertion in E2E | 500 rows / 2s | Move to k6 with seeded dataset; E2E uses smaller fixture |

---

## 8. testing-strategy.md — Review Notes

**Aligned with AD-1/AD-3:** three-stage gate, real HTTP + real DB, and faked outbound ports. Parallel-worker execution remains disabled until schema-per-worker isolation is implemented.

**Gaps as a test-design source:**
- Did not define isolation mechanism; this reconciliation now selects one worker + UUID-owned slices initially and schema-per-worker before parallel workers.
- Does not specify supplement below gate (unit tests for domain services).
- Does not map NFR validation to tools (k6, etc.).
- Correctly states access-matrix negatives are first-class — but user-management suite uses that to **exclude** them; platform traceability must show access-control ownership explicitly.

---

## 9. SPEC.md — Review Notes

**Strengths:** Clear capability grouping; honest assumptions section; endpoint-boundary rule per story.

**Weaknesses:**
- Declares six event types non-triggerable while Epic 4 will trigger `mentorship_start/end`.
- Open Questions 1–4 were reopened without scenario decisions; this reconciliation now records the approved answers.
- "28 scenario files" count in README vs 28 on disk — README table sums to 28 but omits Epic 4/Story 1.5 folders that do not exist.

---

## 10. Recommendations Before Modifying Existing Artifacts

1. **Propagate the approved planning decisions** for C-01/B-01, A-02/B-02, A-03/B-05, A-01/R-003, A-06/R-004, and OQ1–OQ5 into the normative decision log/requirements before implementation approval.
2. Treat B-03 as a **parallel-CI enablement gate**, not a feature blocker; keep E2E at one worker until schema-per-worker exists. B-04 is resolved by durable retryable dispatch intent and does not block core registration.
3. **Correct traceability drift**: map all nine registration scenarios into Story 1.1, preserve the already-cleaned trace vocabulary (C-03), and standardize permission-negative actors (C-04).
4. **Reconcile stale backend E2E intent** with current stage-1 prose, especially email dispatch observability (C-07) and the expanded registration suite.
5. **Add Epic 4 and Story 1.5** scenario folders from the rebuilt coverage plan (see `test-design-qa.md`).
6. **Implement the approved fixture-isolation progression** in test infrastructure: UUID-owned data with one worker now, schema-per-worker before parallel CI.
7. **Do not merge** existing `um-*` IDs into the new design — map old → new in trace matrix after approval.

---

**Next step:** Per-file developer approval, then stage-2 E2E via `/bmad-testarch-atdd` for P0 scenarios.
