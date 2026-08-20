# AC-SL-11 · Only a Manager/PP of the employee can create a link for them

**Trace:** §4.8 opening (a **manager** generates the shareable view)

## Scenario

**Given** Colin is a plain colleague of Alice, and Alice is the profile owner herself.

**When** each of them tries to create a share link for Alice's profile.

**Then** both get 403 — only someone holding Manager/PP access can share a profile, and self-sharing is not in §4.8.

**Preconditions:** [fixture](../README.md)

## Test 1 — colleague

- **inputURL:** `POST /share-links`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "employee": "alice"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; no link created — colleague tier cannot share what it cannot see

## Test 2 — the employee themselves

- **inputURL:** `POST /share-links`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "employee": "alice"
    }
  }
  ```
- **expectedResult:** `403 Forbidden` — flag to requirements owner if self-sharing is wanted
