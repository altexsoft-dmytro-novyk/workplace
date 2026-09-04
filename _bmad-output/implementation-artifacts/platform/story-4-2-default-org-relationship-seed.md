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
blocked_on:
  - 'Architect solution-design for the upward-walk resolver change (AC-owned resolveAudiences change, its own AD-1)'
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

1. **Delete the override.** Remove the `user-management:edit` OR-branch from
   `AccessControlFacadeAdapter.canEditS1`
   (`services/backend/src/user-management/infrastructure/access-control-facade.adapter.ts`)
   and the interim pinning test
   (`write-adoption.e2e-spec.ts` "S1 edit · `user-management:edit` FR grant is
   an OR-override" — see also the P2 active-target guard added in the same
   review; that guard is subsumed once the override is gone).
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
4. **Resolver: walk upward from targets.** `resolveAudiences` currently expands
   every descendant of the viewer, then filters to the requested targets — so a
   viewer near the tree root walks the whole org to open one profile. This seed
   puts root permanently at the root, making that the standing worst case.
   Switch the reporting-chain resolution to walk **upward from each target**,
   bounded by chain depth. (Tracked as a deferred AC finding — this story makes
   it load-bearing for §7's 500-record / 2-second budget and pulls it into
   scope. Its own AD-1 increment in the access-control package.)
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

- `canEditS1` no longer references `isAllowed` / `EDIT_USER_FEATURE`; grep of
  `access-control-facade.adapter.ts` shows no FR-permission branch in the
  identity-card decision. The OR-override pinning test is deleted.
- On a seeded dev DB: the root identity resolves `reporting` → `write` on
  `profile:identity` for every active user in the seeded population, and
  `GET /users/:id` returns `canEdit: true` for root on every card — with no
  adapter special case.
- A delegated HR Admin (holds `hr-admin` FR, no relationship to the target):
  `GET /users` / `POST /users` / role-assignment routes → allowed;
  `PATCH /users/:id` on an unrelated person → `403`;
  `GET /users/:id` → `canEdit: false`.
- The audience resolver walks upward from targets: a viewer at the tree root
  opening one profile issues a query bounded by reporting-chain depth, not by
  org size — shown with the ACM-9 measurement pattern
  (`_bmad-output/test-artifacts/performance/`).
- `db:dev:seed-org` throws under `NODE_ENV=production`, is absent from
  `prisma/seed.ts` and `scripts/bootstrap-access-control.ts`, and the
  `test/access-control/acm1r-fr-foundation.e2e-spec.ts` invariant suite stays
  green.
- Closes the access-control deferred-work "reporting walk descends from the
  viewer" finding; updates the "Full-profile access overlay" item's seeded-holder
  question.

## Sequencing (AD-1 — production authz, no dispatch spans a stage)

1. **4.2a** — upward-walk `resolveAudiences` change (AC increment, 3-stage).
2. **4.2b** — §2.4 first-holder = root at seed (AC / seed increment).
3. **4.2c** — delete the `canEditS1` override + pinning test; `db:dev:seed-org`
   spine (UM increment). Lands with or just after 4.1's composition decision.

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
