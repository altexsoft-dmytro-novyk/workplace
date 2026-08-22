# AC-TD-10 · One viewer, different tier per target, one session

**Trace:** §2.1 consequence 4 (access is evaluated relationship-by-relationship)

## Scenario

**Given** Bob manages Alice, is the assigned PP of Colin, and has no relationship to Eve.

**When** he opens all three profiles in one session with one token.

**Then** each response is tiered independently — Manager view of Alice, PP view of Colin, Colleague view of Eve; access is per relationship, not per session.

**Preconditions:** [fixture](../README.md); Bob is additionally the assigned PP of Colin; same session token for all three requests

## Test 1 — Manager tier over report

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; Manager-line view (reports-to)

## Test 2 — PP tier over assignee

- **inputURL:** `GET /users/colin`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; PP view (assignment)

## Test 3 — Colleague tier over unrelated

- **inputURL:** `GET /users/eve`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; Colleague view — only `s01`, `s10`, `s11` (name only)
