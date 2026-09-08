# UM-EDIT-05 · A `PATCH` body carrying `manager` / `peoplePartner` / `department` is rejected `400`, whole DTO

**Trace:** requirements §3.2 fn 1 (manager, people partner, department are shown in S1 but **not writable through it**) · [access-control.md](../../../architecture/access-control.md) §3.3 (§3.2 fn 1–2 S1 derived fields — read-only for **every** audience) · §2.1 / AD-10 (org changes go through the dedicated organisational-relationship screen + its own permission + §3.4 journal) · epics.md Story 1.2 (third AC) · Epic 1 context (FR-9) · cross-ref `access-control-adoption/umac-08`

> **Scope (v1.5).** This is a **DTO-shape / data-correctness** assertion, not an
> entitlement one — the rejection fires for **every** audience, including a
> fully-entitled writer, and is enforced in `UpdateUserDto` / `EditUserAction`,
> **not** the guard (`umac-08`). No kernel-seed dependency under Variant A — the
> Epic 0 edit gate is audience-only (`canAccessSection(v, 'S1', t) === 'write'`),
> which Bob's reporting-line edge already satisfies, so the request reaches the
> DTO. Pending only Story 1.2's own Stage 2 / Stage 3.

> **Current-state note (for the code stage).** `UpdateUserDto` today declares
> **no** `manager` / `peoplePartner` / `department` fields, so the global
> `ValidationPipe` `whitelist: true` **silently strips** them and the request
> `200`s on the other fields. Story 1.2 must make the rejection **explicit** —
> `@IsEmpty()` on those keys (and their id-shaped aliases), matching the
> existing treatment of `photo` / `isActive` / `id` / `createdAt` / `createdBy`
> — so a client trying to change an org fact through S1 gets a `400`, not a
> quiet partial success. This is the same change `umac-08` requires; the two
> scenarios share the assertion.

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

**Given** Alice, a seeded employee (`position: "Engineer"`, reports to Bob,
assigned PP Paula, in department `<deptId>`); and Bob, Alice's entitled
reporting-line editor — `canAccessSection(Bob, 'profile:identity', Alice) === 'write'`, so the
umac-07 gate passes for him.

**When** Bob submits a `PATCH` whose body pairs a legitimate S1 change
(`position`) with an organisational fact — `manager` / `reportsToUserId` /
`managerId`, or `peoplePartner` / `peoplePartnerId`, or `department` /
`departmentId`.

**Then** the **whole DTO** is rejected `400` naming the offending field; the
`position` change is **not** applied; and **no** `Relationship`, `Policy`, or
access edge for Alice changes. Manager, People Partner, and department move only
through Epic 4's dedicated screen.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded with
a `direct` edge to Bob, a `people_partner` edge to Paula, and a
`DepartmentMembership`; Bob's `canAccessSection(Bob, 'profile:identity', Alice)` is `write`;
port rebound. Stage 2 resolves ids from the seeded fixture id table.

## Test

- **Test 1 — `managerId` in the body → 400**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<bobId>>" },
      "body": { "position": "Senior Engineer", "managerId": "<ninaId>" }
    }
    ```
  - **expectedResult:** `400` naming `managerId`. A follow-up `GET /users/<aliceId>`
    shows `data.position === "Engineer"`, unchanged; Alice's `direct`
    `Relationship` still points at Bob; no journal entry written.
- **Test 2 — `peoplePartnerId` in the body → 400**
  - **inputRequest body:** `{ "peoplePartnerId": "<ninaId>" }`
  - **expectedResult:** `400`; Alice's `people_partner` edge still points at
    Paula; no change.
- **Test 3 — `departmentId` in the body → 400**
  - **inputRequest body:** `{ "departmentId": "<otherDeptId>" }`
  - **expectedResult:** `400`; Alice's `DepartmentMembership` unchanged.
- **Test 4 — the bare names (`manager` / `reportsToUserId` / `peoplePartner` / `department`) are each rejected the same way** — one representative assertion per alias; none is silently stripped.
