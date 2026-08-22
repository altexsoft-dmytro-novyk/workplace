# Domain-Driven Design & Hexagonal Structure

Binding rules for how backend code is organized. Spine: AD-2, AD-5, AD-6.

## Bounded contexts (AD-5)

The backend is a set of bounded contexts under `src/`. Confirmed so far:

- `user-management` — org facts: users, relationships (reports-to, project membership, mentor pairing — `Relationship.type='mentorship'`, [database-schema.md](database-schema.md)), projects, departments; also owns the `UserEvents` career-timeline log (§4.9: joining, grade/position/department change, employment-type transition, extended leave, mentorship pair start/end) — see [prd-user-management](../../_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md). **Placement is provisional**: `UserEvents` writes are triggered by an automated mechanism reacting to changes across other contexts (grade/department/mentorship), which is cross-cutting by nature. **The mechanism itself is pinned** (spine AD-11): synchronous, in the same transaction as the domain mutation that causes it, via an explicit call from that use-case — no event bus, no generic table-change listener, in iteration 1. Every feature owner wiring a new tracked change (e.g. a future `grade_change`) follows this one pattern, not their own. Kept here because (a) AD-2 bars direct joins/queries into another context's tables — splitting it out would forbid the plain `User` ⋈ `UserEvents` read the profile page needs — and (b) nothing reads it outside that one page today. Revisit as its own context only if a design emerges that avoids needing that join.
- `access-control` — the policies engine; covers **both** role dimensions (access roles and functional roles)
- `dashboards` — dashboard engine (design pending, see [dashboards.md](dashboards.md))

Pending confirmation (do not create until the architect confirms): profile, resourcing, cds, mentorship, risk, feedback, campaigns.

## Internal layout — identical in every context (AD-2, AD-5)

```text
<context-name>/
  application/
    actions/        # use cases; orchestrate domain services + ports
    controllers/    # inbound HTTP adapter (NestJS controllers)
    dtos/           # request/response boundary shapes
  domain/
    interfaces/     # ports — contracts bound to DI tokens
    services/       # domain services
    entities/       # rich entities: data + behavior (e.g. user.assignFunctionalRole(...))
  infrastructure/
    *.repository.ts # persistence adapters (Prisma lives here, nowhere else)
    *.adapter.ts    # external-system adapters (timetracker, PeopleForce)
```

## Dependency rules (AD-2)

- `application/` → may import `domain/`. Never `infrastructure/` directly — it reaches adapters only through ports (DI tokens).
- `infrastructure/` → may import `domain/` (to implement its interfaces).
- `domain/` → imports **nothing** outside itself: no NestJS transport, no Prisma, no SDKs, no other context.
- Cross-context: only through the target context's application layer, or through the `AccessControl` facade. Never into another context's `domain/` or `infrastructure/`.

## Entities

Entities are behavior-rich classes, not data bags. State changes go through intention-revealing methods (`user.assignFunctionalRole(...)`, `user.relocateTo(...)`), not property assignment from services.

## Vocabulary invariant (AD-6) — enforced in review

- The **only** role-mutation methods in the codebase: `assignFunctionalRole`, `revokeFunctionalRole`. They operate on functional roles exclusively.
- **Forbidden anywhere**: methods, flags, or columns that grant, revoke, or store an *access* role (`grantManagerAccess`, `isManager`, `role: 'manager'` on a user row, etc.). Access roles (Self / Manager-line / PP / Colleague) exist only as the computed output of tier resolution — see [access-control.md](access-control.md).

## Naming conventions

- Context directories: kebab-case (`user-management`).
- Files: NestJS suffixes — `*.controller.ts`, `*.repository.ts`, `*.adapter.ts`, `*.service.ts`, `*.entity.ts`, `*.dto.ts`.
- IDs: `uuidv7` everywhere.
