# ACM4R-MA-06 · One PostgreSQL fixture covers every CAP-2 audience class

**Trace:**

- SPEC [CAP-2](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — real migrated-PostgreSQL facade evidence covers Reporting, direct PP, Colleague, mixed fixtures, and FR separation.
- [access-control.md § Audience columns](../../../architecture/access-control.md#audience-columns-32) — Reporting, PP, and Colleague are distinct inputs.
- [access-control.md § Multi-audience merge](../../../architecture/access-control.md#multi-audience-merge) — a viewer can retain more than one applicable audience for the same target.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — direct facade, real module, real Prisma adapters, and migrated PostgreSQL are mandatory.
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (v1.5 §2.1 — strongest applicable audience is per section) — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** migrated PostgreSQL contains active viewer Mara and four active
targets in one isolated fixture:

- Taylor has both `direct` and `people_partner` rows pointing to Mara.
- Reese has only a `direct` row pointing to Mara.
- Carmen has only a `people_partner` row pointing to Mara.
- Noah has neither audience-bearing row to Mara.

Mara also has one real ACM-1-created FR permission attachment. It is included
to prove separation, not to assert an `isAllowed` result.

**When** Mara calls
`resolveAudiences(maraId, [taylorId, reeseId, carmenId, noahId])` once.

**Then** the returned `Map` has exactly four entries: Taylor maps to
`Set {'reporting', 'pp'}`, Reese to `Set {'reporting'}`, Carmen to
`Set {'pp'}`, and Noah to `Set {'colleague'}`. No set contains `self`, a
functional-permission key, policy id, or duplicate label. This single fixture
therefore covers all audience classes and proves the FR data does not leak into
the audience output.

**Preconditions:** ACM-1 production and its Stage-3 approval are complete;
migrated PostgreSQL; real `AccessControlModule` and Prisma adapters; all five
Users are active; no extra direct or PP relationship affects the four targets.

## Test — mixed bulk facade call preserves every applicable audience

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  {
    viewerId: '<mara-id>',
    employeeIds: ['<taylor-id>', '<reese-id>', '<carmen-id>', '<noah-id>']
  }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<taylor-id>' => Set { 'reporting', 'pp' },
    '<reese-id>' => Set { 'reporting' },
    '<carmen-id>' => Set { 'pp' },
    '<noah-id>' => Set { 'colleague' }
  }
  ```
  The map has size `4`; its sets have sizes `2`, `1`, `1`, and `1`
  respectively. No result contains `'self'` or an FR permission/policy value.
