# AC-M-S10-02 · S10 Leaves — Self: write denied

**Trace:** §3.2 S10 / Self `R` (**assumption**: R for every audience — timetracker owns the data)

## Scenario

**Given** Alice can see her own leave records.

**When** she tries to edit one here.

**Then** 403 — the timetracker owns leave data; this system only displays it.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/leaves`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "type": "vacation"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
