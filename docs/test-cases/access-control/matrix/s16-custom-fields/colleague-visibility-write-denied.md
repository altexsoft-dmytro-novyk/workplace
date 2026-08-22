# AC-M-S16-08 · S16 — *colleague* visibility grants read, never write

**Trace:** §3.3.5

## Scenario

**Given** Colin can see Alice's `office-floor` value.

**When** he tries to change it.

**Then** 403 — public read does not mean public write.

**Preconditions:** [fixture](../../README.md); custom field `office-floor`, visibility *colleague*

## Test

- **inputURL:** `PATCH /users/alice/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "office-floor": "3"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
