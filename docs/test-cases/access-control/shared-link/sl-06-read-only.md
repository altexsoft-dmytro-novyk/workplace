# AC-SL-06 · A shared link never grants write access

**Trace:** §4.8 last bullet
**Preconditions:** [fixture](../README.md); link for Alice with [s01, s02] (S2 explicitly enabled); Dave holds the token

## Test

- **inputURL:** `PATCH /share/{token}/sections/s02`
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
- **expectedResult:** `4xx` denied; value unchanged on Alice's profile — there is no write path through a link, including for sections it exposes
