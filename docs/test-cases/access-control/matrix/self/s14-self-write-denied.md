# AC-M-S14-SE-W-DEN · self write s14 denied (narrower rule)

**Trace:** §3.2 S14 · §4.3 · AD-10

## Scenario

**Given** Alice is Self on Action items with a narrower §3.3/§4.3 write exception.

**When** Alice attempts a mutation outside that exception.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Action items data for Alice.

## Test

- **inputURL:** `POST /action-items`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {
  "assigneeId": "<alice-id>",
  "title": "New task"
}
  }
  ```
- **expectedResult:** `403`; Self cannot create action items
