# Domain-Driven Design & Hexagonal Structure

Binding rules for how backend code is organized. Spine: AD-2, AD-5, AD-6.

## Bounded contexts (AD-5)

The backend is a set of bounded contexts under `src/`. Confirmed so far:

- `user-management` — org facts: users, relationships (reports-to, project membership), projects, departments
- `access-control` — the policies engine; covers **both** role dimensions (access roles and functional roles)
- `dashboards` — dashboard engine (design pending, see [dashboards.md](dashboards.md))

Pending confirmation (do not create until the architect confirms): profile, resourcing, cds, mentorship, risk, feedback, campaigns, career-timeline.

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
