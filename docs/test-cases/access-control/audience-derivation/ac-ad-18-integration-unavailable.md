# AC-AD-18 · Project integration unavailable — other audiences continue

**Trace:** facade-contract.md (Integration unavailable) · AD-10

## Scenario

**Given** No approved timetracker freshness contract exists (Phase 1 default).

**When** Bob (Reporting line) and Paula (PP) read Alice's employment while Pete (PM on shared project) is denied Project line.

**Then** Self, Reporting, PP, and Colleague resolution continue normally; Project contributes nothing.

**Preconditions:** [fixture](../README.md#canonical-personas); standard Phase 1 seed.

## Test 1 — Reporting continues

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; employment present

## Test 2 — Project withheld

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Pete>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; employment absent for PM without other audience
