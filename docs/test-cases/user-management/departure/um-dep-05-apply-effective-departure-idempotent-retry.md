# UM-DEP-05 · Re-running the executor after a departure is already applied is a no-op

**Trace:** epics.md Story 5.2 · spine AD-16 ("idempotent... no duplicate status, cancellation, closure, or journal effect is created")

## Scenario

**Given** Colin's departure was already applied by a prior executor sweep (`um-dep-04`).

**When** the executor's due-row sweep runs again.

**Then** `appliedAt IS NOT NULL` excludes Colin's row from the `SELECT ... FOR UPDATE SKIP LOCKED` claim predicate, so nothing is re-applied — Colin still has exactly one open `dismissed` `EmploymentStatus` row, not two.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin's departure has `appliedAt` set (post-`um-dep-04`).

## Test

- **stateChange:** the executor's `runOnce()` is invoked a second time.
- **inputURL:** `GET /users/<colinId>/employment`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
- **expectedResult:** `200`; `employmentStatus: "dismissed"` — unchanged, and (stage-2) exactly one `EmploymentStatus` row with `status: "dismissed"` and `endDate: null` exists for Colin, not a duplicate.
