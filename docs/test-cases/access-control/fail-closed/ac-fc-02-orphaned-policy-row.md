# AC-FC-02 · Orphaned policy row after target delete

**Trace:** AD-11 · AD-12

## Scenario

**Given** Pete holds a live project-management policy joined to the shared project with Alice, granting Project-line S5 (CV and certificates only).

**When** the policy's project target is hard-deleted so the row becomes orphan.

**Then** the join yields zero members and grants zero access — fail-closed (must not fail-open).

**Preconditions:** [fixture](../README.md#canonical-personas); Pete PM policy on live shared project with Alice membership; seeded certificate on Alice.

## Test 1 — baseline effective grant (live policy join)

- **inputURL:** `GET /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Pete>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `documents` present; at least one item with `type` in `{cv, certificate}` — sole fail-closed-suite project-line positive proving live policy join

## Test 2 — after orphan

- **stateChange:** hard-delete the policy's project target; orphan policy row remains until sweep

- **inputURL:** `GET /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Pete>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; `documents` key absent — orphan policy fail-closed; no fail-open join
