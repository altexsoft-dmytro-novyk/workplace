# Test Design for QA: User Management

**Purpose:** Test execution recipe for QA team. Defines what to test, how to test it, and what QA needs from other teams.

**Date:** 2026-08-25  
**Author:** User (TEA workflow)  
**Status:** Approved — 2026-08-25 (human approval; normative propagation complete)  
**Project:** people management — `user-management` bounded context

**Related:** `test-design-architecture.md` (risks, scoped engineering gates) · `critical-review-existing-artifacts.md` (review of existing 28 scenarios)

---

## Executive Summary

**Scope:** Rebuilt system-level test design for User registration, profile CRUD, deactivation, employee list, magic-link auth, career timeline, and organizational relationships (Epics 1–4). Does **not** include §3.2 access-matrix tests (owned by `access-control`).

**Risk Summary:** 14 risks (5 high ≥6) — see Architecture doc. The user approved the full planning decision set on 2026-08-25. No global decision blocker remains: B-03 is only a gate for enabling parallel test workers, and B-04 is resolved by durable retryable dispatch intent. The approved rules still need propagation into normative artifacts before implementation approval.

**Coverage Summary:**

| Priority | Proposed scenarios | Notes |
| --- | --- | --- |
| P0 | ~8 | No-workaround lifecycle, security, and data-integrity gates |
| P1 | ~31 | Important workflows, validation, uniqueness, list/filters, concurrency |
| P2 | ~13 | Edge cases and lower-risk lifecycle rules |
| P3 | ~5 | Exploratory, docs validation |
| **Total** | **~57** | Replaces/extends existing 28 files |

**Effort:** ~3–5 weeks (1 QA engineer, includes stage-2 E2E + CI)

> **Note:** P0/P1/P2/P3 = priority and risk focus, **not** execution timing.

---

## Not in Scope

| Item | Reasoning | Mitigation |
| --- | --- | --- |
| §3.2 access matrix per audience/section | Owned by `access-control` bounded context | Platform DoD requires that suite to pass independently |
| S2–S5 profile sections | No schema in user-management PRD | Future profile context |
| Timetracker/PeopleForce sync writes | AD-13 deferred | Manual `ttId` field only |
| Full §4.1 All Employees (saved views, export, custom-field filters) | FR-16 limited to S1 list filters | Separate epic when custom-fields land |
| Seed-script bootstrap (FR-1) | Not HTTP-driven | access-control `fc-03` |
| Notifications, analytics | GOOD TO HAVE (§4.13–4.14) | Out of iteration |

---

## Dependencies & Scoped Test Gates

### Backend/Architecture (Pre-Implementation)

QA plans against these user-approved rules:

1. Timeline: full Manager line + PP read; assigned PP + direct UM write (B-01/C-01).
2. Deactivation: no-target feature capability held by HR Admin; use Ida for the generic denial probe (B-02/A-02).
3. `customFields`: database default `{}` (B-05/A-03).
4. Auth: enumeration-safe unknown-email response, zero unknown-email dispatch, expiry, and single-use (R-003/A-01); TTL is configuration-owned and tests inject a deterministic value.
5. Reports-to reassignment: explicit DELETE→POST; a second POST returns `409` (R-004/A-06).
6. Server-owned create fields (`id`, `createdAt`, `createdBy`) are rejected with `400`.
7. `workEmail` is trimmed and lowercased before validation, storage, lookup, and uniqueness comparison.
8. Registration commits User + `joined_company` + durable dispatch intent; later email transport failure is observable/retryable and does not roll back the User.
9. Rehire preserves the existing User identity/history; no second User may be created for the normalized email.
10. E2E uses one worker + UUID-owned data initially; parallel workers require schema-per-worker.

Scoped gates:

1. Keep the test runner at one worker until schema-per-worker is implemented; this does not block sequential gate E2E or parallel HTTP inside a concurrency scenario.
2. TD-UM-NFR-REL-01 requires a throwing email fake and observable durable delivery state; the expected behavior itself is decided.
3. Copy the approved planning decisions into normative requirements/decision logs before implementation approval.

### QA Infrastructure

1. **Test DB** — PostgreSQL, migrated; one worker + UUID-owned data initially, one schema per worker before parallel-worker CI
2. **Persona fixtures** — Reuse access-control cast (Root, Alice, Bob, Paula, Colin, Ida) + ephemeral Nina/Tomas
3. **Email fake** — Assert dispatch/no-dispatch via outbound port
4. **Concurrent helper** — `Promise.all` wrapper for race tests
5. **k6 seed** — 500+ User rows for NFR-2 (Story 1.5)

**Factory pattern (Playwright utils):**

```typescript
import { test } from '@seontechnologies/playwright-utils/api-request/fixtures';
import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('@P0 @API registration creates user without session @TD-UM-REG-01', async ({ apiRequest }) => {
  const body = {
    firstName: 'Nina',
    lastName: faker.person.lastName(),
    position: 'QA Engineer',
    country: 'Poland',
    city: 'Krakow',
    workEmail: faker.internet.email({ provider: 'company.example' }),
    companyJoinDate: '2026-09-01',
  };

  const { status, headers, body: res } = await apiRequest({
    method: 'POST',
    path: '/users',
    body,
    headers: { authorization: 'Bearer <token:Root>' },
  });

  expect(status).toBe(201);
  expect(res.isActive).toBe(true);
  expect(headers['set-cookie']).toBeUndefined();
  expect(res).not.toHaveProperty('accessToken');
});
```

---

## Risk Assessment (QA View)

| Risk ID | Score | QA Test Coverage |
| --- | --- | --- |
| R-001 | 9 | TD-UM-AC-01 — unauthenticated/missing-permission on each mutating route |
| R-002 | 6 | TD-UM-CT-01/02, TD-UM-REL-01/02 — event in same response chain |
| R-003 | 6 | TD-UM-AUTH-02/04/05 — approved enumeration-safe, configurable-expiry, single-use behavior |
| R-004 | 6 | TD-UM-REL-03 — approved second reports-to POST without DELETE → `409` |
| R-005 | 6 | TD-UM-NFR-PERF-01 — k6 `GET /users` |

| Risk | QA coverage to record |
| --- | --- |
| R-006 | TD-UM-REG-04/08 plus TD-UM-DOM-01 verify Prisma uniqueness maps to `409`, not `500`. |
| R-007 | TD-UM-REG-11 verifies trim/lowercase on write and lookup and normalized duplicates return `409`. |
| R-008 | TD-UM-REG-08/REL-08 use parallel HTTP inside one test; the runner stays at one worker until schema-per-worker exists. |
| R-009 | TD-UM-AUTH-06 verifies a deactivated User receives no usable magic-link session. |
| R-010 | Migration/schema review plus relationship E2E verifies AD-11 CHECK/UNIQUE constraints exist and map violations stably. |
| R-011 | TD-UM-REG-12 verifies no second User is created for a deactivated normalized email and the same identity is retained. |
| R-012 | TD-UM-NFR-PII-01 scans fixtures/logs for real PII. |
| R-013 | Epic 2 fixture contract seeds a User directly through Prisma without depending on Epic 1 HTTP readiness. |
| R-014 | TD-UM-CT-03 explicitly proves manual backfill only; TD-UM-REL-04/05 separately prove automatic mentorship lifecycle events. |

---

## NFR Test Coverage Plan

| NFR | Requirement | Validation | Tool / Level | Evidence | Priority |
| --- | --- | --- | --- | --- | --- |
| NFR-1 | Pseudonymised test data | Fixture audit | CI grep + review | Lint report | P2 |
| NFR-2 | List ≤2 s @ 500+ rows | Load test | k6 | k6 summary JSON | P1 |
| NFR-3 | Graceful email failure | Transport throw after durable create/dispatch intent | E2E + fake | User/event survive; delivery pending/failed and retryable | P1 |
| NFR-4 | AccessControl composition | 403 without entitlement | E2E API | Test report | P0 |

**Configuration-owned thresholds:** Production magic-link TTL and rate limits. Tests inject deterministic values; neither blocks functional scenario approval.

---

## Entry Criteria

- [x] B-03/B-04 behavior decisions recorded
- [x] B-01/B-02/B-05, R-003/R-004, and OQ1–OQ5 approved as the planning baseline
- [x] Approved decisions propagated into normative requirements/decision logs
- [ ] Test PostgreSQL provisioned for one-worker + UUID-owned-slice isolation
- [ ] access-control personas seeded and tokens available
- [ ] Email DI fake bound in test module
- [x] Human approval of this test design + critical review

**Conditional parallel-worker entry gate:** schema-per-worker must be provisioned before the runner worker count is raised above one.

## Exit Criteria

- [ ] P0 100% gate E2E passing
- [ ] P1 ≥95% pass or triaged waivers
- [ ] No open high-severity bugs on FR-1..FR-16 scope
- [ ] Trace matrix: each FR maps to ≥1 approved scenario + green E2E
- [ ] k6 NFR-2 baseline captured (or waiver documented)
- [ ] R-001..R-005 mitigations have implementation evidence or an owner/date/reason waiver
- [ ] ≥80% of in-scope FR-1..FR-16 requirements have approved scenario + green automated evidence; every uncovered FR has a documented waiver

---

## Test Coverage Plan

### P0 (Critical)

**Criteria:** Blocks core functionality, high risk (≥6), no safe workaround.

**P0 distribution note:** 8/~57 (~14%) remains above the checklist's <10% heuristic because this is one system-level plan spanning four epics. Each retained P0 is a distinct no-workaround lifecycle, security, or data-integrity gate; priorities are not reduced solely to meet a percentage.

**Coverage ownership:** QA owns E2E/API scenario implementation and evidence by default; Platform co-owns k6 and parallel-worker infrastructure; Backend owns TD-UM-DOM-* unit checks and database-migration verification. Product/Architecture own normative propagation and waivers, not test execution.

| Test ID | Requirement | Level | Risk | Notes |
| --- | --- | --- | --- | --- |
| **TD-UM-REG-01** | FR-5/FR-4: HR Admin creates user, `201`, `isActive:true` | E2E API | — | Maps existing um-reg-01; assert no session headers |
| **TD-UM-AUTH-01** | FR-7: Request magic link known email | E2E API | — | um-auth-01 |
| **TD-UM-AUTH-03** | FR-7: Consume token → session works | E2E API | — | um-auth-03 |
| **TD-UM-DEACT-01** | FR-9: HR Admin soft delete, row survives | E2E API | — | um-deact-01 |
| **TD-UM-CT-01** | FR-10: `joined_company` on create | E2E API | R-002 | Same txn as REG-01 |
| **TD-UM-REL-01** | FR-15: Assign reports-to | E2E API | R-004 | **New — Epic 4** |
| **TD-UM-AC-01** | NFR-4: Mutations call AccessControl | E2E API | R-001 | Sample each controller |
| **TD-UM-AUTH-06** | R-009: Deactivated user login denied | E2E API | R-009 | **New gap G-07** |

**Total P0:** ~8

---

### P1 (High)

**Criteria:** Important features, medium risk, common workflows.

| Test ID | Requirement | Level | Risk | Notes |
| --- | --- | --- | --- | --- |
| TD-UM-REG-04 | FR-6: Duplicate workEmail → `409` | E2E API | R-006 | um-reg-04 |
| TD-UM-REG-02 | FR-5: Unauthenticated create → `401` | E2E API | R-001 | um-reg-02 |
| TD-UM-REG-03 | FR-5: No create permission → `403` | E2E API | R-001 | Use Ida; um-reg-03 |
| TD-UM-REG-06 | Payload: missing required field → `400` | E2E API | — | um-reg-06 |
| TD-UM-REG-07 | FR-6: Duplicate ttId → `409` | E2E API | — | um-reg-07 |
| TD-UM-REG-08 | Concurrent duplicate workEmail | E2E API | R-006,R-008 | `@concurrency`; um-reg-08 |
| TD-UM-REG-09 | Malformed workEmail → `400` | E2E API | — | um-reg-09 |
| TD-UM-REG-05 | FR-3: No auto-login; email dispatched | E2E API | — | Assert email fake |
| TD-UM-AUTH-02 | Enumeration-safe unknown email; no dispatch | E2E API | R-003 | Approved; assert identical body + zero email-fake calls |
| TD-UM-AUTH-04 | Expired token → `401` | E2E API | R-003 | Approved; inject a deterministic TTL and backdate/use a controllable clock with a real issued token |
| TD-UM-AUTH-05 | Replay token → `401` | E2E API | R-003 | Approved; consume a real token twice |
| TD-UM-PF-01 | FR-8: Manager-line PATCH persists | E2E API | — | um-pf-01 |
| TD-UM-PF-03/04 | FR-6: PATCH uniqueness conflicts | E2E API | — | um-pf-03/04 |
| TD-UM-DEACT-02 | FR-9/FR-16: Excluded from active list | E2E API | — | Requires Story 1.5 |
| TD-UM-DEACT-03 | Deactivate without capability → `403` | E2E API | R-001 | Use Ida for generic feature-permission denial; Bob only for a distinct manager-specific probe |
| TD-UM-LIST-01 | FR-16: Pagination metadata | E2E API | — | **New Story 1.5** |
| TD-UM-LIST-02 | FR-16: Single filter (country) | E2E API | — | **New** |
| TD-UM-LIST-03 | FR-16: Compound filters | E2E API | — | **New** |
| TD-UM-CT-03/04 | FR-11: assigned PP and direct UM manual add | E2E API | — | Approved C-01 rule; DM/PM/transitive managers remain read-only |
| TD-UM-CT-02 | FR-10: `position_change` on PATCH | E2E API | R-002 | um-ct-02 |
| TD-UM-CT-05 | FR-12: Correct = delete + append | E2E API | — | um-ct-05 |
| TD-UM-CT-06 | FR-12: UM delete manual entry | E2E API | — | um-ct-06 |
| TD-UM-CT-07 | FR-13: Deleted event absent from read | E2E API | — | um-ct-07 |
| TD-UM-REL-03 | FR-15: Second reports-to → `409` | E2E API | R-004 | **New; approved reject-then-retry rule** |
| TD-UM-REL-02 | FR-15: Revoke reports-to hard delete | E2E API | — | **New** |
| TD-UM-REL-04 | FR-14: Mentorship pair + `mentorship_start` | E2E API | R-002 | **New** |
| TD-UM-REL-05 | FR-14: Unpair + `mentorship_end` | E2E API | R-002 | **New** |
| TD-UM-REL-06 | FR-14: Multiple mentors allowed | E2E API | — | **New per AD-11** |
| TD-UM-REL-07 | FR-14/15: Non-HR Admin → `403` | E2E API | — | **New** |
| TD-UM-NFR-PERF-01 | NFR-2: List latency SLA | k6 | R-005 | Nightly |
| TD-UM-NFR-REL-01 | NFR-3: Email transport failure after registration | E2E API | B-04 resolved | Assert `201`; same User + `joined_company` survive; durable delivery state is pending/failed and retryable |

**Total P1:** ~31

---

### P2 (Medium)

| Test ID | Requirement | Level | Notes |
| --- | --- | --- | --- |
| TD-UM-REG-10 | Server-owned create fields | E2E API | Supplying `id`, `createdAt`, or `createdBy` → `400`; no row created |
| TD-UM-REG-11 | Email normalization | E2E API | Trim + lowercase on write/lookup; normalized duplicates → `409` |
| TD-UM-REG-12 | Rehire identity preservation | E2E API | Registration path creates no second row for deactivated normalized email; explicit rehire reuses the same User id/history when that workflow lands |
| TD-UM-CT-08 | No PATCH on events (immutability) | E2E API | G-14; um-ct-08 |
| TD-UM-REL-08 | Concurrent reports-to assign | E2E API | `@concurrency` |
| TD-UM-PF-05 | Self cannot PATCH others | E2E API | May live in access-control |
| TD-UM-PF-02 | FR-8: Self photo upload | E2E API | Acceptable workaround; does not block identity/authentication |
| TD-UM-LIST-04 | Filter isActive=false includes Colin | E2E API | |
| TD-UM-DOM-01 | Uniqueness mapper unit | Unit | Below gate, fast feedback |
| TD-UM-DOM-02 | Event immutability unit | Unit | Below gate |

**Total P2:** ~13

---

### P3 (Low)

| Test ID | Requirement | Level | Notes |
| --- | --- | --- | --- |
| TD-UM-DOC-01 | Scenario trace lines cite normative § not derived FR-n | Manual | Process compliance |
| TD-UM-EXP-01 | Decision-drift audit: DM/PM manual timeline write remains denied | E2E API | Approved C-01 rule; access-control may own |
| TD-UM-EXP-02 | Large photo upload limits | E2E API | If limits specified |
| TD-UM-NFR-PII-01 | No real PII in repo fixtures | CI grep | NFR-1 |
| TD-UM-EXP-03 | List sort order stability | E2E API | If sort specified |

**Total P3:** ~5

---

## Mapping: Existing → Proposed (For Approval)

| Existing file | Proposed ID | Action |
| --- | --- | --- |
| um-reg-01..09 | TD-UM-REG-01..09 | Retain with header/session fixes per review |
| um-auth-01..05 | TD-UM-AUTH-01..05 | Retain all on approved intent; reconcile 02/04/05 to real email/token seams before approval |
| um-pf-01..04 | TD-UM-PF-01..04 | Retain |
| um-deact-01..03 | TD-UM-DEACT-01..03 | Retain; deact-02 blocked on LIST |
| um-ct-01..07 | TD-UM-CT-01..07 | Retain; state that ct-03 is manual backfill and does not exercise the automatic mentorship trigger |
| *(none)* | TD-UM-LIST-01..04 | **Create new** |
| *(none)* | TD-UM-REL-01..08 | **Create new** |
| *(none)* | TD-UM-AUTH-06, TD-UM-NFR-* | **Create new** |

---

## Execution Strategy

**Philosophy:** Run all gate E2E in PRs unless >15 min; defer expensive suites.

### Every PR: Playwright E2E (~10–15 min)

- All `@P0`–`@P2` E2E API tests with one test worker initially
- Exclude `@blocked`, `@concurrency` (optional separate job), k6

### Nightly: k6 + Concurrency (~30–60 min)

- TD-UM-NFR-PERF-01
- `@concurrency` tagged tests (REG-08, REL-08) use parallel HTTP within one isolated test; separate test workers remain disabled until schema-per-worker exists

### Weekly: Manual / Process

- Trace audit (TD-UM-DOC-01)
- NFR-1 PII scan

**Manual:** Verify the approved B-01/B-02/B-05, R-003/R-004, and OQ1–OQ5 decisions were propagated into normative artifacts without drift.

---

## QA Effort Estimate

| Priority | Count | Effort | Notes |
| --- | --- | --- | --- |
| P0 | ~8 | ~1–2 weeks | Distinct no-workaround lifecycle, security, and data-integrity gates |
| P1 | ~31 | ~1.5–2.5 weeks | Scenario-specific infrastructure dependencies noted above |
| P2 | ~13 | ~3–5 days | Decisions resolved; lower priority only |
| P3 | ~5 | ~1–2 days | |
| **Total** | **~57** | **~3–5 weeks** | 1 QA engineer |

**Assumptions:** One-worker + UUID isolation is enforced; parallel workers stay disabled until schema-per-worker; access-control personas remain stable; no major requirement churn post-approval.

---

## Interworking & Regression

| Component | Impact | Regression Scope |
| --- | --- | --- |
| **access-control** | All endpoints compose with facade | Full access-control E2E must pass on every PR |
| **Epic 1 → Epic 3** | PATCH fires events | Re-run CT-02 when profile changes |
| **Epic 3 → Epic 4** | Relationship fires events | Re-run REL-04/05 when event writer changes |
| **Epic 2** | Session tokens for all suites | Auth smoke on every PR |

---

## Appendix A: Tags

```bash
npx playwright test --grep @P0
npx playwright test --grep @concurrency
npx playwright test --grep "@TD-UM-REG|@TD-UM-AUTH"
```

Tags: `@P0` `@P1` `@P2` `@P3` `@API` `@concurrency` `@blocked` `@TD-UM-{AREA}-{NN}`

---

## Appendix B: Knowledge Base References

- `test-levels-framework.md` — E2E for gate; unit below gate for domain
- `test-priorities-matrix.md` — P0–P3 criteria
- `risk-governance.md` — R-001..R-014 scoring
- `playwright-utils-mandate.md` — fixture patterns
- [`probability-impact.md`](../../.claude/skills/bmad-testarch-test-design/resources/knowledge/probability-impact.md) — applied for 1–3 probability/impact scoring and 6–8 MITIGATE / 9 BLOCK action thresholds
- [`nfr-criteria.md`](../../.claude/skills/bmad-testarch-test-design/resources/knowledge/nfr-criteria.md) — applied to Security, Performance, Reliability, Maintainability, and Data-privacy evidence planning; final verdict remains deferred to `nfr-assess`

---

**Generated by:** BMad TEA Agent  
**Workflow:** `bmad-testarch-test-design`  
**Version:** 4.0 (BMad v6)

**Approval required before:** modifying `docs/test-cases/user-management/**`, writing stage-2 E2E, or changing production code.
