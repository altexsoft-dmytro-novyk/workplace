# UM-REG-05 · Registration does not establish a session

**Trace:** PRD FR-3 ("Completing the registration form does not log the user in directly — it triggers the same magic-link email used for every subsequent login. There is no separate invite-link mechanism.")

## Scenario

**Given** Root, holder of the HR Admin functional role, and Tomas, a new hire who does not yet exist.

**When** Root creates Tomas and the creation succeeds.

**Then** nothing in the response establishes a session for Tomas: no token in the body and no session cookie in the response headers. Exactly one magic-link dispatch fires, to Tomas's `workEmail` — the same flow he will use for every later login, not a separate invite link.

Both halves of the session assertion matter. A body-only check cannot see `Set-Cookie`, which is a response header and never appears in a body, so an implementation that logs the new hire in via cookie would pass a body-only assertion unnoticed.

This case uses its own persona rather than UM-REG-01's Nina so that the two are independent: sharing one persona and `workEmail` would make whichever case ran second collide with the row the first one created, under a precondition both declare as "no existing user".

**Preconditions:** [fixture](../README.md#canonical-personas); no user with `workEmail: tomas.nowak@company.example`.

## Test 1 — creation returns no session

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Tomas",
      "lastName": "Nowak",
      "position": "Backend Engineer",
      "country": "Poland",
      "city": "Gdansk",
      "workEmail": "tomas.nowak@company.example",
      "companyJoinDate": "2026-09-15"
    }
  }
  ```
- **expectedResult:** `201` with the created `User` representation only. The body contains no `accessToken`, `sessionToken`, `refreshToken`, or equivalent. The **response headers** contain no `Set-Cookie` — asserted on the headers, not the body. Root's own session is unaffected and is still the session the request was made under.
- **stateChange:** the magic-link dispatch is an outbound side effect with no HTTP surface of its own. Stage 2 asserts it at the email-adapter fake: called **exactly once**, with `tomas.nowak@company.example`. Cardinality is part of the assertion — a second dispatch means the new hire receives two live login links.
