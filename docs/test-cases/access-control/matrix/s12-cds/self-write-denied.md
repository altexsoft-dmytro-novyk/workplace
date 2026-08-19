# AC-M-S12-02 · S12 CDS — Self: no writes beyond the IDP checkbox

**Trace:** §3.2 S12 / Self `R` · §4.10 (authoring is Manager/PP)
**Preconditions:** [fixture](../../README.md)

## Test 1 — assessment conclusion

- **inputURL:** `PATCH /users/alice/assessments/{id}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "conclusion": "…"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged

## Test 2 — IDP authoring

- **inputURL:** `POST /users/alice/idps`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "description": "…",
      "deadline": "2026-12-01"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; nothing created
