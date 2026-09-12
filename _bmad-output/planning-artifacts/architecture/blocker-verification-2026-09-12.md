# Blocker verification — 2026-09-12: SEC-AUTH-01, CONFLICT-UM-01, GAP-2

**Scope:** three items the requester (Anna Pikula) asked to verify and close:
- `SEC-AUTH-01` and `CONFLICT-UM-01` from
  `architecture-people-management-ratification-2026-09-02/blockers.yaml`;
- `GAP-2` from `platform/dept-epic.md`.

**Method:**
1. Check each item's recorded `closure_condition` against the code.
2. Fix what failed in AD-1 order: scenario, then red test, then green implementation.
3. Have an agent that did not write the fixes re-verify them. This follows the "project's own
   verification process" required by `sprint-change-proposal-2026-09-03-sec-auth-01-reconciliation.md`
   and the `QUALITY-GATE-AC` precedent.

**Baseline:** `services/backend` `main` `d1ef680`; workspace `docs/plat-e3-test-design-remediation`
`1e0d512`.

## Result

| Item | Initial check (at `d1ef680`) | Action | Independent re-verification | Status |
| --- | --- | --- | --- | --- |
| `SEC-AUTH-01` (P0) | **FAIL.** The interim adapters were gone (`git ls-files \| grep -i interim` was empty). But `env.validation.ts:109` only *defaulted* `ALLOW_TEST_SESSION_TOKENS` to `false` in production. Validating the schema directly with `NODE_ENV=production` and `ALLOW_TEST_SESSION_TOKENS=true` returned `value=true` with no error. That setting re-enables the `Bearer <token:persona>` shorthand and Root self-provisioning (`jwt-session-resolver.adapter.ts`), which are paths (1) and (2) of this blocker. | Backend branch `fix/sec-auth-01-refuse-test-tokens-in-production`, commit `45a671e`: `Joi.boolean().valid(false).default(false)` under production, plus `src/config/__tests__/env.validation.spec.ts`. The explicit-`true` case was red before the fix and green after. | **CLOSEABLE.** Production + `true` now fails schema validation, so the app does not boot. Production unset or `false` gives `false`; dev/test default to `true`. The flag has one reader (`jwt-session-resolver.adapter.ts:54`, through the globally validated `ConfigService`) and no raw `process.env` access. `npm test` passes 52/52. | **closed 2026-09-12** |
| `CONFLICT-UM-01` (P1) | **FAIL.** `SectionAccessGuard` threw `403` for a missing or inactive target on `GET`/`PATCH /users/:id`. `s41c-sag-01` Tests 5–6 and `umac-05` Test 3 pinned that `403` and were green. | **Stage 1:** new scenario `docs/test-cases/user-management/access-control-adoption/umac-11-hidden-target-denial-oracle.md`; SUPERSEDED blockquotes added to `umac-05`, `s41c-sag-01` and `s41c-sag-04`, with their historical lines left unchanged. **Stage 2:** `umac-11` suite, red on Tests 1–4 (`403` returned where `404` was expected). **Stage 3:** backend branch `feat/conflict-um-01-hidden-target-404`, commit `89ea674`. The guard resolves `:id` as an active `User` and throws `404` before `hasSectionAccess`. Superseded assertions were flipped to `404` with annotations, and guard unit tests were added. | **CLOSEABLE.** Precedence is `401` (`SessionGuard`) → `404` → `403` (`users.controller.ts:91` guard order; `section-access.guard.ts:63-77`). `@RequireSectionAccess` is used only on `GET :id` and `PATCH :id`. The adoption e2e suites pass 90/90 and unit tests 52/52. The full e2e run shows failures only in the committed-red `test/mentorship/*` suites (`CC-10-MENTORSHIP`), which are also red on `main`. No Pact interaction records a denial on these routes. | **closed 2026-09-12** |
| `GAP-2` (Epic 4) | **PASS by inspection proof**, the second closure route the item names. Details are recorded in `dept-epic.md` GAP-2. | none | Verified in this session against the evaluator, session resolver, facade, and the ACM-9 spec; unit tests 31/31. | **closed 2026-09-12** |

## Merge dependency

These two closures describe code on unmerged backend branches:
- `fix/sec-auth-01-refuse-test-tokens-in-production`;
- `feat/conflict-um-01-hidden-target-404`.

If either branch is abandoned or materially changed before merging to `services/backend` `main`,
the matching blocker **reopens** and this record no longer applies. Workspace gitlinks are updated
after merge.

## Not changed

- Other blockers named alongside these two stay as recorded, including the other `PG-01`
  preconditions `CC-07`, `AC-S9-S13` and `AC-SECTION-MATRIX-01`.
- `DEPARTMENT-EDGE`, `TT-IDENTITY-01` and the rest.
- The Story 4.2 `seeded-two-level` ACM-9 decision stays open. The GAP-2 proof does not close it.
- Gate-ID references in downstream `epics.md` `**Gates:**` lines are identities, not status. They
  are left unchanged; `blockers.yaml` holds the status.
