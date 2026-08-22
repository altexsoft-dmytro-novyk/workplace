# AC-M-HR-01 · HR Admin: reads everything

**Trace:** §3.1 (HR Admin — full access to everything) · §2.2

## Scenario

**Given** Root holds the HR Admin functional role and no personal relationship to Alice.

**When** he opens her profile.

**Then** every section is present — full access to everything, including unflagged notes and request history (how this grant works internally is spec OQ3; the behavior itself is normative).

**Preconditions:** [fixture](../../README.md); Root holds the HR Admin functional role and **no** Manager/PP relation to Alice

## Test

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:root>"
    }
  }
  ```
- **expectedResult:** `200`; every section S1–S16 present, incl. S6, S7 (all notes regardless of flags), S15
