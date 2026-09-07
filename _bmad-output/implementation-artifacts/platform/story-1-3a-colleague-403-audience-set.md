---
status: done
title: 'Colleague-403 audience-set assertions — rework ACF-AU-05 / ACF-FC-01 / ACF-FC-02'
type: 'tech'
created: '2026-09-07'
completed: '2026-09-07'
story_id: 'PLAT-E1-S1.3a'
sprint_key: '1-3a-colleague-403-audience-set-ad1'
epic: 'Platform Epic 1 — Platform Spec v1.5 Alignment (production follow-up)'
raised_by: 'Story 1.3 gap G5 (changelog-traceability-matrix.md §9); split out 2026-09-07'
owners: ['access-control']
decision_record: '_bmad-output/planning-artifacts/platform/changelog-traceability-matrix.md §9 G5'
blocked_on: []
---

# PLAT-E1-S1.3a — Colleague-403 audience-set assertions

## Outcome (2026-09-07)

**Done, and no gated AD-1 dispatch was needed.** On dispatch the code side was found
already shipped: `services/backend` commit `da7d1fa` ("test(access-control): rework
superseded 403 assertions as resolver audience-label checks", 2026-09-06, an ancestor of
backend HEAD) reworked `test/access-control/audience-resolution.e2e-spec.ts` so
`ACF-AU-05` / `ACF-FC-01` / `ACF-FC-02` assert `AccessControlFacade.resolveAudiences`
audience labels directly (`['colleague']`, plus explicit `pp` / `reporting` false checks on
FC-02), matching the `ACF-FC-04` shape via a shared `expectAudienceLabels` helper. The
resolver itself was unchanged, as predicted.

The only lag was in the three scenario `.md` files, which still carried `expectedResult:
403` in their `## Test` sections under stacked supersession blockquotes. On 2026-09-07 those
`## Scenario` / `## Test` sections were rewritten to state the resolver-label expectation,
the two blockquotes per file were consolidated into one dated "Supersession history" note,
approval metadata preserved. The "pending 1-3a" notes in
`spec-access-control-audience-foundation/SPEC.md` and
`docs/test-cases/access-control-foundation/README.md` were corrected to "done".

Acceptance criteria below are all satisfied by `da7d1fa` (assertions) + the 2026-09-07
scenario-doc rewrite (prose). Files changed 2026-09-07: the three `acf-*` scenario docs,
`spec-access-control-audience-foundation/SPEC.md`, `docs/test-cases/access-control-foundation/README.md`.

## Why this is its own story

Story 1.3 was documentation alignment. This is production AD-1 work — a scenario + test
rework — and it does **not** gate Epic 1 `done`. Story 1.3 already closed the documentation
half: `spec-access-control-audience-foundation/SPEC.md:52`, `docs/test-cases/access-control-foundation/README.md`,
and the three scenario files each carry a "pending `1-3a-colleague-403-audience-set-ad1`"
annotation against PM/AD-24. This story does the code half.

## Background

Three fail-closed scenarios were authored (Anna Pikula, approved 2026-08-30) when the
provisional contract was "`GET /users/:id` is binary: `200` or `403`, and a colleague is
denied":

| Scenario | Fail-closed principle it protects |
| --- | --- |
| `ACF-AU-05` (`audience/acf-au-05-colleague-denied.md`) | A colleague resolves to `colleague` as the fallback and nothing more — the case that makes the other four audiences meaningful. |
| `ACF-FC-01` (`fail-closed/acf-fc-01-broken-reports-to-edge.md`) | A deactivated intermediate manager must not bridge reach to their ancestors. |
| `ACF-FC-02` (`fail-closed/acf-fc-02-pp-hr-line-withheld.md`) | PP resolution stops at the directly assigned endpoint; it does not walk the PP's own manager chain. |

Two things changed after they were approved:

1. **2026-09-01 (User Management product decision):** every resolved audience — including
   `colleague` — reads the S1 identity card (`200`). A colleague `GET /users/:id` is no
   longer a `403`. The three files' HTTP `403` expected-results stopped holding.
2. **2026-09-02 (ratification, PM/AD-24):** the denial oracle is `401` (invalid/inactive
   session) / `404` (missing or hidden-existence target) / `403` (visible resource,
   forbidden feature/action) — not an empty-audience `403`.

**The resolver behaviour itself never changed.** `resolveAudiences` still returns
`{colleague}` for Colin/Frank/Hana in these scenarios. Only the way the scenarios *observe*
it (an HTTP status on a route) is wrong.

## Scope

**In:** rework the three scenario docs and their Stage-2 E2E from an HTTP `403` expectation
to a resolver audience-set assertion, following the AD-1 three-stage gate.

**Out:**
- Any change to `resolveAudiences` / `AudienceResolverService` / the relationship-graph
  adapter — the resolver is correct and this story must not touch it.
- The genuinely-empty-audience denial (viewer or target not an active `User`) — that is a
  UM controller concern and follows the PM/AD-24 oracle in the adoption spec, not here.
- The 2026-08-30 / 2026-09-01 approval records — preserved verbatim; the `403`
  expected-results are replaced, not translated.

## Acceptance criteria

- `ACF-AU-05`: `resolveAudiences(Colin, [Alice])` → `{colleague}`; non-empty; does **not**
  contain `self` / `reporting` / `pp`. No route-level assertion.
- `ACF-FC-01`: `resolveAudiences(Frank, [Erin])` across the deactivated intermediate manager
  → `{colleague}`; does **not** contain `reporting` (the broken edge did not promote him).
- `ACF-FC-02`: `resolveAudiences(Hana, [Alice])` → `{colleague}`; does **not** contain `pp`
  (PP resolution did not walk Hana's own manager chain).
- Each reworked assertion mirrors the shape `ACF-FC-04` already uses for an audience-set
  check.
- The three scenario docs keep their original approval metadata and gain a dated
  "reworked under 1-3a" note; the superseded `403` blockquotes can be collapsed into one
  dated supersession-history block.
- Stage-2 E2E for all three is red before the rework and green after, with no change to
  `resolveAudiences`.

## Sequencing (AD-1 — no dispatch spans a stage)

*Not followed — see Outcome. Stage 2/3 (the E2E rework) had already shipped in `da7d1fa`
before this story was dispatched; Stage 1 collapsed to a scenario-doc update. Retained
below as the plan that was written.*

1. **Stage 1 — scenario prose only.** Rewrite the three expected-results as audience-set
   assertions; human approval before any test code.
2. **Stage 2 — the red.** Update the three E2E specs to the audience-set assertion; confirm
   red against current `main` (they currently assert `403` on a route that returns `200`).
   Human approval.
3. **Stage 3 — green.** No production change expected. The specs go green because
   `resolveAudiences` already returns `{colleague}`. If anything in the resolver has to
   change, stop — that is a separate finding, not this story.

## References

- `docs/test-cases/access-control-foundation/README.md` — "The provisional mapping" and
  "The deny cases need rework" sections (both annotated pending 1-3a)
- `_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md` — Success signal,
  2026-09-01 amendment + PM/AD-24 supersession
- `docs/architecture/access-control.md` §"Denial conventions" / PM/AD-24 — the live oracle
- `docs/test-cases/access-control-foundation/fail-closed/acf-fc-04-*.md` — the audience-set
  assertion shape to mirror
