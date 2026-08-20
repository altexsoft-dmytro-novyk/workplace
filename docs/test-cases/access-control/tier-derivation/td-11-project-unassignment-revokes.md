# AC-TD-11 · Project assignment ends → derived Manager access ends

**Trace:** §2.1 consequence 5 (managerial access is not sticky) · §6 (stale cache = leak)

## Scenario

**Given** Dave sees Alice as a Manager only because she works on his project Phoenix.

**When** her Phoenix assignment ends while everything else stays unchanged.

**Then** his very next request gets the Colleague view — derived access dies with the relationship; nothing is cached.

**Preconditions:** [fixture](../README.md); Dave is DM of Phoenix, Alice works on Phoenix

## Test 1 — baseline: Manager view via the project

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; full Manager-line view (AC-TD-05)

## Test 2 — state change

- **stateChange:** Alice's Phoenix membership ends (Relationship row closed by the timetracker sync — project assignment has no API here); Dave's DM-of-Phoenix policy is left unchanged

## Test 3 — same token, access gone

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; **Colleague** view on the very next request — no cached Manager tier survives the unassignment
