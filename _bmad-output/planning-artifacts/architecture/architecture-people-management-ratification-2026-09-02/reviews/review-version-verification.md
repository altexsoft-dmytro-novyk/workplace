---
title: Reviewer Gate — Version / Reality-Verification Lens
target: architecture-people-management-ratification-2026-09-02
target_revision: 2026-09-02-reviewer-gate-update
lens: version-and-reality-verification
reviewed_at: 2026-09-02
verdict: PASS WITH FINDINGS
repo_root: /Users/home/bootcamp/workplace
---

# Reviewer Gate — Version / Reality-Verification Lens

## Scope of this lens

This review answers one question only: **was each committed claim reality-checked, or was it asserted?** It checks named technologies and versions against the installed toolchain and the live web, the commit-SHA pins against git, the external-contract claims against the actual OpenAPI file, and `gate-decision.json` against its own contents.

It does **not** re-review architecture correctness, blocker severity, ownership, or the register's internal consistency. Other lenses own those.

Method: every finding below was produced by running a command against the working tree or by fetching a live vendor source. Assumptions are labelled as such and separated from confirmed findings.

## Verdict

**PASS WITH FINDINGS.**

The commit-pin discipline this revision introduced is real and mostly correct: all three SHAs exist, the superproject SHA is the true HEAD, both submodule SHAs match `git submodule status`, and 48 of the 49 evidence paths cited across the three YAML files resolve at their pinned SHAs. The submodule dirty-only-from-untracked caveat is true as stated, down to the named files. Line-number pins are exact rather than approximate everywhere I spot-checked. That is materially better than an asserted baseline.

The failures are concentrated in two places:

1. **One of the three pins is not durable.** The backend SHA exists on no branch, no tag, and no remote. It is not reproducible off this machine.
2. **The Stack table was not reality-checked at all.** One of its four rows is factually wrong, two are not versions, and the row that is correct is correct by luck of being pinned in a lockfile. The revision log claims every finding was "independently re-verified against the working tree at the pinned SHAs" — no version claim shows evidence of having been verified against the installed toolchain or an upstream release source.

The package's own carried finding about NestJS v12 is **confirmed correct**. Two new High findings are raised that the package does not carry.

---

## Tier 1 — High (undermines the reproducibility the package claims for itself)

### F-1 · The backend evidence pin is reachable from no ref and is not pushed

**Confirmed.** `evidence_baseline.services_backend: 08931ad14778f1953ca551c0e25c782afa4ccb1b` (frontmatter line 23).

```
$ git -C services/backend for-each-ref --contains 08931ad14778f1953ca551c0e25c782afa4ccb1b
(no output)
$ git -C services/backend rev-parse --abbrev-ref HEAD
HEAD                                   # detached
$ git -C services/backend merge-base --is-ancestor 08931ad origin/main; echo $?
1                                      # NOT an ancestor
$ git -C services/backend merge-base --is-ancestor 08931ad origin/UM-AC-vibe; echo $?
1                                      # NOT an ancestor
$ git -C services/backend rev-list --count origin/main..HEAD
45
```

The commit sits on **zero refs** — no local branch, no remote-tracking branch, no tag. It is 45 commits ahead of `origin/main` and is an ancestor of nothing. It survives only as (a) the submodule's detached `HEAD` in this one working copy and (b) the gitlink in superproject commit `0e703d1`.

Note that `git submodule status` reports `heads/worktree-agent-ae2fb1b6bbebfc029-3-g08931ad`, which reads like a branch name but is `git describe` output. It is not a branch. Do not treat that string as evidence of a ref.

**Consequence.** The frontmatter caveat concludes "every code-evidence claim in this package is reproducible at the pinned SHAs" (line 27). That is true today on this machine and false anywhere else. Because `.gitmodules` declares `branch = main` for `services/backend`, a routine `git submodule update --remote`, a `git checkout main` inside the submodule, or a fresh clone by any second reader leaves the pin unresolvable and eventually garbage-collected. Everything anchored to backend code goes with it: all four `SEC-AUTH-01` P0 line pins, the AD-7 and AD-8 downgrades (the two substantive register changes in this revision), and every `services/backend/**` path in `evidence-matrix.yaml`.

**Contrast — the other two pins are durable.** Superproject `0e703d1` is on `refs/heads/main`, `refs/remotes/origin/main`, and `refs/tags/backup-before-revert-20260902-0439`, with `origin/main...HEAD` = `0 0`. Frontend `d06b977` is on `refs/heads/main` and is an ancestor of `origin/main`. So this is a defect in one pin, not in the pinning approach.

**Recommended action.** Push `08931ad` to a durable ref on `origin` (a `ratification-baseline-2026-09-02` tag is the cheapest option and is immune to branch movement) and record the ref name alongside the SHA in the frontmatter. Until that is done, the caveat must be downgraded to state that the backend baseline exists only in a local detached working copy. Treat this as blocking for the package's reproducibility claim, not for its architectural conclusions.

### F-2 · The single most load-bearing external-contract artifact does not exist at its pinned SHA

**Confirmed.** I resolved all 49 distinct evidence paths cited in `blockers.yaml`, `evidence-matrix.yaml`, and `transition-debt.yaml` against their respective pinned SHAs. Exactly one is missing:

```
NOT_IN_WORKPLACE_PIN: docs/integrations/timetracker-external-api.json
```

```
$ git cat-file -e 0e703d19150b4727c1f2b42e2f359df9995735dc:docs/integrations/timetracker-external-api.json
fatal: path 'docs/integrations/timetracker-external-api.json' does not exist in '0e703d1...'
$ git status --short -- docs/
?? docs/integrations/
$ ls -l docs/integrations/timetracker-external-api.json
-rw-r--r--  1 home  staff  12517 Sep  2 05:57 timetracker-external-api.json
```

The file is **untracked**, has no commit provenance anywhere in the superproject's history, and was last written at 05:57 on the ratification date. Five blockers rest on it, one of them P0: `TIMETRACKER-CONTRACT` (`blockers.yaml:82`), `TT-IDENTITY-01` (`:375`, P0), `TT-PMDM-01` (`:398`), `OPERATIONAL-ENVELOPE` (`:352`), and `DEPARTMENT-EDGE`'s newly recorded "supplies no department concept" note (`:207-210`).

**Consequence.** `TIMETRACKER-CONTRACT` was moved to `superseded` on the stated grounds that "the delivered contract resolves this entry's 'no contract in repo' premise" (`blockers.yaml:84`). Verified literally, the premise is *still true of the pinned baseline* — there is no contract in the repo at `0e703d1`. The supersession, and the two successor blockers derived from it, are the only conclusions in the package that cannot be reproduced by a second reader at the stated evidence baseline. Separately, §7.1's rule that nothing was closed on "another artifact merely asserting 'resolved'" is satisfied in spirit — the file's contents are real and its claims check out (see Tier 4) — but the artifact itself has no more provenance than an assertion.

**Recommended action.** Commit `docs/integrations/timetracker-external-api.json` and re-pin `evidence_baseline.workplace`, or record explicitly that this evidence sits outside the pinned baseline and note its source and retrieval date. Do not leave a P0 blocker's sole evidence untracked.

### F-3 · The installed Node runtime violates both the spine's Stack row and the backend's own engine constraint

**Confirmed.** Nothing in the package checked the runtime.

| Source | Declares | Path |
|---|---|---|
| Spine Stack table | `TypeScript / Node.js \| current LTS` | `ARCHITECTURE-SPINE.md:220` |
| Backend `engines` | `"node": ">=24"` | `services/backend/package.json:9` |
| Backend types | `"@types/node": "^26.3.0"` | `services/backend/package.json:63` |
| Frontend types | `"@types/node": "^24.13.2"` | `services/frontend/package.json:41` |
| **Actually installed** | **`v22.23.2`** | `node -v` |

Live upstream check ([nodejs/Release](https://github.com/nodejs/Release/blob/main/README.md), [endoflife.date/nodejs](https://endoflife.date/nodejs)): as of 2026-09-02, **24.x is Active LTS** (until 2026-10-20); **22.x has been Maintenance LTS since 2025-10-21** (EOL 2027-04-30); 26.x is Current and becomes Active LTS 2026-10-28.

So, three independent problems:

1. The installed runtime **does not satisfy `engines.node: ">=24"`**. Any `npm install` that enforces engines, or any CI image built to the declared constraint, is running a different major than the machine that produced this package's code evidence.
2. The spine's "current LTS" is **not met** — v22 is maintenance, not current LTS.
3. `@types/node@^26` types a runtime **two majors newer** than what executes, and the frontend declares a third major (`^24`). Type-level Node API availability is therefore unverified against the runtime in either service.

**Consequence.** Every backend code-evidence observation in `evidence-matrix.yaml` was produced on an out-of-support-window runtime that the project's own manifest forbids. That does not invalidate the static reads (schema lines, adapter logic), but it does invalidate any claim about runtime behaviour, and it means the test evidence underneath `QUALITY-GATE-AC` was produced on an unratified runtime. This belongs in `OPERATIONAL-ENVELOPE` — the blocker lists hosting, topology, and worker process topology but says nothing about a pinned runtime major.

**Recommended action.** Decide and pin one Node major; align `engines`, `@types/node` in both services, and CI to it; add "Node.js runtime major, pinned and enforced in CI" to `OPERATIONAL-ENVELOPE`'s `blocks:` list. State the version in the Stack table instead of "current LTS", which silently drifts every October.

---

## Tier 2 — Medium (asserted rather than verified; changes what a reader would conclude)

### F-4 · The NestJS v12 ESM rationale is refuted — the package's carried finding is CONFIRMED, but understated

**Confirmed, and the package is right.** Spine `ARCHITECTURE-SPINE.md:221` reads:

> `| NestJS | 11.x retained for the current CommonJS backend; v12 requires a separate planned ESM migration |`

Live upstream check:

- [nestjs/nest v12.0.0 release notes](https://github.com/nestjs/nest/releases/tag/v12.0.0): "Existing CommonJS applications keep working — migrating your own code to ESM is entirely optional." The breaking-change table entry for "Packages ship as **ESM**" says "Usually nothing — `require(esm)` keeps CommonJS apps working."
- [NestJS migration guide](https://docs.nestjs.com/migration-guide): "a CommonJS application can upgrade to v12 and stay CommonJS for as long as you like — `nest upgrade` deliberately leaves your module format alone." The ESM sections are marked *Optional* and placed last precisely because they are not part of upgrading.
- [Trilon, NestJS v12 is Now Available](https://trilon.io/blog/nestjs-12-is-now-available): "Nobody is being forced into ESM overnight… CommonJS projects remain fully supported."

So the stated rationale — that v12 *requires* an ESM migration — is **false**. `ARCHITECTURE-RATIFICATION.md:273` already carries this as an unfixed finding needing a spine edit. That is the correct call and I confirm it.

Two things the carried finding misses, both of which matter to whoever writes the amendment:

- **v12 is GA, not upcoming.** `npm view @nestjs/core dist-tags.latest` → **`12.0.1`**, published **2026-08-27** — six days before this ratification. Installed is `11.2.3` (`services/backend/package-lock.json`, `node_modules/@nestjs/core/package.json`). Staying on 11.x is now a deliberate n-1 posture, not a wait for an unreleased major, and the Stack row does not say so.
- **The real v12 gate is a Node floor, and F-3 puts the project on the wrong side of the project's own manifest.** v12 requires Node `>=20.19` or `>=22.12`; the installed `v22.23.2` satisfies it, while the declared `engines.node: ">=24"` overshoots it. The actual v12 breaking changes that would touch this repo are unrelated to ESM: `@nestjs/config` validating through Standard Schema (needs Joi ≥18 — `package.json:48` already has `^18.2.5`), lifecycle-hook ordering by component hierarchy, generic `ArgumentMetadata` in custom pipes, and `ConsoleLogger` structured params defaulting on.

**Not a finding:** `services/backend/prisma/schema.prisma:4-5` carries the comment "NestJS runs on CommonJS — without this the generated client is ESM and breaks the build" with `moduleFormat = "cjs"`. That is a genuine Prisma-generator requirement for a CommonJS build and is independent of the Nest v12 question. It stands.

**Recommended action.** In the spine amendment, replace the false constraint with the true one: "11.x retained; v12 is GA and CommonJS-compatible via `require(esm)`, so the upgrade is scheduled work, not a blocked migration. Gates: Node ≥22.12, Joi ≥18, lifecycle-hook ordering review." Do not let the corrected row silently become "v12 deferred, reason TBD".

### F-5 · The Stack table's TypeScript entry is not a pin, and the two services are two majors apart

**Confirmed.** `ARCHITECTURE-SPINE.md:220` gives TypeScript and Node.js a single shared version cell reading `current LTS`. **TypeScript has no LTS channel** — the cell is unfalsifiable as written. Reality:

| | Declared | Lock-resolved | npm `latest` |
|---|---|---|---|
| Backend | `^6.0.3` (`package.json:79`) | `6.0.3` | `7.0.2` (published 2026-07-08) |
| Frontend | `~5.7.2` (`package.json:51`) | — | `7.0.2` |

Backend is one major behind current stable; frontend is two majors behind and diverges from backend. The spine pins neither.

**Consequence.** No reviewer can pass or fail the Stack table's TypeScript claim, and a cross-service shared-types or DTO-contract decision — `OQ-118`'s `{data, canEdit}` envelope is exactly that — has no version anchor to bind to. Two teams can each satisfy the Stack table on different compilers.

**Recommended action.** Split the cell. State a TypeScript major per service and a Node major once, both verifiable.

### F-6 · The entire frontend stack is unnamed in the Stack table, yet a frontend evidence SHA is pinned and frontend conclusions are drawn

**Confirmed.** `rg -n 'React|Vite|Tailwind|frontend|Playwright' ARCHITECTURE-SPINE.md` returns **only** line 220 (`TypeScript / Node.js`). The Stack table names no frontend technology at all.

Meanwhile the package pins `evidence_baseline.services_frontend` (frontmatter line 24) and asserts a frontend conclusion in §4.2 ("People Management frontend features" absent). The actual, unratified installed frontend stack (`services/frontend/package.json`): React `19.2.7`, Vite `8.1.0`, Tailwind `4.3.1`, `radix-ui` `1.6.0`, TanStack Query `5.101.2`, `i18next` `26.3.4`, `react-router-dom` `7.18.0`, Playwright `1.61.1`, ESLint `10.5.0`, `axios` `1.18.1`.

This is the **same class of defect** as the operational-envelope gap this revision did add to §3.1: a whole dimension the initiative altitude owns, silent across all four package files, with no owner. §3.1's own justification — "only [recording it] stops two teams one level down picking different answers without either contradicting a ratified document" — applies verbatim to the frontend stack. It was not recorded.

Related, and also unstated: **the frontend submodule has exactly one commit.**

```
$ git -C services/frontend rev-list --count HEAD
1
$ git -C services/frontend log --oneline
d06b977 init      # 2026-08-18
```

So the pinned frontend baseline is a single scaffold commit from two weeks before ratification. §4.2's "People Management frontend features" absent is true but reads as an incremental gap; the reality is that there is no frontend delivery history at all. A reader deciding sequencing should be told that.

**Recommended action.** Either add a frontend row to the Stack table via the same spine amendment as F-4, or add a `frontend-stack` dimension to §3.1 with a named owner, matching how `operational-envelope` was handled. Record the one-commit frontend baseline in §4.2.

### F-7 · "No leaves endpoint" is literally true but invites the wrong conclusion — leave *data* is present in the contract

**Confirmed, with a correction to emphasis.** `blockers.yaml:90` and `:92` state "The leaves endpoint remains absent from the delivered OpenAPI contract" as a remaining gap. Path-wise this is true; there are only two paths and neither is a leaves endpoint.

But leave and absence data **is** in the contract. `DayStatus` (`docs/integrations/timetracker-external-api.json:144-146`) is an integer enum with `x-enum-varnames`:

```
Vacation, UnpaidLeave, Sick, OneDaySick, WorkingDay, Holiday, Weekend,
RemoteWorkingDay, WorkingHolidayWeekend, RemoteWorkingHolidayWeekend,
CompensatedDayOff, AdditionalWorkingDay, VacationBlockedDay
```

It is surfaced per employee per day via `WorkingDay.dayStatus` (required) on the `POST /api/accounting/report` response, alongside `Employee.id`, `Employee.email`, and `WorkingDay.date`.

**Consequence.** The spine's Deferred list (`ARCHITECTURE-SPINE.md:312`) fixes `GET /users/:id/leaves` as a read route with no write path. A reader taking "the leaves endpoint remains absent" at face value concludes there is no upstream source for S10 and defers it as unsourced. In fact a plausible source exists — behind the *Accounting* partner key, requiring `month` + `year`, and returning only employees with time entries in that period. That is precisely the same constrained bridge `TT-IDENTITY-01` already flags for identity, so the two questions should be decided together rather than one being recorded as "no endpoint".

**Recommended action.** Reword to "no dedicated leaves endpoint; leave state is only derivable from `WorkingDay.dayStatus` on the Accounting report, under the same partner-key and month/year constraints as `TT-IDENTITY-01`", and note the dependency on `TT-IDENTITY-01`.

---

## Tier 3 — Low (imprecise wording or an unpinned dependency; no wrong conclusion follows)

### F-8 · "No write or reassignment operation exists" — a POST does exist

`blockers.yaml:86-87` states "no write or reassignment operation exists". There is a POST: `POST /api/accounting/report` (`operationId: postAccountingReport`, summary "Generate an accounting report"). Its request body is a filter — `month`, `year`, `reportStates`, `employeeIds`, `dayStatuses`, `dayApprovalStates`, with `month` and `year` required — so it is a report-retrieval RPC, not a mutation. **The claim is substantively correct**; only the wording is loose. Reword to "no operation mutates assignment or membership state; the sole POST is a report-retrieval RPC."

### F-9 · PostgreSQL has no version in the Stack table, and the real pin is a floating tag

`ARCHITECTURE-SPINE.md:223` gives PostgreSQL the version `project standard` — not a version. The actual pin is `image: postgres:18-alpine` (`services/backend/docker-compose.yml:32`), a **floating minor tag**.

Live check ([postgresql.org](https://www.postgresql.org/), [18.6 release notes](https://www.postgresql.org/docs/18/release-18-6.html)): 18 is current stable; latest minor is **18.6**, released 2026-08-13, fixing 28 security vulnerabilities and 110+ bugs. So the major is current — but the Stack table did not say so, and the floating tag means two environments pulling on different days can run different server builds.

That collides directly with `OPERATIONAL-ENVELOPE`'s closure condition, which requires not weakening AD-20's "shared-database, timezone, health, alert, or worker requirements" (`blockers.yaml:354-355`), and with AD-20's release gate requiring every environment to run "at least one worker process against the same PostgreSQL source" (`ARCHITECTURE-SPINE.md:196`). AD-20 depends on `SKIP LOCKED`, `DATE`, and server-side time comparison. Add "PostgreSQL server version, pinned to a minor" to `OPERATIONAL-ENVELOPE`'s `blocks:` list and state the major in the Stack table.

### F-10 · The `prisma` npm `latest` dist-tag now resolves to a release candidate

`npm view prisma dist-tags` → `latest: 8.0.0-rc.12` (published 2026-08-26), while `@prisma/client` → `latest: 7.10.0`. The repo's `"prisma": "^7.10.0"` caret protects the installed tree, so there is no current defect. But any `npm i prisma` or `npm i -g prisma` in a script, Dockerfile, or CI step that does not go through the lockfile will pull an RC CLI against a GA client. Worth one sentence in the Stack row. Note the asymmetry is a live upstream condition, not a repo error.

---

## Tier 4 — Confirmed accurate (verified against reality; no action)

Recorded because this lens must distinguish "checked and true" from "unchecked". Each line below was executed or fetched, not inferred.

**Commit pins.** All three SHAs are real commits (`git cat-file -t` → `commit`). Superproject `0e703d1` **is** the true HEAD (`git rev-parse HEAD` matches exactly) and is in sync with `origin/main` (`rev-list --left-right --count` → `0 0`). `git submodule status` returns backend `08931ad` and frontend `d06b977` with clean (space) prefixes, matching `evidence_baseline` exactly — no `+` drift between gitlink and submodule HEAD. Frontend `d06b977` is on `refs/heads/main` and an ancestor of `origin/main`. (Backend reachability is F-1.)

**Spine commit-pin semantics.** `binds_spine.commit` is genuinely the last commit touching the People Management spine file (`git log -1 -- <path>` → `0e703d1`), as the frontmatter note claims. `binds_access_control_spine.commit` is *also* legitimately the last commit touching the Access Control spine file — both files were last modified by the same commit, "User management updated (#12)". The identical SHA is correct, not a copy-paste error. The frontmatter should say so, since an identical pair invites exactly that suspicion.

**Submodule cleanliness caveat — true as stated, including the file names.** Backend `git status --porcelain` → `?? .claude/worktrees/`, `?? AGENTS.md`. Frontend → `?? AGENTS.md`. `git diff --name-only HEAD` is empty in both. The caveat's specific claim (backend `.claude/worktrees/` and `AGENTS.md`; frontend `AGENTS.md`; no modified tracked file) is exact.

One scoping note, not a defect but worth stating: the caveat's sentence is scoped to the submodules, yet `evidence_baseline` also pins `workplace`, and the **superproject has 7 modified tracked files** at pin time — `AGENTS.md` plus the three domain PRDs and their three memlogs. I verified that **none of those seven is cited as evidence anywhere in the package** (`rg 'prd-'` over the package directory returns nothing), so no evidence claim is affected. The concluding clause "every code-evidence claim in this package is reproducible at the pinned SHAs" therefore survives — but it survives on a fact the caveat does not state. Add "superproject tracked modifications at pin time are limited to files not cited as evidence" if the claim is to stand on its own.

**Prisma — the only Stack row that is both pinned and current.** Spine `:222` says "7.x (lockfile 7.10.0; remain on the supported major until a reviewed v8 migration)". Verified: `package-lock.json` resolves `prisma`, `@prisma/client`, and `@prisma/adapter-pg` all to exactly **`7.10.0`**; installed `node_modules/prisma/package.json` → `7.10.0`. `npm view @prisma/client dist-tags.latest` → **`7.10.0`** — the pin is the current release, not merely a supported one. Live vendor sources confirm the posture: [Prisma 8 docs](https://www.prisma.io/docs/orm/v8) — "Prisma 8 … now available as a Release Candidate. If you want to stay on the current generally available version of Prisma ORM, you can continue with Prisma 7"; [The Next Evolution of Prisma ORM](https://www.prisma.io/blog/the-next-evolution-of-prisma-orm) — "Prisma 7 … remains the recommended version of Prisma for production applications and will continue to receive updates and support for the next 12 months." The claim holds and is current. It is also the only Stack row whose version is verifiable, because it cites the lockfile.

**`gate-decision.json` — every checked field matches.** [`gate-decision.json`](https://github.com/altexsoft-dmytro-novyk/workplace/blob/c342138/_bmad-output/test-artifacts/gate-decision.json) (`c342138`): `gate_status: "FAIL"` ✓, `critical_open: 1` ✓, `p0_status: "NOT_MET"` ✓, `rationale: "P0 coverage is 95% (required: 100%). 1 critical requirement(s) uncovered: ACM3-II-06."` ✓ — **`ACM3-II-06` is the named uncovered requirement** ✓, `evaluated_at: "2026-08-31T14:04:52.886179Z"` matches `blockers.yaml:106`'s "evaluated 2026-08-31" ✓. The referenced test-case file `docs/test-cases/access-control-kernel/inactive-identity/acm3-ii-06-repeat-before-viewer-proof.md` **exists** on disk and at pinned SHA `0e703d1` ✓. `QUALITY-GATE-AC`'s expansion to block explicitly on `ACM3-II-06` is fully supported by the artifact.

**TimeTracker contract — all seven mandated claims verified true.** Against `docs/integrations/timetracker-external-api.json` (OpenAPI `3.0.3`, `info.version 1.0.0`, 325 lines):

| Claim | Result | Evidence |
|---|---|---|
| No cursor / since / delta / webhook / event feed | **TRUE** | Top-level keys are exactly `openapi, info, servers, security, tags, paths, components` — no `webhooks`. Case-insensitive search of the whole document for `cursor`, `since`, `delta`, `webhook`, `callback`, `event`, `updatedAt`, `modifiedSince`, `page`, `offset`, `limit` → **zero matches each**. `GET /api/projects/talents` has one parameter, `statuses`. |
| No write or reassignment operation | **TRUE in substance** | Only two paths; `reassign` → zero matches. See F-8 on wording. |
| `AccountTalentDto` exposes email with no durable id | **TRUE** | `{email: string, dateStart: date-time, dateEnd: date-time nullable}`, `required: [email, dateStart]`. No `id` property. |
| `projectManager` / `deliveryManager` untyped strings | **TRUE** | `ProjectTalentDto.projectManager` and `.deliveryManager` are both bare `type: string`, both in `required`. Contrast `ProjectTalentDto.id: integer` (projects *do* have durable ids) and `members: AccountTalentDto[]` (members do not) — exactly as `TT-IDENTITY-01` states. |
| Only declared server is a dev host with `X-Api-Key` auth | **TRUE** | `servers` has one entry: `https://tt-bootcamp.dev.altexsoft.dev/`, description "TimeTracker dev bootcamp environment". Both `securitySchemes` are `type: apiKey, in: header, name: X-Api-Key` — `AccountingApiKey` and `TalentsApiKey`, per-partner as the package says. Global `security: []`; each path carries its own scheme. |
| No department concept | **TRUE** | `department`, case-insensitive, whole document → zero matches. `DEPARTMENT-EDGE`'s newly recorded "supplies no department concept at all" is exact. |
| No leaves endpoint | **TRUE as to paths** | Only two paths exist. But see F-7: leave *data* is present via `DayStatus`. |

`TT-IDENTITY-01`'s detailed identity-bridge description is also exact: `Employee.id` (`integer`, required) exists only on the Accounting response, behind `AccountingApiKey`, and `AccountingReportRequest` requires `month` and `year`.

**Line-number pins are exact, not approximate.** Spot-checked and confirmed character-for-character:

- `services/backend/prisma/schema.prisma:121` = `model Permission {`, delivering `{id, key, description}` — confirms AD-7's divergence from the spine's `{id, title, description}`.
- `services/backend/prisma/migrations/20260831070000_access_control_functional_roles/migration.sql:17` = `"operator" TEXT NOT NULL DEFAULT '=='`, with no `CHECK` constraint in the table definition — confirms AD-8.
- `ARCHITECTURE-SPINE.md:196` = the AD-20 "Operational release gate" paragraph.
- `ARCHITECTURE-SPINE.md:316` = the "Remaining operational envelope … must be resolved before first release" Deferred bullet.
- `interim-session-resolver.adapter.ts:43-44` = `if (persona === 'Root')` → `resolveOrProvisionRoot()`; `:75-80` = `this.prisma.user.create({ … position: 'HR Admin' … })`.
- `interim-access-control.adapter.ts:11-14` = `HR_ADMIN_FEATURES` containing `user-management:create|deactivate|list`; `:37-38` = `isAllowedForTarget(userId) { return Promise.resolve(Boolean(userId)); }`.
- `user-management.module.ts:35-36` binds both interim adapters to `SESSION_RESOLVER_PORT` and `ACCESS_CONTROL_PORT` — confirming `SEC-AUTH-01`'s "all bound into the production module".

**`SEC-AUTH-01`'s exposure caveat is true.** `services/backend/docker-compose.yml` declares exactly two services, `localstack` (line 2) and `postgres` (line 31). There is no backend service. "The backend is not containerized in `docker-compose.yml` and is not deployed" is confirmed, so "latent, not live" is accurate rather than self-serving.

---

## Automation candidates arising from this lens

The package's §10 already proposes "Pinned-SHA reachability and superproject/submodule cleanliness at pin time". F-1 shows that check must be stronger than `git cat-file -t`, which passes on an unpushed detached commit. Concretely:

1. **Ref-durability check** (would have caught F-1): for every pinned SHA, assert `git for-each-ref --contains <sha>` is non-empty **and** includes a `refs/remotes/` or `refs/tags/` entry. Stable, mechanical, cheap — a strong automation candidate.
2. **Evidence-path existence resolved at the pinned SHA, not on disk** (would have caught F-2): `git cat-file -e <pin>:<path>` for every cited path, routing `services/*` paths to the corresponding submodule pin. I implemented this ad hoc for this review; 49 paths, one failure. Strong automation candidate.
3. **Declared-versus-installed toolchain drift** (would have caught F-3 and F-5): compare `engines.*`, `@types/node`, and the Stack table against `node -v`, the lockfile-resolved versions, and container image tags. Strong automation candidate; the comparison is deterministic.
4. **Stack-table cell shape check**: fail any Stack row whose version cell is not a resolvable version range (rejects `current LTS` and `project standard`). Cheap and would have caught F-5 and F-9.
5. **Upstream currency check** (relevant to F-4, F-10): flag when a named technology's npm `dist-tags.latest` moves past the pinned major, and flag when `latest` is a prerelease. This one is a **weak automation candidate for gating** — it will fire on deliberate n-1 postures and produce false urgency. Use it as an advisory feed, not a gate.

**Deliberately manual.** Whether a stated *rationale* holds (F-4) is not automatable: the version numbers were all internally consistent, and only reading the vendor's migration guide showed the reason was wrong. Likewise F-7 — an endpoint-existence check passes; only reading the enum values shows the data is there. Both are the class of finding a schema validator will always miss, and both are the reason this lens is a human gate rather than a linter.

## Assumptions (not confirmed)

Stated explicitly so they are not mistaken for findings:

- I did not execute the backend build, type-check, lint, or test suite. F-3's consequence for test evidence is inferred from the runtime/engine mismatch, not observed as a failure. Running `npm run build`, `npm run lint`, and `npm test` on the pinned tree under the declared Node major is the validation step that would settle it, and I recommend it before the next revision.
- I did not call the TimeTracker dev host. All contract findings are static reads of the committed OpenAPI document; whether the running service matches its own spec is unverified and, given the single dev-host server entry, worth a manual probe before `TT-IDENTITY-01` is closed.
- Web results are as of 2026-09-02 and cite vendor-primary sources (nodejs/Release, postgresql.org, nestjs docs and GitHub releases, prisma.io docs and blog) plus the npm registry queried directly. I treated the DEV Community post on NestJS 12 as corroboration only; the release notes and official migration guide carry F-4.
- I did not attempt to establish *why* the backend submodule is on a detached agent worktree commit. F-1 reports the state, not the cause.
