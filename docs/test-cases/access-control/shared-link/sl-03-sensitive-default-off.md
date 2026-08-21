# AC-SL-03 · Sensitive sections off by default, explicit enable each time

**Trace:** §4.8 bullet 2 (S2, S5, S6, S8 excluded by default)

## Scenario

**Given** Bob creates several links for Alice over time.

**When** he creates one with defaults, one explicitly enabling Risks, then another with defaults.

**Then** sensitive sections are absent by default, the explicit opt-in works for that link only, and the next default link excludes them again — opting in is never sticky.

**Preconditions:** [fixture](../README.md)

## Test 1 — defaults exclude sensitive

- **inputURL:** `POST /share-links`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "employee": "alice"
    }
  }
  ```
- **expectedResult:** `201`; created link includes S1, **not** S2/S5/S6/S8

## Test 2 — explicit opt-in works

- **inputURL:** `POST /share-links`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "employee": "alice",
      "sections": [
        "s01",
        "s06"
      ]
    }
  }
  ```
- **expectedResult:** `201`; link includes S6

## Test 3 — opt-in is not sticky

- **inputURL:** `POST /share-links`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "employee": "alice"
    }
  }
  ```
- **expectedResult:** `201`; S6 **absent** again
