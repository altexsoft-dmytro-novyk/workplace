# AC-SF-03 · All Employees list returns per-row what the viewer's tier allows

**Trace:** §4.1 · §3.3.1 (not a search result)
**Preconditions:** [fixture](../README.md)

## Test 1 — mixed tiers, per-row

- **inputURL:** `GET /users?columns=name,grade,riskLevel`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; Alice's row: all three values; Eve's row: name only — `grade`/`riskLevel` keys absent for that row

## Test 2 — colleague

- **inputURL:** `GET /users?columns=name,grade,riskLevel`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; no `grade` or `riskLevel` key on any row
