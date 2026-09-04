# CI pipeline

`.github/workflows/tests.yml` runs on every pull request, every push to `main`,
and on manual dispatch.

## Jobs

| Job                              | Gates a merge? | What it runs                                                       |
| -------------------------------- | -------------- | ------------------------------------------------------------------ |
| `Workspace · ClickUp sync`       | **Yes**        | `npm run test:clickup` — the workspace sync suite                   |
| `Backend · unit (informational)` | No             | `npm test` in `services/backend`                                    |
| `Backend · e2e (informational)`  | No             | `npm run test:e2e` against Postgres + LocalStack in docker compose  |
| `Frontend · Playwright (informational)` | No      | `npm test` in `services/frontend` (chromium)                        |
| `Live verification evidence`     | No             | Aggregates the three reports into `live-verification-results.json`  |

## Why three of them are informational

The project follows **AD-1**: a Stage-2 test is committed red, and the
production code is written against it afterwards. Mentorship (~29 cases) has no
module under `src/` at all, and there are 19 `it.todo` placeholders on top of
that. A red result there is the process working, not a regression.

So those three jobs carry `continue-on-error: true` at the job level. They run,
they publish, their conclusion stays neutral, and no branch protection rule can
block a merge on them. The point of the first runs is to see the **actual**
red/green for the first time — until now it has only ever been inferred from
which files exist.

This is a deliberate, temporary departure from the TEA guidance that a gate must
be able to fail. **Promote a suite to a real gate by deleting its
`continue-on-error: true` line** — and add it to the branch protection required
checks — once that suite is meant to be green.

## Live verification evidence

`/bmad-testarch-trace` currently runs in `contract_static` mode: a requirement
counts as covered because a spec file mentioning it exists, not because anything
ran. Feeding it observed results moves it to `live` evidence.

The `Live verification evidence` job downloads the three runner reports and calls
[`scripts/build-live-verification-results.cjs`](../scripts/build-live-verification-results.cjs),
which writes `_bmad-output/test-artifacts/live-verification-results.json` in the
schema trace expects. It maps each executed test to a requirement two ways:

1. exact `(file, title)` lookup against the newest
   `_bmad-output/test-artifacts/tea-trace-coverage-matrix*.json`;
2. failing that, the first oracle ID found in the test's title chain, innermost
   describe first (`um-rel-09-pp-atomic-replace.md` → `UM-REL-09`). A single
   trailing letter is treated as a sub-case of the same scenario, so
   `men-end-04a`/`04b`/`04c` all resolve to `MEN-END-04`; where the oracle
   carries the lettered form as its own document (`um-auth-02b-…md`), the longer
   ID wins. A trailing digit never merges — `UM-REL-1` stays distinct from
   `UM-REL-15`.

Tests that match neither are counted in `unmatched_summary` and deliberately
kept **out** of `results`: trace records every unmatched entry as a blocker, and
the 133-case frontend suite carries no oracle IDs at all today.

`unmatched_summary` is the triage input, so it is complete rather than sampled:
`by_file` ranks the files with the most unmatched cases, and `cases` lists every
one. Expect three kinds in there — tests that should carry an oracle ID and
don't, tests asserting internals rather than a requirement, and framework
scaffold tests (`should be defined`). Only the first kind is worth acting on.

### Using it

Download the `live-verification-results` artifact from the run, drop it in
`_bmad-output/test-artifacts/`, and re-run `/bmad-testarch-trace`.

```bash
gh run download <run-id> -n live-verification-results -D _bmad-output/test-artifacts/
```

**The `source_sha` has to match the commit you trace.** Trace compares the
recorded sha against `git rev-parse HEAD` in the workspace and treats a mismatch
as `stale` — which counts as no coverage. The job records the PR branch head
(not GitHub's ephemeral merge commit), so the artifact matches a workspace
checked out at that branch head. Re-running the suite after a new commit is the
only way to refresh it.

You can also produce the file locally:

```bash
node scripts/build-live-verification-results.cjs \
  --jest reports/backend-unit.json --suite backend-unit \
  --jest reports/backend-e2e.json --suite backend-e2e \
  --playwright reports/frontend-e2e.json --suite frontend-e2e
```

## Reproducing the backend e2e environment locally

```bash
./scripts/ci-local.sh
```

It mirrors what the CI job does: materialise `.env`, bring up docker compose,
apply migrations, run the suite, write a jest JSON report.

## Deliberately not configured yet

- **Sharding.** The backend e2e suite runs `--runInBand` against one shared
  Postgres, so it cannot be split without per-shard databases. The frontend
  suite could shard, but fragmenting the JSON reports would complicate evidence
  aggregation before the first clean run exists. Revisit once runtimes hurt.
- **Burn-in.** Flake detection needs a stable baseline to be meaningful; a suite
  that is red on purpose has none. `@seontechnologies/playwright-utils` is also
  not a dependency, so the `runBurnIn` selector the TEA guidance prefers is not
  available. Revisit after the first suite is promoted to a gate.
- **Contract testing.** `tea_use_pactjs_utils` is on in `_bmad/tea/config.yaml`,
  but the repo has no pact directory, no `.pacttest.ts` files, and neither
  `@pact-foundation/pact` nor `@seontechnologies/pactjs-utils` as a dependency.
  Wiring the jobs in now would fail every build on a missing script.

## Troubleshooting

**Submodules fail to clone.** `services/backend` and `services/frontend` are
private repos. The default `GITHUB_TOKEN` cannot read another private repo, so
the checkout needs the `SUBMODULES_TOKEN` secret — see
[ci-secrets-checklist.md](./ci-secrets-checklist.md).

**LocalStack does not start.** Missing `LOCALSTACK_AUTH_TOKEN`. The job emits a
`::warning::` and continues; S3-backed specs then fail. The 2026.03.0+ image
requires the token — the old no-token bypass expired 2026-04-06.

**`live-verification-results.json` has `cases_mapped: 0`.** Check
`run_summary.missing_reports` first — a job that died before writing its report
contributes nothing. If reports are present, check `run_summary.matrix_used`:
the coverage matrix is how most tests resolve, and a stale one loses matches.

**Trace still says `contract_static`.** It reads the file only from
`_bmad-output/test-artifacts/live-verification-results.json`, and only counts
results whose `source_sha` matches the traced commit.
