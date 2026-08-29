---
id: SPEC-access-control-audience-foundation
companions:
  - ../../../docs/architecture/access-control.md
  - ../../../docs/architecture/domain-driven-design.md
  - ../../../docs/architecture/testing-strategy.md
sources:
  - ../../planning-artifacts/sprint-change-proposal-2026-08-29-access-control-foundation.md
---

> **Canonical contract.** This SPEC and the files in `companions:` define the complete two-day Access Control foundation contract. Production code remains blocked by the AD-1 scenario and E2E gates.

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
- Independent human approval is required for every Stage-1 scenario and every red E2E before production code.

## Non-goals

- User Management controllers, guards, adapters, response projection, or frontend code.
- Functional-permission evaluation, section-matrix decisions, field/record projection, and any write authorization.
- Project line, Department management, PP HR-line propagation, shared links, full-profile overlays, and policy-level `IN`.
- A standalone end-user Access Control API or UI.

## Success signal

Once User Management supplies the integration contract, independently approved HTTP scenarios demonstrate correct Self, Reporting, direct PP, Colleague, and fail-closed outcomes through its route. The production implementation then supplies that behavior without changing User Management ownership.

## Open Questions

- Which User Management-owned endpoint and exact response contract will consume the facade for the required HTTP E2E scenarios?
  Asked of the owner on 2026-08-30 as six answerable rows in `../../implementation-artifacts/access-control/um-integration-contract-request.md`; this foundation stays at design-ready until they are answered.
