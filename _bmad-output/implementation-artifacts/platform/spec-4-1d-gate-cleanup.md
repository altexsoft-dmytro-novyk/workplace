---
title: 'PLAT-E4-S4.1d — Delete the superseded target-scoped predicates + S1 naming sweep'
type: 'refactor'
created: '2026-09-06'
status: 'ready-for-dev'
review_loop_iteration: 0
baseline_commit: 'b31158974ef0e452d75c6dc0e49f3c753afb0fce' # services/backend submodule HEAD after 4.1c landed
context:
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/docs/architecture/nestjs-di-tokens.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/story-4-1-generalise-section-access-authorisation.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/spec-4-1c-require-section-access-gate.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 4.1c moved `GET /users/:id` and `PATCH /users/:id` onto
`@RequireSectionAccess`, and deliberately left the machinery they used to run on
standing so the red→green diff stayed legible. That machinery is now dead code
with no caller: `canEditS1`, `S1_SECTION`, the `READ_USER_FEATURE` /
`EDIT_USER_FEATURE` branches inside `isAllowedForTarget`, and — a consequence
4.1c flagged but the story split does not name — `isAllowedForTarget` itself,
the `RequireFeatureForTarget` decorator, and `AccessControlGuard`'s
`targetScoped` path, which between them now have **zero** live usages. A second
residue is naming: a handful of comments still describe the deleted gate as
current, and still spell the identity section `S1` where D4 allows `S<n>` only as
a §3.2 matrix-row citation.

**Approach:** Delete what is dead, correct the prose that describes it, and
change nothing else. This story adds no capability, moves no route, and alters no
decision. The whole of its correctness argument is **invariance**: every existing
suite must stay green with its assertions unchanged, because nothing
user-visible is meant to move. Two of the deletions cross a boundary the split
did not anticipate — the port method another bounded context asserts against, and
the OR clause Story 4.2 was supposed to delete — and both are raised in **Ask
First** rather than decided here.

## Boundaries & Constraints

**Always:**
- **Governing constraint — no behavioural change may result.** Every existing
  unit, e2e, and measurement suite stays green with assertions *unchanged*. If
  any assertion has to move, the deletion that forced it is out of scope and
  stops for a human, because a pure-deletion story that changes an assertion is
  no longer a pure-deletion story.
- Delete a symbol and every symbol whose only remaining reference was that
  symbol, in the same change. A `const` kept alive by dead code, or a private
  method kept alive by a dead branch, is not "left for later" — it is a lint
  error waiting to be discovered by the next unrelated story.
- Stale prose describing a since-changed contract is worse than no prose (the
  4.1b precedent, applied again here). A comment that names `canEditS1`,
  `RequireFeatureForTarget`, or the `isAllowedForTarget` routing branches as if
  they were live is corrected in this change or it is wrong on the day it lands.
- `RequireFeature` — the **global, non-target** variant — is live and must
  survive untouched. It carries 15 decorator usages across four controllers
  (verified 2026-09-06; see Code Map). Only the *target-scoped* half of that file
  is dead.
- `AccessControlGuard` survives. `UsersController` still declares three
  `@RequireFeature(...)` routes, and `departments` / `departures` /
  `relationships` controllers declare twelve more. Only its `targetScoped`
  branch is dead.
- Follow this project's AD-1 discipline: three separately-approved stages, no
  dispatch spanning two. Stage 2 is degenerate for a pure deletion — see
  **Ask First / AF-7** and the Execution checklist; it is replaced with a stated
  artefact, not with invented ceremony.

**Ask First — ALL SEVEN RESOLVED 2026-09-06. The task list below is no longer
contingent; execute it as written.**

| # | Ruling | Decided by |
|---|---|---|
| AF-1 | **Remove `isAllowedForTarget` from the port** (recommended option). Retarget the acm8 shape check at `hasSectionAccess`; drop the now-unreachable method from the `audience-resolution` test-only adapter. | Dmytro Novyk (PO), 2026-09-06 |
| AF-2 | **Delete `canEditS1` whole, OR clause included** (recommended option). Story 4.2 closes its scope item 1 **by verification, not deletion** — its acceptance criterion is already a grep and will pass trivially. **Do not edit story 4.2's file**; that re-scoping is a separate pass. | Dmytro Novyk (PO), 2026-09-06 |
| AF-3 | **Delete all three** — `RequireFeatureForTarget`, `AccessControlGuard`'s `targetScoped` branch, and `RequireFeatureMeta.targetScoped`. Follows AF-1. `RequireFeature` (15 live decorator usages across four controllers) is untouched. | Follows AF-1 |
| AF-4 | **Fix the comments, comment-only.** `dev-grant-root.ts`'s header asserts a security behaviour that has been false since 4.1c; a comment that misstates who may edit what is worse than a merely stale one. No executable line in that file may change — the script itself stays reserved to Story 4.2. | John (PM), routine call |
| AF-5 | **UM `src/` plus `test/user-management/access-control-adoption/` only.** Other epics' suites and the committed-red `test/mentorship/` files keep their `S1` prose. | Recommended option |
| AF-6 | **Yes**, this story may edit the two named AC-owned test files. Follows AF-1. Shape and name changes only — no assertion's meaning may move. | Follows AF-1 |
| AF-7 | **Degenerate Stage 2 accepted.** No red test exists for a pure deletion. The gate artefact is a recorded pre-deletion baseline plus the grep oracle. The baseline is captured by the PM before dispatch, not by the implementing agent — an agent must not author the evidence it will later be judged against. | John (PM), per AD-1 intent |

**Original Ask First text, retained as the record:**
- **AF-1 — does `isAllowedForTarget` come off `AccessControlPort`?** It is
  asserted against by an Access Control kernel composition test in another
  bounded context. Full option analysis in **Design Notes**; recommendation is
  **remove it**.
- **AF-2 — is `canEditS1` deleted whole, OR clause and all?** The
  `user-management:edit` OR clause lives *inside* `canEditS1`
  (`access-control-facade.adapter.ts:176`), and Story 4.2 scope item 1 is "delete
  the override". Deleting `canEditS1` wholesale leaves 4.2 nothing to delete.
  Full analysis in **Design Notes**; recommendation is **delete it whole and
  close 4.2 item 1 by verification**.
- **AF-3 — do `RequireFeatureForTarget`, `AccessControlGuard`'s `targetScoped`
  branch, and the `targetScoped` field on `RequireFeatureMeta` go with it?** The
  story split does not name them; 4.1c flagged them to 4.1d. Contingent on AF-1
  (if the port method stays, the guard branch has something to call, however
  pointlessly). Recommendation is **delete all three**.
- **AF-4 — `scripts/dev-grant-root.ts`.** Its header (lines 34-40) asserts that
  the identity-card edit gate honours `user-management:edit` as an OR override.
  That has been false since 4.1c. It also carries two bare `S1`s (lines 36, 52).
  The file is explicitly reserved to Story 4.2. Comment-only correction here, or
  leave the false statement standing until 4.2?
- **AF-5 — how far does the `S1` prose sweep reach?** Recommendation: User
  Management `src/` plus `test/user-management/access-control-adoption/` only.
  Other epics' suites and the committed-red `test/mentorship/` files also carry
  `S1` prose and are listed in the Code Map, unedited.
- **AF-6 — may this UM story edit AC-owned test files?**
  `test/access-control/acm8-kernel-composition.e2e-spec.ts` and
  `test/access-control/audience-resolution.e2e-spec.ts`. Contingent on AF-1.
- **AF-7 — is the degenerate Stage 2 accepted?** There is no red test available
  for this change. The proposed stage-2 gate artefact is a recorded pre-deletion
  baseline plus a grep oracle. See Execution and Design Notes.

**Never:**
- Never change a single assertion in any existing test. Comment and title edits
  only. (The one possible exception is `acm8-kernel-composition.e2e-spec.ts:97`
  under AF-1, which is a *type* smoke check, not a behaviour assertion — and even
  that is an Ask First item, not a licence.)
- Never touch `src/access-control/**`. 4.1a and 4.1b own that surface and both
  have landed. `section-access-matrix.ts:7`'s historical `'S1'` note is theirs.
- Never touch `acm5-section-access.e2e-spec.ts:211-213` (SA-06's deliberate
  retired-`'S1'` regression assertion) or
  `access-control-facade.adapter.spec.ts:202-211` (the same lock at unit level).
  Those two `S1` strings are the point of their tests.
- Never add a capability, a decorator, a port method, a route, a
  `DEFAULT_PERMISSIONS` key, or a `SECTION_ACCESS_MATRIX` row. This story only
  removes.
- Never seed, migrate, or bootstrap. No `prisma/`, no `scripts/bootstrap-*`.
- Never restore `umac-10`'s describe block, and never delete the `umac-10`
  scenario doc — 4.1c retired the former and kept the latter deliberately.

## I/O & Edge-Case Matrix

Every row is an invariance claim: the observable behaviour before this change and
after it are identical. There is no new behaviour to specify.

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Identity-card read | Any non-empty audience over an active target, `GET /users/:id` | `200` `{ data, canEdit }` — decided by `SectionAccessGuard` → `hasSectionAccess(..., 'read', ...)`, untouched by this story | unchanged |
| Identity-card write | Reporting / PP audience, `PATCH /users/:id` | `200` — same dual gate, untouched | unchanged |
| Identity-card write denied | Colleague or self audience, `PATCH /users/:id` | `403` — same dual gate, untouched | `ForbiddenException`, unchanged |
| Global feature routes | `GET /users`, `POST /users/import`, `DELETE /users/:id`, every `departments` / `departures` / `relationships` write | Unchanged. `RequireFeature` + `AccessControlGuard`'s non-target branch survive intact | unchanged |
| Photo upload | `PUT /users/:id/photo` | Unchanged — `@SelfOnly()` / `SelfOnlyGuard`; it never used the target-scoped path | unchanged |
| Career-timeline routes | `GET`/`POST /users/:id/events`, `DELETE /users/:id/events/:eventId` | Unchanged — gates live inside the actions | unchanged |
| Any route with a `targetScoped` decorator | *(no such route exists)* | Vacuous. Zero `@RequireFeatureForTarget` usages in `src/` (verified 2026-09-06) — deleting the branch removes an unreachable path, not a behaviour | N/A |
| Kernel composition check | `moduleFixture.get(ACCESS_CONTROL_PORT)` in `acm8-kc-02` | Still resolves `AccessControlFacadeAdapter`, still not the facade. Only the *method name* in the shape smoke-check changes, if AF-1 is approved | N/A |
| Test-only port implementation | `audience-resolution.e2e-spec.ts`'s `FacadeBackedAccessControlAdapter` | ACF-AU-01..04 still allow through `hasSectionAccess`; its oracle is unchanged | N/A |
| Seeded dev root | `db:dev:grant-root`, then `GET /users/:id` on an unrelated card | `canEdit: false` — **already true today**, since 4.1c took the override off every live path. Deleting the clause changes nothing observable | N/A |

</frozen-after-approval>

## Code Map

Every line below was read at `b311589` on 2026-09-06.

### Deletions — `src/user-management/infrastructure/access-control-facade.adapter.ts`

- `:28` `const READ_USER_FEATURE = 'user-management:read'` — referenced only by
  the branch at `:65`. Delete. (An unreferenced module const is an ESLint
  `no-unused-vars` error in this repo — see Design Notes.)
- `:33` `const EDIT_USER_FEATURE = 'user-management:edit'` — referenced only by
  the branch at `:73` and the OR clause at `:176`. Delete.
- `:34-36` the `S1_SECTION` const and its two-line rename comment — referenced
  only by `canEditS1` at `:166`. Delete.
- `:23-27` and `:29-32` the two block comments explaining those consts. Delete
  with them.
- `:60-80` `isAllowedForTarget`, including the `READ_USER_FEATURE` branch
  (`:65-71`) and the `EDIT_USER_FEATURE` branch (`:73-75`). Delete the whole
  method — **contingent on AF-1**. Note the split's wording says "delete the
  branches"; deleting only the branches leaves a method whose body is
  `return false` for every input, reachable from a guard path with no decorator
  to trigger it. That is a worse resting state than either endpoint.
- `:134-177` the `canEditS1` block, its long dead-code preamble, and the OR
  clause at `:176` — **contingent on AF-2**.
- `:11-21` the class header comment lists the port's injectors as
  "`AccessControlGuard` / `IdentityCardAccessService`". Incomplete since 4.1c:
  `SectionAccessGuard` injects it too, and is now the injector for both migrated
  routes. `AccessControlGuard` still injects it for its surviving non-target
  branch, so the fix is to add the third name, not to remove one.
- **Survives untouched:** `isAllowed` (`:56-58`), `SECTION_ACCESS_RANK`
  (`:41-45`), `hasSectionAccess` (`:100-118`), `canEditIdentityCard`
  (`:122-132`), and the `implements AccessControlPort, IdentityCardAccessPort`
  declaration.

### Deletions — port, decorator, guard

- `src/user-management/domain/interfaces/access-control.port.ts:13-17` — remove
  `isAllowedForTarget` from `AccessControlPort`. **Contingent on AF-1.**
  `isAllowed` (`:12`), the two level types (`:5`, `:9`), `hasSectionAccess`
  (`:18-37`) and `ACCESS_CONTROL_PORT` (`:40`) all stay.
- `src/user-management/application/decorators/require-feature.decorator.ts:19-23`
  — remove `RequireFeatureForTarget`. **Contingent on AF-3.**
- ...same file `:5` — remove `targetScoped: boolean` from `RequireFeatureMeta`,
  and `:14` — remove `targetScoped: false` from `RequireFeature`'s payload.
  Nothing can set it `true` once the target-scoped decorator is gone, so the
  field is a constant `false` carried through metadata. **Contingent on AF-3.**
- ...same file `:10`, `:17-18` — the two explanatory comments; the first
  ("No-target FR capability check") loses its "no-target" contrast and should be
  restated as what `RequireFeature` now unconditionally is.
- `src/user-management/application/guards/access-control.guard.ts:43-52` —
  collapse the `meta.targetScoped ? ... : ...` ternary to the single
  `isAllowed(session.userId, meta.feature)` call. **Contingent on AF-3.**
- ...same file `:55-58` — the log line's
  `${meta.targetScoped ? ` on target …` : ''}` suffix goes with it. The remaining
  message text is byte-identical to what the non-target path emits today, so no
  log-shape change for any live route.
- ...same file `:21-22` — header comment "@RequireFeature[ForTarget]" → the
  surviving name.

### Prose corrections — files that describe the deleted gate as current

- `src/user-management/application/actions/get-user-events.action.ts:11` —
  "EXCLUDES colleague, unlike the S1 `RequireFeatureForTarget` gate". Names a
  decorator this story deletes **and** spells the section `S1`. Restate against
  `@RequireSectionAccess('profile:identity', 'read')`.
- `src/user-management/application/actions/get-access-journal.action.ts:12` —
  "neither the S1 `RequireFeatureForTarget` gate ...". Same shape, same fix.
- `src/user-management/domain/interfaces/career-timeline-access.port.ts:15` —
  "`'profile:timeline'` yet (S1/S10/S11 only)". Factually stale since 4.1b: the
  kernel matrix holds `profile:identity` / `profile:leave` / `profile:projects`.
- `test/user-management/access-control-adoption/write-adoption.e2e-spec.ts:14-31`
  — the Variant-A / "UPDATE 2026-09-03" / "UMAC-07 — GREEN because
  `isAllowedForTarget`'s `EDIT_USER_FEATURE` branch..." docblock describes the
  pre-4.1c gate as the live one. **This is the real edit owed to the file the
  story split names** — see the discrepancy note below. Comment-only; its three
  surviving describe blocks and every assertion are untouched.
- `test/user-management/access-control-adoption/read-denial.e2e-spec.ts:29` —
  "from `AccessControlGuard`'s denied `isAllowedForTarget`". The `403` now comes
  from `SectionAccessGuard`'s denied `hasSectionAccess`. Comment-only.
- `src/user-management/domain/interfaces/identity-card-access.port.ts:29-30`
  already reads "the pre-4.1c `user-management:edit` OR override is gone from
  this path" — correct as written. No edit. Listed so a sweep does not
  re-touch it.
- `src/user-management/infrastructure/__tests__/access-control-facade.adapter.spec.ts:95`
  — "the defect the 2026-09-03 review found in `canEditS1`, asserted here as
  ordering". A dated citation of a past state and the stated reason that test
  exists. **No edit**, and it is the one `canEditS1` reference that legitimately
  survives the greps below.

### The `S1` naming sweep — what is a live identifier vs. a §3.2 citation

Project rule D4: human section keys everywhere; `S<n>` survives only as a
requirements-matrix row reference. Greps run 2026-09-06 over
`services/backend/{src,test,scripts}`.

**(a) `S1` used as, or asserted about, live code — must change (in scope):**

| Path:line | Why |
|---|---|
| `src/user-management/infrastructure/access-control-facade.adapter.ts:34-36` | the `S1_SECTION` identifier itself; deleted with `canEditS1` |
| `src/user-management/application/actions/get-user-events.action.ts:11` | names a deleted decorator |
| `src/user-management/application/actions/get-access-journal.action.ts:12` | names a deleted decorator |
| `src/user-management/domain/interfaces/career-timeline-access.port.ts:15` | states the kernel supports `S1/S10/S11`; false since 4.1b |

**(b) `S1` as a §3.2 matrix-row citation — legitimate under D4, normalise the
form only (in scope, comment-only, recommended under AF-5):**

`src/user-management/application/dtos/update-user.dto.ts:85,110` ·
`src/user-management/application/dtos/user-card.response.ts:3,8` ·
`src/user-management/application/dtos/user-list-item.response.ts:4` ·
`src/user-management/application/actions/get-user-card.action.ts:11` ·
`test/user-management/access-control-adoption/fixtures.ts:37,119,161,178,294,310,318,333`

These say "the S1 card", "12 S1 fields", "non-S1 technical columns". Each *is* a
matrix-row reference, so none is a D4 violation outright — but a bare `S1`
adjacent to a field list reads as an identifier. Proposed bounded rule: any bare
`S1` in these files becomes `§3.2 S1 (profile:identity)` on first use in the file
and `§3.2 S1` thereafter. No concept renamed, no assertion touched.

**(c) `S1` deliberately pinned — never touch:**

`test/access-control/acm5-section-access.e2e-spec.ts:27,211,213` (SA-06's
retired-key regression, 4.1b's design) ·
`src/user-management/infrastructure/__tests__/access-control-facade.adapter.spec.ts:202-211`
(same lock at unit level) ·
`src/access-control/domain/constants/section-access-matrix.ts:7` (AC-owned
historical rename note).

**(d) `S1` in other stories' suites — out of scope, listed for the record:**

`test/user-management/epic-1/photo-v15.e2e-spec.ts:313,652,659,689,720` (and its
stale `@RequireFeatureForTarget` "why red" narrative at `:42-44`) ·
`test/user-management/epic-1/seed.e2e-spec.ts:228` ·
`test/user-management/epic-4/people-partner-change.e2e-spec.ts:61,93,96,198` ·
`test/user-management/epic-5/apply-departure.e2e-spec.ts:425` ·
`test/user-management/epic-2/consume-magic-link.e2e-spec.ts:145` ·
`test/user-management/epic-3/auto-events.e2e-spec.ts:217` ·
`test/mentorship/{view,pool,end,fixtures}` (six of these suites are another
story's committed red; editing their headers risks confusing that story's
stage-3 evidence) ·
`test/access-control/audience-resolution.e2e-spec.ts:40` ·
`test/access-control/acm8-kernel-composition.e2e-spec.ts:102` (test *title*:
"self reads the S1 card") ·
`scripts/dev-grant-root.ts:36,52` (AF-4) ·
`docs/test-cases/user-management/profile/README.md:273,279` and
`docs/test-cases/user-management/access-control-adoption/umac-05-unresolved-session-read-denied.md:9,41,50`
(both narrate `isAllowedForTarget` / `RequireFeatureForTarget` as live).

> **Discrepancy — the story split vs. today's code.** The split assigns 4.1d
> "update `write-adoption.e2e-spec.ts` and any other pinned test whose name or
> assertion still says `S1`". As of `b311589`, `write-adoption.e2e-spec.ts`
> contains **zero** occurrences of `S1` — 4.1b's sweep renamed every one of them
> (its Execution note records "dozens of bare `S1` mentions in test titles/
> comments, all renamed"). What that file actually still carries is stale prose
> about `canEditS1` and the `EDIT_USER_FEATURE` branch (`:14-31`), plus 4.1c's
> retirement comment at `:203-232`, which is accurate and stays. Trusting the
> code: the sweep target is prose, not `S1` strings, and the residual `S1`
> strings live in the files listed above instead.

### Cross-context files — contingent on AF-1 / AF-6

- `test/access-control/acm8-kernel-composition.e2e-spec.ts:97` —
  `expect(typeof port.isAllowedForTarget).toBe('function')`. Under AF-1's
  recommendation this line becomes `hasSectionAccess`. It is a *compile-time
  forced* edit, not an optional one: `port` is typed `AccessControlPort`, so
  removing the method from the interface makes this line a TS error. Its scenario
  doc (`docs/test-cases/access-control-kernel/kernel-composition/acm8-kc-02-interim-adapter-binding-unchanged.md`)
  specifies only that `ACCESS_CONTROL_PORT` resolves to User Management's own
  adapter and not to `AccessControlFacade`; it names no method. Swapping one
  method name preserves the approved intent exactly, so **no scenario-doc
  amendment is required** — a dated note in this spec's Verification is the right
  record.
- `test/access-control/audience-resolution.e2e-spec.ts:51-57` — the test-only
  `FacadeBackedAccessControlAdapter.isAllowedForTarget`. Removing the method from
  the interface does **not** break this file (TypeScript permits extra members on
  a class that `implements` an interface), so this is a genuine tidy, not a
  forced edit: the method becomes an unreachable branch of a test-only fake. Its
  `hasSectionAccess` (`:64-71`) and shared `hasAllowedAudience` (`:73-86`) stay,
  and the suite's oracle is unchanged either way. Comment at `:59-63` needs its
  "Same test-only mapping as `isAllowedForTarget` above" clause retargeted at
  `hasAllowedAudience` if the method goes.

### Untouched, verified live

- `RequireFeature` — **15** decorator usages, all surviving:
  `users.controller.ts:106,139,260` · `departments.controller.ts:47,59` ·
  `departures.controller.ts:52,68,83,96` ·
  `relationships.controller.ts:65,100,113,126,140,153`.
  > The task brief's "4 decorator usages across `users.controller.ts` and
  > `departments.controller.ts`" understates this by eleven; re-verified by grep
  > on 2026-09-06. Nothing in the plan changes, but the survival argument is much
  > stronger than stated.
- `RequireFeatureForTarget` — **zero** decorator usages in `src/`. The only
  remaining mentions are its own definition and prose in comments/docs.
- `AccessControlGuard` — registered at `user-management.module.ts:127`, applied
  by four controllers, still needed for every `RequireFeature` route.
- `SectionAccessGuard`, `SelfOnlyGuard`, `SessionGuard`, `hasSectionAccess`,
  `canEditIdentityCard`, `IdentityCardAccessService` — all live, all untouched.

## Tasks & Acceptance

**Execution** — three separately-approved AD-1 stages. No dispatch spans two.
Stages 1 and 2 are honestly reduced for a pure deletion; see Design Notes for why
inventing more would be ceremony.

- [~] **AD-1 stage 1 — decisions + scenario-doc amendments only.** Obtain the
      human ruling on **AF-1 … AF-7** and record each verdict, dated and
      attributed, in the Ask First list above. Then amend the docs whose prose
      narrates the deleted gate as live:
      `docs/test-cases/user-management/access-control-adoption/umac-05-unresolved-session-read-denied.md`
      (`:9,41,50`) and, if AF-5 extends there,
      `docs/test-cases/user-management/profile/README.md` (`:273,279`).
      No new scenario id is authored — a deletion that changes no behaviour has
      no new observable to specify, and inventing one would be a scenario for the
      compiler. **STOP for human approval — write no source file, no test file,
      in this dispatch.**
      > **Partially done at stage-3 dispatch (2026-09-06).** The AF-1 … AF-7
      > verdicts are recorded above, dated and attributed. The two scenario-doc
      > amendments were **NOT** made and are still owed:
      > `docs/test-cases/user-management/access-control-adoption/umac-05-unresolved-session-read-denied.md`
      > (`:9,41,50` still narrate `isAllowedForTarget` as the live `403` source)
      > and `docs/test-cases/user-management/profile/README.md` (`:273,279`,
      > plus `:37,52,75` which still spell the section `'S1'`). The stage-3
      > dispatch brief scoped this agent to AF-1 … AF-6 code/test work only.
- [x] **AD-1 stage 2 — record the oracle; no red test exists.** Run the full
      regression set in **Verification** against unmodified source and record
      every suite count verbatim; then record the exact "before" match counts for
      each grep in the Acceptance Criteria. That pair — *these numbers must not
      move, these greps must go to zero* — is this story's gate artefact in place
      of a red test, per **AF-7**. Do not manufacture a red by adding a test that
      asserts a symbol's absence; that tests the compiler, not the system.
      **STOP for human approval — write no source file in this dispatch.**
      > Done by John (PM) 2026-09-06 as
      > `spec-4-1d-baseline-2026-09-06.md`. See the Verification note on the
      > one grep count that file under-reports.
- [x] **AD-1 stage 3 — the deletions.** `access-control-facade.adapter.ts` —
      remove `READ_USER_FEATURE`, `EDIT_USER_FEATURE`, `S1_SECTION`, their
      comments, `isAllowedForTarget` (AF-1), and `canEditS1` including its OR
      clause (AF-2); correct the class header comment.
- [x] `domain/interfaces/access-control.port.ts` — remove `isAllowedForTarget`
      from `AccessControlPort` (AF-1).
- [x] `application/decorators/require-feature.decorator.ts` — remove
      `RequireFeatureForTarget` and the `targetScoped` field; restate the
      surviving comment (AF-3).
- [x] `application/guards/access-control.guard.ts` — collapse the `targetScoped`
      ternary and its log-line suffix; correct the header comment (AF-3).
- [x] Prose corrections in `get-user-events.action.ts`,
      `get-access-journal.action.ts`, `career-timeline-access.port.ts`,
      `write-adoption.e2e-spec.ts` (header docblock), `read-denial.e2e-spec.ts`.
      Comment-only; zero assertion edits.
- [x] The `S1` citation-form normalisation in the group-(b) files, if AF-5 is
      approved as recommended. Comment-only; zero assertion edits.
- [x] Cross-context, if AF-1/AF-6 approve: `acm8-kernel-composition.e2e-spec.ts:97`
      → `hasSectionAccess`; drop the dead `isAllowedForTarget` from
      `audience-resolution.e2e-spec.ts` and retarget its `:59-63` comment.
- [x] `scripts/dev-grant-root.ts` — comment-only correction of the header's
      false OR-override claim and its bare `S1` (AF-4). Zero executable lines
      changed; see the Verification note on line 52.
- [x] Run the **Verification** set and record real results in this file,
      replacing the plan with the outcome.

**Acceptance Criteria:**

- **Given** the full `test/user-management` e2e suite, `test/access-control`
  (excluding the known-failing `acm1r-fr-foundation`), and the unit suite,
  **when** each is run after this change, **then** the pass/fail counts are
  *identical* to the stage-2 recording and no assertion in any file was edited.
- **Given** `npm run build` and `npm run lint`, **when** run after this change,
  **then** the build is clean and the lint error count is unchanged at the 12
  pre-existing errors in untouched files
  (`acm1r-fr-foundation`, `acm9` measurement specs, `mentorship/fixtures.ts`).
- **Given** `grep -rn "isAllowedForTarget" src/`, **when** run after this change,
  **then** zero matches (AF-1 approved).
- **Given** `grep -rn "RequireFeatureForTarget\|targetScoped" src/`, **when** run
  after this change, **then** zero matches (AF-3 approved).
- **Given** `grep -rn "S1_SECTION\|READ_USER_FEATURE\|EDIT_USER_FEATURE" src/`,
  **when** run after this change, **then** zero matches.
- **Given** `grep -rn "canEditS1" src/`, **when** run after this change, **then**
  exactly **one** match survives:
  `infrastructure/__tests__/access-control-facade.adapter.spec.ts:95`, which
  cites `canEditS1` as the *historical* defect the 2026-09-03 review found, in
  the comment above the audience-first ordering describe block. That is a dated
  citation of a past state, not a claim about live code, and it is the reason
  that unit test exists — it stays. Every other `canEditS1` reference in `src/`
  (`access-control-facade.adapter.ts:32,74,136,160,166`) goes.
- **Given** `grep -rn "@RequireFeature(" src/`, **when** run after this change,
  **then** exactly **15** matches remain, in the four controllers listed in the
  Code Map — the global variant is untouched.
- **Given** `grep -rn "\bS1\b" src/user-management/`, **when** run after this
  change, **then** every remaining match is either a `§3.2 S1` matrix-row
  citation or the deliberate retired-identifier assertion in
  `access-control-facade.adapter.spec.ts:202-211`.
- **Given** a developer running `db:dev:grant-root` on a seeded dev DB, **when**
  they `GET /users/:id` on a card they have no reporting or PP edge to, **then**
  `canEdit` is `false` — **the same answer as before this change**, because 4.1c
  already took the override off every live path. This story must not be able to
  move that answer.

## Design Notes

### AF-1 — `isAllowedForTarget` and the kernel contract test

This is not a local cleanup. `AccessControlPort` is declared in
`src/user-management/domain/interfaces/` and owned by User Management (AD-2), but
`test/access-control/acm8-kernel-composition.e2e-spec.ts:97` — an Access Control
kernel composition test in a different bounded context — asserts
`typeof port.isAllowedForTarget === 'function'`, and
`test/access-control/audience-resolution.e2e-spec.ts:42` declares a test-only
class that `implements` the port, which 4.1c already had to extend once.

**Option 1 — remove the method from the port (recommended).** Delete
`isAllowedForTarget` from the interface, from the adapter, from
`AccessControlGuard`'s branch, and delete `RequireFeatureForTarget`; retarget
acm8's one `typeof` line at `hasSectionAccess`; drop the now-unreachable method
from the test-only adapter.

- The acm8 edit is *forced*, not discretionary: `port` is typed
  `AccessControlPort`, so the line stops compiling the moment the method leaves
  the interface. There is no version of Option 1 that avoids touching that file.
- But the edit is faithful. `acm8-kc-02`'s approved scenario doc specifies only
  that `ACCESS_CONTROL_PORT` resolves to User Management's own adapter rather
  than to `AccessControlFacade`; the two `typeof` lines were added as a shape
  smoke-check at the UMAC-1 realignment, and neither the doc nor the SPEC
  capability names a method. Substituting the port's *current* method for its
  retired one keeps the assertion doing exactly the job the doc describes.
- The `audience-resolution` change is genuinely optional — TypeScript allows a
  class to carry members the interface no longer declares — which is a useful
  property: it means Option 1 cannot silently break another context's fixture. It
  leaves a dead method in a test-only fake, which is worth removing but is not
  load-bearing.
- Cost is bounded and legible: one line in one AC test that must change, one
  method in another AC test that should.

**Option 2 — keep the port method, delete only the UM-side branches.** The
adapter's `isAllowedForTarget` becomes `return false` for every input, still
declared on the port, still reachable through `AccessControlGuard`'s
`targetScoped` branch, which no decorator can trigger because
`RequireFeatureForTarget` would also have to survive to keep the branch
meaningful.

- Nothing outside User Management changes. That is its only advantage.
- It preserves **four** dead artefacts — a port method, an always-false adapter
  implementation, a guard branch, and a decorator — to protect a single `typeof`
  smoke assertion. That is precisely the no-op-wrapper pattern this project bans:
  an abstraction kept alive because a test names it, not because anything calls
  it.
- It also leaves the next reader a trap. `isAllowedForTarget` on a port reads as
  a supported capability; an implementation that always denies is a fail-closed
  stub that nobody will discover until they wire a route to it.

**Option 3 — move the assertion instead of the method.** Rewrite `acm8-kc-02` to
assert only the class identity (which is what its doc actually specifies) and
drop both `typeof` lines. Then Option 1's port deletion touches nothing else.

- Cleanest in principle, and arguably what the assertion should have been all
  along. But it *weakens* an existing AC-owned check on this story's authority,
  which is a bigger imposition on another context than swapping a method name.
  Offered as a fallback if the AC owner prefers to own that file's shape.

**Recommendation: Option 1.** The port is User Management's to shape; the
consuming assertion is preserved in intent, not merely in letter; and Options 2's
cost — four dead artefacts kept alive by one test line — is exactly the debt this
epic exists to remove. Option 3 is an acceptable second choice if the Access
Control owner would rather narrow the assertion than have it renamed.

### AF-2 — the `canEditS1` / Story 4.2 collision

The story split assigns `canEditS1`'s deletion to 4.1d and the
`user-management:edit` OR clause's deletion to 4.2. **They are the same code.**
The OR clause is the final `return this.facade.isAllowed(viewerId, EDIT_USER_FEATURE)`
at `access-control-facade.adapter.ts:176`, inside the method body. Deleting
`canEditS1` wholesale takes the clause with it and leaves Story 4.2 scope item 1
("Delete the override") with nothing to delete. This is the single most
consequential thing on the Ask First list, because it decides whether 4.2 still
has a deletion to perform.

Two facts change how expensive this looks:

1. **The clause is already behaviourally dead.** 4.1c moved `PATCH /users/:id`
   and the `canEdit` hint onto `hasSectionAccess`, so nothing reaches
   `isAllowedForTarget` → `canEditS1` → the OR. A seeded root already gets
   `canEdit: false` on cards it has no edge to, as of 4.1c. The "coupling to
   seating root in the reporting tree" that reserved this clause for 4.2 was a
   *live-behaviour* argument, and 4.1c retired the behaviour. What remains is
   text.
2. **4.2's pinning test is already gone.** 4.2 scope item 1 also names "the
   interim pinning test (`write-adoption.e2e-spec.ts` `user-management:edit` FR
   grant is an OR-override)". 4.1c deleted that describe block by PO decision on
   2026-09-05. So half of 4.2 item 1 has already been executed by another story.

**Option A (recommended) — 4.1d deletes `canEditS1` whole, clause included.**
4.2's item 1 is then closed by *verification* rather than by deletion: its
acceptance criterion already reads "`canEditS1` no longer references `isAllowed` /
`EDIT_USER_FEATURE`; grep of `access-control-facade.adapter.ts` shows no
FR-permission branch in the identity-card decision" — a grep, which will pass
trivially. 4.2's substantive work (seating root in the reporting tree, the §2.4
first-holder grant, `db:dev:seed-org`, the bootstrap operator key set) is
untouched and unaffected. Whoever runs 4.1d must **not** edit
`story-4-2-default-org-relationship-seed.md`; the PO closes item 1 when 4.2 runs.

**Option B — 4.1d leaves `canEditS1` standing so 4.2 keeps a physical target.**
Delete `isAllowedForTarget` and its two branches, but keep the private method.
This does not survive contact with the code: with `isAllowedForTarget` gone,
`canEditS1` has no caller at all, and `S1_SECTION` and `EDIT_USER_FEATURE` stay
alive only through it, while `READ_USER_FEATURE` becomes an unused const and
therefore a lint error that must be deleted anyway. The result is a private
method with zero callers plus two consts existing solely to keep it compiling —
carried across a story boundary for paperwork reasons. It also violates this
spec's own "delete a symbol and everything whose only reference was that symbol"
rule.

**Option C — pull 4.2's whole override story forward.** Rejected: it would drag
`scripts/dev-grant-root.ts` and the root-seating question into a cleanup story,
which is exactly the boundary the split drew.

**Recommendation: Option A**, on the ground that the thing 4.2 was reserving —
a live override that root depends on — stopped existing when 4.1c landed. The
paperwork (SCP D6, `epics.md`, story 4.2 scope item 1) should be closed as
*satisfied*, not as *performed by 4.2*. If the PO wants the deletion to appear in
4.2's diff for traceability, Option B is available at the cost of an orphaned
private method plus two consts for the duration.

### Why Stage 2 is degenerate here, and what replaces it

AD-1's stage 2 exists to prove that a test fails for the reason the scenario
claims, before any code makes it pass. A pure deletion has no such test
available:

- There is no new behaviour to assert. Every observable this story touches is
  already asserted by suites that must stay green *with their assertions
  unchanged* — that is the story's governing constraint, so a new assertion would
  contradict it.
- A test asserting "`isAllowedForTarget` is no longer a property of the port"
  would be red before and green after, and would be a real red — but it asserts a
  type-system fact that `npm run build` already enforces harder, and it would
  itself have to be deleted or inverted the next time anyone adds a method. It is
  ceremony, and it locks the wrong thing.
- The story split's own residue — the `S1` sweep — is comment-only. Comments are
  not testable and should not be made testable.

What actually protects this change, in decreasing order of strength:

1. **The compiler.** Removing `isAllowedForTarget` from the port makes every
   surviving reference a hard TS error, including the cross-context one at
   `acm8-kernel-composition.e2e-spec.ts:97`. There is no way to half-delete it.
2. **ESLint's `no-unused-vars`.** Module-scope consts are covered
   (`@typescript-eslint/recommendedTypeChecked` is enabled in
   `eslint.config.mjs`), which is why `users.controller.ts:59-63` records that
   4.1c had to remove `READ_USER_FEATURE` / `EDIT_USER_FEATURE` from *that* file
   the moment they lost their last reference. The same rule forces the adapter's
   three consts to leave with the code that used them — the deletions cannot be
   partial. (`tsconfig.json` sets no `noUnusedLocals`, so this does **not** cover
   the unused *private method* `canEditS1`; that one is on the reviewer, which is
   an argument for Option A over Option B in AF-2.)
3. **Suite invariance.** ~272 User Management e2e tests plus the access-control
   suites, all with untouched assertions. A deletion that changes behaviour
   shows up there.
4. **The grep oracle** in the Acceptance Criteria, recorded "before" at stage 2
   and required to reach zero at stage 3.

The proposal is therefore: stage 2's dispatch produces the recorded baseline and
the grep oracle, the human approves *that* as the gate artefact, and no test file
is written. Stated plainly rather than dressed up, because the alternative is a
test that exists to satisfy a process rather than to catch a defect.

### Why the log line does not change shape

`AccessControlGuard`'s warning currently appends
`${meta.targetScoped ? ` on target ${id}` : ''}`. With `targetScoped` always
`false`, that suffix is already empty for every live route, so collapsing the
ternary produces byte-identical output for everything that can actually reach the
line. No log-shape regression is possible, and no suite asserts on it.

## Verification

**Executed 2026-09-06** (stage-3 dispatch) from `services/backend`, Node
v24.19.0, against baseline commit `b311589` with `spec-4-1d-baseline-2026-09-06.md`
as the oracle. Working tree left dirty and uncommitted, as instructed.

### Status: BLOCKED on one suite. Everything else reproduces the baseline.

`test/user-management/epic-1/list-v15.e2e-spec.ts` — `um-list-12 Test 1` fails,
and it cannot be made green without **removing an assertion**, which this story
forbids. It is the one thing in this change that needs a human ruling. Details in
**The one blocker** below. Nothing else in the change depends on it; the
deletions themselves are complete and every other suite is green.

### Commands and real output

| Command | Baseline | Actual | Verdict |
|---|---|---|---|
| `npm run build` | clean | clean, no output | PASS |
| `npm run lint` | 12 errors | `✖ 12 problems (12 errors, 0 warnings)` | PASS — same 12 files/lines as baseline §2 (`acm1r-fr-foundation` 1, `acm9-baseline` 1, `acm9/manifest.spec` 7, `acm9/manifest.ts` 1, `mentorship/fixtures` 2). No error in any touched file. |
| `npm run test:e2e -- test/user-management` | 23 suites, 254 passed / 18 todo / 272 | `Test Suites: 1 failed, 22 passed, 23 total` · `Tests: 1 failed, 18 todo, 253 passed, 272 total` | **FAIL — one suite.** Total count 272 unmoved; the single delta is `list-v15` `um-list-12 Test 1`, which throws at *setup* (`jest.spyOn` on a deleted property), not at an assertion. See below. |
| `npm run test:e2e -- s41c-section-access-gate write-adoption read-adoption edit-identity manager-change audience-resolution` | 75/75, 6 suites | `Test Suites: 6 passed, 6 total` · `Tests: 75 passed, 75 total` | PASS |
| `npm run test:e2e -- acm8-kernel-composition` | green | `Test Suites: 1 passed, 1 total` · `Tests: 5 passed, 5 total` | PASS — green with the retargeted `typeof` line |
| `npm run test:e2e -- test/access-control --testPathIgnorePatterns=acm1r-fr-foundation` | 84/84 | `Test Suites: 14 passed, 14 total` · `Tests: 84 passed, 84 total` | PASS |
| `npm test` (unit) | 5 suites, 44/44 | `Test Suites: 5 passed, 5 total` · `Tests: 44 passed, 44 total` | PASS |

No assertion was edited in any file. The only test-file changes are docblocks,
one `typeof` method name (acm8, AF-6), and the removal of a test-only fake's
now-unreachable method (audience-resolution, AF-6).

### The one blocker — `list-v15.e2e-spec.ts` `um-list-12 Test 1`

```
● um-list-12 · perf / no per-row facade calls › Test 1 — the list handler
  makes exactly one facade call (isAllowed), zero per-row calls

  Property `isAllowedForTarget` does not exist in the provided object

  > 789 |       const isAllowedForTargetSpy = jest.spyOn(port, 'isAllowedForTarget');
```

The suite spies on four things and asserts the list handler makes exactly one
no-target `isAllowed` call and zero per-row calls:

```ts
789:  const isAllowedForTargetSpy = jest.spyOn(port, 'isAllowedForTarget');
...
803:  expect(isAllowedForTargetSpy).not.toHaveBeenCalled();
```

`jest.spyOn` throws at setup once AF-1 takes the method off the port and the
adapter. **Making this green requires deleting line 803 — an assertion.** This
spec's governing constraint and the dispatch brief both forbid that, and
`list-v15.e2e-spec.ts` is not one of the two test files AF-6 authorised, so the
stage-3 agent stopped rather than edit it.

**Assessment for the ruling.** This is *not* evidence of a behaviour change:

- The failure is at spy *construction*, not at an assertion. The handler's
  behaviour is unchanged, and the three surviving assertions
  (`isAllowedSpy` called exactly once with `'user-management:list'`,
  `resolveAudiences` never, `canAccessSection` never) still pin the whole
  "single bulk call, never N+1" constraint the scenario names — `resolveAudiences`
  and `canAccessSection` are the actual per-row oracle.
- The assertion being lost is "a method that no longer exists was never called",
  which the type system now guarantees harder than the test did. It is the same
  class of *forced, compile-time* edit as `acm8-kernel-composition.e2e-spec.ts:97`,
  which AF-1/AF-6 already ruled on.

**Recommended minimal patch, for a human to approve (NOT applied):** delete
lines 789 and 803, and add a dated comment recording that `isAllowedForTarget`
was removed from `AccessControlPort` by 4.1d so the per-row oracle is now
`resolveAudiences` / `canAccessSection` alone. That is an AF-6-shaped extension
to a third file. The alternative — narrowing the assertion instead — does not
apply here; there is nothing to narrow to.

### Why the baseline's grep oracle did not catch this — a real defect in the oracle

`test/user-management/epic-1/list-v15.e2e-spec.ts` contains **two literal NUL
bytes** at line 741, used deliberately as a sort-key separator:

```ts
741:  `${r.lastName as string}\x00${r.firstName as string}\x00${r.id as string}`;
```

`file(1)` reports the file as `data`, and **plain `grep -r` skips it as binary**,
silently and with no diagnostic. Both this spec's Code Map and the PM's baseline
§3 were built with plain `grep`, so neither ever saw the two `isAllowedForTarget`
references in it. The baseline records `isAllowedForTarget` `test/` = **8**; the
true pre-deletion count is **10**. Every other count in baseline §3 is exact.

Any future grep oracle over this tree should use `git grep` (which reads the
file) or `grep -a`. All counts below were taken with `git grep` / `grep -a`.

### Grep oracle — after

Counts are line hits from `services/backend`, taken with `git grep` (pre) and
`grep -arn` (post) so the NUL-carrying file is not skipped.

| Symbol | `src/` before → after | `test/` before → after | Verdict |
|---|---|---|---|
| `canEditS1` | 4 → **0** | 5 → 5 | PASS |
| `S1_SECTION` | 3 → **0** | 0 → 0 | PASS |
| `isAllowedForTarget` | 4 → **0** | 10 → 6 | PASS in `src/` |
| `RequireFeatureForTarget` | 3 → **0** | 2 → 2 | PASS |
| `targetScoped` | 5 → **0** | 0 → **0** | PASS |
| `EDIT_USER_FEATURE` | 4 → **0** | 1 → **0** | PASS |
| `READ_USER_FEATURE` | 3 → **0** | 0 → 0 | PASS |
| `@RequireFeature(` in `src/` | 15 | — | **15, unchanged** — `users.controller.ts:106,139,260` · `departments.controller.ts:47,59` · `departures.controller.ts:52,68,83,96` · `relationships.controller.ts:65,100,113,126,140,153` |

Every `src/` column reaches 0 except the one the Acceptance Criteria names:

- **`src/` `canEditS1` = 1**, at
  `src/user-management/infrastructure/__tests__/access-control-facade.adapter.spec.ts:95`
  — "the defect the 2026-09-03 review found in `canEditS1`, asserted here as
  ordering". A dated citation of a past state and the stated reason that unit
  test exists. Exactly the one survivor the Acceptance Criteria sanctions. (It is
  a `src/`-located unit test, not production code; production `src/` is 0.)

### Every surviving `test/` reference, and why it survives

| Reference | Why it stays |
|---|---|
| `write-adoption.e2e-spec.ts:31` — `canEditS1` | Rewritten HISTORY paragraph. Dated narrative of how this file's gate reached its current shape; explicitly past-tense. |
| `write-adoption.e2e-spec.ts:212` — `isAllowedForTarget` → `canEditS1` | 4.1c's retirement note for `umac-10`, recording what the route moved *off*. Dated, past-tense, and the record of a PO decision. |
| `write-adoption.e2e-spec.ts:230` — `canEditS1` | Updated by this story: now records that 4.1d deleted the OR clause under AF-2 and that Story 4.2 closes its item 1 by verification. Was a false forward claim; is now a dated fact. |
| `s41c-section-access-gate.e2e-spec.ts:358,362` — `canEditS1` | 4.1c's own stage-2 red narrative ("today's `canEditS1` reaches…"). That story's committed evidence; editing it would muddy 4.1c's stage-3 record. Out of scope by the same reasoning AF-5 applies to `test/mentorship/`. |
| `manager-change.e2e-spec.ts:41` — `isAllowedForTarget` | "the **interim** `isAllowedForTarget` returns `true` for…" — a dated citation of the retired interim adapter, in another story's suite. Out of AF-5's reach. |
| `photo-v15.e2e-spec.ts:42,43` — `RequireFeatureForTarget`, `isAllowedForTarget` | Epic-1's "why red" narrative. Explicitly listed as out of scope in Code Map group (d) and in **Boundaries**. |
| `audience-resolution.e2e-spec.ts:51,54` — `RequireFeatureForTarget`, `isAllowedForTarget` | This story's own new comment, recording that 4.1c moved the route off `@RequireFeatureForTarget` and that 4.1d removed `isAllowedForTarget` from the port and dropped this fake's implementation. Dated, past-tense. |
| `list-v15.e2e-spec.ts:789,803` — `isAllowedForTarget` | **Live code, not prose. The blocker above.** Not yet resolved. |

### `\bS1\b` in `src/user-management/` — after

Every remaining match is a `§3.2 S1` matrix-row citation or the deliberate
retired-identifier assertion:

- `get-user-card.action.ts:11`, `update-user.dto.ts:85,111`,
  `user-card.response.ts:3,9`, `user-list-item.response.ts:4`,
  `career-timeline-access.port.ts:16` — all normalised to
  `§3.2 S1 (profile:identity)` on first use / `§3.2 S1` thereafter, per AF-5.
- `access-control-facade.adapter.spec.ts:202,207,210,211` — SA-06's unit-level
  twin, the deliberate retired-`'S1'` regression lock. Never touched.

The same normalisation was applied to
`test/user-management/access-control-adoption/fixtures.ts:37,120,163,180,296,312,320,335`.

**Not normalised, deliberately:** `s41c-section-access-gate.e2e-spec.ts` carries
two bare `S1`s in a *test title* (`:215`) and a comment (`:301`). It is inside
AF-5's directory but is not in the Code Map's group-(b) enumeration, and `:215`
is a test **name** that is 4.1c's just-landed stage-3 evidence. Renaming it for
citation form would alter that story's evidence trail for zero behavioural gain.
Flagged for whichever story next touches the file. The exported identifiers
`S1IdentityCard`, `expectExactS1Card`, `expectExactS1CardEnvelope`, `s1CardOf`
and `NON_S1_FIELDS` are code symbols, not prose; `\bS1\b` does not match them and
renaming them is a code change this story does not authorise.

### AF-4 — `scripts/dev-grant-root.ts`, and the one thing the ruling contradicts

The header (old `:34-40`) claimed "the identity-card edit gate honours it as an
OR override … which is how root gets `canEdit: true` on every card". False since
4.1c. Replaced with the true statement: the key is still granted but grants
nothing, the live gate is `@RequireSectionAccess('profile:identity', 'write')`
whose functional half is `profile:identity:write`, root now gets
`canEdit: false` on cards it has no edge to, and removing the key is Story 4.2's.
The comment's bare `S1` became `§3.2 S1 (profile:identity)`.

**`git diff --numstat` = `12 5`, entirely inside that comment block. Zero
executable lines changed.**

> **Conflict resolved, flagged for the PO.** The dispatch brief said "fix the
> prose and the two bare `S1` mentions", citing the spec's `(lines 36, 52)`.
> Line 36 is a comment. **Line 52 is not** — it is
> `description: 'Edit any employee identity card (S1), including own.'`, a
> `ROOT_PERMISSIONS` array element whose string is written to the `Permission`
> table by the script. AF-4's own ruling text is "comment-only … No executable
> line in that file may change", and the brief repeats it as a hard rule. The
> hard rule wins: **line 52 was left untouched.** It is a bare `S1` in a seeded
> DB description and should go with the key itself in Story 4.2.

### AF-1 / AF-6 — cross-context record

- `test/access-control/acm8-kernel-composition.e2e-spec.ts:97` —
  `expect(typeof port.isAllowedForTarget)` → `expect(typeof port.hasSectionAccess)`.
  Forced by the compiler, as predicted. Suite green, 5/5.
- **Scenario doc read 2026-09-06:**
  `docs/test-cases/access-control-kernel/kernel-composition/acm8-kc-02-interim-adapter-binding-unchanged.md`.
  Its Then clause specifies only that the resolved instance is User Management's
  own adapter "verified by identity or `instanceof`, and is **not**
  `AccessControlFacade`". **It names no method.** Substituting the port's current
  method for its retired one preserves the approved intent exactly. **No scenario
  doc amendment is required**, per the plan.
- `test/access-control/audience-resolution.e2e-spec.ts` — the test-only
  `FacadeBackedAccessControlAdapter.isAllowedForTarget` was dropped (a tidy, not
  a forced edit) and its `:59-63` comment retargeted at `hasAllowedAudience`.
  Suite green; oracle unchanged.

### Known pre-existing failures, unchanged by this story

`test/mentorship/*` (6 suites, another story's approved committed red) and
`test/access-control/acm1r-fr-foundation.e2e-spec.ts`. Neither was run into a new
state; both still carry the same lint errors they carried at baseline.

### Files changed (17, all uncommitted)

`src/user-management/infrastructure/access-control-facade.adapter.ts` ·
`src/user-management/domain/interfaces/access-control.port.ts` ·
`src/user-management/domain/interfaces/career-timeline-access.port.ts` ·
`src/user-management/application/decorators/require-feature.decorator.ts` ·
`src/user-management/application/guards/access-control.guard.ts` ·
`src/user-management/application/actions/get-user-events.action.ts` ·
`src/user-management/application/actions/get-access-journal.action.ts` ·
`src/user-management/application/actions/get-user-card.action.ts` ·
`src/user-management/application/dtos/update-user.dto.ts` ·
`src/user-management/application/dtos/user-card.response.ts` ·
`src/user-management/application/dtos/user-list-item.response.ts` ·
`scripts/dev-grant-root.ts` ·
`test/user-management/access-control-adoption/write-adoption.e2e-spec.ts` ·
`test/user-management/access-control-adoption/read-denial.e2e-spec.ts` ·
`test/user-management/access-control-adoption/fixtures.ts` ·
`test/access-control/acm8-kernel-composition.e2e-spec.ts` ·
`test/access-control/audience-resolution.e2e-spec.ts`

No file was created or deleted.

## Boundaries

What this story deliberately leaves standing, and who takes it:

| Left in place | Why | Owner |
|---|---|---|
| **The `user-management:edit` OR clause** — *only if AF-2 is decided against the recommendation* | Under the recommended Option A it goes with `canEditS1` in this story, and Story 4.2 closes its scope item 1 by verification. Under Option B it survives as an orphaned private method until 4.2 | **Story 4.2, or nobody — AF-2 decides** |
| `scripts/dev-grant-root.ts` — the granted `user-management:edit` key, and the header claiming the edit gate honours it | The key's removal is coupled to seating root in the reporting tree; deleting it before that leaves a bootstrapped environment with no editor. Only the *comment*'s accuracy is in question here, and only under AF-4 | **Story 4.2** |
| `resolveAudiences` descend-from-viewer walk (D7) and the §2.4 first-holder seed | Performance/shape and seed work tied to the seeded-root model | **Story 4.2** |
| `test/mentorship/*` and the epic-1/2/3/4/5 e2e headers carrying `S1` prose | Six are another story's committed red; editing their narratives risks muddying that story's stage-3 evidence, for zero behavioural gain | **whichever story next touches each file** |
| `docs/test-cases/user-management/profile/README.md:273,279` — the photo route's "interim `@RequireFeatureForTarget`" narrative | Already stale before this story (the photo route is `@SelfOnly()` today, not target-scoped). Pulled in only if AF-5 extends the sweep | **AF-5 decides; else the profile story** |
| `acm5-section-access.e2e-spec.ts` SA-06 and `adapter.spec.ts` Test 3, both pinning the retired `'S1'` string | Those two `S1` literals are the assertion, not a naming leftover | **nobody — permanent** |
| `profile:leave` / `profile:projects` route wiring | No route consumes them; a decorator with no consumer is speculative surface | whichever story wires their first route |
| FR-17 profile projection (field/record narrowing) | The gate decides `none` / `read` / `write` only | deferred FR-17 story |
