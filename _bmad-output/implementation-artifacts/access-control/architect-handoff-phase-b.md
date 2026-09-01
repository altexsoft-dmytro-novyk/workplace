---
title: 'Architect handoff — Phase B (Access Control adoption → PM)'
type: 'handoff'
created: '2026-08-31'
from: 'Winston (System Architect)'
to: 'Product Manager (next phase)'
companions:
  - ../../specs/spec-user-management-access-control-adoption/SPEC.md
  - ../../specs/spec-user-management-access-control-adoption/stories.yaml
  - ./um-integration-contract-response.md
---

# Architect handoff — Phase B

The Access Control Kernel MVP is built and headless. I have written the
planning package that adopts it into User Management:
`_bmad-output/specs/spec-user-management-access-control-adoption/`
(SPEC + stories.yaml + .memlog.md), plus a point-by-point answer to the open
integration-contract request: `um-integration-contract-response.md`. Nothing
is approved — every stage still runs the AD-1 gate.

This note tells you what to fold into the PRD and `epics.md`, the one decision
that needs Product input, and the files I touched so we do not collide.

> **Superseded 2026-09-01 (human product decision).** This handoff's
> "two-state colleague rule" (deny the colleague whole-profile read now, allow
> narrowed once Profile Projection lands) is **withdrawn**. A colleague
> `GET /users/:id` returns the **S1 identity card** (`200`) from adoption
> Story 0.1 — §3.2's S1 row is `R` for the Colleague column and every active
> authenticated viewer is at least a Colleague. Adoption story `UMAC-3` is
> removed; the only `GET /users/:id` denial is an empty audience → leak-free
> `404`. The binding contract is
> `../../specs/spec-user-management-access-control-adoption/SPEC.md`; where the
> prose below still says "colleague denied" / "`403`" / "`UMAC-3` is the
> trigger", read the SPEC instead.

## 1. What goes into the UM PRD and `epics.md`

### A new adoption epic (or a story under Epic 1)

**Recommendation:** a small dedicated epic — *"Access Control Adoption"* —
rather than a story buried in Epic 1, because it is a cross-cutting cutover
(port rebind + interim-adapter deletion) that touches the same controller as
Epic 1 Story 1.2 and needs its own real-consumer HTTP E2E.

Scope, from the adoption SPEC:

- **CAP-1** — rebind `ACCESS_CONTROL_PORT` in `user-management.module.ts` to a
  real facade-backed adapter in `src/user-management/infrastructure/`; delete
  `interim-access-control.adapter.ts` in the same change (AD-21, no
  dual-running). `isAllowed(userId, feature)` delegates straight to
  `AccessControlFacade.isAllowed` — the three no-target features in use
  (`user-management:create`, `:deactivate`, `:list`) are exactly the ACM-1
  seeded keys, so `POST /users`, `DELETE /users/:id`, `GET /users` keep
  working for the seeded HR-Admin session and fail closed otherwise.
- **CAP-2 (read)** — `GET /users/:id` returns `200` with the **S1 identity
  card** for any non-empty audience (Self / reporting-line / assigned PP /
  **colleague**); the only denial is an empty audience set → leak-free `404`.
  Story 0.1 ships the S1-card DTO on that handler. *(Revised 2026-09-01 — the
  earlier "two-state colleague rule" / `403` is withdrawn; see the banner
  above.)*
- **CAP-2 (write)** — `PATCH /users/:id` and `PUT /users/:id/photo` behind the
  §2.2 dual gate. **Blocked on a missing permission — see section 2.**
- **CAP-4** — real-consumer HTTP → router → session → AccessControl →
  PostgreSQL E2E, no provider overrides (AD-3 consumer rule).

### Sequencing

- The adoption epic **can start now** for the read path (CAP-1 + CAP-2 read).
  ACM-8 already made `AccessControlFacade` DI-resolvable from `AppModule`, so
  CAP-1 is a UM-module-only change.
- It shares `PATCH /users/:id` with **Epic 1 Story 1.2**. Decide whether
  Story 1.2's authorization acceptance criteria are satisfied by the adoption
  epic (recommended — Story 1.2 then asserts data correctness, adoption
  asserts who is entitled) or duplicated. `profile.e2e-spec.ts`'s current
  `Bearer <token:Bob>` literal placeholders break under the real facade
  (`'Bob'` resolves to a non-existent user → empty audience → leak-free `404`
  on the read, `403` on a write); the adoption Stage-2 must seed real users
  with real `Relationship` rows.
- The write path (CAP-2 write) sequences **after** the permission decision in
  section 2.

### FR additions the PRD needs

The UM PRD's numbered FRs do not currently name the adoption. Add:

- **FR-Nx (adoption):** *"`user-management` controllers authorize
  target-scoped `/users/:id` access through the real `AccessControlFacade`
  via the `ACCESS_CONTROL_PORT` binding; the interim adapter is removed. A
  `GET /users/:id` returns the S1 identity card for any non-empty audience
  (Self, reporting line, assigned People Partner, or colleague); only an empty
  audience denies (leak-free `404`)."* This makes NFR-4 (`epics.md` line 55 —
  "every user-management controller must call through [the facade]") concrete
  and testable rather than aspirational.
- **FR-9 refinement:** FR-9 already says *"Self can directly write only the
  photo. Manager, People Partner, and department are not writable through
  S1."* Add that `PATCH`/`PUT photo` require **both** the functional
  permission **and** `write` S1 section access (§2.2 dual gate), and that
  photo is Self-only unless Product widens it (Open decision 3 below).
- **Profile Projection** is already split out in `deferred-work.md`; the PRD
  should carry it as its own FR (this became **FR-17**). It owns only the
  *further* colleague narrowing — S10 dates-only (`GET /users/:id/leaves`),
  S11 name-only, S16 per-field visibility — on their own surfaces, plus S7/S8
  flags and S1 derived-field immutability. It is **not** coupled to
  `GET /users/:id` and there is no `UMAC-3` flip (removed 2026-09-01).

## 2. The one decision that needs Product input — missing edit permission

The seeded FR catalog is exactly `user-management:create`,
`user-management:deactivate`, `user-management:list` (ACM-1,
`access-control.md`). **There is no `user-management:edit` and no photo
permission.** The controller constants `EDIT_USER_FEATURE` and
`UPLOAD_PHOTO_FEATURE` point at keys that do not exist. Today `PATCH` / `PUT
photo` "work" only because the interim adapter ignores the feature and returns
`Boolean(userId)`. Under the real facade, `isAllowed(viewer,
'user-management:edit')` is `false` for everyone — the dual gate cannot pass.

| Option | What it means | Cost |
| --- | --- | --- |
| **(a) — recommended** | Access Control adds `user-management:edit` (± a photo key) to the bootstrap catalog + grant, via a **new three-stage AD-1 sequence in the kernel package**. Adoption then consumes it. | One extra kernel AD-1 sequence + one seed/migration touch before the adoption write path can go green. Correct on first adoption; one cutover; AD-21 satisfied in one pass. |
| **(b)** | Adopt `READ` now; keep `EDIT` / `UPLOAD_PHOTO` on a narrow interim rule in the real adapter with a `// INTERIM` comment and an explicit expiry trigger. | Second cutover later; AD-21's "no interim logic" only partly satisfied. Closes the read leak immediately. |

Related sub-questions for Product (adoption SPEC "Open decisions"):

- Is photo a distinct permission or covered by `user-management:edit`?
  (Recommendation: not separate — photo is Self-only by FR-9.)
- May a reporting-line manager or PP replace a report's photo, or is it
  strictly Self-only? (Recommendation: Self-only, per FR-9.)
- Confirm the FR-17 Profile Projection story keeps only the colleague S10
  dates-only view (`GET /users/:id/leaves`), the S11 name-only view, and S16
  per-field visibility — each on its own surface, decoupled from
  `GET /users/:id` (which returns the full S1 card from Story 0.1).

## 3. CC-07 journal-schema dependency — blocks Epic 4 PP stage-2

Per AD-19's **Journal gate**
(`architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md:186`):
*"CC-07 still owns the immutable relationship/access-journal schema, snapshot
payload, reader authorization, and transaction-enrolment contract. PP stage
2/production work is blocked until CC-07 is approved; `UserEvents` is not a
substitute."*

This does **not** block the adoption epic — the facade *reads*
`Relationship type='people_partner'` to resolve the PP audience, and reading
is fine. It **does** block **Epic 4 Story 4.2** (change an employee's People
Partner) and, by the same gate, the write/atomic-journal half of Story 4.1
(manager change) and Story 4.3 (department / department-manager). Epic 4
scenario prose can proceed; Epic 4 stage-2/production cannot until CC-07 is an
approved architecture decision. Also note **AD-19's Department-boundary gate**:
PP HR-line transitive propagation stays fail-closed to the directly assigned
PP until the Department contract lands — the adoption slice only consumes the
direct PP audience, which is safe.

CC-07 is the architect's to resolve; flagging it here so Epic 4 is not
sequenced as if it were ready.

## 4. Files I changed (so the PM/BA/TEA phases do not collide)

**New:**

- `_bmad-output/implementation-artifacts/access-control/um-integration-contract-response.md`
- `_bmad-output/implementation-artifacts/access-control/architect-handoff-phase-b.md` (this file)
- `_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md`
- `_bmad-output/specs/spec-user-management-access-control-adoption/stories.yaml`
- `_bmad-output/specs/spec-user-management-access-control-adoption/.memlog.md`

**Edited (planning/docs only — no code, no `services/backend/`):**

- `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` — AD-21 amendment note (interim-adapter retirement owned by the adoption slice; session resolver is Epic 2; write path blocked on missing permission). Plus one `.memlog.md` line.
- `_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md` — one added Decision Register row pointing the "User Management consumer contract and HTTP mapping" item at the response doc and the adoption spec. Plus one `.memlog.md` line. **Nothing else in that spine touched.**
- `_bmad-output/specs/spec-access-control-facade-audience-resolution/SPEC.md` — one resolved-pointer constraint bullet.
- `_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md` — Open Questions resolved-pointer.
- `docs/architecture/access-control.md` — new "User Management adoption seam" subsection after "Denial conventions".
- `docs/architecture/api-conventions.md` — one surgical edit to shape 1 making "no `POST /users` create" explicit.

**Not touched:** `approvals.yaml` (no approval recorded — correct, nothing is
approved), any file under `services/backend/`, the kernel SPEC, the kernel
`stories.yaml`, `database-schema.md`, `testing-strategy.md`.

## 5. What still keeps the product gate open after adoption

Even with the adoption epic merged: field-level Profile Projection,
list/filter/export/search projection, Project line, Department, PP HR-line,
shared links, full-profile overlay (and its unresolved §3.2 column mapping),
and AD-20 due/departure evaluation all remain deferred and fail-closed. The
adoption epic closes the "every session reads every full profile" leak and
puts `/users/:id` behind the real facade — it is a necessary step toward the
gate, not the gate itself.
