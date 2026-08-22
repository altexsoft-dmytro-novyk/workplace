# Reviewer Gate — Web-Verification Lens

**Reviewing:** `ARCHITECTURE-SPINE.md` (updated 2026-08-22, adding AD-14 and amending AD-11) + companions `docs/architecture/api-conventions.md`, `docs/architecture/database-schema.md`
**Lens:** every committed decision was web-researched or reality-checked, not asserted from training data — current versions, that named tech still exists and fits, and no silent invalidation since the spine's last full verification (2026-08-19)
**Reviewer date:** 2026-08-22
**Method:** cross-checked the Stack table and the new AD-14/AD-11 text against (1) the live npm registry (`npm view`, dist-tags, version lists), (2) the actual installed/pinned versions in `services/backend/package.json` and `services/backend/CLAUDE.md`/`.claude/rules/nest-prisma.md`, (3) package source pulled and inspected directly (`npm pack` + read), (4) web search + fetch of primary sources (Prisma docs/changelog, NestJS GitHub, PostgreSQL.org, Node.js release schedule).

## Verdict

**Pass, with two documentation gaps worth closing before AD-11's `Relationship` table gets built.** The Stack table (NestJS 11.x, Prisma 7.x, PostgreSQL, Node LTS) is still current as of 2026-08-22 and was not silently invalidated by anything released since 2026-08-19 — every pin matches, and in two cases matches *exactly*, what's actually installed in `services/backend`. AD-14's router tree has one classic Express/NestJS ordering hazard that isn't called out in the text. AD-11's CHECK constraint and partial-unique constraint both rely on Prisma capabilities that aren't in the plain schema DSL (one still requires raw SQL even in the latest release; the other exists only behind a preview flag not yet enabled in this repo) — neither companion doc mentions this, so whoever implements `Relationship` next could reasonably expect `prisma migrate dev` alone to produce it and be surprised when it doesn't.

## Stack table — verified line by line

| Stack row | Claim | Verification | Result |
| --- | --- | --- | --- |
| NestJS | `11.x (do not adopt v12 until GA)` | `npm view @nestjs/core dist-tags`: `latest = 11.2.1`, `next = 12.0.0-alpha.5`. v12 has only reached alpha (not RC, not GA) as of today. `services/backend/package.json` pins `^11.0.1` across all `@nestjs/*` packages, which resolves to the same 11.2.1. | **Current, hedge still correctly conservative.** No invalidation. |
| Prisma ORM | `7.x` | `npm view prisma dist-tags`: `latest = 7.9.1`, `next`/`dev` = `8.0.0-rc.7` (release candidate, not GA). `services/backend/package.json` pins `prisma`, `@prisma/client`, `@prisma/adapter-pg` all at `^7.9.1` — the *exact* current latest, not just "a 7.x". Prisma's own messaging (prisma.io/blog) states 7 remains the recommended production version with ~12 more months of support. | **Current, exact match to reality.** No invalidation. |
| PostgreSQL | `project standard` (spine defers to project; `services/backend/CLAUDE.md` pins PG 18 in docker-compose) | PostgreSQL 18 GA'd 2025-09-25 (postgresql.org). PostgreSQL 19 is still Beta 3 as of 2026-08-13 — not GA. | **Current.** PG18 remains the newest stable major; nothing supersedes it yet. |
| TypeScript / Node.js | `current LTS` (floating, not pinned to a number) | Node 24 "Krypton" is Active LTS (since 2025-10-28); Node 22 "Jod" rolled to Maintenance LTS (EOL 2027-04-30); Node 26 became Current in 2026 and enters LTS 2026-10. `services/backend` pins `engines.node >=22.12` / `.nvmrc` / CLAUDE.md "Node 22 only", justified there by "Prisma 7 does not support odd Node versions (23)". Checked Prisma's own system-requirements page: Prisma 7.0 requires Node 20 ≥20.19, 22 ≥22.12, or 24 ≥24.0 — Node 24 is explicitly supported, so nothing in Prisma forces staying on 22 over 24. | **Spine wording ("current LTS") is fine as written — it's relative, not a stale pin.** But the *underlying repo* is now one rung behind Active LTS (on Maintenance LTS 22, not Active LTS 24), for a reason (the "odd versions" gotcha) that doesn't actually explain skipping 24. Pre-existing drift, not introduced by today's AD-14/AD-11 edit — flagged as a low-priority watch item, not a spine defect. |

No new library, framework, or stack pin was added by AD-14 or AD-11, consistent with the brief — this table exists to confirm nothing already on it silently rotted since 2026-08-19. Nothing did.

## Findings tied to the new/amended text

### 1. AD-11's CHECK constraint has no Prisma-schema representation — needs raw SQL, undocumented in the migration workflow

`database-schema.md`'s `Relationship` table specifies:
```
CHECK: (type='direct' AND relatedUserId IS NOT NULL AND projectId IS NULL)
    OR (type='project' AND projectId IS NOT NULL AND relatedUserId IS NULL)
    OR (type='mentor' AND relatedUserId IS NOT NULL AND projectId IS NULL)
```
Verified against Prisma's own troubleshooting doc (prisma.io/docs/orm/more/troubleshooting/check-constraints): **Prisma ORM has no native `@@check` schema attribute in any 7.x release.** The recommended workflow is to hand-author the `CHECK (... OR ... OR ...)` clause as raw SQL inside a migration (typically `prisma migrate dev --create-only` then editing the generated `migration.sql`), after which `prisma db pull` will show it only as an unstructured comment, not a modeled attribute — Prisma Client doesn't understand or enforce it, the database does.

The project's own `services/backend/.claude/rules/nest-prisma.md` migration workflow ("Edit `schema.prisma` → `npm run db:migrate` creates + applies a migration") doesn't mention this exception, and the existing single migration (`20260810130423_init/migration.sql`) has no precedent for a hand-edited constraint. Postgres itself has zero trouble with a 3-armed `OR`'d CHECK — this is purely a Prisma-tooling gap, not a database one, and it's still true in 7.9.1 today. Not a reason to change AD-11; it does mean the first implementer needs a documented manual-SQL step that neither companion doc currently provides.

### 2. AD-11's partial-unique constraint ("one active `reportsTo` edge per userId, `type='direct'` only") also isn't expressible in plain Prisma schema — and the repo hasn't opted into the feature that would let it

Same table, the `UNIQUE` line is filtered (`WHERE type='direct'`), i.e. a **partial unique index**. Checked prisma.io/docs/orm/prisma-schema/data-model/indexes and the 2026-08-02 Prisma changelog directly:

- Native `where` support on `@@unique`/`@@index` **arrived as a preview feature in Prisma ORM v7.4** (Feb 2026) — well after this repo's stack was presumably first pinned, and after most training-data cutoffs, which is exactly the kind of thing this lens exists to catch.
- It requires `previewFeatures = ["partialIndexes"]` in the `generator` block. **`services/backend/prisma/schema.prisma` does not currently declare this preview feature** (checked directly — the generator block only sets `provider`, `output`, `moduleFormat`).
- It is still **preview, not GA**, even in the newest 7.9.1; full stabilization is a Prisma 8 (still RC) story per the changelog language ("Author expression and partial indexes in Prisma 8").
- Postgres/SQLite/SQL Server/CockroachDB are supported; MySQL is not (irrelevant here — project is Postgres).

Net: implementing AD-11's partial uniqueness constraint has two real options — (a) enable the `partialIndexes` preview feature and accept preview-stability risk, or (b) hand-author a `CREATE UNIQUE INDEX ... WHERE type = 'direct'` in raw migration SQL, same pattern as finding 1. Neither `database-schema.md` nor the Prisma rules file picks one or flags the choice. Worth a one-line note pointing whoever builds `Relationship` at this decision rather than letting them discover it mid-migration.

### 3. AD-14's router tree has one classic NestJS/Express route-ordering hazard, not called out in the text

Shape 1 puts `GET /users` (list), `GET /users/export`, and `GET /users/:id` at the same URL depth. NestJS routes on Express (confirmed via NestJS's own GitHub issue tracker, e.g. `nestjs/nest#13104` "Inconsistent Route Matching... Based on Route Declaration Order", and community writeups) matches routes **in controller-method declaration order**, and a `:id`-style param route will happily swallow a literal sibling (`/users/export` → treated as `GET /users/:id` with `id = 'export'`) if the param handler is declared first. Express does not error on this; it fails silently.

`api-conventions.md` documents the shape correctly (and its own prose order — list, then export, then `:id` — happens to be safe if carried literally into the controller), but nothing in AD-14 or the companion doc states the ordering requirement explicitly. Given AD-14 exists specifically to stop shape drift ("`PUT` vs `PATCH` for the same photo upload... already happened before this AD existed"), this is precisely the kind of silent regression the AD is meant to prevent, and it can reappear the moment someone runs `nest g resource` or reorders methods during a refactor. Worth one sentence in `api-conventions.md`: literal sub-routes (`export`, and any future one) must be declared before `:id` in the controller.

### 4. Checked and cleared: UUID v7 path-param validation is not a problem

Because AD-14 makes `:id`/`:itemId`/`:relationshipId`/`:policyId` path params pervasive across all four shapes, and the spine's Consistency Conventions mandate `uuidv7` everywhere, it's worth confirming the validation layer actually accepts v7. Pulled and read the actual pinned package sources rather than trusting summarized search results (which initially suggested class-validator only supported v3/4/5 — that turned out to be stale):

- `class-validator@0.15.1` (exact version pinned in `package.json`) — `IsUUID.js` now delegates to `validator.js`'s `isUUID` and its own docstring reads "Checks if the string is a UUID (version 1-8, nil, max, loose, all)." v7 is supported.
- `@nestjs/common@11.0.1` (the pinned floor version, before caret resolution) — `parse-uuid.pipe.js` source shows `uuidRegExps` already includes a `7:` entry and `ParseUUIDPipe`'s options type accepts `version: '7'`, with the default (`'all'`) accepting any version including 7.

No gap here — flagging it as confirmed-fine rather than silent, since it's an assumption that could plausibly have broken and is now verified against the literal installed bytes, not memory.

## Items outside today's diff, not re-litigated

`@prisma/adapter-pg` (driver adapters), Prisma's `prisma.config.ts` split, and PG18's data-directory path change are all pre-existing, already-working facts of `services/backend` (confirmed via its own `CLAUDE.md`/rules files) — not reopened here since AD-14/AD-11 don't touch them and they predate this update.

## Sources consulted

- npm registry: `npm view @nestjs/core`, `npm view prisma`, `npm view class-validator` (dist-tags, versions, time) — live query, 2026-08-22
- Package source pulled via `npm pack` and read directly: `class-validator@0.15.1` (`IsUUID.js`), `@nestjs/common@11.0.1` (`parse-uuid.pipe.js`)
- [Prisma ORM 7 release announcement](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0)
- [Prisma 8 overview](https://www.prisma.io/docs/orm/v8) / [next evolution blog](https://www.prisma.io/blog/the-next-evolution-of-prisma-orm)
- [Prisma CHECK constraints troubleshooting doc](https://www.prisma.io/docs/orm/more/troubleshooting/check-constraints)
- [Prisma indexes doc — partial/filtered index `where` argument](https://www.prisma.io/docs/orm/prisma-schema/data-model/indexes)
- [Prisma changelog 2026-08-02 — partial indexes in Prisma 8](https://www.prisma.io/changelog/2026-08-02)
- [Prisma system requirements](https://www.prisma.io/docs/orm/reference/system-requirements)
- [NestJS v12 roadmap coverage (InfoQ, Trilon)](https://www.infoq.com/news/2026/04/nestjs-12-roadmap-esm/) and [nestjs/nest PR #16391](https://github.com/nestjs/nest/pull/16391)
- [nestjs/nest issue #13104 — route order matching](https://github.com/nestjs/nest/issues/13104), [PR #13639 — UUID v7 in ParseUUIDPipe](https://github.com/nestjs/nest/pull/13639)
- [typestack/class-validator issue #2581 — UUID v7 support request](https://github.com/typestack/class-validator/issues/2581)
- [PostgreSQL 18 release announcement](https://www.postgresql.org/about/news/postgresql-18-released-3142/), [PostgreSQL 19 release notes (beta)](https://www.postgresql.org/docs/19/release-19.html)
- [Node.js 22 vs 24 LTS status after March 2026 schedule change](https://pocketlantern.dev/briefs/node-22-vs-node-24-after-release-schedule-change-2026)
- Local: `services/backend/package.json`, `services/backend/CLAUDE.md`, `services/backend/.claude/rules/nest-prisma.md`, `services/backend/prisma/schema.prisma`, `services/backend/prisma/migrations/20260810130423_init/migration.sql`
