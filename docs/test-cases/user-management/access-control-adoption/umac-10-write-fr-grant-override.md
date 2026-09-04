# UMAC-10 · S1 edit — a live `user-management:edit` FR grant is an OR-override on the section gate

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (write) · access-control.md ACM-5 (`canAccessSection(v,'S1',t)` → `write` for reporting/pp, `read` for self/colleague, `none` for an empty set) · PRD FR-9 refinement · [`umac-07`](./umac-07-write-dual-gate.md) (Variant A, product decision 2026-09-02) · `access-control-facade.adapter.ts` `canEditS1` · access-control deferred-work ("Generalise section-access authorisation") · `scripts/dev-grant-root.ts`

> **Stage ordering.** `umac-07` (Variant A) withdrew the functional-permission
> half of the S1 gate and said "a narrower FR grant on this section can be
> introduced later". It **was** introduced — `canEditS1` carries it today, and
> the Stage-2 suite asserts it — but no Stage-1 scenario was authored at the
> time. This file is that reconciliation, written on 2026-09-04 from the
> shipped behaviour. Approving it ratifies what already runs.

## Scenario-stage decisions (for the human gate)

- **This does not reopen Variant A.** `umac-07` remains the gate for the
  *audience* half: reporting/pp write, self/colleague do not. This file adds the
  one **OR** clause that sits beside it — a live `user-management:edit` grant.
- **The override widens the audience, never the section.** The grant lets a
  holder edit a target whose S1 already resolves to `read` **or** `write`. It
  can never open a target whose S1 is `'none'` (deactivated or unknown). That
  ceiling is the whole reason this is safe to ship ahead of the generalised
  per-section predicate rewrite.
- **Why it exists.** `scripts/dev-grant-root.ts` relies on it to give a local
  root `canEdit` on every card. Without the clause a freshly bootstrapped
  environment has nobody who can edit anything.
- **Self is reachable through the grant.** Under `umac-07` alone, self is
  `read` on S1 and cannot edit. A grant holder editing their own card is
  therefore a distinct case, not a duplicate of `umac-09` (photo, Self-only).
- **Interim.** Marked for replacement by the generalised section-access
  authorisation in access-control deferred-work; until then the clause is
  `canEditS1`-local and applies to S1 only.

## Scenario

**Given** an active editor E holding a live `user-management:edit` functional
role grant, and an active employee T over whom E resolves only `colleague`
(S1 → `read`).

**When** E submits `PATCH /users/<T>` with an S1 scalar change.

**Then** `200` — the grant overrides the `read` audience — the change persists,
and a follow-up read returns `canEdit: true`. The same holds when E is the
target. It does **not** hold when T is deactivated: S1 is `'none'` there, and
`'none'` is closed to everyone, grant or not.

## Test

- **Test 1 — grant holder, no reporting/PP edge, active target**
  - **inputURL:** `PATCH /api/v1/users/<targetId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<editorId>>" }, "body": { "city": "Berlin" } }`
  - **expectedResult:** `200`; body matches `{ city: 'Berlin' }`; a follow-up
    `GET /api/v1/users/<targetId>` as the editor returns
    `{ data: { city: 'Berlin' }, canEdit: true }`
- **Test 2 — grant holder edits their OWN card (self, no edge)**
  - **inputURL:** `PATCH /api/v1/users/<editorId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<editorId>>" }, "body": { "city": "Gdansk" } }`
  - **expectedResult:** `200`; follow-up `GET` returns
    `{ data: { city: 'Gdansk' }, canEdit: true }`
- **Test 3 — the override never widens past section access (deactivated target)**
  - **inputURL:** `PATCH /api/v1/users/<inactiveTargetId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<editorId>>" }, "body": { "city": "Berlin" } }`
  - **expectedResult:** `403`; the target row is **unchanged** (`city` still
    `Krakow`) — the denial is not merely a status code

**Preconditions:** [fixture](../README.md#canonical-personas). The port is bound
to the real `AccessControlFacade`-backed adapter; the grant is issued through a
real FR-policy chain, never a role-name check (DEC-UM-002).
