# UM-SEED-02 · There is no `POST /users` single-create path

**Trace:** PRD FR-4 · requirements §4.17 (employee creation via API or UI is out of scope) · AD-14 (canonical router tree — resource root `/users`, no create) · AD-16 (seeded-population import replaces registration) · AD-21 (v1.5 brownfield cutover — `register-user.action.ts`, the `POST /users` handler, `create-user.dto.ts` create semantics, and `test/user-management/registration.e2e-spec.ts` `um-reg-01..15` are **retired in the same change** that adds the import path) · [seed README](README.md#the-import-operator-endpoint-settled-in-scenario--confirm-at-approval) (`POST /users/import` is the only population-creation path) · epics.md Story 1.1

## Scenario

**Given** the application is running after `db:seed`, `db:bootstrap:access-control`,
and the population import from `docs/Accounts_template.csv`.

**When** any client — including the seeded `hr-admin` (Root) session that holds
`user-management:create` — issues `POST /users` with a well-formed employee body.

**Then** no `User` row is created. The route is either **absent** from the router
tree (request resolves to `404`) or **permanently rejected** (`405`/`404` with a
leak-free body — no field names, counts, or fragments). There is no request
shape, permission, session, or feature flag that turns `POST /users` into a
create: the v1.5 population-creation path is `POST /users/import` (an idempotent
multipart upload, `um-seed-01`), not a single-row create. The retired
`registration/um-reg-01..15` HTTP-create suite and `RegisterUserAction` are
deleted, not extended (AD-21).

> **Absence is not denial.** Whichever disposition the implementation picks
> (route removed vs. present-and-rejecting) it MUST be the *same* for an
> authenticated `hr-admin` session as for an unrelated session — the missing
> create capability must not read as a permission `403`, because that would imply
> a create path exists behind more permission.

**Preconditions:** [fixture](../README.md#canonical-personas); running app;
population import completed; Root holds the `hr-admin` FR grant chain; Colin is an
unrelated active seeded `User` with no FR policy.

## Test

- **Test 1 — `hr-admin` (Root) session**
  - **inputURL:** `POST /users`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<root-uuid>>" },
      "body": { "firstName": "Nina", "lastName": "Volkova", "position": "QA Engineer", "country": "Poland", "city": "Krakow", "workEmail": "nina.volkova@company.example", "companyJoinDate": "2026-09-01" }
    }
    ```
  - **expectedResult:** `404` or `405`, leak-free body. A follow-up datastore
    check shows no `users` row for `nina.volkova@company.example`.
- **Test 2 — unrelated active session**
  - **inputURL:** `POST /users`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<colin-uuid>>" }, "body": { <same body as Test 1> } }`
  - **expectedResult:** identical status and body shape to Test 1 — the outcome
    does not vary by session, and in particular is **not** `403`.
