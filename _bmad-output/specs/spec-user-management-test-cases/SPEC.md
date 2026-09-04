---
id: SPEC-user-management-test-cases
status: draft
companions:
  - ../../../docs/test-cases/user-management/README.md
  - ../../../docs/architecture/user-management-test-decisions.md
  - ../../../docs/architecture/database-schema.md
  - ../../../docs/architecture/api-conventions.md
  - ../spec-user-management-access-control-adoption/SPEC.md
sources:
  - ../../planning-artifacts/prds/prd-user-management-2026-08-20/prd.md
  - ../../planning-artifacts/user-management/epics.md
  - ../../planning-artifacts/sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the
> preservation-validated contract for the `user-management` stage-1 scenario
> suite. The README companion indexes the scenario files that carry the
> request-level assertions. **v1.5 refresh (2026-09-01) — nothing here is
> approved**; every changed or new file runs its own AD-1 stage-1 human
> approval.

# User-Management Test-Case Suite

## Why

AD-1's three-stage quality gate requires an approved prose scenario per feature
before any E2E test or production code. This suite is the stage-1 artifact for
the `User` entity's own lifecycle and workflow correctness **and** for the
adoption of the real Access Control facade by the `/users/:id` routes (Epic 0).
The base access-control model (who is entitled: audience derivation, §3.2 matrix
cells, fail-closed) is proved in `docs/test-cases/access-control-kernel/`. (The Phase-1
`docs/test-cases/access-control/` draft suite was deleted on 2026-09-04 —
171 unapproved, never-executed scenarios; see the traceability report.) Entitlement for `/users/:id`
*specifically* is CAP-0 here, against the real facade.

## Capabilities

- **CAP-0** Access Control adoption (Epic 0)
  - **intent:** The `GET /users/:id` read path, the `PATCH`/`PUT photo` write
    paths, and the no-target `isAllowed` for `create`/`deactivate`/`list` are
    authorized through the real `AccessControlFacade` via the `ACCESS_CONTROL_PORT`
    binding; the interim adapter is deleted in the same cutover (AD-21).
  - **success:** `access-control-adoption/umac-01..09`: Self / reporting-line /
    assigned-PP / **colleague** read → `200` with the **S1 identity card** — the
    same field set for every audience (§3.2's S1 row is `R` for the Colleague
    column, and every active authenticated viewer is at least a Colleague). Story
    0.1 adds an S1-card DTO as a dedicated mapper **on the `GET /users/:id`
    handler only** (not a rewrite of the shared `toUserResponse`; the list /
    `POST` / `PATCH` / `DELETE` / photo response bodies are unchanged): `id`,
    `firstName`, `lastName`, `photo`, `position`, `country`, `city`,
    `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate` — with
    `ttId` / `isActive` / `customFields` / `createdAt` / `createdBy` absent.     Denials: unresolved session → `401`; authenticated active viewer with an
    empty audience set (viewer or target not an active `User`) → `403`. No
    leak-free `404`. *(Revised 2026-09-01 by human
    product decision — the "two-state colleague rule" and adoption story `UMAC-3`
    are removed; the S10/S11/S16 colleague narrowing stays FR-17 on its own
    surfaces.)* No-target `isAllowed` delegates straight to the facade (root
    allowed, unrelated + Ida denied); `PATCH` behind the §2.2 dual gate
    (`umac-07`, **CONDITIONAL — blocked on the missing `user-management:edit`
    permission**); org fields in the PATCH body rejected explicitly regardless of
    audience (§3.2 fn 1); photo write Self-only. Binding per-route contract:
    `../spec-user-management-access-control-adoption/SPEC.md`.

- **CAP-1** Seeded population import (Epic 1 Story 1.1) — *replaces the retired
  Registration capability*
  - **intent:** The delivered seeded timetracker list is imported as an
    idempotent administrative workflow; there is no HTTP create path.
  - **success:** `seed/um-seed-01..03`: import success (one canonical `User` row
    per seeded employee with S1 fields; `workEmail` **stored normalized** per
    DEC-UM-007 canonical-at-write; `workEmail`/`ttId` unique; `customFields: {}`;
    one same-transaction `joined_company` system `UserEvents` per row); no
    `POST /users` create path (absent or permanently rejected, same for every
    session); bootstrap HR Admin present + an import covering the root person
    **reuses the ACM-0 root `User` id** (DEC-UM-009) — bootstrap entitlement
    proof itself stays owned by access-control's `ac-fc-03`, not duplicated.
  - Deployment order: `db:deploy` → `db:seed` (ACM-0) → `db:bootstrap:access-control`
    (ACM-1) → import.

- **CAP-2** Magic-link authentication (Epic 2)
  - **intent:** A seeded user requests a magic link by `workEmail` and consumes
    the one-time token to establish a session.
  - **success:** `auth/um-auth-01..06`: known-email request, enumeration-safe
    unknown-email request, successful consume, expired-token denial, single-use
    replay denial, inactive-account denial (DEC-UM-012 — request side
    enumeration-safe). Fixture users come from `seed/`, not `POST /users`; the
    token has no HTTP-observable seam (literal placeholder until a fake email
    adapter lands).

- **CAP-3** Profile field data-correctness (Epic 1 Stories 1.2 / 1.3)
  - **intent:** Given an already-entitled actor, an S1 field edit persists and
    reflects on a follow-up read; a Self photo upload persists; a
    `workEmail`/`ttId` write conflicting with an existing value is rejected
    wholesale.
  - **success:** `profile/um-pf-01..04`. **Entitlement is CAP-0's, not this
    capability's** — these files assert data correctness given an entitled actor
    and must not duplicate the dual gate or harden the interim-permissive
    `isAllowedForTarget`. Persona ids are resolved from the seeded fixture id
    table, never hardcoded literals.

- **CAP-4** Employee list (Epic 1 Story 1.5)
  - **intent:** An entitled actor lists employees with pagination and S1-field
    filters; a dismissed employee is absent by default but findable through an
    authorized employment-status filter; internal `ttId`/`isActive` are never
    public predicates.
  - **success:** `list/um-list-01..05` — pagination metadata, single filter,
    compound filters, remaining S1-field filters, and dismissed-employee
    visibility (`um-list-05` supersedes the retired `deactivation/um-deact-02`;
    stage 2 seeds the `dismissed` status directly, no CC-06 dependency).

- **CAP-5** Career-timeline system generation (Epic 3 Story 3.1)
  - **intent:** The system writes a `UserEvents` row automatically on a tracked
    change, in the same transaction (AD-11), no actor request producing it.
  - **success:** `career-timeline/um-ct-01..02` — `joined_company` at seed/import
    (traces `seed/um-seed-01`, not registration) and `position_change` on a
    position edit. The other six tracked types reference contexts/fields with no
    schema yet (see Assumptions); `mentorship_start/end` reach UM only as career
    events through an application boundary (AD-17).

- **CAP-6** Career-timeline manual mechanics + dual gate (Epic 3 Stories 3.2 / 3.3)
  - **intent:** The **assigned People Partner and the employee's direct Unit
    Manager only** (DEC-UM-001 — not "any manager", not transitive/project
    managers) may manually add, correct, or delete a timeline entry, and only
    when they **also** hold the runtime *edit the career timeline* permission
    (§2.2 dual gate). A correction is never an in-place edit.
  - **success:** `career-timeline/um-ct-03..10` — PP add, direct-UM add, PP
    correction (soft-delete-then-append-then-observe), UM delete, absence-not-null
    on a deleted read, direct `PATCH` rejected, and both dual-gate negatives
    (permission without S9 write → denied; S9 write without permission → denied).
  - **Partially AC-blocked:** `AccessControlFacade.canAccessSection` ships
    `'S1'`/`'S10'`/`'S11'` only (ACM-5); **S9 section access is a pending Access
    Control increment**. The S9-write half of the dual gate has no facade call
    until it lands — stage-2 for this capability is partially blocked; scenario
    prose proceeds.

- **CAP-7** Organisational relationships — change an employee's manager (Epic 4 Story 4.1)
  - **intent:** A holder of the single *change organisational relationships*
    permission changes an employee's manager from the dedicated screen; reports-to
    is a tree (DEC-UM-005: explicit `DELETE` then `POST`, second `POST` → `409`);
    self-assignment is rejected; the fact change and one §3.4 journal record
    commit together.
  - **success:** `relationships/um-rel-01`, `um-rel-02`, `um-rel-03`, `um-rel-07`
    (permission denial — no-target facade `isAllowed`, never a role-name check),
    `um-rel-08` (concurrency). **The atomic-journal Then-clause is stage-2
    blocked on CC-07** (AD-19 Journal gate); `UserEvents` is not a journal
    substitute. Scenario prose proceeds.

- **CAP-8** Change an employee's People Partner (Epic 4 Story 4.2) — **BLOCKED**
  - **intent:** Atomic fixed-cardinality PP replace (`PUT /users/:id/relationships/people-partner`)
    with old→new journal, self-assignment rejected, `409` on a stale
    `expectedCurrentTargetId` (AD-19).
  - **success:** `relationships/um-rel-09..11` — **scenario prose only.
    BLOCKED on CC-04 (PP persistence / cardinality / write contract) AND CC-07
    (journal schema).** Not translatable to a stage-2 E2E or production until
    both are approved. The facade *reading* `Relationship type='people_partner'`
    to resolve the PP audience (CAP-0) is not blocked.

- **CAP-9** Change department or department manager (Epic 4 Story 4.3) — **BLOCKED**
  - **intent:** Move an employee between departments / change a department's
    manager; an employee belongs to **one or more** departments (§4.17 amended
    2026-09-02 — was "exactly one"; move/replace semantics are this story's to
    fix); Reporting-line access changes on the next request; a
    `department_change` career event; one before/after journal record.
  - **success:** `relationships/um-rel-12..14` — **scenario prose only. BLOCKED
    on CC-07 AND the Department edge contract** (spine Deferred — until it lands,
    `department`-targeted policy rows contribute nothing, fail-closed).

- **CAP-10** Departure / employment lifecycle (Epic 5) — **BLOCKED**
  - **intent:** Record a departure (effective date + reason) after the blocker
    check; apply the complete effective-date outcome exactly once; idempotent
    retry.
  - **success:** `departure/um-dep-01..04` — **scenario prose only. BLOCKED on
    CC-06** (scheduled-departure state, effective-date executor, retry,
    idempotency). Not translatable to a stage-2 E2E or production until CC-06 is
    approved.

## Constraints

- **The base access-matrix is not re-tested here.** Audience resolution and §3.2
  matrix cells belong to `docs/test-cases/access-control-kernel/`. CAP-0 is the exception: it proves the
  `/users/:id`-specific *adoption* of the facade (per-route feature → audience
  mapping, the minimal S1 identity-card projection, the port rebind) — not the
  facade's own internals.
- **One requirement per file**, enforced strictly. Negatives are first-class
  files, never a footnote.
- **`UserEvents` immutable-fact model** is asserted literally — soft-delete +
  append, never an in-place PATCH.
- **Every file carries a trace line** to a requirements §, a PRD FR-n, an AD-n,
  and/or a DEC-UM-n. "PRD FR-n" now means the explicitly numbered **FR-1..FR-6,
  FR-16, FR-17** and the **FR-9 refinement** in the reconciled 2026-09-01 PRD.
  The **derived** requirements in `epics.md` (FR-5a, FR-7..FR-15) cite their
  underlying source (`database-schema.md`, an AD, a requirements §) alongside the
  derived number. `FR-16`/`FR-17` are the **Access Control adoption** and
  **Profile Projection** requirements — a pre-v1.5 trace citing "FR-16" for the
  list capability is stale and is corrected to **FR-15**.
- **No `POST /users`.** The `User` resource is read/update only (AD-14 / AD-16 /
  §4.17). Story 1.1 is a seeded import; its writer has no HTTP surface — CAP-1
  and the bootstrap half of CAP-1 assert **database row-level state**.
  `um-seed-02` is the one HTTP assertion (the route's absence).
- **Real-audience cases use `Bearer <token:<seeded-uuid>>`**, not a persona
  literal (`um-integration-contract-response.md` Q6). The interim **session**
  resolver stays (Epic 2 retires it); only the interim **access-control** adapter
  is deleted (Epic 0).
- **Endpoints** bind to the canonical router-tree convention (AD-14): resource
  root `/users`, auth root `/auth`, owned collection `/users/:id/events`,
  attachment endpoints `/users/:id/relationships[/people-partner]`,
  `/users/:id/policies`, `/users/:id/departures`. Section addressing uses
  human-readable names, never `sNN` ids in a URL.
- **`canAccessSection` section string.** The real facade takes the literal
  `'S1'` for the identity section (confirmed against
  `acm5-section-access.e2e-spec.ts` and the ACM5-SA-* docs; supported strings are
  `'S1'`/`'S10'`/`'S11'`, every other string → `'none'`). CAP-0 and the future
  adapter use `'S1'` verbatim. S9 is not yet a supported string.
- **Normative product/test decisions** — DEC-UM-001..012
  ([user-management-test-decisions.md](../../../docs/architecture/user-management-test-decisions.md)).
  DEC-UM-006 (server-owned create fields) and DEC-UM-008 (registration dispatch
  durability) are **RETIRED** (no `POST /users`). DEC-UM-007 (canonical at write)
  and DEC-UM-009 (no second row / ACM-0 root-id reuse) are reconciled to the
  seed/import writer. DEC-UM-002's *principle* (any capability check is a
  no-target facade check, never a role-name check) carries forward though the
  generic-deactivation surface is retired.
- **Gate E2E isolation** follows DEC-UM-010.

## Non-goals

- The base access-matrix / audience-derivation model — `docs/test-cases/access-control{,-kernel}/`.
- S2/S3/S4/S5 section content — no schema yet.
- Six of `UserEvents`' eight tracked types — reference fields/contexts with no
  schema yet in this PRD.
- Timetracker/PeopleForce sync-driven writes (AD-13).
- The seeded FR-permission catalog change for `user-management:edit` — owned by
  the Access Control kernel package (adoption Open Decision (i) option (a)).
- Stage-2 E2E / production for the BLOCKED capabilities (CAP-8 CC-04+CC-07,
  CAP-9 CC-07+Department, CAP-10 CC-06) and the S9-write half of CAP-6.
- E2E test code itself — this suite is stage 1.
- Mentorship pair lifecycle — moved to a future dedicated Mentorship context
  (AD-17); UM receives only `mentorship_start`/`mentorship_end` career events.

## Success signal

A reviewer maps each CAP-0..CAP-7 sourced behaviour to exactly one draft file
under `docs/test-cases/user-management/`; a stage-2 author picks any non-blocked
file and writes its red E2E without opening another document. Each BLOCKED
capability (CAP-8/9/10) names its gate and stops at scenario prose. The retired
`registration/` and `deactivation/` folders carry a `README.md` pointer and no
approvable file.

## Assumptions

- Of `UserEvents`' 8 documented tracked types, only `joined_company` (at
  seed/import) and `position_change` (on a `PATCH`) are automatically triggerable
  from `User`/profile mutations today. `mentorship_start`/`mentorship_end` are
  produced by the future Mentorship context and appended to UM via an application
  boundary (Epic 3 Story 3.1 third AC) — not exercised by this suite.
- Nullable columns a seed row omits (`photo`, `workPhone`, `birthDay`,
  `birthMonth`) come back present-and-`null` on the `GET /users/:id` S1 card for
  any resolved audience. `ttId` is **not** on the S1 card (Story 0.1 drops it) —
  its null-vs-null uniqueness is asserted at the datastore, not through the read
  (`seed/um-seed-01`, `profile/um-pf-04`).

## Open Questions

Carried from the consolidated proposal §7 — approver decisions, not TEA's:

1. **(i)** Missing `user-management:edit` (± photo) permission — option (a) new
   kernel seed AD-1 sequence, or (b) interim adapter rule with an expiry
   trigger. Blocks `umac-07` (CAP-0 write) and Story 0.2.
2. **(ii) RESOLVED 2026-09-01 (human product decision).** A colleague
   `GET /users/:id` returns the S1 identity card (`200`) from Story 0.1 (§3.2 S1
   = `R` for Colleague); the "two-state rule" and adoption story `UMAC-3` are
   removed; empty audience → `403` (no leak-free `404`). FR-17 Profile
   Projection keeps only the S10 dates-only / S11 name-only / S16 per-field
   colleague views on their own surfaces.
3. **(v)** Photo write Self-only vs manager-writable (`umac-09`).
4. **(vi)** Photo a distinct permission, or covered by `user-management:edit`.

**Upstream gates (not open product questions):** CC-04, CC-06, CC-07, and the
Department edge contract block CAP-8/9/10 and the atomic-journal clauses of
CAP-7. The S9 `canAccessSection` Access Control increment blocks the S9-write
half of CAP-6.
