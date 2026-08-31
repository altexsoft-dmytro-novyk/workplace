---
title: 'ACM-9 — 500-target PostgreSQL baseline gate'
type: 'feature'
created: '2026-08-31'
status: 'in-progress'
review_loop_iteration: 0
baseline_commit: 'f870f7fe2c838cad78da9407c2d83170ebf83257'
context:
  - '{project-root}/_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md'
  - '{project-root}/docs/architecture/testing-strategy.md'
  - '{project-root}/_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The committed P6 measurement suite predates ACM9-MVP-v1. It overwrites reports, has no pre-fallible artifact reservation or final protocol status, combines insufficient fixture evidence, and deliberately probes a timeout; it cannot be ACM-9 evidence.

**Approach:** Add a new, isolated ACM9 measurement harness and pure testable evidence helpers. The baseline command will reserve a unique artifact before any fallible operation, measure the real public facade against migrated PostgreSQL, and publish one immutable PASS, FAIL, or INCOMPLETE result without changing authorization behavior.

## Boundaries & Constraints

**Always:** Accept only `baseline` or `final` role; run `baseline` in this dispatch. Create the artifact with exclusive creation before configuration, hash, fixture, or database work. Use canonical compact UTF-8 JSON with sorted Unicode-code-point keys, explicit null optionals, integers as plain decimals, and fixed three-decimal-place decimals; SHA-256 hashes are lowercase hexadecimal. Record source and applied-migration revisions, PostgreSQL/runtime/environment identity, topology, isolation/load policy, fixture and environment manifests, plans, query count, completed gates, first breach, and stop reason. Use 500 active targets for each independent Reporting, direct-PP, Colleague, and mixed gate at balanced depth 5 then acyclic depths 25, 50, 100, 200, 300, 400, 499. Each gate has five discarded warm-ups and twenty end-to-end `AccessControlFacade.resolveAudiences` samples; compute nearest-rank p50/p95. Run plan capture outside samples. Stop on the first p95/worst value above 2000 ms or required-facade statement timeout.

**Ask First:** Any source, migration, resolver, User Management, frontend, or behavior modification; a baseline run using an uncommitted harness; or a baseline artifact whose successful run would require an unavailable PostgreSQL capability beyond the documented environment. The `final` role may run only with a compatible PASS baseline and must not be invoked in this dispatch.

**Never:** Change `services/backend/src/access-control/**`; modify User Management, frontend, migrations, or production behavior; run or rewrite legacy P6; synthesize a timeout with `pg_sleep`; overwrite/delete a prior ACM9 artifact; treat infrastructure errors as PASS or FAIL; continue after an absolute breach.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Reservation | New `baseline` run | Unique `acm9-baseline-<run-id>.json` exists immediately with INCOMPLETE and pending stop reason | Exclusive-create collision selects a fresh ID; no existing file changes |
| Setup/query failure | Reserved artifact, failed hash/connection/fixture/query | Artifact remains auditable and finalizes INCOMPLETE with error class/message and stop reason | Exit nonzero; preserve completed evidence |
| Threshold/timeout | Any required facade gate returns p95/worst >2000 ms or SQLSTATE 57014 | Record that gate and first breach; finalize FAIL | Stop before later gate/shape samples |
| Complete baseline | All ordered gates within limits | Finalize PASS with hashes, revisions, plans, query counts and results | Append-only artifact is committed after the run |
| Final role | No compatible PASS baseline | Refuse before measurement and retain INCOMPLETE reservation | No comparison or baseline credit |

</frozen-after-approval>

## Code Map

- `services/backend/test/measurement/resolve-audiences.measurement-spec.ts:32-43,734-736` -- legacy P6 historical evidence only; retain unchanged and do not reuse its overwrite/timeout mechanics.
- `services/backend/test/jest-measurement.json:1-13` and `services/backend/package.json:27-31` -- measurement-Jest and command precedent; add ACM9-specific unit and runtime configuration/commands.
- `services/backend/test/measurement/acm9/` -- new pure manifest/artifact/statistics/status helpers, unit tests, and isolated real-PostgreSQL harness.
- `services/backend/src/access-control/application/access-control.facade.ts:25` -- public timing boundary; read-only `resolveAudiences` invocation.
- `services/backend/test/measurement/resolve-audiences.measurement-spec.ts:434-462` -- real Config/Prisma/AccessControl Nest module lifecycle precedent.
- `services/backend/prisma/schema.prisma:12,44-55` -- fixture User ownership and direct/people_partner relationship constraints; read-only.
- `services/backend/prisma/migrations/` and live `_prisma_migrations` -- local and applied migration identity sources.
- `_bmad-output/test-artifacts/performance/` -- append-only committed ACM9 evidence root.

## Tasks & Acceptance

**Execution:**
- [ ] `services/backend/test/measurement/acm9/manifest.ts` and focused specs -- define canonical manifests, SHA-256 hashing, nearest-rank percentiles, artifact reservation/finalization, status precedence, and baseline compatibility as pure units.
- [ ] `services/backend/test/measurement/acm9/acm9-baseline.measurement-spec.ts` and ACM9 Jest runtime config -- create isolated real fixtures, collect separate facade samples/plans/environment and enforce ordered immediate-stop protocol.
- [ ] `services/backend/package.json` -- expose dedicated test and `baseline` measurement commands without changing P6.
- [ ] `services/backend` -- run focused tests and commit the harness; capture its exact HEAD as the recorded source revision.
- [ ] `_bmad-output/test-artifacts/performance/` -- run only the committed baseline harness on migrated PostgreSQL; commit exactly its generated append-only artifact and advance the workspace gitlink.

**Acceptance Criteria:**
- Given a run begins, when any subsequent setup step fails, then a uniquely reserved INCOMPLETE artifact predates it and records the failure without altering another artifact.
- Given canonical-equivalent manifests, when serialized and hashed, then their bytes and lowercase SHA-256 hashes match; differing values produce a distinct hash.
- Given any first threshold breach or required timeout, when status is finalized, then it is FAIL and no subsequent shape runs; a later manifest mismatch cannot downgrade it.
- Given a non-timeout setup, fixture, query, hash, manifest, or finalization failure, when the harness exits, then its reserved artifact remains INCOMPLETE with evidence and nonzero exit.
- Given a successful baseline, when all four gate classes complete each required shape, then the artifact contains the specified counts, percentile/worst values, query/plan references, manifests, environment, source and migration revisions, and PASS status.
- Given repository history is inspected, when the harness and evidence commits are compared, then no forbidden source path or legacy P6 file changed and the evidence references the exact committed backend revision.

## Spec Change Log

## Design Notes

Use a pure artifact domain so reservation, hashing, percentile, status precedence, and final-baseline compatibility are unit-testable without PostgreSQL. Fixed three-decimal values apply only to manifest decimal fields; raw sample values remain recorded as measured. Plan records must identify the captured query source and be created outside latency samples; if plan capture cannot be performed in the real environment, the run is INCOMPLETE rather than fabricating a plan.

## Verification

**Commands:**
- `npm run test:measurement:acm9` -- expected: focused pure tests pass, including reservation and first-breach behavior.
- `npm run measure:access-control:acm9 -- --role baseline` -- expected: one new immutable artifact; PASS, FAIL, or INCOMPLETE according to measured evidence.
- `git diff --check`, focused Jest output, and `git status --short` -- expected: no whitespace errors; commits contain only allowed harness/config/evidence paths.
