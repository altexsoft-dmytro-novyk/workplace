# ACM8-KC-02 · ACCESS_CONTROL_PORT stays bound to InterimAccessControlAdapter

**Trace:**

- SPEC [CAP-6](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "`AppModule` imports `AccessControlModule` and resolves `AccessControlFacade`, while `ACCESS_CONTROL_PORT` remains bound to `InterimAccessControlAdapter`."
- Architecture spine [AD-1](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-1--foundation-boundary-adopted-amended-2026-08-30-p2) — Kernel MVP composition (ACM-8) is explicitly scoped as "only composes"; it is not the User Management adoption story.
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — "**Consumer rule:** production `/users` adoption still requires a User Management-owned contract, production `ACCESS_CONTROL_PORT` rebinding, projection, and real HTTP → router → authentication → Access Control → PostgreSQL E2E without provider overrides." Rebinding is a separate, not-yet-authorized decision from this story's composition.
- Access Control spine [access-control.md § AD-2 boundary](../../../architecture/access-control.md) and architecture spine [AD-2 — User Management ownership boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-2--user-management-ownership-boundary-adopted) — "User Management alone chooses and owns the existing/future HTTP endpoint and observable response projection that consumes it."
- Sprint proposal [§ ACM-8 — Compose the Deployable Kernel](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md) — "`UserManagementModule` continues binding `ACCESS_CONTROL_PORT` to `InterimAccessControlAdapter`." / "Startup evidence verifies that kernel availability did not silently rebind the User Management port."
- [testing-strategy.md § Scoped headless-facade gate — Access Control Kernel MVP](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — Stage-2 evidence must not "override a User Management provider," so this assertion is made against the container's real, unmodified binding.

## Scenario

**Given** `AppModule` imports `AccessControlModule` (CAP-6) and the
application is bootstrapped as a real container with `UserManagementModule`
present and unmodified — its `ACCESS_CONTROL_PORT` provider entry is still
`{ provide: ACCESS_CONTROL_PORT, useClass: InterimAccessControlAdapter }`.

**When** the test resolves `ACCESS_CONTROL_PORT` from that same real
container — e.g. `moduleRef.get(ACCESS_CONTROL_PORT)` — after
`AccessControlFacade` has already been resolved and used in the same test run
(ACM8-KC-01).

**Then** the resolved instance is `InterimAccessControlAdapter`, verified by
identity or `instanceof`, and is **not** `AccessControlFacade` or any adapter
`AccessControlModule` provides. `AccessControlModule` becoming importable and
imported does not implicitly or silently change which class
`ACCESS_CONTROL_PORT` resolves to; the two bindings coexist in the same DI
graph without collision, because they are different tokens.

**Preconditions:** `UserManagementModule`'s provider array is read, not
edited, by this story. No test overrides `ACCESS_CONTROL_PORT` to force this
outcome — the assertion is against the binding NestJS actually resolves from
the unmodified module graph.
