# Test-Design Workflow Routing Contract

**Status:** Binding repository routing policy for `bmad-testarch-test-design`.
**Applies to:** Create, context loading, Edit, Resume, and Validate.
**Output root:** `_bmad-output/test-artifacts/` (unchanged).
**Current-artifact index:** `_bmad-output/test-artifacts/test-design/README.md`.

This contract makes one scope identity select one plan, one checkpoint, and one validation
report without relying on a bare epic number. It controls document selection and filenames;
it grants no approval, validation verdict, test coverage, gate result, or release status.

## 1. Precedence over the stock workflow — including the Resume override

Read the current-artifact index and this contract before the workflow presents or acts on a
mode. Resolve scope before selecting an input, output, checkpoint, edit target, resume target,
validation report, or handoff.

The rules below override stock behavior in these places:

- Create step 1 must not derive identity from a bare `epic_num` or from a title alone.
- Create step 5 must not write `test-design-epic-{epic_num}.md` for a repository epic.
- Validate must not send every scope to `test-design-validation-report.md`.
- The system handoff must not be derived from `{project_name}`.
- File-based mode detection must not select an epic merely because a sprint-status file exists.
- Resume must use the repository states in §4.4: a fully generated document is terminal for
  Create even though stock Resume does not recognize `workflowStatus: generated`.

When a stock instruction conflicts with this contract, follow this contract. Do not edit either
installed skill tree to implement the override.

## 2. Canonical identity tuple

### 2.1 System

The platform has exactly one non-epic identity:

| Field | Value |
| --- | --- |
| scope kind | `system` |
| `runScope` | `system-level` |
| `runKey` | `system` |
| architecture | `_bmad-output/test-artifacts/test-design-architecture.md` |
| QA strategy | `_bmad-output/test-artifacts/test-design-qa.md` |
| checkpoint | `_bmad-output/test-artifacts/test-design-progress-system.md` |
| validation report | `_bmad-output/test-artifacts/test-design-validation-report.md` |
| handoff | `_bmad-output/test-artifacts/test-design/people-management-handoff.md` |

The handoff path above is literal. The configured display name `people management` must never
produce `test-design/people management-handoff.md` or any other second handoff.

### 2.2 Numbered epic

An epic identity is the consistent tuple `(domain, canonical epic ID, source path)`. The number
is read from that canonical epic, not supplied as an identity by itself.

For a numbered epic with domain `{domain}` and number `{number}`:

| Field | Value |
| --- | --- |
| scope kind / `runScope` | `epic` |
| `runKey` | `epic-{domain}-{number}` |
| plan | `_bmad-output/test-artifacts/test-design-epic-{domain}-{number}.md` |
| checkpoint | `_bmad-output/test-artifacts/test-design-progress-epic-{domain}-{number}.md` |
| validation report | `_bmad-output/test-artifacts/test-design-validation-report-epic-{domain}-{number}.md` |

`domain` is the canonical planning-artifact directory slug. `canonical epic ID` and the epic
heading must agree with `_bmad-output/planning-artifacts/{domain}/epics.md`, or with another
exact source path named by the index. Never renumber an epic and never change a ClickUp mapping
to make the tuple fit.

For filenames, `{domain}` and `{slug}` must each be one non-empty lowercase ASCII token made only
of letters, digits, and hyphens; neither may contain `/`, `..`, whitespace, a path separator, or
a leading/trailing hyphen. `{number}` is the canonical base-10 integer spelling (`0` or a digit
from `1` to `9` followed by digits), never a zero-padded alias. A canonical source may use richer
display text, but it must map to exactly one such token. Refuse any tuple that would escape the
output root or collide with another indexed identity, including an unnumbered slug that equals a
numbered epic's number in the same domain.

Examples:

- `UM-E1` + `user-management` +
  `_bmad-output/planning-artifacts/user-management/epics.md` resolves to
  `epic-user-management-1`.
- `PMC-E1` + `platform-capabilities` +
  `_bmad-output/planning-artifacts/platform-capabilities/epics.md` resolves to
  `epic-platform-capabilities-1`.

Those examples share the number `1` but are different runs and may never share files.

### 2.3 Real unnumbered epic

An unnumbered epic is supported only when its canonical source or the current index declares an
explicit, stable canonical slug. Do not invent the slug from the title during a run. With domain
`{domain}` and canonical slug `{slug}`:

| Field | Value |
| --- | --- |
| scope kind / `runScope` | `epic` |
| `runKey` | `epic-{domain}-{slug}` |
| plan | `_bmad-output/test-artifacts/test-design-epic-{domain}-{slug}.md` |
| checkpoint | `_bmad-output/test-artifacts/test-design-progress-epic-{domain}-{slug}.md` |
| validation report | `_bmad-output/test-artifacts/test-design-validation-report-epic-{domain}-{slug}.md` |

The Task 5 fixture example is domain `fixture`, canonical slug `identity-recovery`, and run key
`epic-fixture-identity-recovery`. It is not a repository epic and must not be added to repository
planning or tracking artifacts.

## 3. Scope resolution and no-write refusals

Resolve scope in this order:

1. Read the current-artifact index.
2. Prefer an explicit system request or a complete epic tuple supplied by the user. A canonical
   epic ID supplied alone may be completed from canonical sources only when it has exactly one
   match; state the completed tuple before proceeding. A domain or number alone is not enough.
3. For an epic, locate the exact canonical source and verify that its domain, canonical epic ID,
   number or declared slug, and heading agree. The source must contain exactly one matching
   authoritative epic body; summary/index mentions may repeat the identity, but a second body is
   an ambiguity even when its text is identical.
4. Derive the `runKey` and all filenames once from the verified tuple. Carry them unchanged
   through the whole run.
5. Before the first write, check that every existing selected plan/checkpoint embeds the same
   identity. A mismatch is a refusal, not a migration opportunity.

The following conditions require a prompt or refusal with **no writes**:

- The index, routing contract, canonical system pair, or selected canonical epic source is
  missing or unreadable. Do not reconstruct routing from stale or historical files.
- A bare repeated number such as `Epic 1` matches more than one domain. List the matching
  canonical epic IDs and source paths and ask the user to select one.
- The domain, canonical epic ID, source path, number, slug, plan identity, or checkpoint
  `runKey` disagree.
- An unnumbered epic has no explicit canonical slug.
- Resume names no scope while more than one current checkpoint exists.
- A requested path is outside the unchanged output root or is a suffix/date variant of a
  canonical filename.

Do not create a temporary checkpoint while asking. Do not use file-based mode detection, the
first search hit, or a legacy bare-number filename to break a tie.

Resolve every candidate output to a normalized absolute path before writing. Its real parent
must stay under the normalized `{project-root}/_bmad-output/test-artifacts/`; refuse symlink or
path-alias escapes. Inputs may live elsewhere inside the fixture or repository, but outputs may
not.

## 4. Canonical selection by operation

### 4.1 Create

For `system`, update the canonical architecture/QA pair, the literal handoff, and the system
checkpoint. For an epic, update only the selected epic plan and its matching checkpoint. The
current-artifact index is also writable when — and only when — the run changes an indexed path,
identity, or status fact.

A fresh run updates existing canonical files in place. When a real canonical epic has no plan
yet, Create may create exactly the domain-qualified canonical plan and checkpoint and must add
that scope to the index in the same run. It must not invent dated copies, `-v2`, `-new`,
domainless `test-design-epic-{number}.md`, or a second handoff. If a matching checkpoint is in
progress, ask whether to Resume or start over; starting over may replace only that same
checkpoint after the user chooses it.

An existing plan without its canonical checkpoint, or a checkpoint without its canonical plan,
is an inconsistent partial run. Do not silently manufacture the missing half: report the pair,
ask whether the user intends a fresh Create, and write nothing until that choice is explicit. A
completed matching checkpoint may be replaced only as a fresh Create of the same identity.

### 4.2 Context loading

Every resolved run loads:

1. the current-artifact index;
2. the canonical system pair, because it owns shared risk, NFR, evidence, and execution rules;
3. the exact canonical product/architecture inputs needed for the resolved scope.

An epic run additionally loads its one canonical epic source, its existing epic plan when
editing or extending it, and **only its selected checkpoint**. Do not load another epic's plan or
checkpoint merely because it shares a number. System runs load only the system checkpoint.

Epic plans and checkpoints must carry `epicId`, `epicDomain`, `epicSourcePath`, and either
`epicNumber` or `epicSlug`, plus the resolved `runKey`; system checkpoints must carry
`runScope: system-level` and `runKey: system`. Missing or conflicting identity metadata is a
no-write refusal for Resume, Edit, and Validate.

Existing tests may be inspected for evidence boundaries, but unrelated epic plans and old
test-design artifacts are not discovery inputs. Approval-ungranted and declined decisions must
remain visible; document generation must not promote them.

### 4.3 Edit

Resolve the target path back to exactly one canonical scope before loading it. A system Edit may
modify only the explicitly confirmed member(s) of the platform pair or literal handoff; an epic
Edit may modify only the selected epic plan. Preserve its identity tuple. If the request names
only an ambiguous epic number, ask and make no write.

Edit refuses a missing canonical target and directs the user to Create. It does not create a new
file as a side effect of an edit request.

An Edit updates existing canonical artifacts. It never creates a suffix variant and never uses
another scope's checkpoint or report. Update the index only when the edit changes indexed facts;
an index update cannot claim approval, validation, or coverage that the operation did not earn.

### 4.4 Resume

Candidate checkpoints are the current canonical checkpoint paths listed or implied by the index.
Select the requested scope first, derive its expected `runKey`, then compare it with the selected
checkpoint before reading its progress body or writing anything.

- Matching `runKey` plus `workflowStatus: in-progress` and a `nextStep` that is a recognized
  Create step path: continue that exact step.
- Matching `runKey` plus `workflowStatus: generated`, all five Create steps recorded complete,
  `lastStep: step-05-generate-output`, and the canonical terminal `nextStep` prose below is a
  **terminal successful document-generation state**. Resume selects that identity, reports that
  there is no Create step to continue, and directs the user to human review and then Validate,
  Edit, or a fresh Create. It writes nothing and does not relabel generation as product
  completion, approval, or validation.
- The one canonical terminal `nextStep` value is: `document generation is complete; no Create
  step remains; proceed with human review, then choose Validate, Edit, or a fresh Create`. It is
  prose describing the boundary, not a fake step file.
- A malformed combination — including `in-progress` with an unknown/prose `nextStep`, or
  `generated` with missing/extra Create steps, a different `lastStep`, a step-path `nextStep`, or
  different terminal prose — is a no-write refusal.
- Mismatched `runKey`: refuse to resume and write nothing.
- Multiple candidates with no scope: list canonical identities and ask; write nothing.
- Unknown or missing progress metadata: refuse automatic continuation; write nothing.

Deleted or superseded checkpoints at commit `76a7220` are historical evidence, not current Resume
candidates. A legacy domainless, area-level, generic, or approval-bearing checkpoint cannot be
relabelled as `system` or `epic-{domain}-{number}`. If legacy state is encountered, require an
explicit scope selection, explain that the old state will not be inherited, and start or resume
only the matching current canonical checkpoint after the user chooses.

### 4.5 Validate

Resolve scope before loading outputs.

If any evaluated output is missing, unreadable, outside the resolved scope, or carries conflicting
identity metadata, refuse validation without writing a report or changing the index.

- System Validate evaluates the canonical architecture/QA pair and literal handoff, then writes
  `_bmad-output/test-artifacts/test-design-validation-report.md` and the system validation entry
  in the current-artifact index. It writes no epic report.
- Epic Validate evaluates the canonical system pair plus the selected epic plan, then writes
  `_bmad-output/test-artifacts/test-design-validation-report-epic-{domain}-{number}.md`, or the
  slug form for a real unnumbered epic, plus that epic's validation entry in the index. It writes
  no system or other-epic report.

Every validation report records:

- scope kind and full identity tuple;
- every evaluated path and its SHA-256 content hash;
- the repository `HEAD` captured before the run's first write, labelled as the run baseline;
- checklist results and any checks not executed.

After writing the report, update only that scope's validation entry in the current-artifact index.
An epic validation never overwrites the system report, another epic report, plan, or checkpoint.
A system validation never overwrites an epic report. Validation does not edit the evaluated
outputs and does not inherit a historical verdict or approval.

Treat the report plus its one index update as one logical change. If either write fails, restore
the pre-run content of both files and report the failed validation run; do not leave a report and
index describing different states.

## 5. State, history, and evidence invariants

- `workflowStatus: generated` means only that documents were written.
- Approval, validation, coverage, execution evidence, and release readiness are separate states.
- New or rewritten files start approval-ungranted unless a new explicit approval is recorded.
- Historical files and claims are read at their pinned commit; reused filenames at `HEAD` do not
  acquire the meaning or approval of their predecessors.
- Whole-repository trace remains a planning audit with `allow_gate=false`.
- No Create, Edit, Resume, or Validate routing decision changes sprint status, coverage fields,
  gate identities, scenario files, trace JSON, service code, service gitlinks, or ClickUp data.

## 6. Pre-write checklist

Before every write, be able to state all of the following:

1. requested operation;
2. scope kind;
3. for an epic: domain, canonical epic ID, exact source path, and number or declared slug;
4. resolved `runKey`;
5. exact files allowed to change;
6. exact files that must remain unchanged.

If any item is unknown or inconsistent, halt without writing and ask for the missing selection.
