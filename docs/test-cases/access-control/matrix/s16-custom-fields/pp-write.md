# AC-M-S16-10 · S16 Custom fields — PP: write any field

**Trace:** §3.2 S16 / PP `RW`

## Scenario

**Given** Paula maintains profile data for the people she partners.

**When** she sets Alice's `t-shirt-size` value.

**Then** the change persists.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s16`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "t-shirt-size": "M"
    }
  }
  ```
- **expectedResult:** `200`; persisted
