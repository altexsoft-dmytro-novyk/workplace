# AC-SL-02 · S3, S7, S13 (and S14) can never be shared

**Trace:** §4.8 bullet 2 · §3.2 shared-link column `—` (S14 per matrix; spec OQ6)

## Scenario

**Given** Bob manages Alice.

**When** he tries to include emergency contacts, management notes, mentorship, or action items in a link.

**Then** every attempt is rejected and no link is created — those sections are never shareable, no matter who asks.

**Preconditions:** [fixture](../README.md)

## Test 1 — S3

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
        "s03"
      ]
    }
  }
  ```
- **expectedResult:** `4xx` rejected; no link created

## Test 2 — S7

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
        "s07"
      ]
    }
  }
  ```
- **expectedResult:** `4xx` rejected; no link created

## Test 3 — S13

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
        "s13"
      ]
    }
  }
  ```
- **expectedResult:** `4xx` rejected; no link created

## Test 4 — S14

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
        "s14"
      ]
    }
  }
  ```
- **expectedResult:** `4xx` rejected; no link created
