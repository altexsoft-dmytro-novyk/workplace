# AC-M-S06-06 · S6 Risks — PP: write

**Trace:** §3.2 S6 / PP `RW`

## Scenario

**Given** Paula spotted an early warning sign in a 1:1.

**When** she records a need-attention risk for Alice.

**Then** the record persists — PP holds RW on S6.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/risks`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "level": "need attention",
      "description": "…",
      "date": "2026-08-19"
    }
  }
  ```
- **expectedResult:** `201`; persisted
