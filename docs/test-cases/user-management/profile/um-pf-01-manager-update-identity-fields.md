# UM-PF-01 · Manager-line edit to identity fields persists

**Trace:** requirements §3.2 S1 (Reporting line: RW) · PRD Data Model — User entity · epics.md Story 1.2 (data-correctness ACs)

> **Scope (v1.5).** *Who* is entitled to `PATCH` / `GET /users/:id` — Self /
> reporting / PP allowed, colleague denied, the §2.2 dual gate — is **Epic 0's**
> (`access-control-adoption/umac-07`), asserted against the real facade. This
> file asserts **data correctness** given an already-entitled actor: the write
> persists and reflects on a follow-up read. Do not duplicate entitlement
> scenarios here; do not harden the interim-permissive `isAllowedForTarget` as
> intended behaviour.
>
> **Persona-id note.** Alice/Bob are **seeded** employees (Story 1.1) — there is
> no `POST /users`. Stage 2 resolves `<aliceId>` from the seeded fixture id
> table (as `docs/test-cases/access-control/` does via
> `access-control-fixture-ids.ts`), never a hardcoded literal. Whether the
> `Bearer <token:Bob>` header becomes a real seeded UUID with a real `direct`
> `Relationship` row (so the post-Epic-0 dual gate passes) or this suite's scope
> note is tightened is a call for Epic 0 Story 0.1's scenario stage — flagged,
> not silently rewritten here.

## Scenario

**Given** Bob, Alice's direct Unit Manager (Reporting-line access to Alice), acting as an already-entitled actor.

**When** Bob updates Alice's `position` and `city`.

**Then** the change is persisted and a subsequent read reflects the new values.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded with `position: "Engineer"`, `city: "Warsaw"`.

## Test

- **Test 1 — the write**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" }, "body": { "position": "Senior Engineer", "city": "Krakow" } }`
  - **expectedResult:** `200`; body reflects `position: "Senior Engineer"`, `city: "Krakow"`.
- **Test 2 — observing the change**
  - **inputURL:** `GET /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; `position: "Senior Engineer"`, `city: "Krakow"`.
