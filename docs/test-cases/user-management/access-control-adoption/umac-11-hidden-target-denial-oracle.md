# UMAC-11 · `GET` / `PATCH /users/:id` — PM/AD-24 denial oracle: `401` session, `404` hidden or missing target before any section or feature check, `403` only for a visible target

> **New Stage-1 scenario, 2026-09-12 — the regenerated AD-1 dispatch that `CONFLICT-UM-01`
> requires.** This scenario supersedes, for the live oracle:
> - the empty-audience `403` in [`umac-05`](umac-05-unresolved-session-read-denied.md) Test 3;
> - [`s41c-sag-01`](s41c-sag-01-read-gate-any-audience-allows-none-denies.md) Tests 5–6.
>
> Those documents stay as historical evidence of the 2026-09-01 decision, and their
> `expectedResult` lines are **not** rewritten. **Expected RED at Stage 2:** `SectionAccessGuard`
> answers `403` for a missing or inactive target on both routes.

**Trace:**

- Requirement: **PM-FR-4** (§3.3, server-side authorized responses and denial oracle).
- `docs/project-requirements.md` §3.3 rule 8: "Missing resource, or a target whose existence is
  hidden from the actor → `404` with a leak-free body … Hidden-target `404` takes precedence over
  mutation permission checks."
- PM spine AD-24; `docs/architecture/access-control.md`, the "Superseded 2026-09-02 (PM/AD-24)"
  paragraph.
- Blocker `CONFLICT-UM-01` (`architecture-people-management-ratification-2026-09-02/blockers.yaml`).
  Its closure condition: regenerated scenarios and Stage-2 tests assert `401` / `404` / `403` with
  hidden-target `404` preceding mutation checks, **and** the production handlers implement it.
- The in-repo precedent for the same ordering: `GetRelationshipsAction` (Story 6.1) returns `404`
  when `:id` is not an active `User`, before its reader gate.
- Test plan: `_bmad-output/test-artifacts/test-design-epic-platform-4.md` E4-C03b and E4-C04c,
  risk R08.

## Definitions

- **Hidden or missing target.** `:id` does not name an **active** `User`: no row, or
  `isActive = false`. For `profile:identity`, `colleague` is the audience floor. An active viewer
  can therefore see every active user's S1 card, and the only targets whose existence is hidden are
  those that are not active users.
- **Visible but forbidden.** The target is an active `User`, but the viewer lacks the required
  section level. For example, a colleague or the target themself on `PATCH`.

## Scenario

**Given** real `AppModule` wiring, a migrated PostgreSQL database, and run-namespaced users.

**Then the oracle holds, in this precedence order:**

1. **Session first.** An invalid token, or a deactivated caller, gets `401` on `GET` and
   `PATCH /users/:id`, **even when the target does not exist**. `SessionGuard` runs before target
   resolution.
2. **Hidden target next.** For an active caller, a `:id` that is missing or inactive gets `404`
   with a leak-free body on both routes. This happens **before** any section-access or feature
   check. On `PATCH` it holds even for a caller who would be refused `403` on a visible target, and
   even for a reporting-line manager of the now-inactive target. **No row is written.**
3. **Visible but forbidden last.** A colleague `PATCH` of an active target is still `403`, and the
   row is unchanged.

## Test 1 — `GET` of a missing target id by an active caller → `404`, leak-free

- **request:** `GET /users/<freshly generated uuidv7>` as an active viewer
- **expectedResult:** `404`; the body leaks no S1 field

## Test 2 — `GET` of an inactive target → `404`, leak-free

- **precondition:** the target is created active, then set `isActive = false` (fixture setup only)
- **request:** `GET /users/<inactive target>` as an active viewer
- **expectedResult:** `404`; the body contains no S1 field, and none of the target's id, email, or
  last name

## Test 3 — `PATCH` of a missing target id → `404` before the mutation check

- **request:** `PATCH /users/<freshly generated uuidv7>` `{ city }` as an active viewer. The same
  viewer gets `403` on a visible colleague target, which is the contrast in Test 5.
- **expectedResult:** `404`; leak-free body

## Test 4 — `PATCH` of an inactive target by its former reporting-line manager → `404`, row unchanged

- **precondition:** a real `direct` edge from target to viewer; the target is then deactivated
- **request:** `PATCH /users/<inactive target>` `{ city }` as that manager
- **expectedResult:** `404`; leak-free body; the target's `city` in the database is unchanged

## Test 5 — contrast: `PATCH` of a visible, active target by a colleague stays `403`

- **request:** `PATCH /users/<active target>` `{ city }` as a colleague
- **expectedResult:** `403`; the row is unchanged

## Test 6 — `401` precedes `404`

- **requests:**
  - `GET` and `PATCH /users/<missing id>` with the literal placeholder token `Bearer <token:Bob>`;
  - the same two requests as a deactivated caller.
- **expectedResult:** `401` for all four requests; never `404`
