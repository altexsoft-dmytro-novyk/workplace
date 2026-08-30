# UM-DEP-03 · An actor without the dedicated permission cannot record a departure

**Trace:** epics.md Story 5.1 · spine AD-9, AD-23

## Scenario

**Given** Bob, Alice's direct manager, holds no *record a departure* Policy attachment.

**When** Bob submits `POST /users/<colinId>/departure` with a future effective date and reason.

**Then** the request is denied and no `Departure` row is written.

**Preconditions:** [fixture](../README.md#canonical-personas); Bob holds no Policy.

## Test

- **inputURL:** `POST /users/<colinId>/departure`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": { "effectiveDate": "2099-01-01", "reason": "resignation" }
  }
  ```
- **expectedResult:** `403`; no `Departure` row created.
