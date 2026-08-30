# NestJS DI — Ports as Injection Tokens

Binding rules for how ports are declared and wired. Spine: [architecture-people-management-2026-08-30/ARCHITECTURE-SPINE.md](../../_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-30/ARCHITECTURE-SPINE.md) AD-1, AD-3.

## Pattern

Every port is a contract in `domain/interfaces/` plus an injection token. Adapters implement the contract in `infrastructure/`. Nothing outside the module wiring ever names an adapter class directly.

## Ports this reset introduces

- `OrgGraphReaderPort` (access-control domain) — implemented by an infrastructure adapter that calls user-management's exported `UserManagementQueryModule` service, live, never cached (AD-3).
- User-management's own repositories for `User`, `Relationship`, `Department`, `Departure`, `EmploymentStatus`, `UserEvents`, `MagicLinkToken` (domain interfaces, Prisma-backed infrastructure implementations).
- Access-control's repositories for `Policy`, `Permission`, `PolicyPermission`, `UserPolicy`, `FullProfileAccessGrant`, `RelationshipJournal` reads.

## Module boundary (AD-3 corollary)

`AccessControlModule` imports only `UserManagementQueryModule` (the narrow, guard-free module exporting org-graph read services) — never `UserManagementModule` itself, which is the controller-bearing module that imports `AccessControlModule` for its guards. This keeps the two capability-level dependency edges (authorize vs. supply-facts) from becoming a NestJS module-level circular import.

Full rationale and the rest of the decision set: see the spine.
