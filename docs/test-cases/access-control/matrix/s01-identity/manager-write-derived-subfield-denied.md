# AC-M-S01-06 · S1 Identity card — derived subfields not writable via S1

**Trace:** §3.2 S1 (**assumption**, spec memlog: manager/PP/mentor/projects are relationship-derived)

## Scenario

**Given** Bob can edit Alice's identity card.

**When** he tries to change her manager through an S1 write.

**Then** it is rejected — manager, PP, mentor and current projects are rendered from relationships, not stored as S1 fields.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice`
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
- **expectedResult:** `4xx`; unchanged
