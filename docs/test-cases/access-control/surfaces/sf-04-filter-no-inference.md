# AC-SF-04 · Filtering must not let a viewer infer a value they cannot see

**Trace:** §3.3.5 · §3.3.1

## Scenario

**Given** a management-visibility custom field and risk levels carry values Colin cannot see.

**When** Colin filters the list by those hidden values, and Bob filters by risk level.

**Then** Colin's filters must not narrow the result — a narrowed list would reveal values row by row; Bob's filter narrows only within the people he actually manages.

**Preconditions:** [fixture](../README.md); custom field `visa-status` (visibility *management*) has values on several employees

## Test 1 — hidden custom field

- **inputURL:** `GET /users?filter[visa-status]=expired`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `4xx` rejected **or** filter ignored with the unfiltered result — never a narrowed result set

## Test 2 — hidden section field

- **inputURL:** `GET /users?filter[riskLevel]=high`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** same: no narrowed result

## Test 3 — entitled viewer narrows only within scope

- **inputURL:** `GET /users?filter[riskLevel]=high`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; rows narrow **only within** the set Bob holds Manager/PP tier over — colleague-tier people neither match nor leak
