# AC-SL-09 · Link is revocable before expiry

**Trace:** §4.8 bullet 5
**Preconditions:** [fixture](../README.md); Bob created a 24h link for Alice; Dave holds the token, no Manager/PP relation to Alice

## Test 1 — baseline: link works

- **inputURL:** `GET /share/{token}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; enabled sections returned

## Test 2 — creator revokes the link

- **inputURL:** `DELETE /share-links/{id}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; link revoked

## Test 3 — link dead on the very next request

- **inputURL:** `GET /share/{token}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `4xx`; no section data in the body
