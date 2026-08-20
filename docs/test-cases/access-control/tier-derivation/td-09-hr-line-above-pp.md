# AC-TD-09 · PP tier extends up the HR line above the assigned PP

**Trace:** §3.1 PP audience (assigned people partner **and the HR line above them**)

## Scenario

**Given** Hana manages Paula, who is Alice's assigned PP; Hana has no direct relation to Alice.

**When** Hana opens Alice's profile.

**Then** the PP audience includes the HR line above the assigned partner, so Hana sees exactly what Paula sees.

**Preconditions:** [fixture](../README.md); Hana holds no direct relation to Alice; Paula reports to Hana

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:hana>"
    }
  }
  ```
- **expectedResult:** `200`; PP view — same section set Paula receives (AC-TD-08)
