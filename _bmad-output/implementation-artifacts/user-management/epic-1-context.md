# Epic 1 Context: Employee Record Lifecycle

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

This epic delivers the `User` entity's full lifecycle: HR Admin onboards a new hire, any entitled actor (Self / Manager-line / People Partner) can read and edit that person's identity-card fields, the employee can upload their own photo, HR Admin can deactivate someone who has left, and any entitled actor can page through the employee directory with filters. All five stories share one `User` entity, controller, and migration, so they're grouped as one epic rather than split. This is the foundational surface every other domain epic depends on: Epic 2's login needs a `User` row to exist, and Epic 3's automatic career-timeline events hook directly into this epic's create/update handlers.

## Stories

- Story 1.1: HR Admin Registers a New Hire
- Story 1.2: View and Edit an Employee's Identity-Card Fields
- Story 1.3: Self Uploads Own Photo
- Story 1.4: HR Admin Deactivates an Employee
- Story 1.5: List Employees with Pagination and Filters

## Requirements & Constraints

- The very first `User` is created by a seed script with the HR Admin role assigned directly — not through the registration endpoint. That bootstrap behavior has its own acceptance test elsewhere; this epic doesn't re-test it.
- Registration is HR-Admin-driven on the new hire's behalf, not self-service. There is no intermediate "invited/pending" status: a registered record is `isActive: true` immediately, and dispatching a magic-link email is the activation-equivalent step. No password or credential is ever stored or returned.
- `workEmail` and `ttId` must be unique at write time, enforced on both create and edit — a conflicting write is rejected wholesale (no partial update), leaving the existing record unchanged.
- `photo` is the only identity-card field an employee can write on themselves, via a dedicated full-replace upload endpoint (distinct from the general field-edit endpoint).
- Deactivation is a soft delete: it flips `isActive` to `false` but the record stays fully readable by id (never 404s) — only list-style views exclude inactive records by default.
- This suite covers workflow/data correctness only, not who is entitled to do it — entitlement logic itself is proven in access-control's own test suite. Every controller must still route entitlement checks through the shared facade rather than reimplement checks locally.
- The list endpoint's filters cover only the fields that live on the `User` row (name, position, location, contact fields, dates, `ttId`, `isActive`); dynamic custom-field filtering, saved views, export, and inline editing are explicitly out of scope for this epic.
- The list endpoint must stay performant at 500+ records with arbitrary filters, including permission resolution — a joint budget shared with access-control's tier resolution.
- `User` carries real personal data (photo, birth date, work email/phone) — use only pseudonymised data outside production; never real personal data in logs, fixtures, or the repo.
- Failures in future external integrations (e.g. timetracker, which will eventually populate/consult `ttId`) must never take the application down.

## Technical Decisions

- Standard hexagonal layout: `application/` (actions, controllers, DTOs), `domain/` (interfaces, services, entities), `infrastructure/` (Prisma repositories, adapters). Domain code must import nothing from Prisma, NestJS transport, or HTTP.
- Fixed router shapes for the `User` resource: `POST /users`, `GET /users` (list/filter), `GET /users/export` (out of this epic's scope, but must be declared *before* `:id` routes so it isn't swallowed by a param route — the ordering rule applies to any sibling literal route this epic adds), `GET /users/:id`, `PATCH /users/:id` (partial update), `DELETE /users/:id` (soft-delete, not a real row delete), `PUT /users/:id/photo` (full-replace multipart — deliberately `PUT`, not `PATCH`).
- Every entitlement check goes through one shared AccessControl facade — either a no-target capability check or a target-scoped tier check — never a direct role-flag or policy-table read inside a user-management controller.
- `User` fields: `id` (uuidv7), `firstName`, `lastName`, `photo` (nullable), `position`, `country`, `city`, `workEmail` (unique), `workPhone` (nullable), `birthDay` (nullable int, 1-31) + `birthMonth` (nullable int, 1-12) — two separate fields, no year captured or stored for any audience; §3.2 S1 content is literally "birthday (day and month)", and the earlier single full-`birthDate` design invented an audience-based year-redaction rule the source doesn't state (resolved 2026-08-25) — `companyJoinDate`, `isActive` (default `true` — soft delete; not a status modeled on project-requirements.md, which never describes a deactivation feature; exists because `UserEvents`/`Relationship` rows reference `User` by FK and must stay valid after someone leaves; distinct from S4's sourced "employment status" field, still unbuilt), `ttId` (nullable, unique, reserved for a future timetracker integration), `customFields` (jsonb, interim only — don't build persistence assuming this shape survives), `createdAt`, `createdBy` (FK to `User`). No `updatedAt`/`updatedBy` — omitted deliberately, no named consumer yet; don't add speculatively.
- Manager, current project(s), people partner, department, and mentor are deliberately never columns on `User` — they're derived from a separate relationships/policy mechanism owned by other epics. Don't reintroduce them here even as convenience fields.
- Quality gate: an approved scenario document must exist before an E2E test is written, and an E2E test must exist and be red before production code is written — no story skips the middle stage. Stories 1.1–1.4 already have draft scenario docs pending approval under `docs/test-cases/user-management/` (registration, profile, deactivation folders) — reuse and get them approved rather than rewriting from scratch. Story 1.5 (the list endpoint) has no scenario doc yet; its owner starts from a blank page.
- E2E tests hit the real HTTP → router → DB stack, but any outbound integration (e.g. the magic-link dispatch triggered by registration) is rebound to a fixture-backed fake in the test module — no live third-party calls in tests.

## Cross-Story Dependencies

- Story 1.1's registration flow triggers a magic-link dispatch as a side effect, but only through an outbound port — the real email-sending adapter belongs to the (separately built) authentication epic. Story 1.1's own tests bind that port to a fake, so it isn't blocked waiting on that other epic.
- Story 1.4 (deactivate) deliberately does not implement "deactivated users are excluded from the list" — that behavior belongs to Story 1.5.
- Story 1.2's edit handler is the same code path a later epic's automatic change-logging will hook into; no action needed now, but avoid designing the handler in a way that would make adding that hook awkward later.
