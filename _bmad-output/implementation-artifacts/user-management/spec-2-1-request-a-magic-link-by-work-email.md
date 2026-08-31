---
title: 'Story 2.1: Request a Magic Link by Work Email'
type: 'feature'
status: draft
created: 2026-08-24
regenerated: 2026-09-01
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-2-context.md']
---

> Regenerated 2026-09-01 from epics.md v1.5 — **NOT an AD-1 approval.** Pre-v1.5
> `<frozen-after-approval>` block re-opened. `baseline_commit` dropped.

## Intent

**Problem:** No login mechanism exists. Per FR-2 there is no password — a magic
link sent to `workEmail` is the entire login mechanism. `POST /auth/magic-link`
accepts an email and, without confirming or denying account existence,
dispatches a one-time link if a match exists.

**Approach:** New `/auth` root, own token entity/service, no shared files with
`/users`. Look up `User` by normalized `workEmail`; on a match mint a token and
dispatch through an outbound port; on no match do neither; return the identical
`200` body shape either way.

## Boundaries & Constraints

**Always:**
- AD-1 gate: `um-auth-01`, `um-auth-02` scenario docs → red E2E → implementation.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- DEC-UM-004: unknown email → same `200` shape, **zero** dispatch (asserted
  against the email-adapter fake at stage 2). Known email → exactly one
  dispatch.
- DEC-UM-012 (proposed, draft): a deactivated user's email is treated like an
  unknown email.
- `workEmail` lookup uses the normalized value (DEC-UM-007), consistent with the
  import writer.
- Email dispatch is an outbound port; **the real adapter is Epic 2's own
  deliverable** (AD-15) pointed at real local infra via env — no dev-infra
  container in compose. The E2E rebinds it to a fixture fake (AD-3).

**Never:**
- No token or password field in any response body.
- No second form-distribution or invite path (FR-3).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Known email | Alice exists, `POST /auth/magic-link` unauthenticated | `200` `{ sent: true }`, no token/password in body; exactly one dispatch (`um-auth-01`) |
| Unknown email | No `User` matches | `200`, identical body shape; zero dispatch, asserted against the fake (`um-auth-02`) |
| Deactivated email | Colin `dismissed`/inactive | Same as unknown — `200`, zero dispatch (DEC-UM-012, draft) |

## v1.5 Cutover Notes

- The `MagicLinkToken` entity is **not yet in the schema** — proposed shape in
  `epic-2-context.md`; confirm/add to `database-schema.md` before stage 1.
- `/auth` bounded-context placement is unresolved — confirm with the architect.
- The real session-issuance adapter (replacing `interim-session-resolver.adapter.ts`)
  lands in Epic 2 (mostly Story 2.2) in the same cutover (AD-21).

## Open Questions / Gates

- Token entity shape + `/auth` context placement (architect).
- Token TTL is configuration-owned; tests inject a deterministic clock
  (DEC-UM-004).
