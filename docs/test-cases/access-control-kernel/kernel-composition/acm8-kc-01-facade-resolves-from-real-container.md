# ACM8-KC-01 · AccessControlFacade resolves from the real application container

**Trace:**

- SPEC [CAP-6](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "After ACM-2, ACM-3, and ACM-5 complete, `AppModule` imports `AccessControlModule` and resolves `AccessControlFacade`, while `ACCESS_CONTROL_PORT` remains bound to `InterimAccessControlAdapter`."
- Architecture spine [AD-1](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-1--foundation-boundary-adopted-amended-2026-08-30-p2) — the Kernel MVP's deferred scope (Project, Department, full-profile overlays, writes) is unaffected by composition; this scenario proves visibility of the already-approved facade, not new resolution behavior.
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — "`AppModule[ACM-8 target state] --> ACF`" in the spine's own diagram; kernel evidence proves the facade is composed into the real container, not a standalone test module.
- Access Control spine [access-control.md § The AccessControl facade (AD-9)](../../../architecture/access-control.md#the-accesscontrol-facade-ad-9) — `AccessControlFacade` is "the **only** authorization entry point, in every context," backed by the Prisma-based adapters `AccessControlModule` provides for `RELATIONSHIP_GRAPH_PORT`, `IDENTITY_PORT`, and `FUNCTIONAL_ROLE_REPOSITORY_PORT`.
- Sprint proposal [§ ACM-8 — Compose the Deployable Kernel](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md) — "`AppModule` imports `AccessControlModule`." / "`AccessControlFacade` is resolvable from the production application container."
- [testing-strategy.md § Scoped headless-facade gate — Access Control Kernel MVP](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — Stage-2 for this story "calls the public `AccessControlFacade` through a real Nest testing module with the real `AccessControlModule`, real Prisma adapters, migrated PostgreSQL"; for ACM-8 specifically the container under test is the real bootstrapped `AppModule`, since the capability being proven is that `AppModule` itself now carries the module in its DI graph.

## Scenario

**Given** `AppModule` has been changed to import `AccessControlModule` (CAP-6),
and the application is bootstrapped as a real NestJS application — not a
standalone `Test.createTestingModule` built directly from
`AccessControlModule` — against migrated PostgreSQL with the real Prisma
adapters `AccessControlModule` wires for `RELATIONSHIP_GRAPH_PORT`,
`IDENTITY_PORT`, and `FUNCTIONAL_ROLE_REPOSITORY_PORT`.

**When** the test resolves `AccessControlFacade` from that real container's
`ModuleRef` — e.g. `moduleRef.get(AccessControlFacade)` — and invokes one of
its public methods (`isAllowed`, `resolveAudiences`, or `canAccessSection`)
against seeded fixture facts.

**Then** resolution succeeds without a `NestJS` unknown-provider or
circular-dependency error, and the returned instance is a working facade: the
invoked method returns a live decision derived from the real Prisma-backed
adapters and seeded PostgreSQL facts, not a mock, stub, or fixed value. This
proves DI-graph visibility only — the decision values themselves are governed
by the already-approved, unchanged ACM-2/ACM-3/ACM-5 behavior and are not the
subject of this scenario.

**Preconditions:** ACM-2, ACM-3, and ACM-5 are production-approved
(`AccessControlFacade`, `resolveAudiences`, and `canAccessSection` behavior is
already shipped and unchanged by this story). `AccessControlModule` remains
`@Global()` and exports `AccessControlFacade` unchanged from its current
provider/export shape. No Access Control repository is faked and no User
Management provider is overridden, per the AD-3 kernel rule.
