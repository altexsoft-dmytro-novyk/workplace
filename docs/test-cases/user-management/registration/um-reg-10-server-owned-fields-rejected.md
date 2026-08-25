# UM-REG-10 · Server-owned create fields are rejected

**Trace:** [DEC-UM-006](../../../architecture/user-management-test-decisions.md) · epics.md Story 1.1

## Scenario

**Given** Root, holder of the HR Admin functional role.

**When** Root submits a registration payload that includes client-supplied `id`, `createdAt`, or `createdBy`.

**Then** the request is rejected with `400` and no `User` row is created. The server does not silently strip caller-supplied audit or identity fields.

**Preconditions:** [fixture](../README.md#canonical-personas); no user with the target `workEmail`.

## Test 1 — client-supplied id

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "id": "00000000-0000-7000-8000-000000000099",
      "firstName": "Eva",
      "lastName": "Test",
      "position": "Engineer",
      "country": "Poland",
      "city": "Warsaw",
      "workEmail": "eva.server-id@company.example",
      "companyJoinDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** `400`; no row for `eva.server-id@company.example`.

## Test 2 — client-supplied createdAt / createdBy

- **inputURL:** `POST /users`
- **inputRequest:** same body shape with `createdAt` and/or `createdBy` set to caller values instead of `id`.
- **expectedResult:** `400`; no row created for the submitted `workEmail`.
