---
title: 'Story 1.4: HR Admin Deactivates an Employee — RETIRED'
type: 'superseded-pointer'
status: superseded
superseded: 2026-09-01
superseded_by: ../../planning-artifacts/user-management/epics.md
---

# RETIRED — generic deactivation is gone in v1.5

Requirements v1.5 has **no generic employee-deactivation product operation**
(AD-16). `User.isActive` is an internal account/row-retention flag only, not an
employment-lifecycle capability and not an HTTP surface — the pre-v1.5
`DELETE /users/:id` soft-delete handler and `um-deact-01..03` scenarios are
retired in the brownfield cutover (AD-21).

The v1.5 lifecycle is the **departure workflow**:

- **Epic 5 Story 5.1 — Record a Departure** (`spec-5-1-record-a-departure.md`)
- **Epic 5 Story 5.2 — Apply an Effective Departure**
  (`spec-5-2-apply-an-effective-departure.md`)

both blocked on CC-06 (AD-20). The v1.5 `epics.md` has **no Story 1.4** — Epic 1
is Stories 1.1, 1.2, 1.3, 1.5. `baseline_commit 6254ed50…` is stale.

The DEC-UM-002 principle ("no role-name checks in domain code; capability check
through the facade") carries forward to the Epic 0 adoption adapter and the
Epic 5 departure-permission check.
