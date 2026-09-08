# S4.2a-OP-04 · The grown operator set gives root no data reach it did not already have

> **New Stage-1 scenario, PLAT-E4-S4.2a (2026-09-06).** The negative control for
> [`S4.2a-OP-03`](./s42a-op-03-root-operator-capability-after-production-bootstrap.md).
> Growing the canonical `hr-admin` set from three keys to six adds **feature**
> reach only; it must not be able to move a single section decision. The one
> deliberate exception is `profile:timeline:write`, recorded in
> [`S4.2a-OP-06`](./s42a-op-06-delegated-hr-admin-timeline-write-accepted-deviation.md);
> every other section stays exactly as closed as it was. The full amendment
> record is in
> [`ACM1-FB-01`](../../access-control-kernel/fr-bootstrap/acm1-fb-01-three-canonical-permissions-seeded.md).
>
> **This case must be green before *and* after the implementation stage.** A
> red here at Stage 2 would mean the baseline is already wrong; a red here at
> Stage 3 would mean the increment widened data access, and the change stops
> for a human.

**Trace:**

- [`access-control.md` line 19](../../../architecture/access-control.md) **NORMATIVE** — "A new functional role never widens data access (§2.3): FR grants features; what data those features can touch is bounded by the holder's computed access audiences." Mirrored in [`docs/project-requirements.md` §2](../../../project-requirements.md).
- [`s41c-sag-04`](./s41c-sag-04-functional-grant-never-widens-audience.md) — the same invariant asserted against an arbitrary FR grant. This file asserts it against the **seeded canonical** grant, which is the one that ships in every production deployment.
- Spec [`spec-4-2a-root-operator-permission-set.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2a-root-operator-permission-set.md) — Acceptance Criteria, "the same answer as before this change — this increment must not be able to move it"; Boundaries, "Root has no `canEdit` reach ... owner: Story 4.2 scope item 3".
- `access-control-facade.adapter.ts:63-81` `hasSectionAccess` (audience-first) and `:85-95` `canEditIdentityCard` — untouched by this increment; none of the six canonical keys reaches them.
- `section-access-matrix.ts` — contains no FR key at all, which is the structural form of "a functional role never widens data access".

## Scenario

**Given** the same production-only provisioning as
[`S4.2a-OP-03`](./s42a-op-03-root-operator-capability-after-production-bootstrap.md) —
`db:deploy` → `db:seed` → `db:bootstrap:access-control`, with
`db:dev:grant-root` **not** run — so root holds the canonical six-key
`hr-admin` role and nothing else. Root has imported a population, and there is
an active employee **T** to whom root has **no** `direct` and no
`people_partner` edge in either direction.

**When** root attempts to edit T's identity card, and separately reads T's
profile.

**Then** `PATCH /users/<T>` returns `403` and T's row is unchanged, and
`GET /users/<T>` returns `200` with `canEdit: false`. **This is the same answer
as before the increment.** Root's edit reach comes from tree position — a
resolved `reporting` or `pp` audience — and no tree exists: `prisma/seed.ts`
writes no `Relationship` row anywhere, and this increment writes none either.

The mechanism is worth stating because a reader who sees "root now holds six
permissions" may expect otherwise. `PATCH /users/:id` is gated by
`@RequireSectionAccess('profile:identity', 'write')`, whose audience half
resolves **first** and returns `false` before any `isAllowed` call is reached.
A functional grant can only ever subtract from that decision. So it does not
matter how many feature keys the canonical role carries — `org:relationships:write`
and `employee:departure:record` are not section keys, they appear in no matrix
row, and `hasSectionAccess` never consults them.

**A green here is not "root is fully operational."** Nobody should read a green
ACM-1 suite that way. Root can operate the org-structure and departure routes
after this increment and still cannot open an unrelated card. Closing that half
is Story 4.2 scope item 3 (seat root in the `reports-to` tree), and until it
lands `scripts/dev-grant-root.ts` remains the accepted production stopgap for
`canEdit` — untouched, unguarded and executable, by the 2026-09-04 decision.

**Preconditions:** steps 1–6 of
[`S4.2a-OP-03`](./s42a-op-03-root-operator-capability-after-production-bootstrap.md),
unchanged, plus:

- T is one of the employees root's own `POST /users/import` created; its uuid
  is threaded from the persisted row.
- The suite asserts there is **no** `Relationship` row between root and T in
  either direction before the requests — the absence is part of the fixture,
  not an assumption.
- The suite asserts `SELECT count(*) FROM "UserPolicies"` is `1` (root's), so
  no second attachment can be supplying the answer.

## Test

- **Test 1 — root cannot edit an unrelated identity card**
  - **inputURL:** `PATCH /users/<T-uuid>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<root-uuid>>" },
      "body": { "city": "Berlin" }
    }
    ```
  - **expectedResult:** `403`. T's persisted row is unchanged — asserted
    against the database, not inferred from the status. Green before and after
    the implementation stage.
- **Test 2 — root's `canEdit` hint agrees with the gate**
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<root-uuid>>`
  - **expectedResult:** `200`; `{ data, canEdit }` with `canEdit: false` and
    `data.city` unchanged. The hint and the gate are the same call, so they
    cannot disagree.
- **Test 3 — the added feature keys are absent from every section decision**
  - **stateChange:** none. This test reads the shipped constants rather than a
    route, because the claim is structural: neither `org:relationships:write`
    nor `employee:departure:record` appears in `SECTION_ACCESS_MATRIX` or in
    `DEFAULT_PERMISSIONS`, and `hasSectionAccess` consults neither.
  - **expectedResult:** zero matches for either key in
    `src/access-control/domain/constants/`. A match means a feature key has
    entered the section-access path and the `access-control.md` line-19
    invariant is no longer structurally guaranteed.
