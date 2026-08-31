# UMAC-04 · Colleague / unrelated session reads a profile → 403 (temporary two-state outcome)

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read, two-state colleague rule) + CAP-3 · `um-integration-contract-response.md` Q3 (`colleague` → deny now / allow-narrowed later), Q4 (`403` as a symptom, not a settled convention) · PRD FR-16 + FR-17 (the trigger) · access-control.md §3.3.4 (colleague whitelist)

## Scenario

**Given** the port is rebound; V and T are active seeded `User` rows with **no**
`Relationship` edge between them and V is not T (V's Phase-0 audience over T is the
`colleague` floor only).

**When** V calls `GET /users/<T>`.

**Then** the response is **`403`** — and this deny is recorded **explicitly as the
temporary consequence of the two-state colleague rule**, not as intended
end-state behaviour.

> **Two-state rule — do not harden this `403`.** `colleague → deny` is correct
> **only while `GET /users/:id` returns the whole `User` row**. §3.3.4 says a
> colleague legitimately sees S1, S10 dates, and S11 project name — they are
> meant to be **narrowed**, not refused. The durable outcome is `200` with a
> §3.3.4-narrowed body. The trigger that flips it: the deferred **Profile
> Projection** story (FR-17, `deferred-work.md`, "Profile Projection" entry)
> reaches `stage-3-production` and `toUserResponse` no longer spreads the whole
> row. On that event — and not before — adoption story `UMAC-3` runs its own
> three AD-1 stages to change the adapter's READ branch (`colleague` → allow) and
> the projection narrows the body. The E2E for this scenario asserts `403` today
> with an inline comment naming that trigger.

A genuinely unrelated *field* route for a colleague (e.g. `GET
/users/:id/personal-contacts`, S2, absent from the whitelist) is the real `404`
case and is out of this slice's scope.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V and T active seeded rows; no `Relationship` edge either direction; V ≠ T; the port is rebound.

## Test

- **inputURL:** `GET /users/<T-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<V-uuid>>" } }
  ```
- **expectedResult:** `403`, leak-free body (no field names, counts, or fragments). Recorded as the temporary two-state outcome; the durable expectation is `200`-narrowed once Profile Projection lands (`UMAC-3`).
