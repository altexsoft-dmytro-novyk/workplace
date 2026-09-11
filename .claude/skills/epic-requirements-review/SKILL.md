---
name: epic-requirements-review
description: Review a People Management epic and its story acceptance criteria against project requirements and market research, finding requirement mismatches, missing behavior, corner cases, and integration gaps. Use for epic requirements review; optionally check an attached epic test-design plan. Does not grant human approval.
---

# Epic Requirements Review

Review the selected epic for requirements alignment, completeness, and observable behavior.
Use the user's language and keep the summary concise. Review only; apply fixes or record
approval only when separately requested and authorized.

## Scope and sources

Resolve the selected epic to its domain, canonical epic ID, and source file, normally
`_bmad-output/planning-artifacts/{domain}/epics.md`. Use the full authoritative epic body
and its stories/acceptance criteria, not only the Epic List summary. Read shared constraints
in the source that apply to that epic. Complete a unique ID from repository sources;
ask only when identity is ambiguous. Do not infer identity from a bare repeated number.
For a batch, review each epic separately and consolidate shared findings with explicit owners.
Identify superseded epics and their declared successors instead of reviewing them as active scope.

Required inputs, relative to the repository root:

- `docs/project-requirements.md` — product requirements. Read fully so cross-cutting rules
  and requirements absent from the epic's own FR map are not missed.
- `docs/market-research/people-management-market-landscape-2026.md` — non-normative research.
  Read its evidence rules, caveats, corrections, and relevant capability sections. Start with
  §§7, 8, 11, and 17 to discover corner cases and process boundaries; follow relevant references.
- `AGENTS.md` and `docs/architecture/README.md`, then binding documents and PM spine decisions
  relevant to the scope. Read referenced approved decisions when they affect a finding.
- The selected epic source and separately referenced stories or specs needed to resolve its ACs.

Requirements determine mandatory scope. Respect NORMATIVE, DESIGN FREEDOM, GOOD TO HAVE,
and out-of-scope distinctions. Architecture constrains the design; if sources conflict,
report the conflict with both anchors instead of silently selecting a convenient interpretation.
Bare AD-n in rendered architecture means PM/AD-n. ACF/AD-n applies only to its declared slice;
kernel deferrals do not remove product-wide requirements.

Research is evidence and inspiration, including sections titled “Required” or “Mandatory.”
It becomes a binding product choice only through an explicitly adopted decision. Preserve its
research date and uncertainty; an absent vendor claim is not proof of absent capability.
Do not browse for fresh vendor facts unless requested or needed to substantiate a current claim.

If the user supplies an epic test-design plan, compare it with the epic and requirements too.
Otherwise the main target is the epic, not an audit of implementation or test execution.
A missing test-design file does not itself prove that epic acceptance criteria are wrong.
If a required source cannot be read, state which review dimensions remain unassessed; never
claim a complete review from partial inputs.

## Review

### 1. Requirements alignment in both directions

Build a compact mapping for all requirements applicable to the selected epic:

| Source requirement / section | Story / AC anchor | Assessment | Evidence or gap |
| --- | --- | --- | --- |

Use assessments: covered in specification, partial, missing, contradictory, externally owned,
or explicitly deferred/out of scope. “Covered” here means specified, never implemented or tested.
Do not trust the epic's FR inventory as the entire scope: independently check cross-cutting
authorization, lifecycle, audit, integration, and NFR requirements against the requirements file.

Check in both directions:
- Does every applicable requirement have concrete ACs or an explicit external owner?
- Does every proposed capability have a requirement, adopted decision, or an honestly labelled
  optional proposal? Flag prohibited behavior and unnecessary scope expansion.

Check actor, permission, preconditions, state transitions, validation, failure outcome, and
observable success. Missing prose is not a defect when a precise binding reference supplies it.
Before calling an item missing, inspect referenced decisions and the named owning epic/story.
External ownership is adequate only when the dependency and consumer expectations are clear.
Distinguish a planning/documentation epic from a runtime epic; assess its actual deliverables.

### 2. Corner cases and cross-epic gaps

Select relevant cases, not a fixed quota. Derive each from a requirement, invariant, concrete
failure mechanism, or cited research insight. Useful probes in this repository include:

- Actor × target × relationship × functional permission × section/record visibility; overlapping
  audiences, absent relationships, self-assignment, hidden versus forbidden targets.
- Permission, relationship, or employment changes during a session or operation; revocation
  deadlines; stale caches; departed actors, owners, recipients, or assignees.
- Empty/duplicate/invalid inputs, null versus absent values, limits, date boundaries and effective
  dates; conflicting edits, retries, duplicate events, and partially completed transactions.
- Integration outages, delayed/out-of-order events, unresolved identities, replay/reconciliation,
  source-of-record ownership, and safe stale-data behavior.
- Information disclosure through counts, filters, sorting, lookup, saved views, downloads, errors,
  and any exports or notifications actually in scope.
- Cross-domain effects: departure and tasks; campaign versus feedback record; staffing approval
  versus TimeTracker assignment; Shared-link policy versus link lifecycle; custom-field changes
  versus saved views; audit consistency with the owning write.
- NFRs with measurable thresholds, workload, measurement boundary, and planned evidence.
  Keep directory latency, ACM-9 resolver, and P6 measurements distinct when relevant.

For each material case, express a short Given/When/Then or equivalent reproducible scenario.
If the expected result is unspecified, mark a decision gap and propose alternatives; do not
invent a required oracle. A reasonable implementation detail within DESIGN FREEDOM is not
automatically a requirements defect.

### 3. Market-informed opportunities

Extract only insights relevant to the selected epic. For each, cite the local research section,
explain the user impact and concrete scenario, and check whether requirements already adopt,
exclude, or defer it. Classify it as:
- supporting evidence for an existing requirement finding;
- optional improvement requiring a product decision;
- excluded/deferred idea, reported only if it resolves a likely misunderstanding.

Do not turn vendor features, research security advice, optional integrations, notifications,
analytics, or broader talent-management functionality into mandatory acceptance criteria.

## Findings and report

Deduplicate findings and rank by demonstrated impact. Do not manufacture a minimum count.
A finding contains:
- stable ID, category (requirements / corner case / dependency / research opportunity), severity
  and confidence;
- affected epic/story/AC and exact source anchors (file + heading or line);
- expected versus specified behavior, or the precise unresolved decision;
- a concrete failure scenario and its consequence;
- a minimal proposed AC/clarification and its owner.

Use critical/high/medium/low severity with a short rationale. Keep optional research opportunities
separate from compliance defects regardless of their potential value. Label assumptions and
unverified claims. Recheck each suspected gap against the full epic and relevant references
before presenting it; discard contradicted or already covered findings.

Return:
1. A short assessment: ready for human review, revisions needed, or incomplete review, with reasons.
2. The requirements mapping.
3. Confirmed findings, most consequential first.
4. Optional research opportunities and unresolved decisions, if any.
5. Sources and limits: repository HEAD, reviewed paths, and uncommitted inputs where applicable.

For long reviews, lead with the top findings. Save a report only if requested; use a user-supplied
path or the domain's existing review convention. Do not overwrite another active review.
Anchor claims about mutable trace artifacts to the commit examined; label uncommitted evidence.

This review never changes `approval: ungranted`, marks an epic done, issues a TEA Validate
verdict, or claims release readiness. Human approval, formal test-design validation, and
implementation evidence remain separate.

