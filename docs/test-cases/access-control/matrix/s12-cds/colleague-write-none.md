# AC-M-S12-10 · S12 CDS — Colleague: no write path (negative)

**Trace:** §3.2 S12 / Colleague `—` · §9 DoD

## Scenario

**Given** Colin has no standing over Alice.

**When** he tries to register an assessment about her, then to complete her IDP.

**Then** both fail 404 — for him the section does not exist.

**Preconditions:** [fixture](../../README.md)

## Test 1 — authoring

- **inputURL:** `POST /users/alice/assessments`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "date": "2026-08-01"
    }
  }
  ```
- **expectedResult:** `404`; nothing created

## Test 2 — completing someone else's IDP

- **inputURL:** `POST /users/alice/idps/{id}/complete`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; IDP unchanged
