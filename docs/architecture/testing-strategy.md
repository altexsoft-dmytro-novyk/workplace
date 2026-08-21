# Testing Strategy — the Three-Stage Gate

Binding rules for how every feature is built. Spine: AD-1, AD-3, AD-4.

## The gate (AD-1) — no exceptions, no reordering

Every feature, every developer, in this order:

1. **Scenario document** in `/docs/test-cases/`, written line-by-line:
   *actor (who, with which relationships/roles) → request (endpoint, payload) → expected outcome (status, body shape, what is absent)*.
   Every scenario cites the requirements section it implements (e.g. `§3.2 S6 / Manager line`, `§2.3 removing a permission`).
   The authoring pattern — folder structure, file skeleton (`inputURL` / `inputRequest` / `expectedResult`), granularity and status-code conventions — is defined in [/docs/test-cases/README.md](../test-cases/README.md); [access-control/](../test-cases/access-control/) is the reference implementation.
   → **Approved by a developer** before anything else is written.
2. **E2E test** translated from the approved scenario — the scenario is the script, the test follows it line by line.
   → **Approved by a developer.** Committed red.
3. **Production code**, written until that test passes. No production code lands without a preceding red E2E test in history.

Negative cases are first-class: every `—` cell of the §3.2 access matrix, unflagged S7 records against both the employee and a PM, the colleague whitelist — each is its own scenario (§9 Definition of Done requires them).

## What "E2E" means here (AD-3)

Real HTTP request → real NestJS router → real access resolution → **real test database** (PostgreSQL, migrated schema, seeded fixtures).

Faked: the outbound integration ports (timetracker, PeopleForce) — rebound to fixture-backed fakes via their DI tokens in the test module (see [nestjs-di-tokens.md](nestjs-di-tokens.md)). **Live third-party calls in the E2E suite are forbidden.**

Not faked: the database, the router, authentication, the AccessControl facade, tier resolution. If the test doesn't assert what the API actually returns, it isn't a gate test.

## Test data isolation

Parallel developers and parallel CI workers never share mutable test state: each run/worker gets its own seeded slice (transactional rollback per test, or schema-per-worker). This is infrastructure, set up once — feature owners do not invent their own mechanism.

## Ownership (AD-4)

The feature owner drives their own scenario → test → code sequence. Approvals are asynchronous peer reviews — there is no dedicated test-author role, and nobody's stage 1 blocks anybody else's stage 3. One person waiting on another is a process defect (§8.2).
