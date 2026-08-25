# UM-CT-04 · Unit Manager manually adds a backfill entry

**Trace:** requirements §4.9 · [DEC-UM-001](../../../architecture/user-management-test-decisions.md)

## Scenario

**Given** Bob, Alice's **direct** unit manager (not a transitive or project-derived manager).

**When** Bob manually adds an entry for the legacy Excel record.

**Then** the entry is created with `source: "manual"` and appears in Alice's timeline — same mechanic as `um-ct-03`, proving the direct UM write actor under DEC-UM-001.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test

- **Test 1 — the write**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" }, "body": { "type": "joined_company", "eventDate": "2019-06-01", "details": {} } }`
  - **expectedResult:** `201`; body reflects `source: "manual"`.
- **Test 2 — observing it in the timeline**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; list includes the entry from Test 1.
