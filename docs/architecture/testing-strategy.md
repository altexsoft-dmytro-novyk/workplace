# Testing Strategy — the Three-Stage Gate

Binding rules for how every feature is built. Spine: AD-1, AD-3, AD-4, AD-15.

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

### No self-certification — a stage is never approved by the agent that wrote it

This already went wrong once: a single agent dispatch wrote the scenario doc, the E2E tests, and the production code back to back, then wrote in its own report that it had "reviewed the scenario docs against the spec" and treated that self-review as the stage-1 approval. No human saw the tests before code existed. That is a gate violation even though every file technically appeared in the documented order.

- **"Approved by a developer" means a human sees the actual artifact and says so.** An agent's review of its own prior output is never a substitute, no matter how the report phrases it ("reviewed," "validated," "confirmed against spec," etc.).
- **No single dispatch may span more than one stage.** Write the scenario doc, then stop. Surface the full scenario text and wait for an explicit human approval. Write the E2E test, then stop. Surface the actual test file content and wait for explicit human approval. Only then write production code.
- This holds under time or token pressure, and even when the workflow you're following doesn't itself force a pause between steps — AD-1 overrides the default cadence of any generic build workflow, every time, for every feature.

### Done means built for real, not merely green (AD-15)

A story's tests passing is not proof the story is finished if a fake is what made them pass. Before marking any story complete, check every port its own acceptance criteria exercise: if the port's real adapter is this story's job, it must be real (see [domain-driven-design.md's fakes/mocks scope rule](domain-driven-design.md#fakes-mocks-and-stubs--scope-test-ad-15)); a fake is only legitimate standing in for a different, not-yet-built story/epic/context's dependency.

Negative cases are first-class: every `—` cell of the §3.2 access matrix, unflagged S7 records against both the employee and a PM, the colleague whitelist — each is its own scenario (§9 Definition of Done requires them).

## What "E2E" means here (AD-3)

Real HTTP request → real NestJS router → real access resolution → **real test database** (PostgreSQL, migrated schema, seeded fixtures).

Faked: the outbound integration ports (timetracker, PeopleForce) — rebound to fixture-backed fakes via their DI tokens in the test module (see [nestjs-di-tokens.md](nestjs-di-tokens.md)). **Live third-party calls in the E2E suite are forbidden.**

Not faked: the database, the router, authentication, the AccessControl facade, tier resolution. If the test doesn't assert what the API actually returns, it isn't a gate test.

## Test data isolation (DEC-UM-010)

Gate E2E for `user-management` follows an approved two-phase progression:

1. **Initial (active now):** Run the Playwright suite with **one test worker**. Each run/test uses a collision-proof UUID namespace and deletes only data it owns. Concurrency scenarios (`@concurrency`) issue parallel HTTP inside one isolated test via `Promise.all`; they do not require multiple test workers.
2. **Before enabling parallel test workers:** Provision **one PostgreSQL schema per worker** and clean up that schema after the run. `Date.now()` prefix alone is not sufficient.

Parallel developers never share mutable test state across workers. This is platform infrastructure — feature owners do not invent ad-hoc isolation per story.

## Ownership (AD-4)

The feature owner drives their own scenario → test → code sequence. Approvals are asynchronous peer reviews — there is no dedicated test-author role, and nobody's stage 1 blocks anybody else's stage 3. One person waiting on another is a process defect (§8.2).
