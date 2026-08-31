# ACM8-KC-03 · No User Management file or route behavior changes

**Trace:**

- SPEC [CAP-6](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "no User Management file, `/users` behavior, or Access Control HTTP/debug endpoint changes."
- Architecture spine [AD-2 — User Management ownership boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-2--user-management-ownership-boundary-adopted) — "**Prevents:** Access Control modifying User Management controllers, guards, adapters, response projection, or frontend code."
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — "**Prevents:** ... treating component evidence as production `/users` enforcement." Kernel evidence never substitutes for or alters the consumer path.
- Access Control spine [access-control.md § The AccessControl facade (AD-9)](../../../architecture/access-control.md#the-accesscontrol-facade-ad-9) — `AccessControlGuard` and `GetUserAction` (the consumers of `ACCESS_CONTROL_PORT`) are User Management-owned; this scenario proves they are untouched.
- Sprint proposal [§ ACM-8 — Compose the Deployable Kernel](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md) — "No file under `services/backend/src/user-management/**` changes." / "No `/users` behavior changes."
- [testing-strategy.md § Scoped headless-facade gate — Access Control Kernel MVP](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — "This proves the deployable kernel only. It does not prove `/users` enforcement, field/record projection, or consumer routing."

## Scenario

**Given** `AppModule` imports `AccessControlModule` (CAP-6), and the same
fixture population, decisions, and HTTP request/response pairs previously
exercised against `GET /users/:id` (and the User Management module's other
existing routes) under the interim `ACCESS_CONTROL_PORT` binding are
available for repeat under the composed container.

**When** the same requests are re-run against the composed application — with
`AccessControlModule` now present and visible in the DI graph — using no
provider overrides.

**Then** every response is byte-for-byte identical to its pre-composition
baseline: same status code, same body shape, same allow/deny outcome, because
`GetUserAction` and `AccessControlGuard` still resolve `ACCESS_CONTROL_PORT`
to `InterimAccessControlAdapter` (ACM8-KC-02) and no User Management source
file changed. `AccessControlModule` becoming importable/imported has no
observable effect on any User Management route, because nothing in
`services/backend/src/user-management/**` references `AccessControlFacade` or
`AccessControlModule`.

**Preconditions:** No file under `services/backend/src/user-management/**` is
modified by this story (verified by diff scope, not by re-implementing route
logic in a test). The comparison baseline is the unmodified, currently
production behavior of `GET /users/:id` and any other existing route.
