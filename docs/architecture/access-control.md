# Access Control — Policies Engine

Binding rules for all authorization. Spine: AD-6, AD-7, AD-8, AD-9, AD-10, AD-11, AD-12, AD-13. This is the most consequential file in this directory: access-control correctness is the project's primary quality attribute (§7), and any leak is a critical defect (§3.3.1).

## The two dimensions (AD-6)

- **Access roles** — *what data can this person see about that person.* Computed live from relationships, per request. Never assigned, never stored.
- **Functional roles** — *what features does this person get.* Assigned as data, extensible at runtime through the HR Admin UI (§2.3).

Collapsing these into one list of roles is the canonical mistake (§2). The vocabulary rule in [domain-driven-design.md](domain-driven-design.md) enforces the split at the naming level.

## One engine, AWS-style policy attachments (AD-7)

Both dimensions run on the same three tables (full schemas in [database-schema.md](database-schema.md)):

- `Policies` — a rule: `{operator, targetType, targetId, targetRole, type: 'AR'|'FR', managedBy: 'sync'|'admin'}`. Example: *attached user has project X (`==`) → `targetRole` for that scope.*
- `Permissions` — the granular feature list (§2.3): create form campaigns, create action items, fulfil resourcing requests, assign mentors, …
- `UserPolicies` — attachment join: which users hold which policies. One policy row can be shared by many users.

Rules that follow:

- Managerial facts **are** policy attachments. "Y is DM of project X" is a policy row attached to Y — `Project` has no `pmUserId`/`dmUserId` columns and no member array. HTTP surface: `POST/DELETE /users/:id/policies` is the one write path for every AR/FR attachment ([api-conventions.md](api-conventions.md), AD-14) — never a bespoke endpoint per assignable fact.
- `type: 'FR'` policies are runtime-editable through the HR Admin UI. `type: 'AR'` policies are written once by the seed script and have **no** UI.
- A new functional role never widens data access (§2.3): FR grants features; what data those features can touch is bounded by the holder's computed access tier.
- `managedBy` provenance separates future sync-written rows from admin-written rows. When the timetracker sync lands it becomes the **sole writer** of `managedBy:'sync'` rows and replaces a user's rows transactionally (AD-13).

## Operators (AD-8)

- Allowed now: `==`, `IN`.
- `!=` is **barred from AR/tier-granting rules** — negation is satisfied by missing data, which inverts fail-closed (a user on no projects would match every `!=` condition). If ever introduced, `!=` is FR-scoping/deny-only.
- Any operator not expressible as an indexed SQL join is barred from tier resolution entirely.

## The AccessControl facade (AD-9)

The **only** authorization entry point, in every context:

```ts
// FR capability check — global, no target:
accessControl.isAllowed(userId, feature)

// AR tier/section check — ALWAYS scoped to target employee(s):
accessControl.resolveTiers(viewerId, employeeIds)   // bulk tier map
accessControl.canAccessSection(viewerId, section, targetEmployeeId)
```

Forbidden everywhere: reading the policy tables directly from another context, `isManager || isPP`-style flags, caching a tier result across requests without graph-change invalidation.

## Tier resolution (AD-10)

- One recursive SQL query (`WITH RECURSIVE`) per request resolves the viewer's tier — Self / Manager-line / PP / Colleague — against **all** requested employees in a single round trip. This is what makes the 500-record / 2-second NFR (§7) hold.
- The walk treats reports-to edges and manages-**project** policy attachments as **one** transitive graph. Compound chains must resolve: A manages B (reports-to) and B is DM of project P ⇒ A is in the Manager line of everyone on P.
- **Manages-department is not live yet.** `Policies.targetType:'department'` exists in the schema but the walk does not honor it — Department edge modeling is Deferred (`database-schema.md`). A `department`-targeted policy row contributes zero grants today, same fail-closed treatment as an unwired `mentorship` `Relationship` edge.
- The `Relationship` join in this query filters `type = 'direct'` exclusively. `project` rows are read from `Policies`/project-membership joins, never from the recursive `Relationship` edge; `mentorship` rows are **never** read by this query at all, even though `mentorship` shares its `reportsToUserId` column with `direct` in storage (AD-11) — that's a storage-layout fact, not a walk-inclusion rule.
- Section visibility = the tier map joined against the seeded tier→section mapping (the §3.2 matrix as data).
- The profile page's single-target check is the same query with one target — not a second mechanism.
- Derived access decisions are **never** persisted (§6: a stale permission cache is a data leak).
- When a resolution spans the policy query plus a per-`targetType` lookup (resolving `targetId`s against the table `targetType` names), **both calls run in one transaction** — no torn reads between policies and their targets.
- Secondary polymorphic lookups are fine for feature/audience resolution but barred from the tier hot path.

## Fail-closed, always (AD-11, AD-12)

- Missing or orphaned data yields **less** access, never more. An empty `reportsTo` grants nothing. A policy row whose `targetId` points at a deleted project joins to zero members and grants zero access.
- No superuser is derived from data shape. The bootstrap admin is an ordinary user whose power comes from an explicitly **seeded HR Admin functional role**, delegable and revocable through the ordinary UI path.
- Top-of-tree sees everyone below purely via the normal transitive walk — no special case in the engine.
- Server-side, per section, per request (§3.3.4): a section the viewer cannot access is not rendered **and not returned by the API** — not filtered in the frontend.
