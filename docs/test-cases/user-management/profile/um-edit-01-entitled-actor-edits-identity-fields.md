# UM-EDIT-01 · An entitled actor edits S1 identity fields and the change reflects on a read

**Trace:** requirements §3.2 S1 (Reporting line: `RW¹`) · PRD Data Model — `User` entity · [database-schema.md](../../../architecture/database-schema.md) §User · [api-conventions.md](../../../architecture/api-conventions.md) shape 1 (`PATCH /users/:id`) · [access-control.md](../../../architecture/access-control.md) §2.2 (dual gate) · epics.md Story 1.2 (data-correctness ACs) · SPEC-user-management-access-control-adoption CAP-3 (`{ data, canEdit }` envelope on `GET /users/:id`)

> **Scope (v1.5).** *Who* is entitled to `PATCH /users/:id` — Self / reporting /
> PP allowed, colleague `403`, `401` unresolved, the §2.2 dual gate — is
> **Epic 0's** (`access-control-adoption/umac-07`), asserted against the real
> `AccessControlFacade`. This file asserts **data correctness** given an
> already-entitled actor: the write persists the provided fields, leaves the
> others alone (`PATCH` is a partial merge — see profile [README](README.md)),
> and a follow-up `GET` reflects it. Do not duplicate entitlement scenarios.
>
> **Blocked past Stage 1** on the `user-management:edit` kernel-seed decision
> (`_bmad-output/implementation-artifacts/access-control/user-management-edit-permission-options.md`)
> and the seed sequence reaching `stage-3-production`. Until then the Stage-2
> `PATCH` cannot pass the dual gate's functional half.

## Scenario

**Given** Alice, a seeded employee with `position: "Engineer"`, `country: "PL"`,
`city: "Warsaw"`, `workPhone: null`; and Bob, Alice's **direct** Unit Manager
(reporting-line `write` on Alice's S1 via the umac-07 dual gate), acting as an
already-entitled actor.

**When** Bob `PATCH`es Alice's `position`, `country`, `city`, and `workPhone` in
one request.

**Then** the response is `200` and echoes the four new values; every other S1
field is unchanged; and a follow-up `GET /users/:id` returns the standard
`{ data, canEdit }` read envelope with the new values in `data` and
`canEdit: true` (Bob is reporting-line over Alice, so the dual gate's section
half is `write` and — once `user-management:edit` is seeded — the functional
half holds).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded as
above; real `Relationship` Alice→Bob `type='direct'`; `user-management:edit`
seeded and held per the Deliverable A decision; the Epic 0 port is rebound.
Stage 2 resolves `<aliceId>` / `<bobId>` from the seeded fixture id table, never
a hardcoded literal.

## Test

- **Test 1 — the write**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<bobId>>" },
      "body": { "position": "Senior Engineer", "country": "DE", "city": "Berlin", "workPhone": "+49 30 000000" }
    }
    ```
  - **expectedResult:** `200`; body (the plain `toUserResponse` shape — **not**
    the `{ data, canEdit }` envelope, which is `GET /users/:id` only, per
    profile [README](README.md)) reflects `position: "Senior Engineer"`,
    `country: "DE"`, `city: "Berlin"`, `workPhone: "+49 30 000000"`;
    `firstName`, `lastName`, `workEmail`, `birthDay`, `birthMonth`,
    `companyJoinDate`, `ttId` unchanged.
- **Test 2 — observing the change**
  - **inputURL:** `GET /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<bobId>>" } }`
  - **expectedResult:** `200`; body is `{ "data": { … }, "canEdit": true }`;
    `data.position === "Senior Engineer"`, `data.country === "DE"`,
    `data.city === "Berlin"`, `data.workPhone === "+49 30 000000"`; `data` carries
    exactly the 12 S1-card keys (`ttId` / `isActive` / `customFields` /
    `createdAt` / `createdBy` absent).
