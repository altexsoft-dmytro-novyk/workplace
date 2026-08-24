# UM-REG-02 · Create user without a session

**Trace:** PRD FR-4 (registration is an authenticated HR Admin action) · global 401 rule (see [../README.md](../README.md))

## Scenario

**Given** a caller presenting no session token.

**When** that caller submits an otherwise valid registration payload.

**Then** the request is rejected with `401` before any permission or entity logic runs, and no `User` row is created. The body carries no detail that would let a caller tell this apart from a request that would have been denied on permissions — the endpoint reveals nothing about who may create users or about the payload it was handed.

The payload below is complete and valid, so `401` can only be the answer to the missing session — a partial payload would let a validation failure stand in for the authentication check and the case would pass for the wrong reason.

**Preconditions:** [fixture](../README.md#canonical-personas); no user with `workEmail: nina.volkova@company.example`.

## Test 1 — unauthenticated create is rejected

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
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
- **expectedResult:** `401`; the body names no field, role, permission, or persona, and is byte-identical in shape to the `401` any other endpoint returns for a missing token.

## Test 2 — observe that nothing was created

- **inputURL:** `GET /users?filter[workEmail]=nina.volkova@company.example`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" }
  }
  ```
- **expectedResult:** `200` with an empty result set — no `User` row exists for that address.
