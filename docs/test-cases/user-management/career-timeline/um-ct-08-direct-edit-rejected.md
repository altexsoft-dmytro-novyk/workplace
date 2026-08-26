# UM-CT-08 · Direct edit of a career-timeline event is rejected

**Trace:** PRD Data Model — UserEvents ("An event is an immutable fact — a correction soft-deletes the wrong entry and appends a new one, never an in-place edit") · requirements §4.9 ("to correct events the system inferred wrongly")

## Scenario

**Given** Bob, Alice's unit manager, and an existing `UserEvents` row on Alice's timeline (`um-ct-04`).

**When** Bob attempts to edit that event directly via `PATCH`, rather than the soft-delete-and-append correction flow.

**Then** the request is rejected and the event's stored fields are unchanged. There is no in-place edit path for a `UserEvents` row — `um-ct-05` is the only sanctioned way to correct one, by soft-deleting the wrong entry and appending a new one.

**Preconditions:** [fixture](../README.md#canonical-personas); the event from `um-ct-04` exists on Alice's timeline, undeleted.

## Test

- **Test 1 — the rejected write**
  - **inputURL:** `PATCH /users/<aliceId>/events/<eventIdFromUmCt04>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Bob>" },
      "body": { "details": { "note": "direct edit attempt" } }
    }
    ```
  - **expectedResult:** `404` or `405` (no route bound to `PATCH` on this resource) — not `200`, and not a silently-accepted edit.
- **Test 2 — observing the event is untouched**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; the event from `um-ct-04` is present with its original fields — no field reflects Test 1's attempted `details`.
