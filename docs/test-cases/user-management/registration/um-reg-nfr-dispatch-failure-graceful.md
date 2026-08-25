# UM-REG-NFR · Registration survives email transport failure

**Trace:** [DEC-UM-008](../../../architecture/user-management-test-decisions.md) · NFR-3 · epics.md Story 1.1

## Scenario

**Given** Root creates a new hire and the registration transaction commits the `User`, `joined_company` event, and durable dispatch intent.

**When** the outbound email transport throws **after** the transaction commits.

**Then** the HTTP response is still `201`; the `User` and `joined_company` event survive; delivery state is observable as pending/failed and retryable. Registration does **not** roll back.

**Preconditions:** [fixture](../README.md#canonical-personas); email outbound port bound to a throwing fake for this test only.

## Test

- **inputURL:** `POST /users`
- **inputRequest:** valid registration body for a new ephemeral hire (UUID-scoped `workEmail`).
- **expectedResult:** `201`; body reflects created user with `isActive: true`.
- **stateChange:** stage 2 asserts (1) `User` row exists, (2) `joined_company` event exists, (3) durable dispatch record is pending/failed and retryable, (4) email fake recorded the attempted dispatch.
