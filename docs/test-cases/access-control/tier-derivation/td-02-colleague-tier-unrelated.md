# AC-TD-02 · Colleague tier: unrelated employee resolves as Colleague

**Trace:** §2.1 Employee row · §3.1 Colleague

## Scenario

**Given** Colin has no management, project or PP relationship to Alice.

**When** he opens Alice's profile.

**Then** the engine resolves him to the Colleague tier and returns only the whitelist: identity card, leaves, and project names.

**Preconditions:** [fixture](../README.md); Colin has no reports-to path to Alice, manages none of her projects, is not her PP

## Test

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; body contains **only** `s01`, `s10`, `s11` (project name only) — no other section key (set-equality in AC-SF-01)
