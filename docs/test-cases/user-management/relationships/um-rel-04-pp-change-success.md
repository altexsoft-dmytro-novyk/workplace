# UM-REL-04 · Holder of the dedicated permission changes an employee's People Partner

**Trace:** epics.md Story 4.2 · FR-10 · spine AD-5 ("Implementation gate resolved" note)

## Scenario

**Given** Alice is assigned to Paula as People Partner, and Root holds the *change organisational relationships* permission.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ field: 'people_partner', value: <ninaId> }`.

**Then** the response is `200`, Alice's `people_partner` edge now points at Nina (replacing Paula's — same CAS shape as reports-to), and the journal records `fieldType: 'people_partner'`, `beforeValue: <paulaId>`, `afterValue: <ninaId>`.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice is assigned to Paula (`people_partner` edge).

## Test

- **Test 1 — the change**
  - **inputURL:** `POST /users/<aliceId>/relationships`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Root>" },
      "body": { "field": "people_partner", "value": "<ninaId>" }
    }
    ```
  - **expectedResult:** `201`; body `{ field: "people_partner", value: "<ninaId>" }`.
- **Test 2 — Paula's PP access to Alice has ended, on the next request**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Paula>" },
      "body": { "type": "manual_backfill", "eventDate": "2024-01-01", "details": {} }
    }
    ```
  - **expectedResult:** `403` or `404` — Paula is no longer Alice's PP, so the AD-26 direct-PP manual-write gate no longer admits her.
