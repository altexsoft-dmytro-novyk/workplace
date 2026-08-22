# AC-UR-10 · Removing a permission takes effect immediately for every holder

**Trace:** §2.3 last bullet

## Scenario

**Given** Ida and Colin both hold the IT Campaigns role and their sessions stay open.

**When** Root removes the campaign permission from the role between Ida's two attempts.

**Then** her first attempt succeeds; her next attempt and Colin's both fail 403 immediately — revocation hits every holder with no grace period.

**Preconditions:** [fixture](../../README.md); Ida **and** Colin both hold role IT Campaigns (*create form campaigns*); session tokens unchanged throughout

## Test 1 — baseline: permission works

- **inputURL:** `POST /campaigns`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:ida>"
    },
    "body": {
      "title": "Q3 survey",
      "link": "https://forms.example/y",
      "dueDate": "2026-10-01"
    }
  }
  ```
- **expectedResult:** `201`; campaign created

## Test 2 — admin removes the permission from the role

- **inputURL:** `PATCH /roles/it-campaigns/permissions`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:root>"
    },
    "body": {
      "remove": [
        "create form campaigns"
      ]
    }
  }
  ```
- **expectedResult:** `200`; the role no longer carries the permission

## Test 3 — first holder blocked on the very next request

- **inputURL:** `POST /campaigns`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:ida>"
    },
    "body": {
      "title": "Q4 survey",
      "link": "https://forms.example/z",
      "dueDate": "2026-11-01"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; nothing created — no grace period, no cached grant

## Test 4 — every other holder blocked too

- **inputURL:** `POST /campaigns`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "title": "X",
      "link": "https://forms.example/x",
      "dueDate": "2026-11-01"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; nothing created — revocation hits everyone holding the role
