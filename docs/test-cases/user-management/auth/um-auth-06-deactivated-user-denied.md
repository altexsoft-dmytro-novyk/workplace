# UM-AUTH-06 · Deactivated user cannot establish a session via magic link

**Trace:** epics.md Story 2.2 · [DEC-UM-004](../../../architecture/user-management-test-decisions.md)

## Scenario

**Given** Colin has been deactivated (`isActive: false`) per `um-deact-01`.

**When** Colin requests a magic link for his `workEmail` and attempts to consume a token issued for that address.

**Then** no usable session is established — deactivated accounts must not authenticate through the magic-link path.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin deactivated before this scenario runs.

## Test

- **Test 1 — request (if permitted by product rules)**
  - **inputURL:** `POST /auth/magic-link`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "" },
      "body": { "email": "colin@company.example" }
    }
    ```
  - **expectedResult:** Denial appropriate to approved security rules — e.g. same enumeration-safe `200` with **zero dispatch**, or explicit `401`/`403` if product records deactivated denial at request time. Stage 2 must assert **no session** results from the full flow.
- **Test 2 — consume must not yield session**
  - **inputURL:** `POST /auth/magic-link/consume`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "" },
      "body": { "token": "<magic-link-token:colin-deactivated>" }
    }
    ```
  - **expectedResult:** `401` (or equivalent denial); no session/access token in body or `Set-Cookie` headers.
