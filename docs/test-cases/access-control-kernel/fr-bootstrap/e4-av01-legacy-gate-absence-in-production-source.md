# E4-AV01 · No legacy root/FR special-case identifier remains executable in production source

> **New Stage-1 scenario, PLAT-E4 (2026-09-13).** `test-design-epic-platform-4.md`
> E4-AV01's Planned half: the static source oracle behind 4.1 AC "no
> functional-role or root special case" and 4.2-1 "no FR branch in the
> identity-card decision" (§ "Acceptance-Criterion Traceability"). The DB-level
> facts — `scripts/dev-grant-root.ts` deleted, its npm alias gone, `create:root`
> repointed — are already **Existing** evidence, proven live against a real
> database by
> [`s42d-ds-05`](../dev-seed-spine/s42d-ds-05-dev-grant-root-retired-and-create-root-repointed.md)
> (`test/access-control/s42d-ds-dev-seed-spine.e2e-spec.ts` Tests 1–5). What
> this scenario closes is the plan's own separate, STATIC obligation: that
> none of five named legacy identifiers still appears as an executable branch
> anywhere in production source.

**Trace:**

- `_bmad-output/test-artifacts/test-design-epic-platform-4.md` row **E4-AV01**:
  "`scripts/dev-grant-root.ts` is retired, `create:root` is repointed, and
  nothing in `src/`, `scripts/`, or `package.json` still gives root `canEdit`
  through a special case." Its own oracle: `git grep -n
  "dev-grant-root\|canEditS1\|isAllowedForTarget\|EDIT_USER_FEATURE\|
  user-management:edit" -- src scripts package.json`, where only dated
  comments are permitted.
- Acceptance-Criterion Traceability rows **4.1-4** ("`canEditS1` and the
  `EDIT_USER_FEATURE`/`READ_USER_FEATURE` branches are gone") and **4.2-1**
  ("no FR branch in the identity-card decision — standing regression grep").
- [`s42d-ds-05`](../dev-seed-spine/s42d-ds-05-dev-grant-root-retired-and-create-root-repointed.md)
  — the DB-level half of the same obligation, unchanged by this scenario.

## Scope, stated rather than hidden

The plan's own grep target is production source — `src scripts package.json`
— not test evidence. Several test files contain these same five strings **on
purpose**, as negative evidence that the special case is gone, not as a live
branch:

- `src/user-management/infrastructure/__tests__/access-control-facade.adapter.spec.ts`
  — `expect(isAllowed).not.toHaveBeenCalledWith(VIEWER, 'user-management:edit')`
  and a `describe` block titled "the retired `'S1'` identifier is just an
  unmatched string".
- `test/access-control/acm5-section-access.e2e-spec.ts` (`ACM5-SA-06`) — uses
  the retired `'S1'` string as its unsupported-section example, asserting it
  resolves `'none'`.
- `test/user-management/access-control-adoption/write-adoption.e2e-spec.ts`
  — history comments naming `canEditS1` and the dead `user-management:edit` OR
  clause as retired.

A text-only grep cannot distinguish "the branch exists" from "a test proves
the branch does not exist." This scenario's mechanical check is therefore
scoped to files where a match is NEVER a negative-test artifact: every `.ts`
file under `src/` and `scripts/` **excluding** `__tests__/` directories and
`*.spec.ts` files, plus `package.json` itself. The excluded test files are
read and recorded here by hand instead (see Finding below).

## Scenario

**Given** the backend at PLAT-E4-S4.2d HEAD (post `s42d-ds-05`, commit
`89ea674` and later).

**Then** none of the five identifiers — `dev-grant-root`, `canEditS1`,
`isAllowedForTarget`, `EDIT_USER_FEATURE`, `READ_USER_FEATURE`,
`user-management:edit` — appears outside a comment in any production `.ts`
file under `src/` or `scripts/`, or anywhere in `package.json`; `create:root`
is the exact repointed chain; and `scripts/dev-grant-root.ts` does not exist.

## Test 1 — no retired identifier appears outside a comment under src/ or scripts/

- **inputURL:** N/A — static file scan (`legacy-gate-absence.spec.ts`)
- **expectedResult:** zero hits. **Finding at 2026-09-13:** the only four raw
  textual matches, once test files are excluded, are all comment lines:
  `scripts/dev-seed-org.ts:16` and `:34` (`dev-grant-root.ts` named as
  superseded/deleted), `users.controller.ts:59` ("`user-management:edit` /
  `user-management:read` are gone from this file"), and
  `identity-card-access.port.ts:30` ("the pre-4.1c `user-management:edit` OR
  override is gone from this path"). `canEditS1`, `isAllowedForTarget`,
  `EDIT_USER_FEATURE`, `READ_USER_FEATURE` have zero hits anywhere in
  production source.

## Test 2 — no retired identifier appears anywhere in package.json

- **expectedResult:** zero hits (package.json has no comment syntax, so any
  hit at all would be executable).

## Test 3 — `scripts/dev-grant-root.ts` does not exist on disk

- **expectedResult:** `false` — DB-free restatement of `s42d-ds-05` Test 1.

## Test 4 — `create:root` is the exact repointed chain

- **expectedResult:** `"npm run db:seed && npm run db:bootstrap:access-control"`
  — DB-free restatement of `s42d-ds-05` Test 3's target value.

## Test 5 — sanity: the resolver actually walks real production files

- **expectedResult:** the file list is non-trivial (>50 files), includes
  `section-access-matrix.ts`, and excludes every `.spec.ts` / `__tests__/`
  path — a false negative here would silently pass Tests 1–2 for the wrong
  reason.
