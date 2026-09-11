# S4.1a-DP-01 · An active user holds a `DEFAULT_PERMISSIONS` key with no attachment at all

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — `isAllowed` is the one global functional-permission decision; this scenario exercises its new code-defined half.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — Stage-1 scenario prose precedes the Stage-2 red E2E and any code.
- SCP [`sprint-change-proposal-2026-09-04-section-access-consolidation.md` §4.3 D2](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md) — the decision record for the `DEFAULT_PERMISSIONS` baseline.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — the D2 blockquote: `isAllowed(user, key) = key ∈ DEFAULT_PERMISSIONS (active user) ∪ the data-driven grant chain`.
- Story [`spec-4-1a-default-permissions-baseline.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-1a-default-permissions-baseline.md) — this increment's own spec.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — real module, Prisma adapters, migrated PostgreSQL, no invented HTTP endpoint.
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (v1.5 §2.1 — functional-role evaluation underlying "roles remain separate") — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** an active User exists with no `UserPolicies` row at all — no
attachment, no FR policy, no grant, no `Permissions` row for
`'profile:identity:write'` needs to exist either.

**When** the caller invokes
`AccessControlFacade.isAllowed(userId, 'profile:identity:write')`.

**Then** the promise resolves to `true`. The decision comes from the
in-memory `DEFAULT_PERMISSIONS` set membership check plus the user's active
state — not from any database join over `Policies`/`PolicyPermissions`/`UserPolicies`.

**Preconditions:** migrated PostgreSQL; real `AccessControlModule`; the named
User has `isActive = true` and holds zero policy attachments.
