# Architecture Rules — People Management Platform

**Status: reset, pending redesign.** The prior architecture spine and its rendered rule files for `user-management` and `access-control` were removed on 2026-08-30 at the user's direction, to be redecided from [project-requirements.md](../project-requirements.md) without carrying forward prior design choices.

**Kept as-is, not part of this reset:**
- [testing-strategy.md](testing-strategy.md) — the three-stage TDD quality gate and no-self-certification rule remain in force for all new work.
- [custom-fields.md](custom-fields.md), [dashboards.md](dashboards.md) — out of scope for this reset; untouched.
- [user-management-test-decisions.md](user-management-test-decisions.md) — kept, to be reconciled once new decisions land.
- `docs/test-cases/**` — scenario docs remain the source of truth for behavior; new implementation must satisfy them.

## Files

| File | Status |
| --- | --- |
| [domain-driven-design.md](domain-driven-design.md) | stub — pending redesign |
| [testing-strategy.md](testing-strategy.md) | unchanged |
| [database-schema.md](database-schema.md) | stub — pending redesign |
| [api-conventions.md](api-conventions.md) | stub — pending redesign |
| [user-management-test-decisions.md](user-management-test-decisions.md) | unchanged, pending reconciliation |
| [nestjs-di-tokens.md](nestjs-di-tokens.md) | stub — pending redesign |
| [custom-fields.md](custom-fields.md) | **Not yet decided — do not build** | — |
| [dashboards.md](dashboards.md) | out of scope for this reset |
