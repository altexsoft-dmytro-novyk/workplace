# AC-FC-03 · Bootstrap HR Admin is ordinary revocable FR

**Trace:** AD-12 · §2.2

## Scenario

**Given** Root holds the seeded bootstrap HR Admin FR and Ida is granted a second admin attachment.

**When** Ida revokes Root's HR Admin attachment and Root requests a configuration-only `/roles` operation.

**Then** Root loses the FR like any other holder — no superuser derived from data shape.

**Preconditions:** [fixture](../README.md#canonical-personas); Root bootstrap admin; Ida delegated second admin.

## Test 1 — baseline configuration access

- **inputURL:** `GET /roles`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; role catalog readable with HR Admin FR

## Test 2 — revoke Root

- **inputURL:** `DELETE /users/<root-id>/policies/<root-hr-admin-policy-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Ida>" },
    "body": {}
  }
  ```
- **expectedResult:** `204`; attachment removed

## Test 3 — Root denied

- **inputURL:** `GET /roles`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; bootstrap admin is ordinary revocable FR
