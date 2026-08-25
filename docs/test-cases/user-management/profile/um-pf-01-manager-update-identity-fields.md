# UM-PF-01 · Manager-line edit to identity fields persists

**Trace:** requirements §3.2 S1 (Manager line: RW) · PRD Data Model — User entity

## Scenario

**Given** Bob, Alice's unit manager (Manager-line access to Alice).

**When** Bob updates Alice's `position` and `city`.

**Then** the change is persisted and a subsequent read reflects the new values.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded with `position: "Engineer"`, `city: "Warsaw"`.

## Test

- **Test 1 — the write**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" }, "body": { "position": "Senior Engineer", "city": "Krakow" } }`
  - **expectedResult:** `200`; body reflects `position: "Senior Engineer"`, `city: "Krakow"`.
- **Test 2 — observing the change**
  - **inputURL:** `GET /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; `position: "Senior Engineer"`, `city: "Krakow"`.
