# User Management — Approved Test & Product Decisions

**Status:** NORMATIVE (approved 2026-08-25)  
**Source:** System-level TEA test design + critical review, human-approved by product owner  
**Applies to:** `user-management` bounded context — Epics 1–4, stage-1 scenarios, implementation  
**Supersedes:** Prior "assumption" and "open question" entries in `spec-user-management-test-cases/SPEC.md` for the items below

These decisions are binding for scenario documents, E2E tests, and implementation unless explicitly reopened through the architecture change process.

---

## DEC-UM-001 — Career timeline read vs write audience (B-01 / C-01)

**Read (§3.2 S9):** The full Manager line and the assigned People Partner may read the career timeline.

**Write (§4.9 manual override):** Only the **assigned PP** and the employee's **direct Unit Manager** may manually add, correct, or delete timeline entries. Project-derived DM/PM and transitive managers are read-only for manual mutation.

**Rationale:** §4.9 is the more specific workflow rule for manual backfill; §3.2 S9 governs read access for the broader Manager line.

---

## DEC-UM-002 — Deactivation authorization (B-02 / A-02)

Deactivation is gated by a **no-target AccessControl feature capability** held by the HR Admin role. Controllers must not hard-code role names.

**Test convention:** Use **Ida** (holds an unrelated functional permission) for generic feature-permission denial probes. Use Bob only when testing a distinct manager-specific denial unrelated to the deactivation capability.

---

## DEC-UM-003 — `customFields` on registration (B-05 / A-03)

The `User.customFields` column defaults to `{}` at the database level. Registration payloads omit `customFields`; the created row persists `{}`.

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

---

## DEC-UM-006 — Server-owned create fields (OQ1)

Client-supplied `id`, `createdAt`, or `createdBy` in a `POST /users` payload returns **`400`**. The server does not silently strip caller-supplied audit or identity fields.

---

## DEC-UM-007 — `workEmail` normalization (OQ2)

Trim outer whitespace and lowercase before validation, storage, lookup, and uniqueness comparison. Uniqueness is enforced on the normalized value.

---

## DEC-UM-008 — Registration dispatch durability (OQ3 / B-04)

Registration commits the `User`, `joined_company` `UserEvents` row, and **durable magic-link dispatch intent**, then returns **`201`**. A downstream email transport failure does **not** roll back the employee. Failure is observable (pending/failed) and retryable. Retry count and backoff are operational configuration.

---

## DEC-UM-009 — Rehire identity (OQ4)

A deactivated employee retains the same `User` identity and history. `POST /users` must never create a second row for a normalized email that already exists (active or inactive). A dedicated rehire/reactivation endpoint is out of scope for this decision; when it lands, it must reuse the existing `User` id.

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

## Traceability

| Decision | Primary scenarios |
| --- | --- |
| DEC-UM-001 | `um-ct-03`, `um-ct-04`, `um-ct-05`, `um-ct-06` |
| DEC-UM-002 | `um-deact-03`, `um-reg-03` |
| DEC-UM-003 | `um-reg-01` |
| DEC-UM-004 | `um-auth-01`..`05` |
| DEC-UM-005 | `um-rel-01`..`03` |
| DEC-UM-006 | `um-reg-10` |
| DEC-UM-007 | `um-reg-11` |
| DEC-UM-008 | `um-reg-05`, `um-reg-nfr-dispatch-failure` |
| DEC-UM-009 | `um-reg-12` |
| DEC-UM-010 | All suites; `@concurrency` tags |
| DEC-UM-011 | `um-ct-03` vs `um-rel-04`/`05` |
