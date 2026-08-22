# AC-TD-12 · Reports-to edge removed → Manager access ends, transitively

**Trace:** §2.1 (access derived live from relationships) · AD-10 (derived decisions never persisted)

## Scenario

**Given** Carol sees Alice only through the chain Alice→Bob→Carol.

**When** Alice's reports-to-Bob edge is removed.

**Then** Bob and everyone above him lose Manager access on their very next request.

**Preconditions:** [fixture](../README.md); Alice → Bob → Carol reporting chain

## Test 1 — baseline: transitive Manager view

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:carol>"
    }
  }
  ```
- **expectedResult:** `200`; full Manager-line view via the chain (AC-TD-04)

## Test 2 — state change

- **stateChange:** Alice's reports-to-Bob edge is removed (org-structure change lands via sync/admin data, no scenario-facing API)

## Test 3 — direct manager loses access

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; Colleague view

## Test 4 — whole chain above loses access

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:carol>"
    }
  }
  ```
- **expectedResult:** `200`; Colleague view — everyone above the removed edge loses access on the next request
