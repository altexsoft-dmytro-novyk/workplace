---
title: 'UMAC-1 Stage 2 — real-consumer HTTP READ E2E (committed red)'
type: 'chore'
created: '2026-09-01'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: '2c728864a277af335a44dd5c9af8dfc4e6e2aa8f'
baseline_revision_backend: '619220da00469eceafd4fd33c9c48680bf1e3f68'
context:
  - '{project-root}/_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md'
  - '{project-root}/docs/test-cases/user-management/access-control-adoption/README.md'
  - '{project-root}/docs/architecture/testing-strategy.md'
  - '{project-root}/services/backend/.claude/rules/nest-e2e.md'
warnings: [oversized]
deferred:
  - summary: >-
      expectLeakFreeBody only inspects the JSON response body, never response
      headers, for the umac-05 "no existence distinction" denial guarantee.
    evidence: |-
      umac-05-unresolved-session-read-denied.md requires a forbidden and a
      missing target to be indistinguishable, but the fixtures.ts helper and
      every umac-05 test only assert res.body — response headers are
      unchecked. Pre-existing helper limitation, not introduced by this
      story's realignment.
    location: >-
      services/backend/test/user-management/access-control-adoption/fixtures.ts
      (expectLeakFreeBody)
    severity: low
  - summary: >-
      No E2E case exercises a structurally malformed (non-UUID) GET
      /users/:id target id; behavior (400 vs 403) is unverified.
    evidence: |-
      umac-05 Test 3 uses a syntactically valid but non-existent UUID; no
      approved umac-0x scenario doc addresses a malformed id, so this suite
      asserts nothing either way. A Prisma query against a non-UUID string
      could throw and surface as 500 instead of a clean 4xx.
    location: >-
      services/backend/test/user-management/access-control-adoption/read-denial.e2e-spec.ts
    severity: low
---

<intent-contract>

## Intent

**Problem:** UMAC-1 Stage 1 (scenario prose `umac-01..06` + folder `README.md`)
is independently approved (Dmytro Novyk, 2026-09-01; `approvals.yaml`, commits
`5fe0bb8` / `dffe20a`, author != approver). A Stage-2 E2E suite was committed
prematurely in `986e90a` / `0681939` (before any Stage-1 approval — the AD-1
ordering violation `testing-strategy.md` names). Its read specs diverge from the
approved scenarios: `read-adoption.e2e-spec.ts` asserts a bare S1 card, not the
approved `{ data, canEdit }` envelope; `read-denial.e2e-spec.ts` asserts the
withdrawn "leak-free `404`", not `403`.

**Approach:** Bring the pre-committed **read** suite into line with the approved
`umac-01..06` scenarios and leave it committed **red**. No production code
changes; the port stays bound to `InterimAccessControlAdapter` and `findOne`
still returns the whole-row `toUserResponse`, so the envelope, absent-technical-
field, and `403` assertions all fail until `UMAC-1-production` lands. Stop for
independent human approval — write nothing to `approvals.yaml`.

## Boundaries & Constraints

**Always:**
- **Test code only, committed red.** All work is in `services/backend/test/`.
  Change no file under `services/backend/src/`, `prisma/`, a migration, `seed.ts`,
  or `src/access-control/**`.
- **Reconciliation: accept the pre-committed suite with alignments.** `fixtures.ts`
  is already AD-3-clean (real `AppModule`, real Prisma / migrated PostgreSQL, no
  `overrideProvider`, real `User` + `Relationship` rows, `Bearer <token:<uuid>>`).
  Realign only what diverges from the approved scenarios; do not revert-and-rewrite.
- **One test per approved scenario, `UMAC-0x` id in the test title.** Files:
  `read-adoption.e2e-spec.ts` (`umac-01..04`), `read-denial.e2e-spec.ts`
  (`umac-05`), `no-target-permission.e2e-spec.ts` (`umac-06`).
- **`GET /users/:id` success body = `{ data, canEdit }`.** For every read case
  (self / reporting / pp / colleague) assert `200` and: `res.body.data` deep-equals
  exactly the 12 S1 fields (`id, firstName, lastName, photo, position, country,
  city, workEmail, workPhone, birthDay, birthMonth, companyJoinDate`); `ttId`,
  `isActive`, `customFields`, `createdAt`, `createdBy` are absent from `data`;
  `Object.keys(res.body)` is exactly `['canEdit','data']`; and
  `res.body.canEdit === false` for all four. Add a code comment: self / reporting /
  pp flip to `canEdit: true` after the UMAC-2 kernel-seed sequence for
  `user-management:edit`; colleague stays `false` (`canAccessSection` → `'read'`).
- **Denials are `403`, never `404`.** `umac-05` — `Bearer <token:Bob>` (unresolved
  id), a deactivated caller, and a valid active caller against an inactive/missing
  target each assert `403` (via `AccessControlGuard` under the interim session
  resolver). Add a comment: `Bearer <token:Bob>` and the deactivated caller reach
  the target end state `401` once the real magic-link middleware lands — do not
  assert `401`. Keep a leak-free-body assertion on each. There is no `404` branch.
- **`umac-06` keeps its committed-red anchor.** Test 4 — an impostor whose
  `User.position` is `'HR Admin'` with no FR grant chain — asserts `403` on
  `GET /users`, `POST /users`, `DELETE /users/:id`; red today because the interim
  adapter's prohibited `position === 'HR Admin'` check allows it. Tests 1–3 (root
  allowed; unrelated / Ida denied) stay as green characterization.
- **`fixtures.ts`** — add an envelope-aware assertion helper; keep the file
  coherent (single run-scoped UUID namespace, wrapped teardown, canonical
  permission rows reused not deleted). `expectExactS1Card` / `s1CardOf` /
  `expectLeakFreeBody` stay usable.
- Follow `services/backend/.claude/rules/nest-e2e.md`: unprefixed routes,
  `ValidationPipe` re-enabled in bootstrap, `import request from 'supertest'`,
  real preconditions produced in-suite (never a hardcoded id).
- The suite MUST fail on a fresh run. Capture the red run (exit code + failing
  assertions + why) in `## Verification`.

**Block If:**
- Aligning the read suite would require editing any `services/backend/src/**`,
  `prisma/**`, a migration, `seed.ts`, or `src/access-control/**` file.
- An approved scenario has more than one defensible translation with observably
  different assertions and neither the SPEC, `um-integration-contract-response.md`,
  nor `access-control.md` selects between them.

**Never:**
- No production code. No `approvals.yaml` entry. No approval assertion. No commit
  unless this workflow itself commits; no push.
- Do not touch `write-adoption.e2e-spec.ts` (UMAC-2 scope; carries its DEFERRED
  banner from `619220d`).
- Do not silently rewrite `profile.e2e-spec.ts` (`um-pf-01..04`) beyond keeping it
  green — surface the real-persona-vs-tightened-scope question for human decision.
- Do not add a green test that would pass under the interim adapter as the *only*
  coverage of an approved read scenario.

</intent-contract>

## Code Map

Read-only anchors — no `src/` file is edited by this story.

- `services/backend/test/user-management/access-control-adoption/fixtures.ts` --
  shared bootstrap + `RunFixtures` (real `user()`, `reportsTo()`,
  `peoplePartnerOf()`, `grantFunctionalRole()`), `S1_CARD_FIELDS`,
  `NON_S1_FIELDS`, `expectExactS1Card`, `s1CardOf`, `expectLeakFreeBody`. **Edit:**
  add `expectExactS1CardEnvelope(body, expectedCard, expectedCanEdit)` asserting
  `body.data` deep-equals the card, `body.canEdit === expectedCanEdit`,
  `Object.keys(body)` is exactly `['canEdit','data']`, and `NON_S1_FIELDS` absent
  from `body.data`.
- `.../read-adoption.e2e-spec.ts` -- `umac-01..04`. **Edit:** swap
  `expectExactS1Card(res.body, …)` for `expectExactS1CardEnvelope(res.body,
  s1CardOf(x), false)`; refresh the WHY-RED docstring (now also red because the
  body is not enveloped).
- `.../read-denial.e2e-spec.ts` -- `umac-05`. **Edit:** `404` → `403` in all
  three tests, `describe`/`it` titles and docstring ("leak-free 404" → "403
  denial"); keep `expectLeakFreeBody`; add the `401`-end-state comment.
- `.../no-target-permission.e2e-spec.ts` -- `umac-06`. **Verify against
  `umac-06`.** Already aligned (Test 4 impostor = the red anchor; Tests 1–3
  green). Touch only if a divergence is found.
- `.../write-adoption.e2e-spec.ts` -- UMAC-2; DEFERRED banner. **Do not touch.**
- `services/backend/test/user-management/profile.e2e-spec.ts` -- `um-pf-01..04`;
  `Bearer <token:Bob>`/`<token:Alice>` literals + bare-row read assertions.
  Break under `UMAC-1-production`. **Recommendation only — see Design Notes.**
- `src/user-management/application/controllers/users.controller.ts:81-85` --
  `findOne` → `toUserResponse` (whole row). CAP-3 target of Stage 3.
- `src/user-management/application/dtos/user.response.ts:10` -- `toUserResponse`
  spreads the whole `User` row; no envelope.
- `src/user-management/infrastructure/interim-access-control.adapter.ts` --
  `isAllowedForTarget` → `Boolean(userId)` (read leak); `isAllowed` → prohibited
  `position === 'HR Admin'`. Bound at `user-management.module.ts:36`.
- `src/user-management/application/guards/access-control.guard.ts:51-53` --
  denied `isAllowed[ForTarget]` → `ForbiddenException` (`403`). Unchanged; this is
  `umac-05` / `umac-06` Test 4's intended denial.
- `src/access-control/application/access-control.facade.ts` -- `isAllowed`,
  `resolveAudiences` (empty `Set` for unconfirmed viewer/target),
  `canAccessSection(v,'S1',t)`. Consumed only via the Stage-3 adapter.

## Tasks & Acceptance

**Execution:**
- `fixtures.ts` -- add `expectExactS1CardEnvelope`; leave the rest coherent.
- `read-adoption.e2e-spec.ts` -- retarget `umac-01..04` at the envelope +
  `canEdit === false`; update docstring.
- `read-denial.e2e-spec.ts` -- retarget `umac-05` Tests 1–3 at `403`; titles +
  docstring; `401`-end-state comment; keep leak-free-body checks.
- `no-target-permission.e2e-spec.ts` -- verify against `umac-06`; align only on a
  real divergence.
- Run `npm run test:e2e` for the three files; record the red run.

**Acceptance Criteria:**
- Given the aligned suite, when `read-adoption.e2e-spec.ts` runs against current
  `main`, then `umac-01`, `umac-02` (both), `umac-03`, `umac-04` each fail on the
  envelope assertion (`res.body.data` undefined / `res.body.canEdit` undefined /
  key-set mismatch), not on status.
- Given `read-denial.e2e-spec.ts` on current `main`, then `umac-05` Test 1 and
  Test 2 fail asserting `403` (interim returns `200`), and Test 3 fails asserting
  `403` (interim returns `404`).
- Given `no-target-permission.e2e-spec.ts` on current `main`, then `umac-06`
  Test 4 fails asserting `403` (interim returns `200`/`201`/`200`); Tests 1–3
  pass.
- Given the whole change, when `git diff --stat` is inspected, then only files
  under `services/backend/test/user-management/access-control-adoption/`
  (excluding `write-adoption.e2e-spec.ts`) changed; nothing under `src/`,
  `prisma/`, or `test/user-management/profile.e2e-spec.ts`.
- Given `testing-strategy.md` AD-1, when this dispatch ends, then no production
  code and no `approvals.yaml` entry were written and it stops for independent
  human approval; the suite is committed red.

## Spec Change Log

## Review Triage Log

### 2026-09-01 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 2: (high 0, medium 0, low 2)
- reject: 12: (high 0, medium 0, low 12)
- addressed_findings:
  - none

Four parallel layers ran (blind-hunter, edge-case-hunter, verification-gap,
intent-alignment). Notable rejects, verified rather than assumed:
- "Not committed yet" (blind-hunter + intent-alignment divergence) — accurate
  at review time but resolved by this step's own Finalize (commits before
  halting `done`); not a defect.
- "Verification totals don't add up (12 != 5+3)" — false; the recorded run
  command already names all three files (`read-adoption` 5 + `read-denial` 3 +
  `no-target-permission` 4 = 12), confirmed by an independent rerun in
  verification-gap's own review.
- "986e90a/0681939 citation imprecise" — checked directly: workspace `986e90a`
  and backend `0681939` are a matched cross-repo commit-message pair ("verify
  all docs, create tests", timestamps 7s apart); `986e90a`'s *gitlink* lags
  to `e9d80ec` and only advances to `0681939` at the next workspace commit
  `94a06b5` — a separate, unrelated bookkeeping fact. Citation is correct.
- `expectExactS1Card` now only self-referenced inside `fixtures.ts` — verified
  harmless (no lint/tsc flag; kept exported for reuse by later UMAC stages).
- `fixtures.ts`'s new export not separately checked against
  `write-adoption.e2e-spec.ts` — verified via the clean `tsc --noEmit` run
  (purely additive change; the other consumer compiles unaffected).
- Null-value S1 fields and non-approved edge shapes (non-UUID malformed
  target id, response-header leak-freedom) are real but outside what
  `umac-01..06` require — the two genuine, low-severity gaps are recorded in
  frontmatter `deferred`; the rest are routed `reject` per Scope authority
  (the approved scenario docs, not this spec's own language, decide scope).
- `canEdit === true` is never exercised (a hardcoded `false` would pass every
  assertion here) — correct for this story: `umac-01..06` require `false` for
  all four cases today; a `canEdit: true` case is UMAC-2's, once
  `user-management:edit` is seeded.

## Design Notes

### Red-assertion map (one committed-red assertion per approved scenario)

This suite is committed **red**: verification confirms the tests FAIL on current
`main` for the reasons below, not that they pass. They go green when
`UMAC-1-production` rebinds the port and ships the `{ data, canEdit }` mapper.

| Scenario / test | Real state seeded in-suite | Assertion | Red now because |
|---|---|---|---|
| umac-01 Self | `GET /users/<V>` as `Bearer <token:<V>>` | `200`; `body.data` = 12 S1 fields; `body.canEdit === false`; keys exactly `['canEdit','data']` | interim `findOne` returns whole-row `toUserResponse` — no envelope; technical fields present |
| umac-02 Test 1 direct report | real `Relationship` `T→V type=direct`; GET `/users/<T>` as V | same envelope; `canEdit false` | envelope/projection absent |
| umac-02 Test 2 transitive | real chain `T→M→V` both `direct` | same envelope | envelope/projection absent |
| umac-03 assigned PP | real `Relationship` `T→V type=people_partner` | same envelope; `canEdit false` | envelope/projection absent |
| umac-04 colleague | no edge, V≠T, both active | identical `data`; `canEdit false` (section access) | status already `200`; only envelope/projection is red |
| umac-05 Test 1 | `Bearer <token:Bob>`; active target | `403` (+ leak-free body) | interim `isAllowedForTarget → Boolean('Bob')` → `200` whole row |
| umac-05 Test 2 | caller row `isActive:false` | `403` | interim `Boolean(<uuid>)` → `200` |
| umac-05 Test 3 | valid active V; target id matches no active `User` | `403` (no existence distinction) | interim passes guard → `GetUserAction` → `NotFoundException` → `404` |
| umac-06 Test 4 impostor | `User.position='HR Admin'`, zero FR grant; `GET`/`POST /users`, `DELETE /users/:id` | `403` on all three | interim `position === 'HR Admin'` check → `200`/`201`/`200` |
| umac-06 Tests 1–3 | root+FR grant / unrelated / Ida | allowed / `403` / `403` | green characterization (kept, not the red anchor) |

### `expectExactS1CardEnvelope`

```ts
export function expectExactS1CardEnvelope(
  body: unknown,
  expectedCard: Record<string, unknown>,
  expectedCanEdit: boolean,
): void {
  const b = (body ?? {}) as Record<string, unknown>;
  expect(Object.keys(b).sort()).toEqual(['canEdit', 'data']);
  expect(b.canEdit).toBe(expectedCanEdit);
  expectExactS1Card(b.data, expectedCard); // reuse: deep-equal + key-set + NON_S1 absent
}
```

### `canEdit` is `false` for all four reads — for two different reasons

self / reporting / pp: `canAccessSection` → `'write'`, but `user-management:edit`
is unseeded so `isAllowed` fails closed. Colleague: `canAccessSection` → `'read'`,
so `canEdit` is `false` regardless of any permission and never flips. Comment
both in the specs.

### `profile.e2e-spec.ts` (`um-pf-01..04`) — recommendation, human decision

`um-pf-01`/`03`/`04` do `GET /users/:id ... .expect(200)` with
`Bearer <token:Bob>` and read `readBody.position` / `.workEmail` / `.ttId`
directly. After `UMAC-1-production`: (a) the GET body becomes `{ data, canEdit }`
so every bare-field read is `undefined`; (b) `Bearer <token:Bob>` / `<token:Alice>`
resolve to non-existent ids → empty audience → `403` on the GET (and, once the
new adapter answers `user-management:edit`, on the `PATCH` too). The suite is
green today and this story does not touch it. **Recommendation:** fold `um-pf-01`
(manager-line edit persists) and `um-pf-02` (self photo) into the **UMAC-2**
Stage-2 dispatch, rebuilt on seeded real personas with real `Relationship` edges
and envelope-aware read assertions — UMAC-2 already owns the authorized
`PATCH` / `PUT photo` E2E. Keep `um-pf-03` / `um-pf-04` (409 uniqueness on
`workEmail` / `ttId`) as data-correctness tests but move their post-write read to
`res.body.data.*` and give the actor a real self-persona. Net: `profile.e2e-spec.ts`
needs real personas, not just a scope note — but that is a UMAC-2 call, recorded
here, not made now.

### Why not revert-and-rewrite

The pre-committed `fixtures.ts` already satisfies every AD-3 / `nest-e2e.md`
requirement the dispatch names (real `AppModule`, migrated PostgreSQL, no
overrides, real `Relationship` rows, run-scoped UUID teardown, seeded-UUID
bearer). Reverting would recreate substantially the same file. The divergence is
localized to two assertion styles (`404`→`403`, bare card → envelope), so a
targeted realignment is the smaller, more reviewable change and keeps the
scenario-id ↔ test-title mapping intact.

## Verification

**Commands:**
- `cd services/backend && npm run test:e2e -- test/user-management/access-control-adoption/read-adoption.e2e-spec.ts test/user-management/access-control-adoption/read-denial.e2e-spec.ts test/user-management/access-control-adoption/no-target-permission.e2e-spec.ts`
  -- expected: non-zero exit; `umac-01..05` all-red on the envelope / `403`
  assertions, `umac-06` Test 4 red, `umac-06` Tests 1–3 green. Record the exact
  failure lines under `## Auto Run Result`.
- `cd services/backend && npx tsc --noEmit` -- expected: clean (test files
  compile).
- `cd services/backend && npm run lint` -- expected: clean for the changed files.
- `git -C services/backend diff --stat` -- expected: only
  `test/user-management/access-control-adoption/{fixtures.ts,read-adoption.e2e-spec.ts,read-denial.e2e-spec.ts}`
  (and `no-target-permission.e2e-spec.ts` only if a divergence was found).

## Auto Run Result

**Executed 2026-09-01 against `services/backend` @ `619220d` (baseline), working tree with the three test-file edits applied. PostgreSQL up (`backend-postgres-1`), migrated schema.**

### `npm run test:e2e -- read-adoption.e2e-spec.ts read-denial.e2e-spec.ts no-target-permission.e2e-spec.ts`

`Test Suites: 3 failed, 3 total` · `Tests: 9 failed, 3 passed, 12 total` · **exit 1** (committed red, as required).

| Test | Result | Failing assertion / why |
|---|---|---|
| `read-adoption` UMAC-01 Self | RED | `expectExactS1CardEnvelope` → `Object.keys(body)` is the ~17 whole-`User` columns, not `['canEdit','data']`; `body.data` / `body.canEdit` undefined. Interim adapter leaves `findOne` on whole-row `toUserResponse` — no envelope. |
| `read-adoption` UMAC-02 Test 1 direct report | RED | same — body not enveloped |
| `read-adoption` UMAC-02 Test 2 transitive | RED | same — body not enveloped |
| `read-adoption` UMAC-03 assigned PP | RED | same — body not enveloped |
| `read-adoption` UMAC-04 colleague | RED | same — body not enveloped (status already `200`; only the envelope/projection is red) |
| `read-denial` UMAC-05 Test 1 `Bearer <token:Bob>` | RED | `expect(res.status).toBe(403)` — interim `isAllowedForTarget → Boolean('Bob')` → **`200`** whole row |
| `read-denial` UMAC-05 Test 2 deactivated caller | RED | `expect(res.status).toBe(403)` — interim `Boolean(<uuid>)` → **`200`** |
| `read-denial` UMAC-05 Test 3 missing target | RED | `expect(res.status).toBe(403)` — interim passes guard → `GetUserAction` `NotFoundException` → **`404`** |
| `no-target-permission` UMAC-06 Test 4 impostor | RED | `expect(list.status).toBe(403)` — interim `position === 'HR Admin'` check → **`200` / `201` / `200`** |
| `no-target-permission` UMAC-06 Test 1 root allowed | GREEN | green characterization (kept) |
| `no-target-permission` UMAC-06 Test 2 unrelated denied | GREEN | green characterization (kept) |
| `no-target-permission` UMAC-06 Test 3 Ida denied | GREEN | green characterization (kept) |

Matches the Design Notes red-assertion map exactly: `umac-01..05` all-red on the envelope / `403` assertions, `umac-06` Test 4 red, `umac-06` Tests 1–3 green.

### `npx tsc --noEmit`

Clean for the three changed files. Three **pre-existing, unrelated** errors remain under `test/user-management/epic-4/**` (`department-change`, `manager-change`, `people-partner-change` — `TS2345` on `supertest` body arg); confirmed present on baseline `619220d` via `git stash`, not introduced here.

### `npm run lint` (changed files)

`npx eslint test/user-management/access-control-adoption/{fixtures.ts,read-adoption.e2e-spec.ts,read-denial.e2e-spec.ts}` — clean, no output.

### `git -C services/backend diff --stat`

```
 .../access-control-adoption/fixtures.ts            | 25 +++++++
 .../access-control-adoption/read-adoption.e2e-spec.ts | 58 ++++++++++++----
 .../access-control-adoption/read-denial.e2e-spec.ts   | 81 ++++++++++++----------
 3 files changed, 114 insertions(+), 50 deletions(-)
```

Only the three files the story names. `no-target-permission.e2e-spec.ts` unchanged — verified aligned with `umac-06` (Test 4 = the red anchor, Tests 1–3 green characterization), no divergence found. Nothing under `src/`, `prisma/`, `seed.ts`, `src/access-control/**`, `write-adoption.e2e-spec.ts`, or `test/user-management/profile.e2e-spec.ts` touched. No `approvals.yaml` entry written. No commit, no push.

### Open item for human decision (recorded, not acted on)

`profile.e2e-spec.ts` (`um-pf-01..04`) still carries `Bearer <token:Bob>` / `<token:Alice>` literals and bare-row read assertions that break under `UMAC-1-production` (enveloped body + unresolved-session `403`). Per Design Notes: fold `um-pf-01` / `um-pf-02` into the UMAC-2 Stage-2 dispatch on seeded real personas; keep `um-pf-03` / `um-pf-04` (409 uniqueness) but move their post-write read to `res.body.data.*` with a real self-persona. This is a UMAC-2 call — not made here.

### Review findings breakdown (2026-09-01 pass)

Four parallel layers (blind-hunter, edge-case-hunter, verification-gap, intent-alignment): 0 `intent_gap`, 0 `bad_spec`, 0 `patch`, 2 `defer` (both low), 12 `reject`. Full detail in `## Review Triage Log` above. Nothing was patched (no fix was needed); the two deferred items are recorded in frontmatter `deferred` (JSON-body-only leak-free check; no malformed-non-UUID-target-id coverage) — both real, both pre-existing/out of the approved `umac-01..06` scope, neither blocking.

**Follow-up review recommendation: `false`.** Patched-finding score for this pass = 0 (no patches applied) → below the `3×medium + 1×low ≥ 5` threshold and no high-severity patch.

### Residual risks

- The suite is realigned and red for the intended reasons, but it is **not yet a permanent, independently-inspectable commit** until this workflow's Finalize step commits it — until then, the next stage (`UMAC-1-production`) has nothing in `services/backend` history to record in `approvals.yaml`'s `commit` field. This run's Finalize step commits before halting `done`.
- `profile.e2e-spec.ts` breakage under `UMAC-1-production` is documented but unresolved — a human must decide the UMAC-2 fold-in vs. tightened-scope-note question before that later dispatch.
- The two deferred gaps (response-header leak-freedom, malformed non-UUID target id) are real but low-severity and outside `umac-01..06`'s scope; left for whichever future story owns that edge.
