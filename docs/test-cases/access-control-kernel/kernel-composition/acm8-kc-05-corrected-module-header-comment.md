# ACM8-KC-05 · AccessControlModule header comment no longer conflates composition with port rebinding

**Trace:**

- SPEC [CAP-6](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — CAP-6 authorizes `AppModule` importing `AccessControlModule` only; it does not authorize rebinding `ACCESS_CONTROL_PORT`.
- Architecture spine [AD-2 — User Management ownership boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-2--user-management-ownership-boundary-adopted) — rebinding `ACCESS_CONTROL_PORT` is User Management's own decision to make, not a byproduct of Access Control becoming importable.
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — "**Consumer rule:** production `/users` adoption still requires a User Management-owned contract, production `ACCESS_CONTROL_PORT` rebinding..." — a separate, later, separately-gated decision from this story's DI-visibility change.
- Access Control spine [access-control.md § The AccessControl facade (AD-9)](../../../architecture/access-control.md#the-accesscontrol-facade-ad-9) — the facade's exposure boundary is what CAP-6 makes visible; the comment must describe that exposure accurately.
- Sprint proposal [§ ACM-8 — Compose the Deployable Kernel](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md) — "`AppModule` imports `AccessControlModule`." is listed as its own, independent bullet from "`UserManagementModule` continues binding `ACCESS_CONTROL_PORT` to `InterimAccessControlAdapter`."
- `stories.yaml` entry `ACM-8-scenarios` — "Include correction of the stale `AccessControlModule` composition comment as an ACM-8 acceptance item."
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — this is Stage-1 prose only; the comment text itself is corrected in the later ACM-8-production dispatch, not here.

## Scenario

**Given** [`access-control.module.ts`'s](../../../../services/backend/src/access-control/access-control.module.ts)
current header comment reads, in part: "adopting the facade means rebinding
`ACCESS_CONTROL_PORT` in `user-management.module.ts`, which is User
Management's own story (AD-2)" — treating "`AppModule` importing this module"
and "rebinding `ACCESS_CONTROL_PORT`" as the same act.

**When** the comment is corrected as part of the ACM-8-production dispatch
that performs the CAP-6 composition.

**Then** the corrected comment accurately distinguishes the two acts: (1)
`AppModule` importing `AccessControlModule` — which makes the module's
providers, including `AccessControlFacade`, visible and resolvable in the
application's real DI graph — is the composition this story (CAP-6/ACM-8)
performs; (2) rebinding `ACCESS_CONTROL_PORT` away from
`InterimAccessControlAdapter` inside `user-management.module.ts` is a
separate, not-yet-authorized decision that remains User Management's own
story (AD-2), independent of whether `AccessControlModule` is importable or
imported. The corrected comment does not claim or imply that importing
`AccessControlModule` causes, requires, or is a prerequisite step toward the
port rebinding — the two are independent DI-graph facts, and only the first is
in CAP-6's scope. The `@Global()` rationale already present in the comment
(the facade must be injectable without re-declaring the wiring, per AD-9) is
preserved, since it is accurate and unaffected by this correction.

**Preconditions:** This scenario documents the required correctness content
for the comment; the comment text is written by the ACM-8-production
dispatch, not by this Stage-1 scenario-authoring story, and no other line of
`access-control.module.ts` changes as part of this correction.
