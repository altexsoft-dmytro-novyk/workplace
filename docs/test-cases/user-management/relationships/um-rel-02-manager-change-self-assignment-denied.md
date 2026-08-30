# UM-REL-02 · Self-assignment as manager is rejected

**Trace:** epics.md Story 4.1 · spine AD-8

## Scenario

**Given** Alice reports to Bob, and Root holds the *change organisational relationships* permission.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ field: 'manager', value: <rootId> }` (Root naming themselves).

**Then** the request is rejected in the domain layer (AD-8: never only a controller check) and Alice's manager remains Bob — no `Relationship` row and no `RelationshipJournal` row is written.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice reports to Bob.

## Test

- **Test 1 — the rejected write**
  - **inputURL:** `POST /users/<aliceId>/relationships`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Root>" },
      "body": { "field": "manager", "value": "<rootId>" }
    }
    ```
  - **expectedResult:** `403`; no relationship or journal row committed.
- **Test 2 — observing the manager is unchanged**
  - **inputURL:** `POST /users/<aliceId>/relationships`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Root>" },
      "body": { "field": "manager", "value": "<bobId>", "expectedCurrent": "<bobId>" }
    }
    ```
  - **expectedResult:** `200` — Bob is still the current holder (an `expectedCurrent` matching Bob succeeds, proving Test 1 never replaced him).
