# UM-REL-06 · Multiple active mentors allowed

**Trace:** epics.md Story 4.2 · AD-11 (no one-mentor UNIQUE on mentorship)

## Scenario

**Given** Alice already has an active mentorship edge to Paula.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ type: 'mentorship', targetId: <anotherMentorId> }`.

**Then** the response is `201` — unlike reports-to, mentorship has no one-at-a-time uniqueness constraint.

**Preconditions:** [fixture](../README.md#canonical-personas); first mentorship edge exists; `<anotherMentorId>` is a distinct eligible mentor user.

## Test

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "type": "mentorship", "targetId": "<anotherMentorId>" }
  }
  ```
- **expectedResult:** `201`; both mentorship edges exist on read.
