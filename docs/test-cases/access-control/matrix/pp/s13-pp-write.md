# AC-M-S13-PP-W · pp write s13

**Trace:** §3.2 S13 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner with §3.2 write on Mentorship.

**When** Paula performs an allowed mutation.

**Then** the mutation succeeds — dual gate and narrower command rules satisfied.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Mentorship data for Alice.

## Test

- **inputURL:** `POST /mentorship-pairs`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {
  "mentorId": "<alice-id>",
  "menteeId": "<mentee-id>"
}
  }
  ```
- **expectedResult:** `201` or `200`; mutation persisted — observable on follow-up read
