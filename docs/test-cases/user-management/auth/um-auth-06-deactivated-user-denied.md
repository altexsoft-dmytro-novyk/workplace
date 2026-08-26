# UM-AUTH-06 · Deactivated user cannot establish a session via magic link

**Trace:** epics.md Story 2.2 · [DEC-UM-004](../../../architecture/user-management-test-decisions.md) · [DEC-UM-012](../../../architecture/user-management-test-decisions.md) (proposed — pending confirmation)

## Scenario

**Given** Colin has been deactivated (`isActive: false`) per `um-deact-01`.

**When** Colin requests a magic link for his `workEmail`, and separately, someone attempts to consume a token that was issued for that address before he was deactivated.

**Then** no usable session is established — deactivated accounts must not authenticate through the magic-link path. Per DEC-UM-012, the request side is enumeration-safe: a deactivated account's email is treated exactly like an unknown one, so the endpoint reveals nothing about deactivation status either.

**Preconditions:** [fixture](../README.md#canonical-personas); a magic-link token for `colin@company.example` was issued before deactivation (analogous to `um-auth-01`); Colin deactivated afterward, per `um-deact-01`.

## Test

- **Test 1 — request is enumeration-safe (DEC-UM-012, proposed)**
  - **inputURL:** `POST /auth/magic-link`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "" },
      "body": { "email": "colin@company.example" }
    }
    ```
  - **expectedResult:** `200`; same generic response shape as `um-auth-01`/`um-auth-02` (e.g. `{ "sent": true }`); **zero** email dispatch, asserted at the email-adapter fake in stage 2.
- **Test 2 — a pre-deactivation token must not yield a session**
  - **inputURL:** `POST /auth/magic-link/consume`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "" },
      "body": { "token": "<magic-link-token:colin-deactivated>" }
    }
    ```
  - **expectedResult:** `401` (or equivalent denial); no session/access token in body or `Set-Cookie` headers.
