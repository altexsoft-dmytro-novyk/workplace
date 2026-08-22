# AC-M-S10-07 · S10 Leaves — Colleague: read, **including leave type**

**Trace:** §3.2 S10 / Colleague `R, including type` · §3.3.3

## Scenario

**Given** Alice is on parental leave, and Colin is a plain colleague.

**When** Colin requests her leaves section.

**Then** he sees the records with dates **and** the real type — the matrix explicitly grants colleagues the type, it is not masked to a generic absent.

**Preconditions:** [fixture](../../README.md); Alice has a parental-leave record

## Test

- **inputURL:** `GET /users/alice/leaves`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; records carry dates **and** type — `parental leave` visible as such
