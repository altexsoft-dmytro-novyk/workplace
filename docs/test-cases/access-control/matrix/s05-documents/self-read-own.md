# AC-M-S05-01 · S5 Documents — Self: read own documents

**Trace:** §3.2 S5 / Self `R (own)`
**Preconditions:** [fixture](../../README.md); Alice's S5 holds documents of several types

## Test

- **inputURL:** `GET /users/alice/sections/s05`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; her own document list: contract, W8, cooperation form, Diia City, CV, joining interview feedback, certificates
