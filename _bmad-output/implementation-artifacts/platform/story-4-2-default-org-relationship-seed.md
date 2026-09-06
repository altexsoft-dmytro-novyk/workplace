---
status: backlog
title: 'Default org-relationship seed + retire the identity-card FR override'
type: 'tech'
created: '2026-09-04'
story_id: 'PLAT-E4-S4.2'
sprint_key: '4-2-default-org-relationship-seed'
epic: 'Platform Epic 4 — Access Control Authorization Consolidation'
raised_by: 'dn-um-implementation code review + Winston/Dmytro design discussion, 2026-09-03/04'
owners: ['access-control', 'user-management']
decision_record: '_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md'
depends_on:
  - 'PLAT-E4-S4.1 — `DEFAULT_PERMISSIONS` includes `profile:identity:write`, so root (an active employee) has the feature half; land alongside. 4.2 is not hard-blocked.'
blocked_on: []
blocked_on_resolved:
  - '2026-09-05 — was: "Architect solution-design for the upward-walk resolver change (AC-owned resolveAudiences change, its own AD-1)". Cleared by `_bmad-output/implementation-artifacts/access-control/solution-design-upward-walk-resolver.md` (2026-09-05), whose verdict is NO CODE CHANGE REQUIRED: the upward walk shipped 2026-08-30 in `services/backend` commit `f36d1b2` and is an ancestor of `services/backend` HEAD `e0b1a53`. This clears the blocker on scope item 4 ONLY — items 1, 2, 3 and 5 are untouched by that finding and remain unbuilt, so the story stays `backlog`.'
---

# PLAT-E4-S4.2 — Default org-relationship seed + retire the identity-card FR override

## Recorded decision (Winston + Dmytro, 2026-09-03/04)

**The ACM-0 seeded root identity is the organisation's boss.** By seed, on that
one singleton identity, it holds all three, from three separate mechanisms:

| Capability | Mechanism |
| --- | --- |
| Assign functional roles, manage custom-field definitions, list/create/deactivate, every other admin feature | the `hr-admin` **functional role** (ACM-1 bootstrap) |
| **Write** access to every profile section that the reporting-line audience can write | **top of the `reports-to` relationship tree** → `reporting` audience over everyone, transitively (§2.1, §3.1) |
| Clean **read** of every section, including the ones the reporting line cannot | first holder of the **§2.4 full-profile-access** grant (read-only overlay, PM/AD-28) |

**A delegated HR Admin** — anyone the root later assigns `hr-admin` to — holds
the **complete functional-role feature set** ("all toggles on") and may delegate
the role further, **but gets zero data access from it**. They read or write a
person's profile only where they are that person's reporting-line manager or
assigned People Partner, or hold a separate §2.4 grant. This is the
`access-control.md:19` / `project-requirements.md:100` NORMATIVE invariant —
*"a functional role never widens data access"* — stated for this role.

**Corollary — the `canEditS1` OR-override is wrong and gets deleted.** The
2026-09-03 code review added `isAllowed('user-management:edit') OR
canAccessSection(...) === 'write'` to the identity-card gate so
`scripts/dev-grant-root.ts` could give a local root `canEdit` everywhere. An
`isAllowed` that **widens** the audience is exactly the invariant violation
above. Root's edit power comes from the seeded tree position, not an adapter
special case.

**Note added 2026-09-06 — the deletion has happened; only the reasoning is
still live here.** `canEditS1` and its OR clause were deleted by Story 4.1d (PO
ruling AF-2, 2026-09-06) and the pinning test retired by Story 4.1c (PO,
2026-09-05). The corollary above stands as the rationale of record; the *action*
it named has moved to a verification — see re-scoped scope item 1. Root's edit
power still has to be *provisioned*, which is what scope items 2, 3 and 5 do,
and none of them is built.

## User story

As **the person running a fresh deployment (and as a developer on a seeded dev
DB)**,
I want **the seed to place the root identity at the top of a real reporting tree
and hold the §2.4 grant**,
So that **root can administer and edit the organisation through the ordinary
audience-resolution path, with no functional-role override anywhere in the
authorisation code**.

## Scope

**In:**

1. ~~**Delete the override.** Remove the `user-management:edit` OR-branch from
   `AccessControlFacadeAdapter.canEditS1`
   (`services/backend/src/user-management/infrastructure/access-control-facade.adapter.ts`)
   and the interim pinning test
   (`write-adoption.e2e-spec.ts` "S1 edit · `user-management:edit` FR grant is
   an OR-override" — see also the P2 active-target guard added in the same
   review; that guard is subsumed once the override is gone).~~

   **RE-SCOPED 2026-09-06 — both deletions were performed by other stories.
   This item is now a VERIFICATION, not a change.** Nothing in scope item 1 is
   left for 4.2 to delete; what remains is to assert that the removal actually
   happened and did not come back. **What this item now asserts:** the
   identity-card edit decision in `services/backend/src/` contains no
   functional-role OR-branch, and the symbols that carried one no longer exist.

   *Who deleted what, and on whose authority:*

   - **The pinning test** — the `umac-10` describe block in
     `test/user-management/access-control-adoption/write-adoption.e2e-spec.ts`
     — was retired by **PLAT-E4-S4.1c**, on the Product Owner decision of
     **2026-09-05 (Dmytro Novyk, "Reading 1")** recorded in
     `_bmad-output/implementation-artifacts/platform/spec-4-1c-require-section-access-gate.md`
     § "Resolved decision — `umac-10` disposition". Once 4.1c moved
     `PATCH /users/:id` and the `canEdit` hint onto
     `@RequireSectionAccess('profile:identity', 'write')`, the override was off
     every live path and two of the block's three assertions necessarily
     inverted. Its one surviving assertion (a `'none'` target stays closed to a
     grant holder) was carried over verbatim as `s41c-sag-04` Test 5 in
     `test/user-management/access-control-adoption/s41c-section-access-gate.e2e-spec.ts:421`;
     the scenario doc `umac-10-write-fr-grant-override.md` is kept and marked
     superseded, not deleted.
   - **The `user-management:edit` OR-branch** was deleted together with
     `canEditS1` itself — the whole method — by **PLAT-E4-S4.1d**, on the
     Product Owner ruling **AF-2 of 2026-09-06 (Dmytro Novyk)** recorded in the
     resolved Ask First table of
     `_bmad-output/implementation-artifacts/platform/spec-4-1d-gate-cleanup.md`:
     *"Delete `canEditS1` whole, OR clause included … Story 4.2 closes its scope
     item 1 by verification, not deletion."* The same ruling directed that
     4.2's file be re-scoped in a separate pass — this is that pass.

   *The gate as it now stands.* The identity-card decision is the audience-first
   dual gate `AccessControlFacadeAdapter.hasSectionAccess`
   (`access-control-facade.adapter.ts:63-81`), reached for the `canEdit` hint
   through `canEditIdentityCard` (`:85-95`). `isAllowed` is consulted only
   *after* `canAccessSection` has already allowed, and only for a `'write'`
   requirement, with the key `'<section>:write'` — so the functional half can
   only ever subtract. That is the `access-control.md:19` NORMATIVE invariant
   holding structurally rather than by a hand-written special case.

   *Concrete verification — grep over `services/backend/src/`, expected zero.*
   Run with `git grep` or `grep -arn`, never plain `grep -r`: 4.1d's Verification
   section records that a NUL-carrying file in this tree is skipped as binary by
   plain `grep -r`, which is how two live hits escaped an earlier oracle.

   | Symbol | Expected in `src/` | Measured 2026-09-06 at `services/backend` HEAD `ef03c88` |
   | --- | --- | --- |
   | `canEditS1` | 0 executable | **0 executable** (1 comment hit: `infrastructure/__tests__/access-control-facade.adapter.spec.ts:95`, a dated citation of the defect the 2026-09-03 review found — sanctioned by 4.1d's AC) |
   | `S1_SECTION` | 0 | **0** |
   | `isAllowedForTarget` | 0 | **0** |
   | `EDIT_USER_FEATURE` | 0 | **0** |
   | `user-management:edit` | 0 executable | **0 executable** (4 hits, all prose or a test title asserting the key is *not* consulted) |

   *The P2 active-target guard.* It no longer exists as a distinct guard, and
   there is nothing here for 4.2 to remove. It was the
   `if (sectionAccess === 'none') return false;` clause inside `canEditS1` — the
   constraint that stopped the override widening past a `'none'` section result
   for a deactivated or unknown target (SCP 2026-09-04 §4.7). It went with
   `canEditS1` in 4.1d. The parenthetical's prediction — "subsumed once the
   override is gone" — held: `hasSectionAccess` denies whenever the resolved
   rank sits below the requirement, so `'none'` denies on its own; and a
   deactivated or unknown target cannot resolve above `'none'` in the first
   place, because `AudienceResolverService` validates identity before deriving
   any audience (CAP-1) through `PrismaIdentityAdapter.findActiveUserIds`, which
   filters on `isActive: true`. The behaviour is pinned by `s41c-sag-04` Test 5.

   **Scope items 2, 3 and 5 are untouched by this re-scoping and remain
   entirely unbuilt; this story is not finished.**
2. **Production root-operator bootstrap (AC-owned, ACM-1 amendment).** The
   canonical `hr-admin` FR grant in `scripts/bootstrap-access-control.ts` grows
   from the current three keys to the full **operator set** root needs to run a
   deployment: population import, org-relationship writes, departure recording
   (identity-card and other section writes come from `DEFAULT_PERMISSIONS`, so
   they need no explicit grant — only the tree-root audience from item 3). This
   is a deliberate AD-1 amendment to the ACM-1 canonical set and its
   `acm1r-fr-foundation.e2e-spec.ts` invariant assertions. The exact key list is
   fixed during Stage-1 (candidate: `directory:import`, `directory:list`,
   `directory:deactivate` per the FR-matrix rename, plus `org:relationships:write`,
   `employee:departure:record`; roles-admin keys wait for that API). **Outcome:**
   a clean `db:seed && db:bootstrap:access-control` on a fresh production DB
   leaves root fully operational with **no dev script**.
3. **§2.4 first holder + tree-root edge at bootstrap.** `bootstrap-access-control.ts`
   also seats root at the top of the `reports-to` tree (or the equivalent
   department-tree root once that resolver branch exists) and records it as the
   §2.4 full-profile-access first holder — the data facts behind D5, provisioned
   at deploy time. (The §2.4 overlay *lifecycle* — grant/revoke journaling,
   last-holder protection, column mapping — stays the access-control
   deferred-work "Full-profile access overlay" item; this story fixes only who
   the seeded holder is and wires it.)
4. ~~**Resolver: walk upward from targets.** `resolveAudiences` currently expands
   every descendant of the viewer, then filters to the requested targets — so a
   viewer near the tree root walks the whole org to open one profile. This seed
   puts root permanently at the root, making that the standing worst case.
   Switch the reporting-chain resolution to walk **upward from each target**,
   bounded by chain depth. (Tracked as a deferred AC finding — this story makes
   it load-bearing for §7's 500-record / 2-second budget and pulls it into
   scope. Its own AD-1 increment in the access-control package.)~~

   **CORRECTED 2026-09-05 — this is already built; there is no resolver change
   in this story.** The struck premise ("currently expands every descendant of
   the viewer") stopped being true on 2026-08-30, in `services/backend` commit
   `f36d1b2` ("feat(access-control): return all audiences per target; walk up
   from targets"), which is an ancestor of `services/backend` HEAD `e0b1a53`
   (verified with `git merge-base --is-ancestor f36d1b2 HEAD`). The shipped
   reporting CTE at
   `services/backend/src/access-control/infrastructure/prisma-relationship-graph.adapter.ts:88-120`
   seeds the recursion from the **requested targets** (`r."userId" IN (${ids})`,
   line 98) and ascends one `direct` edge per step
   (`JOIN "relationships" r ON r."userId" = c.node_id`, lines 105-107), in one
   query for all targets. The depth bound the item asks for is already delivered
   structurally, by the `relationships_one_direct_per_user` partial unique plus
   the `NOT c.repeated` halt. Full analysis and evidence:
   `_bmad-output/implementation-artifacts/access-control/solution-design-upward-walk-resolver.md`
   §§0-2 (verdict: **NO CODE CHANGE REQUIRED**).
   **Residual scope for this item is evidence and documentation only** — an
   ACM-9 `seeded-two-level` measurement for the shape item 5's seed introduces
   (design §7.3). **Items 1, 2, 3 and 5 are unaffected by this correction and
   remain unbuilt; this story is not finished.**
5. **Dev seed spine.** A dev-only script (`db:dev:seed-org`, superseding
   `dev-grant-root.ts`) seeds a `type='direct'` reporting spine over the *fake*
   seeded/imported population, rooted at the root user. Shape: **two-level** —
   one lead per department reports to root; every other active member of that
   department reports to their department lead. The population CSV carries no
   manager column, so the lead is synthesised (first active member of the
   department, or by a manager-ish `PositionName` where one exists). This one
   **is** dev-only (fake org data must not reach prod) — throws on
   `NODE_ENV=production`. The *root-operator* provisioning (items 2–3) is NOT
   dev-only; it is the production path.
   **Interim (decision, Dmytro 2026-09-04):** until this lands, the existing
   `scripts/dev-grant-root.ts` is an accepted **dev + production stopgap** — its
   `NODE_ENV=production` guard was reverted. Known debt: it grants a wider,
   pre-`directory:*` key bundle and will fail the ACM-1 drift-check e2e if run
   against that suite's DB.

**Out:**

- The **department-management** branch (`targetType:'department'` +
  `Department.parentId` walk) and the **project-line** branch — both remain
  their own pending AC increments. The seed spine is the pure `reports-to` chain
  only; the other two branches light up when those increments land.
- Root **write** access to `profile:personal-contacts` /
  `profile:emergency-contacts` / `profile:documents` — the reporting-line
  audience is read-only on those by deliberate privacy design (§3.2: read-write
  for Self and PP only). No routes exist for them today; revisit (accept the
  boundary, or seed root as PP-of-everyone) when they land.
- Whether `profile:identity` edit has an FR half at all — that is 4.1's
  composition decision. 4.2 removes the *override*; if 4.1 lands the universal
  baseline-role model, 4.1 adds the legitimate grant.

## Acceptance criteria

- ~~`canEditS1` no longer references `isAllowed` / `EDIT_USER_FEATURE`; grep of
  `access-control-facade.adapter.ts` shows no FR-permission branch in the
  identity-card decision. The OR-override pinning test is deleted.~~
  **CORRECTED 2026-09-06 — already satisfied at `services/backend` HEAD
  `ef03c88`, and satisfied trivially: `canEditS1` cannot reference `isAllowed`
  or `EDIT_USER_FEATURE` because the method itself no longer exists.** 4.1d
  deleted it whole under PO ruling AF-2 (2026-09-06); 4.1c retired the
  OR-override pinning test under the PO decision of 2026-09-05 — see re-scoped
  scope item 1. Restated as the standing regression guard this criterion now is:
  *`git grep` / `grep -arn` over `services/backend/src/` returns zero executable
  hits for `canEditS1`, `S1_SECTION`, `isAllowedForTarget`, `EDIT_USER_FEATURE`
  and `user-management:edit`, and the identity-card decision runs entirely
  through the audience-first `hasSectionAccess`
  (`access-control-facade.adapter.ts:63-81`), where the functional half is
  reached only after the audience half allows.* Measured PASS on 2026-09-06 (the
  one `canEditS1` hit is the dated comment at
  `infrastructure/__tests__/access-control-facade.adapter.spec.ts:95`, sanctioned
  by 4.1d's own AC). **This criterion is closed by verification and carries no
  work; it does not make the story complete — the criteria below it for scope
  items 2, 3 and 5 are all outstanding.**
- On a seeded dev DB: the root identity resolves `reporting` → `write` on
  `profile:identity` for every active user in the seeded population, and
  `GET /users/:id` returns `canEdit: true` for root on every card — with no
  adapter special case.
- A delegated HR Admin (holds `hr-admin` FR, no relationship to the target):
  `GET /users` / `POST /users` / role-assignment routes → allowed;
  `PATCH /users/:id` on an unrelated person → `403`;
  `GET /users/:id` → `canEdit: false`.
- ~~The audience resolver walks upward from targets: a viewer at the tree root
  opening one profile issues a query bounded by reporting-chain depth, not by
  org size — shown with the ACM-9 measurement pattern
  (`_bmad-output/test-artifacts/performance/`).~~
  **CORRECTED 2026-09-05 — the property already holds in HEAD**, so this is a
  property to lock, not a change to make (`f36d1b2`;
  `prisma-relationship-graph.adapter.ts:88-120`;
  `solution-design-upward-walk-resolver.md` §§0-2 and §7.1, which also records
  that the pinned ACM-9 PASS artifact was measured against a byte-identical
  adapter). Restated: *the existing upward walk is evidenced for the shape this
  story creates* — one ACM-9 run (`ACM9-MVP-v1`, `--role final`, 500 targets,
  5 warm-ups, 20 samples, warm p95 **and** worst ≤ 2000 ms) over a new
  `seeded-two-level` fixture, published append-only under
  `_bmad-output/test-artifacts/performance/` (design §7.3). **No speedup may be
  claimed for this story, because it changes no query.** Whether that run is its
  own increment or folds into 4.2b is not settled here — see "Open for
  decision" below.
- `db:dev:seed-org` throws under `NODE_ENV=production`, is absent from
  `prisma/seed.ts` and `scripts/bootstrap-access-control.ts`, and the
  `test/access-control/acm1r-fr-foundation.e2e-spec.ts` invariant suite stays
  green.
- Closes the access-control deferred-work "reporting walk descends from the
  viewer" finding; updates the "Full-profile access overlay" item's seeded-holder
  question. **(Note added 2026-09-05:** that deferred-work entry closes as
  *already resolved by `f36d1b2`*, not as work this story performs — see
  `_bmad-output/implementation-artifacts/access-control/deferred-work.md` and
  `solution-design-upward-walk-resolver.md` §0.**)**

## Sequencing (AD-1 — production authz, no dispatch spans a stage)

**RENUMBERED 2026-09-06 (John, PM, on the PO's "finish epic 4" instruction) to
match actual build order rather than the 2026-09-04 original assignment, which
had drifted from reality twice over (the upward-walk item turned out to be
already built, and the override item turned out to close by verification, not
by a dedicated increment). The letters below are now the single source of
truth; every prior letter-claim in this story or its specs is superseded by
this table. Original sequencing text retained immediately below for the
record.**

| Letter | Increment | Status 2026-09-06 |
|---|---|---|
| **4.2a** | Root-operator permission set (scope item 2: bootstrap npm alias + canonical `hr-admin` set 3→6 keys) | **DONE** — `spec-4-2a-root-operator-permission-set.md`, backend `4ce8bd8` |
| **4.2b** | Tree-root seed — verification that root needs no `Relationship` row to sit at the top of the `reports-to` chain, plus evidence that it resolves transitively (part of scope item 3) | **Spec written, ungated** — `spec-4-2b-tree-root-seed.md` |
| **4.2c** | §2.4 full-profile-access first holder (the other part of scope item 3) | **NOT STARTED — blocked.** Needs an architect Stage-1 data-model decision first (no schema/port/gate exists for the overlay anywhere in `services/backend`; `access-control.md` §2.4 explicitly forbids inventing AD-28 scenarios ad hoc). Analogous to the 2026-09-05 upward-walk solution-design. |
| **4.2d** | `db:dev:seed-org` dev spine (scope item 5), retiring `dev-grant-root.ts` | **NOT STARTED.** Carries scope item 1's verification grep as an entry check, not as work — that item is already closed. |

Scope item 4 (upward-walk resolver) needs no letter — it was found already
built on 2026-08-30 (`f36d1b2`); see the item's own correction above. Its
residual ACM-9 `seeded-two-level` evidence question is carried as an open
question below, not assigned a letter, per `spec-4-2b`'s AF-4 (this spec
creates no tree-root edge, so the design's "fold into 4.2b" recommendation no
longer has a premise to attach to).

**Original sequencing text, retained as the record:**

1. ~~**4.2a** — upward-walk `resolveAudiences` change (AC increment, 3-stage).~~
   **CORRECTED 2026-09-05.** There is no resolver change left to sequence
   (`f36d1b2`; `solution-design-upward-walk-resolver.md` §0). If 4.2a survives
   at all, it is an evidence + documentation close-out increment (design §8);
   the design recommends folding its ACM-9 `seeded-two-level` run into 4.2b
   instead. **Not decided here — see "Open for decision" below.**
2. **4.2b** — §2.4 first-holder = root at seed (AC / seed increment).
3. **4.2c** — ~~delete the `canEditS1` override + pinning test;~~
   `db:dev:seed-org` spine (UM increment). Lands with or just after 4.1's
   composition decision.
   **CORRECTED 2026-09-06.** There is no override or pinning test left to
   sequence: 4.1c retired the pinning test (PO, 2026-09-05) and 4.1d deleted
   `canEditS1` whole (PO ruling AF-2, 2026-09-06) — see re-scoped scope item 1.
   4.2c is therefore the **`db:dev:seed-org` dev spine (scope item 5) only**,
   carrying the item-1 verification grep as an entry check rather than as work.
   That work is unbuilt and the increment still stands.

## Open for decision (architect / PO — recorded 2026-09-05, not resolved here)

Raised by
`_bmad-output/implementation-artifacts/access-control/solution-design-upward-walk-resolver.md`
§9 as a consequence of the scope-item-4 correction above. Quoted from that
document; **none of these is settled by this documentation pass.**

1. **Does 4.2a still exist?** > "If the PO accepts §0, 4.2a stops being a
   resolver change. Two options: (a) keep it as the evidence + close-out
   increment described in §8; (b) delete 4.2a and fold the ACM-9
   `seeded-two-level` run into 4.2b's acceptance, since 4.2b is the increment
   that actually creates the tree-root edge. **My recommendation: (b)** — the
   measurement belongs to the change that alters the data, and (a) risks
   manufacturing an increment to justify a ticket."
2. **Explicit depth bound — confirm rejection.** > "§2.3 recommends against it
   on the grounds that it is audience-narrowing. Needs a PO 'yes, agreed' so it
   does not reappear as a performance suggestion in review." (§2.3's argument:
   a numeric bound would silently deny `reporting` to a legitimate manager
   sitting one level too deep — an audience-narrowing policy change, not a
   performance refactor.)
3. **Depth-499 headroom.** > "1346 ms p95 against 2000 ms is 1.49×, on an
   18-core M5 Pro with a local PostgreSQL. Is that acceptable margin for the
   deployment target, or does the `statement_timeout` headroom deferred item
   need pulling forward? Not 4.2's problem, but 4.2 is the story that makes deep
   chains reachable in a seeded environment." (The curve is super-linear in
   depth — design §7.1.)
4. **`Department.parentId` index.** > "Flagged in §6 as a migration the
   department-branch increment will need. Should it be pre-landed with 4.2's
   seed work, or held until the branch it serves? Adding an unused index has the
   same 'no speculative schema' smell as an unused column
   (`feedback_no_speculative_fields`) — **recommend holding it.**"

## References

- `_bmad-output/implementation-artifacts/access-control/deferred-work.md` —
  "Generalise section-access authorisation" (4.1), "Full-profile access
  overlay", "reporting walk descends from the viewer"
- `_bmad-output/implementation-artifacts/access-control/user-management-edit-permission-options.md`
- `docs/project-requirements.md` §2.1, §2.4, §3.1–3.2
- `docs/architecture/access-control.md` §2.2 dual gate, line 19 (FR never widens),
  line 263 (§2.4 overlay is read-only), line 100 (HR Admin no data access)
- `services/backend/prisma/seed.ts`, `scripts/dev-grant-root.ts`
- `services/backend/src/access-control/domain/services/audience-resolver.service.ts`
- `services/backend/src/access-control/infrastructure/prisma-relationship-graph.adapter.ts:88-120`
  — the shipped upward reporting CTE (`f36d1b2`, 2026-08-30)
- `_bmad-output/implementation-artifacts/access-control/solution-design-upward-walk-resolver.md`
  — 2026-09-05 architect pass that cleared this story's `blocked_on`
