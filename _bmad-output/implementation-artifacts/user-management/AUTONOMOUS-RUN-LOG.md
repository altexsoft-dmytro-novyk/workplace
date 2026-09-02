# Autonomous run log — User Management backend

---
## ☀️ READ FIRST (wake-up summary, 2026-09-02 ~09:10 BST)

**Done this run — Epic 1 Stories 1.1, 1.3, 1.5 all through all 3 AD-1 stages.** Everything uncommitted on `dn-um-implementation` (both repos). Approvals recorded in `epic-1-approvals.yaml` under your autonomous authorization — review and re-sign / adjust as you see fit.

| Story | Result |
|---|---|
| **1.1 Import** | `POST /users/import` (HR-Admin, multipart, `user-management:create`) + `db:import:population` deploy script. New schema: `Department`, `DepartmentMembership`, `EmploymentStatus`, `UserEvent` + migration `20260902001941_story_1_1_import_population`. `POST /users` / `RegisterUserAction` / `CreateUserDto` **deleted** (AD-21). `seed.e2e-spec.ts` 19/21 (2 blocked: um-seed-11 T3 → Epic 2). `User.city` → nullable. |
| **1.3 Photo** | `PUT /users/:id/photo` rebound to `@SelfOnly()` (new `self-only.decorator.ts` + `self-only.guard.ts`) — drops the unseeded `user-management:upload-photo`. 5 MiB + `image/jpeg\|png\|webp` validation, `503` on storage-down. `photo-v15.e2e-spec.ts` 19/21 (um-photo-09 T1 → UMAC-2). Also flipped `write-adoption` UMAC-09 photo tests green. |
| **1.5 List** | `GET /users` → 13-key fixed projection (`user-list-item.response.ts`), `EmploymentStatus` join for the dismissed filter, `?employmentStatus=`, `forbidNonWhitelisted → 400`, sort `lastName,firstName,id`, `totalPages`, default pageSize 25. `list-v15.e2e-spec.ts` **32/33** (1 todo = deferred perf). 0 regressions. |
| **umac-06** | realigned (`POST /users` → `POST /users/import` as the 3rd no-target route). 4/4 green. |

**tsc:** only the 3 pre-existing `test/user-management/epic-4/*` `TS2345` errors. **lint:** 12 pre-existing, all in files this run did not touch.

### Needs your decision / attention
1. **Story 1.2 (Edit Identity Card) is blocked** on `user-management:edit` — the permission doesn't exist and *who holds it* is undecided. GET is already shipped (UMAC-1). See `_bmad-output/implementation-artifacts/access-control/user-management-edit-permission-options.md` (options + recommendation) + Story 1.2 Stage-1 scenarios (`docs/test-cases/user-management/profile/um-edit-*` or reconciled `um-pf-*`). This also unblocks UMAC-2 write path.
2. **`src/storage/infrastructure/s3-storage.adapter.ts`** — one small change OUTSIDE `user-management/` (endpoint now prefers `process.env.AWS_ENDPOINT_URL`). Defensible + needed for the storage-outage test; flagging because it's cross-context.
3. **Autonomous approvals** in `epic-1-approvals.yaml` are recorded as "Dmytro Novyk (autonomous authorization 2026-09-02)" with `commit: UNCOMMITTED-*` — they need real commit SHAs once you commit, and a real per-artifact look if you want the ledger airtight.
4. **In-scenario decisions** (~40 across 1.1/1.3/1.5) accepted autonomously — each story's `docs/test-cases/.../README.md` has the "confirm at approval" list. Notable: Story 1.5 projection is 13 keys not 12 (added `employmentStatus`, FR-15); `Department` identity = `(externalId, name)` pair; `EmploymentStatus` CHECK relaxed for import-origin dismissals.
5. **Commit granularity:** the working tree spans 3 stories + a migration + the umac-06 fix. Suggest committing per-story (the `epic-1-approvals.yaml` notes list each story's files) rather than one blob.

### My mistake this run
Dispatched Story 1.3 + 1.5 Stage 3 in parallel; both edit `users.controller.ts`. Resolved OK (verified both survived), but noted in memory — Stage-3 dispatches in one context are now serialized.

---


**Started 2026-09-02 (~00:05 BST)** on Dmytro's instruction: "implement it
autonomously ..." Branch `dn-um-implementation`, both repos. **No git operations** — every
change is left on the working tree for review + commit on wake.

## Standing rules for this run
- No `git` writes (commit/add/push/branch/reset). User does all git.
- Backend only. No `services/frontend/**`.
- AD-1 stages still run one dispatch each (not one-shot); an independent review
  pass between scenario/test/production stages where feasible. Approvals
  recorded under the autonomous authorization in `epic-1-approvals.yaml`.
- Schema changes go via a real Prisma migration + the raw-SQL CHECK/partial-index
  pattern `database-schema.md` documents.

## Queue (priority order)
1. **Story 1.1 — Import Seeded Population** — Stage 1 ✅ · Stage 2 (red E2E) · Stage 3 (schema + migration + import service + `POST /users/import`).
2. **Story 1.3 — Self Uploads Photo** — `PUT /users/:id/photo` multipart + real S3/LocalStack `ObjectStoragePort` (AD-15), Self-only. 3 stages.
3. **Story 1.5 — List Employees** — `GET /users` list/filter/paginate, fail-closed projection, dismissed-via-EmploymentStatus filter, NFR-2. 3 stages.
4. **`user-management:edit` kernel seed** — 3-stage kernel AD-1 sequence (unblocks 1.2 PATCH + UMAC-2).
5. **Story 1.2 — Edit Identity Card** — `PATCH /users/:id` data-correctness (GET already shipped by UMAC-1). 3 stages.

## Log

### Story 1.1
- **Stage 1 (scenarios)** — DONE (pre-run). 13 files `docs/test-cases/user-management/seed/um-seed-01..13` + README. Full doc reconciliation across ~21 files (see `epic-1-story-1-1-decisions.md`). Approval recorded in `epic-1-approvals.yaml` under autonomous authorization.
- **Stage 2 (red E2E)** — DONE 2026-09-02. `test/user-management/epic-1/seed.e2e-spec.ts` rewritten (20 `it` + 1 `it.todo`, one describe per `um-seed-01..13`), `test/user-management/epic-1/fixtures.ts` additive helpers (`toDeliveredCsv`, `ImportSummary`, `cleanupImportedRows`). Red run: 20 failed / 1 todo, jest exit 1 — route 404, tables absent, `POST /users` still wired, `db:import:population` missing. tsc + lint clean on the 2 files. Approval recorded (autonomous auth). Carry-over: `um-seed-11 T3` (needs Epic 2 real sessions) + `um-seed-13 T2` (needs a fault-injection seam) stay red past Stage 3.
- **Stage 3 (production)** — DONE 2026-09-02. Schema + migration `20260902001941_story_1_1_import_population` (Department, DepartmentMembership, EmploymentStatus, UserEvent; raw-SQL partial indexes + relaxed CHECK; `User.city` nullable). `population-import.service` + port + `import-population.action` + `POST /users/import` (multipart, no-target `user-management:create`) + `population-import.repository` + `scripts/import-population.ts` + `db:import:population`. **`POST /users` / `RegisterUserAction` / `CreateUserDto` DELETED** (AD-21). `seed.e2e-spec.ts` 19/21 green (um-seed-11 T3 + um-seed-13 T2 documented-blocked). tsc = 3 known epic-4 errors. `db:deploy` clean on fresh DB. Approval recorded.
  - **⚠️ Regression for human gate:** `test/user-management/access-control-adoption/no-target-permission.e2e-spec.ts` (umac-06, an approved UMAC-1 suite) tested `POST /users` → all 4 tests now 404. Expected — UMAC-1's own umac-06 scenario said "POST /users retirement is an Epic 1 concern". Realignment (umac-06 scenario + test → use `POST /users/import` as the third no-target `user-management:create` route) — dispatched separately 2026-09-02.

### umac-06 realignment (Epic 0 / UMAC-1 test) — DONE 2026-09-02
- `docs/test-cases/user-management/access-control-adoption/umac-06-*.md` + `test/user-management/access-control-adoption/no-target-permission.e2e-spec.ts` → the third no-target `user-management:create` route is now `POST /users/import` (was `POST /users`, deleted by Story 1.1 / AD-21). **4/4 green.** Test 4 (impostor) flipped red→green (real facade adapter delegates `isAllowed`, no `position` check). No new tsc errors. **Story 1.1's one regression is now resolved.**
- This modifies an approved UMAC-1 artifact — the change is a faithful route substitution keeping umac-06's intent (no-target `isAllowed` delegation) intact; recorded here for Dmytro's awareness, no re-approval needed for the substitution.

### Story 1.3 — Self Uploads Photo
- Stage 1 (scenarios) — DONE 2026-09-02. 9 `um-photo-01..09` + `profile/README.md`; `um-pf-02` → superseded pointer. **`PUT /users/:id/photo` already exists** with real S3/LocalStack storage — Stage 3 is a refinement: Self-only identity check (drop unseeded `upload-photo` gate), `403` not `404`, 5 MiB + `image/jpeg|png|webp`, `503` on storage-down, orphan cleanup deferred. Approval recorded.
- Stage 2 (red E2E) — DONE 2026-09-02. `test/user-management/epic-1/photo-v15.e2e-spec.ts`, 11 fail / 9 pass / 1 todo. Red: route still gates on unseeded `user-management:upload-photo`. Real LocalStack, no overrides. `um-photo-07` storage-outage is a real env-repoint test. Approval recorded.
- Stage 3 (production) — DONE 2026-09-02 ~08:50 (2nd attempt). `photo-v15.e2e-spec.ts` 19/21 green (um-photo-09 T1 needs UMAC-2 `PATCH` gate; um-photo-06 T5 `it.todo`). New: `application/decorators/self-only.decorator.ts`, `application/guards/self-only.guard.ts`. Changed: controller photo route → `@SelfOnly()` (dropped unseeded `UPLOAD_PHOTO_FEATURE`), `upload-user-photo.action.ts` → 503 catch, `user-management.module.ts` (guard provider), **`src/storage/infrastructure/s3-storage.adapter.ts`** (endpoint now prefers `process.env.AWS_ENDPOINT_URL` — small, outside user-management, flagged for human review; needed so um-photo-07's runtime endpoint-repoint works). `write-adoption` UMAC-09 photo tests 1/2/3 flipped red→green. tsc = 3 known epic-4 errors. Approval recorded.

> **⚠️ COORDINATOR MISTAKE — controller collision.** Story 1.3 Stage 3 and Story 1.5 Stage 3 were dispatched in parallel; **both edit `users.controller.ts`**. The 1.3 agent reported its photo changes were preserved after a mid-run revert/re-write, tsc-clean. **When 1.5 Stage 3 returns, verify `users.controller.ts` carries BOTH the `@SelfOnly()` photo route AND the list changes, and run photo-v15 + list-v15 together.** Do not parallelize same-file edits again.

### Story 1.5 — List Employees
- Stage 1 (scenarios) — DONE 2026-09-02. 12 `um-list-01..12` + README. `GET /users` already exists, capability gate correct — Stage 3 refines: 13-key fixed projection, EmploymentStatus join for dismissed filter, `forbidNonWhitelisted->400`, drop `ttId`/`isActive` filters, sort+pagesize, `totalPages`. Approval recorded.
- Stage 2 (red E2E) — DONE 2026-09-02. `list-v15.e2e-spec.ts` rewritten (33 tests, 17 fail / 15 pass / 1 todo), `fixtures.ts` + `seedCurrentEmploymentStatus`. Authoring agent hit the 4:50am session limit mid-red-run; coordinator fixed one stray line + verified red. Approval recorded.
- Stage 3 (production) — DONE 2026-09-02 ~09:00. `list-v15.e2e-spec.ts` **32 green / 1 todo**, 0 regressions. New `user-list-item.response.ts` (13-key mapper); `ListUsersQueryDto` drops `ttId`/`isActive` + adds `employmentStatus`; `user.repository.list()` joins current `EmploymentStatus` + new sort + one findMany/one count + zero AC calls; `PaginatedResponseDto` + `totalPages`; `pagination-query.dto` default 25; controller `LIST_QUERY_PARAMS` allow-set → 400. tsc = 3 known epic-4. Approval recorded.

**Controller collision — RESOLVED.** `users.controller.ts` carries all three stories' changes coherently (`@Post('import')` + `@SelfOnly()` photo + `toUserListItem` list). tsc clean. Each suite green individually. The 1.5 agent flagged it ran measurement-only `git stash`/`checkout <stash>`/`restore --staged` and restored the tree — `git stash list` verified back to the one pre-existing entry.

## Status at ~09:05 BST — Stories 1.1, 1.3, 1.5 COMPLETE (all 3 AD-1 stages, uncommitted)

Combined e2e (seed + photo-v15 + list-v15 + access-control-adoption): the only reds are **documented-blocked**, none new:
- `um-seed-11 T3` — needs Epic 2 real session issuance
- `um-photo-09 T1` + `write-adoption` UMAC-07/08 (~6) — need UMAC-2 `PATCH` write gate (the `user-management:edit` kernel seed)

### Story 1.2 — Edit Identity Card — Stage 1 authored, Stages 2-3 BLOCKED on a Dmytro decision
GET is already shipped (UMAC-1). `PATCH /users/:id` needs `user-management:edit`, which does not exist.
- **`_bmad-output/implementation-artifacts/access-control/user-management-edit-permission-options.md`** — 4 options for *who holds the key*. **Recommends Option 2:** a universal baseline `employee` FR role holds `user-management:edit`; the §2.2 section gate (reporting/PP → `write`; self/colleague → `read`) does all the audience narrowing, so the functional half is never the binding constraint. Kernel seed owns policy+grant+backfill; the UM import writer owns the per-row attach.
- **`docs/test-cases/user-management/profile/um-edit-01..08.md`** + README — Story 1.2 Stage-1 scenarios (PATCH data-correctness: partial merge, `409` wholesale on `workEmail`/`ttId` dup, `400` on org fields §3.2 fn 1, `400` on `photo`/`isActive`/`employmentStatus`/`customFields`, birthday pair rule). `um-pf-01/03/04` → pointer stubs (superseded).
- In-scenario decisions (in `profile/README.md`): needs `@IsEmpty()` added to `UpdateUserDto` for org + technical fields; `PATCH` is partial-merge; empty body → `200`; `companyJoinDate`/`ttId` editable set flagged for confirmation.
- **Also flagged:** `docs/architecture/access-control.md:210` wrongly lists `self` among `canEdit:true` audiences — S1 self is `read` (ACM-5 + umac-07 Test 4). One-line doc fix for the human.

### Next when Dmytro is back
1. Decide the `user-management:edit` holder (Option 2 recommended) → dispatch the 3-stage kernel-seed AD-1 sequence in `spec-access-control-kernel-mvp` → then Story 1.2 Stages 2-3 + UMAC-2.
2. Review + commit the 3 done stories (per-story, using the `epic-1-approvals.yaml` file lists).
3. Re-sign the autonomous approvals with real commit SHAs / a real per-artifact pass.

---
## END OF FIRST AUTONOMOUS RUN (2026-09-02 ~09:30 BST). Stories 1.1/1.3/1.5 done; 1.2 decision-blocked.
---

## Resumed 2026-09-02 ~10:00 — Dmytro decided "Variant A"

**Variant A (2026-09-02):** the identity card has **NO separate functional
permission**. `GET /users/:id` `canEdit` AND `PATCH /users/:id` are gated by
`canAccessSection(viewer, 'S1', target) === 'write'` alone (reporting-line
manager or assigned PP). No `user-management:edit` kernel seed. `user-management:edit`
survives only as the adapter's routing key.

- **Code (coordinator):** `access-control-facade.adapter.ts` — `canEditIdentityCard()` = `canAccessSection('S1') === 'write'`; `isAllowedForTarget()` gained an `EDIT_USER_FEATURE` branch (same check). tsc clean.
- **Docs (coordinator):** `user-management-edit-permission-options.md` RESOLVED banner; `fr-permission-matrix-draft-2026-09-02.md` `profile:identity:write` struck through.
- **Reconciliation agent (done):** `read-adoption` umac-01..04 `canEdit` (reporting/pp → `true`, self/colleague → `false`) — 5/5 green. `write-adoption` umac-07 (5) + umac-09 (3) green, **umac-08 (3) red** pending Story 1.2 Stage 3. `um-edit-*` + adoption SPEC CAP-2 + READMEs reconciled to Variant A. tsc = 3 known epic-4.

**UMAC-2 (Epic 0 write path) — effectively done** (adapter + scenarios); only umac-08's org-field `400` remains, which Story 1.2 Stage 3 delivers.

### Story 1.2 (Edit Identity Card) — unblocked, resuming
- Stage 1 (scenarios) — reconciled to Variant A, approved.
- Stage 2 (red E2E, data-correctness) — DONE ~11:00. `edit-identity.e2e-spec.ts` 16 green / 8 red. Deleted stale `profile-v15.e2e-spec.ts`. Red (all Stage 3): um-edit-05 org fields (4), um-edit-06 T3/T4 (2), um-edit-08 T1/T5 birthday half-pair (2).
- Stage 3 (production) — DONE ~11:30. `UpdateUserDto` `@IsEmpty()` on org keys + `employmentStatus`/`customFields`; `EditUserAction` birthday-pair invariant. **`edit-identity.e2e-spec.ts` 24/24 green; `write-adoption.e2e-spec.ts` 11/11 (umac-08 green); adoption dir 23/23. +11 green, 0 regressions.** tsc = 3 known epic-4.

- `stories.yaml` UMAC-2 entries reconciled to Variant A (block comment + entries marked HISTORICAL, header canEdit note updated). Done by coordinator.

---
## ☀️ STATE 2026-09-02 ~11:30 — Epic 0 + Epic 1 COMPLETE (uncommitted, `dn-um-implementation`)

| Slice | Status |
|---|---|
| **Epic 0 UMAC-1** (read path, `{data,canEdit}` envelope) | ✅ done |
| **Epic 0 UMAC-2** (write path) | ✅ done — **Variant A**: `canAccessSection('S1')==='write'` gate, no permission, no kernel seed. Folded into the adapter + Story 1.2 + Story 1.3. |
| **Epic 1 Story 1.1** (import) | ✅ done — `POST /users/import`, schema, migration, `POST /users` retired |
| **Epic 1 Story 1.2** (edit identity card) | ✅ done — `PATCH /users/:id` data-correctness, `edit-identity.e2e-spec.ts` 24/24 |
| **Epic 1 Story 1.3** (photo) | ✅ done — `@SelfOnly`, 5 MiB/MIME, 503; `photo-v15` 19/21 (2 documented) |
| **Epic 1 Story 1.5** (list) | ✅ done — 13-key projection, EmploymentStatus filter; `list-v15` 32/33 |
| **umac-06** realignment | ✅ 4/4 |

tsc: only the 3 pre-existing `test/user-management/epic-4/*` errors. lint: 12 pre-existing, none in touched files.
The ~114 remaining e2e failures are the sanctioned pre-v1.5 suites (`profile.e2e`, `career-timeline`, `deactivation`, `registration`, `list.e2e`, `epic-3/auto-events` …) using `Bearer <token:Bob>` literals — the TEA phase retires/realigns them.

### Not done — needs Dmytro
1. **Commit** — per-slice (file lists in `epic-1-approvals.yaml`). Big tree: schema+migration, ~8 backend src files, ~5 new test suites, ~40 scenario docs, planning artifacts.
2. **Re-sign the autonomous approvals** with real commit SHAs (`epic-1-approvals.yaml` `commit: UNCOMMITTED-*`).
3. **FR matrix draft §4/§6** — the 10 PO-confirm points (`fr-permission-matrix-draft-2026-09-02.md`).
4. **`s3-storage.adapter.ts`** — the one endpoint-resolution change outside `user-management/` (Story 1.3, flagged).
5. **Epic 3 / 4 / 5** — blocked on CC-04/06/07 + the S9 `profile:timeline:write` holder decision (FR matrix §6.4).
---

## Resumed 2026-09-02 ~12:00 — Epic 2 (Magic-Link Auth)

Unblocked (no CC-* dependency). Existing: `spec-2-1`/`spec-2-2` (draft), `um-auth-01..06` scenarios (some pre-v1.5), ports (`MagicLinkDispatcherPort`, `SessionResolverPort`), `magic-link-dispatcher.fake.ts`, `interim-session-resolver.adapter.ts`, `session.guard.ts`. No `MagicLinkToken`/`Session` in schema.

**Story 2.1 (request magic link)** — Stage 1+2 DONE ~12:30. `um-auth-01/02` reconciled + `um-auth-02b` NEW + `auth/README.md`. Body `{ sent: true }`, byte-identical enumeration guard. `request-magic-link.e2e-spec.ts` 4/4 red (route 404, no table). Architect flag: `MagicLinkToken` uses `tokenHash` (SHA-256) not raw `token`; 15-min TTL config-owned; dispatcher port → `dispatch(workEmail, token)`.
- Stage 3 (production) — DONE ~13:30. `MagicLinkToken` model + migration `20260902124244` (additive, `tokenHash` SHA-256 unique, `userId` FK cascade). Config `MAGIC_LINK_TTL_MINUTES`(15)/`APP_BASE_URL`/`MAIL_*`. `/auth` area in `src/user-management/` (controller/action/dto/service/2 repos/SMTP adapter, nodemailer). `POST /auth/magic-link` → `{sent:true}`, enumeration-safe. **`request-magic-link.e2e-spec.ts` 4/4 green.** tsc = 3 known epic-4.
  - **Migration incident (recovered):** `prisma migrate dev` auto-dropped the access-control `PolicyPermissions` FK; agent made the migration additive + restored the FK; coordinator verified `acm1r-fr-foundation` green (66/66 across acm1r + magic-link + adoption).
  - **User action needed:** `.env.example` can't be edited by the harness — add: `MAGIC_LINK_TTL_MINUTES=15`, `APP_BASE_URL=…`, `MAIL_HOST/PORT/SECURE/USER/PASSWORD/FROM` (Joi defaults keep it running meanwhile).
  - **Architect flags:** `tokenHash` vs raw `token`; `/auth` placed in `user-management` (no new context); `node:crypto` direct in the domain service.

**Story 2.2 (consume + session)** — retires `interim-session-resolver.adapter.ts` (AD-21). Blast radius: ~15 e2e suites use `Bearer <token:<seeded-uuid>>` via that resolver. **Design chosen (per `epic-2-context.md` "Epic 0 keeps the `<token:<seeded-uuid>>` convention for fixtures"):** the real `SessionResolverPort` adapter resolves a real session token for production AND, guarded by an env flag (non-prod only), still accepts the `Bearer <token:<uuid>>` shorthand — so the interim adapter's capability folds into the real one (AD-21: one adapter, no dual-running) and the existing e2e suites keep working unchanged.
- Stage 1+2 — DONE ~14:00. `um-auth-03..06` reconciled (real minted tokens) + `um-auth-consume-malformed`. `consume-magic-link.e2e-spec.ts` 5/5 red (route 404). `request-magic-link` stays 4/4. Proposed: session body `{sessionToken, tokenType:"Bearer", expiresIn}`; signed JWT HS256 (`SESSION_JWT_SECRET`, no Session table); 8h TTL.
- Stage 3 (production) — DONE ~15:00. `POST /auth/magic-link/consume`, `ConsumeMagicLinkAction`, `MagicLinkService.consume` (atomic conditional UPDATE, generic 401). Hand-rolled HS256 JWT (`jwt.util.ts`, `node:crypto`, no new dep), `SessionTokenIssuerPort`. `JwtSessionResolverAdapter` (JWT + `ALLOW_TEST_SESSION_TOKENS`-gated `<token:persona>` shorthand). **`interim-session-resolver.adapter.ts` DELETED**, `SESSION_RESOLVER_PORT` rebound. Config `SESSION_JWT_SECRET`/`SESSION_TTL_HOURS`(8)/`ALLOW_TEST_SESSION_TOKENS`. **consume 5/5 + request 4/4; 0 regressions** (verified `comm -23` empty + coordinator 9 suites/98 green). tsc = 3 known epic-4.
  - **User action:** `.env.example` — add `SESSION_JWT_SECRET`, `SESSION_TTL_HOURS=8`, `ALLOW_TEST_SESSION_TOKENS=true` (non-prod).

---
## ☀️ STATE 2026-09-02 ~15:00 — Epic 0 + Epic 1 + Epic 2 COMPLETE (uncommitted, `dn-um-implementation`)

| Epic | Status |
|---|---|
| **Epic 0** (UMAC-1 read + `{data,canEdit}`, UMAC-2 write — Variant A) | ✅ |
| **Epic 1** (1.1 import, 1.2 edit, 1.3 photo, 1.5 list) | ✅ |
| **Epic 2** (2.1 request magic link, 2.2 consume + JWT session, interim resolver retired) | ✅ |
| **Epic 3** (career timeline) | ⏳ 3.1 auto-events partly there (`joined_company` ships from 1.1); 3.2/3.3 need `profile:timeline:write` holder (FR matrix §6.4) + DEC-UM-001 audience |
| **Epic 4** (org relationships) | ⛔ CC-04 + CC-07 (journal) |
| **Epic 5** (departure) | ⛔ CC-06 |

Migrations: `20260902001941_story_1_1_import_population`, `20260902124244_story_2_1_magic_link_token`. Story 2.2 = no migration (stateless JWT).
tsc: only the 3 pre-existing `test/user-management/epic-4/*` errors. New-code lint clean.
E2E: the ~104 remaining failures are all pre-v1.5 legacy / committed-red-BLOCKED suites (registration, list.e2e, profile.e2e, career-timeline, epic-3/4/5, old auth monolith) — TEA retires/realigns them.

### ⚠️ COMMIT NOW — the tree spans 3 epics
Big uncommitted set (2 migrations, ~30 backend src files, ~8 new test suites, ~50 scenario docs, planning artifacts). Suggest per-epic or per-story commits (file lists in `epic-1-approvals.yaml`). The autonomous approvals need real commit SHAs. `.env.example` needs the `MAIL_*` + `SESSION_*` + `MAGIC_LINK_*` entries (harness couldn't edit it).
---

---
## ☀️ STATE 2026-09-02 ~16:00 — Epics 0/1/2 COMMITTED; Epic 3 is now the current epic

**Committed by Dmytro** (`dn-um-implementation`, both repos):
- workspace: `a307d1c` "import, magic link, session" (+ pending gitlink bump `M services/backend`)
- backend: `8492cfd` "import, magic link, session", `3799bc1` "cleanup" (fake deletion + `epic-2/fixtures.ts` comment fix)

Autonomous approvals in `epic-1-approvals.yaml` still carry `commit: UNCOMMITTED-2026-09-02` — re-sign against `8492cfd` / `3799bc1` / `a307d1c` when convenient.

`.env.example` (harness-blocked for me) still needs the Epic 2 block — exact contents handed to Dmytro in chat: `MAGIC_LINK_TTL_MINUTES` `APP_BASE_URL` `MAIL_HOST/PORT/SECURE/USER/PASSWORD/FROM` `SESSION_JWT_SECRET` `SESSION_TTL_HOURS` `ALLOW_TEST_SESSION_TOKENS`. Joi defaults keep every non-prod env booting meanwhile; `SESSION_JWT_SECRET` is the only one with no prod default.

### Epic 3 (Career Timeline) — status

| Story | Actionable now? | Notes |
|---|---|---|
| **3.1 System auto-generates timeline events** | ✅ **YES — no CC-* dependency** | `UserEvent` model already in schema (added by Story 1.1). `joined_company` already written at import. 3.1 establishes the AD-11 synchronous same-transaction write pattern, adds `position_change` from the `PATCH /users/:id` handler (Story 1.2 code exists), and ships `GET /users/:id/events` (soft-delete-excluding) + `POST`/`DELETE` routes. Reconcile the existing stage-2 `test/user-management/career-timeline.e2e-spec.ts` (`um-ct-01..08`, 404s today) — do not recreate. Not parallelizable with Epic 1 (already done, so clear). |
| **3.2 Manual backfill entry** | ⛔ blocked | (a) `profile:timeline:write` **holder undecided** — FR-matrix §6.4 PO-confirm point. (b) S9 write audience per DEC-UM-001 = assigned PP **or** the employee's *direct Unit Manager* (§4.17 dept manager) — the "direct Unit Manager" leg needs the **AC department-tree walk increment** (`targetType:'department'` + recursion), a separate kernel AD-1 sequence not yet built. Assigned-PP leg alone could ship first if Dmytro wants it split. |
| **3.3 Edit/delete an event** | ⛔ blocked | Same gate as 3.2 (reuses 3.2's write path; adds only the soft-delete path). |

**Epic 4** (org relationships) — still ⛔ CC-04 + CC-07 (journal).
**Epic 5** (departure) — still ⛔ CC-06.

### Decisions needed from Dmytro to move Epic 3 past Story 3.1
1. **`profile:timeline:write` holder** (FR-matrix §6.4). Given Variant-A precedent, the likely answer is "no separate functional permission — S9 write audience (assigned PP / direct UM) is the whole gate". Confirm or name a holder.
2. **Split 3.2?** Ship the assigned-PP manual-write path now and defer the direct-UM leg until the AC department-tree walk lands — or hold all of 3.2/3.3 until that increment is done.
3. Whether to slot the **AC department-tree walk increment** into the queue now (it also unblocks dept-derived Reporting-line access generally, not just S9 write).

### Story 3.1 scenario-stage decisions — RESOLVED by Dmytro 2026-09-02
- **`GET /users/:id/events` read gate = career-timeline read audience** (requirements §3.2 matrix row S9): **Self, Reporting line, Project line, PP** → `200`. **Colleague → denied** (the row is `—` for colleague; §3.3.1 strict — route must not leak, `403` for an authenticated viewer with empty audience). Gate is wired in Story 3.1 (not deferred) via the `resolveAudiences` interim (see the interim-pattern note below); section name `profile:timeline`, `S9` is only the matrix's row id. Shared-link `cfg` path is out of scope (no link feature yet).
- **`details` jsonb payload for auto-events = the new value only** (no old/prior value, no diff).
- **`eventDate` = server "now" in UTC**, same as every other timestamp in the system.
- **`um-ct-05`** (event the system inferred wrongly) — precondition seeded through the manual-add endpoint with an in-file comment; there is no HTTP way to force a bad inference. Approach preserved (Dmytro, 2026-09-02).

### S9 manual-write gate (Story 3.2/3.3 — recorded now, still blocked)
Requirements are explicit, no fresh decision needed: **dual gate** = the runtime *edit the career timeline* functional permission **AND** the DEC-UM-001-narrowed S9 write audience = **assigned PP + the employee's direct Unit Manager only** (project-derived DM/PM and transitive managers are read-only for manual mutation). `edit the career timeline` default holder is a §132 PO-confirm item but does not block 3.1. The "direct Unit Manager" leg still needs the AC department-tree walk increment.

### 2026-09-02 — Story 3.1 read gate: use the sanctioned S13 interim pattern (NOT blocked)

Earlier note in this section over-flagged this. `AccessControlFacade.canAccessSection()` does support **`S1`/`S10`/`S11` only** (`access-control.facade.ts:52`), and `resolveAudiences` today only emits `self | reporting | pp | colleague` (project line / department / PP-HR-line are fail-closed everywhere, not just here — `audience.ts`). **But there is an established precedent:** `docs/architecture/mentorship.md` §5.3 Decision 3 + `deferred-work.md` item for S13 — when a consuming context needs a section `canAccessSection` doesn't answer yet, it runs an **interim** `resolveAudiences`-derived rule marked `// INTERIM` with an expiry trigger, and a deferred-work item tracks the real AC increment.

**Story 3.1 follows that pattern for the S9 read gate on `GET /users/:id/events`:**
- allow when `resolveAudiences(viewer,[target])` ∩ `{self, reporting, pp}` ≠ ∅ (project line will just start matching once AC ships it — no code change needed here);
- colleague-only or empty audience → deny (S9 is `—` for colleague, §3.2). Denial code = whatever the timeline route's leak rule says (`403` for an authenticated viewer per the UM suite's established `403`-not-`404` choice).
- marked `// INTERIM`, expiry trigger: "replace with `canAccessSection('profile:timeline', …)` when that AC increment reaches stage-3-production".
- New `deferred-work.md` item added for the real `profile:timeline` `canAccessSection` increment (mirrors the S13 item).

**Epic 3 net:** Story 3.1 (auto-hooks + `GET /users/:id/events` with the interim S9 gate) is **clear to start now**. 3.2/3.3 still need the DEC-UM-001 direct-UM write leg → the AC department-tree walk.

### Story 3.1 Stage 1 (scenarios) — DONE 2026-09-02 (coordinator, inline)
- `um-ct-02` rewritten: `position_change` `details` = **new value only** `{ "position": <new> }` (was `{from,to}`); `eventDate` = server now UTC; added the no-op-edit-writes-nothing case; fixed the trigger cross-ref (`profile/um-edit-01`, not the retired `um-pf-01`).
- `um-ct-01` — trace gains FR-11; otherwise intact (`joined_company` at import, `eventDate` = `companyJoinDate`, same transaction).
- **New `um-ct-11`** — S9 read-audience matrix for `GET /users/:id/events`: Self / Reporting / PP → `200`; Colleague → `403`; unresolved → `401`. Documents the interim `resolveAudiences ∩ {self,reporting,pp}` gate (S13 precedent) + the expiry trigger.
- `spec-3-1-*.md` updated (Approach, I/O matrix, AD-1 gate list, Open Questions all reconciled). `docs/test-cases/user-management/README.md` updated (career-timeline row 10→11, blocks-table S9 row split into read-not-blocked / write-blocked + the dept-tree-walk row, live count 70→71).
- `_bmad-output/implementation-artifacts/access-control/deferred-work.md` — new item for the real `profile:timeline` `canAccessSection` increment.
- `um-ct-03..10` untouched — already reconciled to DEC-UM-001, they belong to Stories 3.2/3.3.

### Story 3.1 Stage 1 — APPROVED by Dmytro 2026-09-02
Recorded in `epic-1-approvals.yaml` (`story_id: 3-1-auto-career-timeline-events-scenarios`, author=agent, approver=Dmytro Novyk). Dmytro also asked for fresh subagents per stage (clean context).

Late scenario fix (post-approval, mechanical): `um-ct-02` `eventDate` for `position_change` = **today's UTC date** (the `user_events.eventDate` column is `@db.Date`, not a timestamp), not "server instant". Propagated to `spec-3-1`.

### Story 3.1 Stage 2 — DISPATCHED 2026-09-02 (fresh subagent, clean context)
Brief: committed-red E2E only, no `src/` changes, no git. Reconcile `test/user-management/epic-3/auto-events.e2e-spec.ts` (um-ct-01 add route read; um-ct-02 `details` → `{ position }` new-value-only + eventDate today-UTC + no-op case); add um-ct-11 read-audience suite; delete the legacy `test/user-management/career-timeline.e2e-spec.ts` (retired `POST /users`); do NOT touch `manual-events`/`edit-delete-events` (3.2/3.3). Note: `UserEvent` model + `user_events` table + `joined_company`-at-import already exist (Story 1.1) — so um-ct-01 DB-state may already pass; it stays red on the missing `GET /users/:id/events` route.

### Story 3.1 Stage 2 — DONE 2026-09-02 (fresh subagent), committed-red, AWAITING Dmytro's Stage-2 gate
- **Modified** `test/user-management/epic-3/auto-events.e2e-spec.ts`: um-ct-02 `details` → `{ position: 'Senior Engineer' }` (new value only); `eventDate` = today's UTC date; +Test 2 no-op edit; `um-pf-01` comment → `um-edit-01`; +`GET /users/:id/events` route reads on um-ct-01 & um-ct-02 (404 today).
- **Created** `test/user-management/epic-3/timeline-read-audience.e2e-spec.ts` — um-ct-11, 5 tests (Self/Bob/Paula → 200, Eve colleague → 403, no-token → 401). Seeds via `RunFixtures` (`reportsTo`, `peoplePartnerOf`) + a real `joined_company` `userEvent` row.
- **Deleted** `test/user-management/career-timeline.e2e-spec.ts` (retired `POST /users`, superseded by `epic-3/`).
- **Red run:** epic-3 auto+read = 9 failed / 2 passed / 11, jest exit 1. The 2 green = Story 1.1's already-shipped `joined_company` DB-state (import runs, event row exists in-tx). Everything Story 3.1 must still deliver is red: `position_change` hook (no row), `GET /users/:id/events` route (404 on all reads). `manual-events`/`edit-delete-events` untouched.
- **tsc** clean (3 known epic-4). **lint** clean on touched files. **No `src/` or git changes.** Full `test/user-management` sweep: 100 failed / 133 passed — net failures *dropped* (removed ~19 always-red legacy `POST /users` tests, added 9 targeted red); every non-epic-3 failure is a known pre-existing one.

### Stage-2 flags for Dmytro (from the subagent)
1. **Response shape of `GET /users/:id/events` is not pinned by any scenario doc.** Tests currently assert `res.body` is a bare array. Options for Stage 3: (a) bare `UserEvent[]`; (b) `{ data: UserEvent[], canEdit: boolean }` envelope (the established section-read convention — `canEdit` = "may this viewer manually add/correct events" = the Story 3.2/3.3 gate, so `false` for everyone until 3.2 lands); (c) pagination envelope `{ data, totalPages, … }` like `GET /users`. **Timeline is a per-person owned sub-collection, not a cross-person list.** Recommend **(b)** — consistent with the rest of UM, and it front-runs the 3.2/3.3 UI gate. Needs a call.
2. **um-ct-01 scenario literal** — doc says Nina, `eventDate "2026-09-01"`; the real `docs/Accounts_template.csv` has ONE data row (a bootstrap "Site Administrator", `RegistrationDate 2026-08-17`). The e2e reconciles by asserting `eventDate === csv.RegistrationDate`. Scenario prose vs import-fixture reality — inherent, e2e handles it; a one-line note on `um-ct-01` would tidy it.
3. um-ct-11 Test 5 (401 no-token) depends on guard ordering once the route exists — documented inline, fine.

### Story 3.1 Stage 2 — APPROVED by Dmytro 2026-09-02 (response shape = option b, the `{ data, canEdit }` envelope)
Recorded in `epic-1-approvals.yaml`. **Response-shape decision: option (b)** — `GET /users/:id/events` → `{ data: UserEvent[], canEdit: boolean }` envelope; `canEdit` = the Story 3.2/3.3 manual-mutation dual gate, `false` for every viewer until 3.2 ships.
- Post-gate mechanical updates (coordinator): scenario docs `um-ct-01/02/11` + `spec-3-1` + the 2 Stage-2 test files updated to assert the `{ data, canEdit:false }` envelope. `um-ct-01` gained an "import-fixture reality" note (CSV has one row, a bootstrap Site Administrator `RegistrationDate 2026-08-17`, not "Nina 2026-09-01"). Re-verified red: **9 failed / 2 passed**, tsc clean (3 known epic-4), envelope assertions in place.

### Story 3.1 Stage 3 — DISPATCHED 2026-09-02 (fresh subagent, clean context)
Production to green. Brief: `UserEvent` write path (repo port + `user-event.repository.ts` + domain service), same-transaction (AD-11) `position_change` hook in `EditUserAction` (details = `{ position: <new> }`, eventDate = today UTC date, only when position changes), `GET /users/:id/events` → `{ data, canEdit }` with a `CareerTimelineAccessPort` (mirror `IdentityCardAccessPort`) doing the interim `resolveAudiences ∩ {self,reporting,pp}` read gate + `canEdit` dual gate. Make the 9 red tests green, 0 regressions, tsc clean, no git.

### Story 3.1 Stage 3 — first pass STALLED (2026-09-02), resumed
The Stage-3 subagent spent ~20 min / 237k tokens exploring, then set up a background Monitor to wait for a baseline e2e sweep and ended its turn — which in an unattended subagent context never resumes. Net effect: **zero `src/` changes**, nothing implemented, tsc still clean. Resumed the same agent (preserves its exploration context) with a firm corrective: cancel the monitor, implement now, run all test commands **inline/synchronously**, one blocking regression sweep, no git.

### Story 3.1 Stage 3 — DONE 2026-09-02 (resumed subagent), coordinator-verified, AWAITING Dmytro's Stage-3 gate

**8 new + 6 modified `src/user-management/` files:**
- new: `domain/interfaces/{user-event.repository.port,career-timeline-access.port}.ts`, `domain/services/{career-timeline.service,career-timeline-access.service}.ts`, `infrastructure/{user-event.repository,career-timeline-access-facade.adapter}.ts`, `application/actions/get-user-events.action.ts`, `application/dtos/user-event.response.ts`
- modified: `domain/interfaces/user.repository.port.ts` (`update(id, patch, systemEvents?)`), `domain/services/user.service.ts`, `infrastructure/user.repository.ts` (`$transaction` co-write when `systemEvents` non-empty; unchanged fast path otherwise — AD-11), `application/actions/edit-user.action.ts` (`viewerId` param + `position_change` descriptor when position changes), `application/controllers/users.controller.ts` (`@Get(':id/events')`, `@Patch(':id')` gains `@CurrentSession()`), `user-management.module.ts` (registrations + port bindings)

**Design:** `GET /users/:id/events` → `{ data: UserEventResponse[], canEdit }`. `UserEventResponse` = `{ id, type, eventDate (YYYY-MM-DD), details, source, createdAt }` (never `deletedAt`/`createdBy`). Read gate = `CareerTimelineAccessFacadeAdapter` (consumes `AccessControlFacade`, the one sanctioned forward import) — **`// INTERIM`** `resolveAudiences ∩ {self,reporting,pp,project}` with the verbatim expiry trigger → `canAccessSection('profile:timeline', …)`. `ForbiddenException` for colleague AND nonexistent target (no 404 enumeration). 401 from the class-level `SessionGuard`. `canEditTimeline` = `isAllowed(viewer,'profile:timeline:write')` (unseeded → **false for all now**) `&&` S9 write audience. `position_change`: `details: { position: <new> }`, `eventDate` = today's UTC date, `createdBy` = editing viewer.

**Verification (coordinator, re-run independently):**
- `npx tsc --noEmit` — only the 3 known `test/user-management/epic-4/*` errors.
- Story 3.1 e2e (`auto-events` + `timeline-read-audience`) — **11/11 green**, jest exit 0.
- Full `test/user-management` + `test/access-control` sweep — **91 failed / 262 passed / 3 todo** (was 100 / 253). Delta = exactly the 2 Story 3.1 suites flipping (9 tests → green), **0 new failures**, no access-control movement. Remaining 91 = the known pre-v1.5 legacy set (deactivation, registration, list.e2e, profile.e2e, epic-4/5, old auth monolith).
- ESLint clean on all touched files.

**Flag for Dmytro (scenario deviation, corrected):** um-ct-01's Stage-1 Test said `Bearer <token:Root>` → `200`. Under the real S9 gate that's wrong — `Root` (bootstrap HR-Admin) has **no data audience** (§2.2 NORMATIVE "HR Admin grants no data access"), so it resolves as Colleague → `403` (exactly what `um-ct-11` Test 4 asserts). The §2.4 full-profile-access overlay that *would* let an admin read any timeline is unbuilt. Stage 3 switched um-ct-01's reader to **Self** (the imported employee reading their own timeline, S9 Self = `R`) → `200`. Scenario's actual claim (import writes `joined_company`, observable via the envelope) unchanged. `um-ct-01.md` doc updated to match.

**Decisions the subagent made (surfaced):** (1) `joined_company` NOT routed through the shared descriptor — the import already writes it in its own per-row `$transaction`; reshaping `writeRow` risked the (already pre-existing-red) seed suite; the shared `SystemEventInput` type documents the common shape. (2) event ordering `eventDate ASC, createdAt ASC`. (3) `canReadTimeline` audience set includes `'project'` (no effect today, matches for free later).

### First-pass stall (recorded)
The Stage-3 agent's *first* turn (~20 min / 237k tok) ended by backgrounding a Monitor for the baseline sweep — which never resumes an unattended subagent. Zero `src/` changes that pass. Resumed with a "no Monitor, all commands inline" corrective; the resume did the whole implementation cleanly.

### Story 3.1 — COMPLETE 2026-09-02 (all 3 AD-1 stages, uncommitted)
Stage 3 APPROVED by Dmytro. Recorded in `epic-1-approvals.yaml` (`3-1-*-production`). `spec-3-1` status → `done`.

## ☀️ STATE 2026-09-02 ~22:30 — Epic 0 + 1 + 2 + **Epic 3 Story 3.1** COMPLETE (uncommitted, `dn-um-implementation`)

Career timeline: the **automatic** half is live — `joined_company` at import, `position_change` on `PATCH` (AD-11 same-tx), `GET /users/:id/events` `{ data, canEdit }` with the interim S9 read gate. **Manual** add/correct/delete (Stories 3.2/3.3) is NOT built.

### Epic 3 Stories 3.2 / 3.3 — the real blocker (not a gate, missing infrastructure)
DEC-UM-001 manual-write audience = **assigned PP OR the employee's direct Unit Manager**. The assigned-PP leg is resolvable today (`resolveAudiences` emits `pp`). The **direct-Unit-Manager leg has no data and no resolver support**:
- No way to record "user X manages department D" — Story 1.1 deliberately did not populate `Policies{type:'AR', targetType:'department', targetRole:'unit-manager'}` (no CSV source). Assigning a department manager is **Epic 4 Story 4.3**'s relationship-write path.
- `AudienceResolverService` does not walk `targetType:'department'` at all — that's a separate **AC-kernel increment** (Anna's package `spec-access-control-kernel-mvp`, approver Anna Pikula), S13-class, its own AD-1 sequence.
- Also `canAccessSection('profile:timeline')` itself (the non-interim gate) is a pending AC increment (`deferred-work.md`).

So Epic 3 cannot be "finished" from the User Management side alone. Options recorded for Dmytro below.

### Path chosen (Dmytro, 2026-09-02): Stories 3.2/3.3 keep the functional permission; seed it to HR Admin only for now, the FR matrix decides other holders later.
- **`profile:timeline:write` IS a real functional permission** (keeps §2.3 / §4.9 / §132 intact — no Variant A here, unlike the identity card). Seeded + granted to the **`hr-admin` role only** at this stage. Non-HR-Admin holders (PP, Unit Manager) come from the FR-matrix grant work, later.
- **Manual add / correct / delete = a feature action gated by `isAllowed(actor, 'profile:timeline:write')`** — no data-audience requirement at this stage. Rationale: HR Admin holds no S9 write audience (§2.2 — HR Admin grants no data access), so requiring the audience half now would close the gate to everyone; and the FR matrix treats bulk-migration actions (`directory:import`, `org:relationships:write`) as feature actions. HR-Admin backfill of the legacy Excel headcount record is that shape.
- **DEC-UM-001 audience narrowing (assigned PP + direct Unit Manager) is a DEFERRED refinement** — it activates when the matrix grants `profile:timeline:write` to PP / Unit-Manager roles, at which point those grants must be scoped so a PP can only backfill their own assignees (not everyone). Flag `// INTERIM` + `deferred-work.md` entry. **Requirements tension to ratify later:** DEC-UM-001 as written scopes manual mutation to PP + direct UM *by audience*; this stage ships it as an HR-Admin feature action instead.
- **`canEdit`** in the `GET /users/:id/events` envelope = `isAllowed(viewer, 'profile:timeline:write')` → `true` for HR Admin, `false` for everyone else at this stage. (Story 3.1 shipped it already returning `false` for all — this just makes the wiring real.)
- Scenario reshaping for Stage 1: `um-ct-03` (PP add) / `um-ct-04` (UM add) → `it.todo` / blocked pending the matrix grant; `um-ct-10` (has relationship audience, lacks the permission → `403`) → holds; `um-ct-09` (holds permission, lacks audience → denied) → does NOT hold in the interim (feature-action gate, no audience check) — reshape to `it.todo` for when the narrowing lands; **NEW** scenario: HR Admin (Root) `POST /users/:id/events` → `201`.
- Where `profile:timeline:write` gets seeded: prefer extending `CANONICAL_PERMISSIONS` + a canonical grant pair in `src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts` (smallest change; the bootstrap already tolerates non-canonical additions). **This touches Anna's kernel-bootstrap file** — flag for her review; a UM-owned seed is the fallback if that's not acceptable.

### Story 3.2 (manual backfill add) — Stage 1 DONE + one revision in progress, AWAITING Dmytro's Stage-1 gate
First pass (subagent): `um-ct-03/04/09` → deferred `it.todo` (unblock = FR-matrix grants `profile:timeline:write` to PP/UM + DEC-UM-001 scoping); `um-ct-10` LIVE (no permission → 403); **new `um-ct-12`** LIVE (HR Admin/Root `POST` → `201` bare `UserEventResponse`, `source:"manual"` server-stamped, `whitelist` strips `id`/`deletedAt`/`source`/`createdBy`, `400` on bad `type`/`eventDate`); new `docs/test-cases/user-management/career-timeline/README.md`; `spec-3-2` + suite README rewritten.

**Scenario-stage decisions for the gate:** (1) `POST` `201` returns the **bare `UserEventResponse`**, not the `{ data, canEdit }` envelope (matches `PATCH /users/:id`). (2) `CreateUserEventDto` — `whitelist` silently strips server-owned fields, `400` only for missing/invalid `type`/`eventDate`.

**Revision (Dmytro, 2026-09-02): HR Admin can read the timeline back — "HR Admin can do and see everything".**
- Timeline-scoped rule (Story 3.2 implements): **edit implies read** — `canReadTimeline` = S9 read audience **OR** `isAllowed(viewer, 'profile:timeline:write')`. HR Admin GETs the timeline → `200`, `canEdit: true` observable. `um-ct-12` follow-up read now done by Root directly.
- Broader: the user's "HR Admin sees everything" = the §2.4 **Full profile access** grant (seeded at deployment, every section). `resolveAudiences` has no `full` audience → new `deferred-work.md` item (affects more than the timeline; the edit-implies-read rule is the timeline-scoped interim).
- Still open / ⚠️-to-ratify: DEC-UM-001 audience scoping (assigned PP + direct UM) vs shipping manual-write as an HR-Admin feature action.

### Story 3.2 Stage 1 — APPROVED 2026-09-02 (recorded in `epic-1-approvals.yaml`, `3-2-*-scenarios`)
Dmytro drove the gate design directly. Live: `um-ct-10`, `um-ct-12`. Deferred `it.todo`: `um-ct-03/04/09`. New folder `career-timeline/README.md`. ⚠️-to-ratify: DEC-UM-001 audience scoping vs HR-Admin feature action.

### Story 3.2 Stage 2 — DISPATCHED 2026-09-02 (fresh subagent, no Monitor / inline)
Reconcile `test/user-management/epic-3/manual-events.e2e-spec.ts`: `CAREER_TIMELINE_PERMISSION_KEY` → `'profile:timeline:write'`; `um-ct-10` live (403 no permission); `um-ct-12` new live (Root grants self `profile:timeline:write` in-test, POST → 201 bare `UserEventResponse`, reads back 200 `canEdit:true`, whitelist strip, 400 cases, Ida 403 / no-token 401, + `it.todo` for the real hr-admin default seed); `um-ct-03/04/09` + DEC-UM-001 case → `it.todo`. Committed-red (route 404). Baseline sweep 91f/262p/3todo.

### Story 3.2 Stage 2 — DONE + APPROVED 2026-09-02 (recorded `3-2-*-red-tests`)
Committed-red 7 failed / 5 todo (route 404). Coordinator re-verified: manual-events 7f/5todo, tsc 3 known. `fixtures.ts` key → `profile:timeline:write`. `GET /users/:id/events` already exists (Story 3.1) — `um-ct-12` red on the missing `POST` + the edit-implies-read gate widening.

### Story 3.2 Stage 3 — DISPATCHED 2026-09-02 (fresh subagent, no Monitor / inline)
Build: `POST /users/:id/events` + `AddManualUserEventAction` + `CreateUserEventDto`; `canEditTimeline` → `isAllowed('profile:timeline:write')` alone (drop the `&& canReadTimeline`); `canReadTimeline` → `<audience> OR isAllowed('profile:timeline:write')` (edit-implies-read); `UserEventRepositoryPort.add` + repo impl + `CareerTimelineService.addManualEvent`. Seed `profile:timeline:write` in `access-control-bootstrap.ts` **only if low-risk** (drift logic is "exactly three canonical" — flag for Anna either way); else leave the `it.todo`. Make 7 red green, `it.todo`s stay, 0 green→red.

### Story 3.2 — COMPLETE 2026-09-03 (all 3 AD-1 stages, uncommitted). `spec-3-2` status → `done`.
Stage 3: `POST /users/:id/events` + `AddManualUserEventAction` + `CreateUserEventDto` (2 new + 7 modified src). `canEditTimeline` = `isAllowed('profile:timeline:write')` alone; `canReadTimeline` widened with edit-implies-read. Missing target → `403` (explicit `findById`, no enumeration). **`access-control-bootstrap.ts` deliberately untouched** — a 4th canonical permission breaks `acm1r-fr-foundation` ACM1-FB-01/03; the `hr-admin` default seed of `profile:timeline:write` stays an `it.todo`, suites grant it in-test.
Coordinator-verified: manual-events 7 pass / 5 todo; full sweep **82 failed / 273 passed / 8 todo** (was 93/262/8) — 11 red→green (7 Story 3.2 + 4 Story 3.3 `POST`-precondition steps), **0 green→red**. tsc clean (3 known epic-4), lint clean.

**Carried:** `um-ct-12` default-seed `it.todo` (kernel "exactly three" guard); the ⚠️-to-ratify DEC-UM-001 audience-scoping-vs-feature-action tension.

## ☀️ STATE 2026-09-03 ~00:20 — Epic 0 + 1 + 2 + Epic 3 Stories 3.1 & 3.2 COMPLETE (uncommitted)
Career timeline: auto-events + `GET /users/:id/events` + **manual add (`POST`, HR-Admin feature-action gate)** all live. Remaining: Story 3.3 (edit/delete = soft-delete + append; `um-ct-05..08`).

### Story 3.3 (edits or deletes an event) — Stage 1 dispatched 2026-09-03
Fresh subagent, docs-only, no Monitor. Reconcile `um-ct-05` (PP corrects = soft-delete + append), `um-ct-06` (delete), `um-ct-07` (soft-deleted absent from read), `um-ct-08` (direct `PATCH` rejected) + `spec-3-3` + the career-timeline README to the same split-gate shape as 3.2: `DELETE /users/:id/events/:eventId` gated by `isAllowed('profile:timeline:write')` alone (HR-Admin only for now); correction = soft-delete then re-`POST`; no `PATCH` on a single event. Personas: Root/HR-Admin live; PP/UM deferred `it.todo`.

### Story 3.3 Stage 1 — APPROVED 2026-09-03 (recorded `3-3-*-scenarios`)
`DELETE /users/:id/events/:eventId` soft-delete; gate = `isAllowed('profile:timeline:write')` alone. LIVE: `um-ct-07`/`um-ct-08` (retargeted to Root), new `um-ct-13` (HR-Admin happy path, 6 tests). Deferred `it.todo`: `um-ct-05` (PP), `um-ct-06` (UM — two-part unblock). Decisions: `DELETE`→`204`; unknown/re-delete/cross-timeline→`404`; gate order permission-403-then-scoped-404.

### Story 3.3 Stage 2 — DISPATCHED 2026-09-03 (fresh subagent, no Monitor / inline)
Reconcile `test/user-management/epic-3/edit-delete-events.e2e-spec.ts`: `um-ct-05/06` → `it.todo`; `um-ct-07/08` live (Root); new `um-ct-13` (6 tests); `GET` assertions → `res.body.data` envelope; `DELETE` expectations → `204`/`404`. Committed-red on the missing `DELETE` route. Baseline sweep 82f/273p/8todo.

### Story 3.3 Stage 2 — DONE + APPROVED 2026-09-03 (`3-3-*-red-tests`)
Committed-red 7 failed / 6 passed / 2 todo, targeted on the missing `DELETE` route. Full sweep 83f/274p/10todo (was 82/273/8) — delta entirely this file, 0 green→red. Coordinator re-verified.

### Story 3.3 Stage 3 — DISPATCHED 2026-09-03 (fresh subagent, no Monitor / inline)
`DELETE /users/:id/events/:eventId` `@HttpCode(204)` + `SoftDeleteUserEventAction`: `canEdit` gate → 403 (covers nonexistent `:id`); scoped `findActiveOnTimeline(userId, eventId)` → 404 (covers unknown id, cross-timeline, already-deleted); `softDelete` sets `deletedAt`. `UserEventRepositoryPort.findActiveOnTimeline` + `.softDelete`; `CareerTimelineService.softDeleteEvent`. No `PATCH` route (its absence = correct). Make 7 red green, `it.todo`s stay, 0 green→red.

### Story 3.3 — COMPLETE 2026-09-03 (all 3 AD-1 stages). `spec-3-3` → `done`.
`DELETE /users/:id/events/:eventId` `@HttpCode(204)` soft-delete + `SoftDeleteUserEventAction`. Coordinator-verified: **epic-3 all 4 suites green (31 passed / 7 todo / 0 failed)**; full sweep 76f/281p/10todo (was 83/274/10) — 7 red→green, 0 green→red; tsc clean, lint clean.

## ☀️ STATE 2026-09-03 ~01:45 — Epic 0 + 1 + 2 + **Epic 3 COMPLETE** (within current infra; uncommitted since `cc3ef93`/`042a741`)

| Epic | Status |
|---|---|
| 0 (adoption) · 1 (import/edit/photo/list) · 2 (magic-link) | ✅ done + committed |
| **3 (career timeline)** | ✅ **3.1 committed; 3.2 + 3.3 done, uncommitted** |
| 4 (org relationships) | ⛔ CC-04 + CC-07 |
| 5 (departure) | ⛔ CC-06 |

**Career timeline shipped:** auto-events (`joined_company` at import, `position_change` on `PATCH`, AD-11 same-tx); `GET /users/:id/events` `{ data, canEdit }` with the interim S9 read gate + edit-implies-read; `POST /users/:id/events` manual add; `DELETE /users/:id/events/:eventId` soft-delete; no `PATCH` on a single event (correction = `DELETE` + `POST`). Manual add/delete gated by `isAllowed('profile:timeline:write')` alone — an HR-Admin feature action.

**Uncommitted src (Story 3.2 + 3.3):** 3 new actions/dto (`add-manual-user-event.action.ts`, `soft-delete-user-event.action.ts`, `create-user-event.dto.ts`) + 7 modified (`users.controller.ts`, `career-timeline-access.port.ts`, `user-event.repository.port.ts`, `career-timeline.service.ts`, `career-timeline-access-facade.adapter.ts`, `user-event.repository.ts`, `user-management.module.ts`) + 3 test files (`edit-delete-events`, `manual-events`, `fixtures`). Plus the workspace scenario/spec/README/approvals docs.

### Epic 3 tail — carried, needs no immediate action (7 `it.todo`)
1. `um-ct-03` (PP add), `um-ct-05` (PP correct) — reactivate when the FR-permission-matrix grants `profile:timeline:write` to the **People Partner** role + DEC-UM-001 assignee scoping.
2. `um-ct-04` (UM add), `um-ct-06` (UM delete) — the above for the **Unit Manager** role **+** the AC **department-tree-walk** increment (`targetType:'department'`) for DEC-UM-001 "direct UM".
3. `um-ct-09` (permission-without-audience denial) + the DEC-UM-001 narrowing case — reactivate when `canAccessSection('profile:timeline')` / the audience half is wired.
4. `um-ct-12` seed `it.todo` — the `hr-admin` role holds `profile:timeline:write` by a real **kernel/ACM default seed** (blocked on the bootstrap "exactly three canonical" drift guard; suites grant it in-test meanwhile).
5. **⚠️ To ratify:** DEC-UM-001 scopes manual timeline mutation (add + delete) to assigned PP + direct UM *by data audience*; Epic 3 ships it as an HR-Admin *feature action*. PO reconciles at the FR-matrix grant.

### Next
Await Dmytro. Options: (a) commit Epic 3 3.2/3.3; (b) the FR-permission-matrix grant work (unblocks most of the tail); (c) the AC increments (`canAccessSection('profile:timeline')` + department-manager audience + §2.4 `full`); (d) Epic 4/5 (both still CC-blocked).

---

### Session-limit note (2026-09-02 ~04:50)
Story 1.5 Stage 2 + Story 1.3 Stage 3 agents both hit the reset-4:50am limit. Story 1.5 Stage 2 WIP was essentially complete (recovered). Story 1.3 Stage 3 did nothing (controller untouched) — re-dispatched ~08:30.
