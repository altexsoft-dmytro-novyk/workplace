# AC-AD-14 · Due actor denied before resolution

**Trace:** AD-20 · facade-contract.md (Due actor)

## Scenario

**Given** **DueDan** has a due departure (effective date reached) but still has a valid session token.

**When** DueDan requests any profile section.

**Then** access is denied with **`403`** before feature or audience resolution — due actor cutoff (AD-20).

**Preconditions:** [fixture](../README.md#canonical-personas); DueDan has scheduled departure at or past effective date.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:DueDan>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no profile body — due actor denied before AccessControl
