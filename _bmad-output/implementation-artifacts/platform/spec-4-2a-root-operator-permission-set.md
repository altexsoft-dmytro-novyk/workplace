---
title: 'PLAT-E4-S4.2a — Root-operator permission set: wire the ACM-1 entrypoint + grow the canonical hr-admin grant'
type: 'feature'
created: '2026-09-06'
status: 'ready-for-dev'
review_loop_iteration: 0
baseline_commit: 'ef03c88df6b72ec86d39fb3f7de9979f270be72e' # services/backend HEAD, branch dn-section-access, working tree clean
story: '{project-root}/_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md'
scope_items: 'Story 4.2 scope item 2 ONLY. Items 3 and 5 are out; item 1 is already closed by verification; item 4 is evidence-only and parked.'
context:
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/docs/architecture/database-schema.md'
  - '{project-root}/_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/spec-4-1c-require-section-access-gate.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/spec-4-1d-gate-cleanup.md'
  - '{project-root}/_bmad-output/implementation-artifacts/access-control/solution-design-upward-walk-resolver.md'
  - '{project-root}/_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

> **Renegotiated 2026-09-06 — PO ruling AF-2 (Dmytro Novyk).** The canonical set
> is **six** keys, not five: `profile:timeline:write` is included. The frozen
> prose below has been reconciled with that ruling in place; superseded reasoning
> is struck through and annotated rather than deleted. The **Ask First** table
> and the **Recorded consequence of AF-2** blockquote are the authoritative
> record and are untouched.

## Intent

**Problem — two defects, one increment.**

1. **The production root-operator path is under-provisioned.** The ACM-1 canonical
   set is exactly three keys (`access-control-bootstrap.ts:22-35`:
   `user-management:create`, `user-management:deactivate`, `user-management:list`).
   Two permission keys that live route gates check every day are absent from it:
   `org:relationships:write` (eight `@RequireFeature` declarations across
   `relationships.controller.ts` and `departments.controller.ts`, plus an in-action
   check) and `employee:departure:record` (four declarations in
   `departures.controller.ts`). A fresh production deployment therefore comes up
   with a root who can list, import and deactivate — and cannot wire a single
   manager edge or record a single departure. **PO ruling AF-2 (2026-09-06) adds
   a third absent key to what this increment seeds — `profile:timeline:write`;
   see the Ask First table and its Recorded-consequence note.** That is the exact gap the PO
   accepted `scripts/dev-grant-root.ts` as a **dev and production stopgap** for
   (decision, Dmytro 2026-09-04; SCP §4 "`NODE_ENV=production` guard reverted").
2. **The ACM-1 production entrypoint is not wired at all.** Every artifact in this
   repo — `access-control-bootstrap.ts:5`, `bootstrap-access-control.ts:3`,
   `import-population.ts:4`, all 28 `fr-bootstrap` scenario docs, and the ACM-1
   invariant suite itself — names `npm run db:bootstrap:access-control` as the
   deploy step. **`package.json` has no such script** (verified at
   `ef03c88`: `:11-38` lists `db:deploy`, `db:seed`, `db:dev:grant-root`,
   `create:root`, `db:import:population`, and no bootstrap alias). Consequence:
   `test/access-control/acm1r-fr-foundation.e2e-spec.ts` — the suite this
   increment must amend — is **red at HEAD in its entirety**, and red for a
   reason that has nothing to do with its subject. Its own first test
   (`:321-331`) exists precisely to make that state unambiguous, and
   `spec-4-1d-gate-cleanup.md` § "Known pre-existing failures" already records
   the suite as a standing pre-existing failure.

**Approach.** Wire the missing npm alias, then grow the canonical set from three
keys to **six** — adding `org:relationships:write`, `employee:departure:record`
and `profile:timeline:write` (**PO ruling AF-2, 2026-09-06**, which overrode this
spec's own recommendation to exclude the third) and nothing else — and amend, in
one deliberate AD-1 pass, every artifact that asserts "exactly three": the ACM-1
invariant suite's ~26 numeric assertions, and the `fr-bootstrap` scenario docs
and folder READMEs that name the count — **eighteen** scenario docs plus two
READMEs, not the six named when this spec was drafted (see **Code Map § Scenario
docs** and **Verification § Stage-1 outcome**). The ratified architecture text at
`database-schema.md:368-375` and `:454-457` is **not** amended here: **AF-4 as
resolved** routes all four architect-owned records to a separate architect pass,
and Stage 1 correctly left them untouched. The FR policy
shape, the adoption rules, the drift dispositions, the advisory lock, the
singleton and the attachment rules are all untouched: this changes the **size of
the canonical set**, nothing about how the bootstrap behaves around it.

~~Every added key is a **feature** key with a named live consumer. No key that
reads or writes a person's profile section enters the set — `DEFAULT_PERMISSIONS`
(4.1a) already carries the per-person section-write half for every active
employee, and a functional role must never widen data access
(`access-control.md:19`, `project-requirements.md:100`, both NORMATIVE).~~

**Superseded 2026-09-06 by PO ruling AF-2 — retained above as the record of this
spec's original position.** Every added key still has a named live consumer, and
two of the three added keys (`org:relationships:write`,
`employee:departure:record`) are feature keys. The third,
`profile:timeline:write`, **is** a key that writes a person's profile section,
and it enters the set deliberately by dated ruling. The NORMATIVE text cited
above is not withdrawn — it is precisely what makes this a **known, accepted
deviation**, recorded in the *Recorded consequence of AF-2* blockquote below and
asserted by the Stage-1 scenario `s42a-op-06`.

**Why this increment goes first** — the story's Sequencing predates the item-1
closure and the item-4 correction, and no increment in it carries scope item 2 at
all. Full argument in **Design Notes § Why this is 4.2a**; the short form is that
items 3 and 5 are both blocked behind it, and this is the only increment of the
four whose red test genuinely exists.

## Boundaries & Constraints

**Always:**

- **A key enters the canonical set only with a named live consumer** — a
  `@RequireFeature(...)` declaration or an in-code `isAllowed(...)` call site,
  cited by `file:line` in the Code Map. This is `feedback_no_speculative_fields`
  applied to authorization rows: a granted permission with no gate reading it is
  a speculative grant, and a speculative grant in an authorization table is worse
  than a speculative column.
- **The set grows; nothing about the bootstrap's behaviour changes.** The FR row
  shape (`operator '=='`, `managedBy 'admin'`, null target), `assertCanonicalPolicyShape`
  (`:187-206`), `locateRoot` (`:102-160`), the advisory lock (`:76-93`), the
  singleton drift rules (`:293-342`), the pre-commit revalidation (`:373-385`),
  and the "restore missing, preserve extra" disposition of `ensurePermissions`
  (`:209-229`) / `ensureGrants` (`:231-246`) are all untouched.
- **Idempotence and adoption stay intact.** A rerun over a database bootstrapped
  before this change must add the three new permissions and their three grants
  and change nothing else — no id rewritten, no description overwritten, no
  attachment moved. This is `ensurePermissions`' existing behaviour and must be
  proven, not assumed (ACM1-FB-05, ACM1R-FB-26 P2).
- **The delegated-HR-Admin invariant is the acceptance test, not a footnote.**
  After this change, a person holding `hr-admin` with no relationship to a target
  must still get `403` on `PATCH /users/:id` and `canEdit: false` on
  `GET /users/:id`. None of the six keys appears in `SECTION_ACCESS_MATRIX`
  (`profile:identity`, `profile:leave`, `profile:projects` — verified at
  `section-access-matrix.ts:22-43`) or in `DEFAULT_PERMISSIONS`, and none is
  consulted by `hasSectionAccess` (`access-control-facade.adapter.ts:63-81`), so
  the identity-card answer is unmoved. **Narrowed by PO ruling AF-2,
  2026-09-06:** ~~the five keys are feature keys~~ — five of the six are feature
  keys, but `profile:timeline:write` is a data-write key whose gate
  (`canEditTimeline`, `career-timeline-access-facade.adapter.ts:74-75`) never
  reaches `hasSectionAccess` at all. The invariant therefore holds for every
  section **except** the career timeline, where the accepted deviation applies
  (`s42a-op-05` asserts the invariant; `s42a-op-06` asserts the exception).
- **`scripts/dev-grant-root.ts` stays, untouched and executable.** It is a
  load-bearing accepted production stopgap until the *whole* of scope items 2, 3
  and 5 lands. This increment closes the operator-set half of the gap; it does
  not close the tree-position half, so root still needs the stopgap for
  `canEdit` in a real deployment. Deleting the script, adding a `NODE_ENV` guard
  to it, or trimming its key bundle is Story 4.2's final increment, not this one.
- Follow AD-1: three separately-approved stages, no dispatch spanning two. Stage 2
  here is **not** degenerate — a real red is available and is specified below.
- The added keys must use the names the code checks today. Renaming to
  `directory:*` would silently break fifteen live decorator gates — see
  **Ask First AF-3**.

**Ask First — RESOLVED 2026-09-06. Execute the task list against these rulings.**

| # | Ruling | Decided by |
|---|---|---|
| **AF-1** | **Option (a)** — the `db:bootstrap:access-control` npm alias is in scope for 4.2a as Stage-3 task 1. Stage 2 must record the two red states separately: the precondition repair (suite cannot execute) and the discriminating red (canonical set lacks the operator keys). | John (PM), routine call |
| **AF-2** | **INCLUDE `profile:timeline:write` in the canonical `hr-admin` set.** Overrides this spec's recommendation to exclude. See the **Recorded consequence** note below — it must be carried into the Stage-1 doc amendment verbatim, not softened. | Dmytro Novyk (PO), 2026-09-06 |
| **AF-3** | **No `directory:*` rename here.** Seed the `user-management:*` names the live gates actually check. The catalog rename is a separate PO-confirmed change that must move constants, decorators, canonical set and seeded rows together. | Recommended option |
| **AF-4** | **Separate architect pass.** This increment changes code and seed data only. `database-schema.md`, `fr-architecture-amendment.md` and the kernel SPEC are NOT amended here and will contradict shipped behaviour until that pass runs. Record the contradiction as known and dated; do not quietly edit any of the four documents. | Dmytro Novyk (PO), 2026-09-06 |
| **AF-5** | **Leave `create:root` pointing at `dev-grant-root`.** Repointing is coupled to retiring that script, which is the last 4.2 increment. Conscious deferral, recorded in Boundaries. | Recommended option |
| **AF-6 / AF-7 / AF-8** | Remain parked upstream at story level. No task here depends on them. | Unchanged |

> ### Recorded consequence of AF-2 — carry this into Stage 1 verbatim
>
> `canEditTimeline` discards its target (`career-timeline-access-facade.adapter.ts`
> — `void targetUserId`, then `isAllowed(viewerId, TIMELINE_WRITE_PERMISSION)`
> alone). Granting `profile:timeline:write` to the canonical `hr-admin` role
> therefore gives **every present and future holder of that role org-wide write
> access to every employee's career timeline, with no relationship to the target
> required.**
>
> This is a functional role widening data access, which
> `docs/architecture/access-control.md:19` and `docs/project-requirements.md` §2
> mark NORMATIVE against. It is being seeded **deliberately**, by a dated PO
> ruling, with the trade-off understood: the alternative leaves the manual
> timeline-write route closed to everyone on a clean production install.
>
> It is therefore a **known, accepted deviation from a NORMATIVE invariant in
> permanent production configuration** — not an oversight, and not something a
> later reviewer should silently "fix". It stops being a deviation when
> `canEditTimeline` gains its audience half (the deferred DEC-UM-001 narrowing to
> assigned PP + direct Unit Manager), at which point this grant becomes
> legitimate. Stage 1 must record this in the amended scenario docs, and the
> deviation must be raised in the AF-4 architect pass and registered as a blocker
> entry there if that pass agrees.

**Original Ask First analysis, retained as the record:**

| # | Question | Recommendation |
|---|---|---|
| **AF-1** | **Is the one-line `db:bootstrap:access-control` npm alias in scope for 4.2a?** It is arguably ACM-1's own unfinished Stage 3 (the migration landed 2026-08-31; the alias never did). Without it this increment has no runnable oracle, because the suite it amends cannot execute. Options: **(a)** include it as Stage-3 task 1, with Stage 2 explicitly approving it as a *precondition repair* so the amended suite can produce a discriminating red; **(b)** land it as a separate ACM-1 close-out increment before 4.2a starts. | **(a)**. It is one line, it adds no behaviour (the script file has existed since 2026-09-04), and it is the entrypoint of the exact thing this increment amends. (b) manufactures an increment for a one-line alias. Under (a), Stage 2 must record **both** red states separately — see Tasks. |
| **AF-2** | **Does `profile:timeline:write` join the canonical set?** `dev-grant-root.ts:74-77` grants it today, so root has it under the accepted stopgap and would *lose* it under a pure production bootstrap. But it is a **data-write** key: `canEditTimeline` is `isAllowed(...)` **ALONE, no audience half** (`career-timeline-access.port.ts:29-42`, `career-timeline-access-facade.adapter.ts:60-75`), so granting it to `hr-admin` gives every delegated HR Admin write access into every employee's career timeline through a functional role. | **Exclude it.** That is the `access-control.md:19` violation this epic exists to remove, and re-seeding it in the canonical set would make it permanent production configuration rather than an interim. Consequence to accept explicitly: on a pure `db:seed && db:bootstrap:access-control` deployment, `profile:timeline:write` has **no holder** and the manual timeline-write route is closed to everyone — which is already true today. Consequence to record: `career-timeline-access.port.ts:34`'s claim "The only seeded holder is `hr-admin`" is **false against the canonical set** and always has been; it is true only after `dev-grant-root.ts` runs. Correcting that comment is a candidate Stage-1 doc fix. |
| **AF-3** | **Does the `directory:*` rename happen here?** The story's item 2 names `directory:import` / `directory:list` / `directory:deactivate` as candidates "per the FR-matrix rename". That rename exists only in `fr-permission-matrix-draft-2026-09-02.md` (`status: draft`, "Nothing here is confirmed"), and `access-control.md:11` is explicit: *do not hard-code defaults until PO confirmation is recorded*. The live code checks `user-management:*` (`users.controller.ts:58,64,65`). | **No.** Seed the names the gates actually check. A catalog rename is a separate, PO-confirmed change that must move the constants, the decorators, the canonical set and the append-only `Permissions` rows together; doing half of it inside a seed change produces a bootstrap that grants keys nothing reads. |
| **AF-4** | **Who amends the ratified architecture text?** `database-schema.md:368-375` ("contains exactly" the three keys) and `:454-457` ("exactly the three permission rows above … exactly its three `PolicyPermissions` grants") are architect-owned and are cited as *Trace* sources by six scenario docs. `fr-architecture-amendment.md:165` ("Exactly the three permission keys above") and `spec-access-control-kernel-mvp/SPEC.md:97` say the same. | Amend **`database-schema.md`** in Stage 1 as part of this increment, flagged for explicit architect sign-off at the Stage-1 gate (the story already calls item 2 "a deliberate AD-1 amendment to the ACM-1 canonical set"). Leave **`fr-architecture-amendment.md`** and the **SPEC** as dated records with a superseding pointer rather than a rewrite — the project's precedent for dated artifacts (`umac-10`, `spec-4-1c` § *umac-10 disposition*). Confirm both halves. |
| **AF-5** | **Does the increment keep `create:root` (`package.json:20`) pointing at `dev-grant-root`?** Once the alias exists, `npm run db:seed && npm run db:bootstrap:access-control` is the production path, and `create:root` is the dev shortcut that bypasses it. | **Leave `create:root` alone.** Repointing it is coupled to retiring `dev-grant-root.ts`, which is the last 4.2 increment. Flag it in **Boundaries** so it is a conscious deferral, not an oversight. |
| **AF-6** | **Story-level, unresolved upstream — carried here unchanged:** does an evidence-only "4.2a" survive at all, or does the ACM-9 `seeded-two-level` measurement fold into the increment that creates the tree-root edge? | Not decided here. This spec **claims the letter `a`** on sequencing grounds only (see Design Notes); if the PO chooses option (a) of the story's parked question 1, the evidence increment takes a later letter. The architect's recommendation is (b). No task in this spec depends on the answer. |
| **AF-7** | **Story-level, unresolved upstream — carried here unchanged:** is the depth-499 margin (1346 ms p95 against 2000 ms) acceptable for the real deployment target? | Not decided here, and **not touched by this increment** — 4.2a creates no `Relationship` row and changes no query, so it moves no measurement. Restated only so it is not lost between increments. |
| **AF-8** | **Story-level, unresolved upstream — carried here unchanged:** does `Department.parentId` get an index now or when the department branch lands? | Not decided here, and out of scope: this increment writes no migration. The architect recommends holding it (`feedback_no_speculative_fields`). |

**Never:**

- **Never add a section key to the canonical set.** `profile:identity:write`,
  `profile:leave:*`, `profile:projects:*`, `profile:personal-contacts:*`,
  `profile:emergency-contacts:*`, `profile:documents:*` — none of these belongs
  in an FR role. The identity-card write half is `DEFAULT_PERMISSIONS` (4.1a);
  the other three are read-only for the reporting-line audience by deliberate
  privacy design (§3.2: read-write for Self and PP only), and root does **not**
  get write access to them from anywhere. **`profile:timeline:write` is the one
  dated exception**: PO ruling AF-2, 2026-09-06 puts it in the canonical set.
  That is an exception granted by name, not a repeal of this rule — no other
  section key enters without its own dated ruling.
- **Never re-add `user-management:edit`.** 4.1c moved the route onto
  `@RequireSectionAccess('profile:identity','write')` and 4.1d deleted `canEditS1`
  whole; the key is inert. Seeding it into the canonical set would put a
  known-dead key into an append-only production catalog.
- **Never write a `Relationship` row, a `UserPolicy` row for anyone but root, or
  a §2.4 grant.** Those are scope item 3 and are a different increment with a
  different blocker set (see **Boundaries**).
- **Never touch `prisma/seed.ts`.** It creates the root `User` and deliberately
  assigns no functional role (`seed.ts:1-6`). That separation is ACM-0/ACM-1's
  contract.
- **Never touch `src/access-control/**` beyond nothing.** This increment changes
  `src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts` and
  that file only — which *is* under that path, so the epic's standing rule
  applies: see **Verification § ACM-9 pin**.
- **Never change an existing ACM-1 assertion's meaning.** Every edit in that suite
  is a cardinality update (3→6, 4→7) or the identifier list. If any *behavioural*
  assertion has to move, the change that forced it is out of scope and stops for
  a human.
- **Never make `dev-grant-root.ts` throw, guard, or shrink.** AF-2 of 4.1d already
  ruled its executable lines untouchable outside Story 4.2's own final increment.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fresh production bootstrap | Empty `Permissions`; one active normalized root `User` from `db:seed`; `npm run db:bootstrap:access-control` | Exit `0`. `Permissions` = **6** rows, keys exactly the canonical six. `Policies` = 1 FR `hr-admin`, no target. `PolicyPermissions` = **6**, all `policyType='FR'`. `UserPolicies` = 1, root. `AccessControlBootstrap` singleton recorded | Unchanged — every existing failure path keeps its exact diagnostic |
| Entrypoint is wired | `npm run db:bootstrap:access-control` | Resolves and runs `scripts/bootstrap-access-control.ts` | Nonzero exit on any bootstrap failure, as `bootstrap-access-control.ts:24-27` already does |
| Rerun over a **pre-change** database | DB bootstrapped at the 3-key set, then this change deployed and rerun | Exit `0`. The three new `Permissions` rows are created with fresh uuidv7 ids; three new grants inserted; the three pre-existing permission ids, the policy id, the attachment and the singleton are **byte-identical** to before | Unchanged |
| Rerun over an undrifted post-change database | Bootstrapped at 6, rerun | Exit `0`, nothing written, every id preserved (ACM1-FB-05) | Unchanged |
| Administrator's approved extra permission | A **seventh** key + grant added by an admin, then rerun | Preserved. `Permissions` = **7**, `PolicyPermissions` = **7** (ACM1R-FB-28, retargeted from 4 to 7; the scenario slug still says "fourth") | Unchanged |
| A canonical key renamed in place | One of the **six** renamed to `-v2`, then rerun | The canonical row is restored under a **new** id; the renamed row and its grant survive. `Permissions` = **7**, `PolicyPermissions` = **7** (ACM1R-FB-16, retargeted from 4 to 7) | Unchanged — no in-place key update is ever issued |
| Root operating a fresh deployment | Root signs in after `db:seed && db:bootstrap:access-control` | `GET /users` `200`; `POST /users/import` `200`; `DELETE /users/:id` `200`; **`POST`/`PATCH`/`DELETE` on `/relationships` and `/departments` `200`**; **departure routes `200`** — the last two are the new capability | `403` unchanged for anything outside the six keys |
| Root editing an unrelated identity card | Root, no `direct`/`people_partner` edge to T, `PATCH /users/<T>` | **`403`**, and `GET /users/<T>` returns `canEdit: false`. **Unchanged by this increment** — root's edit reach comes from tree position (scope item 3), not from any key here | `ForbiddenException` |
| Delegated HR Admin, no relationship | Holder of `hr-admin`, `PATCH /users/<T>` | **`403`**; `GET /users/<T>` → `canEdit: false`; `GET /users` → `200`. The NORMATIVE invariant, restated with a six-key role — every section **except** the career timeline, which is the AF-2 deviation in the row below | `ForbiddenException` |
| Delegated HR Admin, timeline write | Holder of `hr-admin`, `POST /users/:id/events` | ~~**`403`** under AF-2's recommendation — `profile:timeline:write` is not in the set.~~ **Reversed by PO ruling AF-2, 2026-09-06: the write SUCCEEDS (`201`).** `profile:timeline:write` is in the set and `canEditTimeline` discards its target (`void targetUserId`), so every holder writes every employee's timeline. Recorded as a known, accepted deviation — `s42a-op-06` | No exception raised; this is the deviation, not a bug |
| `dev-grant-root.ts` run against a post-change database | `npm run db:dev:grant-root` after the bootstrap | Still succeeds and still adds its extra keys (`user-management:edit`, `profile:timeline:write`) on top. The known ACM-1 drift-check conflict (`dev-grant-root.ts:16-22`) is **narrowed but not removed** — three of its seven keys coincide with canonical today; after this change **six** of them do, and only `user-management:edit` (inert since 4.1c) stays outside | Unchanged |
| Concurrent first runs | Two bootstraps racing on an empty DB | One coherent six-key set; the advisory lock is untouched (ACM1R-FB-25) | Unchanged diagnostics |

</frozen-after-approval>

## Code Map

Every line below was read at `services/backend` HEAD `ef03c88` on 2026-09-06,
working tree clean.

### The canonical set — the one production change

- `src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts:22-35`
  — `CANONICAL_PERMISSIONS`, three `{key, description}` entries. **This is the
  whole production edit: three entries appended** — `org:relationships:write`,
  `employee:departure:record` and `profile:timeline:write` (the third by PO
  ruling AF-2, 2026-09-06). Their descriptions follow the existing sentence form
  ("Create a user in User Management.").
- ...same file `:7-13` — the ownership comment: *"the three canonical permission
  keys … their three canonical grant pairs"*. Must be restated to the new count;
  the *rule* it states (ownership is a set of specific rows, everything else is
  preserved) is unchanged and is what makes this growth safe.
- ...same file `:209-229` `ensurePermissions` — iterates `CANONICAL_PERMISSIONS`,
  reuses an existing row by `key`, never rewrites an id or a description. **No
  edit.** This is why a rerun over a pre-change database adds exactly the three
  new rows.
- ...same file `:231-246` `ensureGrants` — `INSERT … ON CONFLICT DO NOTHING` per
  permission id. **No edit.**
- ...same file `:344-345` — the two call sites, in the one transaction. **No
  edit.**
- ...same file `:371-372` — comment *"a transaction that is about to grant it
  three permissions"*. Count correction only (three → six).
- ...same file `:18-19` `BOOTSTRAP_KEY = 'root-hr-admin'`, `FR_ROLE = 'hr-admin'`
  — **no edit**; the role identity does not change.

### The missing entrypoint — AF-1

- `package.json:11-38` — the `scripts` block. Present: `db:deploy` (`:16`),
  `db:seed` (`:18`), `db:dev:grant-root` (`:19`), `create:root` (`:20`),
  `db:import:population` (`:21`). **`db:bootstrap:access-control` is absent.**
  The alias to add mirrors `:19`/`:21`:
  `"db:bootstrap:access-control": "node --import tsx scripts/bootstrap-access-control.ts"`.
- `scripts/bootstrap-access-control.ts:1-27` — the wrapper the alias must invoke.
  Exists since 2026-09-04, imports `bootstrapAccessControl` +
  `createBootstrapPrismaClient`, sets `process.exitCode = 1` on failure. **No
  edit.**
- `prisma.config.ts:11` — `seed: 'tsx prisma/seed.ts'`. Confirms `db:seed`
  resolves (Prisma 7 moved seed config out of `package.json`), so `db:seed` is
  *not* part of this defect. Listed to bound the claim.
- Consumers that already name the missing alias, none of which needs an edit:
  `access-control-bootstrap.ts:5` · `bootstrap-access-control.ts:3,24` ·
  `dev-grant-root.ts:13,24` · `import-population.ts:4` ·
  `test/user-management/epic-1/fixtures.ts:19,49`.

### Live consumers of the three added keys — the "named consumer" evidence

`org:relationships:write` (9 sites):

- `src/user-management/application/controllers/relationships.controller.ts:46`
  (`ORG_RELATIONSHIPS_WRITE_FEATURE`), used at `:65,100,113,126,140,153`
- `src/user-management/application/controllers/departments.controller.ts:33`,
  used at `:47,59`
- `src/user-management/infrastructure/org-relationships-read-access-facade.adapter.ts:20,48`
  — an in-action `isAllowed` read gate, not a decorator

`employee:departure:record` (5 sites):

- `src/user-management/application/controllers/departures.controller.ts:38`
  (`RECORD_A_DEPARTURE_FEATURE`), used at `:52,68,83,96`

Already canonical, listed so the delta is exactly three:

- `user-management:create` — `users.controller.ts:58` (`IMPORT_POPULATION_FEATURE`),
  used at `:139`. **This is the population-import key** the story's item 2 names;
  it is already in the set, which is why the growth is +3 and not +6 (the
  story's five candidates, three of which are the existing keys under proposed
  `directory:*` names, plus AF-2's `profile:timeline:write`).
- `user-management:deactivate` — `users.controller.ts:64`, used at `:260`
- `user-management:list` — `users.controller.ts:65`, used at `:106`

~~Deliberately **not** added — AF-2:~~ **Added — the third key, by PO ruling
AF-2 (Dmytro Novyk, 2026-09-06).** The struck heading recorded this spec's own
recommendation to exclude; the ruling went the other way. The authoritative
statement of what the grant costs is the **Recorded consequence of AF-2**
blockquote in Ask First — read it, do not paraphrase it:

- `profile:timeline:write` — `career-timeline-access-facade.adapter.ts:22`
  (`TIMELINE_WRITE_PERMISSION`), consumed at `:57` (`canReadTimeline`'s
  "edit implies read" fallback) and `:75` (`canEditTimeline`, `isAllowed` ALONE,
  with `void targetUserId` at `:74`). Contract at
  `career-timeline-access.port.ts:29-42`. Two things follow from adding it:
  - Its `:34` claim *"The only seeded holder is `hr-admin`"* is false against
    the canonical set at HEAD and **becomes true of the shipped bootstrap** once
    this increment lands. It therefore needs no correction — it needs the dated
    note that the safety argument resting on it is circular (Design Notes).
  - It is the **only non-feature key in the set**. The canonical set can no
    longer be described as "purely a feature set", which is the property the
    original recommendation was protecting.

### The invariant suite this increment amends

`test/access-control/acm1r-fr-foundation.e2e-spec.ts` (1515 lines).

- `:34-38` — the header's "EXPECTED RED at this commit" note, written when
  neither the tables nor the alias existed. The tables landed in
  `prisma/migrations/20260831070000_access_control_functional_roles`; only the
  alias is still missing. **The note is stale and must be corrected**, or the
  next reader will conclude the whole suite is intentionally red.
- `:51-55` — `CANONICAL_KEYS`, the three-element literal the suite compares
  against. Grows to six.
- `:87-99` — `runSeed` / `runBootstrap`, which shell `npm run <script>`. This is
  why a missing alias fails **every** test that calls `runBootstrap`, not just
  the presence check: `npm run` on an undefined script exits nonzero, so each
  `expect(exitCode).toBe(0)` fails and each failure-path test matches npm's
  error text instead of the bootstrap's diagnostic.
- `:196` — `spawn('npm', ['run', 'db:bootstrap:access-control'])`, the FB-27
  mid-transaction-kill path. Same dependency.
- `:321-331` — `ACM-1 CAP-3 — production entrypoint is wired`. The one test whose
  failure at HEAD is the *root cause*; it reads `package.json` and asserts the
  key is present. **No edit** — it goes green when AF-1 lands.
- **Cardinality assertions, `3` → `6`** (22 sites):
  `:345` · `:386` (`toHaveLength`) · `:391` · `:432` · `:433` · `:446` · `:447` ·
  `:642` · `:643` · `:664` · `:789` · `:911` · `:990` · `:1142` · `:1143` ·
  `:1214` · `:1216` · `:1238` · `:1240` · `:1267` · `:1460` · `:1461`
- **Cardinality assertions, `4` → `7`** (4 sites): `:820`, `:833` (ACM1R-FB-16 —
  six canonical + one renamed) · `:1499`, `:1505` (ACM1R-FB-28 — six canonical
  + one administrator addition)
- **Unchanged counts, listed so they are not swept:** `:445`
  (`countOf('Policies')` = 1) · `:434`, `:1501` (`countOf('UserPolicies')`) ·
  `:790`, `:791` (`Policies` = 1, `AccessControlBootstrap` = 1) · `:1215`,
  `:1239`.
- **Test names and comments that state the count in prose** — all become
  **six**: `:334` *"seeds exactly the three canonical permission keys"* → six ·
  `:375` *"grants exactly the three seeded permissions to the role"* → six ·
  `:1468-1471` comment *"comparing its FULL grant set against the canonical
  three"* → six. `:1467` *"preserves an approved fourth permission"* is the one
  that does **not** simply take a new number: against a six-key set the
  administrator's row is a **seventh**. Keep the test name (it is the
  ACM1R-FB-28 workboard id) and add a dated note; the assertion values are the
  `4` → `7` pair above.
- **`CANONICAL_KEYS[0]` uses — no edit, they stay index-based:** `:619`, `:807`,
  `:811`, `:823`, `:1292`, `:1299`.

### Scenario docs — Stage 1 (executed 2026-09-06)

**Reconciled against what Stage 1 actually amended.** The six-file list this
section originally carried was an undercount: the canonical count is asserted in
Given/Then clauses, expected-state SQL and Trace quotations across most of the
folder, not only in the files whose title names it.
`docs/test-cases/access-control-kernel/fr-bootstrap/` held **28** files at
`ef03c88` and holds **30** after Stage 1.

**Amended — 18 `fr-bootstrap` scenario docs:**

`acm1-fb-01` · `acm1-fb-02` · `acm1-fb-03` · `acm1-fb-05` · `acm1-fb-06` ·
`acm1-fb-09` · `acm1r-fb-11` · `acm1r-fb-12` · `acm1r-fb-15` · `acm1r-fb-16` ·
`acm1r-fb-19` · `acm1r-fb-20` · `acm1r-fb-23` · `acm1r-fb-24` · `acm1r-fb-25` ·
`acm1r-fb-26` · `acm1r-fb-27` · `acm1r-fb-28`

Of these, `acm1-fb-01-three-canonical-permissions-seeded.md` carries the **full
amendment record** — the six keys with the live gate that reads each, the AF-2
ruling and its consequence, the AF-3 naming decision, and the AF-4 contradiction
— and every other amended file points at it rather than restating it.
`acm1r-fb-16` is the `4` → `7` immutability case;
`acm1r-fb-28-fourth-permission-and-admin-attachments-survive.md` is the other
`4` → `7` case, where the administrator's "fourth" permission is now a
**seventh**.

**Not amended — 10 files verified count-free:** `acm1-fb-04` · `acm1-fb-07` ·
`acm1-fb-08` · `acm1r-fb-10` · `acm1r-fb-13` · `acm1r-fb-14` · `acm1r-fb-17` ·
`acm1r-fb-18` · `acm1r-fb-21` · `acm1r-fb-22`

**Also amended — the two folder READMEs**, which is why the amended total is
**20**, not 18:

- `docs/test-cases/access-control-kernel/README.md`
- `docs/test-cases/user-management/access-control-adoption/README.md`

**New cases authored by Stage 1 — six:**

- `access-control-kernel/fr-bootstrap/s42a-op-01-bootstrap-entrypoint-npm-alias.md` (AF-1, the entrypoint)
- `access-control-kernel/fr-bootstrap/s42a-op-02-rerun-over-a-three-key-database-adds-only-the-new-rows.md`
- `user-management/access-control-adoption/s42a-op-03-root-operator-capability-after-production-bootstrap.md`
- `user-management/access-control-adoption/s42a-op-04-root-data-reach-unchanged-by-the-operator-set.md`
- `user-management/access-control-adoption/s42a-op-05-delegated-hr-admin-gets-no-data-access.md`
- `user-management/access-control-adoption/s42a-op-06-delegated-hr-admin-timeline-write-accepted-deviation.md`

Note that four of the six live under `user-management/access-control-adoption/`,
not under `fr-bootstrap/`: they are HTTP-level consequences of the grown role,
not bootstrap-database outcomes.

**Filename question — resolved as recommended.** Three filenames encode the
retired count (`…-three-canonical-permissions-seeded`,
`…-role-granted-exactly-three-permissions`, `…-fourth-permission-…`). Scenario
slugs are stable workboard ids and are never renumbered; Stage 1 kept all three
slugs and corrected the content with a dated note.

### Ratified architecture text — AF-4

**AF-4 as resolved (Dmytro Novyk, PO, 2026-09-06): none of the four documents
below is amended by this increment.** This increment changes code and seed data
only; the architect pass is separate. Until it runs, every record below states
"exactly three" and **contradicts shipped behaviour**. Stage 1 amended none of
them and instead recorded the contradiction, dated, in `acm1-fb-01`. Do not
quietly edit any of the four.

- `docs/architecture/database-schema.md:368-375` — *"**MVP reduction:** the
  deploy-time permission catalog … contains exactly:"* + the three keys.
- ...same file `:454-457` — *"exactly the three permission rows above, exactly
  one `hr-admin` FR policy, exactly its three `PolicyPermissions` grants…"*
- `_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md:165`
  — *"1. Exactly the three permission keys above."* (dated record)
- `_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md:97` — *"ACM-1
  ensures the three permissions, one FR policy, three grants, and one
  attachment."* (dated record)
- `docs/architecture/access-control.md:11` — *"do not hard-code defaults until
  that confirmation is recorded"*. The Stage-1 human approval **is** that
  recorded confirmation for these **three** keys, and the record must say so
  explicitly or this increment reads as a violation of `:11`. Stage 1 wrote that
  sentence into `acm1-fb-01`, naming each key with the gate that reads it.

### Untouched, verified live

- `scripts/dev-grant-root.ts:1-173` — the stopgap. `:48-77` `ROOT_PERMISSIONS`,
  seven keys: `user-management:create` (`:52`), `user-management:edit` (`:55`,
  inert since 4.1c, header `:38-47` records it), `user-management:list` (`:58`),
  `user-management:deactivate` (`:62`), `org:relationships:write` (`:66`),
  `employee:departure:record` (`:70`), `profile:timeline:write` (`:74`). After
  this increment, **six** of those seven are canonical and exactly one is not —
  `user-management:edit`, inert since 4.1c. **Zero edits in this increment** —
  including the header, which stays accurate.
- `prisma/seed.ts:1-184` — creates the root `User` (`:137-151`), assigns no FR
  (`:1-6`), and writes **no `Relationship` row anywhere in the file**. Confirms
  scope item 3 has nothing to build on at bootstrap time (see Design Notes).
- `src/access-control/domain/constants/default-permissions.ts:8-10` —
  `DEFAULT_PERMISSIONS = { 'profile:identity:write' }`. Untouched; it is the
  reason no section key belongs in the canonical set — a rule AF-2 overrides by
  name for `profile:timeline:write` only. `profile:timeline:write` is **not** in
  `DEFAULT_PERMISSIONS`, so the two grants do not overlap.
- `src/access-control/domain/constants/section-access-matrix.ts:22-43` — three
  sections, four audiences. Untouched; contains no FR key, which is the
  structural form of "a functional role never widens data access".
- `src/user-management/infrastructure/access-control-facade.adapter.ts:63-81`
  `hasSectionAccess` (audience-first) and `:85-95` `canEditIdentityCard`.
  Untouched; these decide `canEdit` and none of the six keys reaches them.
  **Note the scope of that claim after AF-2:** `profile:timeline:write` does not
  reach `hasSectionAccess` either, but only because its own gate
  (`career-timeline-access-facade.adapter.ts:74-75`) bypasses the audience layer
  entirely. `canEdit` on the identity card is unmoved; timeline write is not.
- `prisma/schema.prisma:340-357` `Policy`, `:359-369` `Permission`, `:371-388`
  `PolicyPermission`, `:390-402` `UserPolicy`, `:404-415` `AccessControlBootstrap`
  — **no migration, no schema change**. Appending three rows to an append-only
  catalog needs neither.
- `prisma/schema.prisma:292-313` `Relationship` — read to confirm the shape scope
  item 3 would need; untouched here.

## Tasks & Acceptance

**Execution** — three separately-approved AD-1 stages. No dispatch spans two.
**Stage 1 is complete (2026-09-06); Stages 2 and 3 have not been performed.**

- [x] **AD-1 stage 1 — decisions + scenario prose only. DONE 2026-09-06.**
      Human rulings on **AF-1 … AF-5** obtained and recorded dated and
      attributed in the Ask First table (AF-6/7/8 are story-level and stay
      parked); **AF-2 was decided by Dmytro Novyk, PO, and reversed this spec's
      recommendation** — the canonical set is six keys. Stage 1 then amended
      **eighteen** `fr-bootstrap` scenario docs and **two** folder READMEs (20
      files) to the six-key set and its counts, and authored **six** new cases
      `s42a-op-01`..`-06`. Per **AF-4 as resolved**,
      `docs/architecture/database-schema.md`, `fr-architecture-amendment.md:165`
      and `spec-access-control-kernel-mvp/SPEC.md:97` were **not** amended and
      **not** given superseding pointers — the architect pass owns all four, and
      the contradiction is recorded dated in `acm1-fb-01` instead. The
      `access-control.md:11` PO-confirmation sentence was written into
      `acm1-fb-01` for all **three** added keys, each naming its live consumer.
      Full inventory: **Code Map § Scenario docs** and **Verification §
      Stage-1 outcome**. One question is left open for the Stage-2 gate — the
      harness shape for `s42a-op-03` / `s42a-op-05`; see **Verification §
      Open item carried into the Stage-2 gate**.
- [ ] **AD-1 stage 2 — the red, in two distinct recordings.** This increment has
      a real red test; do not collapse the two states into one number.
      - **(2a) Pre-existing red, recorded verbatim and *excluded* from the
        oracle.** Run `npm run test:e2e -- acm1r-fr-foundation` against
        unmodified source at `ef03c88` and record the full result. Expected:
        the suite fails at `:321-331` and at every `runBootstrap` call, because
        `npm run db:bootstrap:access-control` does not exist. This is the ACM-1
        entrypoint defect, not this increment's subject.
      - **(2b) The discriminating red.** With AF-1 approved, add **only** the
        `package.json` alias, then amend the suite's assertions to the approved
        **six**-key set and rerun. Expected: the suite now *executes* — the
        entrypoint test at `:321-331` passes, every shape/lock/adoption/drift
        invariant passes, and the failures are exactly the cardinality and
        key-list assertions (`3 !== 6`, `4 !== 7`, and the `:344` key-list
        equality). Record which tests are red and the actual-vs-expected of each.
        That contrast — *everything about the bootstrap's behaviour is right and
        only the size of the canonical set is wrong* — is the oracle.
      **STOP for human approval — write no `src/` file in this dispatch.**
- [ ] **AD-1 stage 3 — the production change.**
      `src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`
      — append `org:relationships:write`, `employee:departure:record` **and
      `profile:timeline:write`** (AF-2) to `CANONICAL_PERMISSIONS` (`:22-35`)
      with descriptions in the existing form; correct the count three → **six**
      in the ownership comment (`:7-13`) and at `:371-372`.
- [ ] `package.json` — the `db:bootstrap:access-control` alias, if it was not
      already added under Stage 2b (AF-1).
- [ ] `test/access-control/acm1r-fr-foundation.e2e-spec.ts` — correct the stale
      "EXPECTED RED" header (`:34-38`) to state the true remaining precondition;
      confirm the assertion amendments from Stage 2b are complete and that the
      six prose/test-name sites (`:334`, `:375`, `:1467-1471`) read correctly.
- [ ] Run the **Verification** set and record real results in this file,
      replacing the plan with the outcome.
- [ ] Record in **Boundaries** what the increment deliberately did not close —
      specifically that root still has no `canEdit` reach and `dev-grant-root.ts`
      is still required.

**Acceptance Criteria:**

- **Given** a freshly migrated database with an empty `Permissions` table and one
  active normalized root `User` from `npm run db:seed`, **when**
  `npm run db:bootstrap:access-control` runs, **then** it exits `0` and
  `Permissions` holds exactly **six** rows whose keys are exactly the approved
  canonical six — no more, no fewer, no other key.
- **Given** the same run, **then** `PolicyPermissions` holds exactly **six** rows,
  every one `policyType='FR'` and pointing at the single `hr-admin` FR policy;
  `Policies` holds exactly one row; `UserPolicies` holds exactly one, the root's;
  and the `AccessControlBootstrap` singleton records that policy and root.
- **Given** a database bootstrapped at the **three**-key set before this change,
  **when** the new bootstrap runs against it, **then** it exits `0`, the **three**
  new permissions and their **three** grants appear, and the three pre-existing
  permission ids, the policy id, the root attachment and the singleton row are
  unchanged.
- **Given** a database already bootstrapped at the **six**-key set, **when** the
  bootstrap reruns, **then** nothing is written and every generated id is
  preserved (ACM1-FB-05, ACM1R-FB-26 P2).
- **Given** an administrator has added a **seventh** permission and granted it to
  `hr-admin`, **when** the bootstrap reruns, **then** `Permissions` = **7** and
  `PolicyPermissions` = **7** and the administrator's row survives (ACM1R-FB-28,
  whose slug still says "fourth").
- **Given** root on a deployment provisioned only by
  `db:seed && db:bootstrap:access-control` **and no dev script**, **when** root
  calls the relationship-write and departure-record routes, **then** they are
  `200` where they are `403` today. *(This is the capability the increment adds.)*
- **Given** the same root and an active target it has no `direct` or
  `people_partner` edge to, **when** root sends `PATCH /users/<T>`, **then**
  `403`, and `GET /users/<T>` returns `canEdit: false`. **The same answer as
  before this change** — this increment must not be able to move it.
- **Given** a delegated HR Admin holding the **six**-key `hr-admin` role with no
  relationship to a target, **when** they call `GET /users` and `POST /users/import`,
  **then** `200`; **when** they call `PATCH /users/<T>`, **then** `403`; **when**
  they call `GET /users/<T>`, **then** `200` with `canEdit: false`. The NORMATIVE
  invariant (`access-control.md:19`, `project-requirements.md:100`) restated for
  the grown role (`s42a-op-05`).
- **Given** that same delegated HR Admin, **when** they call
  `POST /users/<T>/events` and then delete an event, **then** both **succeed** —
  `canEditTimeline` discards its target and `profile:timeline:write` is now in
  the role. **This criterion asserts a deviation, deliberately** (PO ruling AF-2,
  2026-09-06; `s42a-op-06`). It is not a bug to be fixed by inverting the
  expectation: the increment that narrows `canEditTimeline` supersedes this
  criterion with a dated pointer.
- **Given** the full `test/access-control` and `test/user-management` e2e sets and
  the unit suite, **when** run after this change, **then** every suite outside
  `acm1r-fr-foundation` has pass/fail counts identical to the Stage-2 recording
  with no assertion edited, and `acm1r-fr-foundation` is **green in full for the
  first time** — including its entrypoint test at `:321-331`.
- **Given** `grep -arn "profile:identity:write\|user-management:edit"`
  over `src/access-control/infrastructure/bootstrap/`, **when** run after this
  change, **then** zero matches — no *unruled* data-access key and no dead key
  entered the canonical set. **Changed by PO ruling AF-2, 2026-09-06:**
  `profile:timeline:write` was the third alternative in this grep when the spec
  was drafted, and a zero-match oracle over it is now **wrong** — it must match
  **exactly once**, in `CANONICAL_PERMISSIONS`. Assert that separately:
  `grep -arnc "profile:timeline:write" src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`
  → `1`.
- **Given** `scripts/dev-grant-root.ts`, **when** `git diff` is taken over it,
  **then** zero lines changed.
- **Given** `prisma/migrations/`, **when** `git status` is taken, **then** no new
  migration directory exists.

## Design Notes

### Why this is 4.2a — the sequencing argument

The story's Sequencing proposes 4.2a (resolver, now dead), 4.2b (§2.4 first
holder + tree root), 4.2c (dev seed spine). **Scope item 2 has no letter in it at
all** — it is silently assumed inside "4.2b (AC / seed increment)". That is the
first reason to re-sequence: an unbuilt scope item with no increment is an
invitation to lose it. The second is that the ordering was written before item 1
closed and item 4 evaporated, and the remaining three items are not
interchangeable:

**Item 3 (§2.4 first holder + tree-root edge) cannot go first, on two independent
grounds.**

1. *The §2.4 half has nowhere to write.* There is **no storage representation of
   the full-profile-access overlay anywhere in the schema** — no column, no
   table, no policy type. The only traces are the `AccessJournal` enum values
   `full_profile_grant` / `full_profile_revoke` (`schema.prisma`, Epic-4 journal
   block) and five `INTERIM` comments deferring the `full` audience
   (`org-relationships-read-access-facade.adapter.ts:33`,
   `access-journal-access.port.ts:12-16`,
   `access-journal-access-facade.adapter.ts:30`,
   `org-relationships-read-access.port.ts:26`,
   `career-timeline-access-facade.adapter.ts:53-54`). And
   `access-control.md:345` is explicit: *"AD-28 full-profile-access scenarios are
   **not yet authored** — no scenario folder exists for them … do not invent
   scenarios. Authoring requires an AD-1 Stage-1 dispatch."* Seeding a "first
   holder" of a grant with no representation would mean inventing the
   representation, which is a deferred-work item ("Full-profile access overlay"),
   not this story's.
2. *The tree-root half is vacuous at bootstrap time.* `Relationship` rows are
   written **per subject** — `userId` reports to `reportsToUserId`
   (`schema.prisma:292-300`). Seating root "at the top of the `reports-to` tree"
   therefore means giving *every other user* an edge that ascends to root; root
   itself gets no row. On a fresh production DB immediately after `db:seed`,
   root is the **only** `User` (`seed.ts:137-151` creates exactly one, and the
   file writes no `Relationship` at all). There is nobody to point at root. The
   tree-root fact can only be established **after** the population import — which
   `import-population.ts:4` places *after* the bootstrap in the binding deploy
   order. **The story's phrasing "seats root at the top of the `reports-to` tree
   … at bootstrap" is not implementable as written**, and resolving that is
   item 3's own design question, not something to discover mid-dispatch.

**Item 5 (dev seed spine) cannot go first** because it is defined as *superseding*
`dev-grant-root.ts`, and `dev-grant-root.ts` is the accepted **production**
stopgap. Superseding it before the production bootstrap covers the operator set
would leave a production deployment with no way to provision an operable root —
the exact regression the 2026-09-04 decision to revert its `NODE_ENV` guard
existed to prevent. Item 5 is also dev-only, so it moves the production path not
at all.

**Item 2 has no such dependency, and it is the only one of the three with a real
red test available.** It unblocks item 5 (once the operator set is canonical, the
stopgap's key bundle stops being load-bearing for the operator half) and it
narrows the documented ACM-1 drift-check conflict from seven keys to one
(`user-management:edit` alone, once AF-2 folds `profile:timeline:write` in). It also
happens to be the only increment that removes a *production* defect rather than a
dev inconvenience.

**On the letter.** This spec claims `4.2a` because alphabetical order has tracked
execution order across 4.1a–d and a first increment named `4.2d` would mislead
every later reader. It does **not** resolve the story's parked question 1: if the
PO keeps an evidence-only increment, it takes a later letter. See AF-6.

### Why three keys, and why the story's list matches neither the delta nor the set

The story names the operator set as "population import, org-relationship writes,
departure recording" and offers a five-key candidate list. Against the code, the
population-import key is **already canonical** — `IMPORT_POPULATION_FEATURE` is
`'user-management:create'` (`users.controller.ts:58`), the same key ACM-1 seeds.
~~So the real delta is two keys, not five.~~ The candidate list is longer than the
delta only because it restates the three existing keys under their *proposed*
`directory:*` names (AF-3), which makes the growth look larger than it is: on the
story's own list the delta is **two**.

**Amended 2026-09-06 by PO ruling AF-2.** The ruling adds a third key that is on
neither the story's list nor this spec's original recommendation:
`profile:timeline:write`. The delta is therefore **three** and the canonical set
is **six**. The story's list is now both too long (it renames three keys that
already exist) and too short (it omits the timeline key entirely) — read the
canonical set from the Ask First table and this spec's Code Map, never from the
story's candidate list.

"Roles-admin keys wait for that API" in the story is correct and needs no
decision: there is no role-assignment route in `src/` today, so any such key
would have no consumer.

### Why the missing npm alias is this increment's problem

It is tempting to call the alias someone else's bug and specify against the suite
as if it ran. That would produce a spec whose Stage 2 cannot distinguish "the
canonical set is three" from "the entrypoint does not exist" — every test fails
either way, which is the definition of a non-discriminating oracle and precisely
what the suite's own `:321-331` test was written to prevent. AD-1's Stage 2 is
supposed to be the moment a human can see *what specifically is wrong*; here that
requires the suite to execute first. Hence the two-part Stage 2, and hence AF-1.

Note also that the alias is not a new capability: `scripts/bootstrap-access-control.ts`
has existed since 2026-09-04 and is already the documented deploy step in five
files. The alias makes the documentation true.

### Why `profile:timeline:write` is the hard case (AF-2)

> **Superseded in its conclusion, retained as the record — PO ruling AF-2,
> Dmytro Novyk, 2026-09-06.** The analysis below is why this spec recommended
> **excluding** the key. The Product Owner ruled to **include** it. Nothing in
> the analysis is withdrawn: it is now the statement of the cost the ruling
> knowingly accepts, and the authoritative record of that cost is the *Recorded
> consequence of AF-2* blockquote in Ask First. The ruling's rationale is that
> exclusion leaves the manual timeline-write route closed to everyone on a clean
> production install.

This is the one key where "what root has today" and "what the invariant permits"
disagree. Under the accepted stopgap root holds it; under the invariant, a
functional role that carries a data-write key with **no audience half**
(`career-timeline-access.port.ts:33`: *"`isAllowed(viewer, 'profile:timeline:write')`
ALONE — a feature action, NO data-audience half"*) hands every delegated HR Admin
write access to every employee's career timeline. The port's own justification
for the interim — *"The only seeded holder is `hr-admin`, which carries no S9
write audience at all"* (`:34-35`) — is circular here: it argues the interim is
safe *because* hr-admin is the sole holder, while this increment is what would
make hr-admin a seeded holder in production and make the role delegable to
others. ~~Excluding it keeps the canonical set purely a feature set, which is the
property that makes the delegated-HR-Admin acceptance criterion provable rather
than argued.~~

**The ruling (AF-2, 2026-09-06) went the other way, and here is what that costs
in this spec's own terms.** The canonical set is *not* purely a feature set, so
the delegated-HR-Admin criterion is no longer provable as a single blanket
statement. It splits in two, and both halves are now asserted rather than argued:

1. **Still provable, unchanged** — for every section in `SECTION_ACCESS_MATRIX`
   (`profile:identity`, `profile:leave`, `profile:projects`), no canonical key
   reaches `hasSectionAccess`, so `canEdit` and section reads are untouched by
   the grown role (`s42a-op-05`).
2. **Deliberately false** — for the career timeline, whose gate bypasses the
   audience layer. Every holder of `hr-admin` can write every employee's
   timeline (`s42a-op-06`).

The port's circularity noted above becomes sharper, not softer: this increment
is exactly what makes `hr-admin` a *seeded, delegable* holder in production, so
the interim's own safety argument stops holding at the moment it becomes
literally true. That is the deviation the AF-4 architect pass must register.

### What this increment deliberately does not fix

Root still gets `canEdit: false` on unrelated cards after this change, because
edit reach comes from tree position and no tree exists. That is not a regression
and not an oversight — it is scope item 3, and the increment must say so loudly
in its Verification so nobody reads a green ACM-1 suite as "root is fully
operational".

### One thing later increments will collide with

`acm1r-fr-foundation.e2e-spec.ts:445` asserts `countOf('Policies') === 1` and
`:446-450` asserts the only `UserPolicies` row is root's (ACM1-FB-06, *"creates
no other role, attachment, or default grant"*). If scope item 3 models the §2.4
first-holder grant as a `Policies` row, **it breaks that invariant** — a second
policy row created by the bootstrap is exactly what FB-06 exists to catch. This
increment does not touch FB-06 and takes no position; it is flagged here so
item 3's Stage 1 starts from it rather than discovering it at Stage 2.

## Verification

**PLAN for Stages 2 and 3 — no command in either of those sections has been run.
Stage 1 has been executed; its outcome is recorded below.** The current-state
claims in Intent and Code Map were established by reading files at `ef03c88`,
not by running the suite.

### Stage-1 outcome — recorded 2026-09-06

Stage 1 was a document-only dispatch; it ran no test and touched no source file.
What it produced:

| Artifact | Count | Detail |
|---|---|---|
| New scenario docs | **6** | `s42a-op-01`, `s42a-op-02` under `docs/test-cases/access-control-kernel/fr-bootstrap/`; `s42a-op-03`, `s42a-op-04`, `s42a-op-05`, `s42a-op-06` under `docs/test-cases/user-management/access-control-adoption/` |
| Amended files | **20** | 18 `fr-bootstrap` scenario docs + `access-control-kernel/README.md` + `user-management/access-control-adoption/README.md` — enumerated in **Code Map § Scenario docs** |
| Architecture files amended | **0** | Correct per **AF-4 as resolved**: `database-schema.md`, `fr-architecture-amendment.md`, the kernel `SPEC.md` and `access-control.md` are the architect pass's, and the contradiction is recorded dated in `acm1-fb-01` |
| Source / test / `package.json` changes | **0** | As the AD-1 stage boundary requires |

The amended total is 20 rather than the six files this spec originally named
because the canonical count is asserted in Given/Then clauses, expected-state SQL
and Trace quotations across most of the folder, not only in titles. Ten
`fr-bootstrap` files were verified count-free and left untouched.

### Open item carried into the Stage-2 gate — the harness shape

**Unresolved; recorded, not decided here.** No suite in this repository today
provisions a session holder through the *production* bootstrap
(`db:deploy` → `db:seed` → `db:bootstrap:access-control`) and then boots Nest
against that database — every existing access-control case grants its own FR
chain from a fixture. Two of the six new Stage-1 cases need exactly that shape:

- `s42a-op-03` — root operating a bootstrap-only deployment (relationship-write
  and departure-record routes flipping `403` → `200`)
- `s42a-op-05` — a delegated `hr-admin` holder attached to the canonical policy
  with no relationship to the target

Stage 1 wrote both as e2e scenarios and flagged the question in `s42a-op-03`
itself. **The Stage-2 gate must choose**: approve them as e2e cases (which means
building a new harness shape, not just adding assertions), or approve them as the
script for a recorded manual run — see **Manual verification** below, which is
this spec's original proposal for the same problem. Neither option is chosen
here, and no task above depends on which is chosen: the steps are identical
either way, and neither uses a fixture back door.

### Stage-2a — the pre-existing red (recorded, not owned)

| Command | Expected at `ef03c88`, unmodified |
|---|---|
| `npm run test:e2e -- acm1r-fr-foundation` | Suite red. `ACM-1 CAP-3 — production entrypoint is wired` fails on the missing `package.json` key; every test calling `runBootstrap` fails on a nonzero `npm run` exit. Record the exact counts — they are the ACM-1 entrypoint defect, and they are **not** this increment's oracle. |

### Stage-2b — the discriminating red (the oracle)

| Command | Expected with the alias added and assertions amended, `CANONICAL_PERMISSIONS` still at three |
|---|---|
| `npm run test:e2e -- acm1r-fr-foundation` | Entrypoint test **green**. Every shape, lock, adoption, drift, concurrency and rollback invariant **green** — proof the suite now executes. Red exactly at: `:344` key-list equality, and the cardinality assertions (`3 !== 6`, `4 !== 7`) enumerated in the Code Map. Record actual-vs-expected per failing test. |

### Stage-3 — green, plus the regression set

| Command | Expected |
|---|---|
| `npm run test:e2e -- acm1r-fr-foundation` | **Green in full** — the first time this suite has been green at any commit in this branch's history. Record the suite/test counts. |
| `npm run test:e2e -- test/access-control` | Green apart from any failure already recorded at Stage 2a in a *different* suite; counts otherwise identical |
| `npm run test:e2e -- test/user-management` | Counts identical to Stage 2 — this increment changes no route behaviour |
| `npm run test` (unit) | Counts identical to Stage 2 |
| `npm run build` | Clean |
| `npm run lint` | Error count unchanged against Stage 2 (4.1d recorded 12 pre-existing errors in untouched files, `acm1r-fr-foundation` among them) |
| `git diff --stat -- scripts/dev-grant-root.ts` | Empty |
| `git status --porcelain -- prisma/migrations/` | Empty |
| `grep -arn "CANONICAL_PERMISSIONS" src/ scripts/ test/` | Definition + the suite's mirror only; no third copy of the key list |

Use `git grep` or `grep -arn`, never plain `grep -r`: 4.1d's Verification records
that a NUL-carrying file in this tree
(`test/user-management/epic-1/list-v15.e2e-spec.ts:741`) is skipped as binary by
plain `grep -r`, which is how two live hits escaped an earlier oracle.

### Manual verification — the capability claim

The acceptance criterion "root can wire relationships and record departures on a
deployment with no dev script" is not provable by any existing suite, because no
suite provisions root through the production bootstrap. Record it as an explicit
manual run against a scratch database:

1. Fresh DB → `npm run db:deploy` → `npm run db:seed` →
   `npm run db:bootstrap:access-control`. **Do not run `db:dev:grant-root`.**
2. Sign in as root; call one relationship-write route and one departure-record
   route. Expect `200` where `403` is the answer today.
3. Call `PATCH /users/<someone unrelated>`. Expect **`403`**, and
   `GET /users/<them>` → `canEdit: false`. Record this explicitly: it is the
   proof that the increment added feature reach and **no** data reach *to the
   identity card*.
4. **Added by PO ruling AF-2, 2026-09-06.** From the same session, call
   `POST /users/<that same unrelated person>/events`. Expect it to **succeed**.
   Record it as explicitly as step 3: it is the proof that the increment *did*
   add data reach to the career timeline, which is the accepted deviation, not a
   failed step.

~~Whether this manual run should instead become an e2e case is worth raising at
the Stage-1 gate~~ — **raised at the Stage-1 gate and left open; it is now a
Stage-2 gate decision.** See **Open item carried into the Stage-2 gate** above.
It is not proposed as an e2e case here because the existing ACM-1 suite already
owns the bootstrap's database outcome, and an HTTP suite that boots Nest against
a bootstrap-provisioned DB is a new harness shape, not an assertion — but Stage 1
authored `s42a-op-03` and `s42a-op-05` in e2e form, so the choice is live.

### ACM-9 pin

`epic-4-context.md` states: *"Any change under `services/backend/src/access-control/**`
invalidates the pinned ACM-9 performance baseline."* This increment **does**
change a file under that path — `infrastructure/bootstrap/access-control-bootstrap.ts`
— but it changes a deploy-time constant, not the audience-resolution hot path;
`prisma-relationship-graph.adapter.ts` and `audience-resolver.service.ts` are
byte-identical before and after, and this increment creates **no `Relationship`
row**, so no measured shape moves. Record that reasoning explicitly at Stage 3
and confirm the two hot-path files are untouched by `git diff`, rather than
either rerunning ACM-9 for nothing or silently ignoring the rule. The
`seeded-two-level` measurement the story owes belongs to the increment that
creates the tree edges (`solution-design-upward-walk-resolver.md` §7.3), which is
not this one.

## Boundaries

What this increment deliberately leaves standing, and who takes it:

| Left in place | Why | Owner |
|---|---|---|
| **Root has no `canEdit` reach** — `403` on every unrelated card, `canEdit: false` | Edit reach is the seeded tree position, and no tree exists. This increment provisions the *feature* half only | **Story 4.2 scope item 3** |
| `scripts/dev-grant-root.ts`, executable, unguarded, with all seven keys | Until item 3, still the only practical dev path. It is **no longer** the only way to give root `profile:timeline:write` — AF-2 seeds that key canonically — so its documented ACM-1 drift conflict narrows from seven keys to **one** (`user-management:edit`, inert since 4.1c) rather than to two, but does not vanish | **Story 4.2, final increment** |
| `create:root` (`package.json:20`) still chaining `db:seed && db:dev:grant-root` | Repointing it is coupled to retiring the stopgap (AF-5) | **Story 4.2, final increment** |
| The §2.4 full-profile-access overlay — no schema, no resolver `full` audience, no scenarios | `access-control.md:345` forbids inventing scenarios for it; the overlay lifecycle is a standing access-control deferred-work item | **AC deferred work → Story 4.2 scope item 3** |
| The `reports-to` tree-root edge, and the "at bootstrap" impossibility noted in Design Notes | Needs its own design pass: the edges can only exist after population import | **Story 4.2 scope item 3, Stage 1** |
| `db:dev:seed-org` — does not exist | Dev-only, and blocked behind this increment | **Story 4.2 scope item 5** |
| The `directory:*` catalog rename | Draft, PO-unconfirmed, and a rename must move constants, decorators, canonical set and seeded rows together (AF-3) | **whoever carries the confirmed FR-permission matrix** |
| ~~`profile:timeline:write` having no holder on a pure production bootstrap~~ — **reversed by AF-2**: the key is canonical, so `hr-admin` becomes its seeded holder and `career-timeline-access.port.ts:34`'s "only seeded holder" claim becomes **true** of the shipped bootstrap | What is left standing is the *gate*: `canEditTimeline` still has no audience half, so the grant is org-wide. Known, accepted deviation from a NORMATIVE invariant, recorded dated (AF-2 blockquote, `s42a-op-06`), to be registered by the AF-4 architect pass. The port comment needs no correction — it needs the note that its safety argument is now circular | **The deferred `profile:timeline` matrix-row increment (DEC-UM-001 narrowing) closes the gate; the AF-4 architect pass registers the deviation** |
| `ACM1-FB-06`'s `countOf('Policies') === 1` invariant | Untouched here; it is the invariant scope item 3 will have to confront if the §2.4 grant is modelled as a `Policies` row | **Story 4.2 scope item 3** |
| `Department.parentId` index; depth-499 headroom | Parked story-level questions (AF-7, AF-8); this increment writes no migration and moves no measurement | **architect / PO** |
| `database-schema.md:368-375` / `:454-457`, `fr-architecture-amendment.md:165` and `spec-access-control-kernel-mvp/SPEC.md:97`, all still saying "exactly three" | **AF-4 as resolved: a separate architect pass, not this increment.** No superseding pointer was added either — Stage 1 amended none of the four and recorded the contradiction dated in `acm1-fb-01` instead. All four will contradict shipped behaviour until that pass runs | **the AF-4 architect pass** |
