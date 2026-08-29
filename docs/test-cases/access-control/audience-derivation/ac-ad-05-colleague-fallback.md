# AC-AD-05 · Colleague fallback

**Trace:** §3.2 Colleague · AD-10 · facade-contract.md

## Scenario

**Given** Colin is authenticated and holds no Self, Reporting, PP, or Project audience over Alice.

**When** Colin reads Alice's identity card (Colleague **R** whitelist).

**Then** S1 is returned; S2 is denied (`404`) — Colleague is the fallback audience with whitelist-only beyond S1.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin unrelated to Alice.

## Test 1 — whitelist allowed

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; identity fields present (S1 whitelist)

## Test 2 — non-whitelist denied

- **inputURL:** `GET /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; section absent (Colleague `—` cell)
