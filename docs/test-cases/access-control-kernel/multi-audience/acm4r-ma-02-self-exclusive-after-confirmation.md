# ACM4R-MA-02 · Confirmed active Self is exclusive

**Trace:**

- SPEC [CAP-2](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — Self is exclusive only once viewer and target are confirmed present and active.
- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — identity validation precedes every audience derivation, including Self.
- [access-control.md § Audience columns](../../../architecture/access-control.md#audience-columns-32) — a confirmed Self does not merge manager columns.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — public-facade scenario format.
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (v1.5 §2.1 — strongest applicable audience is per section) — headless-facade proof, not API E2E. **Also component evidence for `TR-3.2-SELF`** (registered 2026-09-13, `ACF-TR-01`, option A — the Self audience-derivation rule; primary evidence is `ACF-AU-01`), since this scenario is the mechanism-level proof that a confirmed Self excludes Reporting/PP/Colleague. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** Marta exists, is active, and is the same confirmed User row for both
the viewer and requested target. Any relationships Marta may hold for other
employees are irrelevant; no relationship is used to derive an audience for
Marta's own target id.

**When** Marta calls `resolveAudiences(martaId, [martaId])`.

**Then** the returned entry is exactly `Set {'self'}`. It contains neither
Reporting nor PP nor Colleague: Self is not a fallback and is not merged with
manager columns after identity confirmation. This positive scenario relies on
the existing CAP-1 inactive/missing identity negatives; it does not weaken
their empty-set outcome.

**Preconditions:** migrated PostgreSQL; real `AccessControlModule`; one active
Marta User row; target id equals viewer id; no fake graph or HTTP endpoint.

## Test — active confirmed viewer requests their own id

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<marta-id>', employeeIds: ['<marta-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<marta-id>' => Set { 'self' }
  }
  ```
  The set has size `1`; absent members: no `'reporting'`, no `'pp'`, and no
  `'colleague'`.
