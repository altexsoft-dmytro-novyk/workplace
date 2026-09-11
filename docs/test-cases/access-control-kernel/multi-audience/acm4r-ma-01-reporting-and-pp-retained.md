# ACM4R-MA-01 · Reporting and direct PP are retained for one target

**Trace:**

- SPEC [CAP-2](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — real facade evidence must prove Reporting and direct PP coexist without duplicates.
- [access-control.md § Multi-audience merge](../../../architecture/access-control.md#multi-audience-merge) — applicable audience columns are computed independently rather than collapsed.
- [access-control.md § Audience columns](../../../architecture/access-control.md#audience-columns-32) — PP is a separate column from Reporting.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — Stage 2 uses the public facade, real module, Prisma adapters, and migrated PostgreSQL.
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (v1.5 §2.1 — strongest applicable audience is per section) — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** active Alice has two independent live organisational facts pointing
to active Marta: `Relationship { userId: Alice, type: 'direct',
reportsToUserId: Marta }` and `Relationship { userId: Alice,
type: 'people_partner', reportsToUserId: Marta }`.

**When** Marta calls `resolveAudiences(martaId, [aliceId])`.

**Then** the one returned map entry for Alice is exactly
`Set {'reporting', 'pp'}`. Reporting and PP are both retained from their own
facts; neither is replaced by the other, and Colleague is absent because it is
only the no-stronger-audience floor.

**Preconditions:** migrated PostgreSQL; real `AccessControlModule`; Alice and
Marta are present and `isActive = true`; the two typed rows above are the only
relationship rows relevant to Alice and Marta.

## Test — direct manager and assigned PP resolve two audiences

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<marta-id>', employeeIds: ['<alice-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<alice-id>' => Set { 'reporting', 'pp' }
  }
  ```
  The set has size `2`; absent members: no `'self'`, no `'colleague'`, and no
  functional-permission key or policy value.
