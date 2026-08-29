# AC-M-S5-SE-W-DEN · self write s5 denied (narrower rule)

**Trace:** §3.2 S5 · §4.3 · AD-10

## Scenario

**Given** Alice is Self on Documents with a narrower §3.3/§4.3 write exception.

**When** Alice attempts a mutation outside that exception.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Documents data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {
  "type": "contract",
  "title": "Employment contract"
}
  }
  ```
- **expectedResult:** `403`; non-certificate document types not writable by Self
