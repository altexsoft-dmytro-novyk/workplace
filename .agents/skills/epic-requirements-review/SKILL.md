---
name: epic-requirements-review
description: Review an epic and its story acceptance criteria against the project's requirements and architecture, finding requirement mismatches, missing behavior, corner cases, and dependency gaps. Resolve project context from the request and repository instructions; optionally check a supplied test-design plan. Does not grant human approval.
---

# Epic Requirements Review

Review the selected epic for requirements alignment, completeness, and observable behavior.
Use the user's language and keep the summary concise. Review only; apply fixes or record
approval only when separately requested and authorized.

## Scope and sources

Resolve the selected epic to its authoritative source and identity, including a project or domain
when needed to disambiguate. Accept a file, document, issue, or supplied text; do not require a
particular directory layout or ID format. Use the full epic and its stories/acceptance criteria,
including applicable shared constraints, rather than only a summary. Complete a unique identity
from available sources; ask when multiple candidates remain. A repeated number alone is ambiguous.
For a batch, review each epic separately and consolidate shared findings with explicit owners.
Identify superseded epics and their declared successors instead of reviewing them as active scope.

Resolve project context from:

1. The user's request: selected epic, requirements, architecture, scope, and optional test-design plan.
2. Applicable repository instructions, such as `AGENTS.md`, which may identify authoritative
   sources, decision precedence, naming conventions, and review rules.
3. Documents linked from those inputs, or targeted repository discovery if links are insufficient.

Use the selected epic, its stories, and the authoritative product requirements as the review basis.
Read the requirements' scope and cross-cutting sections plus all domain sections relevant to the
selected epic. For a compact requirements document, read it fully. Inspect the whole source's
structure to find obligations absent from the epic's own requirement map; do not search only
for IDs already mentioned in the epic. Load applicable architecture and adopted decisions when
available. Do not require architecture documents that the project does not use.

Requirements determine mandatory scope. Preserve the project's distinctions between required,
optional, deferred, excluded, and implementation-choice behavior. Use its declared authority
order and decision namespaces. A slice-specific exception does not remove a broader requirement.
If sources conflict without an explicit resolution, report both anchors and the needed decision.
Do not invent a precedence rule or import conventions from another project.

If the user supplies an epic test-design plan, compare it with the epic and requirements too.
Otherwise the main target is the epic, not an audit of implementation or test execution.
A missing test-design file does not itself prove that epic acceptance criteria are wrong.
If authoritative requirements are missing or unreadable, continue the internal-consistency and
corner-case review using available inputs, state that requirements alignment is unassessed, and
request the missing source. Do not treat the epic as independent proof of its own compliance.
Record all other missing inputs and their effect; never claim a complete review from partial inputs.

## Review

### 1. Requirements alignment in both directions

Build a compact mapping for all requirements applicable to the selected epic:

| Source requirement / section | Story / AC anchor | Assessment | Evidence or gap |
| --- | --- | --- | --- |

Use assessments: covered in specification, partial, missing, contradictory, externally owned,
or explicitly deferred/out of scope. “Covered” here means specified, never implemented or tested.
Do not trust the epic's requirement inventory as the entire scope: independently check relevant
cross-cutting constraints, lifecycle, integrations, and non-functional requirements (NFRs).

Check in both directions:

- Does every applicable requirement have concrete acceptance criteria (ACs) or an explicit external owner?
- Does every proposed capability have a requirement, adopted decision, or an honestly labelled
  optional proposal? Flag prohibited behavior and unnecessary scope expansion.

Check actor, permission, preconditions, state transitions, validation, failure outcome, and
observable success. Missing prose is not a defect when a precise binding reference supplies it.
Before calling an item missing, inspect referenced decisions and the named owning epic/story.
External ownership is adequate only when the dependency and consumer expectations are clear.
Distinguish a planning/documentation epic from a runtime epic; assess its actual deliverables.

### 2. Corner cases and cross-epic gaps

Select relevant cases, not a fixed quota. Derive each from a requirement, architectural invariant,
or concrete failure mechanism within the epic's scope. Select applicable probes:

- Actors, resources, operations, permissions, and ownership; overlapping roles, absent grants,
  unauthorized access, and sensitive data exposure where the product has access controls.
- State or permission changes during an operation; cancellation, expiry, deletion, stale caches,
  and unavailable owners or participants.
- Empty/duplicate/invalid inputs, null versus absent values, limits, date boundaries and effective
  dates; conflicting edits, retries, duplicate events, and partially completed transactions.
- Integration outages, delayed/out-of-order events, unresolved identities, replay/reconciliation,
  source-of-record ownership, and safe stale-data behavior.
- Information disclosure through counts, filters, sorting, lookup, saved views, downloads, errors,
  and any exports or notifications actually in scope.
- Cross-component effects: producer/consumer contracts, ownership handoffs, cleanup, cascading
  state changes, and atomicity between the main action and its required side effects.
- Applicable NFRs with measurable thresholds, workload, measurement boundary, and planned
  evidence. Do not substitute a component benchmark for an end-to-end requirement.

For each material case, express a short Given/When/Then or equivalent reproducible scenario.
If the expected result is unspecified, mark a decision gap and propose alternatives; do not
invent a required oracle. A reasonable detail within the project's implementation freedom is not
automatically a requirements defect.

## Findings and report

Deduplicate findings and rank by demonstrated impact. Do not manufacture a minimum count.
A finding contains:

- stable ID, category (requirements / corner case / dependency), severity and confidence;
- affected epic/story/AC and exact source anchors (file or document link + heading or line);
- expected versus specified behavior, or the precise unresolved decision;
- a concrete failure scenario and its consequence;
- a minimal proposed AC/clarification and its owner, or owner unresolved if none is established.

Use critical/high/medium/low severity with a short rationale. Keep optional improvements
separate from compliance defects regardless of their potential value. Label assumptions and
unverified claims. Recheck each suspected gap against the full epic and relevant references
before presenting it; discard contradicted or already covered findings.

Return:

1. A short assessment: ready for human review, revisions needed, or incomplete review, with reasons.
2. The requirements mapping.
3. Confirmed findings, most consequential first.
4. Unresolved decisions and optional improvements, if any.
5. Sources and limits: reviewed paths or document links, versions or repository revision when
   available, uncommitted inputs, and any unassessed dimensions.

For long reviews, lead with the top findings. Save a report only if requested; use a user-supplied
path or the project's existing review convention. Do not overwrite another active review.
Anchor claims about mutable artifacts to the version examined where available; label unversioned
or uncommitted evidence instead of inventing a version.

A review assessment does not grant human approval, change workflow status, or certify release
readiness. Keep review findings, human approval, any formal validation process, and implementation
or test-execution evidence separate. Update project artifacts only when the user requests it.
