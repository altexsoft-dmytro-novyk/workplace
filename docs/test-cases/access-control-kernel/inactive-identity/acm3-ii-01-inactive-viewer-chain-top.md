# ACM3-II-01 · Inactive viewer at the top of a reporting chain receives no audience

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "Viewer identity validation ... runs before any audience derivation, Self included ... inactive or missing viewers and targets produce an empty audience `Set`, never Self and never the Colleague floor."
- Architecture spine [local AD-1 — Foundation boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) (binds ACF-1 / CAP-1 / CAP-2 / ACM-3): "Identity before Self ... viewer identity validation — the viewer exists and is active — runs before any audience derivation, Self included."
- Inherited AD-11 / AD-12 (fail-closed) — Capability→Architecture Map row "Inactive identity results (ACM-3) ... empty `Set` for inactive viewer/target."
- [access-control.md § Audience columns](../../../architecture/access-control.md#audience-columns-32) — Self row: "Identity validation runs **before** any audience derivation, Self included; ... An unconfirmed viewer or target yields an empty audience `Set` — never Self, never the Colleague floor."
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — public-method-call scenario format for this suite.

## Scenario

**Given** a reporting chain Alice → Bob → Owen, where Alice and Bob are active
and Owen sits at the top of the tree (`reportsToUserId` empty) but has
`isActive = false`.

**When** Owen — holding a valid session for a since-deactivated account — calls
`resolveAudiences(ownerId, [aliceId, ownerId])`, requesting Alice's audience
and his own.

**Then** every entry in the returned map is an empty `Set`: not Reporting for
Alice (even though the chain beneath Owen is fully active and would prove Owen
as Alice's ancestor if he were active), not Colleague for Alice (the fallback
never fires once the viewer fails identity validation), and not Self for his
own id (identity validation precedes Self, so an inactive viewer is denied
before `viewerId === targetEmployeeId` is even considered). The failure is
global to the call — it does not depend on which target or relationship is
requested.

**Preconditions:** [fixture](../README.md#kernel-fixture-this-suite); Alice
active, direct report of Bob; Bob active, direct report of Owen; Owen
`isActive = false`, `reportsToUserId` null; no PP relationship for Owen or
Alice.

**Current vs required (code-verified gap this scenario closes):** today's
`AudienceResolverService.resolve` and the recursive Reporting CTE in
`PrismaRelationshipGraphAdapter.loadAudienceFacts` never check the viewer's own
`isActive` — the SQL only requires each *intermediate bridge* to be active to
keep walking, and the final `WHERE ancestor_id = viewerId` check does not
re-validate that row. Because Alice → Bob is a fully active two-hop climb to
Owen, the base term already produces the chain row that proves Owen as
ancestor before Owen's own state is ever consulted, so **today's resolver
would incorrectly return `Set {'reporting'}` for Alice under an inactive
Owen.** This scenario is the one that closes that gap; a reviewer approving it
is approving a **narrowing** of currently shipped behavior, not a restatement
of it.

## Test 1 — inactive viewer, active target reachable via a live chain

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<owen-id>', employeeIds: ['<alice-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<alice-id>' => Set {}   // empty — not reporting, not colleague
  }
  ```
  Absent members: no `'reporting'`, no `'colleague'`, no `'self'` entry in the
  set for `<alice-id>`.

## Test 2 — inactive viewer requesting themselves

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<owen-id>', employeeIds: ['<owen-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<owen-id>' => Set {}   // empty — not self, even though viewerId === targetEmployeeId
  }
  ```
  Absent members: no `'self'` entry — proving identity validation runs before
  the `viewerId === targetEmployeeId` exclusivity check, not after it.
