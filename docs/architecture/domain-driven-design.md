# Domain-Driven Design & Hexagonal Structure

Binding rules for how backend code is organized. Spine: AD-2, AD-5, AD-6, AD-15…AD-21.

## Bounded contexts (AD-5)

The backend is a set of bounded contexts under `src/`. Confirmed so far:

- `user-management` — seeded users, org facts (reports-to, People Partner, and project membership), projects, departments, time-bounded employment status, durable Departure commands, and the `UserEvents` career-timeline log. Users are imported from the provided seeded population; there is no employee-registration/create capability (AD-16). PP assignment follows AD-19. `UserEvents` writes are synchronous in the same transaction as the causing use case — no event bus or generic table-change listener in this iteration.
- `access-control` — the policies engine; covers **both** role dimensions (access roles and functional roles)
- `dashboards` — dashboard engine (design pending, see [dashboards.md](dashboards.md))

Pending context-boundary confirmation: profile, resourcing, cds, mentorship, risk, feedback, campaigns. Their v1.5 feature semantics are already fixed and must be recorded in scenario contracts before the context design is approved (AD-18). In particular, mentorship requires durable pair records with closure notes (AD-17), and resourcing requests route by department.

The AD-20 executor is a user-management application orchestrator. It calls exported application services of action-items, mentorship, access-control, and other owning contexts under one shared PostgreSQL unit of work; it never reaches into their domain or infrastructure folders. No event bus or generic table listener substitutes for this explicit cross-context transaction.

The shared lifecycle unit of work is an application-level contract backed by one Prisma/PostgreSQL transaction. Participating application services expose `applyDepartureEffects({departureId, leaseToken, tx})`-shaped operations, accept the same transaction scope, and must not open independent nested transactions. The Departure row is locked and its current token is verified before any effect; effect records/events use a unique departure mutation key where the owning table can otherwise duplicate an outcome. A stale executor returns ownership-lost/no-op and cannot update retry state.

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
- **Forbidden anywhere**: methods, flags, or columns that grant, revoke, or store an *access* role (`grantManagerAccess`, `isManager`, `role: 'manager'` on a user row, etc.). Access audiences (Self / Reporting line / Project line / PP / Colleague) exist only as computed output of audience resolution — see [access-control.md](access-control.md).

## Fakes, mocks, and stubs — scope test (AD-15)

**Before adding any `Fake`/`Mock`/`Stub`/interim adapter anywhere, say out loud which story, epic, or bounded context owns building the real thing.**

- **Owned by the story/epic you are building right now → build it for real.** Faking your own acceptance criterion doesn't finish the story, it disguises an unfinished one behind a green test. This is not a judgment call to weigh against schedule pressure — it already went wrong once (a `FakePhotoStorageAdapter` was built for Story 1.3, whose entire deliverable *is* photo storage) and is now a hard rule. Building it for real means following the pattern above end to end — a port in `domain/interfaces/`, a real adapter in `infrastructure/`, wired through `domain/services/` — even if the real thing means standing up a brand-new module. Reference precedent: `src/storage/` (`ObjectStoragePort` + real `S3StorageAdapter`, LocalStack for local/CI, real S3 in prod). There is **no adapter-level fake for storage anywhere in the codebase** — production never runs the test suite, so a fake would exist only to hide unfinished work.
- **The real implementation needs a technology choice nobody has made yet → stop and ask.** Don't default to "whatever's easiest to fake" and don't silently pick a provider. Flag it to the architect/user, get the answer, then build the real module against it. A Deferred item in the spine is exactly this situation — it means "not decided," not "free to assume."
- **Owned by a different, not-yet-built story/epic/context → a fake here is correct, not a shortcut.** This is AD-3's E2E-fake category. Authentication may fake an out-of-scope delivery adapter in E2E, but no fake may stand in for the required seeded-population import or timetracker integration.

**A story or PR is not done if any of its own acceptance criteria is satisfied by a fake.** "The tests are green" is not evidence of completion when a fake is what turned them green — check what's standing behind every port a story's tests exercise before calling it finished.

## Naming conventions

- Context directories: kebab-case (`user-management`).
- Files: NestJS suffixes — `*.controller.ts`, `*.repository.ts`, `*.adapter.ts`, `*.service.ts`, `*.entity.ts`, `*.dto.ts`.
- IDs: `uuidv7` everywhere.
