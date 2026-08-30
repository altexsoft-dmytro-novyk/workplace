# UM-REL-03 · An actor without the dedicated permission cannot change a manager

**Trace:** epics.md Story 4.1 · spine AD-9, AD-23

## Scenario

**Given** Bob, Alice's direct manager (S11 read/write access to Alice through the base matrix), but Bob holds no *change organisational relationships* Policy attachment.

**When** Bob submits `POST /users/<aliceId>/relationships` with `{ field: 'manager', value: <ninaId> }`.

**Then** the request is denied and Alice's manager remains Bob — holding S11 matrix write access to Alice is not the same as holding the dedicated functional permission (AD-9/CAP-3: `canAccessSection` and `isAllowed` are structurally distinct gates).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice reports to Bob; Bob holds no Policy.

## Test

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": { "field": "manager", "value": "<ninaId>" }
  }
  ```
- **expectedResult:** `403`; no relationship or journal row committed.
