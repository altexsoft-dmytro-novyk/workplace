---
title: "Story 1.2: View and Edit an Employee's Identity-Card Fields"
type: 'feature'
status: draft
created: 2026-08-24
regenerated: 2026-09-01
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-1-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — supersedes the pre-v1.5 version;
> **NOT an AD-1 approval.** The pre-v1.5 `<frozen-after-approval>` block and its
> "Resolved 2026-08-26" notes (interim-permissive `isAllowedForTarget`,
> `EDIT_USER_FEATURE` against a non-existent key) are **re-opened for v1.5
> renegotiation** — authorization is now Epic 0's, against the real facade.
> `baseline_commit 6254ed50…` dropped as stale.

## Intent

**Problem:** Once `User` rows exist (Story 1.1 import), an entitled actor needs
to read one employee's S1 identity-card fields and correct them as roles,
locations, and contact details change. `GET /users/:id` and `PATCH /users/:id`
are the routes (AD-14 shape 1). A duplicate `workEmail`/`ttId` on edit is
rejected the same way it is at import — the whole write rejected (`409`), the
target row untouched.

**Approach (v1.5):** Add `GET /users/:id` and `PATCH /users/:id` to the
`user-management` module. **This story asserts data correctness only.** *Who* is
entitled — Self / reporting / PP allowed, colleague denied, the §2.2 dual gate —
is asserted by **Epic 0** (Access Control adoption) against the real
`AccessControlFacade`, per the architect handoff §1 Sequencing. Story 1.2 does
not duplicate entitlement scenarios and does not harden the interim adapter.

## Boundaries & Constraints

**Always:**
- AD-1 gate: `um-pf-01`, `um-pf-03`, `um-pf-04` scenario docs approved → red
  E2E → implementation.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- A conflicting `workEmail`/`ttId` write is rejected wholesale (`409`), never a
  partial update; `ttId` null-vs-null is not a duplicate.
- `workEmail` normalized (trim + lowercase) on write before the uniqueness
  check (DEC-UM-007), consistent with the import writer.
- Every entitlement check routes through the `ACCESS_CONTROL_PORT` seam — never
  inline role/tier logic. Under Epic 0 the port is the real facade-backed
  adapter; the guard applies the §2.2 dual gate for `PATCH`
  (`isAllowed(viewer, <edit permission key>)` **and**
  `canAccessSection(viewer, 'S1', target) === 'write'`).
- **§3.2 fn 1:** manager, People Partner, and department are **not writable
  through S1** for any audience. `UpdateUserDto` has no such properties and
  `EditUserAction` rejects them explicitly (tested) — they change only through
  Epic 4's dedicated screen.
- Design the edit path as one "produce the new state" call site so Epic 3's
  `position_change` hook attaches cleanly (AD-11).

**Never:**
- No `updatedAt`/`updatedBy` column.
- `PATCH /users/:id` never touches `photo` (Story 1.3) or `isActive`.
- Do not duplicate entitlement-boundary scenarios (401/403, audience
  resolution) — Epic 0 / access-control's own suites own them.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Success | Entitled actor `PATCH /users/:id` with a subset of editable S1 fields | `200`, body reflects new values; follow-up `GET /users/:id` matches (`um-pf-01`) |
| Duplicate `workEmail` | `PATCH` sets `workEmail` to a value another row holds | `409`; target `workEmail` unchanged on follow-up read (`um-pf-03`) |
| Duplicate `ttId` | `PATCH` sets `ttId` to another row's non-null value | `409`; target `ttId` unchanged (`um-pf-04`) |
| `ttId` null-vs-null | Target `ttId` null; PATCH omits it or another row is also null | No `409` on this basis |
| Org field smuggled | `PATCH` body carries `manager`/`peoplePartner`/`department` | Rejected; no access relationship changes (§3.2 fn 1) |

Entitlement-boundary rows (unauthenticated, unauthorized, wrong audience) are
**out of this matrix** — Epic 0 owns them.

## v1.5 Cutover Notes

- `isAllowedForTarget`'s pre-v1.5 "interim-permissive (any resolved session)"
  implementation is retired by Epic 0's real adapter. Story 1.2's E2E, if it
  needs a passing authorized `PATCH`, seeds real `User` + `Relationship` rows and
  a `Bearer <token:<seeded-uuid>>` — the same fixture pattern Epic 0 uses — or
  is sequenced after Epic 0's read path lands.
- The `EDIT_USER_FEATURE` / `UPLOAD_PHOTO_FEATURE` controller constants point at
  keys that do not exist in any seed (`user-management:edit`,
  `user-management:upload-photo`). Resolving that is **Epic 0 Open Decision 1**,
  not this story.

## Open Questions / Gates

- Story 1.2's authorized-`PATCH` E2E is green only once Epic 0's write path
  (and, under option (a), the new `user-management:edit` kernel seed) lands.
  Data-correctness assertions (`409` wholesale-reject, read-back) do not depend
  on that.
