# UM-LIST-02 · List users filtered by country

**Trace:** epics.md Story 1.5 · FR-16

## Scenario

**Given** `User` records exist with varying `country` values.

**When** Root submits `GET /users?country=Poland`.

**Then** every returned record has `country: "Poland"`.

**Preconditions:** [fixture](../README.md#canonical-personas); at least one non-Poland user exists for contrast.

## Test

- **inputURL:** `GET /users?country=Poland`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; every item in the results has `country: "Poland"`.
