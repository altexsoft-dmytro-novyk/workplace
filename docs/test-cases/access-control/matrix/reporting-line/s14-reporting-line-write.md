# AC-M-S14-RE-W · reporting-line write s14

**Trace:** §3.2 S14 · AD-10

## Scenario

**Given** Bob is Alice's Reporting line (direct unit manager) with §3.2 write on Action items.

**When** Bob performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Action items data for Alice.

## Test

- **inputURL:** `POST /action-items`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {
  "assigneeId": "<alice-id>",
  "title": "Follow up"
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
