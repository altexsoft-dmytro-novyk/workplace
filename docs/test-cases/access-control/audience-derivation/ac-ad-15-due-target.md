# AC-AD-15 · Due target dismissed projection

**Trace:** AD-20 · §4.16 · facade-contract.md (Due target)

## Scenario

**Given** **AliceDue** has a due departure and Bob is her current direct manager.

**When** Bob reads or mutates AliceDue's profile.

**Then** Bob receives only the approved **read-only dismissed-target** projection (identity subset + dismissed employment status); AliceDue is absent from default active lists; writes are denied.

**Preconditions:** [fixture](../README.md#canonical-personas); AliceDue has a due departure; Bob is her direct manager.

## Test 1 — dismissed read

- **inputURL:** `GET /users/<alice-due-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `firstName`, `lastName`, `workEmail` present; `employmentStatus: dismissed` present; `personalcontacts`, `risks`, and other non-projection sections **absent**

## Test 2 — absent from active list

- **inputURL:** `GET /users?status=active`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `items` array contains no entry with id `<alice-due-id>`

## Test 3 — dismissed-target write denied

- **inputURL:** `PATCH /users/<alice-due-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": { "grade": "L5" }
  }
  ```
- **expectedResult:** `403`; no persisted change — dismissed target is read-only
