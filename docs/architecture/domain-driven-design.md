# Domain-Driven Design & Hexagonal Structure

Binding rules for how backend code is organized. Spine: [architecture-people-management-2026-08-30/ARCHITECTURE-SPINE.md](../../_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-30/ARCHITECTURE-SPINE.md) AD-1, AD-2, AD-3.

## Bounded contexts

- `user-management` — seeded users, org facts (reports-to, PP, department, project membership), departments, career timeline (`UserEvents`), employment status and departure lifecycle, magic-link authentication.
- `access-control` — the policies engine: functional roles + permissions (data), full profile access grant, base section-access matrix (code), audience resolution (Self / Reporting line / Project line / PP+HR-line / Colleague).
- `storage` — pre-existing, unrelated to this reset (S3 object storage).
- Everything else (dashboards, resourcing, risks, feedback, CDS, mentorship-as-a-context, campaigns, notifications, analytics, custom-fields, PeopleForce) is **not yet created** — see the spine's Deferred section.

## Layout (AD-1)

Each context is `src/<context>/{application/{actions,controllers,dtos,guards},domain/{entities,interfaces,services},infrastructure/}`. `domain/` imports nothing from `application/`, `infrastructure/`, NestJS transport, Prisma, or SDKs. Only `domain/services/` may inject a port token — `application/actions/` never injects a port directly.

## Cross-context boundary (AD-2, AD-3)

Each context consumes the other only through the target's `application/` exports, never its `domain/` or `infrastructure/`. Two distinct dependency edges: user-management → access-control for authorization (`isAllowed`/`canAccessSection`); access-control → user-management for org-graph facts (`OrgGraphReaderPort`). The query service the latter consumes lives in its own module (`UserManagementQueryModule`) with no dependency on `AccessControlModule`, so neither module imports the other back.

## Fakes/mocks/stubs — scope test

Fakes are scoped to a different, not-yet-built story/epic/context's dependency — never this unit's own deliverable. If the current story or epic owns building the real thing, build it for real, even if that means a new shared module. If the real implementation needs a technology choice nobody has made yet, stop and ask — don't guess, don't fake around it. A story is not done if any of its own acceptance criteria is satisfied by a fake. (See [testing-strategy.md](testing-strategy.md).)

## Full decision set

See the spine's Invariants & Rules (AD-1 through AD-28) for the complete, current binding rule set — this file summarizes only the DDD/layout slice of it.
