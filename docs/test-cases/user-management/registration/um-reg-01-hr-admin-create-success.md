# UM-REG-01 · HR Admin creates a new hire

**Trace:** PRD FR-1..FR-3 (registration/auth scope) · requirements §10 (pre-onboarding is out of scope — this is day-one creation, not ATS pre-boarding)

## Scenario

**Given** Root, holder of the seeded HR Admin functional role.

**When** Root submits the registration form for a new hire, Nina, with her S1-identity-card fields.

**Then** a `User` record is created for Nina with `isActive: true` and the fields as submitted; the response does not include a password or any credential — none is ever stored (FR-2).

**Preconditions:** [fixture](../README.md#canonical-personas); Root seeded with the HR Admin functional role; no existing user with Nina's `workEmail`.

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
- **expectedResult:** `201`; body includes `id`, `isActive: true`, and the submitted fields; no `password` or credential field present anywhere in the body.
