# UM-CT-03 · PP manually adds a backfill entry

**Trace:** requirements §4.9 ("PP and UM can edit, delete and manually add timeline events... for historical backfill — the current data lives only in a separate Excel headcount change record")

## Scenario

**Given** Paula, Alice's people partner.

**When** Paula manually adds a `mentorship_end` entry dated before the system existed, sourced from the legacy Excel record.

**Then** the entry is created with `source: "manual"` and appears in Alice's timeline.

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
