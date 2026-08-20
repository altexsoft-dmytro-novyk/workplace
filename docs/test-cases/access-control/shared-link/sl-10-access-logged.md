# AC-SL-10 · Every access via the link is logged: when, from where

**Trace:** §4.8 bullet 4

## Scenario

**Given** Dave opens Bob's link twice, from two different network addresses.

**When** Bob reads the link's access log.

**Then** it lists exactly two entries, each with its timestamp and origin address.

**Preconditions:** [fixture](../README.md); Bob created a link for Alice; Dave holds the token

## Test 1 — first access, source address A

- **inputURL:** `GET /share/{token}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200` (request originates from source address A)

## Test 2 — second access, source address B

- **inputURL:** `GET /share/{token}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200` (request originates from source address B)

## Test 3 — creator reads the access log

- **inputURL:** `GET /share-links/{id}/accesses`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; exactly 2 entries, each with its timestamp and source address (A and B)
