# UM-LIST-01 · List users returns pagination metadata

**Trace:** epics.md Story 1.5 · FR-15 · [api-conventions.md](../../../architecture/api-conventions.md) AD-14

## Scenario

**Given** more than one page of `User` records exist in the test database.

**When** Root submits `GET /users` with pagination parameters.

**Then** the response is `200` with a page of results and pagination metadata (total count, page size, current page, or equivalent contract).

**Preconditions:** [fixture](../README.md#canonical-personas); seeded users exceed one page at default page size.

## Test

- **inputURL:** `GET /users?page=1&pageSize=10`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; body includes a results array and pagination metadata fields documented in the API contract.
