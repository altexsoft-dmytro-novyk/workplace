# UM-PF-04 · Setting ttId to a value already in use is rejected

**Trace:** database-schema.md `User.ttId` (unique) · AD-13 (external identity field) · epics.md Story 1.2 (second AC)

> **Scope (v1.5).** Entitlement is Epic 0's (`access-control-adoption/`). This
> file asserts **data correctness**: the `ttId` write is rejected on the
> uniqueness conflict (`409`) and the row is unchanged. Alice/Colin are
> **seeded** (Story 1.1); stage 2 resolves ids from the seeded fixture id table,
> never a hardcoded literal.

## Scenario

**Given** Bob, Alice's unit manager, and Colin, an existing user already carrying `ttId: "tt-1042"`.

**When** Bob attempts to set Alice's `ttId` to `"tt-1042"`.

**Then** the write is rejected on the uniqueness constraint; Alice's `ttId` is unchanged.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin seeded with `ttId: "tt-1042"`; Alice seeded with `ttId: null`.

## Test

- **inputURL:** `PATCH /users/<aliceId>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": { "ttId": "tt-1042" }
  }
  ```
- **expectedResult:** `409`; a follow-up `GET /users/<aliceId>` shows `ttId: null`, unchanged.
