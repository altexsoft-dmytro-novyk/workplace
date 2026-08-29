# Reviewer Gate — Repository Reality & Current-Technology Lens (CC-04 / CC-06)

**Reviewed:** `ARCHITECTURE-SPINE.md`, focusing on AD-19 (People Partner) and AD-20 (Departure), with their binding companion contracts.

**Reviewer date:** 2026-08-29

**Method:** ran the BMad architecture Reviewer Gate mechanical lint; inspected the actual backend at `services/backend`; then checked the named transaction, raw-SQL, locking, date/time, and version mechanisms against primary Prisma, PostgreSQL, NestJS, and npm sources. This review does not modify source artifacts.

## Verdict

**Conditional pass for design feasibility; not implementation-ready.** PostgreSQL 18 plus Prisma 7.10 can implement AD-19's compare-and-swap relationship operation and AD-20's durable, leased work queue. PostgreSQL explicitly supports `FOR UPDATE SKIP LOCKED` for queue-like multiple-consumer work, and Prisma 7 offers both interactive transactions and raw SQL. The current repository, however, is only the initial user-management slice: it has one `User` model and no `Relationship`, `Departure`, `EmploymentStatus`, action-item, or mentorship tables; no transaction use; no raw-SQL use; no worker; and no business-time-zone configuration. Therefore the architecture is not ratified as *implemented reality*—only as feasible future design.

The mandatory mechanical pass is clean: `lint_spine.py` reported **0 findings**.

## Evidence classification

| Classification | Evidence | Consequence |
| --- | --- | --- |
| Current repository fact | `package-lock.json` resolves Nest `11.2.3` and Prisma / client / adapter-pg `7.10.0`; `PrismaService` is a global singleton backed by `PrismaPg`; `schema.prisma` currently contains only `User`. | AD-19/AD-20 persistence and execution do not exist yet. |
| Current repository fact | No `$transaction`, `$queryRaw`, `$executeRaw`, `FOR UPDATE`, `SKIP LOCKED`, `Departure`, `EmploymentStatus`, `Relationship`, `people_partner`, or business-zone configuration occurs under backend `src/`, `prisma/`, or `.env.example`. | No code path currently enforces the claimed atomicity, lease fencing, due cutoff, or idempotency. |
| Primary-source verified feasibility | Prisma supports interactive `$transaction(async tx => ...)` for complex read/modify/write logic and raw `$queryRaw` / `$executeRaw` when the client API cannot express SQL; PostgreSQL documents `SKIP LOCKED` as appropriate for queue-like multiple consumers. | The selected stack fits the design if the transaction client and raw SQL stay inside the same transaction boundary. |
| Inference, explicitly marked | A future cross-context deployment would make the phrase “one cross-context PostgreSQL transaction” false unless every participating context stays in this same database/process or a different consistency design is approved. | The present monolith can do it; a distributed-context future cannot silently inherit it. |

## Findings

### F1 — High: AD-20 requires a transaction-propagation contract that the backend does not yet have

AD-20 requires one PostgreSQL transaction to close the active employment interval, insert the dismissed fact, deactivate the account/profile, cancel action items, close mentorship pairs, end assignments, and mark the departure applied. This is feasible **only** if every repository participating in that use case receives the same Prisma interactive-transaction client.

Current reality is different: `PrismaModule` exports a single global `PrismaService`; the existing repositories inject that base service directly and expose no transaction-aware port or unit-of-work boundary. `UserManagementModule` is the only current business context; action items and durable mentorship are not implemented. Calling independently injected `PrismaService` instances from a future coordinator would be easy to write but would run outside the interactive transaction and could commit partial offboarding.

**Required resolution before AD-20 implementation:** name one application-layer offboarding coordinator as the transaction owner; pass `Prisma.TransactionClient` (or a narrow transaction-capable repository interface) through every participating repository; keep raw claim/fence SQL and all effects on that client; reject the “one transaction” claim if a future dependency is remote or has another database. Add an integration test that deliberately fails the last write and proves no earlier effect remains.

This is a repository gap, not evidence that PostgreSQL or Prisma cannot support the rule. Prisma documents interactive transactions precisely for multi-step read/modify/write work: [Prisma transactions](https://docs.prisma.io/docs/orm/v7/prisma-client/queries/transactions).

### F2 — High: the configured business timezone is specified but absent from deploy and backend configuration

AD-20 makes a `DATE` due at `00:00` in deployment-configured IANA `businessTimeZone`, and AD-10 requires the request-time auth/AccessControl cutoff to use that identical clock. `src/config/env.validation.ts` and `.env.example` contain no such setting. Current `User.companyJoinDate` is correctly mapped as `DateTime @db.Date`, but that does not establish how a configured civil date is compared to “today.”

Without an explicit setting, the database session time zone, host time zone, worker time zone, and request process time zone can disagree around midnight or daylight-saving transitions. PostgreSQL says a time-zone-aware value is displayed in the current `TimeZone`, while named IANA zones carry daylight-saving rules; the cutover must not be inferred from a host default: [PostgreSQL date/time types](https://www.postgresql.org/docs/current/datatype-datetime.html).

**Required resolution before AD-20 implementation:** add one required, validated `BUSINESS_TIME_ZONE` IANA setting; derive the due date in PostgreSQL from the same supplied zone—for example, conceptually `(CURRENT_TIMESTAMP AT TIME ZONE :businessTimeZone)::date`—in both the request guard and worker eligibility query. Keep `effectiveDate` a PostgreSQL `DATE`; do not compare a JavaScript `Date` whose local time has been implicitly selected. Add boundary tests for the configured zone's midnight and DST dates.

### F3 — High: AD-19's “atomic expected-current” guarantee needs a concrete database compare-and-swap shape

The intended behavior is sound: PP is one `people_partner` edge per employee; `PUT` creates or replaces it only when `expectedCurrentTargetId` matches; one before/after journal record commits with the edge; stale state returns `409`. But neither the backend nor the current schema contains `Relationship`, the partial unique index, a journal table, or a transactional relationship repository. A read-then-write implementation would lose the guarantee: two requests that both read old PP `A` could each replace it with a different value, and a missing-row (`expectedCurrentTargetId = null`) case cannot be protected by locking a row that does not exist.

**Required resolution before AD-19 implementation:** make the operation a database CAS inside an interactive transaction. For an existing row, update/delete must predicate on both employee, `type = 'people_partner'`, and the expected target, and insert the journal only if that statement succeeded. For the absent-row path, the partial unique index on `(userId) WHERE type = 'people_partner'` must be the concurrency backstop; map the losing unique conflict to the same stale-state `409`. Give `DELETE` an explicit canonical carrier for `expectedCurrentTargetId` (for example a documented header or query field) rather than leaving each client to invent a body shape. Test concurrent create/create and replace/replace, asserting exactly one edge and exactly one journal entry.

Prisma can execute the necessary parameterized raw SQL inside the transaction; raw SQL is an intended escape hatch when client operations cannot express the required SQL: [Prisma raw SQL](https://www.prisma.io/docs/orm/v6/prisma-client/using-raw-sql). PostgreSQL `CHECK` constraints remain database-enforced after Prisma introspection: [Prisma CHECK-constraint guidance](https://docs.prisma.io/docs/orm/v6/more/troubleshooting/check-constraints).

### F4 — High: the departure claim/lease design is feasible, but its fence and retry predicates need a single executable SQL contract

`FOR UPDATE SKIP LOCKED` is the right PostgreSQL primitive for multiple workers consuming due work: PostgreSQL explicitly calls it appropriate for queue-like tables. It cannot by itself prove AD-20's safety. The claim must deterministically order eligible rows and atomically set `state`, `leaseUntil`, `leaseToken`, attempts, and next-attempt values; the apply transaction must lock the departure row and predicate every effect on the still-current token. Expired `processing` rows must be explicitly eligible for reclaim, otherwise an expired lease can become permanently stuck despite “no terminal abandoned state.”

The spine and `database-schema.md` describe the outcome, but the current code has no worker or raw-SQL convention, and the Prisma rule only documents the simple schema-edit → migrate workflow. That workflow is insufficient for a claim CTE/`FOR UPDATE SKIP LOCKED` implementation and for the partial non-applied-departure uniqueness constraint.

**Required resolution before AD-20 implementation:** put one parameterized claim statement and one fenced apply transaction in a dedicated infrastructure repository; include a stable `ORDER BY` in the claim; specify eligibility for `scheduled`, `retry_wait`, and expired-lease `processing` records; use server/database time for lease comparison; and exercise two workers plus an expired-lease reclaim in real-Postgres E2E tests. PostgreSQL warns that `SKIP LOCKED` intentionally produces an inconsistent view and is for queue-like consumers, not general reads: [PostgreSQL locking clauses](https://www.postgresql.org/docs/current/sql-select.html).

### F5 — Medium: current-version assertions have drifted; staying on the existing majors is a conscious compatibility choice, not “latest”

Repository reality is Nest `11.2.3` and Prisma `7.10.0`, not the older versions cited by the prior web-verification review. Both are internally consistent with the backend's CommonJS generated Prisma client and Node `>=24` setting. However:

- Nest `12.0.1` is now npm `latest`; the Stack instruction “do not adopt v12 until GA” is stale. Nest's official migration guide says v12 is ESM-only and requires a deliberate migration, so this is **not** a recommendation to upgrade automatically. Update the decision to say that Nest 11 is deliberately retained pending a planned CommonJS-to-ESM migration. Sources: [npm package metadata](https://www.npmjs.com/package/%40nestjs/core?activeTab=versions), [Nest 11→12 migration guide](https://github.com/nestjs/docs.nestjs.com/blob/master/content/migration.md).
- Prisma's documentation now calls Prisma 8 the current release while stating Prisma 7 remains fully supported. The stack can remain on 7.10, but the companion's “verified against Prisma 7.9.1” migration note is no longer exact. Revalidate the chosen constraint strategy on 7.10 when creating the migration. Partial indexes are available in 7 behind the `partialIndexes` Preview feature; the current schema does not enable it, so raw migration SQL remains a valid deliberate choice. Sources: [Prisma ORM 7 overview](https://www.prisma.io/docs/orm/v7), [partial-index documentation](https://docs.prisma.io/docs/orm/prisma-schema/data-model/indexes), [Prisma preview-feature status](https://www.prisma.io/docs/orm/v7/reference/preview-features/client-preview-features).

### F6 — Medium: idempotency data is close, but normalization and conflict mapping are not yet binding enough for an implementation

The proposed `idempotencyKey` unique key, `requestHash`, and partial “one non-applied departure per user” uniqueness are an appropriate shape. The API contract says same key + same payload returns the original result and same key + different payload returns `409`; different key while a non-applied departure exists also returns `409`. The current repository has no header parsing, hash function, table, partial index, or error mapping.

**Required resolution before implementation:** define the canonical hash inputs (at minimum normalized user id, ISO `effectiveDate`, reason, and any versioned request fields; exclude irrelevant JSON representation), store them in the same insert transaction as the command, and make unique-conflict recovery re-read and compare the stored hash. Map `(idempotencyKey)` conflict versus `(userId where state <> 'applied')` conflict deliberately rather than relying on an undifferentiated Prisma `P2002`. Test identical concurrent retries, different-payload key reuse, and two different keys for one user.

## Cleared feasibility points

- **PostgreSQL + Prisma fit:** The existing `PrismaPg` adapter and PostgreSQL 18 development image are compatible with interactive transactions and parameterized raw queries; no replacement technology is required.
- **Raw-SQL constraints:** The current companion's requirement for raw SQL for `CHECK` constraints is still valid. Partial indexes now have a Prisma 7 preview option, but raw migration SQL is still reasonable because the repository has not enabled that preview feature and the state-machine predicate will be PostgreSQL-specific.
- **Row locking / SKIP LOCKED:** PostgreSQL expressly supports the named locking form. It is appropriate for claim work, subject to F4's fence, retry, and real-Postgres test requirements.
- **Cross-context atomicity:** Feasible today only as an in-process, one-PostgreSQL-database application transaction. It is not a general distributed-transaction promise.
- **PP audience and schema shape:** `Relationship.type = 'people_partner'` with one partial unique edge per employee is compatible with the existing PostgreSQL/Prisma stack. No repository evidence yet proves the PP chain, next-request revocation, or journal behavior.

## Repository evidence consulted

- `services/backend/package.json` and `package-lock.json` — exact installed stack: Nest 11.2.3; Prisma, client, and adapter-pg 7.10.0; Node `>=24`.
- `services/backend/prisma/schema.prisma` and its sole migration — only `User` currently exists; no AD-19/AD-20 schema.
- `services/backend/src/prisma/prisma.service.ts` and `prisma.module.ts` — global Prisma client using `PrismaPg`.
- `services/backend/src/user-management/infrastructure/user.repository.ts` and `user-management.module.ts` — direct base-client injection, no transaction propagation surface.
- `services/backend/src/config/env.validation.ts` and `.env.example` — no business timezone setting.
- `services/backend/.claude/rules/nest-prisma.md` — no raw-SQL / transaction / lease house style beyond the standard migration workflow.
- `docs/architecture/database-schema.md`, `access-control.md`, `api-conventions.md`, and `domain-driven-design.md` — companion contract check.

## Disposition

Do not alter the architecture merely because its structures are not implemented yet. Before an AD-19 or AD-20 story is accepted, add the missing transaction, timezone, CAS/fencing, constraint, and real-PostgreSQL E2E contracts described in F1–F4; update the current-tech wording in F5; and bind the idempotency normalization/error behavior in F6.
