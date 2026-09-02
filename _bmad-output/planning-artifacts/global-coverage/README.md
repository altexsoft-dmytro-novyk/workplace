# Global FR → Epic → Story Coverage

## Purpose

`global-fr-epic-story-coverage.yaml` is the canonical cross-product coverage model for People Management. It answers:

- Which normative product requirement is being delivered?
- Which bounded-context FR aliases decompose it?
- Which epic/story and workboard IDs own delivery?
- What evidence exists?
- Is the requirement implemented, active, specified, deferred, superseded, or uncovered?
- Which conflicts or gates prevent a reliable implementation claim?

It does not replace story acceptance criteria, approved capability specs, sprint trackers, or test evidence.

## Authority

1. `docs/project-requirements.md` v1.5 — normative product assignment.
2. `prd-people-management-2026-08-24/prd.md` — canonical product PRD.
3. This global model — canonical cross-product coverage rollup.
4. User Management and Mentorship domain specs — bounded-context decomposition.
5. Existing platform, User Management, and Mentorship epic files — immutable context-local story bodies.

## Identifier rules

Bare FR, Epic, and Story numbers are ambiguous and must not appear in cross-product references.

- `PM-FR-*`: canonical product requirements.
- `UM-FR-*`: historical User Management aliases.
- `M-FR-*`: historical Mentorship aliases.
- `PLAT-E{epic}-S{story}`: platform slice.
- `UM-E{epic}-S{story}`: User Management slice.
- `M-E{epic}-S{story}`: Mentorship slice.
- `ACF-*`, `ACM-*`, `UMAC-*`: stable approved workboard IDs.

Context-local sprint keys are interpreted using the story-ID prefix and the corresponding sprint tracker. A bare sprint key is not globally unique.

## Coverage statuses

- `implemented`: production behavior is shipped and supported by delivery evidence.
- `in-progress`: implementation or review is active.
- `specified`: current story/spec exists but implementation is not active.
- `deferred`: explicitly gated or outside the current delivery slice.
- `superseded`: historical work retained only for traceability.
- `uncovered`: normative product behavior has no current delivery story.

Sprint status is an evidence input, not the coverage status. A `done` planning or documentation story does not prove feature behavior.

## Completeness rules

- Every `PM-FR-1` through `PM-FR-42` appears exactly once under `requirements`.
- Every story mapping has a namespaced story ID and a valid coverage status.
- Workboard IDs are retained where they exist and never reassigned.
- An empty `stories` list is valid only when the requirement is `deferred` or `uncovered`.
- A gate or conflict never counts as implementation coverage.
- Red E2E and scenario prose count as specification evidence, not implementation evidence.
- Requirement-level `in-progress` may represent an implemented foundation plus incomplete consumer or scope.

## Known resolved product conflict (runtime still diverges)

`CONFLICT-UM-01` is **resolved at product/requirements**. Live HTTP denial is `401` / `404` / `403` (`docs/project-requirements.md` §3.3 rule 8, PM-FR-4). Historical UMAC empty-audience `403` and historical UM PRD/test-case `404` artifacts are stale and are not rewritten. New tests follow the live oracle after an AD-1 sweep.

The current User Management runtime does **not** implement that oracle (interim target allow, guard `403`, missing-user `404`). Treat that as implementation/transition debt, not an open product conflict.

## Current risk view

Highest impact:

- PM-FR-1–5 have implemented kernel foundations but incomplete User Management adoption and broader audience/section scope.
- PM-FR-8–11, 15–27, 30–31, 35–37 are uncovered at product-delivery level.
- PM-FR-32–34 are specified but blocked; no Mentorship source context or schema exists.
- PM-FR-41–42 are specified but blocked on departure, journal, and department contracts.
- Runtime functional-role administration and full-profile access remain deferred.

## Maintenance

Update the model when:

- A product requirement changes.
- A story is added, removed, superseded, or resequenced.
- A sprint key changes status.
- A capability spec is approved or superseded.
- Production evidence lands or transition debt retires.
- A conflict or gate is resolved.

Append the reason and affected IDs to `.memlog.md`. Preserve prior approved proposals and historical artifacts.

## Known superseded TimeTracker gate

`TIMETRACKER-CONTRACT` is a **superseded historical** blocker ID. Live requirement gates must cite `TT-IDENTITY-01` and/or `TT-PMDM-01` according to the FR dependency. Do not reintroduce `TIMETRACKER-CONTRACT` as a live gate.

## Validation

Automated validation should check:

- YAML parsing.
- Exact PM-FR inventory and uniqueness.
- Allowed status values.
- Namespaced story IDs.
- Sprint-key existence in the context-specific tracker.
- Referenced file existence.
- No `implemented` edge without implementation evidence.

Manual review remains required for semantic adequacy, business-rule changes, authorization consequences, and whether evidence actually proves the requirement.
