# UM-REL-07 · Non-HR Admin cannot mutate relationships

**Trace:** epics.md Stories 4.1 and 4.2 · FR-14/FR-15

## Scenario

**Given** Colin holds no HR Admin functional role.

**When** Colin attempts to create a reports-to or mentorship relationship for Alice.

**Then** the request is denied with `403`.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test 1 — reports-to denied

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": { "type": "direct", "targetId": "<bobId>" }
  }
  ```
- **expectedResult:** `403`.

## Test 2 — mentorship denied

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": { "type": "mentorship", "targetId": "<paulaId>" }
  }
  ```
- **expectedResult:** `403`.
