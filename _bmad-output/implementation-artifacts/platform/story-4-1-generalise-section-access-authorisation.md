---
status: backlog
title: 'Generalise section-access authorisation + human section keys'
type: 'tech'
created: '2026-09-03'
updated: '2026-09-04'
story_id: 'PLAT-E4-S4.1'
sprint_key: '4-1-generalise-section-access-authorisation'
epic: 'Platform Epic 4 — Access Control Authorization Consolidation'
raised_by: 'dn-um-implementation code review (2026-09-03) + Winston architecture session (2026-09-03/04), Dmytro Novyk'
owners: ['access-control', 'user-management']
decision_record: '_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md'
blocked_on:
  - 'Architect solution-design pass: the `@RequireSectionAccess` decorator/guard shape + the section→endpoint map'
supersedes_note: >
  Platform epics.md line 32 ("No Epic 4") scoped the 2026-09-02 ratification CE
  pass only. This epic is new scope from a 2026-09-03 code review.
---

# PLAT-E4-S4.1 — Generalise section-access authorisation + human section keys

## Problem

`services/backend/src/user-management/infrastructure/access-control-facade.adapter.ts`
hand-writes one authorisation predicate per section/feature (`canEditS1`, the
`READ_USER_FEATURE` / `EDIT_USER_FEATURE` routing-key branches in
`isAllowedForTarget`). Almost every target-scoped route is really the same
question — *"may this viewer read / write this section of this target?"* —
which `AccessControlFacade.canAccessSection` already answers. As sections land
(`profile:timeline`, `profile:mentorship`, …) this pattern multiplies and each
copy is a place the rule can drift.

The 2026-09-03 code review made the drift concrete: a `user-management:edit`
**OR** override was added to `canEditS1` (so `scripts/dev-grant-root.ts` could
give root `canEdit` everywhere), which violates the NORMATIVE invariant that a
functional role never widens data access. Separately, `canAccessSection` still
takes the legacy `'S1'` / `'S10'` / `'S11'` strings.

## Decisions carried from SCP 2026-09-04 (§2 D1–D4)

- **D1** — identity-card edit is a **dual gate**: `isAllowed(viewer,
  'profile:identity:write')` **AND** `canAccessSection(viewer,
  'profile:identity', target) === 'write'`. Supersedes Variant A (2026-09-02).
- **D2** — the feature half of every per-person section-write is a **code
  constant** `DEFAULT_PERMISSIONS`, held implicitly by every active employee.
  `isAllowed` = `key ∈ DEFAULT_PERMISSIONS` (active user) **∪** explicit FR
  grant chain. No `employee` policy row, no attachment, no seed/bootstrap
  change. Baseline changes by deploy; narrowing = remove from the baseline +
  grant explicitly to a tighter role. No per-individual carve-out (engine is
  allow-only).
- **D3** — one `@RequireSectionAccess('<key>', 'read' | 'write')` gate replaces
  the per-section predicates.
- **D4** — human section keys everywhere; `S<n>` is a matrix-row citation only.

## User story

As **a consuming context and a reviewer of authorisation code**,
I want **one section-parameterised gate driven by `canAccessSection`, with
human-named section keys and the feature half satisfied by a single recorded
code baseline**,
So that **route authorisation is declared once per endpoint, cannot drift
between sections, reads the same as the §3.2 matrix it enforces, and never lets
a functional permission widen a resolved audience**.

## Scope

**In:**

1. **`DEFAULT_PERMISSIONS` + evaluator union (AC-owned).** A code constant
   listing the per-person section-write keys every active employee holds. The
   `isAllowed` evaluator returns `true` when the key is in it (active user) or
   in the explicit grant chain. FR-tier only, in-memory set check, no
   relationship read, no hot-path scan. `docs/architecture/access-control.md`
   gains the decision entry (SCP §4.3). No seed / bootstrap / migration change —
   the ACM-1 invariant suite is untouched.
2. **Section-key rename (AC-owned).** `canAccessSection` and every caller,
   scenario doc, and test move to `profile:identity` / `profile:leave` /
   `profile:projects` (and the roadmapped `profile:timeline` etc. adopt the
   convention from day one). Own AD-1 increment.
3. **The generalised gate (UM-owned).** `@RequireSectionAccess('<key>',
   'read' | 'write')` decorator + guard in `application/guards/`, plus the
   section→endpoint map. Replaces `canEditS1`, the `EDIT_USER_FEATURE` /
   `READ_USER_FEATURE` routing-key branches. Calls the existing
   `ACCESS_CONTROL_PORT` seam — no new cross-context coupling.
4. **Migration + cleanup (UM-owned).** `AccessControlFacadeAdapter` onto the
   gate; the ad-hoc predicates deleted. (The `canEditS1` OR-override itself is
   deleted by Story 4.2, which owns the `dev-grant-root` side.)

**Out:**

- The Profile Projection field/record narrowing (FR-17) — still its own
  deferred story; this gate only decides `none` / `read` / `write`.
- Global-feature default holders (`directory:*`, `admin:*`, role management) —
  their §2.3 default-grant confirmation is a separate process follow-up; `D2`
  covers the per-person section-write keys only.
- The seeded-root model, the override deletion, the resolver walk change — all
  Story 4.2.

## Acceptance criteria

- `isAllowed(activeUser, 'profile:identity:write')` is `true` with no
  `UserPolicies` row; `isAllowed(deactivatedUser, …)` is `false`; an explicit FR
  grant still resolves. No `employee` `Policies` row exists.
- No `S<n>` string is passed as a section identifier anywhere in
  `services/backend/src` or `test/` (grep-clean); `canAccessSection` accepts the
  human keys and returns `none` for anything else.
- `PATCH /users/:id` and the `GET /users/:id` `canEdit` hint are gated by
  `@RequireSectionAccess('profile:identity', 'write')` — no S1-specific method.
  A viewer who holds the baseline but only `colleague`/`self` audience → `403` /
  `canEdit:false`; reporting-line manager or assigned PP → `200` / `canEdit:true`.
- `canEditS1` and the `EDIT_USER_FEATURE` / `READ_USER_FEATURE` branches in
  `isAllowedForTarget` are gone.
- Every existing `access-control-adoption` and `profile` e2e stays green or is
  updated in the same change with a recorded reason.
- The Access Control deferred-work "Generalise section-access authorisation" and
  the `profile:timeline` rename follow-up are closed by this story.

## Story split (fill during the architect pass)

Expected: (4.1a) `DEFAULT_PERMISSIONS` + evaluator union + `access-control.md`
entry; (4.1b) section-key rename increment; (4.1c) `@RequireSectionAccess` gate
+ adapter migration; (4.1d) cleanup + test regeneration. Each its own AD-1
dispatch, no dispatch spanning stages.

## References

- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md` (decision record)
- `_bmad-output/implementation-artifacts/access-control/deferred-work.md` — source entry
- `_bmad-output/implementation-artifacts/access-control/user-management-edit-permission-options.md` (Option 2, now realised as a code constant)
- `_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md` (section-key naming rule)
- `services/backend/test/user-management/access-control-adoption/write-adoption.e2e-spec.ts` (interim OR-override, deleted by 4.2)
- Platform epics.md Story 3.6 (ACM-5 — the `canAccessSection` this generalises)
