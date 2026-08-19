# AC-UR-09 · One permission grants exactly its own feature, nothing adjacent

**Trace:** §2.3 (permissions independently grantable: campaigns, action items, risks, resourcing, mentors, CDS, custom fields, dashboards)
**Preconditions:** [fixture](../../README.md); Ida's role holds *create form campaigns* only (positive case: AC-UR-07)

## Test 1 — adjacent feature 1

- **inputURL:** `POST /action-items`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:ida>"
    },
    "body": {
      "assignee": "colin",
      "title": "X",
      "dueDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; nothing created

## Test 2 — adjacent feature 2

- **inputURL:** `POST /resourcing/requests`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:ida>"
    },
    "body": {
      "vacancy": "QA",
      "workload": "1.0"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; nothing created
