# UM-CT-03 · PP manually adds a backfill entry

**Trace:** requirements §4.9 · [DEC-UM-001](../../../architecture/user-management-test-decisions.md) · [DEC-UM-011](../../../architecture/user-management-test-decisions.md)

## Scenario

**Given** Paula, Alice's assigned people partner.

**When** Paula manually adds a `mentorship_end` entry dated before the system existed, sourced from the legacy Excel record.

**Then** the entry is created with `source: "manual"` and appears in Alice's timeline.

This scenario proves the **manual backfill path only** (DEC-UM-011). It does not exercise Epic 4's automatic `mentorship_end` from relationship unpair — that is covered by `relationships/um-rel-05`.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test

- **Test 1 — the write**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" }, "body": { "type": "mentorship_end", "eventDate": "2024-03-15", "details": {} } }`
  - **expectedResult:** `201`; body reflects `source: "manual"`, `type: "mentorship_end"`.
- **Test 2 — observing it in the timeline**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; list includes the entry from Test 1.
