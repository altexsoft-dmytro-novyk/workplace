# AD-4 security and data-integrity architecture review

## Final authority re-review — 2026-08-30

**Resolution:** Finding 1 below (High — AD-20 due-departure cutoff) is
**superseded**. `ARCHITECTURE-SPINE.md` AD-4 formally defers AD-20
request-time due/departure enforcement for the entire Kernel MVP — explicitly
ACM-0 through ACM-5, with ACM-8 composing only and ACM-9 measuring only — and
relies on `User.isActive` alone for the duration of this MVP. This does not
weaken `User.isActive` or retire the documented future dismissed-target
projection; it is a named, deliberate scope reduction, not an oversight this
finding needs to keep flagging.

**Verdict: CONDITIONAL PASS — no conflicting authorization or catalog decision was found, but the active-user rule and AD-4's reliance on companion documents must be made explicit at the ACM-1 gate.**

## Scope and evidence

Reviewed AD-4 in `ARCHITECTURE-SPINE.md` against:

- `fr-architecture-amendment.md`
- `docs/architecture/access-control.md`
- `docs/architecture/database-schema.md`

This is an architecture review only. It does not validate a Prisma schema,
migration, seed implementation, repository query, or runtime behavior.

## Findings

### 1. High — “active user” is ambiguous unless it incorporates the AD-20 effective-departure cutoff

AD-4 says authorization joins an active user attachment, and the seed attaches
the role to one active user selected by `ROOT_WORK_EMAIL`. However,
`database-schema.md` defines `User.isActive` as a technical account/retention
flag, explicitly not employment status. `access-control.md` AD-20 separately
requires every feature decision to deny a due departure before feature
resolution, even while the departure remains `scheduled`, `processing`, or
`retry_wait` and before `User.isActive` is materialized to false.

**Risk:** an implementation that interprets AD-4 “active” as
`User.isActive = true` could continue granting all three HR Admin permissions
after the user's effective departure time.

**Required gate clarification:** ACM-1/ACM-2 scenarios and query design must
define runtime eligibility as both the retained-account active check and the
AD-20 request-time departure cutoff. For seed selection, the approved
architecture must state whether “active” means only `User.isActive`, or also
excludes an already-due Departure. No fallback user may be selected.

### 2. Medium — critical schema and seed guarantees are not self-contained in AD-4

AD-4 states the type-shape `CHECK`, normalized grant relation, duplicate-pair
prevention, unique immutable key, exact catalog/grant cardinality, and active
root attachment. The enforceable details exist only in the companion amendment
and database schema:

- `PolicyPermissions` composite primary key `(policyId, permissionId)`
- FKs to `Policies.id` and `Permissions.id`
- `ON DELETE RESTRICT` on both FKs
- reverse index `(permissionId, policyId)`
- `UserPolicies` composite primary key `(userId, policyId)`
- partial unique FR role key on `targetRole WHERE type='FR'`
- one transaction and idempotent seed behavior
- clear atomic failure for absent, blank, unmatched, or inactive
  `ROOT_WORK_EMAIL`

**Risk:** implementing from the spine entry alone can produce correct-looking
authorization with weak referential integrity, an unindexed permission-first
join, or a partially committed bootstrap state.

**Required gate control:** FR-AMD-1 and `database-schema.md` must be treated as
binding acceptance evidence for ACM-1, not optional explanatory material.
Migration review must verify the raw PostgreSQL constraints/indexes because the
documented Prisma configuration does not express the required partial index.

### 3. Medium — exact seed cardinality needs a convergence/failure scenario, not only upserts

The evidence consistently requires exactly three permission rows, one
`hr-admin` FR policy, exactly its three grants, one root attachment, and no
other default grants. Composite keys make retries non-duplicating, but
idempotent upserts alone do not prove exact cardinality when a prior failed or
manual run has left extra grants or attachments.

**Risk:** seed reruns can report success while stale privilege-bearing rows
remain, creating more grants or bootstrap holders than the approved baseline.
Blind deletion is also unsafe because it could silently become runtime catalog
management.

**Required gate control:** seed scenarios must define the owned bootstrap
rows, lock/transaction boundary, and behavior on conflicting or surplus owned
rows. The safe default is atomic failure with diagnostics unless an explicitly
approved reconciliation rule exists. Tests must assert post-transaction
cardinality and rollback on every root-email failure case.

### 4. Pass — fail-closed and authorization predicates are correctly constrained

The reviewed sources consistently require:

- unknown, differently-cased, malformed, or orphaned data to deny;
- the database FR/AR shape `CHECK`;
- runtime joins through active user attachment, FR policy id, normalized grant,
  permission id, and canonical case-sensitive key;
- no authorization comparison against `User.position`, role name, or
  `targetRole`;
- no first-user or position-based bootstrap fallback;
- a single FR evaluator owned by the functional-role slice, with the facade
  delegating rather than reimplementing it.

The partial unique FR `targetRole` index is catalog identity integrity only;
authorization still joins by IDs. This distinction is correct.

### 5. Pass — deferred deletion and runtime catalog contracts remain unresolved

The MVP's `ON DELETE RESTRICT` protects referenced roles and permissions
without defining product deletion semantics. FR-AMD-1 explicitly says it does
not decide OQ-9, and `database-schema.md` repeats that rationale. AD-4 also
keeps `/roles`, permission mutation, runtime role management, and the complete
§2.3 catalog deferred without constraining their future contract.

No accidental role-deletion workflow, cascade behavior, catalog API, mutable
permission-key operation, or normative three-key product catalog was approved
by the reviewed change.

## Validation required before implementation approval

### Automation candidates

- Migration tests for the FR/AR `CHECK`, both composite primary keys, both
  `PolicyPermissions` FKs with `RESTRICT`, the reverse lookup index, unique
  permission key, and partial unique FR role key.
- Transactional seed tests for first run, identical rerun, blank/missing/
  unmatched/inactive root email, duplicate email impossibility, injected
  mid-transaction failure, conflicting pre-existing role/key rows, and surplus
  owned grants/attachments.
- Repository integration tests proving unknown/case-mismatched keys, AR
  policies, orphan-like nonmatching joins, inactive users, and users past the
  AD-20 cutoff all return `false`.
- Negative tests proving changes to `position`, role display/key text, or
  `targetRole` comparisons cannot grant access.

### Manual validation

- Inspect generated migration SQL and the PostgreSQL query plan for the
  permission-first `isAllowed` join.
- Review seed logs/errors for leak-free but actionable root-selection failure
  and confirm no partial rows remain.
- Confirm the implementation introduces no `/roles` route, permission mutation
  port, delete workflow, cascade, or expanded catalog.
