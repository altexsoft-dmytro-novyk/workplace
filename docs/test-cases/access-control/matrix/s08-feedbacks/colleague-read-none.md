# AC-M-S08-09 · S8 Feedbacks — Colleague: no read path (negative)

**Trace:** §3.2 S8 / Colleague `—` · §4.15 (a colleague cannot browse feedback) · §9 DoD

## Scenario

**Given** feedback about Alice exists — including a record shared with her — and Colin is a plain colleague.

**When** Colin fetches her profile and probes the section.

**Then** no trace: a colleague can never browse feedback about another person.

**Preconditions:** [fixture](../../README.md); feedback about Alice exists, incl. a record shared with her

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
- **expectedResult:** `200`; no `s08` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/sections/s08`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no feedback data
