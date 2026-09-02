# UM-SEED-11 · Import with a missing/invalid/unresolved session → `401`, nothing written

**Trace:** [../README.md](../../README.md) global 401 rule (every endpoint rejects a missing/invalid token with `401`) · [access-control.md](../../../architecture/access-control.md) denial conventions · [seed README](README.md#the-import-operator-endpoint-settled-in-scenario--confirm-at-approval) (`POST /users/import` is an authenticated operator command) · epics.md Story 1.1

## Scenario

**Given** the application is running after `db:seed`,
`db:bootstrap:access-control`, and an initial population import.

**When** `POST /users/import` is called with a well-formed multipart CSV but
without a usable session:

1. **no `Authorization` header** at all;
2. a **malformed / garbage** bearer token;
3. a **syntactically valid token that resolves to no principal** (no session can
   be established — e.g. a token for a `User` id that does not exist).

**Then** each request is **`401`** with a leak-free body, and **nothing is
written**. The session check runs **before** the capability gate, so an
unauthenticated caller never reaches `isAllowed` and the response is `401`, not
`403` — absence of a session is distinct from absence of a permission
(`um-seed-10`).

**Preconditions:** [fixture](../README.md#canonical-personas); running app;
initial import completed.

## Test

- **Test 1 — no token**
  - **inputURL:** `POST /users/import`
  - **inputRequest:**
    ```json
    {
      "headers": { "content-type": "multipart/form-data" },
      "body": "<multipart; one file part: file=seed-basic.csv>"
    }
    ```
  - **expectedResult:** `401`, leak-free body; datastore unchanged (no new
    `users` / `department` / `user_events` rows).
- **Test 2 — malformed token**
  - **inputRequest header:** `{ "authorization": "Bearer not-a-real-token", "content-type": "multipart/form-data" }`, same body.
  - **expectedResult:** `401`; datastore unchanged.
- **Test 3 — valid-shape token, unresolved principal**
  - **inputRequest header:** `{ "authorization": "Bearer <token:<nonexistent-uuid>>", "content-type": "multipart/form-data" }`, same body.
  - **expectedResult:** `401` (no session established); datastore unchanged.
