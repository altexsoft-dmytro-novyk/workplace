---
title: 'Solution design — §2.4 full-profile-access overlay data model and bootstrap seeding (PLAT-E4-S4.2, increment 4.2c)'
type: 'solution-design'
created: '2026-09-06'
status: 'for-review'
author: 'architect pass, requested by story-4-2-default-org-relationship-seed.md 4.2c row ("blocked. Needs an architect Stage-1 data-model decision first")'
baseline_commit: 'services/backend HEAD 8ec35fd, branch dn-section-access, workspace da1b222'
verdict: 'NEW DEDICATED MODEL (`FullProfileGrant`) — do not reuse `Policy`/`UserPolicy`. Bootstrap seeding is a small, self-contained addition to `bootstrap-access-control.ts` once the model exists. Resolution-order wording in access-control.md §"Multi-audience merge" point 4 is ambiguous and is called out as an open question rather than silently resolved.'
context:
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/spec-4-2b-tree-root-seed.md'
  - '{project-root}/_bmad-output/implementation-artifacts/access-control/deferred-work.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml'
  - '{project-root}/_bmad-output/implementation-artifacts/access-control/solution-design-upward-walk-resolver.md'
---

# Solution design — §2.4 full-profile-access overlay

## 0. Headline finding (read this first)

**The blocker is real and is confirmed, not re-litigated.** `prisma/schema.prisma`
(414 lines, read in full) has no model, table, or enum member representing "this
user holds full-profile access" — the *only* trace of the overlay anywhere in
the schema is that `AccessJournalKind` already carries two members for it,
`full_profile_grant` and `full_profile_revoke` (`schema.prisma:93-94`), unused
by any writer today (`grep -rn "full_profile_grant\|full_profile_revoke"
services/backend/src` returns zero hits outside the enum declaration).
`docs/architecture/access-control.md:345` states plainly: *"AD-28
full-profile-access scenarios are not yet authored ... do not invent
scenarios."* `blockers.yaml` CC-05 (`:60-79`) records the same split the story
does: **design is `closed`** (precedence and read-only-ness are decided,
PM/AD-28) but **`implementation_status: absent`** — nothing to build against
exists.

**This document's job, precisely:** answer the *data-model* question that is
gating 4.2c, so 4.2c can stop being "blocked" and become a normal 3-stage AD-1
increment. It does not author AD-28 scenarios (that is Stage 1 of the increment
this document proposes) and does not write code.

**Recommendation, stated up front:** a dedicated model, `FullProfileGrant`, with
its own holder/grantedBy/grantedAt/revokedBy/revokedAt columns and a partial
unique index for "current holder," not a `Policy` row of a new `type`. §1 gives
the reasons; the short version is that the FR/AR type-separation migration
(`20260831070000_access_control_functional_roles/migration.sql`) makes a third
`Policy.type` value a schema-level rejection, not just a design smell, and a
pinned regression suite (`ACM1-FB-06`, `countOf('Policies') === 1`) would break
by construction the moment a third row appeared in that table.

---

## 1. Data model

### 1.1 Option (a) — reuse `Policy`/`UserPolicy` with a new `type`

**Rejected. Concretely, not just stylistically.**

- `Policies_type_check` (`20260831070000_.../migration.sql`, the invariant-1
  comment block): `CHECK ("type" IN ('FR', 'AR'))`. A `type: 'overlay'` row is
  refused by Postgres at INSERT time. Landing this option means altering that
  CHECK, which is exactly the "type separation is the whole point of this
  schema" boundary the migration's own header comment (`migration.sql:1-10`)
  names as load-bearing: *"Type separation between functional roles (FR) and
  access roles (AR) is the whole point of this schema."* An overlay grant is
  neither an FR row (it carries no `targetRole` naming a role key that gates
  features) nor an AR row (it carries no `targetType`/`targetId` naming a
  scoped resource) — `Policies_row_shape_check` (`migration.sql`, invariant 2)
  would need a **third disjunct** invented for a shape that fits neither
  existing branch, which is the same "don't invent scenarios" instinct
  `access-control.md:345` states for AD-28 applied to schema shape instead of
  test scenarios.
- Even granting a schema change, the pinned regression invariant `ACM1-FB-06`
  (`docs/test-cases/access-control-kernel/fr-bootstrap/acm1-fb-06-*.md`) and its
  four e2e assertion sites (`test/access-control/acm1r-fr-foundation.e2e-spec.ts:445`
  and three siblings, all `expect(await countOf('Policies')).toBe(1)`) assert
  **exactly one** row in `Policies` after a clean bootstrap — the single FR
  `hr-admin` row. Seeding a first §2.4 holder as a second `Policies` row breaks
  that count by construction. `spec-4-2b-tree-root-seed.md`'s own **Never**
  list already anticipated and forbade exactly this: *"Never model the §2.4
  grant as a `Policies` row, a `UserPolicies` row, or any other invented shape
  ... Doing so here would also violate `ACM1-FB-06`'s `countOf('Policies') ===
  1` invariant, which `spec-4-2a`'s Design Notes already flagged as the exact
  collision this scope item would cause."* This document independently
  confirms that finding against the migration SQL rather than taking it on
  faith.
- Semantically, `Policy`/`UserPolicy`/`PolicyPermission` is the FR-tier
  machinery: "does this user's role grant this feature key" — a global,
  boolean, catalog-shaped question with no per-target-user relationship. The
  overlay is the opposite shape: "does user A currently hold read access over
  every OTHER user's profile," a **holder** fact with its own **grantedBy**
  actor and its own **lifecycle** (grant/revoke, journaled, singleton-floor
  protected) — none of which `UserPolicy` (a bare `(userId, policyId)` pair,
  `schema.prisma:390-399`) has any column for. Bolting `grantedBy`/`grantedAt`
  onto `UserPolicy` would widen a table every other FR consumer reads, for a
  concern FR evaluation must never see (`access-control.md`'s "type-separated
  evaluation... FR checks never enter the AR tier-resolution hot path, and vice
  versa" — the overlay is neither, so it has no business growing either
  table).

### 1.2 Option (b) — a dedicated model

**Recommended.** New model, tentatively named `FullProfileGrant` (bikeshed-safe
alternatives: `FullProfileAccess`, `ProfileOverlayGrant` — naming is not
architecturally load-bearing; the shape below is):

```prisma
model FullProfileGrant {
  id              String    @id @default(uuid(7))
  holderUserId    String
  // NULL only for the one bootstrap-seeded row (§4). Every ordinary grant sets
  // this to the acting holder; the app layer, not this column alone, is what
  // proves that actor was itself an active holder at grant time (§2).
  grantedByUserId String?
  grantedAt       DateTime  @default(now()) @db.Timestamptz
  revokedByUserId String?
  revokedAt       DateTime? @db.Timestamptz

  holder    User  @relation("FullProfileGrantHolder", fields: [holderUserId], references: [id], onDelete: Restrict)
  grantedBy User? @relation("FullProfileGrantGrantedBy", fields: [grantedByUserId], references: [id], onDelete: Restrict)
  revokedBy User? @relation("FullProfileGrantRevokedBy", fields: [revokedByUserId], references: [id], onDelete: Restrict)

  // UNIQUE (holderUserId) WHERE revokedAt IS NULL — raw SQL in the migration,
  // same idiom as relationships_one_direct_per_user / the department_membership
  // and employment_status "current row" partial uniques. Lets a holder be
  // re-granted after a prior revoke without a global unique blocking it.
  @@index([holderUserId])
  @@map("full_profile_grants")
}
```

Why this, over inventing something else:

- **It follows an idiom this schema already uses three times**, not a new one:
  `DepartmentMembership` (`schema.prisma:175-189`, `validFrom`/`validTo` +
  partial unique `WHERE validTo IS NULL`), `EmploymentStatus`
  (`schema.prisma:195-210`, same shape), and `relationships_one_direct_per_user`
  / `relationships_one_people_partner_per_user`
  (`20260830010000_.../migration.sql`, partial unique `WHERE type = '...'`).
  "One current row, many historical rows, current-ness is a partial unique
  index, not a boolean flag" is the established pattern for exactly this class
  of fact ("who currently holds X"). `FullProfileGrant` is that pattern applied
  to holder rather than department-membership or manager-edge.
- **It keeps FR/AR type-separation intact.** No change to `Policies_type_check`
  or `Policies_row_shape_check`; `ACM1-FB-06`'s `countOf('Policies') === 1`
  keeps passing unmodified, because nothing about this model touches
  `Policies` at all.
- **It matches `AccessJournal`'s existing shape expectation.** The `before`/
  `after` snapshots the journal stores for other kinds (e.g. `ManagerEdgeSnapshot`
  in `org-relationship.repository.ts:62-67`) are plain object literals, not
  FK-joined rows — a `FullProfileGrant` row's own columns
  (`holderUserId`/`grantedByUserId`/`grantedAt`) are exactly the fields such a
  snapshot would carry, so the journal integration (§3) needs no translation
  layer.
- **Historical rows are the audit backstop `AccessJournal` doesn't have to be
  alone.** `AccessJournal` is explicitly "not a general audit log" (§3.4) and is
  never read on the resolution path — but the resolution path (§4) *does* need
  a fast "is this exact user currently a holder" point lookup, which a `WHERE
  revokedAt IS NULL AND holderUserId = $1` query against one small table gives
  for free; deriving "current holder" by replaying `AccessJournal` rows would
  put an audit log on the hot authorization path, which §3.4's own framing
  forbids by design.

### 1.3 What is NOT decided here

The exact column set above is scoped to what **4.2c** (bootstrap seeding) and
the eventual lifecycle both need at minimum. Two things are deliberately left
to the AD-1 Stage-1 scenario pass this document recommends (§7), not fixed
here:
- The final model **name**.
- Whether `grantedByUserId`/`revokedByUserId` need their own audit-shaped
  columns beyond what's above (e.g. a `reason` free-text field) — nothing in
  §2.4's normative bullet list requires one, so absent a named consumer this
  design does not add it (`feedback_no_speculative_fields`).

---

## 2. Invariant enforcement — no self-assignment, last-holder protection

Both invariants are stated in `access-control.md`'s §2.4 bullet list as
absolute ("no self-assignment"; "blocked — including self-revocation by the
sole holder"). They split cleanly into what Postgres can enforce declaratively
and what only a locked transaction can:

### 2.1 No self-assignment — mixed: one CHECK, one app-layer read

- **The part a CHECK constraint covers:** a grant row must never name its own
  holder as its own grantor. This is a single-row shape rule, exactly like
  `relationships_no_self_endpoint_check` (`20260830010000_.../migration.sql`:
  `CHECK ("reportsToUserId" IS NULL OR "reportsToUserId" <> "userId")`).
  Proposed: `CHECK ("grantedByUserId" IS NULL OR "grantedByUserId" <>
  "holderUserId")`. The `IS NULL OR` clause is what lets the one bootstrap row
  through (§4) without weakening the rule for every ordinary grant.
- **The part no CHECK can cover:** "only an **existing holder** may grant."
  That requires reading *other rows of the same table* at write time (is
  `grantedByUserId` currently an active holder?), which is outside what a
  Postgres `CHECK` can express (no subqueries in `CHECK`). This has to be an
  application-layer read inside the same transaction as the insert, under a
  row lock, mirroring `OrgRelationshipRepository`'s optimistic-predicate
  pattern (`org-relationship.repository.ts`'s `StalePeoplePartnerPredicate` /
  `StaleDepartmentSource` — read the relevant state inside the transaction,
  throw and roll back the whole transaction, including any journal row
  already staged, if the precondition doesn't hold).
- **The paradox this resolves, and how:** if "no self-assignment" and "only an
  existing holder may grant" both applied unconditionally, **no first holder
  could ever be created** — there is no existing holder yet, and nobody may
  self-assign. `grantedByUserId` is nullable specifically so the *bootstrap*
  path (§4) — not the ordinary grant path — is the one sanctioned way to create
  a holder with no granting holder. This is not a new pattern in this
  codebase: `prisma/seed.ts:149` sets `createdBy: rootId` on root's own `User`
  row (root is its own creator, a documented, deliberate exception, per the
  comment at `seed.ts:133-136`: *"it can be reused as its own `createdBy` in
  the same insert"*) for the identical reason — the very first row of a
  chain that normally requires an existing prior actor has no such actor to
  point to.

### 2.2 Last-holder protection — application-layer, under a lock; no declarative constraint is available

Postgres has no direct way to express "a DELETE/UPDATE must not be the one that
drops a table's live-row count to zero" as a `CHECK` — a `CHECK` evaluates one
row against constants or that row's own other columns, never an aggregate over
sibling rows. Two real options, both consistent with idioms already in this
codebase:

- **(Recommended) Application-layer count-under-lock**, the same shape as
  `bootstrap-access-control.ts`'s `acquireBootstrapLock` +
  `pg_try_advisory_xact_lock` (`access-control-bootstrap.ts:111-128`): before
  revoking, take an advisory lock scoped to this mechanism (e.g.
  `hashtextextended('access-control:full-profile-grants', 0)`), then `SELECT
  count(*) FROM full_profile_grants WHERE "revokedAt" IS NULL FOR UPDATE`
  (or lock the specific holder rows) inside the same transaction as the
  revoke, and refuse the revoke transactionally if the count is 1 and the
  target of the revoke is that one row. This is the only option that requires
  **zero new schema mechanism** — it reuses the exact locking idiom already
  proven in this codebase for a different singleton (the bootstrap row).
- **(Not recommended, flagged for completeness)** A Postgres constraint
  trigger (`CREATE CONSTRAINT TRIGGER ... AFTER UPDATE OR DELETE ...
  DEFERRABLE`) that recomputes the live-holder count and raises. This would be
  the **first trigger anywhere in this schema** — every other cross-row
  invariant in the codebase (one-direct-per-user, one-PP-per-user, the FR role
  key uniqueness, the AR/FR type separation) is a partial unique index or a
  per-row `CHECK`, never a trigger. Introducing a new enforcement mechanism
  class for one invariant is a real architectural choice, not a free upgrade in
  safety, and should be argued for on its own if proposed — this document does
  not recommend it, but does not have the authority to foreclose it either;
  see Open Question 3.

**A DB-level backstop is possible without a trigger, and is worth doing
regardless of which app-layer path is chosen:** a partial unique index cannot
express "at least one," but nothing stops the eventual lifecycle increment from
also asserting the invariant in an e2e suite (concurrent-revoke race test,
mirroring `acm1r-fb-25-concurrent-runs.md`'s precedent for the bootstrap lock)
rather than trusting the application check alone. That is lifecycle-increment
work, not 4.2c's (§6).

---

## 3. Journaling

`AccessJournalKind` already reserves `full_profile_grant` and
`full_profile_revoke` (`schema.prisma:93-94`) — this is the one piece of the
overlay's storage that was pre-provisioned, evidently in anticipation of this
exact design. Nothing else in the enum or table needs to change.

**Concrete existing pattern to follow**, cited from a real write path:
`OrgRelationshipRepository.assignManager` (`org-relationship.repository.ts:64-99`)
generates the fact-row id up front (`uuidv7()`), writes the fact row and the
`AccessJournal` row inside **one** `prisma.$transaction`, and derives the
`idempotencyKey` from `accessJournalIdempotencyKey(actorId, subjectId, kind,
relationshipId, operation)` (`access-journal-idempotency.ts:30-42`) so a retried
mutation reaching the same fact transition produces the same key and
`skipDuplicates: true` (`org-relationship.repository.ts:97`) absorbs the
duplicate.

A `FullProfileGrant` write follows the identical shape:

```ts
const grantId = uuidv7();
await this.prisma.$transaction(async (tx) => {
  // ... §2's lock + holder-precondition check happens here first ...
  const created = await tx.fullProfileGrant.create({
    data: { id: grantId, holderUserId, grantedByUserId: actorId },
  });
  await tx.accessJournal.createMany({
    data: [{
      id: uuidv7(),
      actorUserId: actorId,
      subjectUserId: holderUserId,
      kind: 'full_profile_grant',
      before: Prisma.DbNull,
      after: { grantId, holderUserId, grantedByUserId: actorId } as Prisma.InputJsonValue,
      idempotencyKey: accessJournalIdempotencyKey(actorId, holderUserId, 'full_profile_grant', grantId, 'create'),
    }],
    skipDuplicates: true,
  });
  return created;
});
```

One real addition needed: `JournalOperation`
(`access-journal-idempotency.ts:20-28`) is today `'create' | 'replace' |
'delete' | 'dept_add' | 'dept_move' | 'dept_remove' | 'dept_mgr_set' |
'dept_mgr_remove'` — no member fits a grant/revoke naturally. The lifecycle
increment adds e.g. `'full_profile_grant' | 'full_profile_revoke'` to that
union (or reuses `'create'`/`'delete'` with `kind` already disambiguating —
either is defensible; a Stage-1 scenario-doc decision, not this document's to
fix, since 4.2c's own journal write is a special case, §4).

**HR Admin (by functional role) is confirmed NOT a reader** of these rows —
`access-control.md:356`: *"HR Admin by functional role is not a journal
reader."* — consistent with `deferred-work.md`'s `additional_consumer` note
that the full-profile-overlay reader leg of `GET /users/:id/access-journal` is
itself gated behind this same data-model item.

---

## 4. Bootstrap-time seeding (4.2c's actual job)

**Once the model exists, seeding the first holder is a small, well-contained
addition to `bootstrap-access-control.ts`, not a new script.** The existing
file already has every mechanism this needs:

- The advisory lock (`acquireBootstrapLock`, `:111-128`) already serializes the
  whole bootstrap transaction; the new logic runs **inside** the same locked
  `$transaction` (`:308-421`) as the FR-role seeding, immediately after `root`
  is located and revalidated (`:326`), not as a second transaction.
- The "singleton present → verify; singleton absent → create" branching
  already used for `AccessControlBootstrap` (`:328-348`, `:394-403`) is the
  exact shape a first-holder check needs: *if a `FullProfileGrant` with
  `revokedAt IS NULL` already exists for root, verify it still names root and
  fail loudly on drift (the same "conflicting drift" philosophy as
  `assertCanonicalPolicyShape`, `:222-241`); if none exists at all, insert one
  row with `holderUserId: root.id, grantedByUserId: NULL`.*
- **A real design decision this document does make, not defer:** the bootstrap
  seeding condition should be **"no `FullProfileGrant` row exists for anyone,
  at all"**, not narrowly "no row for root." A later administrator granting the
  overlay to a second person, followed by a re-run of
  `db:bootstrap:access-control` (an idempotent, re-runnable script by design,
  per its own header comment `:1-13`), must not be misread as "root lost its
  seeded status" or attempt a second bootstrap insert. Concretely: `SELECT
  count(*) FROM full_profile_grants FOR UPDATE` (under the same lock) — zero
  rows means "first run, seed root"; one or more rows means "already
  bootstrapped or already administered, verify-or-no-op" exactly like the
  `AccessControlBootstrap` singleton check already does for the FR grant.
- **The journal row for the bootstrap-seeded grant uses a self-referential
  actor**, `actorUserId: root.id` with `subjectUserId: root.id` — `AccessJournal.actorUserId`
  is `NOT NULL` (`schema.prisma:101`, no `?`), so it cannot be left empty the
  way `grantedByUserId` can. This mirrors the accepted `User.createdBy` self-
  reference for root at seed time (`prisma/seed.ts:149`) rather than inventing
  a new "system actor" convention. The `FullProfileGrant.grantedByUserId`
  column itself stays `NULL` for this one row (§2.1) — the journal's
  `actorUserId` and the grant's `grantedByUserId` are different columns
  answering different questions ("who does the audit trail say enacted this"
  vs. "which existing holder authorized it"), and only the second one carries
  the "no self-assignment" CHECK.
- **Does the bootstrap script itself need the FR-role's `AccessJournal`
  treatment (i.e., does it currently journal anything)?** No — verified:
  `bootstrap-access-control.ts` writes `Permissions`/`Policies`/
  `PolicyPermissions`/`UserPolicies` rows and the `AccessControlBootstrap`
  singleton, and never touches `tx.accessJournal` (`grep -n accessJournal
  scripts/bootstrap-access-control.ts` → no hits). That is consistent with
  §3.4's own list of journaled fact classes — FR role grants are not one of
  them; full-profile-access grants explicitly are. So the bootstrap script
  gains **exactly one** new journal write it did not have before, for exactly
  this one fact.

**Does the singleton/first-holder invariant need its own bootstrap-time
enforcement beyond "insert one row"?** No additional mechanism is needed at
seed time specifically **because** a fresh database has zero `FullProfileGrant`
rows — the count-zero branch above always inserts exactly one row for exactly
one candidate (root), so the "at least one holder must exist" floor (§2.2) is
never at risk of being *violated* by bootstrap; it is only at risk once an
administrator starts revoking, which is lifecycle-increment territory (§6),
not bootstrap's.

**Is this the whole of 4.2c, or does 4.2c also need the "clean read of every
section" outcome the story's Recorded Decision table promises?** The seeding
alone is inert without the resolution-integration change in §5 — a
`FullProfileGrant` row that no resolver ever consults changes nothing
observable. 4.2c's own AC (from the story's Sequencing table, `story-4-2-*.md:301`:
*"§2.4 full-profile-access first holder (the other part of scope item 3)"*)
is scoped to "who the seeded holder is," and the story text (`:160-167`)
explicitly separates that from "the §2.4 overlay *lifecycle*." Whether the
minimal resolver read (§5) belongs inside 4.2c or is itself a further split is
exactly Open Question 2 below — this document does not pre-decide it, because
the honest answer depends on whether the PO wants a seeded-but-inert grant to
ship before the read path exists, or wants the two to land together so 4.2c's
acceptance criterion is externally observable rather than a database row
nobody reads yet.

---

## 5. Resolution integration

### 5.1 Where the current code stops

`AccessControlFacade.canAccessSection` (`access-control.facade.ts:52-66`) calls
the private `resolveSectionAccess` (`:68-94`), which: looks up the section in
`SECTION_ACCESS_MATRIX` (`section-access-matrix.ts:12-33`, which today has
exactly three rows: `profile:identity`, `profile:leave`, `profile:projects`),
calls `resolveAudiences` (→ `AudienceResolverService.resolve`,
`audience-resolver.service.ts:26-106`), and takes the best-ranked cell over
whatever `Audience` labels (`'self' | 'reporting' | 'pp' | 'colleague'`,
`audience.ts:9`) came back. **There is no branch anywhere in this path that
consults anything but those four labels.** A §2.4 holder viewing an unrelated
colleague's profile resolves as `colleague` today and gets exactly the
colleague row — confirmed by `deferred-work.md`'s own "§2.4 Full profile
access — resolver support" entry: *"`resolveAudiences` / `canAccessSection`
have no `full` audience or bypass today, so a §2.4 holder resolves as
Colleague."*

### 5.2 Why `'full'` must NOT become a fifth `Audience` label

`access-control.md:345` states the resolved decision in one sentence:
**"Overlay is not a matrix column."** Adding `'full'` to the `Audience` union
and a `full` row to `SECTION_ACCESS_MATRIX` would directly contradict that
resolution — it would make the overlay exactly the matrix column PM/AD-28 said
it explicitly is not, and it would let the overlay merge through the *same*
per-audience best-of-N loop that Reporting/PP/Colleague use, which has no
built-in way to enforce "read-only, never bypasses functional permissions,
command rules, field/record restrictions" (`access-control.md:284`) — that
carve-out is a property of *how* the overlay is merged in, not a property any
matrix cell can express by itself (a matrix cell is a flat `'none'|'read'|
'write'`; "never write" for one specific audience-in-a-set is not the same
statement as "this whole mechanism only ever contributes read").

### 5.3 Recommended integration point

A new port and a new domain service, structurally parallel to the
`FunctionalRoleEvaluatorService` / `FUNCTIONAL_ROLE_REPOSITORY_PORT` pair
(`functional-role-evaluator.service.ts`, `functional-role.repository.port.ts`)
— **not** a change to `AudienceResolverService` or the `RelationshipGraphPort`,
because the overlay is not a graph fact and must not enter that seam:

```ts
// domain/interfaces/full-profile-access.port.ts
export interface FullProfileAccessPort {
  /** True iff userId is a CURRENT, ACTIVE holder — inactive users never count,
   *  mirroring the CAP-1 discipline `AudienceResolverService` already applies
   *  and the `isActiveUser` gate `FunctionalRoleEvaluatorService` already uses
   *  for DEFAULT_PERMISSIONS (functional-role-evaluator.service.ts:23-30). */
  isActiveHolder(userId: string): Promise<boolean>;
}
export const FULL_PROFILE_ACCESS_PORT = Symbol('FULL_PROFILE_ACCESS_PORT');

// domain/services/full-profile-overlay.service.ts
@Injectable()
export class FullProfileOverlayService {
  constructor(@Inject(FULL_PROFILE_ACCESS_PORT) private readonly port: FullProfileAccessPort) {}
  isHolder(userId: string): Promise<boolean> { return this.port.isActiveHolder(userId); }
}
```

Wired into `AccessControlFacade` as a third constructor dependency, alongside
`resolver` and `functionalRoles` (`access-control.facade.ts:22-25`), and
consulted inside `resolveSectionAccess`, **after** the existing best-of-audience
computation and **only when the target is confirmed** (i.e. inside the branch
that already survived the `!targetAudiences || targetAudiences.size === 0`
early return at `:81-83` — an unconfirmed/inactive target must stay `'none'`
regardless of overlay, or the overlay becomes a way to prove existence of a
deactivated or nonexistent user, which is exactly the leak class CAP-1 and the
404-leak-free rule exist to prevent):

```ts
// inside resolveSectionAccess, after the existing best-of-audience loop:
if (best !== 'write') {
  const isHolder = await this.fullProfileOverlay.isHolder(viewerId);
  if (isHolder) {
    best = 'read'; // never upgrades an existing 'write'; never applies to an
                    // unconfirmed target, because this line is unreached for one
  }
}
return best;
```

This satisfies every normative bullet in §2.4 mechanically: it can only move
`'none' → 'read'`, never touches `'write'`, runs strictly after the audience
merge (not instead of it), and is a facade-owned change — matching
`deferred-work.md`'s own framing that this fix is *"Access-Control-owned and
broader than one section,"* unlike the shared-link overlay, which that same
file explicitly frames as consumer-applied (*"ships separately"*).

### 5.4 Open ambiguity this document will not silently resolve

`access-control.md`'s "Multi-audience merge" point 4 (`:284`) reads: *"Apply
overlays after that: shared link ... then full-profile access ... Full-profile
is read-only: effective access is **max(Self, full-profile)**..."* Taken
completely literally, this formula only ever compares the overlay against the
**Self** audience specifically — but Self and the overlay are mutually
irrelevant in the overlay's own primary use case (a holder reading an
*unrelated* colleague's profile, where the viewer is never Self for that
target). Two readings are both textually defensible:

1. **"Self" is literal** — the formula only fires when `viewerId ===
   targetEmployeeId`, and the overlay has no defined effect at all when the
   viewer is Reporting/PP/Colleague over the target (an odd reading, since it
   would make the overlay useless for its stated purpose — "holders read every
   section of every profile").
2. **"Self" is shorthand for "whatever the merge already produced,"** reusing
   the term loosely because point 3 (`:283`) just finished establishing that
   Self, when it applies, is exclusive of the other three — so "the result so
   far" and "Self" coincide in the one case the sentence is actually thinking
   about, and the sentence under-specifies the Reporting/PP/Colleague case by
   omission rather than by intent.

**This design recommends reading 2** — it is the only reading under which the
overlay does what §2.4's own opening sentence and the story's Recorded
Decision table ("clean read of every section, including the ones the
reporting line cannot") say it is for — and §5.3's `best` (the merge's actual
output, not literally the `'self'` label) is written against that reading. But
this is an interpretation, not a re-derivation of an unambiguous source
sentence, and it should be confirmed explicitly at the Stage-1 scenario-doc
gate (§7) before any scenario is authored against it, per this task's own
instruction to distinguish sourced requirements from inference. See Open
Question 1.

---

## 6. What NOT to build now (4.2c vs. the deferred lifecycle)

The story is explicit (`story-4-2-*.md:160-167`): *"the §2.4 overlay *lifecycle*
— grant/revoke journaling, last-holder protection, column mapping — stays the
access-control deferred-work 'Full-profile access overlay' item; this story
fixes only who the seeded holder is and wires it."* Mapped onto this design's
model:

| Capability | Needed for 4.2c (bootstrap seeding) | Deferred lifecycle |
| --- | --- | --- |
| `FullProfileGrant` table + partial unique "current holder" index | **Yes** — the one bootstrap row lives here | — |
| Bootstrap insert of the first row (`grantedByUserId: NULL`, root as holder) | **Yes** | — |
| `AccessJournal` row for the bootstrap-seeded grant | **Yes** (§4) — §3.4 names full-profile grants as journaled facts with no bootstrap exception | — |
| §5's resolver read (`FullProfileAccessPort` / `FullProfileOverlayService` / the `canAccessSection` change) | **Needed for the seeded row to have any observable effect** — see §4's closing paragraph and Open Question 2 | — |
| An HTTP endpoint / command to **grant** a new holder | No | **Yes** — no route exists or is proposed here |
| An HTTP endpoint / command to **revoke** a holder | No | **Yes** |
| The "only an existing holder may grant" app-layer check (§2.1) | Not exercised — bootstrap's `grantedByUserId: NULL` path bypasses it by construction | **Yes** — this is the check an ordinary grant-endpoint enforces |
| Last-holder protection under lock (§2.2) | Not exercised — bootstrap only ever adds the first row | **Yes** |
| Shared-link revocation backstop ("holders are the backstop when the relationship holder cannot revoke") | No | **Yes** — depends on the §4.8 shared-link overlay, itself separately deferred |
| `GET /users/:id/access-journal`'s full-profile-overlay reader leg | No | **Yes** — `deferred-work.md`'s `additional_consumer` note names this as gated behind this same data-model item |

A spec-writer picking this up should treat the left column as 4.2c's complete
scope and everything in the right column as explicitly out, even though the
same table and (per §5) the same resolver change may be touched again when the
lifecycle increment lands.

---

## 7. Proposed AD-1 staging

Following `feedback_ad1_gate_enforcement` (human checkpoint between stages) and
the `solution-design-upward-walk-resolver.md` precedent (§8 there). **4.2c
itself splits into two increments**, not one, because §4's closing paragraph and
§6's table both show that bootstrap seeding alone is inert without §5's
resolver change, but the story's own text (§4, quoting `:160-167`) draws the
lifecycle boundary at "grant/revoke journaling, last-holder protection, column
mapping" — which does **not** obviously include "does the resolver even look at
this table," since without that the "column mapping" phrase (what section
cells the overlay affects) is meaningless to test. This document's
recommendation: **fold §5 into 4.2c** (rename nothing; 4.2c becomes "seed the
first holder AND make it observable") and leave grant/revoke/last-holder/
journal-for-ordinary-mutations strictly to the deferred lifecycle increment.
This is a recommendation, not a decision already made — see Open Question 2.

### Stage 1 — scenario docs (AD-28 authoring, explicitly gated by access-control.md:345)

**Location:** `docs/test-cases/access-control-kernel/full-profile-overlay/`, a
new sibling of `tree-root-seed/`, `fr-bootstrap/`, `multi-audience/`, following
the existing `README.md` authoring convention. Id prefix `acm11-fpo-*`
(`fpo` = full-profile overlay; `acm11` is the next unused ACM number after the
upward-walk design's proposed `acm10`). Candidate scenarios, scoped to the
4.2c-folds-in-§5 boundary this document recommends:

| Id | Scenario |
| --- | --- |
| `acm11-fpo-01-bootstrap-seeds-root-as-first-holder.md` | Fresh DB: `db:seed && db:bootstrap:access-control` leaves exactly one `full_profile_grants` row, `holderUserId = root`, `grantedByUserId = NULL`, and one `AccessJournal` row `kind: 'full_profile_grant'`. |
| `acm11-fpo-02-rerun-is-idempotent-no-duplicate-row.md` | Re-running the bootstrap script against an already-seeded DB inserts no second row and raises no drift error, mirroring `acm1r-fb-05`/`acm1r-fb-20..22`'s precedent for the FR singleton. |
| `acm11-fpo-03-holder-reads-colleague-section-as-read.md` | Root (holder), viewing an unrelated active employee with no Reporting/PP relation, resolves `profile:leave` (a `self/colleague/reporting/pp`-only row today) as `read` where an ordinary colleague would get the matrix's `colleague` cell — this is the scenario that pins whichever reading of Open Question 1 the PO confirms. |
| `acm11-fpo-04-overlay-never-upgrades-to-write.md` | A holder with no Reporting/PP relation to the target never gets `write` on any section, even though the holder "reads every section." |
| `acm11-fpo-05-overlay-does-not-apply-to-inactive-or-unknown-target.md` | A holder resolving a deactivated or nonexistent target id gets `'none'`, not `'read'` — the CAP-1 leak-prevention property named in §5.3. |
| `acm11-fpo-06-non-holder-gets-no-overlay-effect.md` | An ordinary active employee (not a holder) resolves exactly today's matrix result, unchanged — a regression lock over the base path §5.3's change must not disturb. |

Stage 1 also settles Open Questions 1 and 2 as an explicit PO/architect ruling
recorded in this same folder's README before Stage 2 starts — writing scenario
docs against an unresolved semantic would be inventing the rule Stage 1 exists
to prevent inventing.

**Stop for approval.**

### Stage 2 — red E2E

- `services/backend/test/access-control/acm11-full-profile-overlay-bootstrap.e2e-spec.ts`
  — subprocess-driven, same harness shape as `s42a-op-bootstrap-canonical-set.e2e-spec.ts`,
  covering `acm11-fpo-01`/`02`.
- `services/backend/test/access-control/acm11-full-profile-overlay-resolution.e2e-spec.ts`
  — hybrid Nest-module harness (real `AccessControlFacade`, real Postgres, a
  fake or minimal real `FullProfileAccessPort` adapter seeded via test fixture
  rows) covering `acm11-fpo-03..06`.
- Migration for the `FullProfileGrant` table + partial unique index, reviewed
  raw SQL for the parts Prisma cannot express (the partial unique, per §1.2).

**Stop for approval.**

### Stage 3 — implementation

- The migration; the `FullProfileGrant` Prisma model; `FullProfileAccessPort` +
  `PrismaFullProfileAccessAdapter` + `FullProfileOverlayService`, wired into
  `AccessControlModule` (`access-control.module.ts`) alongside the existing
  three providers; the `resolveSectionAccess` change (§5.3); the
  `bootstrap-access-control.ts` addition (§4); the one new `AccessJournal` call
  site.
- **No grant/revoke HTTP surface, no `GET`/`POST`/`DELETE` route, no UI** — §6's
  boundary.

---

## 8. Open questions for the architect / PO

1. **"max(Self, full-profile)" — literal Self, or "the merge result so far"?**
   §5.4 above. This determines whether the overlay has any effect at all
   outside the degenerate viewer-equals-target case. **Needed before Stage 1
   scenario authoring can proceed without guessing.**
2. **Does 4.2c include §5's resolver change, or is "seed the row" alone a
   completable increment with the resolver change split out as its own further
   letter (4.2c-i / 4.2c-ii, or a renamed 4.2e)?** This document's working
   recommendation is to fold them (§7's opening paragraph), because a seeded
   row nothing reads has no acceptance-testable behavior — but the story text's
   own boundary line ("this story fixes only who the seeded holder is and
   wires it") is genuinely ambiguous about whether "wires it" already means
   "wires it into resolution" or just "wires the bootstrap script to write the
   row." A PM/PO call, not an architectural one.
3. **Last-holder protection: application-layer lock only, or should a
   constraint trigger be added as a DB-level backstop?** §2.2. This document
   recommends the lock-only path (no new mechanism class in this schema) but
   flags that the trade-off — an app bug could theoretically bypass the
   application check via a raw SQL write, where a trigger could not — is a
   real one worth a deliberate "we accept that residual risk" or "no, add the
   trigger" ruling before the lifecycle increment's own Stage 1.
4. **Model name.** `FullProfileGrant` is this document's placeholder; no
   normative source fixes a name. Low-stakes, but worth settling once so the
   Stage-1 scenario docs and the eventual migration don't disagree.
5. **`JournalOperation` union extension** (§3): add
   `'full_profile_grant'`/`'full_profile_revoke'` members, or reuse
   `'create'`/`'delete'` and rely on `AccessJournal.kind` alone to
   disambiguate? Either is internally consistent; not decided here because it
   is a naming-convention question for the lifecycle increment's own idempotency
   keys, not a data-model question for 4.2c.
