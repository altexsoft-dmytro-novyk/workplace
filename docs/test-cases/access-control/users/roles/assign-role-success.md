# AC-UR-06 · Assign a person to a role through the UI

**Trace:** §2.3 bullet 2 (people are assigned to functional roles through the UI)

## Scenario

**Given** Ida holds no functional role and the role IT Campaigns exists.

**When** she first tries to create a campaign, Root then assigns her to the role, and she retries with the same token.

**Then** the first attempt fails 403, the assignment succeeds, and the retry succeeds — the assignment takes effect immediately.

**Preconditions:** [fixture](../../README.md); Ida holds no role yet; role IT Campaigns exists with *create form campaigns*

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

- **inputURL:** `POST /users/ida/policies`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:root>"
    },
    "body": {
      "type": "FR",
      "targetType": "user",
      "targetId": "ida",
      "targetRole": "it-campaigns"
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
- **expectedResult:** `201`; campaign created — same session token
