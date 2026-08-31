# P6 PostgreSQL resolveAudiences measurement

Generated: 2026-08-30T18:17:06.998Z

## Scope and protocol

- Measurement only; no production code or CI timing threshold changed.
- Fixture: 500 active synthetic users; balanced branching factor 4, depth 5; the same users were deterministically rewired for acyclic chain depths 25, 50, 100, 200, 300, 400, 499.
- Cold: first call before scenario-specific warm-up. Shared PostgreSQL buffers may remain warm from earlier scenarios.
- Warm-up: 5 identical discarded calls. Warm samples: 20. Percentiles: nearest-rank.
- Planner statistics: `ANALYZE "relationships"` ran after every graph reshape.
- Untimed correctness guard: every target key was present; root-viewer scenarios required self/reporting for every target.
- Timing values are milliseconds. Columns use p50 / p95 / worst.

## Runtime

- Node: v24.18.0
- OS: darwin 25.6.0 arm64
- CPU: 18 available parallelism; 18 logical cores; Apple M5 Pro
- Memory: 51539607552 bytes total; 6450921472 bytes free at report time
- PostgreSQL server: 18.6
- PostgreSQL build: PostgreSQL 18.6 on aarch64-unknown-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit

## Results

| Scenario | Shape | Depth | Targets | Cold outcome / total ms | Warm total p50 / p95 / worst | Warm transaction p50 / p95 / worst | Warm facade overhead p50 / p95 / worst |
|---|---:|---:|---:|---:|---:|---:|---:|
| balanced-one-target | balanced | 5 | 1 | success / 6.055 | 2.549 / 2.799 / 2.824 | 2.542 / 2.794 / 2.819 | 0.006 / 0.011 / 0.014 |
| balanced-100-targets | balanced | 5 | 100 | success / 10.836 | 10.203 / 11.265 / 14.182 | 10.161 / 11.221 / 14.137 | 0.042 / 0.048 / 0.054 |
| balanced-500-targets | balanced | 5 | 500 | success / 38.420 | 38.776 / 41.790 / 41.809 | 38.440 / 41.429 / 41.590 | 0.318 / 0.380 / 0.389 |
| viewer-near-top-500-targets | balanced | 5 | 500 | success / 37.338 | 40.039 / 41.120 / 41.212 | 39.628 / 40.764 / 40.835 | 0.367 / 0.494 / 0.503 |
| targets-at-different-depths | balanced | 5 | 5 | success / 4.882 | 3.228 / 4.002 / 4.849 | 3.219 / 3.986 / 4.837 | 0.012 / 0.017 / 0.019 |
| acyclic-chain-depth-25 | acyclic_chain | 25 | 500 | success / 37.507 | 38.898 / 40.075 / 40.761 | 38.524 / 39.661 / 40.548 | 0.352 / 0.484 / 0.517 |
| acyclic-chain-depth-50 | acyclic_chain | 50 | 500 | success / 37.707 | 39.889 / 41.109 / 41.818 | 39.360 / 40.463 / 41.461 | 0.377 / 0.540 / 0.646 |
| acyclic-chain-depth-100 | acyclic_chain | 100 | 500 | success / 40.447 | 42.617 / 44.941 / 45.044 | 42.233 / 44.476 / 44.550 | 0.347 / 0.494 / 0.578 |
| acyclic-chain-depth-200 | acyclic_chain | 200 | 500 | success / 52.698 | 56.277 / 57.400 / 58.056 | 55.890 / 57.087 / 57.731 | 0.357 / 0.470 / 1.014 |
| acyclic-chain-depth-300 | acyclic_chain | 300 | 500 | success / 77.296 | 77.910 / 80.342 / 80.562 | 77.742 / 80.026 / 80.221 | 0.329 / 0.446 / 0.509 |
| acyclic-chain-depth-400 | acyclic_chain | 400 | 500 | success / 107.825 | 108.151 / 109.515 / 109.994 | 107.792 / 109.188 / 109.698 | 0.387 / 0.523 / 0.527 |
| worst-valid-acyclic-chain | acyclic_chain | 499 | 500 | success / 147.754 | 148.793 / 161.165 / 163.508 | 148.547 / 160.869 / 163.323 | 0.273 / 0.512 / 0.516 |

The transaction measurement is the full RelationshipGraphPort call: interactive transaction setup, SET LOCAL, reporting query, People Partner query, commit, and mapping. Individual production statements are not separately observable without production instrumentation.

No tested valid acyclic shape exceeded the two-second total facade-call budget.

## Timeout probe

- Exact command under test: `SET LOCAL statement_timeout = '2s'`
- Probe statement: `SELECT pg_sleep(2.2)`
- Database-only result: statement_timeout after 2054.437 ms.
- Equal-budget competition: first failure was outer_timeout after 2001.103 ms; eventual database outcome was statement_timeout after 2006.536 ms.
- Conclusion: The outer two-second request-budget timer fired before PostgreSQL statement_timeout; the database cancellation arrived later.

## Reproduction

```bash
source "$HOME/.nvm/nvm.sh"
nvm use system
cd services/backend
npm run db:up
npm run db:deploy
npm run measure:access-control:p6
```

The benchmark is selected only by `test/jest-measurement.json`. Normal `npm test` and `npm run test:e2e` patterns do not include `*.measurement-spec.ts`.

## Generated files

- `services/backend/test/jest-measurement.json`
- `services/backend/test/measurement/resolve-audiences.measurement-spec.ts`
- `services/backend/package.json`
- `_bmad-output/test-artifacts/performance/p6-resolve-audiences-postgresql.md`
- `_bmad-output/test-artifacts/performance/p6-resolve-audiences-postgresql.json`
