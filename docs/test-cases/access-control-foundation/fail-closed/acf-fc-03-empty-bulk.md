# ACF-FC-03 · Empty bulk resolves without touching the database

**Trace:** §7 · AD-10 · ACF-1

## Scenario

**Given** an authenticated viewer and an empty list of target employee IDs.

**When** the facade resolves audiences for that empty list.

**Then** it returns an empty map immediately and issues **zero** database queries — no graph walk, no relationship read. The 500-record / 2-second budget depends on bulk resolution being one query plan per graph, and the degenerate case must short-circuit before any of it.

**Preconditions:** [fixture](../README.md#foundation-fixture); no per-case state.

## Test

> **Facade-level case.** This one is asserted at the facade, not over HTTP: `GET /users/:id` always carries exactly one target, so an empty request list cannot be expressed as a route call. The deviation from the `inputURL` skeleton in [../../README.md](../../README.md) is deliberate and limited to this file.

- **facadeCall:** `accessControl.resolveAudiences(<colin-id>, [])`
- **expectedResult:** an empty map; the query counter observed around the call reports `0` statements.
