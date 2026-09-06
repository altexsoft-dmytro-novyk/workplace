# PLAT-E4-S4.1d — pre-deletion baseline (AD-1 Stage-2 substitute gate artefact)

**Captured:** 2026-09-06, by John (PM), **before** any 4.1d dispatch.
**Backend baseline commit:** `b311589` (working tree clean at capture time).
**Why this file exists:** 4.1d is a pure deletion, so no red test is available
(spec-4-1d AF-7). This recorded baseline plus the grep oracle below replaces the
Stage-2 red-test artefact. It is captured by the PM deliberately — the agent that
performs the deletion must not author the evidence its own work is judged against.

## 1. Test baseline — must be IDENTICAL after the deletion

```
npm run test:e2e -- test/user-management
Test Suites: 23 passed, 23 total
Tests:       18 todo, 254 passed, 272 total
```

**Not one assertion may change.** 4.1d deletes unreachable code; if any count in
that block moves, or any assertion had to be edited to keep it green, the change
has altered behaviour and must stop for review rather than be reconciled.

Ancillary suites also green at baseline (verified this session, `b311589`):
`s41c-section-access-gate`, `write-adoption`, `read-adoption`, `edit-identity`,
`manager-change`, `audience-resolution` — **75/75 across 6 suites.**

Known pre-existing, NOT caused by and NOT to be fixed by 4.1d:
- `test/mentorship/*` — 6 suites, another story's approved committed-red E2E.
- `acm1r-fr-foundation` — bootstrap/seed suite; first failure is a missing
  `db:bootstrap:access-control` npm script.
- `user_events_createdBy_fkey` teardown warning on any suite performing a
  successful `PATCH` (shared `fixtures.ts` cleanup ordering).

## 2. Lint baseline

```
npm run lint
✖ 12 problems (12 errors, 0 warnings)
```

All 12 are pre-existing, in files 4.1d does not touch (`acm1r-fr-foundation` 1,
`acm9-baseline` 1, `acm9/manifest.spec` 7, `acm9/manifest.ts` 1,
`mentorship/fixtures` 2). **The count must not rise.** It MAY fall: removing the
last consumer of a module-level const makes `no-unused-vars` fire, which is the
mechanism that forces the dead constants out with the code that used them.

## 3. Grep oracle — occurrence counts at baseline

Counts are `grep -rn <symbol>` line hits from `services/backend`.

| Symbol | `src/` | `test/` | Expected after 4.1d |
|---|---:|---:|---|
| `canEditS1` | 4 | 5 | **0 in `src/`.** `test/` retains only dated historical citations — `access-control-facade.adapter.spec.ts:95` cites the 2026-09-03 defect and legitimately survives. Not a clean zero; the acceptance criteria must say which references survive and why. |
| `S1_SECTION` | 3 | 0 | 0 / 0 |
| `isAllowedForTarget` | 4 | 8 | **0 in `src/`** (AF-1: off the port). `test/` retains prose/historical mentions; `acm8-kernel-composition:97` is retargeted at `hasSectionAccess`. |
| `RequireFeatureForTarget` | 3 | 2 | **0 in `src/`** (AF-3). `test/` prose mentions may survive as history. |
| `targetScoped` | 5 | 0 | 0 / 0 (AF-3) |
| `EDIT_USER_FEATURE` | 4 | 1 | 0 in `src/` |
| `READ_USER_FEATURE` | 3 | 0 | 0 / 0 |

`RequireFeature` (the global, non-target variant) has **15 live decorator usages**
across `users`, `departments`, `departures` and `relationships` controllers. It is
**not** in scope and must still have 15 usages afterwards.

## 4. What counts as passing this gate

1. Section 1's test counts reproduce exactly, with no assertion edited.
2. Section 2's lint count is 12 or lower, with no new error in a touched file.
3. Section 3's `src/` columns all reach 0, and every surviving `test/` reference
   is named in the story's Verification with a reason.
4. `npm run build` clean.

A deletion that cannot meet 1 and 3 together is not the cleanup this story
scoped — it is a behaviour change wearing a cleanup's name, and stops for review.
