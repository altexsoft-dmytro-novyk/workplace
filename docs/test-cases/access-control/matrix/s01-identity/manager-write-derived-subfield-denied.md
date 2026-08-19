# AC-M-S01-06 · S1 Identity card — derived subfields not writable via S1

**Trace:** §3.2 S1 (**assumption**, spec memlog: manager/PP/mentor/projects are relationship-derived)
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s01`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "manager": "dave"
    }
  }
  ```
- **expectedResult:** `4xx`; unchanged — manager, PP, mentor and current projects render from relationships, not from S1 fields
