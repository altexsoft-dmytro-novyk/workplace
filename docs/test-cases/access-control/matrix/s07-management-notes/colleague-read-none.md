# AC-M-S07-13 · S7 Management notes — Colleague: no read path (negative)

**Trace:** §3.2 S7 / Colleague `—` · §9 DoD

## Scenario

**Given** notes about Alice exist — one even flagged visible for the employee — and Colin is a plain colleague.

**When** Colin fetches her profile and probes the section.

**Then** no trace: flags widen access only to the audiences they name, never to colleagues.

**Preconditions:** [fixture](../../README.md); notes about Alice exist, incl. one flagged *visible for employee*

## Test 1 — profile assembly

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; no `s07` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s07`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no note data
