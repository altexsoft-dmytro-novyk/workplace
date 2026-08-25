# UM-REG-14 · Birthday day and month persist together on create

**Trace:** [database-schema.md](../../../architecture/database-schema.md) `User.birthDay`/`User.birthMonth` · PRD Data Model — User entity · requirements §3.2 (S1 "birthday (day and month)")

## Scenario

**Given** Root, holder of the HR Admin functional role.

**When** Root submits a registration payload that includes both `birthDay` and `birthMonth` set to valid values, alongside every other required S1 field.

**Then** the response reflects both values exactly as submitted. No year is captured, invented, or redacted for any audience — the pair persists as an ordinary pair of scalar columns. This is the positive complement to `um-reg-01`, which only proves the omitted-and-null case; nothing elsewhere in the suite exercises a create where these fields are actually populated.

**Preconditions:** [fixture](../README.md#canonical-personas); no user with `workEmail: greta.lindqvist@company.example`.

## Test

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Greta",
      "lastName": "Lindqvist",
      "position": "QA Engineer",
      "country": "Poland",
      "city": "Krakow",
      "workEmail": "greta.lindqvist@company.example",
      "companyJoinDate": "2026-09-01",
      "birthDay": 15,
      "birthMonth": 3
    }
  }
  ```
- **expectedResult:** `201`; body carries `birthDay: 15` and `birthMonth: 3` exactly as submitted, alongside the rest of the created record.
- **stateChange:** persistence is asserted against the datastore in stage 2, consistent with the rest of this story's scenarios — Story 1.1 builds no read endpoint to observe this through.
