# AC-M-S02-06 · S2 Personal contacts — PP: write

**Trace:** §3.2 S2 / PP `RW`

## Scenario

**Given** Paula maintains contact data for the people she partners.

**When** she updates Alice's personal email.

**Then** the change persists.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "personalEmail": "alice@example.com"
    }
  }
  ```
- **expectedResult:** `200`; persisted
