# Access Control — Policies Engine

Binding rules for all authorization. Spine: AD-6, AD-7, AD-8, AD-9, AD-10, AD-11, AD-12, AD-13, AD-19, AD-20. Normative requirements: `docs/project-requirements.md` §2–§3.

## One engine, AWS-style policy attachments (AD-7)

Both dimensions run on the same three tables (full schemas in [database-schema.md](database-schema.md)):

- `Policies` — a rule: `{operator, targetType, targetId, targetRole, type: 'AR'|'FR', managedBy: 'sync'|'admin'}`. Attachment examples: [database-schema.md](database-schema.md).
- `Permissions` — the full granular feature list in §2.3, including approve/reject candidates, close resourcing requests, edit career timeline, create feedback, record departure, manage departments/custom fields, and change organisational relationships. Each is independently grantable. The changelog's team-drafted/PO-confirmed defaults are a process follow-up absent from the normative SoT; do not hard-code defaults until that confirmation is recorded.
- `UserPolicies` — attachment join: which users hold which policies. One policy row can be shared by many users.

Rules that follow:

- Project/department managerial grants are policy attachments. "Y is DM of project X" is a policy row attached to Y — `Project` has no `pmUserId`/`dmUserId` columns and no member array. People Partner is different: `Relationship type='people_partner'` is the organisational fact; policy/matrix evaluation controls what the derived PP audience may do (AD-19). HTTP surfaces are fixed in [api-conventions.md](api-conventions.md).
- `type: 'FR'` policies are runtime-editable through the HR Admin UI. `type: 'AR'` policies are written once by the seed script and have **no** UI.
- A new functional role never widens data access (§2.3): FR grants features; what data those features can touch is bounded by the holder's computed access audiences. Feature permissions operate **within** the holder's resolved audiences only — a campaign creator without a manager relationship sees recipients through the colleague view (§2.3, §3.3.7).
- Policy evaluation is **type-separated**: FR checks never enter the AR tier-resolution hot path, and vice versa.
- A policy attachment grants access only when joined to a **live** relationship row of the matching type — a PM policy with no `type='project'` membership for that project yields zero grant (fail-closed).
- `managedBy` provenance separates future sync-written rows from admin-written rows. When the timetracker integration is deployed, it becomes the **sole writer** of `managedBy:'sync'` rows and replaces a user's rows transactionally (AD-13).

## Operators (AD-8)

- Allowed now: `==`, `IN`.
- `!=` is **barred from AR/tier-granting rules** — negation is satisfied by missing data, which inverts fail-closed (a user on no projects would match every `!=` condition). If ever introduced, `!=` is FR-scoping/deny-only.
- Any operator not expressible as an **indexed SQL join** is barred from tier resolution entirely. Both `==` and `IN` must compile to indexed joins on the hot path — no full-table scans or application-side set membership.

## The two dimensions (AD-6)

- **Access roles** — *what data can this person see about that person.* Computed live from relationships, per request. Never assigned, never stored.
- **Functional roles** — *what features does this person get.* Assigned as data, extensible at runtime through the HR Admin UI (§2.3).

Collapsing these into one list of roles is the canonical mistake (§2). The vocabulary rule in [domain-driven-design.md](domain-driven-design.md) enforces the split at the naming level.

## The AccessControl facade (AD-9)

The **only** authorization entry point, in every context:

```ts
// FR capability check — global, no target:
accessControl.isAllowed(userId, feature)

// AR audience/section check — ALWAYS scoped to target employee(s):
accessControl.resolveAudiences(viewerId, employeeIds)   // bulk map: reporting / project / pp / self / colleague per target
accessControl.canAccessSection(viewerId, section, targetEmployeeId)
```

Forbidden everywhere: reading the policy tables directly from another context, `isManager || isPP`-style flags, caching an audience result across requests without graph-change invalidation.

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

### Bulk short-circuit

`resolveAudiences(viewerId, [])` returns an empty map immediately — no graph walks or policy queries.

## Audience resolution (AD-10)

The §3.2 matrix has distinct audience columns — not one merged "Manager line." Per request, resolve audiences per viewer×target employee; never collapse them into a single tier.

### Audience columns (§3.2)

| Column | Resolution inputs | Notes |
| --- | --- | --- |
| **Self** | `viewerId === targetEmployeeId` | Evaluated **first**; Self column applies before any manager column (unique cells per §3.2 — e.g. S2/S3 RW, S6 no access, S1 photo RW). A viewer in their own reporting chain does not also inherit manager cells for their own profile. |
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
| `IN` operator shape | AD-8 requires indexed joins; valid `targetType` values, set cardinality, and join shape are not specified in requirements. |

### Bulk, live, never stored

- One round trip per graph—or one combined query plan—resolves all requested targets — this is what makes the 500-record / 2-second NFR (§7) hold.
- Profile single-target is the degenerate case.
- The reporting walk filters `Relationship type='direct'` exclusively. A broken `reportsToUserId` edge (missing or soft-deleted user) is treated as **no edge** — walk terminates fail-closed, no transitive continuation through the orphan.
- Project line reads `type='project'` rows and project policies.
- Mentorship pairs never participate in either walk (AD-17).
- Section visibility = resolved audiences joined against the seeded tier→section mapping (Reporting, Project, PP, Self, and Colleague columns).
- Derived access decisions are **never** persisted (§6: a stale permission cache is a data leak).
- When resolution spans the policy query plus a per-`targetType` lookup, **both calls run in one transaction** — no torn reads.
- Polymorphic lookups are allowed for feature and audience resolution but barred from the tier-resolution hot path.

### Effective-departure cutoff (AD-20)

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
