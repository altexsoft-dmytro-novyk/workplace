# UM-REG-03 · Create user without the user-creation permission

**Trace:** requirements §2.3 (functional-role permissions are granular and independently grantable) · PRD FR-4 (registration is HR-Admin-gated)

## Scenario

**Given** Ida, an authenticated employee holding the custom functional role *IT Campaigns*, whose only permission is *create form campaigns*.

**When** Ida submits a registration payload for a new hire.

**Then** the request is denied with `403` and no `User` row is created. Ida holds a functional role, just not this permission — §2.3 requires feature permissions to be independently grantable, so passing the gate must depend on holding user creation specifically, never on holding some role.

Ida rather than a role-less persona is deliberate: a role-less caller would also be denied by an implementation that waves through any functional-role holder, so that variant cannot detect the failure this case exists to catch. Access-control's `users/roles/permissions-are-independent.md` is specified to prove the granularity rule itself (per `SPEC-access-control-test-cases`), but that suite is not yet authored on disk (see the user-management README's Scope note) — until it exists, this case is this endpoint's only proof that the granularity rule holds.

**Preconditions:** [fixture](../README.md#canonical-personas); Ida holds role *IT Campaigns* with the single permission *create form campaigns* and no HR Admin role; no user with `workEmail: nina.volkova@company.example`.

## Test

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Ida>" },
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
- **expectedResult:** `403`; the body names no permission, role, or field.
- **stateChange:** absence of a `User` row for that address is asserted against the datastore in stage 2, since Story 1.1 builds no read endpoint to observe it through.
