---
title: 'Solution design — upward-walk reporting resolution (PLAT-E4-S4.2, scope item 4 / sub-slice 4.2a)'
type: 'solution-design'
created: '2026-09-05'
status: 'for-review'
author: 'architect pass, requested by story-4-2-default-org-relationship-seed.md `blocked_on`'
baseline_commit: 'e0b1a53 (services/backend HEAD, branch dn-section-access), workspace da1b222'
verdict: 'NO CODE CHANGE REQUIRED — the upward walk is already in production code; 4.2a re-scopes to evidence + documentation close-out'
context:
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md'
  - '{project-root}/_bmad-output/implementation-artifacts/access-control/spec-acm-9-baseline-500-target-postgresql-baseline-gate.md'
---

# Solution design — upward-walk reporting resolution

## 0. Headline finding (read this first)

**Story 4.2's scope item 4 is built on a premise that is no longer true.** The
story says (`story-4-2-default-org-relationship-seed.md:89-96`):

> `resolveAudiences` currently expands every descendant of the viewer, then
> filters to the requested targets

That was true of the **first** implementation of the reporting CTE. It stopped
being true on **2026-08-30**, in commit `f36d1b2` ("feat(access-control): return
all audiences per target; walk up from targets"), which is an ancestor of
`services/backend` HEAD (`e0b1a53`) and was squashed into the merged
`c1b34c2` ("ACF-1: Phase-0 access-control audience resolution + P6 PostgreSQL
measurement (#3)"). Verified with `git merge-base --is-ancestor f36d1b2 HEAD`.

The `f36d1b2` diff is unambiguous — it replaces

```sql
-- BEFORE (descendant expansion)
WITH RECURSIVE reports AS (
  SELECT r."userId" AS id FROM "relationships" r ... WHERE r."reportsToUserId" = ${viewerId}
  UNION
  SELECT r."userId" FROM "relationships" r JOIN reports p ON p."id" = r."reportsToUserId" ...
)
SELECT id FROM reports WHERE id IN (${ids})
```

with a chain that is **seeded from the requested targets** and ascends. The
shape in HEAD today
(`services/backend/src/access-control/infrastructure/prisma-relationship-graph.adapter.ts:88-120`)
seeds the recursion at `r."userId" IN (${ids})` (line 98) and joins the
recursive term on `r."userId" = c.node_id` (line 106) — i.e. each requested
target walks **up** its own `direct` chain. Two later commits hardened it
(`3b1880c` statement timeout, `9cda644` + `5bdbc75` path-carrying cycle
semantics), all ancestors of HEAD.

**Therefore the deliverable this document was asked to design already exists in
production code.** The rest of this document (a) proves that against real code,
(b) states what the current shape's real cost curve is and what story 4.2
actually does to it, (c) records the audience-equivalence enumeration the
request asked for, and (d) re-scopes 4.2a from a code increment to an
**evidence + documentation close-out** increment, with the three AD-1 stages
still separable.

**Stale artifacts that must be corrected** (this is now the substantive work):

| Artifact | Line | Stale claim |
| --- | --- | --- |
| `_bmad-output/implementation-artifacts/access-control/deferred-work.md` | 103-104 | "The reporting walk descends from the viewer… The recursive CTE expands every descendant of the viewer and only then filters `WHERE id IN (targets)`." |
| `_bmad-output/implementation-artifacts/platform/epic-4-context.md` | 33 | "`resolveAudiences` currently expands every descendant of the viewer then filters to requested targets… It is switched to walk upward" |
| `_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md` | 89-96, 141-144 | scope item 4 and its acceptance criterion, both written against the descendant shape |
| `services/backend/prisma/schema.prisma` | 304 | "The resolver's hot path filters type + endpoint, in that column order" — annotates `@@index([reportsToUserId, type])`. Since `f36d1b2` the reporting hot path filters `(userId, type)` and is served by `@@index([userId, type])` (line 303). `[reportsToUserId, type]` now serves the **PP** query only (adapter:124-131). |

---

## 1. Current shape, against real code

### 1.1 The resolver

`services/backend/src/access-control/domain/services/audience-resolver.service.ts:26-106`
(`AudienceResolverService.resolve`, reached from
`application/access-control.facade.ts:40-45` as `resolveAudiences`):

1. `:37-39` — empty `employeeIds` short-circuits before any I/O.
2. `:41` — `targets = [...new Set(employeeIds)]` dedupes.
3. `:47-50` — **one** identity lookup covering the viewer and every target
   (`PrismaIdentityAdapter.findActiveUserIds`,
   `infrastructure/prisma-identity.adapter.ts:23-26`, a single
   `user.findMany({ where: { id: { in: … }, isActive: true } })`).
4. `:56-61` — an unconfirmed viewer returns an empty `Set` per id, with **no**
   graph read.
5. `:66` — `others` excludes the viewer's own id (Self is exclusive and never
   reaches the graph) and any unconfirmed target.
6. `:68-71` — **one** call to `RelationshipGraphPort.loadAudienceFacts(viewerId,
   others)`.
7. `:75-103` — pure in-memory label assembly: `self` (`:87`), `reporting`
   (`:92-94`), `pp` (`:95-97`), `colleague` as the floor when nothing else
   applies (`:98-101`).

There is exactly **one** graph round trip per `resolveAudiences` call, for any
number of targets. No per-target loop reaches the database.

### 1.2 The graph adapter — the query pattern

`services/backend/src/access-control/infrastructure/prisma-relationship-graph.adapter.ts:15-142`:

- `:19-21` — empty target list returns without a query.
- `:37-136` — one **interactive** `$transaction` at `RepeatableRead`
  (`:135`), so the reporting and PP graphs cannot be torn apart by a concurrent
  org change (the `:28-36` comment records that the array form of
  `$transaction` silently drops `isolationLevel` on this driver adapter).
- `:56` — `SET LOCAL statement_timeout = '2s'` inside that transaction.
- `:88-120` — the reporting recursive CTE. **Upward.** Detail:
  - base term `:91-98`: one row per requested target that has a `direct` row,
    where **both** the target (`t."isActive"`, `:95`) and its manager
    (`e."isActive"`, `:96`) are active. `path` is initialised to
    `ARRAY[target, manager]` (`:92`), `repeated := FALSE` (`:93`).
  - recursive term `:100-109`: `JOIN "relationships" r ON r."userId" =
    c.node_id AND r."type" = 'direct'` — ascend one level; append to `path`;
    set `repeated` when the new node is already `= ANY(c.path)` (`:103`);
    `WHERE NOT c.repeated` (`:109`) stops the walk at the first closure.
  - projection `:111-119`: `SELECT DISTINCT c.target_id WHERE c.node_id =
    ${viewerId} AND NOT EXISTS (… b.target_id = c.target_id AND b.repeated)`.
- `:124-131` — the PP query. Non-recursive by design (`:122-123`): it resolves
  the assigned `people_partner` endpoint and stops.

### 1.3 Where the old descendant expansion lived — and does not any more

It lived in the base term of the same CTE: `WHERE r."reportsToUserId" =
${viewerId}` with a `SELECT id FROM reports WHERE id IN (${ids})` tail. Both are
gone from HEAD. `grep -n 'reportsToUserId' prisma-relationship-graph.adapter.ts`
returns exactly two hits: `:103` (the cycle test inside the path array) and
`:129` (the PP endpoint predicate). Neither is a descent.

### 1.4 Indexes and constraints actually present

`services/backend/prisma/migrations/20260830010000_access_control_relationships/migration.sql`:

| Object | Line | Serves |
| --- | --- | --- |
| `relationships_userId_type_idx` on `("userId","type")` | 27 | the reporting CTE's base term (`:98`) and recursive term (`:106-107`) — **the current hot path** |
| `relationships_reportsToUserId_type_idx` on `("reportsToUserId","type")` | 28 | the PP query (`:128-129`). Formerly the descendant walk's index. |
| `relationships_one_direct_per_user` UNIQUE `(userId) WHERE type='direct'` | 33-35 | at most one manager edge per person → each target walks **one** path, not a tree |
| `relationships_one_people_partner_per_user` UNIQUE | 37-39 | one PP per person |
| `relationships_shape_check` CHECK | 44-49 | `direct`/`people_partner` rows must carry a non-null `reportsToUserId` |
| `relationships_no_self_endpoint_check` CHECK | 51-53 | forbids `reportsToUserId = userId` — i.e. forbids only the **length-1** cycle |
| `relationships_reportsToUserId_fkey` … `ON DELETE RESTRICT` | 34-35 (schema.prisma:300) | no dangling endpoint can exist |

`Department` (`schema.prisma:157-173`) carries `parentId` with a self-relation
and `@@unique([externalId, name])`, but **no index on `parentId`**.
`DepartmentMembership` (`schema.prisma:175-189`) has `@@index([userId])`,
`@@index([departmentId])`, and a raw partial unique `(userId, departmentId)
WHERE validTo IS NULL`. Nothing in `src/access-control/` reads either table
today — recorded here because §6 needs their real shape.

---

## 2. Target shape

The target shape **is the shape in HEAD**. Reproduced here as the normative
sketch so the design has something reviewable, and annotated with the two
properties the request asked to be named.

```ts
// prisma-relationship-graph.adapter.ts — reporting branch, as shipped
const reporting = await tx.$queryRaw<IdRow[]>`
  WITH RECURSIVE chain AS (
    -- one seed row per REQUESTED TARGET (not per descendant of the viewer)
    SELECT r."userId"                             AS target_id,
           r."reportsToUserId"                    AS node_id,
           ARRAY[r."userId", r."reportsToUserId"] AS path,
           FALSE                                  AS repeated
      FROM "relationships" r
      JOIN "users" t ON t."id" = r."userId"          AND t."isActive" = TRUE
      JOIN "users" e ON e."id" = r."reportsToUserId" AND e."isActive" = TRUE
     WHERE r."type" = 'direct'::"RelationshipType"
       AND r."userId" IN (${ids})                       -- <- batching happens HERE
    UNION ALL
    SELECT c.target_id,
           r."reportsToUserId",
           c.path || r."reportsToUserId",
           r."reportsToUserId" = ANY(c.path)            -- <- cycle detector
      FROM chain c
      JOIN "relationships" r ON r."userId" = c.node_id
                            AND r."type"   = 'direct'::"RelationshipType"
      JOIN "users" e ON e."id" = r."reportsToUserId" AND e."isActive" = TRUE
     WHERE NOT c.repeated                               -- <- the halting rule
  )
  SELECT DISTINCT c.target_id AS id
    FROM chain c
   WHERE c.node_id = ${viewerId}
     AND NOT EXISTS (SELECT 1 FROM chain b
                      WHERE b.target_id = c.target_id AND b.repeated)
`;
```

### 2.1 How the reporting audience is derived per target

Per target `T`: walk `T → manager(T) → manager(manager(T)) → …` over
`type='direct'` rows only. `T` gets `reporting` **iff** the viewer appears
somewhere on that walk **and** the walk terminates without repeating a node.
Reaching the viewer is deliberately *provisional* — see §5.

### 2.2 The bound, named

**The bound is `depth(T)` — the number of `direct` edges between `T` and the
top of its chain — and it is structural, not a constant.** Total recursion work
for one call is `Σ_{T ∈ targets} depth(T)`, i.e. **request size × chain depth**.
It is independent of:

- the size of the organisation (nothing outside the targets' own ancestor sets
  is ever visited);
- the viewer's position in the tree (the viewer appears only as an equality
  predicate in the final projection, `:113`);
- the viewer's subtree size — the quantity the descendant shape was bounded by.

Three mechanisms make that bound real rather than hoped-for:

1. `relationships_one_direct_per_user` (migration:33-35) — one manager edge per
   person, so each target's walk is a **path**, never a fan-out. Without this
   partial unique the "depth" bound would be a tree-size bound.
2. `NOT c.repeated` (`:109`) — a chain that closes on itself stops at the first
   repeat, so `depth(T) ≤ |users|` even on malformed data.
3. `SET LOCAL statement_timeout = '2s'` (`:56`) — a ceiling on the statement,
   not a performance target (`:39-54` records the reasoning and the measurement
   behind it).

### 2.3 Recommendation: do NOT add an explicit numeric depth bound

Story 4.2 says "bounded by chain depth". If that is read as "add a `WHERE
array_length(c.path,1) <= N`", **reject it.** A numeric bound would silently
deny `reporting` to a legitimate manager who happens to sit at depth `N+1` —
that is an **audience-narrowing policy change**, not a performance refactor, and
would need its own product approval, its own scenario docs and its own line in
`docs/architecture/access-control.md`. The structural bound in §2.2 already
delivers the property the story wants ("bounded by reporting-chain depth, not by
org size") with no policy content at all.

---

## 3. Behavioural equivalence

Because no code change is proposed, equivalence against **today's** behaviour is
trivially total. The enumeration below is the audit the request asked for,
performed against the descendant shape the story believes is in place, so the
record is complete either way.

| Audience | Where decided | Descendant shape | Upward shape (HEAD) | Changed? |
| --- | --- | --- | --- | --- |
| `self` | resolver `:84-88`, never reaches the graph (`:66` excludes the viewer's id from `others`; port doc `relationship-graph.port.ts:16-18` states the invariant) | identical | identical | **No** |
| `colleague` | resolver `:98-101`, pure floor — "confirmed active target with no stronger audience" | identical | identical | **No** — it is derived from the *absence* of the other labels, so it moves only if `reporting`/`pp` move |
| `pp` | adapter `:124-131`, non-recursive `people_partner` endpoint lookup | untouched by `f36d1b2` | untouched | **No** |
| `reporting` | adapter `:88-120` | "is `T` in the set of nodes reachable **downward** from the viewer over active `direct` edges?" | "does the viewer lie on `T`'s **upward** `direct` chain, which terminates cleanly?" | **See below** |

**`reporting` — reachability equivalence.** Over a graph where every `direct`
edge is a single-valued function `userId → reportsToUserId` (guaranteed by
`relationships_one_direct_per_user`), "viewer is an ancestor of `T`" and "`T` is
a descendant of the viewer" are the *same relation traversed in opposite
directions*. The fail-closed inactive-node rule composes identically: the
descendant walk excluded an inactive node from `reports`, so nothing above it
could bridge; the upward walk's `JOIN "users" e … e."isActive" = TRUE`
(`:96`, `:108`) produces no row for an inactive manager, so the walk terminates
there. Both cases are the same "unusable edge is treated as absent" rule that
`docs/architecture/access-control.md:381` states normatively. `f36d1b2`'s commit
message claims equivalence "verified via deliberate breaks (ACF-FC-01/02)"; I
have **not** re-derived that claim from a test run — treat it as *asserted by
the original author, unverified here*.

**One behaviour genuinely did change after `f36d1b2`, and it was approved
separately.** The cycle semantics landed in `9cda644` + `5bdbc75`: reaching the
viewer is provisional, and a repeat **anywhere** in `T`'s walked chain — before
or after the viewer is proven — denies `reporting` for `T` alone. That rule is
now normative in `docs/architecture/access-control.md:383-395` and is covered by
scenario docs `docs/test-cases/access-control-kernel/inactive-identity/acm3-ii-06`,
`-07`, `-08`, `-12` and by
`services/backend/test/access-control/acm3-cycle-acyclicity.e2e-spec.ts` and
`acm3-path-local-visited-state.e2e-spec.ts`. **It is not part of 4.2a and must
not be reopened by it.**

**Verdict: audience-preserving. Nothing in 4.2a changes any of the four
audiences.**

---

## 4. Multi-target batching

Already solved, and worth stating precisely because the story's framing implies
otherwise.

- **N targets produce 1 query, not N walks.** All requested ids enter the
  recursion through the base term's `r."userId" IN (${ids})` (`:98`,
  parameterised via `Prisma.join(targetIds)` at `:23`). One recursive CTE
  computes every target's chain in one pass, then one projection reads them all
  out. This is exactly the "one round trip per graph — or one combined query
  plan — resolves all requested targets" rule in
  `docs/architecture/access-control.md:387`.
- **Shared ancestors are not shared work, by design.** Each target carries its
  own `path` array, so two targets under the same manager each re-walk that
  manager's chain. `UNION ALL` is deliberate (`:66-74`): `UNION`'s set
  deduplication would *halt* the recursion but not *deny* it, which is exactly
  the reachability answer the cycle rule replaces. Duplicate ancestor work is
  the price of per-target cycle attribution, and it is priced into the ACM-9
  numbers in §6.
- **No production caller passes more than one target today.** Verified by grep
  over `services/backend/src`: every call site
  (`user-management/infrastructure/access-control-facade.adapter.ts:52`,
  `access-journal-access-facade.adapter.ts:35`,
  `career-timeline-access-facade.adapter.ts:40`,
  `org-relationships-read-access-facade.adapter.ts:36`, and
  `application/access-control.facade.ts:78` inside `resolveSectionAccess`)
  passes a one-element array. `list-users.action.ts` (33 lines) does not consult
  access control at all. **The 500-target bulk path is exercised only by the
  ACM-9 measurement harness.** The directory-list path the story anticipates is
  not wired yet — when it is wired, it must call `resolveAudiences` **once with
  the whole page**, not once per row, and that is the moment to add an
  N+1 regression assertion.

---

## 5. Cycles

The schema still permits reporting-line cycles: `relationships_no_self_endpoint_check`
(migration:51-53) forbids only `A → A`; `relationships_one_direct_per_user`
(migration:33-35) happily allows `A → B → A`. The adapter comment at
`:41-46` names this "pathological data the schema still permits". Nothing in
this design changes that — the mitigations already in HEAD are:

1. **Per-target path array + `repeated` flag** (`:92`, `:103`). Visited state is
   *path-local by construction*, so a shared ancestor across two targets is
   never mistaken for a repeat (`:73-74`; scenario `acm3-ii-12`).
2. **`WHERE NOT c.repeated`** (`:109`) halts the recursion at the first closure.
   Combined with the one-manager unique index, each target contributes at most
   `|users| + 1` rows even on a fully cyclic graph.
3. **Deny, not merely halt** (`:111-119`). The `NOT EXISTS … b.repeated`
   anti-join drops the whole target if *any* row of its walk repeated. This is
   the rule that makes a viewer *inside* a cycle denied rather than proven by
   it.
4. **`SET LOCAL statement_timeout = '2s'`** (`:56`) as the outer safety net. The
   comment at `:47-50` records the measurement that motivated it: with the
   guard a cyclic graph fails a run in 3 s; without it the suite ran 10 minutes
   and left backends spinning after Jest was killed (the connection default is
   `statement_timeout = 0`). A timeout surfaces as a **thrown error**, never as
   an empty map, so a degraded resolution cannot be read as "no audience
   applies" (`:52-53`).

**Note the interaction with §2.3.** Mitigation (3) is precisely why an
early-exit optimisation (`AND c.node_id <> ${viewerId}` in the recursive term,
to stop the walk the moment the viewer is found) is **not** available: the
cycle rule requires the whole chain to be walked to termination before
`reporting` may be granted. Any future proposal to short-circuit the walk at the
viewer is a **policy change** to the provisional-proof rule
(`access-control.md:383-390`), not an optimisation. Say so out loud if it comes
back.

---

## 6. Out of scope — department tree and project line

Per `story-4-2-default-org-relationship-seed.md:116-118`, the walk here is the
pure `reports-to` chain only. Recording the attach points so the next increment
does not have to re-derive them:

- **Department-management branch.** `docs/architecture/access-control.md:269`
  maps it to the **Reporting** audience column, resolved from
  `Policies targetType:'department'` over nested department membership. Attach
  point: a second recursive CTE alongside `chain`, inside the **same**
  `$transaction` at adapter `:37-136` (the no-torn-reads rule at
  `access-control.md:396` requires it), seeded from each target's live
  `department_membership` rows (`validTo IS NULL`), ascending
  `department."parentId"`, then anti-joined against the viewer's
  `targetType='department'` policy attachments; its result unions into
  `reportingTargets` at the projection (`:111-119`). **Schema gap to flag now:**
  `Department` has no index on `parentId` (`schema.prisma:157-173`) — that walk
  will need one, and it is a migration, so it belongs in that increment's plan
  from the start.
- **Project-line branch.** `access-control.md:256`/`269` and PM/AD-27: ordinary
  `type='project'` membership grants nothing; only an explicit PM/DM
  `Policies` grant does. Non-recursive, so it attaches in the shape of the PP
  query (`:124-131`), plus a new `projectTargets` field on `AudienceFacts`
  (`domain/interfaces/relationship-graph.port.ts:7-12`), a new `'project'`
  member of `Audience` (`domain/audience.ts:9`) and a new column in
  `SECTION_ACCESS_MATRIX` (`domain/constants/section-access-matrix.ts`).
- **PP's own HR line above.** `access-control.md:256`/`269` describe the PP
  audience as "assigned PP **+ the assigned PP's `direct` HR line above**", while
  the adapter resolves the assigned endpoint and stops (`:122-123`). This is
  **not** a divergence: `access-control.md:275` explicitly gates the transitive
  half — "transitive propagation above that PP must stop until the approved
  Department model identifies the HR boundary. Never walk an unrestricted
  reports-to chain and call it 'inside HR' (AD-19)." The implementation matches
  the gating rule. It becomes live in the same increment as the department
  branch, because it depends on the same Department model.

---

## 7. Performance argument

### 7.1 The evidence that already exists, and what it actually measures

`_bmad-output/test-artifacts/performance/acm9-final-acm9-1788173458416-ff94a3e685d1.json`
(protocol `ACM9-MVP-v1`, status **PASS**, 500 targets, 5 warm-ups, 20 samples,
nearest-rank percentiles, `source_revision f89e034`).

**`prisma-relationship-graph.adapter.ts` is byte-identical between `f89e034`
and HEAD** — `git diff f89e034 HEAD --stat -- src/access-control/` lists 11
changed files and the graph adapter is not among them. So the PASS artifact
measures **exactly the SQL running today**. It is not evidence for a
descendant walk that no longer exists.

Reporting gate, warm p50 / p95 / worst (ms), computed from the artifact's raw
samples:

| Shape | Depth | p50 | p95 | worst |
| --- | ---: | ---: | ---: | ---: |
| balanced | 5 | 11.110 | 11.603 | 12.357 |
| acyclic chain | 25 | 23.335 | 25.934 | 26.661 |
| acyclic chain | 50 | 40.787 | 41.849 | 43.550 |
| acyclic chain | 100 | 66.060 | 67.545 | 68.425 |
| acyclic chain | 200 | 159.444 | 161.408 | 163.734 |
| acyclic chain | 300 | 368.173 | 380.682 | 381.815 |
| acyclic chain | 400 | 703.838 | 713.524 | 713.772 |
| **acyclic chain** | **499** | **1250.437** | **1346.253** | **1369.427** |

The `direct_pp`, `colleague` and `mixed` gates track the same depth curve
(499-deep: 921.502 / 892.453 / 1015.560 ms p95) because `loadAudienceFacts`
always runs **both** queries — the depth cost in every gate is the reporting
CTE.

**Read the curve honestly.** It is super-linear in depth: 4× the depth from 100
to 400 costs ~10.6× the time. That is the `UNION ALL` + per-row `path` array
growth (each row at depth *d* carries a *d*-element array, so the CTE
materialises `O(Σ depth²)` bytes) plus the `NOT EXISTS` anti-join over the
materialised CTE. It is **not** an org-size term — the ACM-9 fixture has exactly
500 users in every shape, so depth is the only variable moving.

### 7.2 What story 4.2 actually does to the budget

The seed change (`story-4-2-*.md:98-111`) builds a **two-level** spine: every
active department member → their department lead → root. So after 4.2:

- Max reporting-chain depth on a seeded dev DB is **2**.
- Today, `prisma/seed.ts` (184 lines) creates **no** `Relationship` rows at all
  — grep confirms zero matches. So the reporting CTE's base term currently
  returns zero rows on a freshly seeded database and the recursion is free.
- After 4.2, `Σ depth(T)` over a 500-person directory page is ≈ **1000** CTE
  rows. The nearest measured shape is `balanced / depth 5` at **11.603 ms p95**,
  and depth 2 is strictly cheaper than depth 5. The seed's effect on the §7
  budget is **negligible** and comfortably inside 2 s.
- Root-at-the-top adds exactly **one** ancestor per target (+500 CTE rows for a
  500-target request) and changes the *result cardinality* for a root viewer
  from ~0 to 500 rows. Neither is a recursion-cost term.
- The **worst case stays depth-499**, because `org:relationships:write` lets an
  operator build any chain the schema permits; the seed is not the only writer.
  That worst case is already measured at 1346 ms p95 against a 2000 ms budget —
  **1.49× headroom, not 10×.**

### 7.3 What must be re-measured, and what must not be claimed

**No speedup may be claimed for 4.2a, because 4.2a changes no query.** The
honest statement is: *the resolver already had the property; story 4.2's seed
does not consume a meaningful share of the budget.*

`epic-4-context.md` states the standing rule: *"Any change under
`services/backend/src/access-control/**` invalidates the pinned ACM-9
performance baseline."* Under the re-scoped 4.2a there is **no** change under
that path, so strictly the pin survives. The measurement that is genuinely
missing is the one for the shape story 4.2 introduces:

**Required new evidence** — one ACM-9 run (`ACM9-MVP-v1`, `--role final`,
500 targets, 5 warm-ups, 20 samples, nearest-rank p50/p95, warm p95 **and**
worst ≤ 2000 ms) over a **`seeded-two-level` fixture shape**: 500 active users,
one root, ~10 department leads reporting to root, remaining members reporting to
their lead, root as viewer, all 500 as targets. The gates to run are `reporting`
and `mixed`. Expected: comfortably below the existing `balanced / depth 5`
numbers. Publish as a new append-only artifact under
`_bmad-output/test-artifacts/performance/`; do not overwrite an existing one
(ACM-9 spec, `spec-acm-9-*.md:28`).

**Two things that must NOT be folded into this:**

1. Reducing the depth-499 cost. It is inside budget; touching the query to make
   it faster reopens the cycle semantics and needs its own increment.
2. Timeout headroom. The adapter's `statement_timeout = '2s'` (`:56`) equals the
   outer §7 budget exactly, and the P6 probe found the outer budget firing
   first at 2001.103 ms with PostgreSQL cancellation arriving at 2006.536 ms
   (`p6-resolve-audiences-postgresql.md`, "Timeout probe"). That is already a
   distinct deferred-work item ("Add database timeout headroom below the outer
   two-second request budget…", `deferred-work.md`) and stays there.

---

## 8. Proposed AD-1 staging for 4.2a (re-scoped)

Three separable stages, one dispatch each, human approval between every pair
(`feedback_ad1_gate_enforcement`; `epic-4-context.md`: "no dispatch spans two
stages"). The increment is now **evidence + documentation**, not code.

### Stage 1 — scenario docs

**Location:** `docs/test-cases/access-control-kernel/reporting-walk-bounds/`,
a new sibling of `inactive-identity/` and `multi-audience/`, following the
`README.md` authoring pattern and the scoped headless-facade variant in
`docs/architecture/testing-strategy.md`. Proposed slugs (stable workboard ids,
never renumbered):

| Id | Scenario |
| --- | --- |
| `acm10-rw-01-walk-is-seeded-from-targets.md` | A viewer with a large subtree, resolving **one** target that is not in that subtree, touches only that target's ancestors — the org-size-independence claim, asserted through the facade's observable result plus a query-plan/row-count check, not through timing. |
| `acm10-rw-02-cost-independent-of-viewer-position.md` | Root viewer and a leaf viewer resolving the same target set produce the same recursion volume; only the result set differs. |
| `acm10-rw-03-two-level-seeded-spine-root-viewer.md` | The post-4.2 shape: root resolves `reporting` over every active member of a two-level spine, in one round trip. |
| `acm10-rw-04-shared-ancestor-is-not-shared-denial.md` | Two targets under one lead each carry their own path; a cycle above one of them denies that one only (regression lock over `UNION ALL` + path-locality — overlaps `acm3-ii-12` deliberately, from the bulk side). |
| `acm10-rw-05-single-round-trip-for-bulk.md` | `resolveAudiences(viewer, [500 ids])` issues exactly two graph statements inside one transaction, regardless of target count — the N+1 lock for the future directory-list path. |

Stage 1 also carries the **documentation corrections** listed in §0, since they
are prose, not code: `deferred-work.md:102-104` (close the entry as
*already resolved by `f36d1b2`*, keeping the historical evidence text but
marking it superseded), `epic-4-context.md:33`, the story file's scope item 4
and its acceptance criterion, and `schema.prisma:304`'s stale index comment
(comment-only, but it touches `services/backend` — call it out explicitly at
approval so it is a conscious decision, not a slipped edit).

**Stop for approval.**

### Stage 2 — red E2E + measurement harness shape

- `services/backend/test/access-control/acm10-reporting-walk-bounds.e2e-spec.ts`
  — the Stage-1 scenarios over the real facade, real module, real Prisma,
  migrated PostgreSQL. `ACM10-RW-01`/`-02`/`-05` are the interesting ones: they
  assert **structure** (statement count, rows visited) rather than latency, so
  they are deterministic. Expect `-05` to pass immediately (the behaviour is
  already correct) — that is fine and must be **declared** at approval, not
  hidden; a scenario whose point is "lock the property that already holds" is a
  regression lock, and calling it "red" would be false.
- The `seeded-two-level` fixture shape added to the ACM-9 harness
  (`services/backend/test/measurement/acm9/`), red against the current harness
  because the shape does not exist yet.

**Stop for approval.**

### Stage 3 — execution

- Add the `seeded-two-level` fixture to the ACM-9 harness; commit the harness;
  run `npm run measure:access-control:acm9 -- --role final` against migrated
  PostgreSQL; commit exactly the generated append-only artifact.
- **No change under `services/backend/src/access-control/**`** beyond the
  `schema.prisma:304` comment, if Stage 1 approved it.
- Close `deferred-work.md`'s "reporting walk descends from the viewer" entry
  against the new evidence artifact.

---

## 9. Open questions for the architect / PO

1. **Does 4.2a still exist?** If the PO accepts §0, 4.2a stops being a resolver
   change. Two options: (a) keep it as the evidence + close-out increment
   described in §8; (b) delete 4.2a and fold the ACM-9 `seeded-two-level` run
   into 4.2b's acceptance, since 4.2b is the increment that actually creates the
   tree-root edge. **My recommendation: (b)** — the measurement belongs to the
   change that alters the data, and (a) risks manufacturing an increment to
   justify a ticket. This document unblocks the `blocked_on` line either way.
2. **How did the stale premise reach three artifacts?** `deferred-work.md`
   recorded the finding on 2026-08-30; `f36d1b2` fixed it the same day, inside
   an unmerged PR branch; the entry was never revisited, and it was then copied
   forward into `epic-4-context.md:33` and the story file on 2026-09-04. Worth a
   process note: a deferred-work entry needs a re-verification step against HEAD
   before it is promoted into a story, not just a `status:` line.
3. **Explicit depth bound — confirm rejection.** §2.3 recommends against it on
   the grounds that it is audience-narrowing. Needs a PO "yes, agreed" so it
   does not reappear as a performance suggestion in review.
4. **Directory-list adoption.** No production caller passes more than one target
   today (§4). When `GET /users` starts returning `canEdit` per row, is that a
   single bulk `resolveAudiences` for the page? Confirm, and let `ACM10-RW-05`
   be the lock.
5. **Depth-499 headroom.** 1346 ms p95 against 2000 ms is 1.49×, on an
   18-core M5 Pro with a local PostgreSQL. Is that acceptable margin for the
   deployment target, or does the `statement_timeout` headroom deferred item
   need pulling forward? Not 4.2's problem, but 4.2 is the story that makes deep
   chains reachable in a seeded environment.
6. **`Department.parentId` index.** Flagged in §6 as a migration the
   department-branch increment will need. Should it be pre-landed with 4.2's
   seed work, or held until the branch it serves? Adding an unused index has the
   same "no speculative schema" smell as an unused column
   (`feedback_no_speculative_fields`) — **recommend holding it.**
