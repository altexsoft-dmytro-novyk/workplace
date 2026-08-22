# AC-M-HR-03 · HR Admin access rides entirely on the role

**Trace:** §3.1 · AD-12 (revocable via the ordinary UI path)

## Scenario

**Given** Root's full visibility comes only from the HR Admin role, and Ida is a second, delegated admin.

**When** Root confirms the full view, Ida revokes his role membership, and Root retries with the same token.

**Then** the full view collapses to the plain Colleague view the moment the role is gone.

**Preconditions:** [fixture](../../README.md); Ida also holds the HR Admin role (delegated), so a second admin can revoke Root

## Test 1 — baseline: admin view

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:root>"
    }
  }
  ```
- **expectedResult:** `200`; full view — every section S1–S16 present (AC-M-HR-01)

## Test 2 — revoke Root's role membership

- **inputURL:** `DELETE /users/root/policies/{policyId}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:ida>"
    }
  }
  ```
- **expectedResult:** `200`; Root is no longer a member of the HR Admin role

## Test 3 — same token, colleague view

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:root>"
    }
  }
  ```
- **expectedResult:** `200`; **Colleague** view only (`s01`, `s10`, `s11` name only) — on the very next request, same session token
