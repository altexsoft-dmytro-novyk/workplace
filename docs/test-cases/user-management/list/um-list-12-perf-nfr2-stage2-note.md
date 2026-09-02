# UM-LIST-12 · 500+ rows with arbitrary filters resolve within the NFR-2 budget, with no per-row facade calls

**Trace:** epics.md Story 1.5 · NFR-2 ([epic-1-context.md](../../../../_bmad-output/implementation-artifacts/user-management/epic-1-context.md);
[custom-fields.md](../../../architecture/custom-fields.md) §7 — "500+ records,
arbitrary filters and derived fields … within 2 seconds including permission
resolution") · [access-control.md](../../../architecture/access-control.md)
§3.3.1 (resolve audiences per row via the **bulk** `resolveAudiences` path),
line "`resolveAudiences(viewerId, [])` returns an empty map immediately" ·
`deferred-work.md` §3.3.1

## Scenario

**Given** at least 500 active `User` rows exist.

**When** an entitled actor submits `GET /users` with arbitrary permission-safe
filters and pagination against that population.

**Then**:

- the response returns within **2 seconds** wall-clock, including all
  authorization work (NFR-2 — a joint budget shared with access control);
- the handler makes **exactly one** Access Control facade call — the no-target
  `isAllowed(viewerId, 'user-management:list')` gate — and **no** per-row call.
  The fixed projection (`um-list-08`) needs no audience resolution, so this story
  issues **zero** `resolveAudiences` / `canAccessSection` calls;
- **forward constraint:** when the deferred field-level list projection
  (`deferred-work.md` §3.3.1) lands, it must resolve audiences with a **single
  bulk `resolveAudiences(viewerId, [all row ids])` call — one graph round trip —
  never N per-row calls.** An `N+1` pattern against the facade is a defect.

> **Stage classification.** This is a **Stage-2 performance note**, not a
> Stage-1 behavioural scenario. The wall-clock assertion belongs in a dedicated
> perf/load spec (tagged `@perf`, seeded to 500+ rows) or is deferred to the
> `deferred-work.md` §3.3.1 projection suite that owns the §7 budget. The
> **call-count** assertion (one facade call, no `N+1`) is checkable in the
> Stage-2 E2E now via a spy/counter on the `ACCESS_CONTROL_PORT` binding.

**Preconditions:** [fixture](../README.md#canonical-personas); Root holds
`user-management:list`; a bulk seed of >= 500 active `User` rows for the perf
run; a facade call-counter available in the Stage-2 harness.

## Test

- **Test 1 — call count (Stage-2, checkable now)**
  - **inputURL:** `GET /users?country=Poland&position=Engineer&page=1&pageSize=25`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200`; the `ACCESS_CONTROL_PORT` binding recorded exactly
    one call — `isAllowed(<root>, 'user-management:list')` — and zero
    `resolveAudiences` / `canAccessSection` calls.

- **Test 2 — wall-clock (Stage-2 `@perf`, deferred with the §3.3.1 suite)**
  - **inputURL:** `GET /users?country=Poland&page=3&pageSize=50`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200` within 2000 ms against a 500+ row population.
