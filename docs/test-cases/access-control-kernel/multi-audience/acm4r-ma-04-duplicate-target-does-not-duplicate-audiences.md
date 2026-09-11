# ACM4R-MA-04 · Repeated target input preserves one de-duplicated mixed result

**Trace:**

- SPEC [CAP-2](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — Reporting and direct PP coexist without duplicates.
- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — each distinct requested target has one map entry and duplicate targets collapse to one key.
- [access-control.md § Multi-audience merge](../../../architecture/access-control.md#multi-audience-merge) — applicable columns retain their independent meaning.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (v1.5 §2.1 — strongest applicable audience is per section) — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** the same active mixed relationship facts as ACM4R-MA-01: Alice has
both a `direct` and a `people_partner` relationship pointing to active Marta.

**When** Marta calls `resolveAudiences(martaId, [aliceId, aliceId])`, repeating
the same target id in one bulk request.

**Then** the returned map has exactly one Alice key. That key maps to exactly
`Set {'reporting', 'pp'}` with cardinality `2`: one Reporting label and one PP
label, not duplicate map entries or duplicate audience values. Colleague is
absent because the retained stronger audiences suppress the floor.

**Preconditions:** migrated PostgreSQL; real `AccessControlModule`; Alice and
Marta are active; Alice's one direct and one PP rows both point to Marta.

## Test — duplicate target id does not duplicate a mixed audience

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<marta-id>', employeeIds: ['<alice-id>', '<alice-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<alice-id>' => Set { 'reporting', 'pp' }
  }
  ```
  `result.size === 1` and `result.get('<alice-id>')?.size === 2`; absent
  members: no `'self'`, no `'colleague'`.
