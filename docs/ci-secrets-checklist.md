# CI secrets checklist

Set these at **Settings → Secrets and variables → Actions** on
`altexsoft-dmytro-novyk/workplace`. Nothing here belongs in a committed file.

## Required

### `SUBMODULES_TOKEN`

- [ ] Created
- **Needed by:** `backend-unit`, `backend-e2e`, `frontend-e2e`
- **Why:** `services/backend` and `services/frontend` are private submodules.
  `actions/checkout` authenticates with the default `GITHUB_TOKEN`, which is
  scoped to this repository only and cannot clone another private repo — the
  checkout fails at the submodule step, not at the test step.
- **What:** a fine-grained PAT with **Contents: read** on
  `altexsoft-dmytro-novyk/backend` and `altexsoft-dmytro-novyk/frontend`, or a
  classic PAT with `repo` scope.
- **Alternative:** per-submodule deploy keys, if you prefer not to tie CI to a
  user account. That needs an `ssh-agent` step instead of the `token:` input.
- **Rotation:** fine-grained PATs expire. A checkout that starts failing on all
  three jobs at once is almost always this.

### `LOCALSTACK_AUTH_TOKEN`

- [ ] Created
- **Needed by:** `backend-e2e`
- **Why:** `services/backend/docker-compose.yml` runs the LocalStack unified
  image for S3. Since 2026.03.0 it requires an auth token; the old
  `LOCALSTACK_ACKNOWLEDGE_ACCOUNT_REQUIREMENT` bypass expired 2026-04-06.
- **What:** the token from the LocalStack account (the free Hobby plan at
  localstack.cloud is enough). It is the same value already in the developer's
  uncommitted `services/backend/.env`.
- **If absent:** the job logs a `::warning::`, LocalStack does not come up, and
  the S3-backed specs fail. Everything else still runs. Because the job is
  informational this does not block anything — but the resulting reds are
  infrastructure, not code, and will pollute the evidence file.

## Not required

Every other value the backend needs in CI comes from the committed
`services/backend/.env.example`, which the job copies to `.env` before starting
docker compose. Those are local-only credentials (`postgres`/`postgres`,
`test`/`test` for the LocalStack S3 client) with no production meaning.

Do not add real `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` values here — the
suite talks to LocalStack via `AWS_ENDPOINT_URL`, never to AWS.

## Verifying

After adding both, trigger a run from **Actions → Tests → Run workflow**, then
check:

- [ ] All five jobs appear
- [ ] No job failed at the checkout step (that means `SUBMODULES_TOKEN` works)
- [ ] `backend-e2e` has no `LOCALSTACK_AUTH_TOKEN` warning
- [ ] The `live-verification-results` artifact exists and its
      `run_summary.missing_reports` is empty
