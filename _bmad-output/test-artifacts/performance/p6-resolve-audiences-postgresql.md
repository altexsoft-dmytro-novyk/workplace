# P6 PostgreSQL resolveAudiences measurement

Generated: 2026-09-06T19:14:12.772Z

## Scope and protocol

- Measurement only; no production code or CI timing threshold changed.
- Fixture: 500 active synthetic users; balanced branching factor 4, depth 5; the same users were deterministically rewired for acyclic chain depths 25, 50, 100, 200, 300, 400, 499.
- Cold: first call before scenario-specific warm-up. Shared PostgreSQL buffers may remain warm from earlier scenarios.
- Warm-up: 5 identical discarded calls. Warm samples: 20. Percentiles: nearest-rank.
- Planner statistics: `ANALYZE "relationships"` ran after every graph reshape.
- Untimed correctness guard: every target key was present; root-viewer scenarios required self/reporting for every target.
- Timing values are milliseconds. Columns use p50 / p95 / worst.

## Runtime

- Node: v24.20.0
- OS: darwin 25.6.0 arm64
- CPU: 18 available parallelism; 18 logical cores; Apple M5 Pro
- Memory: 51539607552 bytes total; 1911635968 bytes free at report time
- PostgreSQL server: 18.6
- PostgreSQL build: PostgreSQL 18.6 on aarch64-unknown-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit

## Results

| Scenario | Shape | Depth | Targets | Cold outcome / total ms | Warm total p50 / p95 / worst | Warm transaction p50 / p95 / worst | Warm facade overhead p50 / p95 / worst |
|---|---:|---:|---:|---:|---:|---:|---:|
| balanced-one-target | balanced | 5 | 1 | success / 6.103 | 1.900 / 2.174 / 2.410 | 1.633 / 1.847 / 2.004 | 0.292 / 0.364 / 0.406 |
| balanced-100-targets | balanced | 5 | 100 | success / 4.199 | 3.742 / 4.330 / 4.596 | 3.034 / 3.546 / 3.810 | 0.712 / 0.864 / 0.877 |
| balanced-500-targets | balanced | 5 | 500 | success / 9.014 | 8.853 / 9.139 / 9.400 | 6.687 / 6.917 / 6.940 | 2.128 / 2.223 / 2.720 |
| viewer-near-top-500-targets | balanced | 5 | 500 | success / 9.648 | 8.965 / 9.556 / 10.018 | 6.801 / 7.418 / 7.712 | 2.120 / 2.307 / 2.525 |
| targets-at-different-depths | balanced | 5 | 5 | success / 3.660 | 3.127 / 4.601 / 4.742 | 2.792 / 4.087 / 4.417 | 0.314 / 0.518 / 0.551 |
| acyclic-chain-depth-25 | acyclic_chain | 25 | 500 | success / 8.085 | 8.452 / 9.097 / 10.085 | 6.227 / 6.842 / 6.871 | 2.222 / 2.359 / 3.243 |
| acyclic-chain-depth-50 | acyclic_chain | 50 | 500 | success / 10.697 | 10.422 / 10.797 / 11.539 | 8.163 / 8.422 / 8.470 | 2.369 / 2.460 / 3.070 |
| acyclic-chain-depth-100 | acyclic_chain | 100 | 500 | success / 22.889 | 17.670 / 19.305 / 19.428 | 15.663 / 17.319 / 17.406 | 1.999 / 2.317 / 2.580 |
| acyclic-chain-depth-200 | acyclic_chain | 200 | 500 | success / 73.504 | 77.037 / 78.805 / 79.151 | 72.466 / 74.673 / 75.271 | 4.547 / 5.080 / 5.142 |
| acyclic-chain-depth-300 | acyclic_chain | 300 | 500 | success / 211.071 | 209.275 / 216.346 / 234.887 | 204.720 / 212.442 / 230.357 | 4.579 / 4.974 / 5.080 |
| acyclic-chain-depth-400 | acyclic_chain | 400 | 500 | success / 484.954 | 490.322 / 524.259 / 534.414 | 484.823 / 519.890 / 529.483 | 5.273 / 6.324 / 7.105 |
| worst-valid-acyclic-chain | acyclic_chain | 499 | 500 | success / 957.013 | 960.940 / 983.087 / 984.351 | 955.547 / 977.840 / 981.965 | 5.688 / 5.985 / 6.299 |

The transaction measurement is the full RelationshipGraphPort call: interactive transaction setup, SET LOCAL, reporting query, People Partner query, commit, and mapping. Individual production statements are not separately observable without production instrumentation.

No tested valid acyclic shape exceeded the two-second total facade-call budget.

## Timeout probe

- Exact command under test: `SET LOCAL statement_timeout = '2s'`
- Probe statement: `SELECT pg_sleep(2.2)`
- Database-only result: statement_timeout after 2059.963 ms.
- Equal-budget competition: first failure was outer_timeout after 2000.361 ms; eventual database outcome was statement_timeout after 2009.190 ms.
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
