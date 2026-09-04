---
id: SPEC-functional-roles-catalog
status: draft
companions:
  - implementation-constraints.md
  - ../../implementation-artifacts/access-control/deferred-work.md
  - ../../../docs/architecture/access-control.md
  - ../../../docs/architecture/api-conventions.md
  - ../../../docs/architecture/database-schema.md
  - ../../../docs/architecture/domain-driven-design.md
sources:
  - ../../implementation-artifacts/access-control/deferred-work.md
  - ../../../docs/project-requirements.md
  - ../../planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
---

> **UNAPPROVED DRAFT — do not dispatch.** No human has reviewed this SPEC as a dispatch contract.
>
> **Stale relative to 2026-09-02 architecture:** PM/AD-26 closes the HR Admin grant/revoke chain (ordinary FR path, no special manager, last-holder block). OQ-PERM-01 remains open: do not invent a default role-to-permission matrix. **H4:** binding permission identity is `Permissions.key` (unique, append-only); `title` is not the identity field — ACF/AD-4 supersedes earlier `{id, title, description}` wording in this draft and in older companions. This draft is not rewritten as if it had always contained those decisions.

> **Kernel course-correction boundary (approved 2026-08-30):** ACM-1 and
> ACM-2 reserve the minimal FR data, three-permission seed, bootstrap
> attachment, and `isAllowed` evaluator for the headless Access Control Kernel,
> subject to independent approval of FR-AMD-1. This catalog draft retains
> `/roles` and runtime-management concerns only and must consume, not duplicate,
> the approved kernel schema/seed/evaluator. This note does not resolve
> FR-AMD-1 or authorize any catalog dispatch.

# Functional Roles Catalog

## Why

AD-6 splits authorization into two dimensions. The first — access roles, computed live from relationships — has an implementation seam: `access-control/` exists in the backend as a hexagonal context holding the Phase-0 audience resolver. The second — functional roles, assigned as data — does not exist anywhere. `services/backend/prisma/schema.prisma` carries `User`, `Relationship`, and `Project` only; `Policies`, `Permissions`, and `UserPolicies` are described in `database-schema.md` and referenced by AD-7, AD-12, and the facade contract, but no table, no row, and no evaluator exists. Every FR statement made so far — the bootstrap HR Admin attachment of AD-12, the dual-dimension write gate of §2.2, `isAllowed` on the facade — presumes data that nothing produces. This slice is the origin entry in `deferred-work.md` (`source_spec: none`), and this SPEC is what changes that field.

**Value caveat, stated honestly.** Sixteen granular permissions are named in §2.3 (the list is a minimum, not a closed set). Most of them gate features that do not exist in this codebase: form campaigns, action items, risks, the whole resourcing flow, CDS records, mentorship assignment, feedback, and dashboards. Two have real consumers now — `change organisational relationships` gates the Epic-4 organisational-relationship operations (`4-1` in progress) and `edit the career timeline` gates the Epic-3 timeline operations (`3-1`–`3-3` in progress), though the latter's default holder is one of §2.3's explicitly unsettled points. Two more have named-but-unbuilt consumers: `record a departure` is already cited by name in `api-conventions.md` for the AD-20 departure routes, and `manage departments` gates a department model that does not yet exist. This slice therefore delivers the engine and the catalog. Enforcing the resulting permissions on existing endpoints is a separate step owned by each endpoint's context per AD-2/AD-4, not work this slice can do.

**Forward link — why this is worth doing before its consumers exist.** `manage departments` is the permission the §4.17 department model hangs from, and the department model is the gate on two audience cells that the existing Phase-0 resolver currently withholds: department management as a Reporting-line relation (AD-10, `facade-contract.md` "Department and PP HR-line gate") and the HR line above an assigned People Partner (AD-19's department-boundary gate). Neither unblocks without a department model, and the department model cannot be built without a permission to gate it. That is the sequencing argument; it is not a claim that this slice delivers those cells.

## Capabilities

- **CAP-1 — The permission catalog is data**
  - **intent:** The granular feature list of §2.3 exists as queryable `Permissions` rows rather than as constants, enums, or branches in code.
  - **success:** Every feature named in §2.3 resolves to exactly one catalog row; the evaluator branches on no permission name; adding a row requires no evaluator change.

- **CAP-2 — Functional roles are created at runtime**
  - **intent:** An administrator can define a named functional role and change its granted permission set with no deploy and no schema change (§2.3).
  - **success:** A role created after deployment grants exactly its permission set to its holders on the next request, and no code path enumerates or special-cases the five starting role names of §2.2.

- **CAP-3 — Revocation is immediate**
  - **intent:** Removing a permission from a role, or a role from a person, takes effect for everyone holding it without re-login and without a grace period (§2.3, §2.1).
  - **success:** No FR decision is persisted, cached, or memoized across requests; a permission removed between two requests in one session is absent from the second evaluation.

- **CAP-4 — Functional-permission decision, type-separated**
  - **intent:** A consumer obtains a global feature decision through `isAllowed(userId, feature)` — no target employee, no contact with audience data (AD-7, AD-9).
  - **success:** The evaluation reads only `type: 'FR'` policy, permission, and attachment rows and issues no relationship or audience query; a true result grants no data access (consistent with the existing draft scenarios AC-FP-02 and AC-FP-03).

- **CAP-5 — Fail-closed with no unapproved defaults**
  - **intent:** A fresh deployment carries the AD-12 bootstrap attachment and nothing else, so no access originates from a default nobody confirmed.
  - **success:** A fresh seed holds exactly one HR Admin FR attachment and no other grant; an unknown feature key, an unattached user, a role with an empty permission set, and an orphaned attachment each evaluate to `false`.

## Constraints

- Only `type: 'FR'` rows are read or written. AR rows are neither read, written, nor joined here, and FR evaluation never enters the AR tier-resolution hot path (AD-7 type separation).
- Operator `==` only, `managedBy: 'admin'` only. No policy-level `IN` (AD-8, deferred), no `!=` (barred), no `'sync'` provenance (AD-13 gives that to the timetracker integration as sole writer).
- A functional role never widens data access (§2.3, §3.1). No row this slice writes may contribute to an audience, and holding the bootstrap HR Admin role yields no profile audience.
- No FR decision is stored or cached across requests. §2.3's immediate-revocation rule and §6's "a stale permission cache is a data leak" jointly forbid it; there is no invalidation design that would make one acceptable here.
- AD-1 is blocking and ordered: independently human-approved Stage-1 scenarios, then independently human-approved E2E committed red, then production code. This SPEC authors and approves neither gate artifact, and no agent dispatch may span two stages.
- **The catalog's HTTP request and response shapes are established by the Stage-1 scenario document, not by this SPEC.** `api-conventions.md` fixes the route tree for the catalog — `GET/POST /roles`, `PATCH /roles/:roleId/permissions`, `DELETE /roles/:roleId`, top-level because catalog management is cross-user — and states that full shapes "aren't specified yet — pending its own AD-1 scenario doc." That gap is deliberate. Inventing a body shape here would be the failure this SPEC exists to avoid (OQ-2).
- Role↔user attachment is not this slice's to define over HTTP. `api-conventions.md` places it at `POST /users/:id/policies` and `DELETE /users/:id/policies/:policyId`, nested under `/users`, and AD-2 gives User Management sole ownership of its route shape, guards, adapters, and response projection. This slice may not add, alter, or re-guard a `/users`-nested route (OQ-1).
- Default permission assignments are encoded nowhere — not in seed data, not in a migration, not in a constant, not in a test fixture beyond the single bootstrap attachment (§2.3 defaults gate, restated by `access-control.md`).
- This slice lives in the existing `access-control` bounded context. AD-5 already assigns both role dimensions to it and AD-7 puts both on the same three tables, so a sibling context would mean two contexts owning `Policies`/`Permissions`/`UserPolicies` — which AD-2's entry-point rule cannot express cleanly. The cost is accepted and named in `implementation-constraints.md`: one context now holds a read-only hot path and a mutating admin surface, and the type separation that keeps them apart is a convention the tests must prove rather than a boundary the compiler enforces.
- Layout, dependency direction, and DI follow `domain-driven-design.md`; implementation belongs in `services/backend`, never the workspace root.
- The AD-20 effective-departure cutoff applies before any feature decision: a due actor is denied irrespective of held permissions.

## Non-goals

- **Default permission assignments per role** — §2.3 requires them to be drafted by the team and confirmed by the PO *before the roles admin screen is built*, and names three points the requirements do not settle: who may manage custom fields, who may assign mentors, and the defaults for *approve or reject proposed candidates*, *edit the career timeline*, and *create feedback*. `access-control.md` repeats the prohibition: do not hard-code defaults until that confirmation is recorded.
- **Any UI or admin screen** — §2.3's "through the UI" requirement is met by a later frontend slice. `services/frontend` is untouched by this SPEC. Consequence to state plainly: after this slice, §2.3 is satisfied at the data and API layer only.
- **`type: 'AR'` rows and anything on the audience-resolution hot path** — AD-7 requires type-separated evaluation; an FR check never enters the AR path, so AR rows have no place in this slice's reads, writes, seeds, or query plans.
- **Policy-level `IN`** — deferred by AD-8 and by its own `deferred-work.md` entry; `Policies.targetId` is scalar, so no target-set representation exists. **`!=`** — barred from AR/tier-granting rules because negation is satisfied by missing data, which inverts fail-closed.
- **`managedBy: 'sync'` provenance** — belongs to the timetracker integration, which becomes its sole writer under AD-13.
- **The §2.2 dual-dimension write gate** — it requires the section matrix, which does not exist. This slice supplies only the feature half of that gate; a mutation is not made safe by it.
- **Enforcement of the new permissions on existing endpoints** — each endpoint's owning context adds its own check through the facade (AD-2, AD-4). Largely User Management work, and not this slice's to schedule.
- **Re-authoring AC-FP-01, AC-FP-02, AC-FP-03** — three draft functional-permission scenarios previously existed under `docs/test-cases/access-control/functional-permission/` and were deleted 2026-09-04 with the rest of the unapproved Phase-1 suite; they covered the dual gate, FR-is-not-audience, and HR-Admin-has-no-data-access. The Stage-1 work here extends the catalog's own surface and must stay consistent with those three rather than duplicate or contradict them. That folder's suite also explicitly defers "role-catalog management UI" scenarios, which is the hole this slice's Stage-1 document fills.
- **The §3.4 journal schema** — CC-07 owns it and already blocks AD-19 work. Whether FR mutations journal at all is OQ-10, not an assumption to build on.

## Success signal

After the catalog's own Stage-1 scenario document is independently approved and its E2E is committed red, a functional role created at runtime grants exactly its permission set to its holders; adding or removing a permission changes the outcome on the next request with no re-login and no deploy; `isAllowed` returns the decision without issuing a relationship or audience query; database inspection after a request finds no persisted or cached FR decision; and a fresh seed contains exactly one bootstrap HR Admin attachment and no other grant. None of that is demonstrable until OQ-3, OQ-4, OQ-5, and OQ-11 are answered.

## Open Questions

Twelve. None is answered here; several are contradictions in the sources rather than mere omissions.

**OQ-1 — Who owns role↔user attachment over HTTP?**
`api-conventions.md` places attachment at `POST /users/:id/policies {type, targetType, targetId, targetRole}` and `DELETE /users/:id/policies/:policyId`. That is a `/users`-nested route, and AD-2 gives User Management sole ownership of its shape, guards, adapters, and response projection. The catalog itself (`GET/POST /roles`, `PATCH /roles/:roleId/permissions`, `DELETE /roles/:roleId`) is top-level and is not UM's. So this slice can own the catalog but cannot unilaterally own attachment. Options and their costs, none chosen:

- **(a) Seed/administrative attachment only in this slice.** No HTTP attachment surface ships; roles are attached by seed or by a maintenance path. Cost: §2.3's "people are assigned to functional roles through the UI" stays unmet after this slice, and the first UI slice inherits an unowned dependency. Cheapest and most honest about the boundary.
- **(b) UM implements `POST/DELETE /users/:id/policies` against an application-layer command exported by `access-control`.** Matches the route tree as written and AD-2's entry-point rule. Cost: a cross-context dependency and a UM-side scheduling commitment this slice cannot make on UM's behalf; UM currently has four in-progress epics.
- **(c) A `/roles/:roleId/members` surface owned by this context.** Keeps attachment beside the catalog. Cost: **this route does not exist in `api-conventions.md`.** Adding it is a deliberate amendment to the canonical router tree, which AD-14 fixes at four shapes and explicitly warns against inventing a fifth ad hoc. It would also create two routes that write the same `UserPolicies` rows. Not a silent addition — an amendment with its own review.

**OQ-2 — What are the catalog's request and response shapes?**
Undefined by design. `api-conventions.md` line 30: full request/response shapes for the catalog "aren't specified yet — pending its own AD-1 scenario doc." The spine's Deferred list repeats it. The shapes are therefore established by this slice's Stage-1 scenario document under human approval, not inferred from the sibling `/users` routes and not invented here. (Minor textual inconsistency noted: that spine entry refers to the scenarios as `users/roles/`, while `api-conventions.md` and the test-case README both fix the route as top-level `/roles`. The route is top-level; the spine's phrasing appears to mean a test-case folder, not a nested route.)

**OQ-3 — Where is the role→permission link stored?**
*(Superseded options below regarding `Permissions {id, title, description}` — ACF/AD-4 / PM/AD-7 bind identity to `Permissions.key`. Historical draft text retained.)*
`database-schema.md` defines exactly three structures: `Policies`, `Permissions {id, title, description}` *(obsolete shape — superseded by `{id, key, description}` per ACF/AD-4)*, and `UserPolicies {userId, policyId}`. There is **no join between `Policies` and `Permissions`**, and the ERD fragment shows only `User → UserPolicies → Policies`. But `PATCH /roles/:roleId/permissions` presupposes a many-to-many between a role and its permissions, and §2.3 requires a role to carry a mutable granted set. Either a fourth table is missing from `database-schema.md`, or a role's permission set is meant to live somewhere unstated. This must be decided and recorded in `database-schema.md` before any Stage-1 shape or migration. It is the single largest gap in this slice.

**OQ-4 — What is the shape of an `FR` policy row?**
`Policies` is documented with `operator`, `targetType`, `targetId` (non-null uuid, polymorphic), and `targetRole` — an AR-shaped rule about a target. A functional role is a global feature grant with no target; `isAllowed(userId, feature)` takes no target at all. Unanswered: is `roleId` in the `/roles` routes the same identifier as `Policies.id`? What do `targetType` and `targetId` carry on an FR row — a sentinel, a nullable column that the documented schema does not permit, or something else? Is the role's human name `targetRole`, and if so what enforces its uniqueness? Related contradiction: `POST /users/:id/policies` takes `{type, targetType, targetId, targetRole}` in its body, which describes a policy being *defined at attach time*, not an existing catalog row being *referenced* by id. For FR those two models cannot both be right.

**OQ-5 — Which permission gates the catalog itself?**
§2.2 assigns "functional roles and their permissions" to HR Admin, but §2.3's granular list contains no *manage functional roles* permission — it has *manage custom fields*, *manage departments*, and *change organisational relationships*, and stops there. Gating `/roles` on the literal role name "HR Admin" would contradict §2.3 ("functional roles and their permissions are data, not code") and AD-6's vocabulary invariant. Adding a sixteenth-plus permission is the obvious repair but it is an addition to a NORMATIVE list, which is a product decision. Do not resolve this by a name check in code.

**OQ-6 — Is `Permissions` a closed seeded set or runtime-extensible?**
§2.3 says "At minimum the following must be independently grantable," which fixes a floor, not a ceiling, and it makes *roles* explicitly runtime-creatable — but it says nothing about creating a *permission*. Unanswered: may an administrator add a permission row at runtime, and if so what does a permission mean when no code enforces it? The answer constrains OQ-7 directly.

**OQ-7 — What is the canonical feature identifier?**
*(Superseded: `Permissions.title` is not identity — ACF/AD-4 / PM/AD-7 bind `Permissions.key`. Historical draft options retained.)*
§2.3 lists prose names ("assign and end mentorships"). `database-schema.md` shows kebab-case examples (`'create-resourcing-requests'`, `'assign-mentors'` — note that the second is not a transcription of any §2.3 bullet). Nothing in this draft fixed what `isAllowed(userId, feature)` accepts: a `Permissions.title` *(obsolete option)*, a `Permissions.id`, or a compile-time enum. Live architecture uses `Permissions.key`. A typed enum gives call-site safety but contradicts OQ-6 if permissions are runtime-creatable; a free string is extensible but makes a typo a silent denial. Decide together with OQ-6, and record the canonical spelling of all sixteen titles.

**OQ-8 — How is "view a given dashboard" represented?**
It is the only parameterized entry in §2.3's list — *a given* dashboard. `Permissions` has no parameter column and `isAllowed(userId, feature)` is flat. One row per dashboard is the obvious encoding but it presumes a fixed dashboard set, and `dashboards.md` records the dashboard engine as design-pending with the spine forbidding improvisation there. Unresolved.

**OQ-9 — What happens on `DELETE /roles/:roleId` while users hold it?**
Cascade-detach every holder, refuse while holders exist, or soft-retire the role? No source states it. §2.3 fixes the timing rule for removing a *permission* ("immediately for everyone holding it") but says nothing about removing a *role*. The same question applies to deleting a `Permissions` row that roles still reference. Note the interaction with AD-12: a delete path that can remove the last HR Admin attachment is an availability hazard, and unlike §2.4's full-profile access, §2.3 states no last-holder protection for functional roles — AD-12 only says the bootstrap role is "delegable and revocable through the ordinary UI path," and AC-FC-03 exists as a draft scenario asserting it is revocable.

**OQ-10 — Are FR catalog mutations journaled?**
§3.4's narrow journal covers manager, people partner, department, and department-manager changes, full-profile grants and revocations, and shared-link accesses. Role creation, permission-set changes, and role attachment/detachment are absent from that list, even though attachment is a privilege change. If the answer is yes, this slice inherits the CC-07 journal-schema gate that already blocks AD-19 PP work — which is a sequencing consequence, not a detail.

**OQ-11 — Which spec ships `isAllowed`?**
The approved Kernel MVP proposal assigns intended ownership to ACM-1/ACM-2, and
this catalog must consume that evaluator rather than duplicate it. The decision
is not architecture-approved until FR-AMD-1 records and receives independent
human approval for OQ-3, OQ-4, OQ-6, OQ-7, and OQ-11 together. Until then ACM-1
and every catalog story that depends on its schema/evaluator remain blocked.

**OQ-12 — Is self-assignment barred for functional roles?**
§2.1 bars self-assignment for organisational relationships ("whatever permissions they hold") and §2.4 bars it for full-profile access. §2.3 states no equivalent rule, so nothing in the sources prevents a holder of the catalog permission from granting themselves any role, or from adding any permission to a role they already hold. Both are privilege-escalation shaped. The silence looks like an omission rather than a decision, but resolving it by analogy would be inventing a normative rule.
