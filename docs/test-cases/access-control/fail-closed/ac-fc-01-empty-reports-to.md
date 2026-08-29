# AC-FC-01 · Empty reportsTo grants nothing

**Trace:** AD-11 · §2.1

## Scenario

**Given** **TopLee** has no `reportsToUserId` (top of tree) and no PP assignment to Alice.

**When** TopLee requests Alice's employment.

**Then** empty reports-to grants **nothing** — TopLee has no Reporting-line path to Alice and receives leak-free `404`.

**Preconditions:** [fixture](../README.md#canonical-personas); TopLee at tree top with empty `reportsToUserId`; Carol reaches Alice only via Bob chain below TopLee.

## Test 1 — empty reportsTo grants nothing

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:TopLee>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; `employment` key absent — empty edge grants nothing

## Test 2 — descendant walk is normal transitive Reporting line

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Carol>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `employment` present with `grade` and `position` — Carol reaches Alice through Bob chain, not via empty-edge magic
