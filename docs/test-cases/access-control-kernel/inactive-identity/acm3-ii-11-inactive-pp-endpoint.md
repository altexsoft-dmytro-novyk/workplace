# ACM3-II-11 · An inactive PP endpoint derives no direct-PP audience

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "The kernel resolves inactive or missing viewers, targets, Reporting bridges, and **PP endpoints** without deriving access through invalid identity paths ... inactive or missing viewers and targets produce an empty audience `Set`, never Self and never the Colleague floor."
- [stories.yaml `ACM-3-scenarios`](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml) — "Author only CAP-1 scenarios for inactive or missing viewers, targets, Reporting bridges, and PP endpoints".
- [access-control.md § Audience columns](../../../architecture/access-control.md#audience-columns-32) — PP row: "`Relationship type='people_partner'` + the assigned PP's `direct` HR line above (§2.1, AD-19)"; Self row for the identity-before-derivation ordering.
- [access-control.md § Fail-closed, always (AD-11, AD-12)](../../../architecture/access-control.md#fail-closed-always-ad-11-ad-12).
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).
- **U-19 normative coverage:** Mechanism-level robustness evidence for `TR-2.1-02`, and negative/boundary evidence for `TR-2.1-05`/`TR-2.1-05A` (v1.5 §2.1 — direct and recursive PP) — headless-facade proof, not API E2E; see caveats in `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** two independent PP assignments. Roman's assigned People Partner is
Pavlo, and **Pavlo is `isActive = false`**. Taras's assigned People Partner is
Solomiya, who is active, but **Taras is `isActive = false`**. Roman is active;
Ulyana is an active control target whose assigned PP is also Solomiya.

**When** each PP calls `resolveAudiences` over the target they are assigned to:
Pavlo over Roman, and Solomiya over Taras and Ulyana in one call.

**Then** neither invalid identity path derives PP. Pavlo is a deactivated
account holding a still-live `people_partner` edge, so viewer identity
validation fails before any derivation and Roman's entry is an empty `Set` —
not `pp`, and not the Colleague floor either. Taras's entry under the active
Solomiya is likewise an empty `Set`: the target's own identity validation
fails, and the PP edge pointing at a live partner does not rescue it. Ulyana,
requested in the same call as Taras, resolves normally to `{'pp'}`, proving the
failure is local to the target whose identity is invalid.

**Preconditions:** [fixture](../README.md#kernel-fixture--cap-1-completion-this-suite); Roman
active with one `people_partner` edge to Pavlo; Pavlo `isActive = false`;
Taras `isActive = false` with one `people_partner` edge to Solomiya; Ulyana
active with one `people_partner` edge to Solomiya; Solomiya active. **No
`direct` edge exists anywhere in this fixture** — PP must be the only possible
source of an audience here, or the test cannot attribute what it observes.

**Scope note — direct PP only.** This scenario asserts the assigned-endpoint
(direct PP) column only. The PP's own HR line above them stays fail-closed
behind its Department dependency (AD-19), so no scenario here may assert or
deny a transitive PP audience.

**Current vs required (code-verified gap this scenario closes).** The PP
lookup in `PrismaRelationshipGraphAdapter.loadAudienceFacts` joins `users` on
`r."userId"` — the **target** — and filters `r."reportsToUserId" = <viewer>`
with no active check on the viewer at all. So:

- **Test 1 today:** the query matches Roman and returns him, because nothing
  consults Pavlo's `isActive`. Verified against the running migrated
  PostgreSQL with this fixture shape (inactive PP endpoint as viewer): the PP
  query returned the target. **Today's resolver answers `Set {'pp'}` for
  Roman** — a deactivated People Partner keeps live PP access. Required:
  an empty `Set`. This is a **narrowing**, and the most consequential one in
  this file: PP is a data-access audience granted to HR staff, so the residual
  access outlives the account.
- **Test 2 today:** the target-side join already excludes the inactive Taras
  from `ppTargets`, so `labels.size === 0` and
  `AudienceResolverService.resolve` falls back to `'colleague'`. **Today's
  resolver answers `Set {'colleague'}` for Taras**, not an empty `Set` — the
  same residual-colleague leak `ACM3-II-03` closes on the Reporting side,
  reproduced here on the PP side. Required: an empty `Set`. Also a narrowing.

## Test 1 — the assigned PP is deactivated

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<pavlo-id>', employeeIds: ['<roman-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<roman-id>' => Set {}   // empty — not pp, not colleague
  }
  ```
  Absent members: no `'pp'` and no `'colleague'` for `<roman-id>`. The
  `people_partner` row is present and unmodified throughout — this is a
  deactivated partner, not a removed assignment.

## Test 2 — the target of a live PP assignment is deactivated

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<solomiya-id>', employeeIds: ['<taras-id>', '<ulyana-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<taras-id>'  => Set {},        // empty — inactive target fails closed, not colleague
    '<ulyana-id>' => Set {'pp'},    // unaffected control target in the same bulk call
  }
  ```
  Absent members: no `'pp'` and no `'colleague'` for `<taras-id>`.

## Test 3 — the deactivated partner is denied over every target, not only their own

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<pavlo-id>', employeeIds: ['<roman-id>', '<ulyana-id>', '<pavlo-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<roman-id>'  => Set {},   // assigned target — still empty
    '<ulyana-id>' => Set {},   // unrelated active target — empty, not the Colleague floor
    '<pavlo-id>'  => Set {},   // own id — empty, not self
  }
  ```
  Confirms the viewer-identity failure is global to the call, matching
  `ACM3-II-01`'s Reporting-side finding, and that it reaches the PP column and
  Self on the same footing.
