# AC-SF-03 · All Employees list returns per-row what the viewer's tier allows

**Trace:** §4.1 · §3.3.1 (not a search result)

## Scenario

**Given** the list is configured with name, grade and risk-level columns.

**When** Bob (manager of Alice, colleague of Eve) and Colin each request it.

**Then** each row carries only what that viewer's tier over that person allows — Bob gets grades and risks for his own people only, Colin gets names only.

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
