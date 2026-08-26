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
    actions/        # use cases; orchestrate domain services — never ports directly
    controllers/    # inbound HTTP adapter (NestJS controllers)
    dtos/           # request/response boundary shapes
  domain/
    interfaces/     # ports — contracts bound to DI tokens
    services/       # domain services — the ONLY holders of this context's ports
    entities/       # rich entities: data + behavior (e.g. user.assignFunctionalRole(...))
  infrastructure/
    *.repository.ts # persistence adapters (Prisma lives here, nowhere else)
    *.adapter.ts    # external-system adapters (timetracker, PeopleForce)
```

## Dependency rules (AD-2)

- `application/actions/` → may import `domain/` types and call `domain/services/`. **Never `@Inject` a port token directly, and never import `infrastructure/`** — an action's dependency graph must contain nothing infrastructure-shaped, even indirectly through a port type. Actions call a domain service; the domain service calls the port.
- `domain/services/` → the only place in a context allowed to `@Inject` a port (DI token declared in `domain/interfaces/`) and call it. `@Injectable()`/`@Inject()` here are DI wiring, not a domain-purity violation — the class still never imports Prisma types, HTTP request/response types, an adapter class by name, or any NestJS transport (`@Controller`, routing decorators, `Logger`-driven side effects that belong to the caller).
- `infrastructure/` → may import `domain/` (to implement its interfaces).
- `domain/` → imports **nothing** outside itself beyond the DI decorators above: no Prisma, no HTTP/transport types, no SDKs, no other context.
- **Cross-context — the entry point rule**: only through the target context's `application/` layer's exported providers (its public surface — e.g. `storage`'s `StoreObjectAction`), or through the `AccessControl` facade. Never into another context's `domain/` or `infrastructure/`, even to import just a type or a DI token symbol. A context's `application/` exports are the *only* thing another context is allowed to depend on; everything else stays private to the owning context, enforced the same way regardless of whether the dependency is a bounded context (`user-management`) or shared infrastructure laid out the same way (`storage`).

**Clarified 2026-08-26** (human-flagged during Epic 1 implementation, caught in code review of `deactivate-user.action.ts`): the two bullets above tighten AD-2 — a repository/dispatcher port living in `domain/interfaces/` does not make it safe for `application/actions/` to inject directly. The prior wording ("reaches adapters only through ports") was read as permitting exactly that; it didn't. `domain/services/` is the mandatory seam even when a given operation has no business invariant to hold beyond forwarding the call — the seam's value is architectural (one place to swap the interim access-control/session-resolver adapters later, one place a future invariant gets added without touching every action), not proof the wrapper itself does something today.

## Entities

Entities are behavior-rich classes, not data bags. State changes go through intention-revealing methods (`user.assignFunctionalRole(...)`, `user.relocateTo(...)`), not property assignment from services.

## Vocabulary invariant (AD-6) — enforced in review

- The **only** role-mutation methods in the codebase: `assignFunctionalRole`, `revokeFunctionalRole`. They operate on functional roles exclusively.
- **Forbidden anywhere**: methods, flags, or columns that grant, revoke, or store an *access* role (`grantManagerAccess`, `isManager`, `role: 'manager'` on a user row, etc.). Access roles (Self / Manager-line / PP / Colleague) exist only as the computed output of tier resolution — see [access-control.md](access-control.md).

## Naming conventions

- Context directories: kebab-case (`user-management`).
- Files: NestJS suffixes — `*.controller.ts`, `*.repository.ts`, `*.adapter.ts`, `*.service.ts`, `*.entity.ts`, `*.dto.ts`.
- IDs: `uuidv7` everywhere.
