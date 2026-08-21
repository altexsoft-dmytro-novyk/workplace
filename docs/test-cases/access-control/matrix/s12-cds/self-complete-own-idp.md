# AC-M-S12-03 · S12 CDS — Self: completing own IDP is the one allowed write

**Trace:** §3.2 S12 / Self `(+ complete own IDP)` · §4.10 (completion date recorded)

## Scenario

**Given** Alice finished everything her open IDP asked for.

**When** she ticks it complete.

**Then** the completion date is recorded and shown alongside the deadline; the IDP is no longer open.

**Preconditions:** [fixture](../../README.md); Alice has an open IDP

## Test

- **inputURL:** `POST /users/alice/idps/{id}/complete`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; completion date recorded and returned alongside the deadline; IDP no longer *open*
