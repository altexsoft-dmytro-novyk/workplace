---
title: Sprint Change Proposal — Two-Day Access Control Foundation
date: 2026-08-29
status: approved
mode: batch
scope: access-control-only
---

# Sprint Change Proposal — Two-Day Access Control Foundation

## 1. Issue Summary

### Change trigger

The team has a two-day delivery window and needs a concrete Access Control increment. User Management is owned by another developer and is out of scope for this work. The current full Access Control program is gated by the corrected Stage-1 suite, independent per-file AD-1 approval, red E2E approval, and then facade implementation; it cannot be completed safely within the deadline.

### Problem statement

There is no separately planned, bounded foundation story that lets the Access Control owner deliver useful backend code without taking ownership of User Management controllers, profile projection, or UI. Starting the complete facade would either miss its mandatory gates or create an unsafe partial authorization implementation.

### Evidence

| Source | Evidence |
| --- | --- |
| `docs/architecture/access-control.md` | Access Control is the cross-context authorization facade; profile field and record projection belongs to an owning consumer context. |
| `spec-access-control-facade-audience-resolution` | Full facade implementation is blocked by independently approved Stage-1 scenarios and approved red E2E. |
| `docs/test-cases/access-control/` | The full suite contains 171 draft scenarios, all still awaiting AD-1 approval. |
| `services/backend/src/user-management/` | User Management owns the protected `/users` routes and currently uses an interim adapter; it must not be changed by this slice. |

## 2. Impact Analysis

### Epic and story impact

| Artifact | Impact |
| --- | --- |
| Platform P-3 | No scope change. It remains the full-spec and Stage-1 alignment story and must not be marked done until its independent review is clean. |
| Full facade SPEC and 171-scenario suite | Preserved unchanged as the complete, later Access Control program. Their approval workflow is not waived. |
| New foundation work | Add a separate, narrow Access Control Foundation epic with one implementation story. It has no User Management code or UI deliverable. |
| User Management epics, specs, and frontend | No change. The eventual integration remains the User Management owner's responsibility. |

### Artifact conflicts

- **PRD:** no change. The product requirement remains the complete two-dimensional authorization model; this proposal only phases technical delivery.
- **Architecture:** no change to the long-term model. The foundation must obey AD-2, AD-5, AD-9, AD-10, and AD-12.
- **UX:** no change. Access Control has no standalone end-user screen; a UI is created only when an owning context consumes it.
- **Deployment:** no user-facing production deployment is claimed. A backend-only module may be merged after gates pass, but has no behavior until a consumer adopts it.

## 3. Recommended Approach

### Selected path: Direct adjustment — Access Audience Resolver foundation

Create a small, independently gated Access Control bounded-context slice that resolves relationship-derived audiences but does not make profile, feature-permission, or HTTP authorization decisions.

**In scope**

- `resolveAudiences(viewerId, employeeIds)` as an application-facing facade method.
- Live, fail-closed resolution for Self, transitive Reporting line over `direct` edges, direct People Partner, and Colleague fallback.
- Empty input behavior and broken/orphaned relationship denial.
- No persisted or cross-request-cached decisions.
- Domain ports, a Prisma adapter, unit tests, and only the small foundation scenario/E2E set approved for this story.

**Out of scope**

- User Management controllers, guards, adapter replacement, profile/list/export projection, and frontend code.
- Functional permissions (`isAllowed`), section matrix decisions (`canAccessSection`), Project or Department resolution, PP HR-line propagation, shared links, full-profile overlays, and policy-level `IN`.
- Any claim that the module is already enforcing production access on `/users` endpoints.

### Alternatives considered

| Option | Decision | Reason |
| --- | --- | --- |
| Implement the whole facade | Rejected | Cannot meet AD-1 and the two-day deadline safely. |
| Build a standalone Access Control UI | Rejected | It would be a demo tool, not user-facing authorization; it diverts work from the platform boundary. |
| Modify User Management now | Rejected | That bounded context is owned by another developer. |
| Build the resolver foundation | Selected | Produces reusable Access Control code with an explicit, safe boundary and no ownership conflict. |

### Estimate and risk

The scope is **moderate risk** and fits two working days only if the owner receives explicit human approval for the small Stage-1 scenarios and their red E2E before code begins. The risk is schedule rather than architecture: any expansion into section decisions or a consumer route invalidates the estimate.

## 4. Detailed Change Proposals

### Proposal 1 — Platform epic and sprint tracker

**Artifact:** `_bmad-output/planning-artifacts/platform/epics.md` and `_bmad-output/implementation-artifacts/platform/sprint-status.yaml`

**NEW:** Add a separate `Epic: Access Control Foundation` and one `ACF-1: Resolve Phase-0 Audiences` story. The story’s acceptance criteria are limited to Self, Reporting line, direct PP, Colleague, empty input, and fail-closed broken/orphaned edge behavior. Its dependency is a new foundation scenario contract approved through AD-1.

**Rationale:** This separates the two-day deliverable from P-3 and from the full facade program without changing either’s contract.

### Proposal 2 — Foundation SPEC and scenario contract

**Artifacts to create after proposal approval:**

- `_bmad-output/specs/spec-access-control-audience-foundation/`
- `docs/test-cases/access-control-foundation/`

**NEW:** A narrow SPEC and no more than eight scenario files: Self, direct Reporting, transitive Reporting, direct PP, Colleague fallback, empty bulk, broken relationship, and orphaned relationship. The SPEC explicitly excludes all section, functional-permission, and HTTP-profile decisions.

**Rationale:** The foundation gets its own AD-1 evidence without claiming approval of the 171-file full suite.

### Proposal 3 — Backend implementation handoff

**Artifacts to create after scenario and E2E approval:**

- `services/backend/src/access-control/` bounded context
- `services/backend/test/access-control/` E2E coverage

**NEW:** A hexagonal audience resolver implementation and Prisma adapter. The module exposes a facade/provider for future consumers but does not alter User Management wiring.

**Rationale:** User Management can later replace its interim adapter through an intentional integration story, owned by its developer.

## 5. Implementation Handoff

### Scope classification

**Moderate.** It adds a new bounded context and a platform epic, but preserves the PRD, User Management ownership, and full Access Control program.

### Ordered workflow

1. Approve this change proposal.
2. Use `bmad-spec` to author the foundation SPEC and eight Stage-1 scenarios.
3. Obtain independent human AD-1 approval for every foundation scenario.
4. Translate them to red E2E and obtain independent human approval.
5. Use `bmad-build` to implement ACF-1 in `services/backend` only.
6. Run code review; create a later, separate User Management integration story.

### Success criteria

1. No User Management or frontend file changes are made by ACF-1.
2. Every requested target resolves to exactly the applicable Phase-0 audiences; missing and malformed relationship data only reduces access.
3. The module persists no derived decision and exposes no standalone end-user UI.
4. The full facade SPEC and 171-scenario suite remain intact and pending their own approval flow.

## 6. Approval

Approved by the user on 2026-08-29. Planning changes may be applied and the foundation SPEC workflow may begin.

## 7. Implementation Record

Applied after approval:

- Added `Epic: Access Control Foundation` and Story `ACF-1` to the Platform epics.
- Added the Foundation epic and story keys to the Platform sprint tracker as `backlog`.

Not authorized by this proposal approval: User Management code, frontend code, production Access Control code, or bypassing the AD-1 approval gates.
