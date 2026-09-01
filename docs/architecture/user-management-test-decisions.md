# User Management — Approved Test & Product Decisions

**Status:** NORMATIVE (approved 2026-08-25); **create-path decisions reframed 2026-09-01** for v1.5 (no `POST /users`) and kernel reality — see the per-decision notes and the consolidated proposal `sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md`.
**Source:** System-level TEA test design + critical review, human-approved by product owner  
**Applies to:** `user-management` bounded context — Epics 0–5, stage-1 scenarios, implementation  
**Supersedes:** Prior "assumption" and "open question" entries in `spec-user-management-test-cases/SPEC.md` for the items below

These decisions are binding for scenario documents, E2E tests, and implementation unless explicitly reopened through the architecture change process. The 2026-09-01 reframe is editorial-to-v1.5, not a reopening: it renames "registration / `POST /users`" to "seed/import writer" where the behaviour still holds, and marks the rest RETIRED. This file is a companion of `spec-user-management-test-cases`; the TEA phase realigns that SPEC — this file is left internally consistent for that pass.

---

## DEC-UM-001 — Career timeline read vs write audience (B-01 / C-01)

**Read (§3.2 S9):** The full Manager line and the assigned People Partner may read the career timeline.

**Write (§4.9 manual override):** Only the **assigned PP** and the employee's **direct Unit Manager** may manually add, correct, or delete timeline entries. Project-derived DM/PM and transitive managers are read-only for manual mutation.

**Rationale:** §4.9 is the more specific workflow rule for manual backfill; §3.2 S9 governs read access for the broader Manager line.

**v1.5 mapping (2026-09-01):** this is Epic 3 Stories 3.2 (manual add) and 3.3 (edit/delete). It is the §2.2 dual gate plus a §3.3 matrix exception — the actor needs **both** the runtime *edit the career timeline* permission **and** the narrowed S9 write audience (assigned PP or direct Unit Manager). "Unit Manager" = the manager of the employee's department (§4.17); there is no separate "unit" entity.

---

## DEC-UM-002 — Deactivation authorization (B-02 / A-02)

**v1.5 note (2026-09-01):** generic product deactivation is retired (AD-16 — `isActive` is an internal row-retention flag only; the v1.5 lifecycle is the Epic 5 departure workflow). The **principle carries**: any capability check — including the Epic 0 adoption adapter and the departure command — is a **no-target AccessControl feature capability** check through the facade; **no controller, action, domain service, or adapter hard-codes a role name or `User.position`** (`access-control.md`, AD-4 prohibits `position === 'HR Admin'` as an authorization rule). The interim adapter's `actor.position === 'HR Admin'` check is exactly what Epic 0 CAP-1 deletes.

**Test convention:** Use **Ida** (holds an unrelated functional permission) for generic feature-permission denial probes. Use Bob only when testing a distinct manager-specific denial unrelated to the capability under test.

---

## DEC-UM-003 — `customFields` at seed/import (B-05 / A-03) — REFRAMED (v1.5 — no `POST /users`)

The `User.customFields` column defaults to `{}` at the database level. The **seed/import writer** omits `customFields`; the created row persists `{}`. (The original wording was about a registration payload; there is no registration payload in v1.5. The DB-default behaviour is unchanged and still worth a seed/import assertion — trace `um-seed-*`.)

---

## DEC-UM-004 — Magic-link security (R-003 / A-01)

| Behavior | Rule |
| --- | --- |
| Unknown email | Same `200` response shape as a known email; **zero** email dispatch |
| Known email | Dispatch exactly one magic link |
| Token TTL | Configuration-owned; tests inject deterministic TTL and use a controllable clock |
| Token reuse | Single-use — replay returns `401` |
| Expired token | Returns `401` |

Rate limiting and delivery-channel hardening are separate follow-up work, not blockers for enumeration/replay tests.

---

## DEC-UM-005 — Reports-to reassignment (R-004 / A-06)

At most one active `direct` reports-to edge per employee (AD-11 UNIQUE). Reassignment is explicit **`DELETE` then `POST`**. A second `POST` while a direct edge exists returns **`409`**, not implicit replace.

**Accepted residual:** A failed `POST` after successful `DELETE` may temporarily leave the employee without a manager under the reject-then-retry workflow.

**v1.5 mapping (2026-09-01):** still valid for Epic 4 Story 4.1 (change an employee's manager). The write goes through the dedicated `change organisational relationships` permission and the organisational-relationship screen, rejects self-assignment, and journals atomically (§3.4) — the journal-writing stage is blocked on CC-07 (AD-19 Journal gate).

---

## DEC-UM-006 — Server-owned create fields (OQ1) — RETIRED (v1.5 — no `POST /users`)

There is no `POST /users` create payload in v1.5, so "client-supplied `id`/`createdAt`/`createdBy` returns `400`" has no surface. The seed/import writer owns all audit/identity fields by construction (it is the writer, not a request handler). No equivalent is needed. See Story 1.1 (`um-seed-*`). If a future operator batch-import transport is specified (AD-14/AD-16 follow-up), its own AD-1 scenario decides how it treats operator-supplied identity fields.

---

## DEC-UM-007 — `workEmail` normalization (OQ2) — KEPT, reconciled to kernel reality

Trim outer whitespace and lowercase before validation, storage, lookup, and uniqueness comparison. **Identity is canonical *at write*:** the **seed/import writer** stores the normalized value (previously the seed stored `ROOT_WORK_EMAIL` verbatim; the API DTOs already normalized on write). The database `users_workEmail_key` index is on the **raw stored value**, so normalized uniqueness is a **writer-side** guarantee — the earlier wording "uniqueness is enforced on the normalized value" is corrected to **"writer-side canonical; a DB-enforced functional unique index over the normalized value is deferred work"** (`_bmad-output/implementation-artifacts/access-control/deferred-work.md`). ACM-0 (`npm run db:seed`) applies this for the root row; Story 1.1's import applies it for every imported row. Exact-one eligibility counts **all** normalized matches first, checks active state only afterwards.

**Import source (2026-09-01).** Story 1.1's import reads the delivered semicolon-delimited timetracker export `docs/Accounts_template.csv` (header `FirstName;LastName;Email;Birthday;PositionId;PositionName;RegistrationDate;DepartmentId;DepartmentName;DismissedDate;IsDismissed;EmployeeType;TimeZone;CountryId;CountryCode;CountryName;CountryStateId;CountryStateName`). The file has **no employee-id column**, so the import is **keyed by the normalized `Email`** and normalization under this decision applies to the CSV's `Email` column. `ttId` (AD-13) has no source column → left `null`. A CSV row whose normalized `Email` equals `ROOT_WORK_EMAIL` **updates the ACM-0 root `User`** in place (DEC-UM-009). Column → `User` field mapping and OPEN items: `docs/test-cases/user-management/seed/README.md`, `_bmad-output/implementation-artifacts/user-management/spec-1-1-import-seeded-population.md`.

---

## DEC-UM-008 — Registration dispatch durability (OQ3 / B-04) — RETIRED (v1.5 — no registration)

There is no registration transaction in v1.5. Seed/import does **not** dispatch a magic link (FR-3: completing seed/import does not establish a session, and there is no separate invite path). The `joined_company` `UserEvents` row is still written at import — synchronously, same transaction as the row insert (AD-11 / Epic 3 pattern) — trace `um-seed-*` / `um-ct-01`. Magic-link dispatch durability now belongs entirely to Epic 2 Story 2.1 (`POST /auth/magic-link`) and its own DEC-UM-004 rules; there is no create-time dispatch to make durable.

---

## DEC-UM-009 — Rehire identity (OQ4) — KEPT, reframed to the seed/import writer

A deactivated employee retains the same `User` identity and history. **No writer — seed, import, or any future rehire endpoint — creates a second row for a normalized email that already exists (active or inactive).** Concretely for v1.5: ACM-0 (`npm run db:seed`) creates the single active root `User` before Story 1.1's import; a CSV row whose normalized `Email` matches `ROOT_WORK_EMAIL` **updates the ACM-0 root `User` in place** (same `id`/`createdAt`/`createdBy`) rather than inserting a second row (Kernel MVP SPEC constraint; DEC-UM-007 canonical-at-write makes the normalized-match check reliable). The `docs/Accounts_template.csv` sample row `dmytro.novyk+boot@altexsoft.com` is a normal employee row unless it matches `ROOT_WORK_EMAIL`. A dedicated rehire/reactivation endpoint stays out of scope; when it lands it must reuse the existing `User` id. Trace `um-seed-*`.

---

## DEC-UM-010 — Gate E2E isolation (OQ5 / B-03)

| Phase | Rule |
| --- | --- |
| Initial | One Playwright test worker; collision-proof UUID namespace per run/test; each test deletes only data it owns |
| Parallel CI enablement | One PostgreSQL schema per worker; cleanup per schema after run |

`Date.now()` prefix alone is not sufficient for isolation. Parallel HTTP inside one test (`Promise.all`) is allowed for concurrency scenarios while worker count remains one.

---

## DEC-UM-011 — Manual vs automatic `UserEvents` types (C-06)

Manual backfill may use any documented `UserEvents` type, including `mentorship_end`, to prove the **manual** path only. Automatic `mentorship_start` / `mentorship_end` from relationship attach/detach is proven separately in Epic 4 scenarios (`um-rel-04` / `um-rel-05`).

---

## DEC-UM-012 — Deactivated-user magic-link request (extends DEC-UM-004)

**Status:** Proposed 2026-08-25 by TEA per-file scenario review — not covered by the 2026-08-25 product approval that settled DEC-UM-001..011; treat as draft until explicitly confirmed.

A deactivated user's `workEmail` is treated identically to an unknown email for `POST /auth/magic-link` purposes: `200` with the same generic response shape, **zero** email dispatch. The endpoint must not reveal deactivation status any more than it reveals account existence — DEC-UM-004's enumeration-safety principle extends to deactivated accounts, not just nonexistent ones.

This closes the one case DEC-UM-004 left open (known-but-deactivated email) without weakening it: a caller who already knows an address is registered still learns nothing about whether it is active. It does not change the consume-side rule — a token issued before deactivation still fails at consume (`um-auth-06` Test 2), independent of this decision.

---

## Traceability

`um-reg-*` rows are dropped — the registration suite is retired with `POST /users` (v1.5). `um-seed-*` is Story 1.1's seed/import suite; its exact case ids are the TEA phase's to fix (`docs/test-cases/user-management/seed/`).

| Decision | Primary scenarios |
| --- | --- |
| DEC-UM-001 | `um-ct-03`, `um-ct-04`, `um-ct-05`, `um-ct-06` (Epic 3 Stories 3.2/3.3) |
| DEC-UM-002 | `um-seed-*` (capability-denial probe), Epic 0 adoption `isAllowed` cases, Epic 5 departure-permission denial |
| DEC-UM-003 | `um-seed-*` (imported row persists `customFields: {}`) |
| DEC-UM-004 | `um-auth-01`..`06` |
| DEC-UM-005 | `um-rel-*` (Epic 4 Story 4.1 reports-to reassignment) |
| DEC-UM-006 | RETIRED — no `POST /users` payload in v1.5 |
| DEC-UM-007 | `um-seed-*` (writer stores normalized `workEmail`); ACM-0 covers the root row |
| DEC-UM-008 | RETIRED — no registration-time dispatch; `joined_company` at import traces `um-seed-*` / `um-ct-01` |
| DEC-UM-012 (proposed) | `um-auth-06` |
| DEC-UM-009 | `um-seed-*` (import reuses the ACM-0 root `User` id; no second row for an existing normalized email) |
| DEC-UM-010 | All suites; `@concurrency` tags |
| DEC-UM-011 | `um-ct-03` vs `um-rel-04`/`05` |
