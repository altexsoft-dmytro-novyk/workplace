# UM-SEED-02 · There is no `POST /users` create path

**Trace:** PRD FR-4 · requirements §4.17 · AD-14 / AD-16 (Seeded-population import) · epics.md Story 1.1 · SPEC-user-management-access-control-adoption Non-goals ("retiring `POST /users` is UM Epic 1 / AD-16")

## Scenario

**Given** the application is running after seed, bootstrap, and the population
import from `docs/Accounts_template.csv`.

**When** any client — including the seeded HR-Admin session — issues `POST /users`
with a well-formed employee body.

**Then** no `User` row is created. The route is either absent from the router tree
(request resolves to `404`) or permanently rejected (`405`/`404` with a leak-free
body); there is no request shape, permission, or session that turns it into a
create. Employee creation via API or UI is out of scope (§4.17); the CAP-1
`registration/um-reg-01..15` HTTP-create suite is retired.

> **v1.5 note.** Whichever disposition the implementation picks (route removed
> vs. route present-and-rejecting), it must be the *same* for an authenticated
> HR-Admin session as for an unrelated session — absence of a create capability
> is not a permission denial and must not read as one.

**Preconditions:** [fixture](../README.md#canonical-personas); running app; population import completed.

## Test

- **Test 1 — HR-Admin session**
  - **inputURL:** `POST /users`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<root-uuid>>" },
      "body": { "firstName": "Nina", "lastName": "Volkova", "position": "QA Engineer", "country": "Poland", "city": "Krakow", "workEmail": "nina.volkova@company.example", "companyJoinDate": "2026-09-01" }
    }
    ```
  - **expectedResult:** `404` or `405`; no `user` row exists for `nina.volkova@company.example` on a follow-up datastore check.
- **Test 2 — unrelated active session**
  - **inputURL:** `POST /users`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<colin-uuid>>" }, "body": { ... same body ... } }`
  - **expectedResult:** identical status and body shape to Test 1 — the outcome does not vary by session.
