# Test-Case Authoring Pattern

**Binding for every feature area.** This is stage 1 of the three-stage quality gate ([testing-strategy.md](../architecture/testing-strategy.md), AD-1): scenario doc → developer approval → E2E translated from it line by line (committed red) → production code. No production code without an approved scenario file behind it.

`access-control/` was meant to be the reference implementation to copy — its shape is fully specified in [SPEC-access-control-test-cases](../../_bmad-output/specs/spec-access-control-test-cases/SPEC.md), but as of 2026-08-25 the directory and its scenario files have not actually been authored yet. Until it lands, [`user-management/`](user-management/) is the closest thing to a worked example on disk; treat any "proven in access-control's suite" claim you find elsewhere as pending, not settled.

## Structure

```
docs/test-cases/
  README.md                      ← this pattern; change via team-reviewed PR
  <feature-area>/                ← e.g. access-control, resourcing, mentorship
    README.md                    ← area conventions: canonical personas/fixtures,
                                   endpoint vocabulary, layout table, area-specific rules
    <group>/                     ← requirement cluster, e.g. shared-link, users/roles
      <one-test-case-per-file>.md
```

File names state actor/audience + behavior, kebab-case: `manager-write-denied.md`, `create-role-unauthenticated.md`, `colleague-read-none.md`. A folder listing should read as an index.

## File format

Every file follows this skeleton exactly:

````markdown
# <ID> · <Behavior name>

**Trace:** §<requirements section> · <AD-n when architectural>

## Scenario

**Given** <who the actor is and the relationship/state that matters>.

**When** <what they do>.

**Then** <what must happen — and why, citing the cell or rule in plain words>.

**Preconditions:** [fixture](<path to area README>); <per-case state on top of the fixture>

## Test

- **inputURL:** `<METHOD> /path`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:persona>" },
    "body": { "field": "value" }
  }
  ```
- **expectedResult:** `<HTTP status>`; <observable outcome, including what must be ABSENT>
````

- **ID:** `<AREA>-<GROUP>-NN` (e.g. `AC-UR-01`). Stable and unique — never reused, never renumbered; E2E tests cite it.
- **Trace:** mandatory. A scenario that cites no requirement is invalid.
- **Scenario section is mandatory.** Plain language, Given/When/Then: who the actor is and their relationship, what they do, what must happen and why. A reviewer must understand the case from this paragraph alone, without decoding the request spec — the request spec below it is the machine-precise version of the same story.
- **Preconditions hold static seeded state only** (fixture personas, existing records, role memberships). A state **transition** the scenario depends on is never a precondition — it is shown as explicit steps, so the reader sees cause and effect:
  1. baseline request proving the state before,
  2. the request that performs the change,
  3. the request observing the new state.
  When the change has no API endpoint (sync-owned data, the clock), write it as a **stateChange** step between the requests: `- **stateChange:** <what changes and why there is no request for it>`.
- **Make effects observable:** when a write's outcome surfaces through another audience or endpoint, end the scenario with the request that observes it — "persisted" alone is not an assertion.
- **expectedResult** asserts what the API returns — status plus body shape, and explicitly what is absent.

## Granularity rules

1. **One test case per file.** One requirement, one primary request, one expected result.
2. **Split by action:** read and write are separate files (`manager-read.md` / `manager-write-denied.md`).
3. **Decompose by auth state.** Where an endpoint's behavior differs by credentials, each state is its own file: unauthenticated → `401`, valid token without permission → `403`, entitled → success.
4. **Negative cases are first-class** and get their own files — never a footnote inside a positive case.
5. Multiple `## Test N — <label>` blocks in one file are allowed **only** for a single requirement — either probing it from several angles (a hidden section via profile assembly *and* direct request) or walking its cause→effect sequence (baseline → change → observation). Two requirements = two files.

## Status-code and assertion conventions

- `authorization: "Bearer <token:persona>"` = valid session for a fixture persona; `""` = unauthenticated.
- **Global 401 rule:** every endpoint rejects a missing/invalid token with `401`. Write representative 401 scenarios per endpoint family; stage-2 suites apply the check to each real route.
- Valid token, feature not permitted → `403`. Write to data the viewer may only read → `403`. Any request touching data the viewer must not know exists → `404` with a leak-free body (no field names, counts, or fragments; indistinguishable from a truly nonexistent resource).
- **Absence is absence:** "not visible" means the key is missing from the JSON body — never `null`, never empty-but-present. All assertions are API-level; UI behavior is out of scope.
- **Endpoints are bound to the canonical router-tree convention**, `docs/architecture/api-conventions.md` (spine AD-14) — not placeholder. Resource root is `/users`; role/permission catalog management is top-level `/roles`, never nested under `/users`.

## Workflow and ownership

Per AD-1/AD-4: the feature owner drives their own scenario → E2E → code sequence; approval is an asynchronous peer review on the PR, not a handoff. A file is **draft** until a developer has approved it; only approved files get translated to E2E.

## Updating these rules

This README is the single source for the pattern. Change it via a PR the team reviews — and keep it consistent with [testing-strategy.md](../architecture/testing-strategy.md): if a change would conflict with the architecture spine (AD-1/AD-3/AD-4), change the spine with the architect first, then this file.
