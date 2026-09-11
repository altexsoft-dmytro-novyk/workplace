# ACM4R-MA-03 · Colleague is present only when no stronger audience applies

**Trace:**

- SPEC [CAP-2](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — Colleague appears only with no stronger audience.
- [access-control.md § Audience columns](../../../architecture/access-control.md#audience-columns-32) — Colleague is for an authenticated employee with none of the other audience facts.
- [access-control.md § Multi-audience merge](../../../architecture/access-control.md#multi-audience-merge) — stronger independently computed columns are not collapsed into the fallback.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (v1.5 §2.1 — strongest applicable audience is per section) — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** active Daria has a live `direct` relationship to active Zara, a live
`people_partner` relationship to active Paula, and no relationship to active
Colin. Daria, Zara, Paula, and Colin are distinct Users; Zara is not Daria's
PP and Paula is not Daria's direct manager.

**When** each viewer calls `resolveAudiences(viewerId, [dariaId])`.

**Then** Zara receives exactly `Set {'reporting'}` and no Colleague; Paula
receives exactly `Set {'pp'}` and no Colleague; only unrelated Colin receives
exactly `Set {'colleague'}`. The fallback is therefore a floor, not an
additional label attached to every authenticated viewer.

**Preconditions:** migrated PostgreSQL; real `AccessControlModule`; all four
Users are active; only the two typed relationship rows described above affect
Daria.

## Test 1 — Reporting suppresses the Colleague fallback

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<zara-id>', employeeIds: ['<daria-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map { '<daria-id>' => Set { 'reporting' } }
  ```
  Absent members: no `'pp'`, no `'colleague'`, no `'self'`.

## Test 2 — direct PP suppresses the Colleague fallback

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<paula-id>', employeeIds: ['<daria-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map { '<daria-id>' => Set { 'pp' } }
  ```
  Absent members: no `'reporting'`, no `'colleague'`, no `'self'`.

## Test 3 — unrelated active viewer receives the floor

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<colin-id>', employeeIds: ['<daria-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map { '<daria-id>' => Set { 'colleague' } }
  ```
  Absent members: no `'reporting'`, no `'pp'`, no `'self'`.
