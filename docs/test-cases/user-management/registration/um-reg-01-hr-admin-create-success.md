# UM-REG-01 · HR Admin creates a new hire

**Trace:** PRD FR-4 (HR Admin submits the registration form on the new hire's behalf) · PRD FR-2 (no password is ever stored) · PRD Data Model — `User` entity · requirements §3.2 (S1 identity card) · [api-conventions.md](../../../architecture/api-conventions.md) AD-14 shape 1 (`POST /users`)

## Scenario

**Given** Root, holder of the seeded HR Admin functional role, and no existing user carrying Nina's `workEmail`.

**When** Root submits the registration form for a new hire, Nina, with the full set of S1 identity-card fields.

**Then** a `User` row is created with `isActive: true` and the submitted values; `createdBy` is Root and `createdAt` is server-set, since both are audit columns the caller never supplies. No password or credential field appears in the response, and none is stored — FR-2 makes the magic link the sole login mechanism, so there is no credential for this endpoint to accept or persist.

**Preconditions:** [fixture](../README.md#canonical-personas); Root seeded with the HR Admin functional role; no user with `workEmail: nina.volkova@company.example`.

## Test

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Nina",
      "lastName": "Volkova",
      "position": "QA Engineer",
      "country": "Poland",
      "city": "Krakow",
      "workEmail": "nina.volkova@company.example",
      "companyJoinDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** `201`; body carries `id`, every submitted field at its submitted value, `isActive: true`, `createdBy: <rootId>`, a server-set `createdAt`, and `customFields: {}`. The omitted nullable columns (`photo`, `workPhone`, `birthDate`, `ttId`) are present and `null` — a genuinely empty field for an entitled audience, not a field hidden from this viewer, so the suite's absence-is-absence rule does not apply. No `password`, `passwordHash`, `credential`, or equivalent key appears anywhere in the body.
- **stateChange:** persistence is asserted against the datastore in stage 2, not through a follow-up read. `GET /users/:id` belongs to Story 1.2 and `GET /users` to Story 1.5; observing through either would make this story's suite unrunnable until those land. The same stage-2 check confirms the persisted row carries no credential column.
