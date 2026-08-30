# UM-REL-01 · Holder of the dedicated permission changes an employee's manager

**Trace:** epics.md Story 4.1 · FR-10 · spine AD-5, AD-7, AD-25

## Scenario

**Given** Alice reports to Bob, and Root holds the *change organisational relationships* permission.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ field: 'manager', value: <ninaId> }`.

**Then** the response is `200`, Alice's `direct` `Relationship` edge now points at Nina (Bob's old edge is gone, replaced — not a second row), and a `RelationshipJournal` row records `actor: Root`, `subjectUserId: Alice`, `fieldType: 'manager'`, `beforeValue: <bobId>`, `afterValue: <ninaId>`.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice reports to Bob (`direct` edge).

## Test

- **Test 1 — baseline: Alice reports to Bob**
  - **inputURL:** `GET /users/<aliceId>` (S1 aggregate)
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`.
- **Test 2 — the change**
  - **inputURL:** `POST /users/<aliceId>/relationships`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Root>" },
      "body": { "field": "manager", "value": "<ninaId>" }
    }
    ```
  - **expectedResult:** `201`; body `{ field: "manager", value: "<ninaId>" }`.
- **Test 3 — observing the new reporting-line access on the next request**
  - **inputURL:** `GET /users/<aliceId>/events` as Nina
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Nina>" } }`
  - **expectedResult:** `200` — Nina, now Alice's direct manager, has S9 read access where Bob no longer does (stage-2 asserts Bob's equivalent probe now denies).
