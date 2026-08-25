# UM-LIST-03 · List users with compound filters

**Trace:** epics.md Story 1.5 · FR-16

## Scenario

**Given** `User` records exist with varying `position` and `city` combinations.

**When** Root submits `GET /users?position=Engineer&city=Krakow`.

**Then** every returned record matches **both** filters.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test

- **inputURL:** `GET /users?position=Engineer&city=Krakow`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; every item matches `position: "Engineer"` and `city: "Krakow"`.
