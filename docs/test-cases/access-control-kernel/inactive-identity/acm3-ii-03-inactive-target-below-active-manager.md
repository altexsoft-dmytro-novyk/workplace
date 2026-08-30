# ACM3-II-03 · Inactive target below an active manager fails closed for the Kernel MVP

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "inactive or missing viewers **and targets** produce an empty audience `Set`, never Self and never the Colleague floor."
- SPEC [Constraints](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#constraints) — "AD-20 due/departure checks and dismissed-target projection are deferred until the documented Departure persistence seam exists for the entire Kernel MVP, explicitly ACM-0 through ACM-5 ... This MVP neither requires that absent dependency nor redefines the future dismissed-target behavior."
- Architecture spine [local AD-1 — Foundation boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) and [local AD-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) scoped AD-20 amendment.
- Inherited AD-11 / AD-12 (fail-closed) — Capability→Architecture Map row "Inactive identity results (ACM-3) ... empty `Set` for inactive viewer/target."
- [access-control.md § Effective-departure cutoff (AD-20)](../../../architecture/access-control.md#effective-departure-cutoff-ad-20) — "**Kernel MVP deferral:** ACM-1/ACM-2 do not implement this section... The rules below remain the binding future target, including the dismissed-target projection." Table row "Target employee: The current manager/PP may still resolve access to the read-only dismissed-target projection" — the future behavior this scenario is explicitly *not* implementing.
- [testing-strategy.md § Kernel MVP exception](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — "Stage-1 dispatches inside that package must not reintroduce the due/departure items listed above as binding coverage."

## Scenario

**Given** Bob is an active manager with two direct reports: Alice (active) and
Dismissed (`isActive = false`).

**When** Bob calls `resolveAudiences(bobId, [dismissedId, aliceId])` in one
bulk request.

**Then** Dismissed's entry is an empty `Set` — not Reporting, despite the
`direct` relationship row from Dismissed to Bob still existing unchanged, and
not the Colleague floor either. This is the Kernel MVP's fail-closed default
for an inactive target: `User.isActive` is the only lifecycle field this MVP
recognizes (per SPEC constraints, there is no soft-delete column and no due/
departure evaluation in this package), and the future capability that would
let Bob keep a narrow, read-only view of a dismissed former report — the
dismissed-target projection — is explicit deferred work with its own
not-yet-scheduled AD-1 gate. Until that projection exists, "the target is
inactive" and "Bob has no audience over the target" are the same fact. Alice's
entry in the **same call** is unaffected, proving the failure is local to the
one target whose identity fails validation, not a fault in Bob's viewer state
or in the resolver's handling of the bulk request as a whole.

**Preconditions:** [fixture](../README.md#kernel-fixture-this-suite); Bob
active; Alice active, direct report of Bob; Dismissed `isActive = false`,
direct report of Bob (relationship row present and unmodified — this is a
deactivated user, not a deleted or orphaned relationship, so `ACM3-II-03` is
distinct from the orphan-edge fail-closed cases in `access-control/fail-closed/`);
no PP relationship for Dismissed, Alice, or Bob.

**Current vs required (code-verified gap this scenario closes):** today's
Reporting SQL already excludes Dismissed from `reportingTargets` — the base
CTE term requires the *target* row's own `isActive = TRUE`, so an inactive
Dismissed never gets a Reporting match. But `AudienceResolverService.resolve`
falls back to `'colleague'` whenever `labels.size === 0`, with no check on the
target's own active state at that point. **Today's resolver would therefore
incorrectly return `Set {'colleague'}` for Dismissed**, not an empty `Set` —
an active manager appears to retain a residual colleague-level view over a
deactivated former report. This scenario is the one that closes that leak; a
reviewer approving it is approving a narrowing of currently shipped behavior,
not a restatement of it, and is doing so without implementing (or requiring)
the future dismissed-target projection the SPEC explicitly defers.

## Test 1 — inactive target under an active, otherwise-qualifying manager

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<bob-id>', employeeIds: ['<dismissed-id>', '<alice-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<dismissed-id>' => Set {},              // empty — inactive target fails closed, not colleague
    '<alice-id>'      => Set {'reporting'}   // unaffected control target in the same bulk call
  }
  ```
  Absent members: no `'reporting'` and no `'colleague'` entry for
  `<dismissed-id>` — neither the still-live relationship row nor the
  colleague fallback produces an audience once the target's own identity
  validation fails.
