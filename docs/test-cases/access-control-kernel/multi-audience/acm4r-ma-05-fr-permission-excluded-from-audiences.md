# ACM4R-MA-05 · A functional permission never enters audience resolution

**Trace:**

- SPEC [CAP-2](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — FR permissions never enter the audience result.
- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — functional permission evaluation is separate and reads only `type='FR'` data.
- [access-control.md § Core API](../../../architecture/access-control.md#core-api) — `isAllowed` and `resolveAudiences` are distinct public operations.
- [access-control.md § Audience columns](../../../architecture/access-control.md#audience-columns-32) — Colleague is the audience floor where no relationship exists.
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (roles remain separate) and `TR-2.3-03` (v1.5 §2.3 — functional permissions never widen data) — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** completed ACM-1 production has created a real FR permission, FR
policy, grant, and `UserPolicies` attachment for active Colin. Colin and active
Alice have no `direct` or `people_partner` relationship in either direction.
The fixture records the concrete FR permission key, for example
`user-management:list`, but calls no functional-permission API.

**When** Colin calls `resolveAudiences(colinId, [aliceId])`.

**Then** Alice's entry is exactly `Set {'colleague'}`. No permission key,
policy id, grant, attachment, or synthetic FR label appears in the `Set`, and
the FR fixture does not upgrade Colin to Reporting or PP. This is a separation
contract, not an `isAllowed` scenario: it makes no assertion about whether
Colin is allowed to use a feature.

**Preconditions:** ACM-1 production and its Stage-3 approval are complete;
migrated PostgreSQL; real `AccessControlModule`; active Colin carries one real
`type='FR'` permission through the migrated tables; Alice and Colin have no
audience-bearing relationship row.

## Test — FR fixture cannot widen an unrelated audience result

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<colin-id>', employeeIds: ['<alice-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map { '<alice-id>' => Set { 'colleague' } }
  ```
  Absent members: no `'reporting'`, no `'pp'`, no `'self'`, no
  `'user-management:list'`, and no other functional permission or policy value.
