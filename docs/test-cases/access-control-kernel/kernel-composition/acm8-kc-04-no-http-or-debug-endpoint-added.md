# ACM8-KC-04 · AccessControlModule remains headless — no HTTP or debug endpoint

**Trace:**

- SPEC [CAP-6](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "no User Management file, `/users` behavior, or Access Control HTTP/debug endpoint changes."
- Architecture spine [AD-2 — User Management ownership boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-2--user-management-ownership-boundary-adopted) — "**Rule:** Access Control provides a domain/application facade. User Management alone chooses and owns the existing/future HTTP endpoint."
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — "**Prohibition:** no test-only, debug, or artificial HTTP endpoint may be created to make the kernel gate look like consumer E2E."
- Access Control spine [access-control.md § The AccessControl facade (AD-9)](../../../architecture/access-control.md#the-accesscontrol-facade-ad-9) — the facade is consumed as an injectable application-layer dependency, never as a directly-routable HTTP surface of its own.
- Sprint proposal [§ ACM-8 — Compose the Deployable Kernel](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md) — "No `/users` behavior changes and no Access Control HTTP, test-only, or debug endpoint is introduced."
- [testing-strategy.md § Scoped headless-facade gate — Access Control Kernel MVP](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — "Do not create a test-only, debug, or artificial HTTP endpoint."

## Scenario

**Given** `AppModule` imports `AccessControlModule` (CAP-6), and the
composed application's full route table is enumerable (e.g. via Nest's
router-explorer introspection, or by inspecting every `@Controller` reachable
from the composed module graph).

**When** the route table of the composed application is inspected for any
path that did not exist before `AccessControlModule` was imported.

**Then** no new controller, route, or debug endpoint appears anywhere in the
route table as a result of this change. `AccessControlModule`'s `@Module`
metadata declares no `controllers` array and this story adds none;
`AccessControlFacade` remains reachable only by constructor/`ModuleRef`
injection from within the Nest DI graph, never by an HTTP path. The only
routes present are the ones `UserManagementModule` and `HealthModule` already
registered.

**Preconditions:** `AccessControlModule`'s provider/export shape is read, not
edited, by this story beyond the header-comment correction (ACM8-KC-05); no
`@Controller` is added to `AccessControlModule` or anywhere under
`services/backend/src/access-control/**`.
