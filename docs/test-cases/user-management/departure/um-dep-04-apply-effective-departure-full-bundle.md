# UM-DEP-04 · The executor applies the full effective-date side-effect bundle exactly once

**Trace:** epics.md Story 5.2 · FR-6 · spine AD-16, AD-17, AD-18

## Scenario

**Given** Colin has a recorded `Departure` whose `effectiveDate` has already passed and `appliedAt` is still `null`, an open S14 action item assigned to Colin, and an active S13 mentorship pair with Colin as mentee.

**When** the AD-16 executor's due-row sweep runs (clock-driven — no HTTP endpoint triggers this; the scenario invokes the same `DepartureExecutorService.runOnce()` the `@Cron` hook calls, per the closest-real-substitute convention for a clock-driven precondition).

**Then**, in one transaction: Colin's `EmploymentStatus` closes the open `active` row and opens a `dismissed` one (AD-18 append-only), `User.isActive` becomes `false`, the open action item's status becomes `"cancelled — departed"`, the mentorship pair closes with a system note, `Departure.appliedAt` is set, and no departure event is added to the career timeline.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin has no active managed relations (so `um-dep-01`'s recording path would have admitted this departure); an S14 item and an S13 pair exist for Colin.

## Test

- **stateChange:** a `Departure` row for Colin is inserted directly with `effectiveDate` in the past (clock-driven precondition, no HTTP path creates a due-and-unapplied row deterministically — `POST /users/:id/departure` with a future date and waiting for real time to pass is not a viable test precondition); the executor's `runOnce()` is then invoked directly.
- **Test 1 — employment status is dismissed**
  - **inputURL:** `GET /users/<colinId>/employment`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; `employmentStatus: "dismissed"`.
- **Test 2 — the profile is excluded from the default list but still filterable**
  - **inputURL:** `GET /users?employmentStatus=dismissed`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; `items` includes Colin.
- **Test 3 — the open action item is cancelled**
  - **inputURL:** `GET /action-items?assigneeId=<colinId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; the item's `status` is `"cancelled — departed"`.
- **Test 4 — the mentorship pair is closed with a system note**
  - **inputURL:** `GET /mentorship-pairs?userId=<colinId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; the pair's `status` is `"closed"` and `closureNote` mentions the system-generated departure note.
- **Test 5 — no departure event on the career timeline**
  - **inputURL:** `GET /users/<colinId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; no entry has any departure-shaped `type`.
