# Deferred Work — access-control

Goals split out of the 2026-08-29 Access Control build run. Each entry is an
independently shippable deliverable; none is authorized by the current spec.

- source_spec: none
  summary: Functional-role catalog — runtime-extensible FR policies, granular permission grants, and the HR Admin role-management surface.
  evidence: Split from the Access Control build intent. FR assignment is its own data model and HTTP surface (`/roles` per api-conventions.md) and must stay off the AR tier-resolution hot path (access-control.md, type-separated evaluation), so it can be reviewed and merged without the audience resolver.

- source_spec: `_bmad-output/implementation-artifacts/access-control/spec-access-control-facade-audience-resolution.md`
  summary: Policy-level `IN` operator — define the product use case and a safe target-set model before adding support beyond equality.
  evidence: `Policies.targetId` is currently scalar, so `IN` has no defined set representation. The initial facade slice does not need it: bulk SQL `IN` used to fetch requested employee IDs is not a policy operator. Design the permitted target types, cardinality, storage and atomic mutation rules, indexes/query plan, and fail-closed behavior before adding schema, seed, or evaluator support.

- source_spec: none
  summary: Shared-link overlay — named-recipient profile shares with per-section selection, expiry, revocation, never-share set, and creator re-check on every view.
  evidence: Split from the Access Control build intent. §4.8 overlay has its own persistence, lifecycle, and endpoints, and is applied after relationship-derived audience merge; it depends on the facade but ships separately.

- source_spec: none
  summary: Full-profile access overlay — §2.4 separate grant with seeded first holder, grant/revoke journaling, and last-holder protection.
  evidence: Split from the Access Control build intent AND blocked on product decision: access-control.md records the overlay's §3.2 column mapping and its Self-precedence as unresolved. Implementing now would hard-code an undecided rule.

- source_spec: `_bmad-output/implementation-artifacts/access-control/spec-access-control-facade-audience-resolution.md`
  summary: Author the v1.5 AD-1 stage-1 access-control scenario suite — persona fixture and README, audience-derivation scenarios, and per-cell matrix read/write scenarios with first-class negatives.
  evidence: Split from the facade spec on size and on AD-1. `testing-strategy.md` forbids a single dispatch spanning stages, so scenario authoring and implementation cannot share a spec. The previous 202-file suite was withdrawn in commit `6086491` and is pre-v1.5, so this is fresh authoring against v1.5 §2/§3, not a restore. This is a hard precondition for the facade spec.

- source_spec: `_bmad-output/implementation-artifacts/access-control/spec-access-control-facade-audience-resolution.md`
  summary: Profile Projection — construct a safe `GET /users/:id` response from the facade's base section decision, including S1 derived-field immutability, Project-line S5 subset, colleague S10/S11 field subsets, S7/S8 record flags, and S16 custom-field visibility.
  evidence: `canAccessSection` returns only `none`/`read`/`write`; it cannot decide an endpoint's field or record shape. The projection owns serialization, calls the facade rather than reading policies or deriving audiences, and may only narrow its base section result. This must replace the current whole-`User` spread response before a profile endpoint is treated as permission-safe.

- source_spec: none
  summary: List, filter, export, and search projection — apply section and field-level access rules to every non-profile surface.
  evidence: Split from the Access Control build intent. §3.3.1 projection is a separate cross-cutting surface with its own leak-negative suite and the §7 2-second / 500-record budget; it consumes the facade rather than defining it.
