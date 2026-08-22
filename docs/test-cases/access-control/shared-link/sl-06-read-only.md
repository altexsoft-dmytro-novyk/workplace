# AC-SL-06 · A shared link never grants write access

**Trace:** §4.8 last bullet

## Scenario

**Given** a link for Alice exposes S2, explicitly enabled by its creator.

**When** Dave tries to write through the link.

**Then** the write is denied and the value is unchanged — a share link never grants write access, even to sections it exposes.

**Preconditions:** [fixture](../README.md); link for Alice with [s01, s02] (S2 explicitly enabled); Dave holds the token

## Test

- **inputURL:** `PATCH /share/{token}/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    },
    "body": {
      "personalPhone": "+1-555-0100"
    }
  }
  ```
- **expectedResult:** `4xx` denied; value unchanged on Alice's profile
