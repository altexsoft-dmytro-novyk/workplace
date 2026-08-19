# AC-M-S10-07 · S10 Leaves — Colleague: read, **including leave type**

**Trace:** §3.2 S10 / Colleague `R, including type` · §3.3.3
**Preconditions:** [fixture](../../README.md); Alice has a parental-leave record

## Test

- **inputURL:** `GET /users/alice/sections/s10`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; records carry dates **and** type — `parental leave` visible as such, not masked to "absent"
