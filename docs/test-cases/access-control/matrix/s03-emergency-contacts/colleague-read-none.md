# AC-M-S03-07 · S3 Emergency contacts — Colleague: no read path (negative)

**Trace:** §3.2 S3 / Colleague `—` · §9 DoD

## Scenario

**Given** Alice's emergency contacts are filled in, and Colin is a plain colleague.

**When** Colin fetches her profile and probes the section directly.

**Then** no surface returns a trace of S3.

**Preconditions:** [fixture](../../README.md); Alice's S3 populated

## Test 1 — profile assembly

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; no `s03` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/emergency-contacts`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no S3 data in the body
