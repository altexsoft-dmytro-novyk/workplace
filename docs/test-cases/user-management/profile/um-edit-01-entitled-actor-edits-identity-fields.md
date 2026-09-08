# UM-EDIT-01 · An entitled actor edits S1 identity fields and the change reflects on a read

**Trace:** requirements §3.2 S1 (Reporting line: `RW¹`) · PRD Data Model — `User` entity · [database-schema.md](../../../architecture/database-schema.md) §User · [api-conventions.md](../../../architecture/api-conventions.md) shape 1 (`PATCH /users/:id`) · [access-control.md](../../../architecture/access-control.md) §3.2 (S1 write-audience) · epics.md Story 1.2 (data-correctness ACs) · SPEC-user-management-access-control-adoption CAP-3 (`{ data, canEdit }` envelope on `GET /users/:id`)

> **Scope (v1.5).** *Who* is entitled to `PATCH /users/:id` — reporting-line
> manager / assigned PP allowed, self `403`, colleague `403`, `401`/`403`
> unresolved — is **Epic 0's** (`access-control-adoption/umac-07`), asserted
> against the real `AccessControlFacade`. **Variant A (product decision
> 2026-09-02): the identity card has no separate functional permission — the
> whole gate is `canAccessSection(v, 'S1', t) === 'write'`.** This file asserts
> **data correctness** given an already-entitled actor: the write persists the
> provided fields, leaves the others alone (`PATCH` is a partial merge — see
> profile [README](README.md)), and a follow-up `GET` reflects it. Do not
> duplicate entitlement scenarios.
>
> **No longer blocked on a kernel seed.** Under Variant A the edit gate is
> audience-only (`canAccessSection('S1')`), which Epic 0 already ships; Story 1.2
> is pending only its own Stage 2 / Stage 3.

> **Amended 2026-09-05 (PLAT-E4-S4.1c).** The "Variant A" framing in the scope
> note above (identity card has no functional permission; the whole Epic 0 gate
> is `canAccessSection` alone) is **superseded by SCP
> [`sprint-change-proposal-2026-09-04-section-access-consolidation.md`](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md)
> D1**: `PATCH /users/:id` is a **dual gate** — the audience half
> `canAccessSection(viewer, 'profile:identity', target) === 'write'` resolved
> **first**, then the feature half `isAllowed(viewer, 'profile:identity:write')`,
> held implicitly by every **active** employee through the `DEFAULT_PERMISSIONS`
> code constant (**D2**), with no `Policies` / `UserPolicies` row. From
> PLAT-E4-S4.1c both halves are one call behind
> `@RequireSectionAccess('profile:identity', 'write')`.
>
> **Nothing in this file's assertions changes.** Bob is an active employee, so
> he holds the feature half by construction; his reporting-line edge to Alice is
> still what decides, and the entitlement scenarios still live in Epic 0
> (`umac-07`), not here. The section identifier is the human key
> `profile:identity` (**D4** / 4.1b); `S1` stays a `docs/project-requirements.md`
> §3.2 matrix-row citation. Story 1.2 remains unblocked on any kernel seed —
> more so than before, since the feature half needs no seed at all.

## Scenario

**Given** Alice, a seeded employee with `position: "Engineer"`, `country: "PL"`,
`city: "Warsaw"`, `workPhone: null`; and Bob, Alice's **direct** Unit Manager
(reporting-line `write` on Alice's S1 via the umac-07 gate — `canAccessSection(Bob,
'profile:identity', Alice) === 'write'`), acting as an already-entitled actor.

**When** Bob `PATCH`es Alice's `position`, `country`, `city`, and `workPhone` in
one request.

**Then** the response is `200` and echoes the four new values; every other S1
field is unchanged; and a follow-up `GET /users/:id` returns the standard
`{ data, canEdit }` read envelope with the new values in `data` and
`canEdit: true` (Bob is reporting-line over Alice, so `canAccessSection` is
`write` — which is the whole gate).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded as
above; real `Relationship` Alice→Bob `type='direct'` (so Bob's
`canAccessSection(Bob, 'profile:identity', Alice)` is `write`); the Epic 0 port is rebound.
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
