---
title: 'PLAT-E4-S4.2d — Dev seed spine: db:dev:seed-org, retiring dev-grant-root.ts'
type: 'feature'
created: '2026-09-07'
status: 'done'
review_loop_iteration: 0
baseline_commit: '8ec35fd' # services/backend HEAD, branch dn-section-access, working tree clean
story: '{project-root}/_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md'
scope_items: >-
  Story 4.2 scope item 5 ONLY, per the story's Sequencing table as renumbered
  2026-09-06 (4.2a/b/c/d are the authoritative letters superseding every older
  lettering, including spec-4-2b's own "4.2c" for this same content). Builds
  `db:dev:seed-org`, retires `scripts/dev-grant-root.ts`, and repoints
  `create:root` per 4.2a's own Ask-First AF-5 deferral. Scope item 1 is carried
  ONLY as a re-run of its already-closed verification grep (an entry check, not
  work — the story's own Sequencing table says so verbatim). Scope items 2
  (root-operator permission set) and 3-tree-root-half (tree-root edge) are
  closed by 4.2a and 4.2b respectively and are untouched here. Scope item 4
  (upward-walk resolver) needs no letter and is untouched; its residual ACM-9
  `seeded-two-level` evidence question is carried forward as Ask First, not
  resolved here. **4.2c (the §2.4 full-profile-access first-holder grant) is
  separately blocked on an architect data-model decision and is NOT a
  dependency of this increment** — nothing in scope item 5 needs the §2.4
  overlay to exist.
context:
  - '{project-root}/_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/spec-4-2a-root-operator-permission-set.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/spec-4-2b-tree-root-seed.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/epic-4-context.md'
  - '{project-root}/docs/architecture/access-control.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

> **CORRECTED 2026-09-07 (Dmytro Novyk, PO, after a Stage-3 code review) —
> `create:root` does NOT get `db:dev:seed-org` appended.** Every reference
> below (and in the Code Map, Tasks, I/O Matrix, and Verification sections)
> to `create:root` being repointed to `"npm run db:seed && npm run
> db:bootstrap:access-control && npm run db:dev:seed-org"` is superseded. The
> correct, shipped value is `"npm run db:seed && npm run
> db:bootstrap:access-control"` — unchanged from what `create:root` did for
> root-creation and root-permission purposes before this increment.
> `db:dev:seed-org` reads `DepartmentMembership` rows that only
> `db:import:population` creates; neither `create:root` nor its predecessor
> ever ran the importer, so a `db:dev:seed-org` step bundled into
> `create:root` always ran against zero memberships — no error, just a
> silent `"nothing to seed"` log, meaning this increment's whole point (the
> org spine) never actually fired in the real `create:root` → sign in →
> import workflow. `db:dev:seed-org` remains fully built and tested; it is a
> standalone script now, run by hand any time after import. This is the one
> renegotiation to this document's frozen intent; everything else stands.

## Intent

**Problem — three things share one increment because they are coupled by the
same file's retirement.**

1. **No dev-only reporting spine exists.** `scripts/dev-grant-root.ts` grants
   permissions only — read in full (`dev-grant-root.ts:1-173`), it never
   touches the `Relationship` model (confirmed independently by
   `spec-4-2b-tree-root-seed.md`'s Code Map: `grep -in "relationship"` over the
   whole file returns **zero matches**). A developer today has no way to make
   root sit at the top of a real `reports-to` tree over a seeded/imported
   population short of manually wiring every edge through
   `POST /users/:id/relationships`. The story's Recorded Decision ("top of the
   `reports-to` relationship tree → `reporting` audience over everyone,
   transitively") has no dev-environment shortcut.
2. **The accepted stopgap must retire.** The story's own 2026-09-04 decision
   (quoted in scope item 5) calls `dev-grant-root.ts` an *"accepted dev +
   production stopgap"* whose `NODE_ENV=production` guard was deliberately
   reverted, with named known debt: it grants a wider, pre-`directory:*` key
   bundle and fails the ACM-1 drift-check e2e if run against that suite's DB.
   4.2a already closed the *production* half of the gap it was covering (the
   canonical `hr-admin` set grew from three keys to six —
   `access-control-bootstrap.ts:22-70`). What is left for this stopgap to do,
   verified below, is effectively nothing a clean production bootstrap doesn't
   already do — except grant one now-inert key. The story explicitly names
   this file's retirement as scope item 5's job ("superseding `dev-grant-root.ts`").
3. **`create:root`'s repoint was deliberately deferred here.** `spec-4-2a`'s
   Ask First **AF-5** (resolved ruling, `spec-4-2a-root-operator-permission-set.md`
   line 154): *"Leave `create:root` pointing at `dev-grant-root`. Repointing is
   coupled to retiring that script, which is the last 4.2 increment. Conscious
   deferral, recorded in Boundaries."* This is that increment.

**Approach.** Build `scripts/dev-seed-org.ts` (`npm run db:dev:seed-org`): a
dev-only, bare-`PrismaClient` script — the same idiom as `dev-grant-root.ts`,
`bootstrap-access-control.ts` and `import-population.ts`, no Nest boot — that
seeds a `type='direct'` reporting spine over the active population, two levels
deep: one synthesized lead per department reports to root, every other active
member of that department reports to their lead. Delete
`scripts/dev-grant-root.ts` and its `db:dev:grant-root` npm script entirely.
Repoint `create:root` to the production chain plus the new dev script:
`db:seed && db:bootstrap:access-control && db:dev:seed-org` (verified against
each script's actual behaviour in Code Map, not assumed).

**Why this is a real red-then-green Stage 2, unlike 4.2b.** `4.2b` found there
was no `Relationship` row to write and closed by proving an already-true
negative. This increment writes a new script and a new npm alias that do not
exist today, and deletes a file that does. Every discriminating assertion in
Stage 2 — the spine shape, the `NODE_ENV=production` throw, the retirement of
`dev-grant-root.ts`, the repointed `create:root` — is false against HEAD
`8ec35fd` and can only become true by Stage-3 code. There is no "already
correct, lock it" framing available here, and none is claimed.

## Boundaries & Constraints

**Always:**

- **Two-level shape only, rooted at root:** one synthesized lead per
  department gets a `direct` edge to root; every other active member of that
  department gets a `direct` edge to their department's lead. No three-level
  chains, no cross-department edges, no edge that does not terminate at root
  within two hops.
- **Root is never a subject.** No `Relationship` row may ever have
  `userId = root.id` — root is the fixed terminus every chain resolves to, per
  `spec-4-2b`'s own Never rule ("Never write a `Relationship` row for root"),
  which this increment inherits by construction rather than re-derives.
- **Only active (`User.isActive: true`) users receive an edge.** A department
  with zero active members is skipped entirely — no lead is synthesized for
  it, no error is raised.
- **The lead-synthesis rule is deterministic and precisely stated** (Design
  Notes): the department's active members ordered ascending by `User.id`
  (`uuidv7`, time-ordered); the first is the lead. No `PositionName`
  pattern-match is implemented — see Design Notes for why real data does not
  support one.
- **Idempotent, additive-only.** A rerun over an already-seeded org creates
  edges only for a user (lead or member) who does not yet hold a `direct`
  `Relationship` row of any kind. An existing edge — whether written by an
  earlier run of this script or by a real admin action through
  `POST /users/:id/relationships` — is never overwritten, moved, or deleted.
  This matches this repo's established bootstrap idiom: `dev-grant-root.ts`'s
  own docstring ("Idempotent: every row is reused when present",
  `dev-grant-root.ts:27`) and `ensureGrants`'s comment in
  `access-control-bootstrap.ts:266` ("Ensures the six canonical pairs are
  PRESENT — not that they are the only ones").
- **Throws under `NODE_ENV=production`, before any database connection is
  opened.** The guard is the first statement `main()` executes — no
  `DATABASE_URL`/`PrismaClient` construction happens first. This is the
  opposite of `dev-grant-root.ts`'s current state, whose guard was
  deliberately reverted (story scope item 5, "Interim" note) and is being
  retired along with the file, not carried forward.
- **Direct, transactional Prisma writes — the same idiom `dev-grant-root.ts`
  and `access-control-bootstrap.ts` already use** for their own tables, not
  the HTTP action layer. See Design Notes and Ask First **AF-3** for why.
- **Absent from `prisma/seed.ts` and `bootstrap-access-control.ts`.** Nothing
  in either file may import, call, or duplicate this script's logic — the
  story's own acceptance criterion for scope item 5 names this explicitly.
- **`scripts/dev-grant-root.ts` is deleted in full, including its
  `db:dev:grant-root` npm script entry.** No shim, no deprecation warning
  left behind — the story calls this file the thing scope item 5
  "supersedes," not something to keep dual-running.
- **`create:root` is repointed to `db:seed && db:bootstrap:access-control &&
  db:dev:seed-org`** — verified against each script's real behaviour in Code
  Map (not the story's own "presumably" language taken on faith).
- Follow this project's AD-1 discipline: scenario docs, then a real
  red-then-green e2e, then implementation, human approval between every
  stage, no dispatch spanning two.
- **E2E preconditions are real requests, never hardcoded ids** — a population
  to seed the spine over is produced by the real `db:import:population`
  entrypoint (or, for a suite that needs a specific multi-department shape
  the delivered CSV cannot produce — see Code Map — a temporary CSV written
  and imported through that same real entrypoint), never a raw
  `prisma.user.createMany` bypassing it.
- Use `git grep` or `grep -arn`/`grep -in`, never plain `grep -r`, for every
  verification grep in this spec and its scenario docs — `spec-4-1d` and
  `spec-4-2a`'s Verification sections both record that a NUL-carrying file in
  this tree is skipped as binary by plain `grep -r`.

**Ask First — RESOLVED 2026-09-07 on the PO's "finish epic 4" instruction. All
eight accepted as recommended below; execute the task list against them.**

| # | Ruling |
|---|---|
| AF-1 | New folder `dev-seed-spine/`, prefix `s42d-ds-*`, HTTP scenario in `access-control-adoption/` — accepted as recommended. |
| AF-2 | Leave the orphaned `user-management:edit` key alone on old dev DBs; do not carry it forward, do not write cleanup — accepted as recommended. |
| AF-3 | Direct Prisma writes for the spine, no `AccessJournal` row for seeded edges — accepted as recommended. **SUPERSEDED 2026-09-12 (Anna Pikula, PO + Architect): the no-journal half is DECLINED.** §2.1/§3.4 and PM/AD-29 have no development-fixture exception. The script keeps direct Prisma writes, but each seeded edge now gets exactly one `kind: 'manager'` `AccessJournal` row in the same transaction, in `assignManager`'s shape with root as the actor. Scenario `docs/test-cases/access-control-kernel/dev-seed-spine/s42d-ds-07-seeded-edges-are-journaled.md`; backend branch `feat/plat-e4-dev-seed-journal`. |
| AF-4 | No auto-repair when a synthesized lead deactivates; documented limitation, not a defect — accepted as recommended. |
| AF-5 | Tie-break on lexicographically smallest `departmentId` for concurrent memberships — accepted as recommended. |
| AF-6 | ACM-9 `seeded-two-level` measurement NOT folded in here; flagged for the PO to revisit the story-level open question now that real data exists to measure — accepted as recommended. |
| AF-7 | Do not fix `acm1r-fr-foundation.e2e-spec.ts`'s stale cardinality literals in this dispatch — that is 4.2a's own tracked follow-up — accepted as recommended. |
| AF-8 | The story's "stays green" acceptance criterion reads as "adds no new failure" against the pre-existing 16/39 cardinality drift, not "achieves full green" — accepted as recommended. |

**Original Ask First table, retained as the record:**

| # | Question | Recommendation |
|---|---|---|
| **AF-1** | **Where do the new scenario docs live, and under what id prefix?** No existing folder fits: `fr-bootstrap/` is Permissions/Policies-shaped; `tree-root-seed/` is scoped to 4.2b's negative/positive proofs over a hand-wired two-employee chain, not a script that seeds an arbitrary population. | New sibling folder `docs/test-cases/access-control-kernel/dev-seed-spine/` for the DB-level, subprocess-only scenarios (script existence, shape, idempotence, `NODE_ENV` guard, retirement); continue `docs/test-cases/user-management/access-control-adoption/` for the one HTTP-level scenario (root's audience resolution over the seeded population), per the `s42a-op-*`/`s42b-tr-*` precedent of splitting by harness cost. Id prefix `s42d-ds-*` (`ds` = dev seed). |
| **AF-2** | **What happens to the one permission key `dev-grant-root.ts` grants that the canonical six do not — `user-management:edit`?** Verified inert: no gate in `src/` consults it after 4.1c/4.1d (story scope item 1's own verification table, zero executable hits). Any pre-existing dev database that already ran `dev-grant-root.ts` carries a `Permissions`/`PolicyPermissions` row for it forever — `bootstrap-access-control.ts` never prunes rows outside the canonical set (`ensurePermissions`/`ensureGrants` restore, never remove — Code Map). | **Leave it.** Do not carry the key forward into `db:dev:seed-org` or the canonical set, and write no cleanup/migration to remove the orphaned row from databases that already have it. It is dead weight, not a live grant (nothing reads it), and pruning administrator-writable state on a rerun is exactly the failure mode `access-control-bootstrap.ts`'s own header comment warns against ("A rerun that pruned back to the canonical set would revoke approved access on every deployment") even though this particular row happens to be harmless. |
| **AF-3** | **Should the script write `Relationship` rows directly via Prisma (bypassing `AssignManagerAction`/`OrgRelationshipService`), or reuse the real write path the way `import-population.ts` reuses `PopulationImportService`?** Reusing the real path would also produce `AccessJournal` audit rows (`org-relationship.repository.ts:83-90`, `assignManager`) and the departure guard (`assign-manager.action.ts:45-47`, `DepartureService.hasNonAppliedDeparture`). But `OrgRelationshipService`'s dependency, `DepartureService`, itself requires `DEPARTURE_REPOSITORY_PORT`, `BUSINESS_TIME_ZONE` and `DEPARTURE_EXECUTOR_PORT` (`departure.service.ts:60-66`) — real wiring cost for a guard that can never fire here (a freshly imported population has no `Departure` row; `import-population.ts`'s writer creates `User`/`DepartmentMembership`/`EmploymentStatus`/`UserEvent` only, never `Departure`). | **Direct Prisma writes**, matching `dev-grant-root.ts`'s and `access-control-bootstrap.ts`'s own idiom for their tables — respect the schema constraints by construction (`relationships_shape_check`, `relationships_no_self_endpoint_check`, `relationships_one_direct_per_user`) rather than by wiring the full action stack. Accept, explicitly, that seeded spine edges carry no `AccessJournal` audit row — this is fake dev data, not an administrator action, and no suite reads the journal expecting one for these edges. |
| **AF-4** | **A department's synthesized lead is later deactivated — does a rerun repair the department?** No. The idempotence rule ("skip whoever already has a `direct` row") means the department's *other* members keep reporting to the now-inactive former lead; nothing promotes a new lead automatically, because the new candidate (the next-lowest-id active member) already has an edge to the old lead and is therefore skipped too. | **Accept as documented behaviour, not a defect to fix here.** A real HR Admin can always re-point an individual edge through the ordinary `POST /users/:id/relationships` route; this script's job is bootstrapping a plausible dev shape once, not maintaining it. |
| **AF-5** | **A user holds more than one concurrent `DepartmentMembership`** (schema-legal — `department_membership`'s unique constraint is `(userId, departmentId)` **WHERE `validTo` IS NULL**, not `(userId)` alone — `prisma/schema.prisma:187`) — which department does the script use for that user? Not producible by today's delivered `docs/Accounts_template.csv` (one row per user, one membership created on import — `population-import.repository.ts:96-104`), but reachable if an admin later runs a "plain add" through `add-department-membership.action.ts`. | **Deterministic tie-break: the membership with the lexicographically smallest `departmentId`.** The user is treated as belonging to only that department for spine purposes; `relationships_one_direct_per_user` only allows one manager edge per person regardless, so no shape decision is lost by picking one. |
| **AF-6** | **Does the ACM-9 `seeded-two-level` measurement belong to this increment?** The story's "Open for decision" section and both `spec-4-2a`/`spec-4-2b` leave this unresolved; `spec-4-2b`'s own Boundaries table names scope item 5 (there still lettered "4.2c") as *"the real future producer of a `seeded-two-level` shape in a dev/demo DB"* — this is the first increment where that shape actually exists to measure. | **Not folded in as a Tasks & Acceptance requirement here** — widening this spec's frozen Intent to include a published ACM-9 artifact needs the same explicit renegotiation `spec-4-2b`'s AF-4 declined to make unilaterally. Flagging prominently because, after this increment, the premise the story's open question turns on ("does 4.2a still exist / fold into 4.2b") finally has real data to run against — recommend the PO revisit that story-level question now, not fold it into this spec by default. |
| **AF-7** | **Should this dispatch also fix `acm1r-fr-foundation.e2e-spec.ts`'s stale three-key cardinality literals** (16 pre-existing failures at HEAD `8ec35fd` — `CANONICAL_KEYS` at `:47-51`, `toHaveLength(3)` at `:386`, full inventory in `spec-4-2a`'s own Stage-3 outcome table) **while it's "the last 4.2 increment" anyway?** | **No.** That amendment is `spec-4-2a`'s own explicitly named, separately tracked follow-up (`spec-4-2a-root-operator-permission-set.md` Tasks, "DEFERRED, not done here"), not one of story 4.2's five scope items. Pulling it into this dispatch violates the one-scope-item-per-AD-1-dispatch discipline this same story is trying to close out cleanly. |
| **AF-8** | **The story's own acceptance criterion for scope item 5 says the ACM-1 drift-check suite "stays green" — but it is independently red today** (16 of 39 tests fail, all pure cardinality, `spec-4-2a`'s own recorded Stage-3 outcome, unrelated to `dev-grant-root.ts` or this increment's script). Which reading governs: "achieves full green" or "adds no new failure"? | **"Adds no new failure."** `db:dev:seed-org` never touches the five bootstrap-owned tables that suite's assertions inspect (`Permissions`, `Policies`, `PolicyPermissions`, `UserPolicies`, `AccessControlBootstrap` — `acm1r-fr-foundation.e2e-spec.ts`'s own `resetBootstrapState()` list) — it only reads `User`/`DepartmentMembership` and writes `Relationship`. Achieving full green requires editing that suite's literals, which is AF-7's separately tracked follow-up, not this increment's. Retiring `dev-grant-root.ts` does remove its own distinct, narrower known-debt clause in full (Design Notes) — that clause and the suite's pre-existing cardinality drift are two different facts and must not be conflated. |

**Never:**

- **Never write a `Relationship` row for root**, in this script or anywhere
  else this increment touches — inherited from `spec-4-2b`'s Never list, not
  re-derived, re-litigated, or weakened here.
- **Never touch `prisma-relationship-graph.adapter.ts`, `audience-resolver.service.ts`,
  or any file under `src/access-control/**`.** This increment's script lives
  entirely in `scripts/` and reads only the generated Prisma client — nothing
  it does invalidates the pinned ACM-9 baseline under `epic-4-context.md:24`'s
  rule ("any change under `services/backend/src/access-control/**`
  invalidates the pinned ACM-9 baseline"), because no such file changes.
- **Never carry `user-management:edit` (or any other non-canonical key)
  forward** into `db:dev:seed-org`, the canonical set, or any new grant. See
  Ask First AF-2.
- **Never add a three-level chain, a department-tree branch
  (`targetType:'department'` + `Department.parentId`), or a project-line
  edge.** The story's own Out section is explicit — quoted verbatim in
  Boundaries below.
- **Never repair, migrate, or backfill an existing dev database's
  `dev-grant-root.ts`-granted rows.** Retirement means the script stops
  existing and stops running; it does not mean reconciling what a past run of
  it already wrote (Ask First AF-2's `user-management:edit` residue is the
  concrete instance of this rule).
- **Never fold the ACM-9 `seeded-two-level` measurement into this spec's Tasks
  & Acceptance** without an explicit PO renegotiation of frozen Intent — see
  Ask First AF-6.
- **Never edit `acm1r-fr-foundation.e2e-spec.ts`'s pre-existing cardinality
  assertions** as part of this dispatch — see Ask First AF-7.
- **Never modify the story file, `epic-4-context.md`, `spec-4-2a`, `spec-4-2b`,
  or any file under `docs/architecture/`** as part of this spec's own
  authorship — this document is the only artifact this dispatch produces.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| `NODE_ENV=production` | `npm run db:dev:seed-org` with `NODE_ENV=production` | Throws immediately, before any Prisma client is constructed or any `DATABASE_URL` connection is attempted; nonzero exit | `process.exitCode = 1`, diagnostic names the refusal reason |
| Fresh DB, no population imported | `create:root`'s new chain (`db:seed && db:bootstrap:access-control && db:dev:seed-org`) on an empty DB | Root exists (from `db:seed`), zero other active `User` rows. Script finds zero departments with active members, creates **zero** `Relationship` rows, exits `0` with a clear "nothing to seed" log line — **not an error** | N/A |
| Population imported, multiple departments | Root provisioned by the production bootstrap; `POST /users/import`-equivalent has created N departments, each with ≥1 active member | Exactly one `direct` edge per department lead → root, and one `direct` edge per other active department member → their lead. Root's own `direct`/`people_partner` row count stays `0` | N/A |
| A department with zero active members (all dismissed / `isActive: false`) | Department exists via `DepartmentMembership`, but every member's current `User.isActive` is `false` | Department is skipped entirely — no lead synthesized, no edge created, no error | N/A |
| Rerun over an already-seeded org | `db:dev:seed-org` run a second time, no new imports since | Zero new `Relationship` rows — every candidate lead/member already holds a `direct` row from the first run. Exits `0` | N/A |
| Rerun after a new population-import batch | A prior run seeded departments A/B; a fresh `db:import:population` adds department C (and new active members to A) | New edges created only for C's lead/members and for A's newly-added active members with no existing `direct` row; B and A's original members are untouched | N/A |
| A user holds two concurrent `DepartmentMembership` rows | Schema-legal, not producible by today's delivered CSV (Ask First AF-5) | The membership with the lexicographically smallest `departmentId` decides which department's active-member list the user appears in | N/A |
| `ROOT_WORK_EMAIL` unset or blank | `npm run db:dev:seed-org` with no `ROOT_WORK_EMAIL` | Throws with a diagnostic naming the missing var, same idiom as `dev-grant-root.ts:83-88` / `access-control-bootstrap.ts:299-305` | `process.exitCode = 1` |
| Root not found, or ambiguous | Normalized `ROOT_WORK_EMAIL` matches zero or >1 `User` rows | Throws with a diagnostic naming the count, same idiom as `dev-grant-root.ts:104-111` | `process.exitCode = 1` |
| `dev-grant-root.ts` invoked after retirement | `npm run db:dev:grant-root` | `npm error Missing script: "db:dev:grant-root"` — the script and its npm alias no longer exist | Nonzero npm exit, not this script's own diagnostic |
| Root reads any seeded member's identity card | `GET /users/:id` for any user this script gave an edge to (directly or transitively) | `200`, `canEdit: true` — `reporting` resolves `write` on `profile:identity` through the unmodified upward-walk CTE, exactly as the story's own scope-item-5 acceptance criterion states | N/A |

</frozen-after-approval>

## Code Map

Every line below was read at `services/backend` HEAD `8ec35fd` on 2026-09-07,
working tree clean.

### `scripts/dev-grant-root.ts` — read in full, what it actually does

- `dev-grant-root.ts:1-27` — header. Line 6: *"Usable in dev AND as a
  production deploy stopgap (no `NODE_ENV` guard — decision, Dmytro
  2026-09-04)."* Lines 8-14: *"SUPERSEDED BY Platform Epic 4 Story 4.2 ...
  Delete this file when 4.2 lands."*
- `dev-grant-root.ts:48-77` `ROOT_PERMISSIONS` — **seven** `{key, description}`
  entries: `user-management:create`, `user-management:edit`,
  `user-management:list`, `user-management:deactivate`,
  `org:relationships:write`, `employee:departure:record`,
  `profile:timeline:write`.
- `dev-grant-root.ts:82-117` `main()` root resolution — reads
  `ROOT_WORK_EMAIL`/`DATABASE_URL` from `process.env` directly (no
  `ConfigService`, no Nest boot), finds the one normalized, active `User`
  match, throws otherwise.
- `dev-grant-root.ts:119-164` — the one write: inside a `$transaction`, ensure
  each `Permission` row (find-or-create), ensure one FR `Policy`
  (`targetRole: 'hr-admin'`, `operator: '=='`, no target, `managedBy: 'admin'`,
  find-or-create), `PolicyPermission.createMany({skipDuplicates: true})`, then
  `UserPolicy.upsert` the attachment.
- **`grep -in "relationship" dev-grant-root.ts` → zero matches.** This file
  never creates a `Relationship` row, department edge, or anything resembling
  a reporting spine — confirmed by my own full read and independently by
  `spec-4-2b-tree-root-seed.md`'s Code Map (`scripts/dev-grant-root.ts:1-173 —
  read in full ... zero matches`). **Everything this file does is a
  permission grant.** Story 4.2's Recorded Decision text describing what
  `dev-grant-root.ts` was standing in for ("wire managers/PPs," header
  comment line 4) was never actually implemented by it — the header's own
  aspiration outran the code.

### Compared against the canonical six — the one real gap

- `access-control-bootstrap.ts:22-70` `CANONICAL_PERMISSIONS` (post-4.2a) —
  **six** keys: `user-management:create` (:24), `user-management:deactivate`
  (:28), `user-management:list` (:32), `org:relationships:write` (:43),
  `employee:departure:record` (:47), `profile:timeline:write` (:67).
- Set difference: `dev-grant-root.ts`'s seven keys minus the canonical six
  leaves exactly **one** — `user-management:edit`. Every other key
  `dev-grant-root.ts` grants, a clean `db:seed && db:bootstrap:access-control`
  already grants.
- `user-management:edit` is **confirmed inert**, not merely unused: the
  story's own scope-item-1 verification table (`story-4-2-default-org-relationship-seed.md:124-130`)
  measured **zero executable hits** for `user-management:edit` in `src/` as of
  2026-09-06 — the only hits are prose/test-title assertions that the key is
  *not* consulted. `dev-grant-root.ts`'s own comment block (`:39-47`) confirms
  the same fact from the granting side: *"AS OF PLAT-E4-S4.1c IT NO LONGER
  GRANTS ANYTHING."*
- `spec-4-2a-root-operator-permission-set.md:241` independently states the
  identical finding from the other direction, dated 2026-09-06: *"three of its
  seven keys coincide with canonical today; after this change six of them do,
  and only `user-management:edit` (inert since 4.1c) stays outside."*
- **Conclusion: `dev-grant-root.ts` has no remaining job a clean production
  bootstrap does not already do.** Its one non-overlapping key is dead. There
  is no relationship-seeding, department-wiring, or PP-wiring capability in
  this file to preserve, migrate, or fold into the new script — the new
  script's entire reporting-spine capability is new work, not a port of
  existing logic.

### `bootstrap-access-control.ts` — the idempotence idiom to match

- `access-control-bootstrap.ts:243-264` `ensurePermissions` — restores missing
  canonical keys; **never rewrites an id or a description** for one that
  already exists.
- `access-control-bootstrap.ts:266-281` `ensureGrants` — comment: *"Ensures the
  six canonical pairs are PRESENT — not that they are the only ones."* Uses
  `ON CONFLICT ... DO NOTHING`.
- `access-control-bootstrap.ts:7-13` header — ownership is *"a SET OF SPECIFIC
  ROWS, not the contents of these tables ... A rerun that pruned back to the
  canonical set would revoke approved access on every deployment."* This is
  the "additive-only, never prune" principle `db:dev:seed-org`'s own
  idempotence rule (Boundaries, Always) directly copies for `Relationship`
  rows.
- `dev-grant-root.ts:27` — *"Idempotent: every row is reused when present."*
  Same principle, simpler mechanism (find-or-create per row, no drift
  detection needed because dev-grant-root's Policy shape is fixed).

### `import-population.ts` and the real population source — the manager-synthesis ground truth

- `import-population.ts:29-32` — `POPULATION_CSV_PATH` resolves to
  `docs/Accounts_template.csv` (repo root).
- **The delivered CSV has exactly one data row, in its entire git history.**
  Verified with `git show` at three separate commits touching this file
  (`102617a`, `986e90a`, `0e703d1`, current HEAD unchanged since): header plus
  one row, `Site;Administrator;...;PositionName=Developer;...;DepartmentName=JS`.
  There is no multi-department, multi-employee real population anywhere in
  this repository's committed history.
- `population-import.service.ts:167` — `const position = cell(raw,
  'PositionName');`: a straight passthrough into `User.position`. **No
  manager-detection, role-classification, or pattern-matching logic exists
  anywhere in the import path.**
- Exhaustive search of every `PositionName` value that appears anywhere in
  this repository — the real CSV (all history) and every e2e/unit fixture —
  turns up exactly two literal strings: `'Developer'`
  (`Accounts_template.csv`; `s42a-op-root-operator-set.e2e-spec.ts:214`;
  `s42b-tr-root-tree-position.e2e-spec.ts:100`; `epic-1/seed.e2e-spec.ts:163`)
  and `'Principal Engineer'` (`epic-1/seed.e2e-spec.ts:340`). **Zero
  occurrences of any manager-ish string** — no `"Manager"`, `"Lead"`,
  `"Head"`, `"Director"`, or similar — in any real or fixture data in this
  codebase. See Design Notes for what this means for the lead-synthesis rule.
- `population-import.service.ts:112-141` — the import loop processes
  `rawRows` with a plain `for...of`, `await`ing `this.repository.writeRow(...)`
  **strictly sequentially**, one row per transaction. Combined with
  `prisma/schema.prisma:13` (`User.id String @id @default(uuid(7))` —
  UUIDv7, time-ordered), this means ascending `User.id` order over a freshly
  imported batch reconstructs the CSV's own row order exactly — no separate
  "import sequence" column is needed or exists.
- `population-import.repository.ts:73-90` — a newly created `User` row always
  gets `isActive: true` on import (line ~92: `isActive: true` in the `create`
  call), regardless of the row's dismissed/active status in the source data;
  dismissal is tracked separately via `EmploymentStatus`, never via
  `User.isActive` at import time. `dev-grant-root.ts` and
  `access-control-bootstrap.ts` both filter on `User.isActive` for their own
  root-lookup, and this script's "active member" filter matches that same
  field for consistency.

### Schema — what the spine may and may not do

- `prisma/schema.prisma:292-314` `model Relationship` — `userId` (subject),
  `type: RelationshipType`, `reportsToUserId` (nullable, the endpoint).
- `prisma/migrations/20260830010000_access_control_relationships/migration.sql:33-36`
  — `relationships_one_direct_per_user`: `CREATE UNIQUE INDEX
  "relationships_one_direct_per_user" ON "relationships"("userId") WHERE
  "type" = 'direct';`. At most one `direct` row per subject — the constraint
  this script's per-user existence check must respect.
- Same migration, `relationships_shape_check` (a `direct` row requires
  non-null `reportsToUserId`, null `projectId`) and
  `relationships_no_self_endpoint_check` (`reportsToUserId <> userId`) —
  guaranteed satisfied by construction (lead → root, member → lead, never a
  self-edge) but still real schema-level guards, not merely application ones.
- `prisma/schema.prisma:175-189` `model DepartmentMembership` — current
  membership is the row with `validTo: null`; the unique constraint is
  `(userId, departmentId)` **WHERE `validTo` IS NULL** (raw SQL, per the
  comment at `:187`), not `(userId)` alone — a user CAN hold more than one
  concurrent membership (Ask First AF-5). Established query idiom for
  "current membership": `org-relationship.repository.ts:576-577`,
  `.findMany({where:{userId, validTo: null}})` — this script's own
  by-department query (`where: {departmentId, validTo: null}`) is the
  reverse direction of the same idiom; no existing helper does it, this is
  new, simple, ordinary Prisma.
- `org-relationship.repository.ts:60-90` `assignManager` — the real write
  path also inserts `AccessJournal` rows (`kind: 'manager'`) in the same
  transaction as the `Relationship` insert. This script bypasses that path
  (Ask First AF-3) and therefore writes no journal entry for its edges.
  `prisma/schema.prisma:98-120` `model AccessJournal` has no FK to
  `Relationship` and nothing requires one — skipping it is schema-legal.

### `assign-manager.action.ts` and its dependency cost — why this script does not reuse it

- `assign-manager.action.ts:21-59` `AssignManagerAction` — constructor takes
  `OrgRelationshipService` and `DepartureService`.
- `departure.service.ts:60-66` — `DepartureService`'s constructor needs
  `DEPARTURE_REPOSITORY_PORT`, `BUSINESS_TIME_ZONE`, and
  `DEPARTURE_EXECUTOR_PORT` — real DI wiring `import-population.ts`'s own
  standalone idiom (one repository, one port) does not have to do for
  `PopulationImportService`.
- `assign-manager.action.ts:45-47` — the departure guard
  (`hasNonAppliedDeparture`) can structurally never fire against this
  script's inputs: `population-import.repository.ts`'s writer creates
  `User`/`DepartmentMembership`/`EmploymentStatus`/`UserEvent` rows only,
  never a `Departure` row (Epic 5's own model, a separate feature this
  script's fake population never touches).

### `package.json` — the current script block and the repoint

- `package.json:11-38` — `"scripts"` block. Line 18 `db:seed`; line 19
  `db:bootstrap:access-control`; line 20 `db:dev:grant-root`; **line 21
  `"create:root": "npm run db:seed && npm run db:dev:grant-root"`**; line 22
  `db:import:population`.
- The repoint verified against real script behaviour, not assumed: `db:seed`
  (`prisma/seed.ts`) creates the one root `User`; `db:bootstrap:access-control`
  (`access-control-bootstrap.ts`) grants the canonical six-key `hr-admin` FR
  policy to root; `db:dev:seed-org` (new) seeds the two-level spine over
  whatever active population already exists. **`create:root`'s new value:**
  `"npm run db:seed && npm run db:bootstrap:access-control && npm run
  db:dev:seed-org"`. This mirrors the old chain's own shape — `db:seed` then
  exactly one dev-permission/org script — and, like the old chain, does
  **not** include `db:import:population`: a developer who wants a populated
  spine still runs the importer as its own explicit step, exactly as they do
  today (I/O Matrix, "Fresh DB, no population imported" row).

### `src/config/env.validation.ts` — the `NODE_ENV` idiom, and why it does not apply directly

- `env.validation.ts:27-29` — `NODE_ENV: Joi.string().valid('development',
  'production', 'test').default('development')`. The three valid values this
  script's guard must recognize.
- `env.validation.ts:108-112` `ALLOW_TEST_SESSION_TOKENS` — the one existing
  `.when('NODE_ENV', {is: 'production', ...})` conditional in this codebase,
  but it is Joi schema validation consulted through Nest's `ConfigModule` at
  app boot — this script never boots Nest (no `ConfigService` anywhere in
  `dev-grant-root.ts`, `bootstrap-access-control.ts`, or
  `import-population.ts`; all three read `process.env.X` directly). The
  idiom to copy is therefore the **direct env-var read**, not the Joi
  schema: `if (process.env.NODE_ENV === 'production') { throw ...; }` as the
  first statement in `main()`, mirroring how these three scripts already
  read `ROOT_WORK_EMAIL`/`DATABASE_URL` directly.

### `test/access-control/acm1r-fr-foundation.e2e-spec.ts` — the drift-check suite's actual current state

- `acm1r-fr-foundation.e2e-spec.ts:47-51` `CANONICAL_KEYS` — still **three**
  keys, unchanged since commit `0788f60` (`git log` on this file stops there;
  neither `4ce8bd8` [4.2a] nor `8ec35fd` [4.2b, this spec's own baseline]
  touches it).
- `:344` (key-list equality against a 3-key literal), `:386`
  (`toHaveLength(3)` on the grant count) — both directly read and confirmed
  still asserting the pre-4.2a three-key shape.
- `spec-4-2a-root-operator-permission-set.md`'s own Stage-3 outcome table
  (lines 943-968) records the **current, real, already-measured** result at
  this exact suite: **16 failed / 23 passed, 39 total**, every failure "pure
  cardinality" (`Expected: 3 / Received: 6`, etc.), explicitly left unamended
  by 4.2a's own Stage-3 dispatch and named a **separately tracked follow-up**.
  Neither `4ce8bd8` nor `8ec35fd` changed this file, so this state is exactly
  what stands at this spec's own baseline commit `8ec35fd`.
- **This suite does not touch `Relationship`, `User` role logic, or anything
  `db:dev:seed-org` writes.** Its own `resetBootstrapState()` (referenced at
  `acm1r-fr-foundation.e2e-spec.ts:47-159` per `spec-4-2b`'s Code Map) only
  resets `AccessControlBootstrap`, `UserPolicies`, `PolicyPermissions`,
  `Permissions`, `Policies` — the five tables `db:dev:seed-org` never writes.
  See Ask First AF-8 for the precise reading this fact supports.

### Story and sibling-spec confirmation

- `story-4-2-default-org-relationship-seed.md:197-211` — scope item 5, quoted
  in full in Intent above; the "Interim" paragraph is the exact known-debt
  clause this increment retires.
- `story-4-2-default-org-relationship-seed.md:296-302` — the 2026-09-06
  renumbered Sequencing table; row for `4.2d`: *"`db:dev:seed-org` dev spine
  (scope item 5), retiring `dev-grant-root.ts` ... Carries scope item 1's
  verification grep as an entry check, not as work — that item is already
  closed."*
- `epic-4-context.md:34` — restates scope item 5 nearly verbatim, confirming
  it is a stable, cross-document description, not a one-off story phrasing.
- `spec-4-2b-tree-root-seed.md:178-181, 188-189, 634` — three separate Never
  / Boundaries statements, all agreeing: `db:dev:seed-org` does not exist yet
  and `dev-grant-root.ts` is untouched by 4.2b; both are this increment's job.

## Tasks & Acceptance

**Execution — three separately-approved AD-1 stages. No dispatch spans two.**
Nothing below has been executed; this is the plan.

- [ ] **AD-1 stage 1 — scenario docs only.**
  - Author, under new folder `docs/test-cases/access-control-kernel/dev-seed-spine/`
    (Ask First AF-1): `s42d-ds-01-throws-under-node-env-production.md`,
    `s42d-ds-02-two-level-spine-over-imported-population.md`,
    `s42d-ds-03-rerun-is-additive-only.md`,
    `s42d-ds-04-department-with-no-active-members-is-skipped.md`,
    `s42d-ds-05-dev-grant-root-retired-and-create-root-repointed.md`.
  - Author, under `docs/test-cases/user-management/access-control-adoption/`
    (continuing the `s42a-op-*`/`s42b-tr-*` precedent):
    `s42d-ds-06-root-resolves-reporting-write-over-every-seeded-member.md`.
  - Author, or explicitly re-cite as an entry check (not new authorship), the
    scope-item-1 verification grep table from the story
    (`story-4-2-default-org-relationship-seed.md:119-130`) — confirm it still
    reads zero executable hits at this spec's own baseline before Stage 2
    proceeds. This is **carried forward, not redone** — per the story's own
    Sequencing note for 4.2d.
  - Resolve Ask First **AF-1** (folder/prefix) as part of this stage; every
    other Ask First item may be resolved here or deferred to the Stage-2/3
    gates as the PO prefers, but none may be silently assumed.
  - **STOP for human approval — write no test file and no source file in this
    dispatch.**
- [ ] **AD-1 stage 2 — e2e, written and run against UNCHANGED source. Real red
      expected, not a lock.**
  - `test/access-control/s42d-ds-dev-seed-org.e2e-spec.ts` — subprocess-only,
    `acm1r-fr-foundation.e2e-spec.ts`/`s42a-op-bootstrap-canonical-set.e2e-spec.ts`
    shape. Runs `db:seed` + `db:bootstrap:access-control` +
    `db:import:population` (against a temporary multi-department CSV built
    for this suite — the delivered `docs/Accounts_template.csv` cannot
    produce more than one department, Code Map), then
    `npm run db:dev:seed-org`, and asserts: the shape (one edge per
    department lead → root, one edge per other active member → their lead);
    idempotence (a second run adds zero rows); the empty-population case
    (zero departments with active members → zero edges, exit `0`); the
    `NODE_ENV=production` throw (spawn with that env var set, before any DB
    write); and the retirement facts (`scripts/dev-grant-root.ts` does not
    exist, `npm run db:dev:grant-root` fails with "Missing script", and
    `package.json`'s `create:root` value equals the repointed chain).
  - `test/user-management/access-control-adoption/s42d-ds-root-reach-over-seeded-population.e2e-spec.ts`
    — hybrid harness, `s42a-op-root-operator-set.e2e-spec.ts`/`s42b-tr-tree-root-seed.e2e-spec.ts`
    shape. Provisions through the real bootstrap + import + seed-org
    subprocess chain, boots Nest, and drives `GET /users/:id` for a sample of
    seeded members (a lead, an ordinary member, a member of a single-person
    department) asserting `canEdit: true` for root on each.
  - **Declare explicitly at this gate: every assertion above is expected RED
    against HEAD `8ec35fd`**, because `scripts/dev-seed-org.ts` does not
    exist, `db:dev:seed-org` is not a defined npm script, and
    `scripts/dev-grant-root.ts` still exists with `create:root` still
    pointing at it. This is the real red-then-green story the Intent section
    promises — there is no "already correct" framing to claim here, unlike
    `4.2b`.
  - **STOP for human approval — write no non-test file in this dispatch.**
- [ ] **AD-1 stage 3 — implementation.**
  - Create `scripts/dev-seed-org.ts` per Design Notes' algorithm: `NODE_ENV`
    guard first; resolve root via the same normalized-email/exact-one-active
    idiom as `dev-grant-root.ts:82-117`; query departments and their current
    active memberships; synthesize one lead per department (ascending
    `User.id`); write missing `direct` edges only, inside a transaction,
    respecting `relationships_one_direct_per_user`.
  - Add `"db:dev:seed-org": "node --import tsx scripts/dev-seed-org.ts"` to
    `package.json`, mirroring the existing `db:dev:grant-root`/`db:bootstrap:access-control`
    line shape.
  - Delete `scripts/dev-grant-root.ts` and remove the `"db:dev:grant-root"`
    entry from `package.json`.
  - Repoint `"create:root"` to `"npm run db:seed && npm run
    db:bootstrap:access-control && npm run db:dev:seed-org"`.
  - Resolve Ask First **AF-2** through **AF-8** with recorded, dated rulings
    before or during this dispatch; execute against whatever is ruled.
  - Run the **Verification** set below and record real results, replacing
    the plan with the outcome.
  - Record in **Boundaries** what this increment deliberately did not close.

**Acceptance Criteria:**

- **Given** `NODE_ENV=production`, **when** `npm run db:dev:seed-org` runs,
  **then** it throws before any Prisma client is constructed, exits nonzero,
  and no database is touched.
- **Given** root provisioned by `db:seed && db:bootstrap:access-control` and a
  population imported with N departments each holding ≥1 active member,
  **when** `npm run db:dev:seed-org` runs, **then** exactly one `direct` edge
  exists per department lead → root and one per other active member → their
  lead; root's own `direct`/`people_partner` row count stays `0`; the script
  exits `0`.
- **Given** that seeded state, **when** `npm run db:dev:seed-org` runs again
  with no new imports, **then** zero new `Relationship` rows are created —
  the rerun is a pure no-op on the edge count.
- **Given** a department whose every current member has `isActive: false`,
  **when** the script runs, **then** that department is skipped with no
  error and no edge.
- **Given** the seeded population, **when** root calls `GET /users/:id` for
  any member the script gave a (direct or transitive) edge to, **then** the
  response is `200` with `canEdit: true`, through the unmodified upward-walk
  CTE — no adapter special case, matching the story's own acceptance
  criterion for scope item 5.
- **Given** `scripts/dev-grant-root.ts`, **when** this increment lands,
  **then** the file no longer exists, `package.json` carries no
  `db:dev:grant-root` entry, and `npm run db:dev:grant-root` fails with
  `Missing script`.
- **Given** `package.json`'s `create:root` entry, **when** read after this
  increment, **then** it equals `"npm run db:seed && npm run
  db:bootstrap:access-control && npm run db:dev:seed-org"`.
- **Given** `test/access-control/acm1r-fr-foundation.e2e-spec.ts`, **when**
  run before and after this increment, **then** its pass/fail counts are
  **identical** (16 failed / 23 passed / 39 total, per the pre-existing,
  separately tracked cardinality drift) — this increment adds no new failure
  and fixes none, per Ask First AF-8.
- **Given** the full `test/access-control` and `test/user-management` e2e
  sets and the unit suite, **when** run after this change, **then** every
  suite's pass/fail counts are identical to the pre-change baseline except
  for the two new suites (both green in full) and the removal of any
  suite/fixture that referenced `dev-grant-root.ts` by name (Verification —
  to be checked, not assumed).

## Design Notes

### The lead-synthesis rule, stated precisely, and why it has no `PositionName` half

**Rule:** for each department, take its current (`validTo: null`)
`DepartmentMembership` rows, join to `User`, filter to `isActive: true`,
order the result **ascending by `User.id`**, and take the first row's user as
the department's synthesized lead. Every other active member of that
department gets a `direct` edge to that lead; the lead itself gets a `direct`
edge to root.

**Why ascending `User.id`, precisely, is "first active member," not an
arbitrary tie-break:** `User.id` is `uuid(7)` (`prisma/schema.prisma:13`) —
time-ordered by construction, not random like `uuid(4)`. Combined with
`population-import.service.ts`'s strictly sequential row processing (a plain
`for...of` loop, one `await this.repository.writeRow(...)` per row, never
`Promise.all` — Code Map), a freshly imported CSV's rows are written to the
database in exactly their file order, one id-generation event per row, in
order. Ascending `User.id` order over a department's members is therefore
**identical to the order those members first appeared in whatever CSV
produced them** — not merely "some stable order," but specifically the CSV's
own row order, which is the only ordering signal the source data actually
carries (it has no explicit "seniority," "hire rank," or "is manager"
column).

**Why there is no `PositionName`-based fallback:** the story's own phrasing
("or by a manager-ish `PositionName` where one exists") was written as an
open possibility, not a confirmed rule, and this spec's own Code Map
obligation was to check it against real data before committing to it. That
check is exhaustive, not a sample: the delivered `docs/Accounts_template.csv`
has exactly one row in its entire recorded history, and every `PositionName`
value anywhere in this repository's test fixtures is either `'Developer'` or
`'Principal Engineer'` — individual-contributor titles, not managerial ones.
**Zero pieces of data anywhere in this codebase would ever cause a
`PositionName`-matching heuristic to fire.** Building one now would be
untested-by-construction pattern-matching against strings that cannot occur
given every known data source, which is the same category of problem this
project's own convention (`feedback_no_speculative_fields`) names for schema
columns, extended here to a heuristic branch: a rule with no confirmable
input is not a rule, it is a false sense of coverage. The synthesis rule is
therefore **"first active member by ascending `User.id`" alone**, with no
`PositionName` half — and if real position data ever does carry a
manager-identifying convention, adding that branch is a small, well-scoped
follow-up with an actual test case behind it, not a speculative addition now.

### Why direct Prisma writes, not the HTTP action layer (Ask First AF-3, expanded)

`import-population.ts` sets a precedent of reusing the same writer class the
HTTP endpoint uses (`PopulationImportService`), and it is worth being
explicit about why `db:dev:seed-org` does not follow that precedent for
`Relationship` writes. The reuse in `import-population.ts` is cheap: the
service depends on exactly one repository port
(`POPULATION_IMPORT_REPOSITORY_PORT`), itself needing only a `PrismaService`-shaped
client — structurally identical to the bare `PrismaClient` these scripts
already construct. `AssignManagerAction`'s dependency graph is not: it needs
`OrgRelationshipService` (fine, one port) **and** `DepartureService`, whose
own constructor needs a repository port, a business-timezone value, and an
executor port (`departure.service.ts:60-66`) — none of which this script has
any other reason to wire, and all of which exist to guard a case
(`hasNonAppliedDeparture`) that is structurally impossible against this
script's own inputs, because the population it seeds over was created by
`import-population.ts`'s writer, which never creates a `Departure` row. Direct
transactional Prisma writes — the same idiom `dev-grant-root.ts` and
`access-control-bootstrap.ts` already use for their own tables — respect
every real schema invariant (`relationships_shape_check`,
`relationships_no_self_endpoint_check`, `relationships_one_direct_per_user`)
by construction, at a fraction of the wiring cost, for a script whose whole
purpose is throwaway dev convenience.

### Idempotence — the exact rule and its edge case

Idempotence here means: **a rerun creates a `Relationship` row only for a
user (lead or ordinary member) who does not already hold one of type
`direct`.** This is deliberately coarser than "matches what this run would
compute as correct" — it does not ask whether an existing edge still points
where today's lead-synthesis snapshot would point it; it only asks whether an
edge exists at all. This mirrors `access-control-bootstrap.ts`'s own
philosophy exactly (ensure presence, never prune or rewrite what's already
there) and produces one honest, named edge case (Ask First AF-4): if a
department's synthesized lead is later deactivated, a rerun does not promote
a replacement, because the natural replacement (the next active member by
ascending id) already reports to the deactivated lead and is therefore
already "present" by this rule. This is accepted, not silently glossed over —
an HR Admin's ordinary write route remains available to fix any individual
edge by hand.

### Why `db:dev:seed-org` does not fully retire the story's Interim known-debt clause's *sibling* concern

The story's Interim paragraph names one specific known-debt fact:
*"[dev-grant-root.ts] will fail the ACM-1 drift-check e2e if run against that
suite's DB"* — a fact about **running that specific script** against **that
specific suite's database**. Retiring the file makes that fact vacuously,
permanently true in the good direction: there is no script left to run, so
there is no way to reproduce the failure this clause warns about. That is a
complete, clean closure of the clause as written. It is a **separate fact**
that `acm1r-fr-foundation.e2e-spec.ts` is *independently* red today, for a
reason `4.2a` introduced and explicitly deferred (the six-key canonical set
outgrowing the suite's own three-key literals) — a fact this increment's
script cannot touch (Code Map: it never reads or writes any of the five
tables that suite inspects) and does not attempt to fix (Ask First AF-7).
Reporting these as the same fact would be sourcing error; they are cited
separately above for exactly that reason.

## Verification

**Stage-3 outcome, recorded 2026-09-07 (John, PM) — every command below has
been run, and the `create:root` correction above is reflected in the actual
numbers, not the plan's original prediction.**

| Command | Result |
|---|---|
| `npm run test:e2e -- s42d-ds` | 27/27 green (both new suites), after 4 consecutive clean reruns — one earlier run showed 2 red, traced to a concurrently crashed background process leaving transient shared-DB state, not a defect (see below) |
| `npm run test:e2e -- acm1r-fr-foundation` | **16 failed / 23 passed / 39 total — byte-identical to the pre-change baseline.** No new failure, none fixed (AF-8, confirmed) |
| `npm run test:e2e -- test/access-control` | Baseline + the one new DB-level suite, no regression |
| `npm run test:e2e -- test/user-management` | 26 suites, 296 passed — exactly the 290 baseline + 6 from the new HTTP-level suite |
| `npm run test:e2e -- s42a-op-* s42b-tr-*` (all four sibling suites) | 4/4 suites, 40/40 tests, undisturbed |
| `npm run lint` | Exactly 12 pre-existing errors, none new |
| `npm run build` | Clean |

**The `create:root` fix, applied after Stage 3 and before commit:** a PO code
review caught that `db:dev:seed-org` bundled into `create:root` silently
no-ops in the real dev workflow (see the correction banner in Intent).
`package.json`'s `create:root` value was reverted to `"npm run db:seed &&
npm run db:bootstrap:access-control"`; `s42d-ds-dev-seed-spine.e2e-spec.ts`
Test 3's exact-string assertion was updated to match, with a dated in-file
correction (not a silent rewrite); the `s42d-ds-05` scenario doc and
`dev-seed-org.ts`'s own header comment received the same correction. All
verification numbers above are POST-fix; the suite is green against the
corrected value, not the original one.

**Original Verification plan, retained as the record — command list only, not
predictions the fix above invalidated:**

| Command | Expected |
|---|---|
| `npm run test:e2e -- s42d-ds-dev-seed-org` | New suite, **red** at Stage 2 (script/alias do not exist), **green** after Stage 3 |
| `npm run test:e2e -- s42d-ds-root-reach-over-seeded-population` | New suite, **red** at Stage 2, **green** after Stage 3 |
| `npm run test:e2e -- acm1r-fr-foundation` | **Unchanged**: 16 failed / 23 passed / 39 total, identical to the pre-change baseline recorded in `spec-4-2a`'s own Stage-3 outcome — no new failure, none fixed (Ask First AF-8) |
| `npm run test:e2e -- test/access-control` | Counts identical to the pre-change baseline plus the one new DB-level suite, no regression |
| `npm run test:e2e -- test/user-management` | Counts identical to the pre-change baseline plus the one new HTTP-level suite, no regression |
| `npm run test` (unit) | Counts unchanged |
| `npm run build` | Clean |
| `npm run lint` | Error count unchanged against the pre-change baseline (12 pre-existing errors recorded by `spec-4-1d`/`spec-4-2a`, none in a file this increment touches) |
| `test -f scripts/dev-grant-root.ts` | Fails (file does not exist) after Stage 3 |
| `npm run db:dev:grant-root` | `npm error Missing script: "db:dev:grant-root"` after Stage 3 |
| `node -e "console.log(require('./package.json').scripts['create:root'])"` | `npm run db:seed && npm run db:bootstrap:access-control && npm run db:dev:seed-org` after Stage 3 |
| `git grep -n "dev-grant-root"` over `services/backend/` (source and docs, not this spec or the story) | Zero remaining live references outside historical/dated citations, after Stage 3 |
| `git diff --stat -- src/access-control/` | Empty — this increment touches no file under `src/access-control/**` (Never list; ACM-9 pin argument) |

Use `git grep` or `grep -arn`/`grep -in` deliberately, never plain `grep -r` —
`spec-4-1d`'s and `spec-4-2a`'s Verification sections both record that a
NUL-carrying file in this tree is skipped as binary by plain `grep -r`, which
let two live hits escape an earlier oracle.

**ACM-9 pin — the reasoning, stated in advance.** This increment's only
production file is `scripts/dev-seed-org.ts`, which is not under
`src/access-control/**` and imports nothing from it — confirmed by Code Map
(the script only needs the generated Prisma client, exactly like
`dev-grant-root.ts` and `bootstrap-access-control.ts` before it touched
`access-control-bootstrap.ts`, itself unmodified here). `epic-4-context.md:24`'s
rule is therefore not triggered; no ACM-9 rerun is required by this
increment's own scope. The `seeded-two-level` measurement question (Ask First
AF-6) is a separate, still-open, story-level decision this increment does not
resolve.

## Boundaries

What this increment deliberately leaves standing, and who takes it:

| Left in place / not built | Why | Owner |
|---|---|---|
| The **department-management** branch (`targetType:'department'` + `Department.parentId` walk) | Quoted from the story's own Out section: *"both remain their own pending AC increments. The seed spine is the pure `reports-to` chain only."* | Its own future increment |
| The **project-line** branch | Same story Out-section quote as above | Its own future increment |
| Root **write** access to `profile:personal-contacts` / `profile:emergency-contacts` / `profile:documents` | Quoted from the story's Out section: *"the reporting-line audience is read-only on those by deliberate privacy design (§3.2: read-write for Self and PP only). No routes exist for them today; revisit ... when they land."* This spec's spine only ever creates `reporting` audience reach — it does not and cannot grant write on sections the reporting audience itself cannot write | Revisit only if/when those routes land |
| Whether `profile:identity` edit has an FR half at all | Story Out section: *"that is 4.1's composition decision."* Unaffected by this spec | 4.1 (closed already; not reopened here) |
| The §2.4 full-profile-access first-holder grant | Separately blocked on an architect data-model decision (`4.2c`, per the story's 2026-09-06 renumbering) — no schema/port/adapter exists for it anywhere in `services/backend`. Not a dependency of this increment | `4.2c`, unstarted, architect Stage-1 pass required first |
| `acm1r-fr-foundation.e2e-spec.ts`'s stale three-key cardinality literals (16 pre-existing failures) | `spec-4-2a`'s own explicitly named, separately tracked follow-up — not one of story 4.2's five scope items (Ask First AF-7) | Separate follow-up dispatch, unowned as of this spec |
| The orphaned `user-management:edit` `Permission`/`PolicyPermission` rows on any dev database that already ran `dev-grant-root.ts` | Inert (no gate reads it), and pruning administrator-writable state on a rerun is against this codebase's own bootstrap philosophy even for a harmless row (Ask First AF-2) | Not scheduled; harmless as-is |
| A department whose synthesized lead was later deactivated | This script bootstraps a shape once; it does not maintain one. An HR Admin's ordinary write route remains the fix (Ask First AF-4) | Not scheduled; accepted behaviour |
| The ACM-9 `seeded-two-level` measurement (story's open sequencing question 1) | Explicitly not folded into this spec's frozen Intent without a PO renegotiation (Ask First AF-6) — this is, however, the first increment where the shape to measure actually exists | Story-level "Open for decision," unresolved |
| Depth-499 headroom and the `Department.parentId` index (story's open sequencing questions 3-4) | Unrelated to this spec's subject; this spec writes no migration and moves no measurement | Architect / PO, parked upstream |
| The story's own Sequencing text still calling this increment by an inconsistent set of prior letters across documents (`spec-4-2b`'s own Boundaries table still says "existing `4.2c`") | This spec follows the story's authoritative 2026-09-06 renumbering (4.2d) per this task's own instruction; reconciling every prior document's letter references is a human PM/PO pass, not performed by writing this spec | PM/PO, follow-up edit — not performed here |
