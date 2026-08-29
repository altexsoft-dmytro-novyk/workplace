# AC-AD-09 · Orphan policy grants nothing

**Trace:** AD-11 · facade-contract.md (Orphan policy)

## Scenario

**Given** Dave holds a project-management **policy** whose `targetId` references a **deleted** project (zero join members).

**When** Dave requests Alice's employment.

**Then** the orphan policy contributes no audience — fail-closed zero grant.

**Preconditions:** [fixture](../README.md#canonical-personas); Dave has PM policy row pointing at deleted project; no other relation to Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Dave>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; `employment` key absent
