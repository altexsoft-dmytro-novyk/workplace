# UM-REL-05 · Self-assignment as People Partner is rejected

**Trace:** epics.md Story 4.2 · spine AD-8

## Scenario

**Given** Alice is assigned to Paula as People Partner, and Root holds the *change organisational relationships* permission.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ field: 'people_partner', value: <rootId> }`.

**Then** self-assignment is rejected and Alice's People Partner assignment remains Paula.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice is assigned to Paula.

## Test

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "field": "people_partner", "value": "<rootId>" }
  }
  ```
- **expectedResult:** `403`; no relationship or journal row committed.
