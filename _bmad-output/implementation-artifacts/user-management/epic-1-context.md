# Epic 1 Context: Employee Record Management

<!-- Regenerated 2026-09-01 from epics.md v1.5 — supersedes the pre-v1.5 version; NOT an AD-1 approval. -->
<!-- Compiled planning context for a future story-authoring / dev pass. NOT an AD-1 stage-1 scenario doc (those live in docs/test-cases/user-management/ and are the TEA phase's job). -->

## Goal

Entitled actors manage identity data over the **seeded, imported** population
(§4.17): the `User` identity record, S1 identity-card read/edit, Self photo
upload, and a paginated permission-safe public listing. There is **no employee
creation** — no `POST /users`, no AD, no SSO. Generic deactivation is gone;
`isActive` is an internal account/row-retention flag only, and the v1.5
lifecycle (departure) lives in Epic 5. Epic 1 is the foundational `User` surface
Epic 2's login and Epic 3's automatic events depend on.

## Stories

- Story 1.1: Import Seeded Population
- Story 1.2: View and Edit an Employee's Identity-Card Fields
- Story 1.3: Self Uploads Own Photo
- Story 1.5: List Employees with Pagination and Filters

*(There is no Story 1.4. The pre-v1.5 "HR Admin Deactivates an Employee" is
retired — see `spec-1-4-hr-admin-deactivates-an-employee.md`, a SUPERSEDED
pointer.)*

## Requirements & Constraints

- **No `POST /users`.** The population is an idempotent seeded import keyed by
  external timetracker identity (`ttId`). Creating employees via API or UI is
  out of scope (AD-14, AD-16, §4.17). `POST /users` and generic
  `DELETE /users/:id` are **retired in the v1.5 cutover** (AD-21) — a
  regenerated Story 1.1/1.2 must name them as removals, not extend them.
- **Kernel-reality constraints on the seed/import writer (2026-09-01):**
  - **DEC-UM-007 canonical at write** — the writer trims + lowercases
    `workEmail` and **stores the normalized value**. The DB `users_workEmail_key`
    index is on the raw value, so normalized uniqueness is a writer-side
    guarantee; a DB-enforced functional unique index is deferred work
    (`deferred-work.md`).
  - **DEC-UM-009 / ACM-0** — `npm run db:seed` has already created the single
    active root `User` (normalized `workEmail`) before import runs (order:
    `db:deploy` → `db:seed` → `db:bootstrap:access-control` → `start:prod`). An
    import covering the root person **reuses the ACM-0 root `User` id**; no
    writer inserts a second row for a normalized email that already exists.
  - Each imported `User` gets a system `joined_company` `UserEvents` row written
    synchronously in the same transaction as the row insert (AD-11 / Epic 3
    pattern) — not via an HTTP create.
- **Authorization is Epic 0's, not Epic 1's.** This suite covers workflow / data
  correctness only. `PATCH`/`GET /users/:id` entitlement — Self / reporting / PP
  allowed, colleague denied, the §2.2 dual gate — is asserted by Epic 0 against
  the real `AccessControlFacade`. Do not duplicate entitlement scenarios here;
  do not harden the interim-permissive `isAllowedForTarget`.
- **FR-9 (S1 write).** Self can directly write only the photo (Story 1.3).
  Manager, People Partner, and department are shown in S1 but changed only
  through Epic 4's dedicated screen — `UpdateUserDto` has no such properties and
  `EditUserAction` rejects them (tested).
- **`workEmail`/`ttId` unique at write** — on the seed/import writer and on
  authorized identity `PATCH`; a conflicting write is rejected wholesale
  (`409`), leaving the target row unchanged. `ttId` null-vs-null is not a
  duplicate.
- **List scope (Story 1.5).** Filters cover permission-safe S1 fields on the
  `User` row plus employment status. Technical `ttId`/`isActive` are never
  public filters. A `dismissed` employee is absent from the default list but
  findable through an authorized employment-status filter. Dynamic custom
  fields, saved views, export, and inline editing are platform directory scope.
- **NFR-1** pseudonymised data only. **NFR-2** `GET /users` within 2 s for 500+
  records with arbitrary filters incl. permission resolution (joint budget with
  access-control). **NFR-3** future integration failures degrade gracefully.
  **NFR-4** every controller calls through the facade — made concrete by Epic 0
  (FR-16).

## Technical Decisions

- Standard hexagonal layout: `application/` (actions, controllers, DTOs),
  `domain/` (interfaces, services, entities), `infrastructure/` (Prisma
  repositories, adapters). Domain imports nothing from Prisma, NestJS transport,
  or HTTP.
- Router shapes (AD-14, `api-conventions.md` shape 1): `GET /users`,
  `GET /users/export` (declared **before** `:id`), `GET /users/:id`,
  `PATCH /users/:id`, `PUT /users/:id/photo` (multipart, full-replace).
  **No `POST /users`, no generic `DELETE`.**
- `User` fields per `database-schema.md`: `id` (uuidv7), `firstName`,
  `lastName`, `photo` (nullable), `position`, `country`, `city`, `workEmail`
  (unique, normalized-stored), `workPhone` (nullable), `birthDay` (1-31) +
  `birthMonth` (1-12) — two fields, no year — `companyJoinDate`, `isActive`
  (default `true`, internal row-retention only), `ttId` (nullable, unique),
  `customFields` (jsonb, interim), `createdAt`, `createdBy`. No
  `updatedAt`/`updatedBy` (no named consumer). Manager / project / people
  partner / department / mentor are **never** columns on `User`.
- Photo storage (Story 1.3) needs a real `ObjectStoragePort` + real adapter
  (AD-15: photo storage is Story 1.3's own deliverable — no fake at the adapter
  level; the `src/storage/` `S3StorageAdapter` + LocalStack precedent applies).
  A fixture fake standing in for photo storage does **not** make Story 1.3 done.
- `EmploymentStatus` (`active`/`dismissed`, time-bounded) is distinct from
  `isActive` and from the predictive `leaver` risk level. Story 1.5's default-
  list exclusion reads it; the write path is Epic 5.

## Cross-Story / Cross-Epic Dependencies

- Story 1.2's authorization ACs are satisfied by **Epic 0**.
- Story 1.1's `joined_company` write and Story 1.2's `position_change` write are
  the hooks **Epic 3 Story 3.1** attaches to — those handlers must exist as real
  code before Epic 3 Story 3.1 can wire in.
- Epic 2 seeds its precondition `User` row directly via Prisma or the import
  script, not through any Epic 1 HTTP surface (AD-3).
- The pre-v1.5 backend (`register-user.action.ts`, `deactivate-user.action.ts`,
  `POST /users` + `DELETE /users/:id` in `users.controller.ts`) is **retired**
  in the same cutover that introduces the v1.5 import/departure contracts
  (AD-21). Existing test data is re-imported through the seeded-population path.
