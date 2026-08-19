# AC-UR-06 · Assign a person to a role through the UI

**Trace:** §2.3 bullet 2 (people are assigned to functional roles through the UI)
**Preconditions:** [fixture](../../README.md); Ida holds no role; role IT Campaigns exists with *create form campaigns*

## Test 1 — baseline: feature denied without the role

- **inputURL:** `POST /campaigns`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:ida>"
    },
    "body": {
      "title": "Security awareness",
      "link": "https://forms.example/x",
      "dueDate": "2026-09-15"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; nothing created

## Test 2 — assign the role

- **inputURL:** `POST /users/roles/it-campaigns/members`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:root>"
    },
    "body": {
      "userId": "ida"
    }
  }
  ```
- **expectedResult:** `200`; Ida is a member

## Test 3 — feature works on the next request

- **inputURL:** `POST /campaigns`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:ida>"
    },
    "body": {
      "title": "Security awareness",
      "link": "https://forms.example/x",
      "dueDate": "2026-09-15"
    }
  }
  ```
- **expectedResult:** `201`; campaign created — assignment effective immediately, same session token
