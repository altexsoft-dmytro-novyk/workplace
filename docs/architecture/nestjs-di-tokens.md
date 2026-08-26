# NestJS DI — Ports as Injection Tokens

Binding rules for how ports are declared and wired. Spine: AD-2, AD-3. This is the mechanism that makes the hexagonal boundary and the E2E test gate work; get this wrong and both collapse.

## Pattern

Every port is a contract in `domain/interfaces/` plus an injection token. Adapters implement the contract in `infrastructure/`. Nothing outside the module wiring ever names an adapter class.

```ts
// domain/interfaces/timetracker.port.ts — the port (domain owns the contract)
export interface TimetrackerPort {
  getLeaves(ttId: string): Promise<Leave[]>;
  getProjects(): Promise<TtProject[]>;
}
export const TIMETRACKER_PORT = Symbol('TIMETRACKER_PORT');
```

```ts
// infrastructure/timetracker.adapter.ts — the production adapter
@Injectable()
export class TimetrackerAdapter implements TimetrackerPort { /* real HTTP client */ }
```

```ts
// module wiring — production
{ provide: TIMETRACKER_PORT, useClass: TimetrackerAdapter }

// domain/services — the ONLY consumer of the token directly (AD-2)
@Injectable()
export class TimetrackerService {
  constructor(@Inject(TIMETRACKER_PORT) private readonly timetracker: TimetrackerPort) {}
  getLeaves(ttId: string) { return this.timetracker.getLeaves(ttId); }
}

// application/actions — depend on the domain service, never the token
constructor(private readonly timetrackerService: TimetrackerService) {}
```

## Test wiring (AD-3)

E2E tests boot the real application module and **override only the outbound integration tokens** with fixture-backed fakes:

```ts
const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
  .overrideProvider(TIMETRACKER_PORT)
  .useValue(timetrackerFake(fixtures))
  .compile();
```

Rules:

- Faked in E2E: external integration ports only (timetracker, PeopleForce).
- Never faked in E2E: the database, repositories, the router, auth, the AccessControl facade, tier resolution.
- Fakes live with the test infrastructure, are fixture-driven, and implement the port contract exactly — a fake that drifts from the contract is a defect.

## Rules

- One token per port, declared next to its interface in `domain/interfaces/`.
- **Only `domain/services/` injects by token** (`@Inject(PORT)`). `application/actions/` and `application/controllers/` never do — they depend on a domain service instead (2026-08-26 clarification of AD-2; see `domain-driven-design.md`'s Dependency rules for the full rationale). Importing an adapter class outside module wiring is forbidden either way.
- Repositories follow the same pattern: `domain/interfaces/user.repository.port.ts` → `infrastructure/user.repository.ts` (Prisma), bound by token, consumed only by a `domain/services/` class. Domain and application never see Prisma.
- Cross-context consumption goes through the target context's exported application-layer providers (its `application/` public surface — a bounded context's or shared infrastructure's alike, e.g. `storage`'s `StoreObjectAction`) or the AccessControl facade — never a foreign context's `domain/`/`infrastructure/` internals.
- `application/guards/` (session resolution, entitlement gating) are the one exception: they inject ports directly, since gating a request is itself HTTP-boundary/framework plumbing, not business logic — see `users.controller.ts`'s `SessionGuard`/`AccessControlGuard`.
