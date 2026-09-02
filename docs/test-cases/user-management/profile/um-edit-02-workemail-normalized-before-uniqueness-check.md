# UM-EDIT-02 · `PATCH` normalizes `workEmail` (`trim().toLowerCase()`) before the uniqueness check

**Trace:** [DEC-UM-007](../../../architecture/user-management-test-decisions.md#dec-um-007--workemail-normalization-oq2--kept-reconciled-to-kernel-reality) (trim + lowercase before validation, storage, lookup, and **uniqueness comparison**; identity canonical *at write* — the writer stores the normalized value) · [database-schema.md](../../../architecture/database-schema.md) §User (`workEmail` unique, normalized-stored) · epics.md Story 1.2 · Epic 1 context ("`workEmail` normalized on write before the uniqueness check, consistent with the import writer")

> **Scope (v1.5).** Entitlement is Epic 0's. This file asserts **data
> correctness**: normalization is applied to `workEmail` on the edit path and it
> happens **before** the uniqueness comparison, so a value that only collides
> *after* normalization is still rejected. Blocked past Stage 1 on the
> `user-management:edit` seed (see [README](README.md) / Deliverable A).

## Scenario

**Given** Alice, a seeded employee; Colin, a seeded employee holding
`workEmail: "colin@company.example"` (already normalized in storage); and Bob,
Alice's entitled reporting-line editor.

**When** Bob edits Alice's `workEmail`, first to a free address supplied with
stray case and outer whitespace, then to Colin's address supplied in a different
case.

**Then** the free address is stored and returned **normalized**
(`trim().toLowerCase()`); and the attempt to take Colin's address — which is
byte-identical to a stored value **only once normalized** — is rejected `409`,
proving normalization runs before the uniqueness check, not after.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded with
`workEmail: "alice@company.example"`; Colin seeded with
`workEmail: "colin@company.example"`; real `Relationship` Alice→Bob
`type='direct'`; `user-management:edit` seeded and held; port rebound. Stage 2
resolves ids from the seeded fixture id table.

## Test

- **Test 1 — normalization on write**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<bobId>>" },
      "body": { "workEmail": "  Alice.New@Company.EXAMPLE  " }
    }
    ```
  - **expectedResult:** `200`; body `workEmail === "alice.new@company.example"`.
    A follow-up `GET /users/<aliceId>` shows `data.workEmail ===
    "alice.new@company.example"` — the raw mixed-case / padded form is never
    stored or returned.
- **Test 2 — normalization precedes the uniqueness check**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<bobId>>" },
      "body": { "workEmail": "  COLIN@Company.Example " }
    }
    ```
  - **expectedResult:** `409`; a follow-up `GET /users/<aliceId>` shows
    `data.workEmail` still `"alice.new@company.example"` (from Test 1),
    unchanged. The conflict is detected on the **normalized** value
    (`"colin@company.example"`), which the raw request string would not match.
