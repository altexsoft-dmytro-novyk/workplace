# AC-AD-02 · Direct Reporting line (unit manager)

**Trace:** §2.1 · §3.2 Reporting line · AD-10

## Scenario

**Given** Bob is Alice's **direct** unit manager via `Relationship type='direct'`.

**When** Bob reads Alice's employment section (Reporting line RW).

**Then** the section is returned — direct reports-to grants Reporting line audience.

**Preconditions:** [fixture](../README.md#canonical-personas); Bob → Alice direct edge.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; employment section present
