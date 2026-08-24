# UM-REG-04 · Duplicate workEmail is rejected

**Trace:** [database-schema.md](../../../architecture/database-schema.md) `User.workEmail` (unique) · PRD FR-2 (`workEmail` is the magic-link login identity) · requirements §6 (identity across systems)

## Scenario

**Given** Root, holder of the HR Admin functional role, and Alice, an existing user with `workEmail: alice@company.example`.

**When** Root submits a registration payload reusing Alice's address — exactly, in a different letter case, or after Alice has been deactivated.

**Then** every attempt is rejected with `409` and no second `User` row is created. `workEmail` is normalized on write (trimmed, lower-cased) and uniqueness is enforced on the normalized value, so a case variant collides rather than creating a second account; without that, two rows would share one magic-link login identity and FR-2 could not name a single account for a given address. Uniqueness is absolute with respect to `isActive`: a deactivated user keeps their address, because `isActive` is a soft delete that leaves the row and its login identity in place.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded with `workEmail: alice@company.example` and `isActive: true`; no other user holds that address. Test 4 deactivates Alice, so the fixture must be restored before any later case that expects her active.

## Test 1 — exact duplicate

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Alicia",
      "lastName": "Duplicate",
      "position": "QA Engineer",
      "country": "Poland",
      "city": "Krakow",
      "workEmail": "alice@company.example",
      "companyJoinDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** `409`; the body reports a conflict on `workEmail` without echoing Alice's name, id, or any other field of the existing row.

## Test 2 — case and whitespace variant

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Alicia",
      "lastName": "Duplicate",
      "position": "QA Engineer",
      "country": "Poland",
      "city": "Krakow",
      "workEmail": "  ALICE@Company.Example  ",
      "companyJoinDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** `409` — normalization runs before the uniqueness check, so this resolves to the same address as Test 1. A `201` here is a defect: it would produce two accounts reachable by one magic-link identity.

## Test 3 — observe that nothing changed

- **inputURL:** `GET /users?filter[workEmail]=alice@company.example`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" }
  }
  ```
- **expectedResult:** `200` with exactly one record — Alice's, with her original `firstName`/`lastName` and no field touched by either rejected attempt.

## Test 4 — deactivate the holder

- **inputURL:** `DELETE /users/<aliceId>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" }
  }
  ```
- **expectedResult:** `200`; Alice's row survives with `isActive: false` (soft delete, AD-12 style — never a row delete).

## Test 5 — the deactivated holder still owns the address

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Alicia",
      "lastName": "Rehire",
      "position": "QA Engineer",
      "country": "Poland",
      "city": "Krakow",
      "workEmail": "alice@company.example",
      "companyJoinDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** `409`; still exactly one row for that address, Alice's deactivated one. Freeing a deactivated user's address would require an explicit reactivation or address-release flow, and no such flow is specified.
