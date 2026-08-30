# UM-REL-09 · A conflicting concurrent manager reassignment returns 409

**Trace:** epics.md Story 4.1 · spine AD-5 ("a conflicting concurrent write returns `409`")

## Scenario

**Given** Alice reports to Bob, and Root holds the *change organisational relationships* permission.

**When** Root submits `POST /users/<aliceId>/relationships` naming Bob as the `expectedCurrent` manager, but a different actor has already reassigned Alice to Nina moments earlier (so the locked current holder is Nina, not Bob).

**Then** the request is rejected with `409` — the CAS compare-and-swap fails on the stale `expectedCurrent` — and Alice's manager remains whatever the first, successful write set it to (Nina), never silently overwritten by the second, stale request.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice reports to Bob.

## Test

- **Test 1 — the first write wins, changing the current holder to Nina**
  - **inputURL:** `POST /users/<aliceId>/relationships`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Root>" },
      "body": { "field": "manager", "value": "<ninaId>", "expectedCurrent": "<bobId>" }
    }
    ```
  - **expectedResult:** `200`.
- **Test 2 — the second write, still assuming the pre-Test-1 state, is rejected**
  - **inputURL:** `POST /users/<aliceId>/relationships`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Root>" },
      "body": { "field": "manager", "value": "<tomasId>", "expectedCurrent": "<bobId>" }
    }
    ```
  - **expectedResult:** `409`.
- **Test 3 — observing the manager is still Nina, not Tomas**
  - **inputURL:** `POST /users/<aliceId>/relationships`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Root>" },
      "body": { "field": "manager", "value": "<ninaId>", "expectedCurrent": "<ninaId>" }
    }
    ```
  - **expectedResult:** `200` — `expectedCurrent: "<ninaId>"` matches, proving Nina was still the current holder going into this request.
