# AC-TD-06 · Manager tier via PM project attachment

**Trace:** §2.1 relation 2, consequence 3 · §3.3.2
**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:pete>"
    }
  }
  ```
- **expectedResult:** `200`; Manager-line view for every section **except S7**, where Pete is a flag-gated reader (AC-M-S07 group) — the single documented exception
