# ACM3-II-13 · An infrastructure failure propagates as an error, never as an empty map

**Trace:**

- [stories.yaml `ACM-3-red-tests`](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml) — "Include ... infrastructure-error propagation without converting it to an empty map." **This is the scenario's authority.** SPEC CAP-1's `success` text does not state it; see the scope note below before approving.
- `services/backend/src/access-control/infrastructure/prisma-relationship-graph.adapter.ts` — the documented contract on the statement-timeout guard: "A timeout surfaces as a thrown error, never as an empty map, so a degraded resolution cannot be mistaken for 'no audience applies'."
- [access-control.md § Fail-closed, always (AD-11, AD-12)](../../../architecture/access-control.md#fail-closed-always-ad-11-ad-12) — fail-closed means denying a resolvable request, not silently answering an unresolvable one.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — no repository fake, no provider override, no artificial endpoint.
- **U-19 normative coverage:** Mechanism-level robustness evidence for `TR-2.1-02` (v1.5 §2.1 — transitive reports-to Reporting line) — headless-facade proof, not API E2E; see caveats in `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** an active viewer Vlad and an active target Wiktor with a live `direct`
edge Wiktor→Vlad, and a relationship-graph read that cannot complete — the
database refuses or fails the query rather than returning zero rows.

**When** Vlad calls `resolveAudiences(vladId, [wiktorId])` while that condition
holds.

**Then** the returned promise **rejects**. It does not resolve to `Map {}`, and
it does not resolve to `Map { wiktor => Set {} }` or
`Map { wiktor => Set {'colleague'} }`. The distinction is the whole scenario:
"no audience applies" and "the audience could not be determined" are different
answers, and only the first may ever be represented as a value. An unresolvable
read presented as an empty audience is a denial the caller cannot distinguish
from a decision — it is silently wrong in the safe-looking direction, which is
how it survives review.

**Preconditions:** [fixture](../README.md#kernel-fixture--cap-1-completion-this-suite); Vlad and
Wiktor both active; one `direct` edge Wiktor→Vlad, so the same call returns
`{'reporting'}` when infrastructure is healthy. The healthy call is asserted
first in the same test, which is what makes the rejection attributable to the
induced failure rather than to the fixture.

**Inducing the failure without a fake.** The scoped gate forbids faking the
Access Control repository and overriding a User Management provider, so the
failure comes from real PostgreSQL. A separate transaction holds an
`ACCESS EXCLUSIVE` lock on `relationships`; the adapter validates identities,
sets its own `SET LOCAL statement_timeout = '2s'`, then times out on the real
graph read. The lock is transaction-scoped, so PostgreSQL releases it on
success, rejection, connection loss, or process termination. The canonical
table name never changes, and the test asserts that it remains visible while
the failure is induced. The module, adapter, Prisma client, and database are
all the production ones.

**Not a behavior change — regression guard.** Today's adapter propagates:
`$queryRaw` rejects, `$transaction` rejects, `loadAudienceFacts` rejects, and
`AudienceResolverService.resolve` has no `catch`, so the rejection reaches the
caller. The scenario is carried because CAP-1's fail-closed language — "produce
an empty audience `Set`" — is written for *invalid identity*, and an
implementer reading it while adding the new viewer-validation read can
reasonably wrap the whole resolution in a `try`/`catch` that returns empty sets
"to be safe". That change would be invisible to every other scenario in this
suite, because every one of them asserts a value and none asserts a rejection.

**Scope note for the approver.** This file is the only one in the ACM-3 group
whose requirement comes from the Stage-2 dispatch text rather than from CAP-1's
`success` criteria. It is authored so that the Stage-2 instruction has an
approved scenario to translate — Stage 2 may translate only approved scenarios.
If it is judged outside CAP-1's boundary, rejecting **this file alone** is
coherent: no other scenario in the group depends on it, and the consequence is
that the Stage-2 dispatch must drop its infrastructure-error item rather than
carry an unapproved test.

## Test 1 — healthy read resolves, unreadable graph rejects

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<vlad-id>', employeeIds: ['<wiktor-id>'] }
  ```
- **expectedResult:** two assertions in sequence on the same input.
  ```ts
  // 1 — infrastructure healthy
  Map { '<wiktor-id>' => Set {'reporting'} }

  // 2 — relationship graph unreadable
  rejects   // the promise rejects; it does not resolve to any Map
  ```
  The second assertion must be `rejects`, not "resolves to an empty map" and
  not "resolves to a map with an empty set". Assert the failure is *not*
  swallowed rather than asserting a particular error type: the error class
  belongs to Prisma and PostgreSQL and is not this capability's contract.

## Test 2 — a failed read leaves no partial map

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<vlad-id>', employeeIds: ['<wiktor-id>', '<vlad-id>'] }
  ```
- **expectedResult:**
  ```ts
  rejects   // no partial map, even though the viewer's own Self entry needs no graph read
  ```
  Proves the call is atomic in its result: an implementation that returned the
  Self entry it already knew and omitted the entry it could not determine would
  hand the caller a map whose missing key is indistinguishable from a target
  that was never requested. Every requested id gets an entry, or the call
  fails — never some of each.
