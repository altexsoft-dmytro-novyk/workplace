---
title: 'PLAT-E4-S4.2b — Tree-root seed: prove root needs no relationship row to sit at the top of the reports-to tree'
type: 'feature'
created: '2026-09-06'
status: 'ready-for-dev'
review_loop_iteration: 0
baseline_commit: '4ce8bd8' # services/backend HEAD, branch dn-section-access, working tree clean
story: '{project-root}/_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md'
scope_items: >-
  Story 4.2 scope item 3, TREE-ROOT HALF ONLY. This spec re-splits scope item 3
  in two: the tree-root edge (spec'd fully here) and the §2.4 full-profile-access
  first-holder grant, which is pulled OUT into a new, unstarted increment named
  4.2c-overlay (see Intent and Boundaries) because no schema/port/adapter for
  that overlay exists anywhere in services/backend. Scope item 2 (the operator
  permission set) is closed by 4.2a. Scope item 1 is closed by verification.
  Scope item 4 (ACM-9 seeded-two-level evidence) is a parked, unresolved
  story-level sequencing question and is explicitly NOT folded into this spec.
  Scope item 5 (db:dev:seed-org) is out.
context:
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/docs/architecture/database-schema.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/epic-4-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/spec-4-2a-root-operator-permission-set.md'
  - '{project-root}/_bmad-output/implementation-artifacts/access-control/solution-design-upward-walk-resolver.md'
  - '{project-root}/_bmad-output/implementation-artifacts/access-control/deferred-work.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

> **RE-SPLIT 2026-09-06 (PM decision) — read this before anything else.** Story
> 4.2 scope item 3 reads as one item — "§2.4 first holder + tree-root edge at
> bootstrap" — but it is two increments with two different blockers, and this
> spec covers **only one of them**. **This spec does NOT deliver "seat root as
> the organisation's boss."** It delivers, and verifies, the tree-root half
> alone. The §2.4 full-profile-access first-holder half — "clean read of every
> section" from the story's Recorded Decision table — has **no storage
> representation anywhere in `services/backend`**: `prisma/schema.prisma` has no
> model for it, and `docs/architecture/access-control.md:345` states explicitly
> *"AD-28 full-profile-access scenarios are not yet authored ... Authoring
> requires an AD-1 Stage-1 dispatch ... do not invent scenarios."* That half is
> pulled out into a new, unstarted, explicitly-flagged increment — **4.2c-overlay**
> — named and scoped in Boundaries below, not built here. Anyone reading a green
> 4.2b as "root is now the organisation's boss" per the Recorded Decision table
> is reading it wrong: root's admin features (4.2a, done), root's write reach
> (this spec), and root's full-profile read reach (4.2c-overlay, not started)
> are three separate deliveries.

## Intent

**Problem.** The story's own phrasing — "seats root at the top of the
`reports-to` tree ... at bootstrap" — describes something that cannot be
written as stated, and the discovery is not new to this spec:
`spec-4-2a-root-operator-permission-set.md` § "Why this is 4.2a" already found,
while investigating why item 3 could not go first, that *"`Relationship` rows
are written per subject ... Seating root 'at the top of the `reports-to` tree'
therefore means giving every other user an edge that ascends to root; root
itself gets no row. On a fresh production DB immediately after `db:seed`, root
is the only `User` ... There is nobody to point at root."* This spec re-derives
that finding independently (Code Map, Design Notes) and confirms it: it holds
not only at the single instant right after `db:seed`, but **permanently** —
there is no point in this system's lifecycle, before or after population
import, at which any code writes a `Relationship` row where `userId` is root's
id. Root's "top of the tree" position is not a row anyone creates; it is the
**absence** of one, forever, for as long as nothing assigns root a manager.

**Consequently, this increment is a verification, not a seed — precisely the
same shape scope item 1 turned out to be.** There is no schema change, no
migration, and (see Design Notes) very likely no production code change at
all. What is missing is **evidence**: no suite in this repository today proves
the Recorded Decision's central write-side claim — *"top of the `reports-to`
relationship tree → `reporting` audience over everyone, transitively"* — for
root. `s42a-op-03` Test 2 wires an ordinary employee pair (subject → manager);
nobody ever wires an edge that terminates at root. `s42a-op-04` proves the
opposite fact on purpose (root has **no** relationship-derived reach over an
**unrelated** person, precisely because nothing points at it yet). The gap this
spec closes is that gap: prove that once something *does* point at root,
`resolveAudiences` already grants root `reporting` write over it, transitively,
through the unmodified upward-walk CTE, with zero new production code.

**Approach.** Author scenario docs and a small e2e addition, run against
**unmodified** source, that:

1. Locks the negative fact — a clean `db:seed && db:bootstrap:access-control`
   writes zero `relationships` rows, so root's own `direct` row count is (and
   stays) zero.
2. Proves the positive fact — once two ordinary write-route calls build a
   two-level chain terminating at root (`E2 → E1 → root`), root resolves
   `reporting` → `write` on `E2`'s identity card, two levels down, through the
   existing CTE with **no** change to
   `prisma-relationship-graph.adapter.ts`.
3. Proves root's own upward walk is empty — `GET /users/<root>/relationships`
   returns `data: []` for root itself, over the real endpoint.
4. Confirms nothing about anyone *else's* reach into root moved.

If Stage 1 approval also wants the finding recorded in the two files that most
directly invite the "why does nobody seed this?" question
(`access-control-bootstrap.ts`, `prisma/seed.ts`), Stage 3 may add two
documentation-only comments — no behavioural change, gated by **Ask First
AF-2** below, because adding prose to a file under
`src/access-control/**` is not free of process (ACM-9 pin argument, Design
Notes).

## Boundaries & Constraints

**Always:**

- **The only durable fact this increment is responsible for is negative:**
  zero `Relationship` rows exist where `userId` = root's id, at every point in
  time this spec's own suites observe. No task in this spec may create one.
- **Root's transitive reach is proven through the existing, unmodified upward
  walk** (`prisma-relationship-graph.adapter.ts:88-120`) — the chain built for
  the proof uses the real `POST /users/:id/relationships` write route
  (`AssignManagerAction`, already shipped), never a raw `prisma.relationship.create`
  bypassing it, and never the not-yet-built `db:dev:seed-org` script.
- **The proof chain must be at least two levels deep** (`E2 → E1 → root`), not
  one. A single direct report proves reachability, not the "transitively"
  clause of the Recorded Decision — that is exactly the distinction between
  what `s42a-op-03` Test 2 already covers (an ordinary one-hop pair, nobody
  reporting to root) and what this spec must additionally prove.
- **No new schema, no new migration, no new port method.** `Relationship`,
  `relationships_one_direct_per_user`, and the graph adapter already carry
  everything this increment needs (Code Map).
- **E2E preconditions are real requests, never hardcoded ids** — the two-level
  chain is built by two real `POST /users/:id/relationships` calls against
  employees a real `POST /users/import` created, following this repo's
  precondition-fulfillment convention and the `s42a-op-03`/`s42a-op-06`
  precedent (no fixture back door, no `RunFixtures`-style FR shortcut for the
  relationship rows themselves).
- Follow this project's AD-1 discipline: scenario docs, then a red-or-declared-
  green E2E, then (if any) implementation, human approval between every stage,
  no dispatch spanning two.
- **State plainly, at the Stage-2 approval gate, that no red state is expected
  for the positive-fact suite.** This is a regression lock over an
  already-correct property (same posture as `acm10-rw-05` in the upward-walk
  solution design, which "passes immediately" and is declared a lock, not
  hidden as a red-green story). Calling it red when it cannot be would be
  false.
- If the negative-fact assertion (`§2` above) is ever found to fail against
  real code (i.e., something *does* write a root `direct` row), stop and
  report it as a defect in a different story — this spec's own Never list
  forbids fixing it here by adding a guard; that would be new behaviour beyond
  "verify and lock."

**Ask First — RESOLVED 2026-09-06 on the PO's "finish epic 4" instruction. Execute
the task list against these rulings; recommendations below stand as given.**

| # | Ruling |
|---|---|
| AF-1 | **Accepted as recommended.** New folder `tree-root-seed/` for the DB-level scenario; HTTP-level scenarios continue `access-control-adoption/`; prefix `s42b-tr-*`. |
| AF-2 | **Accepted as recommended.** Add both documentation-only comments in Stage 3. |
| AF-3 | **Accepted as recommended.** Split into two e2e files, mirroring the `s42a-op-*` precedent. |
| AF-4 | **Accepted as recommended.** Not folded in here; remains the story-level open question it already was. |

| # | Original question, retained as the record | Recommendation |
|---|---|---|
| **AF-1** | **Where do the new scenario docs live, and under what id prefix?** No existing folder fits: `fr-bootstrap/` is Permissions/Policies-shaped and mid-amendment from 4.2a's own follow-up (`acm1r-fr-foundation.e2e-spec.ts`'s pending cardinality edit); `reporting-walk-bounds/` is proposed in the solution-design doc for the *resolver* evidence item (story scope item 4), a different subject. | Author a **new sibling folder**, `docs/test-cases/access-control-kernel/tree-root-seed/`, for the one DB-level scenario, and continue the **`user-management/access-control-adoption/`** folder for the HTTP-level scenarios (the `s42a-op-03..06` precedent: HTTP-observable consequences of a seed/bootstrap fact live there even when the story-numbered id is AC-flavoured). Id prefix `s42b-tr-*` (`tr` = tree-root), stable workboard ids per this repo's convention. |
| **AF-2** | **Do the two documentation-only comments in `access-control-bootstrap.ts` / `prisma/seed.ts` belong in this increment, or should the source stay fully untouched?** Precedent both ways: 4.2a embedded dated rationale directly in code for a load-bearing decision (the AF-2 timeline-key comment); scope item 1 closed by grep evidence alone, touching no source. A comment-only edit to `access-control-bootstrap.ts` also touches a file under `src/access-control/**`, which `epic-4-context.md`'s standing rule names as invalidating the pinned ACM-9 baseline — 4.2a already argued (and this spec repeats, Verification) that a comment/constant-only change does not move the measured shape, so the pin need not be rerun for it alone; but that argument has to be made explicitly each time, not assumed. | **Add both comments.** They are cheap, reversible, and directly answer the question a future reader will ask on seeing `access-control-bootstrap.ts` do nothing with `Relationship` after a story titled "tree-root seed" landed. If the PO declines, Stage 3 has **zero** source diff and the increment closes exactly like scope item 1 — by test authorship and a grep table, nothing else. |
| **AF-3** | **One combined e2e file, or the split DB-level / HTTP-level pair the `s42a-op-*` precedent used?** | **Split**, mirroring `s42a-op-bootstrap-canonical-set.e2e-spec.ts` (subprocess-only, no Nest) / `s42a-op-root-operator-set.e2e-spec.ts` (hybrid harness). The two facts this spec proves have different harness costs — one is a database assertion after two scripts, the other needs a booted Nest app and three HTTP round trips — and forcing them into one file would mean either paying the Nest-boot cost for the trivial check or omitting the trivial check's own isolation story. |
| **AF-4** | **Does the ACM-9 `seeded-two-level` measurement (the story's still-open sequencing question 1, "does 4.2a still exist / fold into 4.2b?") belong here?** The solution-design doc's own recommendation was "(b) fold the measurement into 4.2b, since 4.2b is the increment that actually creates the tree-root edge." This spec does **not** create a tree-root edge (see Design Notes — there is none to create), so the premise behind recommendation (b) does not hold against this spec's own finding. | **Not decided here — explicitly left as the story-level open question it already is.** Folding a new deliverable (a published ACM-9 artifact) into this spec's frozen Intent would need a renegotiation, not a default. See Boundaries. |

**Never:**

- **Never write a `Relationship` row for root**, in any script, migration, or
  test fixture that runs as part of production provisioning. The two-level
  proof chain in this spec's own e2e touches only the *other* identities
  (`E1`, `E2`) — root is the terminus their edges resolve to, never a subject
  of a write itself.
- **Never touch `prisma-relationship-graph.adapter.ts`.** Confirmed correct by
  the 2026-09-05 solution design; this spec's job is to exercise it, not
  change it.
- **Never model the §2.4 grant as a `Policies` row, a `UserPolicies` row, or
  any other invented shape**, here or as a "quick" stopgap. That is
  `4.2c-overlay`'s decision to make, after an architect Stage-1 pass — see
  Boundaries. Doing so here would also violate `ACM1-FB-06`'s
  `countOf('Policies') === 1` invariant, which `spec-4-2a`'s Design Notes
  already flagged as the exact collision this scope item would cause.
- **Never build `db:dev:seed-org`** or add a `type='direct'` seed spine to
  `prisma/seed.ts` or `bootstrap-access-control.ts`. Scope item 5, a later
  increment. This spec's e2e-only two-level chain is test fixture state, run
  and torn down inside one suite — not a seed shipped to any environment.
- **Never add a guard, check constraint, or application-level rule preventing
  an admin from assigning root a manager.** Nothing in the codebase forbids it
  today (`assign-manager.action.ts:30-41` has no root special case), and
  closing that gap is new behaviour beyond "verify and lock" — see Design
  Notes for why the existing cycle-detection is an adequate, if incidental,
  safety net and why explicit prevention is out of scope.
- **Never touch `scripts/dev-grant-root.ts`.** Retiring or shrinking it is
  Story 4.2's final increment (scope item 5), unaffected by this spec.
- **Never amend `story-4-2-default-org-relationship-seed.md`'s own text**,
  including its Sequencing section, which still names "4.2b" as the §2.4
  grant. Reconciling that text with this spec's letter re-use is a follow-up
  PM/PO pass, flagged in Boundaries — not performed by writing this spec.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fresh production bootstrap | `db:deploy` → `db:seed` → `db:bootstrap:access-control` on an empty DB | `relationships` table has **0** rows; root's own `direct`/`people_partner` row count is **0** | N/A |
| Root imports employees | Root, provisioned only by the production bootstrap, `POST /users/import` with a 2-row CSV (`E1`, `E2`) | `200`, two `User` rows created, both `isActive: true` | Unchanged |
| Root wires E1 to itself | Root, `POST /users/E1/relationships {type:'direct', targetId: root.id}` | `201`; `relationships` gains exactly one row `{userId: E1, reportsToUserId: root, type: 'direct'}` | N/A |
| Root wires E2 to E1 | Root, `POST /users/E2/relationships {type:'direct', targetId: E1.id}` | `201`; a second row `{userId: E2, reportsToUserId: E1, type: 'direct'}` — the two-level chain now exists: `E2 → E1 → root` | N/A |
| Root edits E2 (two levels down) | Root, `PATCH /users/E2` with a valid identity field | `200`, the change persists — the CTE ascends `E2 → E1 → root`, finds the viewer, and the chain terminates cleanly at root (root has no further `direct` row) | N/A |
| Root reads E2 | Root, `GET /users/E2` | `200`, `canEdit: true` — same `hasSectionAccess` question the `PATCH` gate asked, now transitively satisfied | N/A |
| Root reads its own relationships | Root, `GET /users/<root>/relationships` | `200`, `data: []` — root carries no `direct` row of its own. Reachable because root holds `isAllowed('org:relationships:write')` (the 4.2a canonical key), which satisfies `GetRelationshipsAction`'s Gate B on its own — `{reporting, pp}` audience over oneself is never available (Self is not Reporting/PP) | N/A |
| An ordinary colleague reads/writes root's own card | `E1` (no FR grant, no reporting/PP edge *to* root — the edge points the other way), `PATCH /users/<root>` or `GET /users/<root>` | Unchanged from today: `403` on write, `200`/`canEdit:false` on read (colleague-only audience) — nothing about *reaching into* root moved | `ForbiddenException` on write |
| Root, unrelated third employee | Root, an employee with no edge anywhere in root's chain, `PATCH /users/<T>` | Unchanged: `403`, `canEdit:false` (`s42a-op-04`'s own case, re-affirmed, not re-tested here) | `ForbiddenException` |
| Someone later assigns root a manager | An admin holding `org:relationships:write`, `POST /users/<root>/relationships {targetId: someone}` | **Not prevented by anything in this codebase.** Out of scope for this spec — see Boundaries. If it happens and the assigned manager's own chain loops back to root, the CTE's existing `NOT c.repeated` guard denies Reporting for that cycle's targets; it does not stop the write | Accepted risk, not addressed here |

</frozen-after-approval>

## Code Map

Every line below was read at `services/backend` HEAD `4ce8bd8` on 2026-09-06,
working tree clean.

### The bootstrap path — confirmed to touch no `Relationship` row

- `src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts:1-430`
  — read in full. The only tables it touches are `Permissions` (`:244-264`
  `ensurePermissions`), `Policies` (`:212-241`, `:350-370`), `PolicyPermissions`
  (`:266-281` `ensureGrants`), `UserPolicies` (`:283-294`, `:386-392`), and
  `AccessControlBootstrap` (`:313-324`, `:394-403`). `grep -in "relationship"`
  over this file returns **zero matches**. **No edit needed for the negative
  fact** — it already holds.
- `prisma/seed.ts:1-6` — docstring: *"it deliberately does not assign the HR
  Admin functional role."* `grep -in "relationship"` over the whole file
  returns **zero matches** — it creates exactly one `User` row and nothing
  else. Confirms the negative fact holds from the very first script in the
  deploy chain, not only from the AC-owned bootstrap.
- `scripts/dev-grant-root.ts:1-173` — read in full. `grep -in "relationship"`
  returns **zero matches**; it writes `Permission`, `Policy`, `PolicyPermission`
  and `UserPolicy` rows only (`:119-164`). Confirms the accepted stopgap does
  not and never did establish any tree position for root — its own header
  (`:8-14`) says Story 4.2 is what "seats root at the reporting-tree root,"
  and this spec is the increment that discovers there is no row to write for
  that half.
- `scripts/import-population.ts:3-4` — comment: binding deploy order is
  `db:deploy → db:seed → db:bootstrap:access-control → db:import:population`.
  `grep -in "relationship"` over this file returns **zero matches** either —
  population import creates `User` and `Department` rows only. The negative
  fact survives the whole binding deploy chain, not just the two scripts scope
  item 3 names.

### The schema — what exists, unmodified

- `prisma/schema.prisma:292-314` `model Relationship` — `userId` (subject),
  `type: RelationshipType`, `reportsToUserId` (nullable, the endpoint). A row is
  written **per subject**: there is no column and no row shape that represents
  "is the tree root."
- `prisma/migrations/20260830010000_access_control_relationships/migration.sql:33-36`
  — the exact DDL:
  ```
  CREATE UNIQUE INDEX "relationships_one_direct_per_user"
    ON "relationships"("userId")
    WHERE "type" = 'direct';
  ```
  At most one `direct` row per person, keyed on `userId` (the subject), never
  on `reportsToUserId` (the manager). Nothing in this index, or anywhere else
  in the migration, caps or requires how many *other* rows point **at** a given
  user as `reportsToUserId` — a manager, including root, can be the endpoint of
  arbitrarily many edges with zero rows of their own.
- ...same migration, `:39-46` — `relationships_shape_check` (a `direct` row
  must carry a non-null `reportsToUserId` and a null `projectId`) and
  `relationships_no_self_endpoint_check` (`reportsToUserId <> userId`).
  Neither constraint says anything about the *value* `reportsToUserId` may
  hold — assigning root as *someone else's* endpoint is exactly what the
  proof chain in this spec does, and it is unconstrained.

### The graph adapter — read, not modified

- `src/access-control/infrastructure/prisma-relationship-graph.adapter.ts:88-120`
  — the reporting CTE. Seeded from `r."userId" IN (${ids})` (`:98`, the
  *targets*, i.e. `E2` and `E1` in this spec's proof chain — never the viewer).
  Ascends via `JOIN "relationships" r ON r."userId" = c.node_id` (`:105-107`).
  **Termination is the absence of a further usable manager edge** (`:76-82`
  comment) — when `c.node_id` becomes root's id, the join finds no row
  (root has none), the recursion for that branch simply stops, and root's row
  is the last one added to `path`. This is exactly "the chain ends without
  repeating a node," which the same file's comment (`:61-65`) says is what
  grants Reporting. **No change needed**: root having zero rows is not a
  special case the query has to detect — it is the ordinary "no further edge"
  termination every chain already relies on.
- `docs/test-cases/access-control-kernel/inactive-identity/acm3-ii-06-repeat-before-viewer-proof.md:32-38`
  — independently confirms the mechanism: *"Each person carries at most one
  `direct` row ... an upward walk is a linked list, not a tree."* A node with
  zero rows (root) is simply where the list ends.

### The write path — no root special case

- `src/user-management/application/actions/assign-manager.action.ts:1-59` — the
  only place a `direct` edge is created. `:35-41` rejects `subjectId ===
  targetId` (self-management); nothing else restricts `subjectId` or
  `targetId`. Root can be assigned as a `targetId` (an ordinary manager
  endpoint — this spec's proof chain does exactly that) with no special
  handling, and nothing here prevents root from later being given a
  `subjectId` row either (Boundaries, Never).
- `src/user-management/application/controllers/relationships.controller.ts:64`
  (`@Post(':id/relationships')`) and `:81` (`@Get(':id/relationships')`) — the
  two routes this spec's e2e drives. `:81`'s own comment: the read gate is
  `{reporting, pp}` audience **OR** `isAllowed('org:relationships:write')` —
  the second disjunct is what lets root read its own (empty) relationship list
  even though Self is not `{reporting, pp}`.
- `src/user-management/application/actions/get-relationships.action.ts:14-51`
  `GetRelationshipsAction` — `canRead` gate at `:43`; `data: []` when the
  target (here, root itself) has neither a `direct` nor a `people_partner`
  edge (`:48-49`).
- `src/user-management/application/dtos/relationships-view.response.ts:19-21`
  `RelationshipsEnvelope { data: CurrentEdgeView[] }` — the shape the e2e reads
  `data: []` against.

### Precedent harnesses this spec's e2e reuses, not reinvents

- `test/access-control/acm1r-fr-foundation.e2e-spec.ts:47-159, 260-270,
  310-319` — the subprocess-only pattern (`runScript`/`runSeed`/`runBootstrap`
  over `npm run <script>`, run-scoped `emailFor`, `resetBootstrapState`,
  `deleteRunUsers`, `beforeEach`/`afterAll`). The DB-level suite in this spec
  (Ask First AF-3) copies this shape verbatim for the negative-fact check —
  it needs no Nest boot.
- `test/user-management/access-control-adoption/s42a-op-root-operator-set.e2e-spec.ts:1-95`
  (header doc), `:107-123` (run-scoped namespace), `:234-254`
  (`resetBootstrapState`/`deleteSuiteUsers`, "`acm1r-fr-foundation`'s reset,
  verbatim"), `:330-337` (`postRelationship` helper), `:161-230`
  (`Provisioning` shape + `requireProvisioning()` two-red-states pattern) — the
  hybrid-harness pattern (real bootstrap subprocess → boot Nest → drive HTTP)
  this spec's positive-fact suite reuses, per the binding 2026-09-06 ruling
  recorded in `spec-4-2a`'s Verification ("the Stage-2 implementer MUST
  replicate whatever isolation/restoration `acm1r-fr-foundation.e2e-spec.ts`
  already uses ... and must NOT invent a new scheme").

### Where the §2.4 half has nowhere to write — confirmed directly

- `prisma/schema.prisma` — searched in full for any model resembling a
  full-profile-access grant. **None exists.** The only traces anywhere in the
  schema are the `AccessJournalKind` enum values `full_profile_grant` /
  `full_profile_revoke` (`:93-94`) — journal *labels* for an event that has no
  table to originate from.
- `docs/architecture/access-control.md:334-345` — § "Full-profile access
  overlay (§2.4)" states the shape (first holder seeded at deployment, only an
  existing holder may grant, last-holder protection, journaled) but the
  resolved note at `:345` is explicit: *"AD-28 full-profile-access scenarios
  are not yet authored ... Authoring requires an AD-1 Stage-1 dispatch ... do
  not invent scenarios."*
- `_bmad-output/implementation-artifacts/access-control/deferred-work.md:24-25`
  — the standing deferred-work entry: *"Full-profile access overlay — §2.4
  separate grant with seeded first holder, grant/revoke journaling, and
  last-holder protection ... blocked on product decision ... Implementing now
  would hard-code an undecided rule."* This is the blocker `4.2c-overlay`
  inherits (Boundaries).

## Tasks & Acceptance

**Execution — three separately-approved AD-1 stages. No dispatch spans two.**
Nothing below has been executed; this is the plan.

- [ ] **AD-1 stage 1 — scenario docs only.**
  - Author, under a new folder `docs/test-cases/access-control-kernel/tree-root-seed/`
    (Ask First AF-1): `s42b-tr-01-bootstrap-writes-no-relationship-row.md` — a
    fresh `db:seed && db:bootstrap:access-control` leaves `relationships`
    empty.
  - Author, under `docs/test-cases/user-management/access-control-adoption/`
    (continuing the `s42a-op-*` precedent): `s42b-tr-02-root-resolves-reporting-write-two-levels-down.md`,
    `s42b-tr-03-root-has-no-upward-edge.md`,
    `s42b-tr-04-unrelated-and-colleague-reach-into-root-unchanged.md`
    (regression lock — nothing about reaching *into* root moved).
  - Resolve Ask First **AF-1** (folder/prefix), **AF-3** (one file vs. the
    split pair) as part of this stage.
  - **STOP for human approval — write no test file and no source file in this
    dispatch.**
- [ ] **AD-1 stage 2 — e2e, written and run against UNCHANGED source.**
  - `test/access-control/s42b-tr-bootstrap-writes-no-relationship.e2e-spec.ts`
    — subprocess-only, `acm1r-fr-foundation.e2e-spec.ts` shape. Runs
    `db:seed` + `db:bootstrap:access-control`, asserts `countOf('relationships')
    === 0` and the root row's own `direct`/`people_partner` count is `0`.
  - `test/user-management/access-control-adoption/s42b-tr-tree-root-seed.e2e-spec.ts`
    — hybrid harness, `s42a-op-root-operator-set.e2e-spec.ts` shape. Provisions
    through the real bootstrap subprocess, boots Nest, imports two employees,
    wires `E2 → E1 → root` over two real `POST` calls, then drives
    `PATCH`/`GET /users/E2` and `GET /users/<root>/relationships`.
  - **Declare explicitly at this gate: both suites are expected to pass
    immediately against unmodified source.** This is a regression lock over an
    already-correct property, not a red-to-green story — say so, do not let a
    reviewer go looking for a red state that cannot exist (see Boundaries &
    Constraints, Always).
  - **STOP for human approval — write no non-test file in this dispatch.**
- [ ] **AD-1 stage 3 — implementation, expected to be empty or near-empty.**
  - Per this spec's own investigation, **no production code is required** for
    either the negative fact (already true) or the positive fact (already
    provable through unmodified code). The only candidate edits are:
  - *(conditional on Ask First AF-2)* `access-control-bootstrap.ts` — one
    dated comment near the top, no behavioural change, recording why the
    tree-root half is absent from this script.
  - *(conditional on Ask First AF-2)* `prisma/seed.ts` — one dated comment at
    the root-creation site, no behavioural change, same reasoning.
  - If AF-2 is declined, this stage has **zero** source diff, and the
    increment closes exactly as scope item 1 did — by test authorship and a
    recorded finding, not by a code change.
  - Run the Verification set below and record real results, replacing the
    plan with the outcome.

**Acceptance Criteria:**

- **Given** a freshly migrated, empty database, **when**
  `npm run db:seed && npm run db:bootstrap:access-control` runs, **then** the
  `relationships` table has **0** rows, and root's own count of `direct` /
  `people_partner` rows (`userId` = root's id) is **0**.
- **Given** root provisioned only by the production bootstrap, **when** it
  imports two employees (`E1`, `E2`) and issues `POST /users/E1/relationships
  {type:'direct', targetId: root}` then `POST /users/E2/relationships
  {type:'direct', targetId: E1}`, **then** both calls return `201`, and
  `relationships` holds exactly those two new rows — **not** a third row for
  root.
- **Given** that two-level chain, **when** root calls `PATCH /users/E2` with a
  valid identity field, **then** the response is `200`, the change persists,
  and a follow-up `GET /users/E2` returns the new value with `canEdit: true` —
  proving the Recorded Decision's "transitively" clause through the unmodified
  CTE.
- **Given** the same state, **when** root calls `GET /users/<root>/relationships`,
  **then** the response is `200` with `data: []` — root's own upward walk is
  empty, over the real endpoint, not inferred from a raw query alone.
- **Given** the same state, **when** `E1` (an ordinary employee with no FR
  grant) calls `PATCH /users/<root>` or `GET /users/<root>`, **then** the
  response is unchanged from today — `403` / `canEdit:false` — proving nothing
  about reaching *into* root moved.
- **Given** `grep -in "relationship"` over `access-control-bootstrap.ts`,
  `prisma/seed.ts`, and `scripts/dev-grant-root.ts`, **when** run before Stage
  3's optional comments, **then** zero matches; **when** run after them (if
  approved), **then** matches occur only inside a comment block, never in
  executable code.
- **Given** the full `test/access-control` and `test/user-management` e2e sets
  and the unit suite, **when** run after this change, **then** every suite's
  pass/fail counts are identical to the pre-change baseline except for the two
  new suites, both green in full.
- **Given** `git diff --stat` over `src/access-control/infrastructure/prisma-relationship-graph.adapter.ts`
  and `scripts/dev-grant-root.ts`, **when** taken after this change, **then**
  both are empty.
- **Given** `git status --porcelain -- prisma/migrations/`, **when** taken
  after this change, **then** it is empty — no migration.

## Design Notes

### Why root needs zero new `Relationship` rows — the structural argument

`Relationship` is a per-subject fact table: a row says "I (`userId`) report to
them (`reportsToUserId`)." "Root sits at the top of the tree" is not a fact
about root — it is the absence of a fact about root, combined with the
ordinary presence of facts about everyone else. Concretely:

1. **At bootstrap time, there is nobody to write a row for.** `spec-4-2a`'s
   Design Notes already established this for the instant right after
   `db:seed`: root is the only `User`, so "seat root at the top of the tree at
   bootstrap" cannot mean writing an edge FROM anyone else, because no one else
   exists yet.
2. **This spec extends that finding past bootstrap time, to the whole
   lifecycle.** Population import (`import-population.ts`) writes `User` and
   `Department` rows, never `Relationship` rows (Code Map). The org-relationship
   write route (`assign-manager.action.ts`) is the only code that ever creates
   a `direct` edge, and it runs on demand, per HR-admin action, long after
   bootstrap — never as part of any seed or deploy step. So the tree-root fact
   is never "seeded" at any single moment; it accretes, edge by edge, as an
   ordinary administrative consequence of onboarding people into a reporting
   structure that happens to terminate at root.
3. **Root becomes the terminus for free, the moment anyone's chain reaches it,
   because the CTE's termination condition is exactly "no further edge."**
   `prisma-relationship-graph.adapter.ts:76-82`'s own comment states
   termination is "the absence of a further USABLE manager edge." Root having
   zero rows is not a case the query has to special-case — it is the *normal*
   way any chain ends. The same mechanism that correctly stops a walk at any
   ordinary top-level manager (someone with no `direct` row) stops it at root,
   with identical code.
4. **The one row that must never exist is root's own outbound edge** —
   `Relationship { userId: root.id, type: 'direct', ... }`. Nothing in the
   schema forbids creating one (Code Map — the shape/self-endpoint checks say
   nothing about *which* user may be a subject), and nothing in
   `assign-manager.action.ts` special-cases root. **This is a real, accepted
   gap**, not a defect this spec closes: an admin holding
   `org:relationships:write` could technically assign root a manager today,
   and nothing stops them. The only safety net is incidental — if that
   assignment ever produces a cycle that loops back through root, the existing
   `NOT c.repeated` guard (already proven by `acm3-ii-06`) denies Reporting for
   the targets caught in it, exactly as it would for any other cycle. Adding
   an explicit guard against assigning root a manager would be new production
   behaviour, not a verification, and is therefore Never-listed here — flagged
   in Boundaries as a residual risk for a future increment to pick up if it
   ever matters in practice.

**Conclusion, stated as plainly as the PM's brief asked for:** this increment
needs **zero new `Relationship` rows**. The entirety of "seat root at the tree
root" that remains to be delivered is proof that the property holds — which is
what Tasks & Acceptance specs.

### Why a new e2e is still warranted, not just a documentation pass

It would be tempting to close this purely by citation, the way the argument
above is written. That would under-deliver relative to the story's Recorded
Decision, which makes a specific, testable claim: root gets `reporting` write
"over everyone, transitively." **No suite in this repository exercises that
claim today.** Searched deliberately:

- `s42a-op-03` Test 2 wires an ordinary employee pair (`S → M`); root is the
  *actor* performing the write, never the *terminus* anyone's chain resolves
  to.
- `s42a-op-04` proves the deliberately opposite case — root has **no**
  relationship-derived reach over an **unrelated** person, because nothing
  points at it. That test would still pass, unchanged, in a universe where the
  upward-walk CTE had a latent bug that broke multi-level ascent specifically
  when the terminus carries zero rows (an edge case exactly root's position
  creates) — it never builds a chain long enough to exercise ascent past one
  hop, let alone a chain that terminates at a zero-row node.
- No fixture anywhere in `test/access-control` or `test/user-management`
  builds a **two-level** `direct` chain and resolves audience from its top.

So the Recorded Decision's central write-side claim is, at HEAD `4ce8bd8`,
asserted in four planning documents and proven in zero test suites. That is
the actual gap this spec closes — not a code gap, an evidence gap, exactly
parallel to how scope item 1 turned out to need a grep table rather than a
deletion.

### Why this is `4.2b`, and why that diverges from the story's own Sequencing text

The parent story's Sequencing section (as currently written) names:

> 2. **4.2b** — §2.4 first-holder = root at seed (AC / seed increment).
> 3. **4.2c** — ~~override deletion~~ `db:dev:seed-org` spine (UM increment).

That is, the story text assigns the letter **`4.2b` to the §2.4 grant**, not
to the tree-root edge this spec covers. This spec claims `4.2b` for the
tree-root edge instead, on the same grounds `spec-4-2a` claimed its own letter
for a different scope item than the story originally named: alphabetical order
tracks *execution* order, and this letter reassignment is being made explicit
here rather than silently, exactly as `spec-4-2a`'s own "Why this is 4.2a"
section did for scope item 2. The resulting letter map, as this spec leaves
it:

| Letter | Content | Status |
|---|---|---|
| `4.2a` | Root-operator permission set (scope item 2) | **Done** (this spec's baseline commit) |
| `4.2b` | Tree-root edge only (scope item 3, half) — **this spec** | Spec'd, not built |
| `4.2c` | `db:dev:seed-org` dev spine (scope item 5) | Unbuilt, per the story's own text |
| `4.2c-overlay` | §2.4 full-profile-access first holder (scope item 3, other half) | **New, unstarted** — named here, not built |

This is a real naming collision the story file has not resolved: it still
calls `4.2b` the §2.4 grant. `epic-4-context.md:41` also still says
"4.2b (§2.4 first-holder seeding)." **Reconciling the story's own Sequencing
text and `epic-4-context.md` with this table is a follow-up PM/PO pass** —
this spec does not perform it, per the instruction to modify nothing but its
own file (Boundaries).

### The `4.2c-overlay` increment — named, not built

Scope item 3's other half — "records it as the §2.4 full-profile-access first
holder" — is a real, separate increment with a real, separate blocker:

- **What it needs before any spec can be written:** an architect-owned
  Stage-1 data-model decision for how "holds full-profile access" is
  represented — a table, a policy-type extension, a column on `User`, or
  something else. `access-control.md:345` is explicit that inventing this
  without that pass is out of bounds ("do not invent scenarios").
- **Analogous precedent for how that blocker gets cleared:** exactly the way
  the resolver blocker on this same story was cleared —
  `solution-design-upward-walk-resolver.md` (2026-09-05) is an architect
  solution-design pass that investigated a scope item's premise before any
  code or test was written, and its verdict (NO CODE CHANGE REQUIRED) is what
  unblocked scope item 4. `4.2c-overlay` needs the equivalent pass for the
  §2.4 data model — most likely concluding *with* a schema change (unlike the
  resolver precedent), since no representation exists to reuse.
- **What it must not collide with, once it exists:** `ACM1-FB-06`'s
  `countOf('Policies') === 1` invariant (`acm1r-fr-foundation.e2e-spec.ts:445`)
  — flagged by `spec-4-2a`'s own Design Notes as the exact assertion a
  `Policies`-row-shaped overlay grant would break, and repeated here because it
  is the single most likely way a rushed Stage-3 dispatch on `4.2c-overlay`
  would reintroduce a defect this epic already knows about.

### The ACM-9 `seeded-two-level` question — explicitly not folded in

The solution-design doc recommends folding the story's still-open sequencing
question 1 (whether an evidence-only "4.2a" survives, or its ACM-9
`seeded-two-level` measurement folds into "4.2b") into *the increment that
creates the tree-root edge*, on the reasoning that "the measurement belongs to
the change that alters the data." This spec's own finding removes the premise:
**no increment named `4.2b` creates a tree-root edge** — there is no edge to
create, only a chain-of-custody of other people's edges to prove resolves
correctly. Whether the `seeded-two-level` ACM-9 run therefore belongs to this
spec, to a revived evidence-only "4.2a"-adjacent increment, or to
`db:dev:seed-org` (scope item 5, the actual future producer of a
`seeded-two-level` shape in a dev DB) is **not decided here** — see Ask First
AF-4. Folding it in without a PO decision would widen this spec's frozen
Intent by a full published-artifact deliverable, which is exactly the kind of
scope creep the `<frozen-after-approval>` marker exists to prevent.

## Verification

**PLAN — no command below has been run.** The claims in Intent and Code Map
were established by reading files at `4ce8bd8`, not by executing the suite.

| Command | Expected |
|---|---|
| `npm run test:e2e -- s42b-tr-bootstrap-writes-no-relationship` | New suite, **green on first run** — no code change is required for this to pass |
| `npm run test:e2e -- s42b-tr-tree-root-seed` | New suite, **green on first run** — same reasoning |
| `npm run test:e2e -- test/access-control` | Counts identical to the pre-change baseline plus the one new suite, fully green |
| `npm run test:e2e -- test/user-management` | Counts identical to the pre-change baseline plus the one new suite, fully green |
| `npm run test` (unit) | Counts unchanged |
| `npm run build` | Clean |
| `npm run lint` | Error count unchanged against the pre-change baseline |
| `git diff --stat -- src/access-control/infrastructure/prisma-relationship-graph.adapter.ts` | Empty |
| `git diff --stat -- scripts/dev-grant-root.ts` | Empty |
| `git status --porcelain -- prisma/migrations/` | Empty — no migration |
| `grep -in "relationship" src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts prisma/seed.ts` | Zero matches before Stage 3's optional comments (AF-2); if approved, matches only inside a comment, never in executable code |

Use `git grep` or `grep -arn`/`grep -in` deliberately, never plain `grep -r` —
`spec-4-1d`'s and `spec-4-2a`'s Verification sections both record that a
NUL-carrying file in this tree is skipped as binary by plain `grep -r`, which
let two live hits escape an earlier oracle.

**ACM-9 pin — the reasoning, stated in advance rather than discovered at
Stage 3.** If Ask First AF-2 is declined, this increment touches **no** file
under `src/access-control/**`, and the pinned ACM-9 baseline is untouched by
construction. If AF-2 is accepted, the one edit under that path
(`access-control-bootstrap.ts`) is a comment addition with no executable
change — `prisma-relationship-graph.adapter.ts` and
`audience-resolver.service.ts` stay byte-identical either way, and this spec
creates no `Relationship` row in any production path, so no measured shape
moves. The `seeded-two-level` ACM-9 evidence itself is explicitly not this
spec's deliverable (Design Notes, Ask First AF-4).

## Boundaries

What this increment deliberately leaves standing, and who takes it:

| Left in place / not built | Why | Owner |
|---|---|---|
| The §2.4 full-profile-access overlay — no schema, no port, no adapter, no scenarios | `access-control.md:345` forbids inventing scenarios; no storage representation exists to seed a first holder into | **New increment: `4.2c-overlay` (named here, unstarted, blocked)** |
| `4.2c-overlay`'s blocker | An architect Stage-1 data-model decision for how "holds full-profile access" is represented, analogous to the 2026-09-05 `solution-design-upward-walk-resolver.md` pass that cleared this story's resolver blocker | **architect solution-design pass, not started** |
| `db:dev:seed-org` — does not exist | Scope item 5, its own increment; the real future producer of a `seeded-two-level` shape in a dev/demo DB | **Story 4.2 scope item 5 / existing `4.2c`** |
| `prisma-relationship-graph.adapter.ts` | Confirmed correct 2026-09-05; this spec creates no `Relationship` row and changes no query — nothing here is invalidated | **unchanged, no owner needed** |
| A guard preventing an admin from assigning root a manager | New behaviour beyond "verify and lock"; today's only safety net is the CTE's incidental cycle-detection | **flagged, not scheduled — pick up only if it is ever observed in practice** |
| ACM-9 `seeded-two-level` measurement (story's open sequencing question 1) | Explicitly **not** folded into this spec — this spec creates no tree-root edge, removing the premise behind the solution-design's own fold-in recommendation | **story-level "Open for decision," unresolved (Ask First AF-4)** |
| Depth-499 headroom and the `Department.parentId` index (story's open sequencing questions 3-4) | Unrelated to this spec's subject; this spec writes no migration and moves no measurement | **architect / PO, parked upstream** |
| The story's own Sequencing section, still naming "`4.2b` — §2.4 first-holder = root at seed"; `epic-4-context.md:41`'s matching text | This spec's letter re-use diverges from that text (Design Notes, "Why this is `4.2b`"); a human pass must reconcile both documents with the letter map this spec establishes | **PM/PO, follow-up edit — not performed here** ("modify nothing else — not the story") |
| The two documentation-only comments in `access-control-bootstrap.ts` / `prisma/seed.ts` | Conditional on Ask First AF-2; if declined, this increment's Stage 3 has zero source diff | **PO ruling, Stage-1 gate** |
