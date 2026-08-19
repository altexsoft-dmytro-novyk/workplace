# AC-SF-04 · Filtering must not let a viewer infer a value they cannot see

**Trace:** §3.3.5 · §3.3.1
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
- **expectedResult:** `4xx` rejected **or** filter ignored with the unfiltered result — never a narrowed result set (which would leak values row by row)

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
