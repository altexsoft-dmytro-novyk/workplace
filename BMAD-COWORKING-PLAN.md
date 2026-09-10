# BMad Coworking — design

A coordination workspace for BMad agents. Planning artifacts move out of git and
into Postgres; agents read and write them through a thin local service and a
one-way cache. Several developers running agents on several branches see each
other's work while it is still being written, instead of discovering the
divergence in a merge conflict and then filing a separate alignment PR.

Status: design agreed, not implemented. Stage 1 has not started.

## The problem

Several developers run BMad agents in parallel branches. Planning artifacts drift
apart. Merge conflicts get resolved mechanically — text reconciles, decisions do
not — and a separate alignment PR is needed afterwards anyway.

Scope of the corpus today: `_bmad-output/` holds 260 files, ~11 MB, touched by
four people over the last 90 days. `docs/` (design and architecture decisions)
stays in git and is out of scope — it is stable and it is not where the drift
happens.

## Principles

1. **Documents live in the database, not in git.** One exception: a version
   registry file stays in the repo (see [Registry file](#registry-file-in-the-repo)).
   It is the single merge point, and it is deliberate.
2. **The unit of coordination is a decision, not a file.** A changeset applies
   whole or not at all.
3. **`input/` in the cache is read-only and disposable; `output/` is the
   session's work area.** There is one source of truth.
4. **Synchronisation happens at task boundaries and on write**, not in real time.
5. **`key` is identity, `path` is location.** References use `key` only.
6. **Merging a pull request makes a revision canonical — never an agent.** Every
   push an agent makes is a draft.
7. **Every live version is visible side by side.** A glob is meant to return all
   of them; status carries the meaning.

Principles 6 and 7 were added during design. Principle 1 changed: the original
intent was that no doc artifact remains in git at all. See
[Decisions and their reasons](#decisions-and-their-reasons).

## Schema

```sql
create table documents (
  key              text primary key,
  path             text not null,
  parent_key       text references documents(key),
  title            text not null,
  description      text not null,
  body_hash        text not null,
  tags             text[] default '{}',
  size_tokens      int not null,
  registry_version uuid not null default uuidv7(),
  deleted          boolean not null default false,
  updated_at       timestamptz default now()
);
create unique index on documents (path) where not deleted;
create index on documents (path text_pattern_ops);
create index on documents (registry_version);

create table revisions (
  id          bigserial primary key,
  doc_key     text references documents(key),
  body        text not null,
  base_rev    bigint,
  branch      text,
  decision_id text,
  session_id  uuid references sessions(id),
  status      text not null default 'draft'
                check (status in ('draft','in-review','canonical',
                                  'superseded','abandoned','stale')),
  created_at  timestamptz default now()
);
create unique index one_canonical_per_doc
  on revisions (doc_key) where status = 'canonical';
create index on revisions (doc_key, id desc);
create index on revisions (branch) where status in ('draft','in-review');

create table sessions (
  id         uuid primary key,
  agent      text,
  branch     text,
  intent     text,
  started_at timestamptz default now(),
  last_seen  timestamptz default now(),
  status     text default 'active'
);

create table write_lock (
  id          int primary key default 1 check (id = 1),
  session_id  uuid,
  mode        text check (mode in ('write','exclusive')),
  reason      text,
  acquired_at timestamptz,
  expires_at  timestamptz
);

create table notes (
  id         bigserial primary key,
  target_rev bigint not null references revisions(id),
  quote      text not null,
  author     text not null,
  body       text not null,
  status     text not null default 'open'
                check (status in ('open','acknowledged','withdrawn')),
  created_at timestamptz default now()
);
```

### Notes on the schema

**`revisions` is append-only.** Canonicality is held by the partial unique index;
there is no separate pointer to maintain.

**`registry_version` is a uuidv7** on `documents`, bumped on every write to that
document. `GET /registry?since=<uuid>` is then a plain range scan. Postgres 18
has `uuidv7()` natively. A monotonic in-process counter was rejected: it resets
on restart, and a client holding `since=140` would silently receive an empty
delta and carry on against a stale cache. Generation order equals commit order
because the global write lock serialises writers.

**`revisions.branch` is on the revision, not only on the session.** A session can
change branch mid-run; promotion is per-branch and must not depend on where the
session happened to end up.

**No `search_vec`, no GIN index.** They existed only to serve `GET /search`.
Every agent already holds the full corpus in its cache, so `grep` is faster than
a network round trip for anything canonical; the server only needs to search what
is *not* in the cache — other people's in-flight drafts, which number in the
dozens. `ILIKE` handles that in milliseconds. Dropping the generated column also
removes a real failure: the largest artifacts are 300–500 KB machine-generated
JSON matrices, and a tsvector has a 1 MB ceiling. If search ever gets slow,
`pg_trgm` can be added over existing data in one migration with no API change.

**No table for blocked promotions.** One was planned while promotion was an
operation against a branch. With the registry file in the repo, a diverging base
revision surfaces as a git conflict before the merge, not as a service error
after it.

### Document metadata stays in sync by trigger

`documents.body_hash` and `size_tokens` denormalise the canonical revision. A
trigger keeps them correct rather than a convention nobody remembers:

```sql
create or replace function refresh_document_meta(p_doc_key text)
returns void language sql as $$
  update documents d
  set body_hash   = coalesce(r.hash, ''),
      size_tokens = coalesce(r.tokens, 0),
      updated_at  = now()
  from (
    select encode(sha256(convert_to(body,'UTF8')),'hex') as hash,
           (length(body) + 3) / 4                        as tokens
    from revisions where doc_key = p_doc_key and status = 'canonical'
  ) r
  where d.key = p_doc_key;
$$;
```

Fired by an `after insert or update of status on revisions` trigger, for rows
entering or leaving `canonical`. Inside the promotion transaction it fires twice
— once on the demotion to `superseded`, which clears the fields, once on the new
canonical, which sets them. Invisible from outside the transaction.

### Promotion

One transaction, release before acquire:

```sql
begin;
update revisions set status='superseded'
  where doc_key=$1 and status='canonical';
update revisions set status='canonical' where id=$2;
commit;
```

## Registry file in the repo

One line per document, sorted by key, committed alongside every changeset:

```
<key>  <revision-id>  <body_hash>
```

This is the one artifact that stays in git, and it earns its place three times
over:

- **Git does the conflict detection.** Two branches touching different documents
  merge silently. Two branches touching the same document conflict on exactly
  that line — which is precisely the conflict a human should see. The `base_rev`
  check that would otherwise have to run at promotion time is already done, by
  the tool that is good at it.
- **The pull request shows that documents changed.** Without it a doc-only change
  produces an empty diff and the reviewer sees nothing at all. Bodies are fetched
  with a CLI command; it is not a full GitHub diff, but it is not a void either.
- **Canonical becomes derivable.** Canonical is whatever the registry on `main`
  points at. Promotion stops being an operation and becomes a reconciliation.

The cost, stated plainly: "no branches for docs, therefore no merges" is no
longer literally true. One machine-generated file merges, line by line, and every
conflict in it means a real disagreement.

## Service

Thin HTTP over Postgres, bound to localhost, no authentication (see
[Deferred](#deliberately-deferred)).

| Endpoint | Purpose |
|---|---|
| `GET /registry?since=<uuid>` | delta, or 304 |
| `GET /documents?keys=` | every live version; `?status=canonical` narrows, `?rev=` picks one |
| `GET /documents/:key/revisions` | history without bodies; `superseded` is reachable only here |
| `GET /search?q=` | `ILIKE` over live revisions; results carry `status`, `branch`, `agent` |
| `POST /lock` | `{session_id, mode, reason}` |
| `DELETE /lock` | release, and administrative force-release |
| `POST /changesets` | `{decision_id, changes:[{key, body, base_rev}], notes:[…]}` — one transaction |
| `POST /sessions`, `POST /sessions/:id/ping`, `GET /sessions` | journal |
| `PATCH /notes/:id` | `acknowledged` / `withdrawn` |
| `POST /reconcile` | bring statuses in line with the registry on `main` |

`superseded` revisions never enter the cache. The cache is the live present;
history is fetched deliberately, when the question is "who changed this, and
when".

### The write lock

TTL one hour, acquired in a single statement:

```sql
update write_lock
set session_id=$1, mode=$2, reason=$3,
    acquired_at=now(), expires_at=now() + interval '1 hour'
where session_id is null or expires_at < now()
returning *;
```

Wait with a 30-second timeout, then fail with the holder's name and reason. The
force-release control shows who holds it and why. No heartbeat: the TTL is long
and release is manual.

**Exclusive mode** for alignment runs: a "waiting for exclusive" flag stops the
lock being handed to new write requests, otherwise a long operation never
acquires it. A failure mid-run rolls back completely.

### Sessions

Expire after 15 minutes without a `ping`. Closed sessions are not deleted — they
are the record of who was working on what at a given moment.

## Cache and the skill rule

```
input/planning-artifacts/prd.md                              canonical
input/planning-artifacts/prd.draft.anna-feature-x.r1841.md   another session's draft
input/planning-artifacts/prd.in-review.carlos-fr9.r1847.md   proposed, under review
input/planning-artifacts/prd.protest.r1841-3.md              a note about this artifact
output/planning-artifacts/prd.md                             this session's pending change
```

Every live version of an artifact sits in the same directory as the artifact. A
glob such as `{planning_artifacts}/*prd*.md` returns all of them, deliberately:
nobody plans against a version of the world only they can see.

**Status travels in the filename**, and is duplicated in frontmatter for
Markdown. The filename carries it because frontmatter cannot be injected into the
JSON coverage matrices or reliably into YAML, and because it is then visible in a
glob result without opening the file. The canonical version keeps a clean name.

**The sync is one-way.** It overwrites from the service and deletes anything it
does not recognise. It skips versions authored by the current session — those are
already in `output/`. `output/` is emptied on every successful push, so a pushed
draft returning as an `input/` file is not a duplicate.

### What the rule tells the skills

Full text: `bmad_coworking/overrides/coworking-rule.md`.

- Read output-first: `output/` if present, otherwise the canonical file.
- Never quote, cite, count or build on a non-canonical version without saying so
  out loud, naming its branch and status. "The PRD says X" is a statement about
  the canonical version only.
- Never assign yourself a status. Everything this session pushes is a draft.
- A divergence — the same question answered differently, not the same conclusion
  worded differently — stops the work and goes to the user, with three outcomes:
  change course and say which of your own conclusions you are dropping; hold your
  position and file a note of protest; or let the user decide. Explicitly
  forbidden: choosing silently, averaging the two, or writing something worded to
  accommodate both.
- Copy on write, deletion is an intent (`.deleted` marker), never hand-merge.

### Notes of protest

A note is not a document: it has no `path`, it is addressed to a person, and it
has its own lifecycle. Writing it into the target document fails three ways — the
target is on someone else's branch and read-only; appending to canonical turns an
objection into an official document change needing its own promotion; and a note
about a draft has to survive that draft becoming canonical.

So it is stored as a row anchored to `(target_rev, quote)`, and **delivered** into
the cache as a file sitting next to the artifact it concerns — visible exactly
where it is relevant, without being an artifact. The anchor is the verbatim quote
rather than a line number, because line numbers move on the first edit above them
and the quoted sentence does not.

### How the rule reaches the skills

`_bmad/custom/<skill>.user.toml`, one `persistent_facts` entry per skill holding a
`file:` reference to the single rule file. 28 skills qualify: those with a
`customize.toml` that resolve paths through `{output_folder}`,
`{planning_artifacts}`, `{implementation_artifacts}` or `{test_artifacts}`.

Three properties make this the right layer, all verified against the installed
BMad 6.11.0:

- override arrays **append**, so the rule joins each skill's existing facts
  instead of replacing them (confirmed with `_bmad/scripts/resolve_customization.py`);
- `_bmad/custom/` is never touched by the installer, so a BMad upgrade cannot
  undo it;
- writing the `.user.toml` layer leaves the committed team policy files
  (`bmad-sprint-planning.toml`, `bmad-testarch-trace.toml`,
  `bmad-validate-prd.toml`) untouched, so the epic-ID guard and the trace gate
  policy cannot be clobbered by an install.

No shipped skill file is edited. The rule lives in one file and is referenced, not
copied, so changing it does not require reinstalling anything.

## Working cycle

1. `SessionStart` — open a session, run `reconcile`, sync the cache.
2. Read: every live version, plus any notes addressed to this session.
3. Work: copy-on-write into `output/`.
4. On divergence: the conversation above, resolved before continuing.
5. Push: acquire the lock, check `base_rev`, write the drafts and notes in one
   transaction, empty `output/`, release the lock, commit the registry file.
6. Pull request opened → `in-review`. Merged → `canonical`.

At most three retries, then escalate to a human.

## Reconcile

A local command, not a webhook and not a CI job. It reads pull request state for
the workspace repository through the `gh` CLI, compares it with the branches of
live revisions, and applies the status transitions:

| event | revisions on that branch |
|---|---|
| agent pushed a changeset | `draft` |
| pull request opened | `in-review` |
| pull request merged to `main` | `canonical` (per the registry on `main`) |
| pull request closed unmerged | `abandoned` |
| draft older than 3 days | `stale` — dropped from the cache, kept in the database |

It runs on `SessionStart` and on demand. Properties that make this preferable to
a webhook:

- **Idempotent.** It reconciles state; it does not process events. A missed run
  costs nothing, the next one catches up. A webhook needs guaranteed delivery, or
  a reconciler as a backstop anyway.
- **No CI changes and no secrets in GitHub.** `gh` uses the developer's existing
  authentication.
- **It runs at the moment it matters** — statuses are correct right before anyone
  reads the docs. A merged PR sits in `in-review` only until someone's next
  session, which for a team of four is not a problem.
- **Concurrent runs are safe.** Two developers reconciling at once both try to
  promote the same branch; the lock and the partial unique index make the second
  a no-op.

Only workspace pull requests count — that is where BMad lives. Consequence worth
knowing: documents edited from a branch that exists only in `services/backend` or
`services/frontend` will never become canonical, because reconcile never sees
that branch. This holds as long as the convention "docs are edited from a
workspace branch" holds.

## Stages

| # | What | Done when |
|---|---|---|
| 1 | Schema, service, lock, changesets, registry endpoint. Own `docker-compose.yml`, Postgres 18 on port 5433 | works with curl, no agents |
| 2 | Import the 260 files, registry file, one-way cache sync, nightly export to a read-only git mirror | `_bmad-output` is in `.gitignore`; the last commit containing it is the rollback point |
| 3 | MCP tools, `SessionStart`/`SessionEnd` hooks, `reconcile`, and the activation switch (path redirect in `_bmad/custom/config.toml`) | one agent works with no doc files in git |
| 4 | Second agent, notes, migration to RDS, authentication | real overlaps are visible |
| 5 | Exclusive mode | an alignment run does not collide with edits |

Stages 1–3 are roughly a week. Stages 4–5 follow from practice.

MCP tools: `registry_sync`, `fetch_documents(keys)`, `search_docs(query)`,
`propose_changeset(...)`, `list_sessions`.

The database stays local through stages 1–3 — one developer and one agent need no
shared instance, and dropping the CI dependency removed the last reason for an
early remote one. RDS arrives with stage 4, when a second person connects. The
connection string is the only thing that changes.

## Deliberately deferred

**Authentication** — unnecessary on localhost, mandatory on RDS. It lands with
stage 4. It is no longer forced into stage 1, because reconcile removed the need
for CI to reach the service.

**Offline mode** — not considered. If the database is unreachable, agents do not
work with documents.

**POC v2**: a merge hook replacing PR polling; draft staleness tied to branch
liveness rather than a three-day cutoff (a live branch worked on for a week
currently disappears from everyone else's view on day four — exactly the branch
most worth seeing); sections instead of documents, split on H2; CAS with a
fencing token; an intent journal; a `decisions` table with `affects[]` and a CI
check for completeness of application; permissions by path prefix.

## Open

**Whether a draft push takes the lock.** The decision on record is that every
write takes it. The case for an exception: drafts cannot collide, because the
partial unique index only constrains canonical rows, so draft writes have nothing
to serialise against — and drafts are pushed far more often than promotions,
since they are what makes other people's work visible at all. Not adopted;
recorded here so it is not silently lost.

## Decisions and their reasons

Ordered by how much they changed the original plan.

**Canonical is set by merging a pull request, not by an agent.** The original
plan never said who decides. Tying it to merge makes the status a projection of
something the team already does, and it puts the `base_rev` check where git can
enforce it.

**A registry file goes back into git.** This weakens principle 1, and it is worth
it: git performs the conflict detection, pull requests stop being empty, and
promotion becomes derivable rather than an operation that can fail halfway.

**All live versions sit together and globs return them all.** The alternative
considered was a hidden sibling directory that existing globs would skip. It was
rejected: skills resolving `{planning_artifacts}/*prd*.md` and
`{planning_artifacts}/*spec-*.md` *should* see the drafts. Being seen is the
point; the status marker and the rule are what stop them from being blended in
silently.

**No full-text index.** Every agent holds the corpus locally, so server-side
search only has to cover what the cache lacks.

**Notes of protest are a table, delivered as files.** Neither storing them inside
documents nor making them pseudo-documents survives contact with the lifecycle.

**Reconcile instead of a webhook.** Idempotent state comparison beats event
handling, and it keeps CI untouched.

## Current state on disk

- `bmad_coworking/overrides/coworking-rule.md` — the rule.
- `bmad_coworking/overrides/install-overrides.cjs` — the installer; idempotent,
  `--dry-run` and `--uninstall` supported.
- `bmad_coworking/overrides/README.md`.
- 28 generated `_bmad/custom/*.user.toml` files, installed. They are gitignored,
  so every developer runs the installer once locally.

The rule is inert: it applies only to paths under a directory containing `input/`
and `output/`, and until `_bmad/custom/config.toml` redirects the artifact roots
at the cache, artifacts still resolve to `_bmad-output/`. That redirect is the
activation switch and belongs to stage 3.

Nothing else is implemented. Stage 1 has not started.
