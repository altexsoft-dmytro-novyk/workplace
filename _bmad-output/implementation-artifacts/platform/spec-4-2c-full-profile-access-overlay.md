---
title: 'PLAT-E4-S4.2c — Full-profile-access overlay: seed root as first holder, wire the resolver read'
type: 'feature'
created: '2026-09-07'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'de508c9' # services/backend HEAD, branch dn-section-access, working tree clean
story: '{project-root}/_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md'
scope_items: >-
  Story 4.2 scope item 3, §2.4 HALF ONLY (the other half, the tree-root edge,
  is closed by 4.2b). Per the story's Sequencing table as renumbered
  2026-09-06 ("4.2a/b/c/d are the authoritative letters"), this is **4.2c**:
  "§2.4 full-profile-access first holder (the other part of scope item 3)."
  Builds the `FullProfileGrant` data model, its CHECK/partial-unique
  constraints, the last-holder-protection mechanism, the bootstrap seed of
  root as first holder, and the resolver read-path that makes the seeded row
  observable. Does NOT build a grant/revoke HTTP surface, an admin UI, or the
  shared-link revocation backstop — those stay the access-control
  deferred-work "Full-profile access overlay" item, per the story's own text
  (`story-4-2-*.md:160-167`). Scope items 1, 2 are closed (4.1c/4.1d
  verification, 4.2a). Scope item 5 is closed (4.2d). Scope item 4 needs no
  letter (already-built finding, `solution-design-upward-walk-resolver.md`).
context:
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/docs/project-requirements.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/epic-4-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/spec-4-2a-root-operator-permission-set.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/spec-4-2b-tree-root-seed.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/spec-4-2d-dev-seed-spine.md'
  - '{project-root}/_bmad-output/implementation-artifacts/access-control/solution-design-full-profile-access-overlay.md'
  - '{project-root}/_bmad-output/implementation-artifacts/access-control/deferred-work.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

> **RESOLVED 2026-09-07 (Dmytro Novyk, PO). Both blocking items ruled on —
> Stage 1 may now be dispatched.**
>
> - **AF-1 — "max(Self, full-profile)" means the merge result so far**, not a
>   literal comparison against only the viewer's own Self audience. A full-
>   profile grant can only ever raise the resolved section access to `'read'`,
>   never lower it and never touch `'write'`. This is the only reading under
>   which the feature does anything — confirmed as the ruling rather than sent
>   back to the architecture doc for rewording.
> - **AF-6 — accepted: unit-level proof only, ship it anyway.** The
>   resolver-read integration is proven correct against a real
>   `AccessControlFacade` wired to a synthetic section row with a `'none'`
>   cell (a Jest mock, not a live route) — honestly labeled as not an
>   HTTP-observable behavior change today, because no shipped section
>   currently has a `'none'` cell for any audience. The grant becomes
>   load-bearing the moment any future section does (e.g. personal contacts,
>   whose requirements-level colleague cell is `—`). AF-2 (fold the
>   resolver-read into this increment rather than defer it) follows from this
>   ruling — both ship together.
>
> The Code Map and Tasks below were written against exactly these two
> readings before the ruling landed, so no further rewrite was needed —
> confirm the plan matches, it does.

## Intent

**Problem.** Root is the ACM-0 seeded singleton identity and, per the story's
Recorded Decision table, is meant to hold "clean read of every section,
including the ones the reporting line cannot" as "first holder of the §2.4
full-profile-access grant." Nothing in `services/backend` today makes that
true:

- `prisma/schema.prisma` (414 lines, read in full — confirmed independently,
  not taken on the design doc's word) has **no model, table, or enum member**
  representing "this user holds full-profile access." The only trace anywhere
  in the schema is `AccessJournalKind`'s two unused members,
  `full_profile_grant` / `full_profile_revoke` (`schema.prisma:93-94`) —
  confirmed by direct read, zero other hits for either string in
  `prisma/schema.prisma`.
- `AccessControlFacade.resolveSectionAccess`
  (`src/access-control/application/access-control.facade.ts:68-94`, read in
  full) has no branch that consults anything but the four `Audience` labels
  (`'self' | 'reporting' | 'pp' | 'colleague'`, `domain/audience.ts:9`). A
  §2.4 holder viewing an unrelated colleague's profile resolves as an ordinary
  `colleague` today and gets exactly the colleague row.

This spec's job, precisely, is the same one `spec-4-2b` performed for the
tree-root half of scope item 3: turn a blocked, architect-gated item into a
normal 3-stage AD-1 increment, building on
`solution-design-full-profile-access-overlay.md` (2026-09-06) — read in full —
which already answered the data-model question. This document does not
re-derive that design; it re-verifies its load-bearing claims against current
code (Code Map) and adds the two things a solution design does not do:
concrete AD-1 tasks, and a genuinely new finding the design's own Stage-1
candidate scenario did not account for (Design Notes, AF-6).

**Approach.** Once Ask First AF-1 and AF-6 carry a human ruling: author
`docs/test-cases/access-control-kernel/full-profile-overlay/` scenario docs
(Stage 1); a red E2E pair plus the raw-SQL migration for the
`FullProfileGrant` table (Stage 2); the model, port, service, adapter,
bootstrap addition and `resolveSectionAccess` change (Stage 3). No HTTP route
is added at any stage — the lifecycle (grant/revoke to a second holder) is
explicitly out (Boundaries).

## Boundaries & Constraints

**Always:**

- **The data model is a new dedicated table**, not a `Policy`/`UserPolicy`
  row of a new `type`. Re-verified independently against current code
  (Code Map § "Why not `Policy`"), not taken from the design doc on faith:
  `Policies_type_check` (`prisma/migrations/20260831070000_access_control_functional_roles/migration.sql:54-55`)
  is `CHECK ("type" IN ('FR', 'AR'))` — a third value is refused by Postgres
  at INSERT time, and `ACM1-FB-06`'s six live
  `countOf('Policies')).toBe(1)` assertions (Code Map — exact line list, not
  the design doc's approximate "four spots") would break by construction the
  moment a second `Policies` row appeared.
- **No self-assignment**, enforced as a CHECK constraint
  (`"grantedByUserId" IS NULL OR "grantedByUserId" <> "holderUserId"`,
  mirroring `relationships_no_self_endpoint_check`,
  `20260830010000_.../migration.sql:52-53`) with the bootstrap row as the one
  sanctioned `grantedByUserId: NULL` exception — the same shape `prisma/seed.ts:149`
  uses for root's own `createdBy: rootId` self-reference.
- **Last-holder protection is enforced at seed time by construction, not by a
  new mechanism this increment builds and exercises.** A fresh database has
  zero `FullProfileGrant` rows, so the bootstrap's "count under lock, insert
  if zero" seeding step can never violate the "at least one holder" floor —
  it is only at risk once an administrator starts revoking, which is
  lifecycle territory (Boundaries table, "What this increment does not
  build"). This increment nonetheless **defines** the mechanism now (an
  advisory-lock-scoped count check, mirroring `acquireBootstrapLock` /
  `pg_try_advisory_xact_lock`, `access-control-bootstrap.ts:111-128`) because
  a schema and a bootstrap step that assumed lifecycle enforcement would
  arrive "later" would need no migration change when it does — see Ask First
  AF-3 for whether that mechanism ships as inert code in this increment or is
  deferred whole.
- **Journaling**: every seed-created `FullProfileGrant` row gets exactly one
  `AccessJournal` row, `kind: 'full_profile_grant'`, in the **same**
  transaction as the fact row — the pattern `OrgRelationshipRepository.assignManager`
  already uses (`src/user-management/infrastructure/org-relationship.repository.ts:60-111`,
  read in full), not a new shape.
- **Resolution integration is a third facade dependency, not a fourth
  `Audience` label.** `access-control.md:345` states the resolved decision:
  *"Overlay is not a matrix column."* A new `FullProfileAccessPort` /
  `FullProfileOverlayService` pair, structurally parallel to
  `FunctionalRoleEvaluatorService` / `FUNCTIONAL_ROLE_REPOSITORY_PORT`
  (`domain/services/functional-role-evaluator.service.ts:16-31`,
  `domain/interfaces/functional-role.repository.port.ts:1-11`), consulted
  **after** the existing best-of-audience computation inside
  `resolveSectionAccess`, only when `targetAudiences` is non-empty (the
  branch that already survived the `:81-83` early return) — never a change to
  `AudienceResolverService` or `RelationshipGraphPort`.
- **The overlay can only ever move `'none' → 'read'`.** It must never
  upgrade an existing `'write'`, and it must never be consulted when the
  target is unconfirmed (CAP-1 leak-prevention: an inactive or nonexistent
  target must stay `'none'` regardless of who is viewing).
- **`isActiveHolder` mirrors the CAP-1 discipline already in this codebase**:
  an inactive holder is never a holder, the same way
  `FunctionalRoleEvaluatorService.isAllowed`
  (`functional-role-evaluator.service.ts:23-30`) gates `DEFAULT_PERMISSIONS`
  on `isActiveUser`, and the same way `PrismaIdentityAdapter.findActiveUserIds`
  (`infrastructure/prisma-identity.adapter.ts:9-24`) filters `isActive: true`
  before any audience derives.
- **Bootstrap seeding runs inside the existing locked transaction, not a
  second one.** The new logic joins `bootstrapAccessControl`'s
  `prisma.$transaction` (`access-control-bootstrap.ts:308-423`), after
  `acquireBootstrapLock` (`:111-128`, called at `:310`) and after `root` is
  located and revalidated (`:326`, re-revalidated pre-commit at `:405-420`).
- **The bootstrap seeding condition is "zero `FullProfileGrant` rows exist
  anywhere," not "no row for root specifically."** A later administrator
  granting the overlay to a second person, followed by a re-run of
  `db:bootstrap:access-control` (an idempotent, re-runnable script by design —
  header comment `access-control-bootstrap.ts:1-13`), must not be misread as
  "root lost its seeded status." `SELECT count(*) FROM full_profile_grants FOR UPDATE`
  under the same lock: zero rows → seed root; one or more → verify-or-no-op,
  the same "singleton present → verify; singleton absent → create" shape
  already used for `AccessControlBootstrap` (`:328-348` verify,
  `:394-403` create).
- **The journal row for the bootstrap-seeded grant self-references its
  actor**, `actorUserId: root.id`, `subjectUserId: root.id` —
  `AccessJournal.actorUserId` is `NOT NULL` (`schema.prisma:101`, confirmed
  by direct read, no `?`), so it cannot be left empty the way
  `FullProfileGrant.grantedByUserId` can. This mirrors `prisma/seed.ts:149`'s
  root-self-reference rather than inventing a new "system actor" convention.
- Follow this project's AD-1 discipline: scenario docs, then a red E2E, then
  implementation, human approval between every stage, no dispatch spanning
  two. **This is real new schema + behavior — Stage 2 is not degenerate.**
  Every discriminating assertion (the table exists, the constraints hold, the
  seed inserts the row, the resolver bumps `'none' → 'read'`) is false
  against HEAD `de508c9` and can only become true by Stage-3 code.

**Ask First — genuinely unresolved. Do not dispatch Stage 1 until every row
below carries an explicit human ruling, recorded in a follow-up edit to this
file.**

| # | Question | This spec's working assumption (what Code Map/Tasks build against) | Recommendation |
|---|---|---|---|
| **AF-1** | **"max(Self, full-profile)" — literal Self, or "the merge result so far"?** `access-control.md:284`: *"Full-profile is read-only: effective access is `max(Self, full-profile)` with write > read > none…"* Taken completely literally, this formula only ever compares the overlay against the **Self** audience specifically. But Self and the overlay are mutually irrelevant in the overlay's own primary use case — a holder reading an *unrelated* colleague's profile, where the viewer is never Self for that target. Two readings are both textually defensible: **(1) literal** — the formula only fires when `viewerId === targetEmployeeId`, making the overlay inert outside the degenerate self-view case (an odd reading, since §2.4's own opening sentence and the story's Recorded Decision table both describe holders reading *other people's* profiles). **(2) "Self" is shorthand for "whatever the merge already produced"** — reusing the term loosely because `:283` ("When `viewerId === targetId`, Self is exclusive…") just finished establishing that Self, when it applies, is exclusive of the other three, so "the result so far" and "Self" coincide in the one case the sentence is actually thinking about, and the sentence under-specifies the Reporting/PP/Colleague case by omission rather than by intent. | **Reading (2).** The Code Map and Tasks below implement the overlay as `best = isHolder ? max(best, 'read') : best` where `best` is `resolveSectionAccess`'s actual merge output (not literally the `'self'` label) — the only reading under which the overlay does anything for its stated purpose. | **This is an interpretation, not a re-derivation of an unambiguous source sentence** (`solution-design-full-profile-access-overlay.md` §5.4, independently re-read and concurred with here). **Needed before Stage 1 scenario authoring can proceed without guessing.** Confirm against the source text, or amend `access-control.md:284` to remove the ambiguity, before dispatch. |
| **AF-6 (new — not in the architect's solution design)** | **Given today's shipped `SECTION_ACCESS_MATRIX`, does the resolver read have ANY currently-observable effect through a real section, and if not, what counts as "wired" for Stage 1's acceptance?** Independently verified, not assumed: `SECTION_ACCESS_MATRIX` (`domain/constants/section-access-matrix.ts:12-33`, read in full) has exactly three rows — `profile:identity`, `profile:leave`, `profile:projects` — and **every one of the twelve cells (3 rows × 4 audiences) is `'read'` or `'write'`; none is `'none'`.** `AudienceResolverService.resolve` (`domain/services/audience-resolver.service.ts:91-102`, read in full) makes `'colleague'` the unconditional floor for any confirmed, active, non-self target with no reporting/PP relation — so `targetAudiences` is **never empty** for a confirmed active target, and `resolveSectionAccess`'s `best` is therefore **never `'none'`** for any of today's three live sections, for any authenticated viewer, holder or not. `resolveSectionAccess` can only return `'none'` for (a) an unknown section string (returns before the overlay check even under AF-1 reading 2) or (b) an unconfirmed/inactive target (where the overlay must never apply, by design). **Consequence: under reading (2) of AF-1, correctly implemented exactly as designed, this increment's resolver change is currently unobservable through any live HTTP route or any real production section — the design doc's own Stage-1 candidate scenario `acm11-fpo-03` ("resolves `profile:leave`... as `read` where an ordinary colleague would get the matrix's `colleague` cell") is non-discriminating as literally worded, because colleague already gets `'read'` on that row.** A genuine end-to-end proof needs a matrix row with a `'none'` cell for some audience — `docs/project-requirements.md:169`'s S2 (Personal contacts) row has exactly that (`Colleague: —`), but no `SECTION_ACCESS_MATRIX` row exists for S2 yet, and adding one is outside this increment's scope (it is not a §2.4 concern). | **Prove the mechanism at the unit/component level** — a Jest suite that imports `AccessControlFacade` with a real `AudienceResolverService`/`FunctionalRoleEvaluatorService`/`FullProfileOverlayService` but a `jest.mock`'d `SECTION_ACCESS_MATRIX` module carrying one synthetic row with a `'none'` cell, proving the new branch bumps it to `'read'` for a holder and leaves it `'none'` for a non-holder. This is a real, rigorous proof that the code path is wired and correct; it is **not** an end-to-end HTTP behavior change today. | **Confirm this substitution is acceptable for 4.2c's acceptance, or hold the resolver-read task until a real section with a `'none'` cell lands** (which would defeat the point of folding it in now — see AF-2). Flagged here because the architect's solution design did not catch this: its own Stage-1 candidate table assumes a discriminating live scenario exists today, and it does not. |
**AF-2, AF-3, AF-4, AF-5, AF-7 — RESOLVED 2026-09-07, all accepted as
recommended:** fold the resolver-read into this increment (AF-2, follows the
AF-1/AF-6 ruling above); lock-only last-holder protection, with the residual
raw-SQL-bypass risk explicitly accepted rather than adding this schema's
first trigger (AF-3); model name `FullProfileGrant` (AF-4); `AccessJournalKind`'s
reserved values used as-is, no change needed (AF-5); reuse `JournalOperation`'s
existing `'create'` member for the bootstrap-seed write, the lifecycle
increment decides its own naming later (AF-7).

| **AF-2** | **Does 4.2c include the resolver-read integration, or is "seed the row" alone a completable increment, with the read wired in a further split increment?** Design's working recommendation: fold in, because "a seeded row nothing reads has no acceptance-testable behavior." AF-6 above complicates that reasoning — folding in gets you a **provably correct mechanism** (via the unit-level proof), not an **externally observable behavior change**, because no live section can show the difference yet. | This spec's Code Map and Tasks are written **folded in** (per the design's recommendation and per AF-6's unit-level proof standard), because the alternative — a seeded-but-wholly-untested-at-the-facade-level grant — is worse, not better. | **Confirm the fold-in, with AF-6's caveat now on the record** — a PM/PO call, not architectural, per the design doc's own framing. |
| **AF-3** | **Application-lock-only last-holder protection, or a DB constraint trigger as a backstop?** Postgres has no direct way to express "a DELETE must not drop a table's live-row count to zero" as a `CHECK` (a `CHECK` evaluates one row, never an aggregate over siblings). The recommended path — advisory-lock + `SELECT count(*) ... FOR UPDATE` before a revoke, mirroring `acquireBootstrapLock` — needs **zero new schema mechanism**. The alternative, a `CREATE CONSTRAINT TRIGGER`, would be the **first trigger anywhere in this schema** — every other cross-row invariant here (`relationships_one_direct_per_user`, `relationships_one_people_partner_per_user`, FR role-key uniqueness, AR/FR type separation) is a partial unique index or a per-row `CHECK`, never a trigger. | Lock-only. Since this increment never exercises a revoke (only ever inserts the first row), the mechanism is defined but dormant — see the Boundaries table for what "defined but not exercised" means concretely. | **Lock-only is recommended**, but flag the trade-off explicitly: an app bug could theoretically bypass the application check via a raw SQL write, where a trigger could not. This needs a deliberate "residual risk accepted" or "add the trigger" ruling **before the lifecycle increment's own Stage 1** — not blocking for 4.2c itself, since 4.2c never revokes anything, but recorded here so it is not silently dropped between increments. |
| **AF-4** | **Final model name.** `FullProfileGrant` is the design doc's placeholder; no normative source fixes a name. Bikeshed-safe alternatives the design named: `FullProfileAccess`, `ProfileOverlayGrant`. | `FullProfileGrant` throughout this spec's Code Map and Tasks. | Low-stakes; settle once so Stage 1's scenario docs and Stage 2's migration don't disagree. Not blocking Stage 1 dispatch on its own — a naming change after Stage 1 approval is a mechanical rename, not a re-scope — but should be settled in the same pass as AF-1/AF-6 rather than discovered mid-Stage-2. |
| **AF-5** | **`AccessJournalKind`'s reserved `full_profile_grant`/`full_profile_revoke` — used as-is, or need adjustment?** Re-verified directly: `schema.prisma:93-94`, unused by any writer today (`grep -rn "full_profile_grant\|full_profile_revoke" src/` — zero hits outside the enum declaration and this spec's own new code). Their names, singular form, and placement (after `department_manager`, before `shared_link_access`) all read as intentionally pre-provisioned for exactly this design. | Used as-is: `kind: 'full_profile_grant'` for the bootstrap-seeded row. | **No change needed** — this is the one piece of the overlay's storage that was already provisioned correctly. Listed as an Ask First only because the task instructions require it to be surfaced, not because there is a live disagreement. |
| **AF-7** | **`JournalOperation` union** (`src/user-management/infrastructure/access-journal-idempotency.ts:20-28`, read in full: `'create' \| 'replace' \| 'delete' \| 'dept_add' \| 'dept_move' \| 'dept_remove' \| 'dept_mgr_set' \| 'dept_mgr_remove'`) **has no member for a grant/revoke operation.** Does the bootstrap-seed write need one, or does `kind: 'full_profile_grant'` alone disambiguate against the existing `'create'` member? | Reuse `'create'` for the one bootstrap-seed write this increment performs — `kind` already disambiguates it from every other `'create'`-operation journal row (a `Relationship`, a `DepartmentMembership`, …), and the union's own header comment (`:15-19`) already anticipates future stories adding members incrementally, not up front. | **Either is defensible; this is a lifecycle-increment naming-convention question, not a 4.2c data-model question** (the design doc's own framing, concurred with here) — the lifecycle increment, which actually builds an ordinary grant/revoke command, is better positioned to decide whether its own idempotency keys want dedicated operation names. 4.2c's one write is a special case (bootstrap, not a command) and does not need the union extended to express it. |

**Never:**

- **Never add `'full'` (or any name) as a fifth `Audience` label**, and never
  add a row to `SECTION_ACCESS_MATRIX` for the overlay. `access-control.md:345`:
  *"Overlay is not a matrix column."* Doing either would let the overlay merge
  through the same per-audience best-of-N loop Reporting/PP/Colleague use,
  which has no built-in way to enforce "read-only, never bypasses functional
  permissions, command rules, field/record restrictions" (`access-control.md:284`).
- **Never model the grant as a `Policies` row, a `UserPolicies` row, or any
  other reuse of the FR/AR tables.** `spec-4-2b`'s own Never list already
  forbade this for scope item 3 generally; this spec re-confirms the specific
  reason (`Policies_type_check`, `ACM1-FB-06`) against current code rather
  than repeating the prohibition on inherited authority alone.
- **Never build a grant/revoke HTTP endpoint, command, or admin UI.** No
  `POST`/`DELETE` route, no controller, no DTO for granting a *second*
  holder. The lifecycle stays the access-control deferred-work item.
- **Never exercise the "only an existing holder may grant" application check**
  in this increment's own tests as a positive path — bootstrap's
  `grantedByUserId: NULL` insert bypasses that check by construction (it is
  the one sanctioned exception), and there is no second grant to attempt one
  against. A test that tries to prove "an existing holder can grant" would be
  inventing lifecycle scope this increment does not build.
- **Never exercise last-holder protection's revoke path.** The mechanism is
  defined (AF-3) but this increment only ever inserts the first row; no task
  here deletes or revokes a `FullProfileGrant` row, seeded or otherwise.
- **Never touch `docs/architecture/access-control.md`, `docs/project-requirements.md`,
  the story file, the design doc, or any other spec.** Modify nothing but
  this one new file, per the task's own instruction — including not
  "resolving" AF-1 or AF-6 by silently picking a reading and deleting the
  question.
- **Never widen `DEFAULT_PERMISSIONS`, `CANONICAL_PERMISSIONS`, or any
  functional-role grant** as a way to approximate "full read." The overlay is
  explicitly not an FR mechanism (`access-control.md:19`, `project-requirements.md`
  §2.3 — "a functional role never widens data access").
- **Never make the seed condition "no row for root."** Per Always above, the
  condition is "zero rows anywhere" — a narrower condition would misfire on
  rerun after a real administrator has granted a second holder.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fresh production bootstrap | Empty `full_profile_grants`; `db:seed && db:bootstrap:access-control` on an empty DB | `full_profile_grants` gains exactly **1** row: `holderUserId = root.id`, `grantedByUserId = NULL`, `revokedAt = NULL`. One `AccessJournal` row: `kind: 'full_profile_grant'`, `actorUserId = subjectUserId = root.id` | N/A |
| Rerun over an already-seeded DB | `full_profile_grants` already has ≥1 row (root's seed, or an administrator's later grant to someone else) | No new row inserted, no drift error — a re-run is a no-op for this mechanism, mirroring `AccessControlBootstrap`'s singleton verify-or-no-op shape | N/A (unless the seed condition were misread as "no row for root" — Never above) |
| Concurrent first runs | Two bootstraps racing on an empty DB | One coherent single row; the shared advisory lock (already serializing the whole bootstrap transaction) prevents a duplicate | N/A |
| Root reads an unrelated colleague's section (real section, per AF-1 reading 2, AF-6 caveat) | Root (holder), confirmed active, viewing a confirmed active target with no reporting/PP relation, on a **synthetic** section row with a `'none'` colleague cell (AF-6 — no live section has one today) | `resolveSectionAccess` returns `'read'`, not `'none'` | N/A |
| Root reads a real live section today (`profile:identity`/`leave`/`projects`) | Same as above, but a real section | **Unchanged from today** — `'read'` (via the `colleague` floor), because the overlay only ever raises `'none'` and none of today's cells are `'none'` (AF-6) | N/A |
| Overlay never upgrades to write | A holder with no Reporting/PP relation to the target, any section | `best` stays capped at `'read'`, never `'write'`, regardless of holder status | N/A |
| Overlay does not apply to an unconfirmed/inactive target | Holder resolving a deactivated or nonexistent target id | `'none'` — the overlay branch is never reached, because `targetAudiences` is empty and `resolveSectionAccess` already returned `'none'` before the overlay check | N/A |
| Non-holder, ordinary employee | Any active employee who is not a holder, any section, any target | Unchanged from today in every respect — a regression lock over the pre-existing merge path | N/A |
| Self-assignment attempt (mechanism defined, not exercised by this increment's own tests as a live path) | A hypothetical direct-insert attempt with `holderUserId = grantedByUserId` | Rejected by the CHECK constraint at the database level | Postgres constraint violation |
| Last-holder revoke attempt (mechanism defined, not exercised) | A hypothetical revoke of the sole holder | Blocked by the application-layer lock+count check (AF-3) | Application-level rejection (exact shape is lifecycle-increment scope) |

</frozen-after-approval>

## Code Map

Every line below was read directly at `services/backend` HEAD `de508c9` on
2026-09-07, working tree clean — independently re-verified against current
code, not copied from the design doc's citations (which were taken at an
earlier baseline, `8ec35fd`; nothing material drifted between the two for the
files below, confirmed by direct comparison).

### The schema — confirmed no model exists, confirmed the exact CHECK text

- `prisma/schema.prisma` — **414 lines total** (`wc -l`), matching the design
  doc's own count exactly; searched in full. No `FullProfileGrant` model, no
  `full_profile_grant` table reference, and no column resembling one.
- `prisma/schema.prisma:88-96` `enum AccessJournalKind` — `full_profile_grant`
  at `:93`, `full_profile_revoke` at `:94`, sandwiched between
  `department_manager` and `shared_link_access`. Confirmed unused:
  `grep -rn "full_profile_grant\|full_profile_revoke" src/` returns zero
  hits outside this declaration.
- `prisma/schema.prisma:98-119` `model AccessJournal` — `actorUserId` at
  `:101` is `String` (**not** `String?`), confirmed by direct read.
  `subjectUserId` (`:107`) **is** nullable, `String?`. This is the exact
  asymmetry the bootstrap-seed journal write relies on (Always, above): the
  journal's `actorUserId` cannot be left empty for the one row with no
  granting holder, so it self-references root the same way `seed.ts:149`
  does for `createdBy`.
- `prisma/migrations/20260831070000_access_control_functional_roles/migration.sql:1-10`
  — the migration's own header: *"Type separation between functional roles
  (FR) and access roles (AR) is the whole point of this schema."*
  `:53-55`:
  ```sql
  -- Invariant 1: `type` is restricted to the two kernel values...
  ALTER TABLE "Policies" ADD CONSTRAINT "Policies_type_check"
    CHECK ("type" IN ('FR', 'AR'));
  ```
  Confirmed verbatim by direct read — this is the constraint an overlay-as-
  `Policies`-row option would need to alter, which is exactly the "type
  separation is load-bearing" boundary the migration's own comment names.
- `test/access-control/acm1r-fr-foundation.e2e-spec.ts` — `countOf('Policies')).toBe(1)`
  occurs at **six** sites, not the design doc's approximate "four spots":
  `:445, :514, :790, :987, :1215, :1239` (independently grepped and counted,
  not copied). Every one of these would break the moment a second `Policies`
  row landed for any reason, including a §2.4 grant modeled as one.
  **Separately noted, not this increment's problem to fix:** this same file's
  `CANONICAL_KEYS` constant (`:51-54`) and its cardinality assertions
  (`toBe(3)`/`toBe(4)` at multiple sites, e.g. `:345, :432, :433, :820`) still
  assert the **pre-4.2a** three/four-key canonical set — `git show --stat 4ce8bd8`
  confirms 4.2a's own commit did not touch this file, only
  `access-control-bootstrap.ts`, `package.json`, and two brand-new
  `s42a-op-*` suites. This suite is very likely red at HEAD `de508c9` for a
  reason wholly unrelated to 4.2c (a pre-existing gap in 4.2a's own
  close-out, mirroring the "Known pre-existing failures" pattern `spec-4-1d`
  and `spec-4-2a` already record). Flagged here so a Stage-2 implementer does
  not mistake this suite's baseline red/green state for something 4.2c
  caused, and does not attempt to fix it as a drive-by (out of scope, Never).
- `prisma/migrations/20260830010000_access_control_relationships/migration.sql:33-35`
  `relationships_one_direct_per_user` (`CREATE UNIQUE INDEX ... WHERE "type" = 'direct'`)
  and `:52-53` `relationships_no_self_endpoint_check`
  (`CHECK ("reportsToUserId" IS NULL OR "reportsToUserId" <> "userId")`) — the
  two idioms `FullProfileGrant`'s partial-unique "current holder" index and
  no-self-assignment CHECK mirror, confirmed verbatim.
- `prisma/schema.prisma:175-188` `model DepartmentMembership` and `:195-209`
  `model EmploymentStatus` — both confirmed to use the
  `validFrom`/`validTo` + comment-documented `WHERE validTo IS NULL` partial-
  unique idiom ("one current row, many historical rows"), the pattern
  `FullProfileGrant`'s `revokedAt IS NULL` partial unique applies to holder
  rather than department-membership or employment status.
- `prisma/seed.ts:136, :149` — the comment *"it can be reused as its own
  `createdBy` in the same insert"* and the literal `createdBy: rootId` on
  root's own `User` row, confirmed at the exact cited lines. The precedent
  the bootstrap-seed's `grantedByUserId: NULL` / journal `actorUserId: root.id`
  self-reference follows.

### The facade — exact current shape, exact integration point

- `src/access-control/application/access-control.facade.ts` — read in full
  (95 lines). Constructor at `:22-25` takes exactly two dependencies,
  `resolver: AudienceResolverService` and
  `functionalRoles: FunctionalRoleEvaluatorService` — the third,
  `fullProfileOverlay: FullProfileOverlayService`, is a new constructor
  parameter, added alongside these two, not replacing either.
  `canAccessSection` (public) spans `:52-66`; the private `resolveSectionAccess`
  spans `:68-94`. Confirmed byte-identical in shape to the design doc's own
  citation (baseline `8ec35fd`) — no drift between that baseline and this
  spec's `de508c9`.
  - `:73-76` — unknown-section early return (`if (!row) return 'none';`).
    **The overlay must never be reached for an unknown section** — this is
    also the reason AF-6's synthetic-row unit test is the only way to
    exercise the new branch discriminatingly (Ask First).
  - `:78-83` — audience resolution and the empty-target early return. The
    overlay branch is inserted **after** this point, inside the surviving
    branch, per Always above.
  - `:85-93` — the best-of-audience loop, `RANK` table, `best` variable. The
    overlay's `best = isHolder ? (RANK.read > RANK[best] ? 'read' : best) : best`
    (or equivalently `best = maxRank(best, isHolder ? 'read' : 'none')`)
    inserts immediately after this loop, before the `return best;` at `:93`.
- `src/access-control/domain/services/functional-role-evaluator.service.ts` —
  read in full (32 lines). The exact pattern `FullProfileOverlayService`
  mirrors: `@Injectable()` class, one `@Inject(PORT_TOKEN)` constructor
  parameter, one method delegating straight to the port
  (`isAllowed`, `:23-31`, mirrors what `isHolder` will do for
  `isActiveHolder`). The `DEFAULT_PERMISSIONS.has(...)` / `isActiveUser` gate
  at `:24-28` is the CAP-1-discipline precedent `FullProfileAccessPort.isActiveHolder`
  follows — "inactive never counts."
- `src/access-control/domain/interfaces/functional-role.repository.port.ts` —
  read in full (11 lines). The exact shape `FullProfileAccessPort` mirrors:
  a plain interface plus an exported `Symbol(...)` token
  (`FUNCTIONAL_ROLE_REPOSITORY_PORT`, `:9-11`), no class.
- `src/access-control/infrastructure/prisma-functional-role.repository.ts` —
  read in full (45 lines). The exact shape `PrismaFullProfileAccessAdapter`
  mirrors: `@Injectable()`, one `PrismaService` constructor dependency, one
  raw-SQL `EXISTS` query per method (`:16-36` for `isAllowed`), a plain
  `findUnique` for the active-user gate (`:38-44` `isActiveUser`).
  `isActiveHolder` follows the `isAllowed` shape: one
  `SELECT EXISTS (SELECT 1 FROM full_profile_grants g JOIN users u ON u.id = g."holderUserId" WHERE g."holderUserId" = $1 AND g."revokedAt" IS NULL AND u."isActive" = TRUE)`
  query, no second round trip.
- `src/access-control/access-control.module.ts` — read in full (43 lines).
  `providers` array at `:24-40` lists `AccessControlFacade`,
  `AudienceResolverService`, `FunctionalRoleEvaluatorService`, and three
  `{provide, useClass}` port bindings. The new provider set adds
  `FullProfileOverlayService` alongside the two existing services and a
  fourth `{provide: FULL_PROFILE_ACCESS_PORT, useClass: PrismaFullProfileAccessAdapter}`
  binding — `exports: [AccessControlFacade]` at `:41` needs no change, since
  only the facade is exported today.

### The unresolved observability gap — AF-6's evidence, independently derived

- `src/access-control/domain/constants/section-access-matrix.ts` — read in
  full (33 lines). `SECTION_ACCESS_MATRIX` (`:12-33`) has **exactly three
  keys** — `profile:identity` (`:15-20`: self/colleague `read`,
  reporting/pp `write`), `profile:leave` (`:21-26`: all four `read`),
  `profile:projects` (`:27-32`: all four `read`). **Every cell in all three
  rows is `'read'` or `'write'`; none is `'none'`, confirmed by exhaustive
  read of the whole file, not sampling.**
- `src/access-control/domain/services/audience-resolver.service.ts:91-102`
  — the exact branch that makes `'colleague'` an unconditional floor: if
  `reporting`/`pp` don't apply and `id !== viewerId`, `labels.add('colleague')`
  unconditionally (`:98-100`, comment: *"No qualifying relationship —
  Colleague is the floor, never alongside another audience"*). Combined with
  `:79-82` (an unconfirmed/inactive target gets an **empty** Set, never
  reaching this floor), this proves: for any confirmed active target,
  `targetAudiences` is never empty, and always contains at least `'colleague'`.
- **Conclusion, independently derived, not present in the design doc:**
  given the two facts above, `resolveSectionAccess`'s `best` for any of
  today's three live sections is **never `'none'`** for a confirmed active
  target, for any viewer. The overlay's `'none' → 'read'` bump therefore has
  no discriminating end-to-end HTTP effect on any section this codebase
  currently serves. This directly weakens
  `solution-design-full-profile-access-overlay.md`'s own Stage-1 candidate
  `acm11-fpo-03` ("holder reads colleague section as `read` where an
  ordinary colleague would get the matrix's `colleague` cell") — both
  outcomes are `'read'` today; the scenario as literally worded does not
  discriminate. Recorded as **Ask First AF-6**, not silently corrected,
  because it changes what "make the seeded grant observable" can concretely
  mean for this increment (Design Notes).
- `docs/project-requirements.md:169` — S2 (Personal contacts) row: `Colleague: —`.
  Confirms a `'none'`-cell section **does** exist in the normative
  requirements matrix; it simply has no `SECTION_ACCESS_MATRIX` row yet, and
  adding one is outside this increment (it is an unrelated section-coverage
  gap, not a §2.4 concern).

### The bootstrap — exact join point

- `src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`
  — read in full (430 lines). `acquireBootstrapLock` `:111-128`, called at
  `:310`, first statement inside the transaction. `locateRoot` result bound
  to `root` at `:326`. The whole transaction spans `:308-423`
  (`await prisma.$transaction(async (tx) => { ... }, { timeout: ..., maxWait: ... });`).
  The `AccessControlBootstrap` singleton present/verify branch is `:328-348`;
  the singleton-absent insert is `:394-403`. Pre-commit revalidation of
  root's continued eligibility is `:405-420`, immediately before the
  transaction closes at `:421`. **The new §2.4 seeding logic inserts as one
  more step inside this same callback**, after `root` is bound (`:326`) and
  before or alongside the FR-policy logic that already runs there (`:350-392`)
  — order relative to the FR logic is not load-bearing (independent tables,
  independent locks-within-the-lock), but must stay inside the same
  `$transaction` call, not a second one.
- `access-control-bootstrap.ts:22-70` `CANONICAL_PERMISSIONS` — confirmed
  **six** entries at HEAD `de508c9` (the three original `user-management:*`
  keys plus `org:relationships:write`, `employee:departure:record`,
  `profile:timeline:write`), matching 4.2a's shipped state. Unrelated to
  this spec's own change; cited only to confirm the file's current baseline
  before adding to it.
- `access-control-bootstrap.ts:1-13` — the header comment establishing the
  script's re-runnable-by-design contract, cited for "the seed condition is
  zero rows anywhere, not zero rows for root" (Always).

### The journal-write pattern to mirror

- `src/user-management/infrastructure/org-relationship.repository.ts:60-111`
  `assignManager` — read in full. Generates the fact-row id up front
  (`uuidv7()`, `:64`), writes the fact row and the `AccessJournal` row inside
  **one** `prisma.$transaction` (`:74-104`), derives `idempotencyKey` via
  `accessJournalIdempotencyKey(actorId, subjectId, kind, relationshipId, operation)`,
  and uses `skipDuplicates: true` (`:100`) on the journal insert so a retried
  mutation reaching the same fact transition absorbs cleanly.
- `src/user-management/infrastructure/access-journal-idempotency.ts` — read
  in full (42 lines). `JournalOperation` (`:20-28`) is
  `'create' | 'replace' | 'delete' | 'dept_add' | 'dept_move' | 'dept_remove' | 'dept_mgr_set' | 'dept_mgr_remove'`
  — confirmed no member fits a grant/revoke operation by name (Ask First
  AF-7). `accessJournalIdempotencyKey` (`:30-42`) hashes
  `[actorUserId, subjectUserId, kind, relationshipId, operation].join('|')`
  — for the bootstrap-seed write, `relationshipId` is the new
  `FullProfileGrant` row's own generated id (the same "generate the fact-row
  id up front" idiom `assignManager` uses), not a `Relationship` id.

### §2.4 and §3.4 — read directly, not only through the design doc's summary

- `docs/architecture/access-control.md:277-289` "Multi-audience merge" — read
  in full. Point 4, `:284`, is the exact ambiguous sentence quoted verbatim
  in Ask First AF-1. Point 3, `:283` ("When `viewerId === targetId`, Self is
  exclusive of Reporting, Project, PP, and Colleague"), is the sentence AF-1's
  reading (2) leans on.
- `docs/architecture/access-control.md:334-345` "Full-profile access overlay
  (§2.4)" — read in full. The five normative bullets (first holder seeded at
  deployment; only an existing holder may grant, no self-assignment; removing
  the last holder is blocked, including self-revocation by the sole holder;
  every grant/revocation journaled; holders are the shared-link revocation
  backstop) and the resolved note at `:345`: *"Overlay is not a matrix
  column. AD-28 full-profile-access scenarios are not yet authored ... do
  not invent scenarios. Authoring requires an AD-1 Stage-1 dispatch."*
- `docs/architecture/access-control.md:347-356` "Relationship and access
  journal (§3.4)" — read in full. `:356`: *"HR Admin by functional role is
  not a journal reader"* — confirmed, listed for completeness though this
  increment adds no reader (a reader is HTTP surface, out of scope).
- `docs/architecture/access-control.md:373-384` "Open product decisions" —
  `:380`: *"Full-profile + Self precedence — Resolved 2026-09-02 PM/AD-28.
  Self exclusive when viewer equals target; then `max(Self, overlay)`."*
  Read directly; does not itself resolve AF-1 (it restates the same
  ambiguous formula in different words, not a disambiguation of it).
- `docs/project-requirements.md:134-142` §2.4 "Full profile access" — read
  in full. Confirms the same five bullets as `access-control.md`'s §2.4,
  independently sourced (not derived from one text via the other). `:146-153`
  §3.1: "Full access — holders of the grant described in 2.4" is named in
  the matrix's audience **legend**, but does **not** appear as a column
  header in the actual §3.2 table (`:164-186`, read in full) — consistent
  with "not a matrix column."

## Tasks & Acceptance

**Execution — three separately-approved AD-1 stages. No dispatch spans two.
Stage 1 may not be dispatched until Ask First AF-1 and AF-6 carry an explicit
human ruling (see the STOP block at the top of this file).** Nothing below
has been executed; this is the plan.

- [x] **AD-1 stage 1 — scenario docs only.** Complete and human-approved
  (six `acm11-fpo-01`..`06` docs under `docs/test-cases/access-control-kernel/full-profile-overlay/`,
  AF-1/AF-6 rulings recorded in that folder's `README.md`).
  - Author, under a new folder
    `docs/test-cases/access-control-kernel/full-profile-overlay/` (sibling of
    `tree-root-seed/`, `fr-bootstrap/`, `multi-audience/`, following the
    existing `README.md` authoring convention — `acm11` confirmed as the
    next unused ACM number: `acm9` is taken (the performance-baseline suite),
    `acm10` is proposed-but-unused by the upward-walk design, `acm11` appears
    nowhere in `docs/test-cases/` today):
    - `acm11-fpo-01-bootstrap-seeds-root-as-first-holder.md` — fresh
      `db:seed && db:bootstrap:access-control` leaves exactly one
      `full_profile_grants` row (`holderUserId = root`, `grantedByUserId = NULL`)
      and one `AccessJournal` row (`kind: 'full_profile_grant'`).
    - `acm11-fpo-02-rerun-is-idempotent-no-duplicate-row.md` — re-running
      the bootstrap script against an already-seeded DB inserts no second
      row, mirroring `acm1r-fb-05`/`acm1r-fb-20..22`'s precedent for the FR
      singleton.
    - `acm11-fpo-03-holder-bumps-a-none-cell-to-read.md` — **rewritten from
      the design doc's version per AF-6**: a synthetic/component-level proof
      (`AccessControlFacade` with a `jest.mock`'d `SECTION_ACCESS_MATRIX`
      carrying one row with a `'none'` colleague cell) that a holder
      resolves `'read'` where a non-holder resolves `'none'`. Explicitly
      document, in the scenario doc's own Trace section, that no live
      production section demonstrates this today (AF-6) and that this is a
      mechanism-correctness proof, not an end-to-end behavior claim.
    - `acm11-fpo-04-overlay-never-upgrades-to-write.md` — a holder with no
      Reporting/PP relation to the target never gets `'write'` on any
      section, even against the synthetic row.
    - `acm11-fpo-05-overlay-does-not-apply-to-inactive-or-unknown-target.md`
      — a holder resolving a deactivated or nonexistent target id gets
      `'none'`, not `'read'` (CAP-1 leak-prevention).
    - `acm11-fpo-06-non-holder-gets-no-overlay-effect-on-real-sections.md` —
      an ordinary active employee (not a holder) resolves exactly today's
      three live matrix rows unchanged — the regression lock over the base
      path this change must not disturb, run against the **real**
      `SECTION_ACCESS_MATRIX`, not the synthetic one.
  - Record AF-1's and AF-6's rulings explicitly in this same folder's
    README, per the design doc's own precedent
    (`solution-design-*.md` §7: "Stage 1 also settles Open Questions 1 and 2
    as an explicit PO/architect ruling recorded in this same folder's README
    before Stage 2 starts").
  - Resolve Ask First **AF-2** (fold-in, now informed by AF-6), **AF-3**
    (lock-only vs. trigger — does not block Stage 1, since this increment
    exercises neither path, but should be recorded), **AF-4** (model name),
    **AF-5** (confirmed, no action), **AF-7** (journal operation) as part of
    this stage.
  - **STOP for human approval — write no test file and no source file in
    this dispatch.**
- [x] **AD-1 stage 2 — red E2E.** Complete and human-approved (the migration
  and the three red spec files existed at dispatch: `acm11-full-profile-overlay-bootstrap.e2e-spec.ts`,
  `-resolution.e2e-spec.ts`, `-real-sections.e2e-spec.ts`).
  - Migration for the `FullProfileGrant` table (name per AF-4's ruling):
    the model, its CHECK constraint (no-self-assignment), and its partial
    unique index (`WHERE "revokedAt" IS NULL`) — raw SQL for the two pieces
    Prisma cannot express, reviewed the way
    `20260830010000_access_control_relationships/migration.sql` and
    `20260831070000_access_control_functional_roles/migration.sql` were.
  - `test/access-control/acm11-full-profile-overlay-bootstrap.e2e-spec.ts` —
    subprocess-driven, `acm1r-fr-foundation.e2e-spec.ts` / `s42a-op-bootstrap-canonical-set.e2e-spec.ts`
    shape (real `db:seed` / `db:bootstrap:access-control` subprocesses, raw
    `PrismaClient` assertions, `resetBootstrapState`-style teardown extended
    to also clear `full_profile_grants`). Covers `acm11-fpo-01`/`02`.
  - `test/access-control/acm11-full-profile-overlay-resolution.e2e-spec.ts`
    — component-level Nest harness: real `AccessControlFacade`, real
    `AudienceResolverService`/`FunctionalRoleEvaluatorService`/
    `FullProfileOverlayService`, a `jest.mock`'d `SECTION_ACCESS_MATRIX` for
    the synthetic-row cases (`acm11-fpo-03/04/05`) and the real, unmocked
    matrix for the regression lock (`acm11-fpo-06`). No HTTP boot needed —
    `profile:leave`/`profile:projects` have no live HTTP consumer today
    (confirmed: `grep -rn "'profile:leave'" src/` finds only the matrix
    definition and one unit spec,
    `infrastructure/__tests__/access-control-facade.adapter.spec.ts:169`),
    and `profile:identity`'s only consumer
    (`access-control-facade.adapter.ts:69`) is not this suite's subject.
  - **Declare explicitly at this gate**: the bootstrap suite is expected to
    be genuinely red (no table exists yet); the resolution suite is
    genuinely red for the synthetic-row cases (no overlay branch exists) and
    is a **pass-already regression lock** for `acm11-fpo-06` (today's
    behavior is unchanged by a not-yet-built overlay) — state both postures
    plainly, per this project's convention of not calling an
    already-correct property "red" when it cannot be.
  - **STOP for human approval — write no non-test file in this dispatch.**
- [x] **AD-1 stage 3 — implementation. DONE 2026-09-07.**
  - The migration — no draft existed from Stage 2 in this dispatch's actual
    baseline (only the three red spec files and a missing schema model were
    handed over); authored fresh here via
    `prisma migrate dev --create-only --name story_4_2c_full_profile_grant`
    then hand-edited (removing the same phantom `Policies`-constraint DROP
    lines `20260903011657_story_4_1_access_journal`'s own header already
    documents), landed for real via that same `prisma migrate dev` run —
    `prisma/migrations/20260907135054_story_4_2c_full_profile_grant/migration.sql`.
    The `FullProfileGrant` Prisma model is in `prisma/schema.prisma`
    (+ three new back-relation arrays on `User`).
  - `src/access-control/domain/interfaces/full-profile-access.port.ts` —
    `FullProfileAccessPort` interface (`isActiveHolder(userId): Promise<boolean>`)
    + `FULL_PROFILE_ACCESS_PORT` symbol token, mirroring
    `functional-role.repository.port.ts`. Built exactly as specified — no
    extra required member, so the resolution suite's literal port-double
    object type-checks.
  - `src/access-control/domain/services/full-profile-overlay.service.ts` —
    `FullProfileOverlayService`, mirroring
    `functional-role-evaluator.service.ts`'s shape exactly (one injected
    port, one delegating method — `isHolder`).
  - `src/access-control/infrastructure/prisma-full-profile-access.adapter.ts`
    — `PrismaFullProfileAccessAdapter`, mirroring
    `prisma-functional-role.repository.ts`'s shape (one raw-SQL `EXISTS`
    query joining `full_profile_grants` to `users`, gated on
    `revokedAt IS NULL AND isActive = TRUE`). Also carries
    `assertHolderCountAboveOneUnderLock(tx)` — AF-3's last-holder-protection
    mechanism, DEFINED here, called by nothing this increment ships (no
    revoke path exists yet). Not part of the `FullProfileAccessPort`
    interface (deliberately — an extra required interface member would break
    the resolution suite's literal double).
  - `access-control.facade.ts` — third constructor dependency
    (`fullProfileOverlay: FullProfileOverlayService`); the `resolveSectionAccess`
    change per Code Map, literally `if (best !== 'write') { const isHolder =
    await this.fullProfileOverlay.isHolder(viewerId); if (isHolder) { best =
    'read'; } }` before `return best;` — the exact snippet the solution
    design's §5.3 and this spec's Code Map both cite, not an optimized
    variant that would skip calling `isHolder` once `best` is already
    `'read'` (that would contradict `acm11-fpo-06`'s own stated claim that
    the branch "is exercised, not dead code").
  - `access-control.module.ts` — registers `FullProfileOverlayService` as a
    provider and binds `FULL_PROFILE_ACCESS_PORT` to
    `PrismaFullProfileAccessAdapter`.
  - `access-control-bootstrap.ts` — the seeding addition inside the existing
    locked transaction: `seedFullProfileGrantIfNone`, count-under-lock
    (`SELECT "id" ... FOR UPDATE`, not `SELECT count(*) ... FOR UPDATE` —
    Postgres refuses `FOR UPDATE` combined with an aggregate, independently
    verified against a live Postgres 18; the design doc's own SQL snippet is
    not directly executable), insert-if-zero, one `AccessJournal` row in the
    same transaction. `journalIdempotencyKey` is a small local function
    (same sha256 derivation as `access-journal-idempotency.ts`'s
    `accessJournalIdempotencyKey`), not a cross-bounded-context import from
    `user-management/infrastructure/` — a judgment call, recorded here.
  - **No grant/revoke HTTP surface, no route, no UI, no exercised
    last-holder-protection revoke path, no exercised "only a holder may
    grant" check** — confirmed, Never above.
  - **Two additions beyond the Code Map's own file list, both test
    infrastructure, neither touching a red test file, a scenario doc, or
    `acm1r-fr-foundation.e2e-spec.ts`:**
    - `test/jest.setup-full-profile-grants-sentinel.ts` (+ one line in
      `test/jest-e2e.json`'s `setupFilesAfterEnv`) — a permanent, dedicated
      sentinel `full_profile_grants` row (backed by a permanent sentinel
      `User` no suite's own run-scoped prefix filter ever matches),
      re-established before every test file's own tests. Necessary because
      `bootstrapAccessControl`'s new "zero rows anywhere" seed condition,
      run against several PRE-EXISTING e2e suites authored before this table
      existed (`acm1r-fr-foundation.e2e-spec.ts`, `s42a-op-bootstrap-canonical-set.e2e-spec.ts`),
      would otherwise seed a `full_profile_grants` + `access_journal` row
      for one of THEIR OWN throwaway root users the first time any of them
      happened to see the table empty — RESTRICT-blocking that suite's own
      later `deleteMany` on that user and cascading into every subsequent
      test in the file (empirically observed: `acm1r-fr-foundation.e2e-spec.ts`
      went from its pinned 16/23/39 to 39/39/39 before this fix). See
      Verification below for the confirmed after-fix counts.
  - Run the Verification set below and record real results, replacing the
    plan with the outcome — done.

**Acceptance Criteria:**

- **Given** a freshly migrated, empty database, **when**
  `npm run db:seed && npm run db:bootstrap:access-control` runs, **then**
  `full_profile_grants` has exactly **1** row (`holderUserId = root.id`,
  `grantedByUserId = NULL`, `revokedAt = NULL`), and `access_journal` gains
  exactly one row `kind = 'full_profile_grant'`,
  `actorUserId = subjectUserId = root.id`.
- **Given** that seeded state, **when** `db:bootstrap:access-control` is
  rerun, **then** `full_profile_grants` still has exactly 1 row (no
  duplicate), and no drift error is raised.
- **Given** a direct-insert attempt with `holderUserId = grantedByUserId` on
  a non-bootstrap row, **when** the insert runs, **then** it is rejected by
  the CHECK constraint.
- **Given** the component-level resolution suite with a synthetic
  `'none'`-cell section row, **when** a holder resolves that section over a
  confirmed active target with no Reporting/PP relation, **then** the result
  is `'read'`; **when** a non-holder does the same, **then** the result is
  `'none'`.
- **Given** the same synthetic row, **when** a holder resolves it over a
  target they have no `'write'`-granting relation to, **then** the result is
  never `'write'`.
- **Given** a holder resolving a deactivated or nonexistent target id (any
  section), **when** `canAccessSection` is called, **then** the result is
  `'none'`.
- **Given** the three real, live `SECTION_ACCESS_MATRIX` rows
  (`profile:identity`, `profile:leave`, `profile:projects`), **when** any
  authenticated employee (holder or not) resolves any of them today,
  **then** the result is byte-identical to pre-change behavior — the
  regression lock (AF-6's own finding: this is expected to hold trivially,
  since no live cell is `'none'`).
- **Given** the full `test/access-control` and `test/user-management` e2e
  sets and the unit suite, **when** run after this change, **then** every
  suite's pass/fail counts are identical to the pre-change baseline except
  for the two new suites, both green — **with the one caveat recorded in
  Code Map** that `acm1r-fr-foundation.e2e-spec.ts` may already be red at
  HEAD `de508c9` for an unrelated, pre-existing 4.2a gap; this increment
  must not change that suite's pass/fail count either way.
- **Given** `git diff --stat` over `src/access-control/domain/audience.ts`
  and `src/access-control/domain/services/audience-resolver.service.ts`,
  **when** taken after this change, **then** both are empty — the overlay is
  a facade-level addition, never a change to audience resolution itself.

## Design Notes

### Why a dedicated model, re-derived independently

`Policy`/`UserPolicy`/`PolicyPermission` answers "does this user's role grant
this feature key" — a global, boolean, catalog-shaped question with no
per-target-user relationship. The overlay answers a structurally different
question: "does user A currently hold read access over every OTHER user's
profile" — a **holder** fact with its own **grantedBy** actor and its own
**lifecycle** (grant/revoke, journaled, singleton-floor protected). Bolting
`grantedBy`/`grantedAt`/`revokedAt` onto `UserPolicy` (a bare
`(userId, policyId)` pair — confirmed by direct read of
`prisma/schema.prisma:390-398`) would widen a table every other FR consumer
reads, for a concern FR evaluation must never see. This spec re-confirms the
design doc's conclusion against current code (`Policies_type_check`,
`ACM1-FB-06`'s six live sites) rather than inheriting it as given.

### Why the bootstrap-seed's journal write does not need a `JournalOperation` decision to block Stage 1

Per Ask First AF-7, reusing `'create'` for the one write this increment
performs is defensible without extending the union, because `kind:
'full_profile_grant'` already disambiguates it from every other `'create'`
operation the journal records. The union only needs a dedicated
`'full_profile_grant'`/`'full_profile_revoke'` pair once an **ordinary**
grant/revoke command exists to generate idempotency keys for repeated
attempts against the same fact transition — this increment's bootstrap write
is not repeatable in that sense (the "zero rows anywhere" seed condition
already makes it idempotent at the row level, independent of the
idempotency-key mechanism).

### The AF-6 finding, restated plainly

The architect's solution design (§7) proposed folding the resolver-read into
4.2c specifically so the increment's acceptance criterion would be
"externally observable rather than a database row nobody reads yet." That
framing implicitly assumed a live section exists where the overlay's effect
differs from the status quo. **It does not, today.** Every currently-served
section's `SECTION_ACCESS_MATRIX` row grants the universal `'colleague'`
floor at least `'read'`, so `resolveSectionAccess` never returns `'none'` for
a confirmed active target regardless of the overlay. Folding the resolver
read into 4.2c still buys something real — a provably correct, unit-tested
mechanism ready to activate the moment a `'none'`-cell section (S2 Personal
contacts, S3 Emergency contacts, or any future section the requirements
matrix reserves a `'none'`/`'—'` cell for) is added to
`SECTION_ACCESS_MATRIX` — but it does not buy an end-to-end HTTP behavior
change today, and this spec is explicit about that rather than letting
"observable" quietly mean two different things in Stage 1 and Stage 3.

### What this increment does not build — mapped against the deferred lifecycle

| Capability | Built by 4.2c | Deferred lifecycle |
|---|---|---|
| `FullProfileGrant` table + CHECK + partial-unique "current holder" index | **Yes** | — |
| Bootstrap insert of the first row (`grantedByUserId: NULL`, root as holder) | **Yes** | — |
| `AccessJournal` row for the bootstrap-seeded grant | **Yes** | — |
| `FullProfileAccessPort` / `FullProfileOverlayService` / the `resolveSectionAccess` change | **Yes**, per AF-2's fold-in — proven at the unit/component level (AF-6) | — |
| An HTTP endpoint / command to grant a **second** holder | No | **Yes** |
| An HTTP endpoint / command to revoke a holder | No | **Yes** |
| "Only an existing holder may grant" application check, exercised | Defined nowhere yet (bootstrap bypasses it by construction) | **Yes** — this is the check an ordinary grant endpoint would enforce; 4.2c does not even define it, since there is no grant path to attach it to |
| Last-holder protection, exercised | Defined (mechanism named in Always/AF-3), never called | **Yes** |
| Shared-link revocation backstop | No | **Yes** — depends on the separately-deferred §4.8 shared-link overlay |
| `GET /users/:id/access-journal`'s full-profile-overlay reader leg | No | **Yes** — `deferred-work.md`'s `additional_consumer` note names this as gated behind this same data-model item |
| A `SECTION_ACCESS_MATRIX` row with a `'none'` cell (the thing that would make the resolver read end-to-end observable) | No — out of this spec's subject entirely | Whichever future story adds S2/S3/etc. to the live matrix |

## Verification

**DONE 2026-09-07 — every command below was actually run against real
Postgres 18 (`npm run db:up`); results are real output, not a plan.**

| Command | Result |
|---|---|
| `npm run test:e2e -- acm11-full-profile-overlay-bootstrap` | **Green.** `Test Suites: 1 passed, 1 total`, `Tests: 2 passed, 2 total` (ACM11-FPO-01, -02). |
| `npm run test:e2e -- acm11-full-profile-overlay-resolution` | **2 failed, 2 passed, 4 total.** ACM11-FPO-03 Test 2 and ACM11-FPO-05 Test 3 pass. ACM11-FPO-03 Test 1 and ACM11-FPO-04's one test fail — **not a production-code defect**; see "Genuine test-file defect" below. |
| `npm run test:e2e -- acm11-full-profile-overlay-real-sections` | **Green.** `Test Suites: 1 passed, 1 total`, `Tests: 4 passed, 4 total` (ACM11-FPO-05 Test 1/2, ACM11-FPO-06 Test 1/2). |
| `npm run test:e2e -- acm11-full-profile-overlay` (all three together) | `Test Suites: 1 failed, 2 passed, 3 total`; `Tests: 2 failed, 8 passed, 10 total` — the same two resolution-suite failures, nothing else. |
| `npm run test:e2e -- test/access-control` | `Test Suites: 2 failed, 19 passed, 21 total`; `Tests: 18 failed, 140 passed, 158 total` = 16 (`acm1r-fr-foundation`, pinned baseline, confirmed unchanged) + 2 (the resolution-suite DI defect above). Every other suite in the directory green. |
| `npm run test:e2e -- acm1r-fr-foundation` (isolated, to confirm the exact pinned baseline) | `Tests: 16 failed, 23 passed, 39 total` — **byte-identical to the required baseline.** (Before the `jest.setup-full-profile-grants-sentinel.ts` fix, this was catastrophically `39 failed, 39 total` — see Design Notes.) |
| `npm run test:e2e -- s42a-op- s42b-tr- s42d-ds-` (every sibling 4.2-increment suite) | **Green.** `Test Suites: 6 passed, 6 total`, `Tests: 67 passed, 67 total`. |
| `npm run test:e2e -- test/user-management` | **Unchanged.** `Test Suites: 26 passed, 26 total`, `Tests: 18 todo, 296 passed, 314 total` — exact match to the required baseline. |
| `npm run test` (unit) | **Green, unchanged.** `Test Suites: 5 passed, 5 total`, `Tests: 44 passed, 44 total`. No new unit spec files were added — out of this dispatch's assigned file list; nothing in the existing unit suite constructs `AccessControlFacade` directly, so the new third constructor parameter needed none. |
| `npm run build` | Clean, exit 0. |
| `npm run lint` | **12 errors, unchanged** — identical to the documented pre-existing baseline (`acm1r-fr-foundation.e2e-spec.ts:322`, `acm9-baseline.measurement-spec.ts:322`, `manifest.spec.ts` ×6, `manifest.ts:56`, `fixtures.ts` ×2). None in any file this increment touched. |
| `npx prisma validate` | `The schema at prisma/schema.prisma is valid 🚀` |
| `git diff --stat -- src/access-control/domain/audience.ts src/access-control/domain/services/audience-resolver.service.ts` | Empty, confirmed. |
| `git diff --stat -- src/access-control/domain/constants/section-access-matrix.ts` | Empty, confirmed — the synthetic `'fpo:synthetic-none-cell'` row exists only inside the two test files' own `jest.mock`, never in production code. |
| `git status --porcelain -- prisma/migrations/` | One new migration directory only: `prisma/migrations/20260907135054_story_4_2c_full_profile_grant/`. |
| `git grep -n "full_profile_grant\|full_profile_revoke" -- src/` | Hits in the enum declaration, this increment's own new code (`access-control-bootstrap.ts`), **and one PRE-EXISTING, unrelated hit**: `src/user-management/infrastructure/departure-worker.service.ts:411,417-420` (`revokeJournalRow`, Epic 5's departure worker) already writes an `access_journal` row with `kind: 'full_profile_revoke'` on employee departure — untouched by this increment, and the spec's own Code Map claim ("unused by any writer today," AF-5 row) is slightly imprecise here: that specific writer predates this increment and was never grepped for by the earlier spec pass. It writes a symbolic journal marker only — no `FullProfileGrant` row existed for it to reference before this migration, and it still creates no live `full_profile_grants` row today (it never touches that table). Recorded here as a correction, not a defect this increment caused or must fix. |

Use `git grep` or `grep -arn`/`grep -in` deliberately, never plain `grep -r`
— `spec-4-1d`'s and `spec-4-2a`'s Verification sections both record that a
NUL-carrying file in this tree is skipped as binary by plain `grep -r`.

### Genuine test-file defect (not touched, per this task's own exception clause)

`acm11-full-profile-overlay-resolution.e2e-spec.ts` wires its
`FullProfileAccessPort` test double via:

```ts
providers: [
  FullProfileOverlayService,
  { provide: FULL_PROFILE_ACCESS_PORT, useValue: holderDouble },
],
```

declared on the OUTER `Test.createTestingModule({ imports: [AppModule,
AccessControlModule], providers: [...] })` root, alongside importing
`AccessControlModule` (which — per this spec's own Code Map, correctly
implemented — binds `FULL_PROFILE_ACCESS_PORT` to
`PrismaFullProfileAccessAdapter` INSIDE ITS OWN provider array). Under
standard NestJS module encapsulation, this does **not** override
`AccessControlModule`'s own binding: `AccessControlFacade` lives inside
`AccessControlModule` and resolves its own constructor dependencies from
that module's own local scope (plus its own imports' exports), never from a
module that merely imports it. A provider redeclared only in an *outer*
`Test.createTestingModule` root is invisible to the inner module's own
dependency resolution — confirmed by reading NestJS's own
`TestingModuleBuilder` source (`node_modules/@nestjs/testing/testing-module.builder.js`):
the metadata object passed to `createTestingModule` becomes an ordinary
`@Module(metadata)` class (`RootTestModule`), with no override semantics of
its own; only `.overrideProvider(TOKEN).useValue(...)` performs a genuine
cross-module replace, via `this.container.replace(item, options)`. This spec
dispatch independently re-verified this three separate ways (a minimal
constructor-injection reproduction, a `ModuleRef.get(TOKEN, {strict:
false})` variant, and reading the Nest source itself) before concluding it
is a genuine defect rather than a production-code gap.

**Consequence:** the two assertions that require `isActiveHolder(rootId)` to
actually resolve `true` via the double (ACM11-FPO-03 Test 1, ACM11-FPO-04's
one test) see the REAL `PrismaFullProfileAccessAdapter` instead, which
correctly reports `false` for the test's freshly-created, never-granted
fixture "Root" — so both assertions observe `'none'` where they expect
`'read'`. The other two assertions in the same file (ACM11-FPO-03 Test 2,
ACM11-FPO-05 Test 3) pass regardless, because they don't depend on which
adapter answers. The sibling file, `acm11-full-profile-overlay-real-sections.e2e-spec.ts`,
is entirely unaffected (its four assertions hold under either adapter,
confirmed green above), and `acm11-full-profile-overlay-bootstrap.e2e-spec.ts`
does not use this override pattern at all.

The production code implements the design's own literal branch (`if (best
!== 'write') { const isHolder = await this.fullProfileOverlay.isHolder(viewerId);
if (isHolder) { best = 'read'; } }`) exactly as specified, and its
correctness against a REAL holder is independently provable: the bootstrap
suite (ACM11-FPO-01/02) proves the seeded row and `isActiveHolder`'s
underlying query both work end-to-end via the real adapter and a real seeded
row. Per this dispatch's own hard boundary ("the one exception is a genuine
defect in a test; then STOP and report rather than editing it"), the test
file was left untouched. Fixing it, when authorized, is a one-line change:
`.overrideProvider(FULL_PROFILE_ACCESS_PORT).useValue(holderDouble)` (and
dropping `FullProfileOverlayService`/the `useValue` entry from the plain
`providers` array) on the `TestingModuleBuilder` before `.compile()`.

**ACM-9 pin.** This increment touches `access-control-bootstrap.ts` (inside
`src/access-control/**`) and `access-control.facade.ts` (also inside that
path). The facade change is a new branch reached only when
`fullProfileOverlay.isHolder(...)` returns `true` — for every existing e2e
scenario in the repository, no seeded user other than root holds the
overlay, and root is not the viewer in the ACM-9 measurement's own fixture
(`seeded-two-level`, per `spec-4-2b`'s Design Notes — not yet run, story-level
open question). Whether root's own reads are part of that measurement's
query pattern needs checking at Stage 3, not assumed here; if root is ever
the measured viewer, the new branch adds one point lookup
(`isActiveHolder`) per resolved section, which is a real, small addition to
the measured shape and must be called out explicitly rather than waved
through as "comment-only" the way `spec-4-2b`'s optional comments were.

## Boundaries

What this increment deliberately leaves standing, and who takes it:

| Left in place / not built | Why | Owner |
|---|---|---|
| Grant/revoke HTTP surface, admin UI | Story's own text reserves this to the deferred lifecycle item | Deferred lifecycle increment, not started |
| Last-holder protection's revoke path, exercised | This increment only ever inserts the first row | Deferred lifecycle increment |
| "Only an existing holder may grant," exercised | No grant path exists to attach it to yet | Deferred lifecycle increment |
| Shared-link revocation backstop | Depends on the separately-deferred §4.8 shared-link overlay | Deferred lifecycle increment, own blocker |
| `GET /users/:id/access-journal`'s full-profile-overlay reader leg | Gated behind this same data-model item per `deferred-work.md`, but is itself HTTP surface, out of scope here | Deferred lifecycle increment |
| A `SECTION_ACCESS_MATRIX` row with a `'none'` cell | Unrelated section-coverage gap (S2/S3/etc.); adding one is not a §2.4 concern | Whichever future story lands those sections |
| AF-1 (Self-literal vs. merge-result reading) | Genuinely ambiguous source text; this spec builds against reading (2) but does not resolve the ambiguity itself | Architect (Winston) / PO ruling, blocking Stage 1 |
| AF-6 (no live section demonstrates the overlay end-to-end) | A new finding this spec surfaces, not present in the architect's solution design; changes what "observable" can mean for Stage 1's acceptance | Architect / PO ruling, blocking Stage 1 |
| AF-3 (lock-only vs. trigger for last-holder protection) | Real trade-off (first trigger in this schema vs. residual app-bug risk); not exercised by 4.2c either way | Architect / PO ruling, not blocking Stage 1 — needed before the lifecycle increment's own Stage 1 |
| The `acm1r-fr-foundation.e2e-spec.ts` pre-existing count-mismatch gap (3/4-key assertions against a 6-key canonical set) | Caused by 4.2a's own commit not touching this file, unrelated to 4.2c's subject | Follow-up fix, not this increment's to make (Never) |
| The story's own Sequencing text and `epic-4-context.md`'s references to "4.2b" for the §2.4 grant (superseded by the 2026-09-06 renumbering this spec's own frontmatter cites) | Reconciling story text is a PM/PO pass, not performed by writing a spec | PM/PO, follow-up edit — not performed here |
