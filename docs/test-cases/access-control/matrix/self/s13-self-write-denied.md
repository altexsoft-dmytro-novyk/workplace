# AC-M-S13-SE-W-DEN · self write s13 denied (narrower rule)

**Trace:** §3.2 S13 · §4.3 · AD-10

## Scenario

**Given** Alice is Self on Mentorship with a narrower §3.3/§4.3 write exception.

**When** Alice attempts a mutation outside that exception.

**Then** the API returns `403` without persisting a change.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Mentorship data for Alice.

## Test

- **inputURL:** `POST /mentorship-pairs`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {
  "mentorId": "<alice-id>",
  "menteeId": "<mentee-id>"
}
  }
  ```
- **expectedResult:** `403`; Self cannot create mentorship pairs
