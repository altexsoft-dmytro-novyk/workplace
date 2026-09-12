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

`epics.md` used to carry a **numbering collision**: two "Epic 4" headings —
"Access Control Authorization Consolidation" (2 stories, done, backend `37a3aa3`)
and "Project-Line Audience" (4 stories, not started). **Resolved 2026-09-09:**
Project-Line Audience is now **Epic 8** (`PLAT-E4-S4.1`–`S4.4` → `PLAT-E8-S8.1`–`S8.4`);
Consolidation keeps Epic 4 and its `done` statuses. The same repair registered
Epics 5–8 and their 16 stories in `sprint-status.yaml` as `backlog`, so that
file no longer "understates remaining platform scope by ~16 stories" — but
registering them changed no status and closed no gate. The point of this section
is unchanged: the access-control system is roughly one third built.

| Program epic | Owns | Status |
|---|---|---|
| **Epic 5** | **department-management contribution to reporting line**, PP HR-line | not started |
| Epic 6 | S2–S16 relationship-derived section columns | not started |
| Epic 7 | Shared-link column + §2.4 overlay evaluation | not started |
| Epic 8 — Project-Line Audience *(was Epic 4)* | project-line derivation, narrowness, revocation, read-only boundary | not started |

> **DEPT ↔ Epic 5 — do not double-count (2026-09-09).** Epic 5's three stories
> (`5-1`…`5-3`) are now tracked in `platform/sprint-status.yaml` alongside
> `dept-1`…`dept-4`. They are **not** independent additional scope: per §30/§56
> below, DEPT is the department-management contribution to the reporting line —
> the same Epic 5 substrate — with DEPT-1/DEPT-3 overlapping stories `5-1` and
> `5-3`. Remaining platform scope is not 3 + 4, and no `done` may propagate
> between the two sets in either direction.

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

- **DONE 2026-09-08 — `test/access-control/acm1r-fr-foundation.e2e-spec.ts`.**
  Was asserting `3` (via a hardcoded `CANONICAL_KEYS`) after 4.2a grew the
  bootstrap set to `6`, shipping red with the failure relabeled a "pre-existing
  16-failure baseline" in `jest.setup-full-profile-grants-sentinel.ts`. Fixed by
  deriving `CANONICAL_KEYS` / `CANONICAL_COUNT` from the bootstrap's exported
  `CANONICAL_PERMISSIONS` (so it tracks 6→5 automatically when the timeline key
  leaves), parameterising every count assertion, and removing the false-baseline
  comment. **39/39 green.** Exact set membership stays owned by
  `s42a-op-bootstrap-canonical-set.e2e-spec.ts`; this suite now owns only the
  invariants (drift, locking, uniqueness, FK shape).
- **DONE 2026-09-08 — `jwt-session-resolver.adapter.spec.ts` (new).** Unit
  surface for `resolveJwtSubject` — the only staleness check the stateless
  session JWT has, previously untested (every e2e uses the persona shorthand;
  the one real-JWT e2e uses an active subject). 6 cases: active → resolves;
  deactivated → `null`; missing → `null`; tampered / wrong-secret → `null` with
  no DB call; departure cutoff still applies. **6/6 green.** Closes the DEPT-B2
  `jwt-session-resolver` test gap.
- Still open (rides DEPT-2):
  `acm11-fpo-06-non-holder-gets-no-overlay-effect-on-real-sections.md` "real
  sections" set once `profile:timeline` has a reachable `'none'`;
  `docs/test-cases/user-management/career-timeline/um-ct-09`, `um-ct-10` revisit;
  the replacement dual-gate scenario for `s42a-op-06`.

---

## A2. Epic 4 completion gaps (distinct from the DEPT-1..4 forward work above)

Surfaced by the workspace-wide review. These are the consolidation epic failing
its own criteria — not deferred scope.

| # | Gap | State |
|---|---|---|
| GAP-1 | **`acm1r-fr-foundation` shipped red** with the failure relabeled a "pre-existing baseline". | **CLOSED 2026-09-08** — see DEPT-4 detail. Suite green, count derived from source. |
| GAP-2 | **ACM-9 rerun.** The epic defines done as "an ACM-9 rerun covers the shape the change introduced" (500 targets, warm p95 + worst ≤ 2s, `seeded-two-level` fixture). Newest artifacts predate 4.2c/4.2d; the epic net-adds per-request queries (`isActiveUser` per `DEFAULT_PERMISSIONS` key in the evaluator; `resolveJwtSubject` `findUnique` every authenticated request). | **CLOSED 2026-09-12 — by inspection proof** (the second closure route above; verified against `services/backend` `d1ef680` + `a25ec28`). The per-request queries Epic 4 added do not scale with the number of targets. (a) `FunctionalRoleEvaluatorService.isAllowed` checks the key against `DEFAULT_PERMISSIONS` in memory. The set holds exactly one key, `profile:identity:write`. For that key it runs one primary-key `isActiveUser` lookup, then at most one grant-chain `EXISTS` query: ≤2 indexed queries per call. The section-gated routes call it at most once per request: `PATCH /users/:id` in the write gate, and `GET /users/:id` only in the `canEdit` hint; the read gate consults no feature key. (b) `JwtSessionResolverAdapter.resolveJwtSubject` runs one primary-key `findUnique` per authenticated JWT request. (c) ACM-9 times `facade.resolveAudiences(viewer, ids)` (`test/measurement/acm9/acm9-baseline.measurement-spec.ts:233`), which delegates straight to the audience resolver. None of `isAllowed`, `isActiveUser`, `resolveJwtSubject` or the full-profile `isHolder` check runs inside that 500-target walk. `canAccessSection` resolves a single target, and its overlay lookup runs once, only when `best === 'none'`. So the ACM9-MVP-v1 PASS evidence still covers the walk, and the added cost is O(1) per request. Unit evidence: `functional-role-evaluator.service.spec.ts`, `jwt-session-resolver.adapter.spec.ts`, `access-control-facade.adapter.spec.ts`, 31/31 green. The separate `seeded-two-level` measurement decision (Story 4.2 "Open for decision") is **not** closed by this proof. |
| GAP-3 | **Story 4.2's Recorded Decision + AC claim root gets write to every profile section** ("top of the `reports-to` tree → `reporting` audience over everyone, transitively") and `canEdit: true` for root on every card. On a clean prod install root resolves `colleague` to everyone → `403` on every `PATCH`, and even its own card is `self: 'read'`. | **CLOSED 2026-09-08 (PO) — doc correction, no code change.** The shipped behaviour matches the SoT: `root` appears nowhere in `project-requirements.md`; the PRD (FR-1) defines it as *first `User` + `hr-admin`*; §2.2 [NORMATIVE] gives a functional role no data access; §2.4's "sees every section" audience is a **read** overlay. Root = operator features + full-profile read, **no section write**. Corrected in place, four files: `story-4-2` Recorded Decision table (write row struck), its user story ("administer **and edit**" → administer), and its AC (split into the dev-spine case, which excludes root's own `self: 'read'` card, and the production case, where `403` everywhere is expected); SCP §9.2 extended; `epics.md` Epic 4 restatement. |

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

- ~~`SECTION_ACCESS_MATRIX` is a plain object literal — inherited keys
  (`['__proto__']` / `['constructor']` / `['toString']`) are truthy, bypass
  `if (!row) return 'none'`, and reach the overlay.~~ **FIXED 2026-09-08** —
  `resolveSectionAccess` now guards the lookup with `Object.hasOwn`, so an
  unknown section key fails closed. `access-control.facade.ts`
- ~~`SECTION_ACCESS_RANK[resolved] < SECTION_ACCESS_RANK[level]` fails open on an
  unknown level (`undefined < n` → `false` → the deny is skipped → gate
  passes).~~ **FIXED 2026-09-08** — `?? -1` / `?? Infinity`, fails closed.
  `src/user-management/infrastructure/access-control-facade.adapter.ts`
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
- ~~`RANK` is re-allocated on every `resolveSectionAccess` call.~~ **FIXED
  2026-09-08** — hoisted to module scope.
  `src/access-control/application/access-control.facade.ts`
- `users.controller.ts` carries a stale forward-reference comment ("the dead
  adapter branches ... are 4.1d's to remove") — this PR already removed them; no
  production reference to `user-management:edit` / `:read` remains. Drop the
  comment.
- list-filter conversion from spread to an explicit ten-field whitelist fails
  silently — an eleventh filter added to `ListUsersQueryDto` will validate,
  return 200, and be ignored, with no compile error and no test failure.
  `src/user-management/infrastructure/user.repository.ts`

**Added from the workspace-wide review (2026-09-08)**

- **`section-keys.ts` — no shared type across the AC↔UM boundary.**
  `src/user-management/domain/constants/section-keys.ts` declares
  `'profile:identity'` as a bare literal; Access Control independently declares
  the same literal as a matrix key. Rename or mistype either side and it
  compiles cleanly, then silently 403s every gated route. Fix: AC owns the
  section-key union; UM imports it, never redeclares — plus a startup assertion
  that every declared key has a matrix row.
- The migration's two raw-SQL constraints (`no-self-grant` CHECK, partial unique
  index) have **no `pg_constraint` probe test** — the repo's established pattern
  (`ACM1R-FB-11`) is what keeps hand-edited migrations safe across later
  migrations. `prisma/migrations/20260907135054_story_4_2c_full_profile_grant/`
- `S<n>` still reaches the gate as a section argument in two deliberate
  "retired-identifier" test assertions — but the D4 AC is an unconditional
  grep-clean rule over `src/` and `test/`. Use an obviously bogus key instead.
  `test/access-control/acm5-section-access.e2e-spec.ts`,
  `src/user-management/infrastructure/__tests__/access-control-facade.adapter.spec.ts`
- Permission key derived by string concatenation (`<section>:write`) with no
  validation or diagnostic — a section not following the convention produces a
  key nobody holds and denies silently.
  `src/user-management/infrastructure/access-control-facade.adapter.ts`
- Stale comments / wrong line citations: `schema.prisma:101` cited for
  `AccessJournal.actorUserId NOT NULL` (line 101 is an enum member);
  `prisma/seed.ts:149` cited for a comment at ~136; the bootstrap call site
  still calls the overlay seed a "lock-within-the-lock" after the adjacent
  CORRECTED note records the `FOR UPDATE` was removed.

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
