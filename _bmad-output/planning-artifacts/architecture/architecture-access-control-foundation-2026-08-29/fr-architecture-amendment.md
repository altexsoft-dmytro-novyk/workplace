---
id: FR-AMD-1
title: Functional Role Architecture Amendment for Access Control Kernel MVP
status: approved
approval_scope: architecture-decision-only
kernel_spec_status: approved
implementation_status: stage-1-authorized
package_review_approved_by: user
package_review_approved: 2026-08-31
created: 2026-08-30
blocks:
  - ACM-1
resolves_when_approved:
  - OQ-3
  - OQ-4
  - OQ-6
  - OQ-7
  - OQ-11
sources:
  - ../../../specs/spec-functional-roles-catalog/SPEC.md
  - ../architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
  - ../../sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md
---

# Functional Role Architecture Amendment — Approved Decision

## Status and Authority

This amendment resolves OQ-3, OQ-4, OQ-6, OQ-7, and OQ-11 for the Access
Control Kernel MVP.

**Gate statement (the only one).** This amendment's architecture decisions are
approved and final under `approval_scope: architecture-decision-only`. **No
Stage-1 dispatch is authorized until the Kernel package review is approved** —
and no test, migration, seed change, or production code is authorized either.
Its approval is an architecture decision, not approval of the derived Kernel
SPEC; that package remains in independent review with implementation not
authorized, and its review status never reopens the decisions below.

This statement is used verbatim wherever this amendment's authority is
described. It replaces the earlier wording that said the amendment authorized
ACM-1 to enter Stage 1.

The decision is limited to the Access Control Kernel MVP. It must not create a
`/roles` surface, runtime role management, User Management changes, or frontend
work.

## Fixed Kernel Inputs

- Functional roles and permissions are data, never position checks.
- The kernel seeds exactly three canonical permission keys:
  `user-management:create`, `user-management:deactivate`, and
  `user-management:list`.
- The kernel seeds exactly one role, `hr-admin`, granting exactly those three
  permissions.
- Exactly one bootstrap attachment is selected through `ROOT_WORK_EMAIL`
  normalized according to DEC-UM-007.
- The deploy-time root User step **creates and validates** exactly one active
  normalized user before ACM-1, so a fresh migrated database is satisfiable
  without an unnamed external prerequisite. ACM-1 itself does not create or
  activate users. Its entrypoint is `services/backend/prisma/seed.ts`
  (`npm run db:seed`); ACM-1's is
  `services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`
  wrapped by `services/backend/scripts/bootstrap-access-control.ts`
  (`npm run db:bootstrap:access-control`). Deployment order is `db:deploy` →
  `db:seed` → `db:bootstrap:access-control` → `start:prod`, and Stage-2 evidence
  invokes those exact entrypoints rather than re-implementing them inline.
- Identity is canonical **at write**: the normalized value is what is stored, so
  the existing `users_workEmail_key` unique index blocks a duplicate normalized
  row. Exact-one eligibility counts **all** normalized matches first and checks
  active state only afterwards. Normalized uniqueness is not database-enforced;
  that gap is named and deferred rather than assumed away.
- An absent, blank, unmatched, ambiguous, inactive, or drifted root identity
  fails atomically; no position-based or first-user fallback is allowed.
- FR evaluation never supplies an audience or section grant.
- No evaluated decision is persisted or cached across requests.

## Decisions

### OQ-3 — Role-to-Permission Storage

`PolicyPermissions(policyId, permissionId, policyType)` is the normalized
many-to-many relation between an FR policy and its permissions:

- `PRIMARY KEY (policyId, permissionId)` is the uniqueness rule and prevents
  duplicate grants.
- `policyType` is stored `NOT NULL DEFAULT 'FR'` and constrained by
  `CHECK (policyType = 'FR')`.
- `(policyId, policyType)` references a unique `(Policies.id, Policies.type)`
  key and `permissionId` references `Permissions.id`; both use
  `ON DELETE RESTRICT`. The composite foreign key makes an AR-policy grant
  impossible at the database boundary.
- Add `(permissionId, policyId)` for the permission-first `isAllowed` join.
  `UserPolicies` uses `(userId, policyId)` for its attachment lookup.
- The discriminator `CHECK`, composite support key/foreign key, row-shape
  `CHECK`, and partial unique index below use reviewed custom PostgreSQL
  migration SQL, following the repository's established raw-SQL pattern.

No permission set is embedded in JSON or defined at user-attachment time.

### OQ-4 — Functional-Role Row Shape

An FR role is a `Policies` row with `type='FR'`; `Policies.id` is the `roleId`
used by attachments and any future catalog contract. `targetRole` is the role
key, and the Kernel MVP seeds exactly one `targetRole='hr-admin'`. A partial
unique index on `targetRole WHERE type='FR'` prevents duplicate FR role keys.
Authorization joins by IDs and never compares `targetRole`.

`Policies.type` is `NOT NULL` and restricted to `FR|AR`.

`targetType` and `targetId` are nullable. PostgreSQL enforces the type-specific
shape:

```sql
CHECK (
  (type = 'FR' AND targetRole IS NOT NULL
               AND targetType IS NULL AND targetId IS NULL)
  OR
  (type = 'AR' AND targetType IS NOT NULL AND targetId IS NOT NULL)
)
```

FR rows therefore use no sentinel target. `UserPolicies.policyId` references an
already-defined role by `Policies.id`.

### OQ-6 — Permission Catalogue Extensibility

**MVP reduction:** the Kernel MVP catalog is deploy-time seed/migration-owned,
has no HTTP mutation surface, and contains exactly three rows. Future work may
append permission rows only through a separately approved contract. This
reduction neither closes the normative §2.3 catalog nor settles `/roles`
runtime management.

### OQ-7 — Canonical Feature Identifier

`isAllowed` accepts an open, case-sensitive `Permissions.key` string, not a
closed union of the MVP values. Keys are unique and use lowercase
`context:action`. The exact initial values are:

- `user-management:create`
- `user-management:deactivate`
- `user-management:list`

Permission keys are append-only identities. No writer may update a key in
place or bypass the Access Control-owned catalog mutation boundary; any future
mutation port is separate from the evaluator query port. An unknown or
differently-cased key returns `false`. Call sites may use typed constants as
conveniences, but those constants never define the accepted key universe. The
evaluator remains data-driven and branches on no key.

### OQ-11 — Evaluator and Seed Ownership

ACM-1/ACM-2 in the functional-role slice of the existing `access-control`
context own the FR repository port, schema contract, seed contract, and
`isAllowed` domain service. `AccessControlFacade` delegates to and exposes that
service; it does not implement a second evaluator. The later functional-roles
catalog consumes this foundation and must not create a second schema, seed,
repository port, or evaluator.

## Seed Contract

After the deploy-time User prerequisite has created exactly one active
DEC-UM-007-normalized root User, seed atomically and idempotently:

1. Exactly the three permission keys above.
2. Exactly one `hr-admin` FR policy.
3. Exactly three `PolicyPermissions` grants from that role to those rows.
4. Exactly one `UserPolicies` attachment to the active user matching the
   normalized `ROOT_WORK_EMAIL`.

There are no other seed-owned default grants. Missing, blank, unmatched,
ambiguous, inactive, or drifted root identity fails clearly and atomically.
`position='HR Admin'`, first-user selection, and all other fallbacks are
prohibited authorization rules. ACM-1 begins one database transaction, locks
the common bootstrap serialization point, candidate User, bootstrap record,
and recorded `hr-admin` attachment, and revalidates normalization, exact-one
active eligibility, and attachment identity before any bootstrap write and
again before commit.

The common serialization point is a transaction-scoped PostgreSQL advisory
lock derived from `access-control:bootstrap:root-hr-admin`; it is acquired
before any bootstrap-state inspection and covers first creation when no row
exists. One Access Control-owned `AccessControlBootstrap` singleton keyed
`root-hr-admin` persists `normalizedRootEmail`, `rootUserId`, and `policyId`
with unique identity and restrictive references. It is the bootstrap
provenance record; later administrator-created `hr-admin` attachments are not.
Lock timeout fails the transaction with actionable diagnostics.

### Provenance when the singleton is absent

The drift rules below assume a recorded singleton. With **no**
`AccessControlBootstrap` row, ACM-1 behaves as follows, still inside the common
advisory lock:

| State | Behavior |
| --- | --- |
| No FR `hr-admin` policy, no attachment | First run: create the canonical rows and write the singleton. |
| An FR `hr-admin` policy already exists | **Adopt** it by natural key (`targetRole='hr-admin' AND type='FR'`) and record its id. Verify `operator='=='`, `managedBy='admin'`, and null `targetType`/`targetId`; fail on drift. Never create a second FR policy — the partial unique index forbids it. |
| Exactly one `hr-admin` attachment whose `userId` **is** the located root | **Adopt** it as bootstrap provenance and write the singleton. |
| `hr-admin` attachments exist but **none** belongs to the located root | **Do not adopt and do not transfer.** Create the located root's own attachment and write the singleton. The pre-existing attachments remain non-bootstrap administrator state and are preserved. |
| The configured root has changed | No recorded provenance exists, so there is no drift to detect. Adopt the currently configured normalized root. |

More than one candidate attachment for the root is impossible because
`UserPolicies` is keyed `(userId, policyId)`.

The asymmetry is deliberate and security-relevant: **with the singleton absent,
adoption is permitted; with the singleton present, a changed normalized root is
conflicting drift.**

If normalized `ROOT_WORK_EMAIL` changes after bootstrap, the existing
seed-owned attachment identifies conflicting bootstrap drift. ACM-1 rolls
back with actionable diagnostics; it never transfers the attachment and never
creates a second root attachment.

### Cross-type `hr-admin` collision

FR role-key uniqueness is the **partial** index `UNIQUE targetRole WHERE
type='FR'`, so an **AR** policy row carrying `targetRole='hr-admin'` is legal
and is a different object:

- ACM-1's lookup and ACM-2's evaluation always filter `type='FR'`.
- The AR row is never adopted, mutated, counted toward cardinality, or reported
  as drift, and it is preserved.
- It can hold no permission grant: `PolicyPermissions` fixes `policyType='FR'`
  by `CHECK` and references `Policies(id, type)` compositely.
- A `UserPolicies` row attaching a user to that AR policy is not an `hr-admin`
  functional-role attachment and is never bootstrap state.

Reruns are non-destructive ensure operations over the bootstrap identities.
They may insert missing bootstrap objects and verify their exact grants, but
must fail before writes on conflicting seed-owned drift. They never delete or
rewrite non-bootstrap permissions, roles, grants, or attachments created under
a later approved catalog contract.

### Seed-owned drift disposition

"Conflicting drift" is defined per canonical row and field, not as one blanket
rule. Every `fail` below aborts before any bootstrap write and rolls back with
actionable diagnostics naming the row, field, expected value, and found value.

| Canonical row | Field | Absent | Differs from canonical |
| --- | --- | --- | --- |
| `Permissions` (three keys) | `key` | restore the row | identity: a canonical key is present or absent, never different |
| `Permissions` | `id` | assigned on insert | preserve — the seed matches on `key` and never rewrites a generated id |
| `Permissions` | `description` | set on insert | preserve — descriptive text is not authorization-bearing |
| `Policies` (one FR row) | row keyed `targetRole='hr-admin'`, `type='FR'` | restore the row | identity, enforced by the partial unique index |
| `Policies` | `id` | assigned on insert | preserve, but fail when it differs from `AccessControlBootstrap.policyId` |
| `Policies` | `type` | — | fail — an `hr-admin` row that is not `FR` is conflicting drift |
| `Policies` | `operator` | — | fail — canonical `==`; no other operator is supported in this MVP |
| `Policies` | `managedBy` | — | fail — canonical `admin`; `sync` provenance is reserved to the timetracker integration |
| `Policies` | `targetType`, `targetId` | — | fail — FR rows carry no target, and the database `CHECK` also rejects it |
| `PolicyPermissions` (three pairs) | `(policyId, permissionId)` | restore the missing pair | identity |
| `PolicyPermissions` | `policyType` | — | fixed to `FR` by `CHECK`; cannot drift |
| `PolicyPermissions` | non-canonical pairs | — | preserve — an approved fourth permission granted to `hr-admin` survives |
| `UserPolicies` (root attachment) | `(userId, policyId)` | with a singleton present, restore only while it still matches the current normalized root, otherwise fail; with **no** singleton, follow *Provenance when the singleton is absent* above | fail when `userId` differs from `AccessControlBootstrap.rootUserId` — never transfer, never add a second root attachment |
| `UserPolicies` | later `hr-admin` attachments for other users | — | preserve — they are not bootstrap state |
| `Policies` | an **AR** row carrying `targetRole='hr-admin'` | — | preserve — partial FR uniqueness does not cover it; it is a different object, never adopted, mutated, counted, or reported as drift |
| `AccessControlBootstrap` | `key` | restore the singleton on first run | fixed to `root-hr-admin` by `CHECK` |
| `AccessControlBootstrap` | `normalizedRootEmail` | written on first run | fail as conflicting bootstrap drift |
| `AccessControlBootstrap` | `rootUserId` | written on first run | fail when it differs from the located active normalized root User |
| `AccessControlBootstrap` | `policyId` | written on first run | fail when it differs from the canonical FR policy |

## Brownfield Evidence and Migration Boundary

- The live Prisma schema contains no FR tables, and the live seed
  (`prisma/seed.ts`) creates only the root user while setting profile
  `position='HR Admin'`. It stores `ROOT_WORK_EMAIL` **verbatim** — it neither
  normalizes under DEC-UM-007 nor checks exact-one active eligibility. Closing
  both gaps is exactly ACM-0's production scope at that entrypoint.
- `users_workEmail_key` is a plain unique index on the **raw** stored
  `workEmail` (`20260810130423_init/migration.sql`). Create/update DTOs
  normalize on write, so API-created rows are canonical, but the database does
  not enforce normalized uniqueness and DEC-UM-007's claim that it does is not
  true of the schema today.
- `User` has **no soft-delete column**; `isActive` is the only lifecycle field.
- `relationships_shape_check` requires a non-null `reportsToUserId` on `direct`
  and `people_partner` rows, and the endpoint foreign key is
  `ON DELETE RESTRICT`, so a bridge edge whose endpoint row is missing cannot
  exist in supported operation.
- `UsersController` has global feature call sites for
  `user-management:list`, `user-management:create`, and
  `user-management:deactivate`.
- There is no live `/roles` controller or HTTP surface.
- `targetRole` is absent from runtime authorization checks.
- The interim adapter's `position === 'HR Admin'` authorization is
  noncompliant and must not survive ACM-2 adoption.
- Kernel MVP runtime eligibility requires `User.isActive`. AD-20 request-time
  due/departure enforcement is formally deferred because no Departure
  persistence seam exists. The documented current-manager/direct-PP read-only
  dismissed-target projection remains binding future work. This is a scoped
  amendment to inherited AD-20 for the entire Kernel MVP, explicitly ACM-0
  through ACM-5; ACM-8 only composes and ACM-9 only measures. Later lifecycle
  or full-facade work gets no exception, and future implementation still
  requires a new AD-1 sequence.

The deploy-time User prerequisite is intentionally narrow: normalize
`ROOT_WORK_EMAIL` according to DEC-UM-007 and ensure exactly one active User
whose normalized `workEmail` equals that value exists before ACM-1. Unrelated
active employees never affect that count. The Kernel SPEC tracks it as CAP-8 and
dispatches it as the ACM-0 AD-1 sequence. It authorizes no User Management API,
CRUD, runtime role management, or other User Management feature work, and it
does not implement User Management Story 1.1's population import. That import
is not blocked, but it is constrained by DEC-UM-009: no writer may create a
second row for a normalized email that already exists, active or inactive, so an
import covering the root person reuses the root `User` id rather than inserting a
second row.

**MVP reduction:** no `/roles` HTTP surface or permission-mutation port is part
of the Kernel MVP. Runtime role management and the complete §2.3 catalog remain
future normative product work.

Any future FR user attachment command references an existing
`Policies.id`/`roleId`. The inline FR definition body currently shown in
`api-conventions.md` is superseded for FR and must be synchronized before a
User Management attachment story enters Stage 1.

## Remaining Gate

The single gate statement in *Status and Authority* governs this amendment and
is not restated differently here. Type separation, fail-closed behavior,
uniqueness, seed atomicity, and non-overlap with the later catalog were
confirmed at approval and are not reopened. The one gate still open is the
separate independent review of the Access Control Kernel MVP spec package,
tracked here as `kernel_spec_status: in-review`; until that review is approved,
no Stage-1 dispatch is authorized.

AD-4 and this amendment supersede contrary or incomplete FR acceptance wording,
including any remaining description of soft-deleted `User`/bridge state, of a
missing bridge endpoint as a constructible case, or of database-enforced
normalized `workEmail` uniqueness.
The Kernel SPEC, stories, and sprint proposal are now synchronized through
`bmad-spec`; every ACM-1/ACM-2 Stage-1 dispatch cites these binding architecture
sources explicitly.

## Approval Record

**Decision:** approved  
**Approver:** P1  
**Date:** 2026-08-30  
**Conditions:** architecture-only update; no code, Prisma schema, migration,
seed, or test changes.

**Decision:** approved (package gate — supersedes the condition above)  
**Approver:** user  
**Date:** 2026-08-31  
**Conditions:** per FR-AMD-1, authorizes Stage-1 dispatch only
(`implementation_status: stage-1-authorized`); Stage-2 and Stage-3 each still
require their own per-stage approval recorded in `approvals.yaml`.
