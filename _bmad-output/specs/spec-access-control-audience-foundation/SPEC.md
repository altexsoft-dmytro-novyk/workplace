---
id: SPEC-access-control-audience-foundation
companions:
  - ../../../docs/architecture/access-control.md
  - ../../../docs/architecture/domain-driven-design.md
  - ../../../docs/architecture/testing-strategy.md
sources:
  - ../../planning-artifacts/sprint-change-proposal-2026-08-29-access-control-foundation.md
---

> **Canonical contract.** This SPEC and the files in `companions:` define the complete two-day Access Control foundation contract. Production code follows the AD-1 three-stage **ordering** — scenario document, then a committed-red E2E, then production. The per-stage **human approval** gate was retired 2026-09-04 (`docs/architecture/testing-strategy.md:25–38`, ruling `D-1`); ordinary PR review and CI running the suites stand in its place.

# Access Control Audience Foundation

## Why

The platform needs a reusable authorization boundary, but the complete Access Control facade and its 171-scenario program cannot safely fit the two-day delivery window. This foundation isolates relationship-audience resolution without taking ownership of User Management routes, projection, or UI.

## Capabilities

- **CAP-1 — Phase-0 audience resolution**
  - **intent:** A future consumer can resolve the relationship-derived audience of one authenticated viewer for one or more employee targets.
  - **success:** Each requested target resolves to exactly one of Self, Reporting line, direct People Partner, or Colleague; Self is exclusive, Reporting follows only live `direct` edges, direct PP follows only the target's assigned `people_partner` edge, and empty input returns an empty result without database queries.

- **CAP-2 — Fail-closed resolution**
  - **intent:** A future consumer cannot gain an audience from incomplete or malformed relationship data.
  - **success:** Missing, broken, or orphaned relationship data yields no Reporting or PP audience; the consumer receives only the applicable safe fallback.

## Constraints

- Resolution is evaluated from current relationship facts for each request; derived decisions are neither persisted nor cached across requests.
- The bounded context obeys the hexagonal layout and is the only future source of relationship-audience decisions.
- The foundation needs an explicit User Management-owned HTTP consumer and response contract before Stage-1 request scenarios or Stage-2 E2E can be authored; no response shape is inferred here.
- Every Stage-1 scenario is followed by a **committed-red** E2E, and only then production code (AD-1 three-stage ordering). Independent **human approval** between stages is **not** required — that clause was retired 2026-09-04 (`docs/architecture/testing-strategy.md:25–38`, ruling `D-1`) — and no stage waits on a reviewer; PR review and CI enforce the ordering instead.

## Non-goals

- User Management controllers, guards, adapters, response projection, or frontend code.
- Functional-permission evaluation, section-matrix decisions, field/record projection, and any write authorization.
- Project line, Department management, PP HR-line propagation, shared links, full-profile overlays, and policy-level `IN`.
- A standalone end-user Access Control API or UI.

## Success signal

Once User Management supplies the integration contract, HTTP scenarios (committed-red Stage-2, then production — per-stage human approval was retired 2026-09-04 (`docs/architecture/testing-strategy.md:25–38`, ruling `D-1`)) demonstrate correct Self, Reporting, direct PP, Colleague, and fail-closed outcomes through its route. The production implementation then supplies that behavior without changing User Management ownership. *(2026-09-01: UM's answer makes the Colleague and fail-closed cases resolver-set assertions rather than `GET /users/:id` status checks — see Open Questions.)*

## Open Questions

- Which User Management-owned endpoint and exact response contract will consume the facade for the required HTTP E2E scenarios?
  Asked of the owner on 2026-08-30 as six answerable rows in `../../implementation-artifacts/access-control/um-integration-contract-request.md`.
  **Resolved 2026-08-31:** answered in `../../implementation-artifacts/access-control/um-integration-contract-response.md`. The consuming routes are `GET /users/:id`, `PATCH /users/:id`, and `PUT /users/:id/photo` (unchanged), the seam is the `ACCESS_CONTROL_PORT` binding in `user-management.module.ts`. Production rebind, per-route mapping, and the real-consumer HTTP E2E are owned by `../spec-user-management-access-control-adoption/`. This foundation and `spec-access-control-facade-audience-resolution` still require their own Stage-1 scenarios and committed-red Stage-2 E2E before production code (ordering only — the per-stage human approval was retired 2026-09-04 (`docs/architecture/testing-strategy.md:25–38`, ruling `D-1`)).
  **Amended 2026-09-01 (human product decision):** for `GET /users/:id` the answer is now that **every resolved audience — including `colleague` — reads the S1 identity card (`200`)**; empty audience → `403`, unresolved session → `401` (no leak-free `404`). The whole-row response is replaced by a minimal S1-card DTO on that one handler in adoption Story 0.1. Consequence for this foundation suite: the `colleague → deny` half of the provisional mapping is superseded — the `ACF-AU-05` / `ACF-FC-01` / `ACF-FC-02` HTTP `403` expected results must be reworked as resolver audience-set assertions (the resolver behaviour itself is unchanged). See `docs/test-cases/access-control-foundation/README.md`.
