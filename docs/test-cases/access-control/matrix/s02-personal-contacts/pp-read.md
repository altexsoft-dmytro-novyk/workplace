# AC-M-S02-05 · S2 Personal contacts — PP: read

**Trace:** §3.2 S2 / PP `RW`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's personal contacts.

**Then** she gets them all — PP holds RW on S2.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s02`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; body contains personal phone, personal email, messengers, residential address, current place of stay
