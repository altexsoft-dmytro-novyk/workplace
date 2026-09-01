# Access Control — Policies Engine

Binding rules for all authorization. Spine: AD-6, AD-7, AD-8, AD-9, AD-10, AD-11, AD-12, AD-13, AD-19, AD-20. Normative requirements: `docs/project-requirements.md` §2–§3.

## One engine, AWS-style policy attachments (AD-7)

Both dimensions share four access-control structures (full schemas in
[database-schema.md](database-schema.md)):

- `Policies` — a rule: `{operator, targetType, targetId, targetRole, type: 'AR'|'FR', managedBy: 'sync'|'admin'}`. Attachment examples: [database-schema.md](database-schema.md).
- `Permissions` — canonical immutable feature keys. The normative product catalog remains the full granular list in §2.3, with each permission independently grantable. The changelog's team-drafted/PO-confirmed defaults are a process follow-up absent from the normative SoT; do not hard-code defaults until that confirmation is recorded.
- `PolicyPermissions` — normalized FR role-to-permission grants.
- `UserPolicies` — attachment join: which users hold which policies. One policy row can be shared by many users.

Rules that follow:

- Project/department managerial grants are policy attachments. "Y is DM of project X" is a policy row attached to Y — `Project` has no `pmUserId`/`dmUserId` columns and no member array. People Partner is different: `Relationship type='people_partner'` is the organisational fact; policy/matrix evaluation controls what the derived PP audience may do (AD-19). HTTP surfaces are fixed in [api-conventions.md](api-conventions.md).
- Normative product direction: `type: 'FR'` policies are runtime-editable through the HR Admin UI. `type: 'AR'` policies are written once by the seed script and have **no** UI.
- A new functional role never widens data access (§2.3): FR grants features; what data those features can touch is bounded by the holder's computed access audiences. Feature permissions operate **within** the holder's resolved audiences only — a campaign creator without a manager relationship sees recipients through the colleague view (§2.3, §3.3.7).
- Policy evaluation is **type-separated**: FR checks never enter the AR tier-resolution hot path, and vice versa.
- An AR policy attachment grants access only when joined to a **live** relationship row of the matching type — a PM policy with no `type='project'` membership for that project yields zero grant (fail-closed). FR evaluation never reads relationship rows.
- `managedBy` provenance separates future sync-written rows from admin-written rows. When the timetracker integration is deployed, it becomes the **sole writer** of `managedBy:'sync'` rows and replaces a user's rows transactionally (AD-13).

### Functional-role Kernel MVP (AD-4)

`Policies.id` is the FR `roleId`. FR rows require a non-null `targetRole` role
key and carry `targetType=NULL` and `targetId=NULL`; AR rows require both target
values. Reviewed custom PostgreSQL migration SQL enforces that type-specific
shape and unique FR role keys.
`PolicyPermissions(policyId, permissionId, policyType)` stores the role's
permission set and rejects duplicate pairs. Custom PostgreSQL migration SQL
fixes `policyType` to `FR` and enforces a restrictive composite foreign key
from `(policyId, policyType)` to unique `Policies(id, type)`, so an AR policy
cannot receive a permission grant.

The functional-role slice in `access-control` implements the live,
data-driven `isAllowed` service and repository port. `AccessControlFacade`
only delegates to and exposes it. The evaluator joins the active user,
`UserPolicies`, `Policies type='FR'`, `PolicyPermissions`, and the canonical
`Permissions.key`. The public permission key is an open, case-sensitive string
constrained by lowercase `context:action` syntax, not a closed union of the
MVP values. Permission keys are append-only identities; no writer updates one
in place or bypasses the Access Control-owned mutation boundary. The evaluator
branches on no permission key and never compares `targetRole`, a role name, or
`User.position`; unknown, differently-cased, or nonmatching data denies.
Kernel MVP runtime eligibility includes `User.isActive`. AD-20 request-time
due/departure enforcement is deferred from ACM-1/ACM-2 until the Departure
persistence seam exists. In particular, `position === 'HR Admin'` is
prohibited as an authorization rule or fallback.

The seed contains exactly one `hr-admin` role, exactly these three permission
rows, exactly the corresponding three grants, and one attachment to the active
user matching `ROOT_WORK_EMAIL` after DEC-UM-007 normalization:

- `user-management:create`
- `user-management:deactivate`
- `user-management:list`

There are no other seed-owned default grants. On a fresh database those are
the exact FR rows. Reruns non-destructively ensure the bootstrap identities,
fail atomically on conflicting seed-owned drift, and never delete or rewrite
later non-bootstrap catalog state. **MVP reduction:** this deploy-time catalog
is seed/migration-owned and has no HTTP mutation surface; no `/roles` HTTP
surface ships in the Kernel MVP. Runtime role administration and the complete
§2.3 permission catalog remain future normative product work.

Before ACM-1, the deploy-time root User step **creates and validates** the root
identity so a fresh migrated database is satisfiable without an unnamed external
prerequisite. It normalizes `ROOT_WORK_EMAIL` under DEC-UM-007, **stores the
normalized value** so storage is canonical, and ensures exactly one active User
whose normalized `workEmail` equals it; unrelated active employees never affect
that count. Exact-one eligibility counts **all** normalized matches first and
checks active state only afterwards, so a count other than one fails as
unmatched or ambiguous before `isActive` is consulted. A normalized match that
is not the intended root is never adopted, mutated, or reactivated, and
concurrent runs converge through the unique violation on `users_workEmail_key`
followed by a re-read and re-validation. Normalized uniqueness is **not**
database-enforced — `users_workEmail_key` indexes the raw stored value — so the
guarantee is writer-side and the database-enforced fix is separately gated
deferred work. The Kernel SPEC tracks this step as CAP-8 and dispatches it as
ACM-0, whose production entrypoint is `services/backend/prisma/seed.ts`
(`npm run db:seed`). ACM-1's entrypoint is
`services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`
wrapped by `services/backend/scripts/bootstrap-access-control.ts`
(`npm run db:bootstrap:access-control`); deployment order is `db:deploy` →
`db:seed` → `db:bootstrap:access-control` → `start:prod`. ACM-1 begins one
transaction and first acquires the common transaction-scoped PostgreSQL
advisory lock derived from `access-control:bootstrap:root-hr-admin`. It then
locks the root User, the `AccessControlBootstrap` singleton, and its recorded
attachment and revalidates exact-one active eligibility and identity before
writes and before commit. The singleton keyed `root-hr-admin` durably stores
normalized root email, root User id, and policy id; later administrator-created
attachments are not bootstrap state. A normalized email change after bootstrap
is conflicting drift: fail atomically with actionable diagnostics; never
transfer the attachment or create another root attachment. This prerequisite
authorizes no User Management API, CRUD, runtime role management, or other User
Management feature work.

With **no** `AccessControlBootstrap` singleton recorded, ACM-1 adopts an existing
FR `hr-admin` policy by natural key and adopts an existing `hr-admin` attachment
only when that attachment already belongs to the located root, then writes the
singleton; attachments belonging to anyone else stay non-bootstrap administrator
state and are neither adopted nor transferred. A changed configured root with no
singleton has no recorded provenance and therefore no drift to detect. With the
singleton **present**, a changed normalized root is conflicting drift. The
asymmetry is deliberate: absent singleton permits adoption, present singleton
forbids transfer.

FR role-key uniqueness is the **partial** index `UNIQUE targetRole WHERE
type='FR'`, so an **AR** policy carrying `targetRole='hr-admin'` is legal and is
a different object. ACM-1's lookup and ACM-2's evaluation always filter
`type='FR'`; that AR row is never adopted, mutated, counted, or reported as
drift, is preserved, can hold no grant, and any `UserPolicies` row attaching to
it is never bootstrap state.

Any future FR user attachment command references an existing
`Policies.id`/`roleId`; the current inline FR body in `api-conventions.md` is
superseded for FR and must be synchronized before that User Management-owned
story enters Stage 1.

## Operators (AD-8)

- The initial facade slice supports **only** the equality operator, `==`.
- Policy-level `IN` is explicitly deferred. `Policies.targetId` is a single UUID today, so there is no approved representation for a target set. Do not add an enum value, seed data, evaluator branch, or application-side set-membership fallback until a separate design defines the product use case, valid target types, cardinality, set storage and mutation rules, and an indexed query plan.
- A SQL `WHERE ... IN (...)` used internally to fetch a requested bulk list is not the policy operator and does not enable policy-level `IN`.
- `!=` is **barred from AR/tier-granting rules** — negation is satisfied by missing data, which inverts fail-closed (a user on no projects would match every `!=` condition). If ever introduced, `!=` is FR-scoping/deny-only.
- Any approved operator must be expressible as an **indexed SQL join** on the hot path; full-table scans and application-side policy set membership are barred from tier resolution.

## The two dimensions (AD-6)

- **Access roles** — *what data can this person see about that person.* Computed live from relationships, per request. Never assigned, never stored.
- **Functional roles** — *what features does this person get.* Assigned as data, extensible at runtime through the HR Admin UI (§2.3).

Collapsing these into one list of roles is the canonical mistake (§2). The vocabulary rule in [domain-driven-design.md](domain-driven-design.md) enforces the split at the naming level.

## The AccessControl facade (AD-9)

The **only** authorization entry point, in every context:

```ts
type SectionAccess = 'none' | 'read' | 'write'

// FR capability check — global, no target; permissionKey is context:action:
accessControl.isAllowed(userId, permissionKey)

// AR audience/section check — ALWAYS scoped to target employee(s):
accessControl.resolveAudiences(viewerId, employeeIds)   // bulk map: reporting / project / pp / self / colleague per target
accessControl.canAccessSection(viewerId, section, targetEmployeeId): SectionAccess
```

Forbidden everywhere: reading the policy tables directly from another context, `isManager || isPP`-style flags, caching an audience result across requests without graph-change invalidation.

`AccessControlFacade.isAllowed` is an exposure boundary, not a second
implementation: it delegates to the functional-role slice's domain service.

`canAccessSection` returns only the base section decision. It does not serialize
fields or decide record-specific visibility: S5's CV/certificate subset, S7/S8
record flags, S10/S11 colleague field subsets, S16 custom-field metadata, and
workflow-specific views need an approved owning-context projection contract. That
contract calls this facade and may only narrow its result; it never reads policy
tables or infers an audience itself.

**`canAccessSection` S13 support is a pending increment** that the `mentorship`
context depends on (`docs/architecture/mentorship.md` §5.3, Decision 3) — same
class as the S9 career-timeline gap. ACM-5 ships `'S1'`/`'S10'`/`'S11'` only;
every other string returns `'none'`. Until an increment adds `'S13'`, mentorship
runs an interim rule derived from `resolveAudiences` with a recorded expiry
trigger. Tracked in
`_bmad-output/implementation-artifacts/access-control/deferred-work.md`.

### Dual-dimension gate (§2.2)

**Both dimensions must permit a mutating operation.** A write requires `isAllowed(viewerId, feature)` **and** matrix write access for that section on the target (via `canAccessSection` and §3.3 exceptions). Matrix-only or feature-only checks are insufficient.

Matrix exceptions (§3.3, DEC-UM-001) further narrow write paths — for example, S9 manual mutation is limited to assigned PP and direct Unit Manager even when the matrix cell shows RW for broader reporting-line viewers.

### List, filter, export, and search (§3.3.1, §4.1)

Profile sections are not the only authorization surface. Every list column, filter predicate, export column, and search result must respect the same audience rules. Notifications are good-to-have; if selected, they follow the same projection rule:

- Resolve audiences per row (`resolveAudiences`) before projecting fields.
- Apply section-level matrix cells **and** field-level rules (colleague whitelist §3.3.4, custom-field visibility §3.3.6, campaign-author scoped access §3.3.7, request-scoped fields §4.7).
- A filter must not leak a value the viewer cannot read — including custom fields at colleague visibility (§3.3.6) and request-scoped fields such as expected compensation (§4.7).

### Denial conventions

Per [test-cases/README.md](../test-cases/README.md): missing/invalid token → `401`; valid token without feature permission or write to a readable section → `403`; valid token touching a `—` cell or hidden field → `404` with a leak-free body. HR Admin (configuration FR only, §2.2) has **no default data access** — profile reads without a relationship-derived audience or full-profile grant follow the same denial rules.

### User Management adoption seam

The facade is headless: the Kernel MVP composes `AccessControlModule` into
`AppModule` (ACM-8) but User Management still binds `ACCESS_CONTROL_PORT` to
its interim adapter. Adopting the real facade for `/users/:id` is a
User Management-owned slice, not an Access Control change (AD-2). The seam is
the single `ACCESS_CONTROL_PORT` provider binding in
`services/backend/src/user-management/user-management.module.ts`; a real
adapter in `src/user-management/infrastructure/` injects the facade forwards
across the boundary and replaces the interim adapter wholesale (AD-21). One
binding answers three routes at once — `GET /users/:id`, `PATCH /users/:id`,
`PUT /users/:id/photo` — so behaviour is chosen per feature, not per route.
The per-route feature → audience/section mapping and the §2.2 dual gate for
the write routes are specified in
`_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md`,
answering `_bmad-output/implementation-artifacts/access-control/um-integration-contract-response.md`.
For `GET /users/:id` the read is `200` with the **minimal S1 identity card**
(shipped in adoption Story 0.1) for **any non-empty audience** — `self`,
`reporting`, `pp`, **or `colleague`** (§3.2's S1 row is `R` for the Colleague
column, and the matrix legend makes every active authenticated viewer at
least a Colleague); denials are `401` when the session does not resolve to an
active `User` (the session layer's responsibility) and `403` when an
authenticated active viewer's audience over the target is empty. *(Revised
2026-09-01 by human product decision — the earlier "two-state colleague rule"
and adoption story `UMAC-3` are removed; the earlier "leak-free `404`" for an
empty audience is withdrawn in favour of standard `401`/`403` — this is an
internal directory and a user id's existence is not sensitive.)* The *further*
field/record narrowing (colleague S10 dates-only on `GET /users/:id/leaves`,
colleague S11 name-only, S16 per-field visibility §3.3.4/§3.3.6, S7/S8 flags,
S1 derived-field immutability) stays the separate Profile Projection story on
its own surfaces, decoupled from `GET /users/:id`. The "consumer contract"
deferral elsewhere in the Access Control planning set is now **pointed at that
package**, not open-ended; the product gate stays open until it and the
separate Profile Projection story land.

### Bulk short-circuit

`resolveAudiences(viewerId, [])` returns an empty map immediately — no graph walks or policy queries.

## Audience resolution (AD-10)

The §3.2 matrix has distinct audience columns — not one merged "Manager line." Per request, resolve audiences per viewer×target employee; never collapse them into a single tier.

### Audience columns (§3.2)

| Column | Resolution inputs | Notes |
| --- | --- | --- |
| **Self** | `viewerId === targetEmployeeId`, **after** both viewer and target are confirmed present and active | Identity validation runs **before** any audience derivation, Self included; Self is exclusive only once that confirmation holds (where target = viewer, one confirmation settles both). An unconfirmed viewer or target yields an empty audience `Set` — never Self, never the Colleague floor. Once confirmed, Self applies before any manager column (unique cells per §3.2 — e.g. S2/S3 RW, S6 no access, S1 photo RW). A viewer in their own reporting chain does not also inherit manager cells for their own profile. |
| **Reporting line** | Reports-to + department management (transitive) | Separate graph from project |
| **Project line** | PM/DM via shared project assignment + project-management chain only | Narrower cells per §3.3.2; evaluated **per shared project** before column merge |
| **PP** | `Relationship type='people_partner'` + the assigned PP's `direct` HR line above (§2.1, AD-19) | Not the employee's reporting chain; section rights still come from matrix/policy projection |
| **Colleague** | Authenticated employee with none of the above | Whitelist only (§3.3.4): S1, S10 dates-only, S11 project name |
| **Shared link** | Authenticated named recipient via valid share link (§4.8) | Overlay; never anonymous; never grants write |

**HR Admin is not an audience column** (§3.1). Full-profile access is a separate overlay grant (§2.4).

### Three manager relations, two matrix audiences (§2.1)

| Relation | Matrix audience | Walk inputs |
| --- | --- | --- |
| Reports-to | Reporting line | `Relationship type='direct'` recursive tree |
| Department management | Reporting line | `Policies targetType:'department'` over nested department membership (§4.17) |
| PM/DM of employee's project | Project line | `Relationship type='project'` + manages-project policy attachments |
| Assigned PP + HR line above | PP (not Reporting/Project) | `Relationship type='people_partner'` + PP's own `direct` manager chain inside HR (§2.1, AD-19) |

**Reporting line** and **Project line** are resolved by **separate graph passes**. Do not walk reports-to and project PM/DM attachments as one transitive graph. A reports-to manager of a DM does **not** inherit Project-line access to the DM's project members unless they hold their own project-management relation to that project. Project-line chain walks **project-management policy attachments only** — not reports-to edges.

**Department management** is a Reporting-line relation (§2.1 relation 2). Implementation may be phased: until the department edge contract and walk are live, `department`-targeted policy rows contribute nothing (fail-closed, AD-12). Mentorship pairs are never audience-resolution inputs (AD-17).

PP inheritance has the same Department dependency: the assigned PP edge resolves the direct PP audience, but transitive propagation above that PP must stop until the approved Department model identifies the HR boundary. Never walk an unrestricted reports-to chain and call it “inside HR” (AD-19).

### Multi-audience merge

When a viewer holds multiple audiences for the same target (for example Reporting + Project + PP):

1. Compute each applicable matrix column independently (project line per shared project first).
2. For each section, take the **best** column permission: RW > R > no access.
3. Apply overlays after relationship-derived columns: **shared link** (if valid; per-section cfg from link creation, §4.8) then **full-profile access** (if held; column mapping unresolved — see below).

Self is not merged with manager columns for the same viewer×target when `viewerId === targetEmployeeId`.

Project line is narrower than Reporting line (§3.3.2): no S2/S3; S5 is CV and certificates only; PM S7 is flag-gated read.

### Matrix exceptions (§3.3)

Section access from the matrix is **necessary but not sufficient**:

| Rule | Binding behavior |
| --- | --- |
| §3.2 fn 1–2 S1 derived fields | Manager, people partner, and department on S1 are **read-only for every audience** — changes use the organisational-relationship screen (§2.1), not S1 PATCH. Reporting-line and Project-line RW cells apply to directly stored identity fields only. |
| §3.3.4 Colleague whitelist | Exactly S1, S10 (dates only — leave type hidden), S11 (project name only). Absent from API, not frontend-filtered. |
| §3.3.6 Custom fields (S16) | Per-field visibility: *management* (default), *employee* (+ Self), *colleague* (+ everyone). List filters and columns must not leak hidden values. |
| §3.3.7 Campaign author | See **Campaign-author scoped access** below — not general profile or S14 access. |
| DEC-UM-001 S9 write | Reporting line, project line, and PP may **read** S9; **manual** add/correct/delete limited to assigned PP and direct Unit Manager only. |
| S13 mentorship-pair closure note (FR-M10, DEC-UM-001 pattern) | The closure note on a `MentorshipPair` is readable **only** by the mentee's **Reporting line**, **Project line**, and **PP** — **never** the mentor, the mentee (Self), or a colleague. **Narrower** than the S13 `RW`/`R (pairs)` cell (which would otherwise let Self read it). `mentorship`'s projection narrows the facade result via `resolveAudiences` ∩ `{reporting, project, pp}`; it reads no policy tables and derives no audience. Pairs never feed audience resolution (AD-17). `docs/architecture/mentorship.md` §5.3. |
| §3.3.2 S7 PM exception | PM project-line S7 is read-only and flag-gated (*visible for PM*). UM/DM/PP write paths unaffected by flag. |
| §3.3 S7/S8 record flags | S7: employee sees only records flagged *visible for employee*. S8: employee sees only records flagged *shared with employee*. Flag filtering applies within an allowed section. |

The organisational-relationship screen invokes the approved relationship/policy application commands. PP replacement is the fixed-cardinality atomic command from AD-19, not a generic policy attachment. Every action requires the dedicated `change organisational relationships` permission, rejects self-assignment, and writes the §3.4 journal entry in the same transaction as the fact change.

### Campaign-author scoped access (§3.3.7)

Campaign-author visibility is **not** a matrix audience and must **not** grant general profile access or S14 access:

- **Identity join:** the viewer is the **author** of campaign C and the target employee is a **recipient** of C (frozen audience at activation, §4.12).
- **Lifecycle cutoff:** access exists only while C is **open**; when the campaign **closes**, all author→recipient visibility ends immediately.
- **Permitted fields only:** target **name** (identity-card subset) and **completion status** for that campaign's action item — nothing else from S14, nothing from any other section.
- For all other fields, normal matrix and colleague rules apply; this exception does not compose into broader read access.

### Request-scoped fields (§4.7)

Some fields live on the **resourcing request**, not the employee profile:

- **Expected compensation level** is visible **only** to the request **author**, the **routed Unit Manager**, and the **reviewing Delivery Manager** for that request.
- **Never** on an employee profile, shared link (including §4.7 resourcing auto-links), list column, export column, or unrelated search/filter surface.
- Enforce at projection time on request endpoints — profile audience resolution must not surface this field.

### Shared-link overlay (§4.8)

- Authenticated, **named recipient only** — no anonymous bearer mode.
- Link validity (not expired, recipient matches, creator still holds relationship-derived access to the target) is checked **before** applying the overlay. **The creator's access is re-checked on every view** — if the creator no longer holds manager or PP access over the target, the link is dead (§4.8). Expired or invalid link → `404` leak-free; no fallback to Colleague.
- Per-section selection follows the Shared link matrix column; **`cfg` sections off by default, S1 on by default**.
- **Resourcing auto-links (§4.7)** use a fixed evaluation-view section set — not free cfg selection: S1, S4, S11, S12, S5 as CV plus certificates; S6 optional; never S2, S3, S7, S8. **Expected compensation is never included** (see Request-scoped fields). Expiry may differ from generic share links (§4.8).
- Never-shareable: **{S3, S7, S13, S14}**.
- Shared links never grant write access.
- Revocation rights follow the current relationship holder; full-profile holders are the backstop (§2.4).

### Full-profile access overlay (§2.4)

Separate from HR Admin (configuration-only, §2.2) and from relationship-derived audiences:

- First holder seeded at deployment.
- Only an existing holder may grant; no self-assignment.
- Removing the last holder is blocked — including self-revocation by the sole holder.
- Every grant and revocation is journaled (§3.4).
- Holders are the **backstop** for shared-link revocation when the relationship holder cannot revoke.
- Full-profile resolution runs as an overlay **after** relationship-derived audience merge.

> **Unresolved:** Requirements define grant mechanics (§2.4) and state there is no profile-level permission (§3.1), but do **not** specify which §3.2 column(s) the overlay equates to. Test scenarios in `matrix/full-profile-access/` must be approved against an explicit product decision before implementation hard-codes a column mapping.

### Relationship and access journal (§3.4)

A narrow journal (not a general audit log) records:

- Manager, people partner, and department changes
- Department-manager changes
- Full-profile-access grants and revocations
- Shared-link accesses

Mutations that change tier-resolution inputs must emit the appropriate journal entry in the same transaction as the org-fact write.

### Revocation timing (§2.1, §5.1)

| Relation class | When access ends |
| --- | --- |
| Platform-owned (reports-to, department, PP assignment) | **Next request** — no cross-request tier cache without invalidation on graph change. Unaffected by timetracker sync outage. |
| Project-derived (PM/DM via project assignment) | Within **15 minutes** of assignment end |
| Departure (§4.16) | Recording is rejected while the person manages or partners anyone. From `00:00` effective date in configured business timezone, request-time auth/AccessControl denies the actor even if the worker is delayed or retrying; this overrides the project 15-minute window. Access others held **over** the profile follows dismissed-target rules. |
| Timetracker sync outage | Serve last-known project/assignment data behind a **visible banner**; **withdraw all project-derived access** after **4 hours** of failed sync |

Platform-owned and project-derived clocks apply independently — a batch containing both uses the per-audience rule above.

> **Unresolved:** Requirements specify the 4-hour withdrawal for failed sync but do not define behavior for partial/intermittent sync success. Treat as product decision before hard-coding stale-grant thresholds.

> **Integration discovery gate:** Repository documentation does not yet establish whether timetracker project assignments arrive as events or state-at-sync. Before adapter scenarios or implementation, inspect the provider contract and record that answer in the spine. Neither model may be assumed meanwhile.

### Open product decisions

Do not hard-code until explicitly decided:

| Decision | Gap |
| --- | --- |
| Full-profile overlay column mapping | §2.4 grant mechanics vs §3.1 no profile-level permission — which §3.2 column(s) does the overlay apply? |
| Full-profile + Self precedence | When a full-profile holder views their own profile, which wins per section — Self column or overlay? |
| Partial timetracker sync | §5.1 defines failed-sync withdrawal only; no rule for intermittent partial success. |
| Policy-level `IN` operator | Deferred from the initial facade slice. It needs a concrete product use case plus approved target-set storage, valid `targetType` values, cardinality/mutation rules, and indexed query plan. |

### Bulk, live, never stored

- One round trip per graph—or one combined query plan—resolves all requested targets — this is what makes the 500-record / 2-second NFR (§7) hold.
- Profile single-target is the degenerate case.
- The reporting walk filters `Relationship type='direct'` exclusively. An **absent** manager edge is a clean chain end. An edge whose **endpoint is inactive** is treated as **no edge** — the walk terminates fail-closed there, with no transitive continuation past the dead node. An edge whose **endpoint row is missing** cannot exist in supported operation: `relationships_shape_check` requires a non-null `reportsToUserId` on `direct` and `people_partner` rows and the endpoint foreign key is `ON DELETE RESTRICT`. `User` carries no soft-delete column, so no soft-deleted user or bridge state participates here.
- Reporting visited state is path-local to each requested target; shared
  ancestors across target walks are not repeats. Reaching the viewer proves the
  viewer sits on that target's chain but is **provisional** — it does not by
  itself grant Reporting. The walk continues to chain termination, and
  Reporting is granted only when that target's whole walked chain terminates
  without repeating a node. A repeated node anywhere in the chain, **before or
  after viewer proof**, denies Reporting for that target only and stops the
  walk; a viewer inside a cycle is therefore denied rather than proven. Self and
  direct PP are evaluated independently of that denial; Colleague still applies
  only when no stronger valid audience remains.
- Chain termination is the absence of a further usable manager edge. An absent
  edge is a clean end. An edge whose endpoint is **inactive** is unusable and is
  treated as absent for traversal: **before** viewer proof the viewer is
  unproven and Reporting is denied; **after** viewer proof the chain has already
  terminated without a repeat, so Reporting is granted while nothing above the
  dead node becomes reachable.
- Project line reads `type='project'` rows and project policies.
- Mentorship pairs never participate in either walk (AD-17).
- Section visibility = resolved audiences joined against the seeded tier→section mapping (Reporting, Project, PP, Self, and Colleague columns).
- Derived access decisions are **never** persisted (§6: a stale permission cache is a data leak).
- When resolution spans the policy query plus a per-`targetType` lookup, **both calls run in one transaction** — no torn reads.
- Polymorphic lookups are allowed for feature and audience resolution but barred from the tier-resolution hot path.

### Effective-departure cutoff (AD-20)

**Kernel MVP deferral:** ACM-1/ACM-2 do not implement this section because the
current backend has no Departure persistence seam. The rules below remain the
binding future target, including the dismissed-target projection; this
deferral does not redefine them. This is the local AD-4 scoped amendment to
inherited AD-20 for the entire Kernel MVP, explicitly ACM-0 through ACM-5;
ACM-8 only composes and ACM-9 only measures. The future seam does not itself
authorize implementation; later lifecycle/full-facade work requires its own
AD-1 gate.

Before any feature or audience decision, authentication/session validation and `AccessControl` check whether the actor has a due Departure under the configured business timezone. Due means inactive even in `scheduled`, `processing`, or `retry_wait`; do not cache this result across requests. Worker failure can delay materialized cleanup but can never restore access. Once a future departure is scheduled, platform relationship commands reject new direct-report, department-manager, or PP responsibility for that actor, and timetracker sync quarantines a new PM/DM grant with an operational incident.

Relationship projection is directional while a due departure is not yet materialized:

| Due person position | Request-time rule |
| --- | --- |
| Viewer/actor | Deny before feature or audience resolution. |
| Target employee (`Relationship.userId`) | The current manager/PP may still resolve access to the read-only dismissed-target projection; the target is absent from default active lists. |
| Manager/PP endpoint (`reportsToUserId`) | The edge grants no audience to the due person and cannot be used as a transitive bridge to that person's managers/HR line. |
| Intermediate node in reporting/PP recursion | Stop traversal at the due node; do not grant an ancestor access through it. |
| Shared-link creator/revoker | Creator authority is rechecked and fails immediately when the creator is due; links relying on it stop. |

The worker's physical cleanup converges persisted state to this same projection. Legacy blocker scenarios must include `employee → due manager → ancestor` and `employee → due PP → senior HR` negatives.

## Fail-closed, always (AD-11, AD-12)

- Missing or orphaned data yields **less** access, never more. An empty `reportsTo` grants nothing. A policy row whose `targetId` points at a deleted project joins to zero members and grants zero access.
- Dangling `Policies.targetId` after a hard-deleted `Relationship` or other target fails closed on the join; a **periodic consistency sweep** removes orphan policy rows (AD-11, [database-schema.md](database-schema.md)).
- No superuser is derived from data shape. The bootstrap admin is an ordinary user whose power comes from an explicitly **seeded HR Admin functional role**, delegable and revocable through the ordinary UI path.
- Top-of-tree sees everyone below purely via the normal transitive walk — no special case in the engine.
- Server-side, per section, per request (§3.3.4): a section the viewer cannot access must not be rendered **or returned by the API** — not filtered in the frontend.
