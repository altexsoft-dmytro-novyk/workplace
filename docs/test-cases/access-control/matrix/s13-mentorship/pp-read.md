# AC-M-S13-07 · S13 Mentorship — PP: read

**Trace:** §3.2 S13 / PP `RW`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's mentorship section.

**Then** she sees the full section.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; full section
