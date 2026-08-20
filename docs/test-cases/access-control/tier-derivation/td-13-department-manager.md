# AC-TD-13 · Manager tier via department attachment ⚠ provisional

**Trace:** ARCHITECTURE spine (Departments generalize §2.1 relation 2) — **not in the requirements doc; do not translate to E2E until confirmed (spec OQ4)**

## Scenario

**Given** Gina holds a manages-department policy for department D, Phoenix belongs to D, and Alice works on Phoenix.

**When** Gina opens Alice's profile.

**Then** the department attachment resolves through the resource tree to project members and grants the Manager-line view — provisional until the requirements owner confirms departments.

**Preconditions:** [fixture](../README.md); Gina has no other relation to Alice

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:gina>"
    }
  }
  ```
- **expectedResult:** `200`; full Manager-line view — department attachment resolves through the resource tree
