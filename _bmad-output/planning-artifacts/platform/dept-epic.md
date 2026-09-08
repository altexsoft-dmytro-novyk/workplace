---
title: 'DEPT-EPIC — Deferred access-control backlog (opened from the 2026-09-07 review session)'
key: DEPT-EPIC
status: backlog
created: 2026-09-07
owner: 'Dmytro Novyk (PO / Architect)'
purpose: >-
  The single home for follow-up work surfaced during the 2026-09-07 review of the
  Access Control Authorization Consolidation PR (backend 37a3aa3). Nothing here is
  covered by that two-story epic. Sections: (A) the department-manager track and
  its dependents — the reason this epic is named DEPT; (B) open decisions needing
  a human ruling; (C) the code-review patch backlog; (D) documentation-alignment
  residue; (E) pre-existing deferred items tracked elsewhere, pointers only.
  Items move out of here as they are pulled into a numbered epic and run under AD-1.
---

# DEPT-EPIC — Deferred access-control backlog

## Context — "Epic 4 is done" is true for one small epic

`epics.md` carries a **numbering collision**: two "Epic 4" headings —
"Access Control Authorization Consolidation" (2 stories, done, backend `37a3aa3`)
and "Project-Line Audience" (4 stories, not started). `sprint-status.yaml:135`:
the status file "understates remaining platform scope by ~16 stories." The
access-control system is roughly one third built:

| Program epic | Owns | Status |
|---|---|---|
| Epic 4 — Project-Line Audience | project-line derivation, narrowness, revocation, read-only boundary | not started |
| **Epic 5** | **department-management contribution to reporting line**, PP HR-line | not started |
| Epic 6 | S2–S16 relationship-derived section columns | not started |
| Epic 7 | Shared-link column + §2.4 overlay evaluation | not started |

Section A below is the slice of Epic 5 that has a near-term dependent
(`profile:timeline` manual write). B–E are everything else the review turned up.

---

## A. Department-manager track

`§2.1 [NORMATIVE]` defines the reporting line as two relations: (1) "reports to"
— the `Relationship type='direct'` chain, resolved today; (2) "manages the
department" — you belong to a department managed by A, incl. nested. Relation 2
exists in neither the data nor the resolver. DEC-UM-001's "direct Unit Manager"
is relation 2 at one level.

**Schema groundwork already landed:** `AccessJournalKind.department_manager`,
`AccessJournal.subjectDepartmentId`, the `story_4_3_department_edge_journal_subject`
migration. `Department` has `parentId` but **no manager column**;
`RelationshipType` has no `department_manager`.

| # | Task | Depends on | State |
|---|---|---|---|
| DEPT-1 | Department-manager fact (`Department.managerUserId` FK, or temporal `DepartmentManager` table if history is queried) + write path — `org:relationships:write` on the dedicated screen, no self-assignment, journaled `kind: department_manager`, next-request effect, no cache. Plus one-level `isDirectDeptManager(viewer, target) = Department(activeMembership(target)).managerUserId === viewer` (two point lookups, no CTE). | — | backlog |
| DEPT-2 | `profile:timeline` `canAccessSection` + dual gate + DEC-UM-001 + `hr-admin` stopgap removal — see detail below | DEPT-1 | backlog |
| DEPT-3 | Full transitive department reporting-line audience — `reporting` becomes `(direct chain) ∪ (department-manager chain over the target's dept + ancestors via `Department.parentId`)`. Reconciles the DEPT-1 scalar fact with PM/AD-35's `Policies targetType='department'` AR-grant model. Epic 5 substrate; may bundle the `isHr`-bounded PP HR-line. | DEPT-1 | backlog |
| DEPT-4 | Test fallout from DEPT-2 — see detail below | DEPT-2 | backlog |

### DEPT-2 detail

**Not in the consolidation PR.** That increment ships `profile:timeline:write` on
`hr-admin` with the feature-only gate — the AF-2 deviation, recorded and accepted
(`s42a-op-06` stays live). DEPT-2 is what *closes* that deviation; it retires
`s42a-op-06` in place when it lands.

**Decision:** SCP `sprint-change-proposal-2026-09-04-section-access-consolidation.md`
§9.1; `project-requirements.md` §2.3 (*edit the career timeline*, confirmed
2026-09-07); `deferred-work.md`.

- **`SECTION_ACCESS_MATRIX`** — add
  `'profile:timeline': { self: 'read', reporting: 'write', pp: 'write' }`
  (project line + colleague omitted → `none`).
- **`DEFAULT_PERMISSIONS`** — add `'profile:timeline:write'`.
- **`access-control-bootstrap.ts`** — drop `profile:timeline:write` from
  `CANONICAL_PERMISSIONS` (6 → 5); rewrite the AF-2 comment.
- **`career-timeline-access-facade.adapter.ts`** —
  `canEditTimeline(v, t) = isAllowed(v, 'profile:timeline:write') AND
  canAccessSection(v, 'profile:timeline', t) === 'write' AND
  (isAssignedPP(v, t) OR isDirectDeptManager(v, t))`.
  `isAssignedPP` = direct `people_partner` row, not the HR-line seniors.
  `canReadTimeline(v, t) = canAccessSection(...) !== 'none'` — drop the interim
  audience set and the `isAllowed` "edit implies read" fallback.
- **Knock-on:** `profile:timeline` is the first matrix row with a reachable
  `'none'` cell, so it activates the §2.4 full-profile overlay for the first time
  (`acm11-fpo-03`). Expected.
- **Stage-1 open question:** DEC-UM-001 applied as an adapter narrowing predicate,
  not a matrix change — confirm the layering (access-control.md:196).

### DEPT-4 detail

- `test/access-control/acm1r-fr-foundation.e2e-spec.ts` — canonical-key count
  back to **5**. This also closes the review's ACM-1 drift-lock finding (the
  suite was left asserting `3` after 4.2a's 3→6 change; two suites currently
  assert mutually exclusive facts about the same entrypoint under one `test:e2e`).
- `acm11-fpo-06-non-holder-gets-no-overlay-effect-on-real-sections.md` — update
  the "real sections" set now that `profile:timeline` has a reachable `'none'`.
- `docs/test-cases/user-management/career-timeline/um-ct-09`, `um-ct-10` —
  revisit; a permission-holder without S9 write audience being denied is now the
  primary path.
- Retire `s42a-op-06` (pointer added 2026-09-07); author the replacement
  dual-gate scenario.

---

## B. Open decisions — RESOLVED (PO, Dmytro Novyk, 2026-09-08)

| # | Decision | Resolution |
|---|---|---|
| DEPT-B1 | The two consolidation stories were implemented ahead of their AD-1 approval gate (the review, run against `636ef8f`, saw `4-1`/`4-2` as `backlog`; SCP §6 says every code change is AD-1 gated with Stage-1 scenario approval). | **Retroactively accepted.** No retroactive Stage-1 scenario review; the shipped work stands. `sprint-status.yaml` already carries `4-1`/`4-2` and `epic-4` as `done` (updated post-review); the review's premise was stale. |
| DEPT-B2 | Changes shipped in the consolidation PR outside the SCP §5 impact map: (a) `jwt-session-resolver.adapter.ts` — a new per-request `user.findUnique`; a signature-valid JWT whose subject is deactivated now resolves `null`/401 (auth behaviour change, no test); (b) `user.repository.ts` list filters → `Prisma.QueryMode.insensitive` across seven identity columns; (c) `.env.example` commenting out `ALLOW_TEST_SESSION_TOKENS`; (d) `package.json` `db:up` gaining `--wait --wait-timeout 120`; (e) `import-population.ts` header rewrite. | **Kept — all stay in the consolidation PR.** Not split out. The `jwt-session-resolver` test gap and the `mode: 'insensitive'` `ILIKE`/index concerns remain in the DEPT-C patch backlog for follow-up. |
| DEPT-B3 | `full_profile_grants` FKs (`holderUserId`, `grantedByUserId`, `revokedByUserId`) are all `ON DELETE RESTRICT` — anyone who has ever held/granted/revoked a full-profile grant can never be hard-deleted from `users`; grant rows are never deleted (revoke only sets `revokedAt`). | **Kept as-is.** Internal system: user hard-delete is not a use case (there is no `prisma.user.delete()` path; removal is `isActive = false` + `EmploymentStatus: dismissed`). No GDPR erasure requirement. `ON DELETE RESTRICT` on an access-audit table is the intended behaviour. No note, no migration change. |

---

## C. Code-review patch backlog (2026-09)

Verified findings from the review, not yet actioned. Grouped; none is owned by
the department track, but they need a home. (If the team would rather triage
these under a dedicated review doc, lift section C out — it is self-contained.)

**Security-shaped**

- `SECTION_ACCESS_MATRIX` is a plain object literal — inherited keys
  (`SECTION_ACCESS_MATRIX['__proto__']` / `['constructor']` / `['toString']`) are
  truthy, bypass `if (!row) return 'none'`, fall through the merge loop, resolve
  `'none'`, and reach the overlay. Not route-reachable today (both call sites
  pass constants). Fix: `Object.hasOwn`, a null-prototype object, or a `Map`.
  `src/access-control/domain/constants/section-access-matrix.ts:13`
- `SectionAccessGuard` reads handler-level metadata only —
  `this.reflector.get(..., context.getHandler())` with no `getAllAndOverride` /
  `getClass()` fallback, so a class-level `@RequireSectionAccess` is silently
  ignored (a fail-open shape in a security guard). Also casts
  `request.params.id` unchecked — on a route with no `:id`, `undefined` is cast
  to `string` and passed to the port, producing an unexplained 403. Neither is
  reachable from today's two handler-level call sites.
  `src/user-management/application/guards/section-access.guard.ts:43-58`
- `mode: 'insensitive'` on `equals` may compile to `ILIKE` on Postgres, which
  treats `%` and `_` in the supplied value as wildcards (`?country=p_land` could
  match `Poland`) — verify against Prisma 7's emitted SQL; escape if it holds.
  Separately, insensitive mode disables index usage, including on `workEmail`
  (unique index, already lowercased on write).
  `src/user-management/infrastructure/user.repository.ts`

**Migration / schema**

- Two of the migration's three FKs are unindexed
  (`full_profile_grants_grantedByUserId_fkey`, `..._revokedByUserId_fkey`), both
  `ON DELETE RESTRICT` — every user delete sequentially scans a table that grows
  unbounded. Only `holderUserId` is indexed.
- No CHECK ties `revokedAt` and `revokedByUserId` together — the table permits
  one set with the other NULL, keeping a revoked-marked grant counted as current
  by the partial unique index and `isActiveHolder`. The `num_nonnulls` pairing
  idiom is already used by `story_4_3_department_edge_journal_subject`.
- `prisma/migrations/20260907135054_story_4_2c_full_profile_grant/migration.sql`

**Test coverage**

- The stale-JWT session check ships with no test that would notice it
  disappearing — a deactivated employee's already-issued JWT keeps
  authenticating for the rest of `SESSION_TTL_HOURS` (8h) and the regression
  would ship silently. Add: mint a token while active, deactivate, assert 401 on
  a protected route. `src/user-management/infrastructure/jwt-session-resolver.adapter.ts:86-96`
- The production `FullProfileAccessPort` implementation is never executed by any
  test — both `acm11` specs replace the token via
  `.overrideProvider(FULL_PROFILE_ACCESS_PORT)`, so the adapter's raw `EXISTS`
  SQL (its `u."isActive" = TRUE` join, its `revokedAt IS NULL` predicate) has no
  test that runs it. `src/access-control/infrastructure/prisma-full-profile-access.adapter.ts`
- `assertHolderCountAboveOneUnderLock`'s holder count disagrees with
  `isActiveHolder` — the floor counts `full_profile_grants WHERE "revokedAt" IS
  NULL` with no active filter, while `isActiveHolder` joins `users` and requires
  `isActive = TRUE`. The "at least one holder must remain" floor can be satisfied
  by a deactivated user who resolves `false` everywhere else. Also throws a bare
  `Error` rather than a domain/HTTP exception. Dead code (DI-unreachable) today —
  fix before a future increment wires it in with the bug intact.
  `src/access-control/infrastructure/prisma-full-profile-access.adapter.ts:38-58`

**Dev scripts**

- `dev-seed-org.ts` crashes if root is itself a department member — if root
  sorts first in a department's roster it becomes that department's lead and the
  script pushes `{ userId: root.id, reportsToUserId: root.id }`, violating
  `relationships_no_self_endpoint_check` and aborting the transaction. Nothing
  excludes `root.id` from `activeMembers` or lead selection.
- `dev-seed-org.ts` production guard is an exact match
  (`process.env.NODE_ENV === 'production'`) — misses `'Production'` and an unset
  value. Normalize case, treat unset as unsafe. `scripts/dev-seed-org.ts:50`
- `db:up` now blocks on every service's healthcheck
  (`docker compose up -d --wait --wait-timeout 120`), including localstack, whose
  healthcheck needs `LOCALSTACK_AUTH_TOKEN` (not committed) — a developer
  without the token gets a 120s hang and non-zero exit. Scope the `--wait` to
  `postgres` or document the new prerequisite. `package.json:23`

**Cleanup**

- The seeded journal row's idempotency key is non-deterministic — it derives
  from `grantId`, a fresh `uuidv7()` each run, so the `@unique` on
  `AccessJournal.idempotencyKey` can never fire and a retry cannot collapse.
  Derive from `root.id`, or make the grant id deterministic.
  `src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`
- Raw `$queryRawUnsafe` / `$executeRawUnsafe` in the bootstrap where typed
  `tx.fullProfileGrant.create(...)` / `tx.accessJournal.create(...)` exist (both
  real Prisma models added in the same diff) and would catch a column typo at
  compile time. `access-control-bootstrap.ts`
- `RANK` is re-allocated on every `resolveSectionAccess` call — it is a constant
  map, declared correctly at module scope one file over
  (`access-control-facade.adapter.ts`). Hoist it.
  `src/access-control/application/access-control.facade.ts`
- `users.controller.ts` carries a stale forward-reference comment ("the dead
  adapter branches ... are 4.1d's to remove") — this PR already removed them; no
  production reference to `user-management:edit` / `:read` remains. Drop the
  comment.
- list-filter conversion from spread to an explicit ten-field whitelist fails
  silently — an eleventh filter added to `ListUsersQueryDto` will validate,
  return 200, and be ignored, with no compile error and no test failure.
  `src/user-management/infrastructure/user.repository.ts`

---

## D. Documentation-alignment residue

- `fr-permission-matrix-draft-2026-09-02.md` — **untouched.** The file has UTF-8
  mojibake (`â`, `Â§`) that broke exact-match editing, so the
  `profile:timeline:write` "Confirm" markers in §6 item 4 and §5 still read as
  draft. The PO confirmation is authoritative in SCP §9.1 and
  `project-requirements.md` §2.3; this draft needs its encoding repaired and the
  markers cleared to match.
- `story-4-2-default-org-relationship-seed.md` scope item 3 text — **done
  2026-09-07:** correction marker added, pointing at the RENUMBERED table and
  SCP §9.2.
- D4 corpus (SCP §4.6): `docs/test-cases/**` still ships legacy `'S1'` /
  `'S10'` / `'S11'` section strings. SCP scopes the rename to "PLAT-E4-S4.1
  AD-1 Stage-1"; that pass has not run. Track the rename increment.

---

## E. Pre-existing deferred — tracked elsewhere, pointers only

- **§2.4 full-profile overlay lifecycle** — HTTP grant/revoke surface, admin UI,
  §3.2 column mapping + Self-precedence rule, shared-link revocation backstop.
  → `deferred-work.md` "Full-profile access overlay" (marked partially shipped
  2026-09-07 — data model + seed + resolver-read landed inert in 4.2c).
- **`full` audience / bypass** so a §2.4 holder reads every section, and the
  `GET /users/:id/access-journal` overlay-reader leg.
  → `deferred-work.md`.
- **S13 `profile:mentorship` `canAccessSection`** — same class as DEPT-2, could
  bundle. → `deferred-work.md`.
- **Prisma-schema drift** — the schema does not express the partial unique index
  or the CHECK constraints, so `migrate dev` regenerates DROP lines every future
  migration; three migrations have hand-edited around it. Needs a drift test or
  a `migrate diff --exit-code` CI check.
- **Triple `SectionAccess` union** — three independent copies (`SectionAccess`
  in the facade, `SectionAccessLevel` in AC domain constants,
  `SectionAccessLevel` in the UM port) with no compile-time link. The UM copy
  documents the AD-2 boundary reason; nothing detects divergence if a fourth
  level is added.
- **`journalIdempotencyKey` hand-copy** of `accessJournalIdempotencyKey` with
  closed-union types stripped to `string` — reasonable (one cross-context write),
  but nothing pins the two derivations together.

---

## Cross-references

- SCP §9.1 / §9.2 — `_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md`
- `_bmad-output/implementation-artifacts/access-control/deferred-work.md`
- `_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md` §5, §6.4
- `docs/architecture/access-control.md:196`, `:300` — DEC-UM-001
- `_bmad-output/planning-artifacts/platform/epics.md` — Epic 5, PM/AD-35, PM-FR-42
- `docs/project-requirements.md` §2.1 (reporting line = 2 relations), §2.3, §3.2 S9, §4.9
- 2026-09 backend code review (source of B, C, and parts of D)
