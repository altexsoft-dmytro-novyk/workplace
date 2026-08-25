---
title: 'TEA Test Design → BMAD Handoff Document'
version: '1.0'
workflowType: 'testarch-test-design-handoff'
sourceWorkflow: 'testarch-test-design'
generatedBy: 'TEA Master Test Architect'
generatedAt: '2026-08-25'
projectName: 'people management'
status: 'approved'
---

# TEA → BMAD Integration Handoff

## Purpose

Bridges TEA's rebuilt system-level test design with BMAD epic/story decomposition and downstream ATDD/automation workflows. **Do not consume for implementation until human approval** of the parent test design artifacts.

## TEA Artifacts Inventory

| Artifact | Path | BMAD Integration Point |
| --- | --- | --- |
| Architecture test design | `_bmad-output/test-artifacts/test-design-architecture.md` | Risks and scoped engineering gates for foundation/architecture stories |
| QA test design | `_bmad-output/test-artifacts/test-design-qa.md` | Story acceptance criteria, test requirements |
| Critical review | `_bmad-output/test-artifacts/critical-review-existing-artifacts.md` | Gap analysis vs existing 28 scenarios |
| Progress checkpoint | `_bmad-output/test-artifacts/test-design-progress-system.md` | Workflow state |

## Epic-Level Integration Guidance

### Risk References — Quality Gates per Epic

| Epic | P0 Gate (must pass before epic done) | Scoped gates / approved decisions |
| --- | --- | --- |
| **Epic 1: Employee Record Lifecycle** | TD-UM-REG-01, TD-UM-DEACT-01, plus cross-epic TD-UM-AC-01 | One-worker + UUID isolation is sufficient initially; schema-per-worker gates only parallel CI. Email failure preserves User/event and retries durable dispatch. Deactivation capability, `{}` default, `400` server-owned fields, normalization, and rehire identity are approved. |
| **Epic 2: Magic-Link Auth** | TD-UM-AUTH-01, TD-UM-AUTH-03, TD-UM-AUTH-06 | Enumeration-safe response, zero unknown dispatch, configurable expiry, and single-use are approved; tests inject TTL. |
| **Epic 3: Career Timeline** | TD-UM-CT-01 | Approved rule: assigned PP + direct UM write; full Manager line read. |
| **Epic 4: Organizational Relationships** | TD-UM-REL-01 | Approved rule: DELETE→POST reassignment; second POST `409`. |

### Recommended Quality Gates

1. Every story has ≥1 traced scenario doc before stage-2 E2E (AD-1).
2. No story merges without green gate E2E for its P0 scenarios.
3. Epic 3 cannot complete until atomic event writes verified (R-002).
4. Platform release requires access-control suite pass (NFR-4) in addition to user-management.

## Story-Level Integration Guidance

### Gate Scenarios and Approved Edge Decisions → Story Acceptance Criteria

| Story | Must appear in AC / scenario docs |
| --- | --- |
| 1.1 HR Admin registers | TD-UM-REG-01..03, 05, 10..12; no session; durable retryable email dispatch; server-owned fields `400`; normalized email identity; no duplicate User on rehire |
| 1.2 View/edit identity | TD-UM-PF-01; uniqueness TD-UM-PF-03/04 |
| 1.3 Self photo | TD-UM-PF-02 |
| 1.4 Deactivate | TD-UM-DEACT-01, 03 |
| 1.5 List employees | TD-UM-LIST-01..03, DEACT-02 |
| 2.1 Request magic link | TD-UM-AUTH-01, 02; unknown email gets the same response and zero dispatch |
| 2.2 Consume token | TD-UM-AUTH-03..05; TD-UM-AUTH-06 deactivated |
| 3.1 Auto events | TD-UM-CT-01, 02 |
| 3.2 Manual add | TD-UM-CT-03, 04; assigned PP + direct UM only under approved C-01 rule |
| 3.3 Correct/delete | TD-UM-CT-05, 06, 07 |
| 4.1 Reports-to | TD-UM-REL-01..03, 07 |
| 4.2 Mentorship | TD-UM-REL-04..06, 07 |

### Data-TestId Requirements

Deferred — API-first gate (AD-3). When UI stories land (`bmad-ux`), add:

- `data-testid="employee-list-row-{id}"` on list rows
- `data-testid="career-timeline-event-{id}"` on timeline entries
- `data-testid="registration-submit"` on HR Admin create form

## Risk-to-Story Mapping

| Risk ID | Category | P×I | Story/Epic | Test Level |
| --- | --- | --- | --- | --- |
| R-001 | SEC | 9 | All epics | E2E API |
| R-002 | DATA | 6 | Epic 3, 4 | E2E API |
| R-003 | SEC | 6 | Epic 2 | E2E API |
| R-004 | DATA | 6 | Epic 4 Story 4.1 | E2E API |
| R-005 | PERF | 6 | Epic 1 Story 1.5 | k6 |
| R-006 | TECH | 4 | Epic 1 Story 1.1 | E2E API |
| R-007 | DATA | 4 | Epic 1 Stories 1.1 and 1.2 | E2E API + DB constraint |
| R-008 | OPS | 4 | Foundation | CI infra |
| R-009 | BUS | 4 | Epic 2 Story 2.2 | E2E API |
| R-010 | TECH | 3 | Epic 4 Stories 4.1 and 4.2 | Migration review + E2E API |
| R-011 | BUS | 2 | Epic 1 identity lifecycle; registration guard now, dedicated rehire interface later | E2E API |
| R-012 | OPS | 2 | All epics / CI fixtures | CI scan |
| R-013 | TECH | 1 | Epic 2 Story 2.1 fixture setup | E2E infrastructure |
| R-014 | BUS | 1 | Epic 3 Story 3.2 + Epic 4 Story 4.2 | E2E API + scenario audit |

## Recommended BMAD → TEA Workflow Sequence

1. **Human approval** of test design + critical review — **complete (2026-08-25)**
2. **Propagate approved decisions** — **complete** — see `docs/architecture/user-management-test-decisions.md`
3. **Update/create stage-1 scenario docs** — **complete** — 45 files under `docs/test-cases/user-management/`
4. **TEA ATDD** (`/bmad-testarch-atdd`) — failing P0 E2E ← **current step**
5. **BMAD Implementation** — production code until green
6. **TEA Automate** — P1/P2 expansion
7. **TEA Trace** — FR-1..FR-16 coverage matrix

## Phase Transition Quality Gates

| From Phase | To Phase | Gate Criteria |
| --- | --- | --- |
| Test Design | Human Approval | Architecture + QA docs reviewed; critical review acknowledged |
| Approval | Scenario Updates | Approved decision set recorded; one-worker isolation enforced; normative propagation changes identified |
| Scenario Updates | ATDD | Stage-1 docs approved per file (AD-1) |
| ATDD | Implementation | Red E2E committed for all P0 stories |
| Implementation | Release | P0 100%, P1 ≥95%, access-control suite pass, k6 baseline or waiver |

## Follow-up Actions for Product / Architecture

1. Propagate the approved audience, deactivation-capability, `customFields`, auth, reports-to, payload-validation, normalization, rehire, dispatch, and isolation rules into normative artifacts.
2. Declare magic-link TTL configuration-owned and expose a controllable clock/config seam to tests; production duration and rate limits remain operational configuration.
3. Implement registration as User + `joined_company` + durable dispatch intent, with observable retryable downstream delivery failure.
4. Enforce one test worker + collision-proof UUID-owned data now; implement schema-per-worker before enabling parallel workers.
5. Define the dedicated rehire/reactivation interface later without creating a new User identity; registration must never create a duplicate normalized email.
6. Approve the complete test design and the new Epic 4 + Story 1.5 scenario scope (~12 new files).

---

**Status:** Approved 2026-08-25. Stage-1 scenarios updated; ATDD is the next workflow.
