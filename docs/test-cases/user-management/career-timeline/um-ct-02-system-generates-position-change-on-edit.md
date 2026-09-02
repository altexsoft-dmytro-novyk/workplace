# UM-CT-02 · Editing position writes a position_change event

**Trace:** requirements §4.9 · PRD FR-5, FR-11 · epics.md Story 3.1 (second AC) · tracked type: `position_change` · AD-11 (same-transaction as the `PATCH`) · `profile/um-edit-01` (the triggering edit)

## Scenario

**Given** Alice currently has `position: "Engineer"` (seeded).

**When** Bob (Reporting line, entitled — entitlement is Epic 0's) edits Alice's `position` to `"Senior Engineer"` via `PATCH /users/:id` (`profile/um-edit-01`).

**Then** the system writes a `UserEvents` row for Alice with `type: "position_change"`, `source: "system"`, `eventDate` = today's date in UTC (the `eventDate` column is a `DATE`; "in UTC, like every other date" — Dmytro 2026-09-02), and `details` carrying **the new value only** — `{ "position": "Senior Engineer" }`, no `from`/previous value. The write happens in the **same transaction** as the `PATCH` (AD-11); no separate request from Bob produces it.

**And** a `PATCH` that does not change `position` (same value, or `position` absent from the body) writes **no** `position_change` event.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded `position: "Engineer"`. **stateChange:** the `PATCH /users/:id` from `um-edit-01` is the trigger — this suite makes that real request against the id returned when Alice is seeded, never a literal `<aliceId>`.

## Test

- **Test 1 — the edit triggers the event**
  - **inputURL:** `GET /users/:id/events` (Alice's id, after the `um-edit-01` `PATCH`)
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Bob>" } }
    ```
  - **expectedResult:** `200` `{ data, canEdit }` envelope; `data` contains an event `{ "type": "position_change", "source": "system", "details": { "position": "Senior Engineer" } }` with `eventDate` = today's UTC date. (`canEdit === false` — Bob has no manual-mutation permission until Story 3.2.)
- **Test 2 — a no-op position edit writes nothing**
  - **inputURL:** `PATCH /users/:id` with body `{ "position": "Senior Engineer" }` again (unchanged), then `GET /users/:id/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; still exactly one `position_change` event in `data` — the second `PATCH` added none.
