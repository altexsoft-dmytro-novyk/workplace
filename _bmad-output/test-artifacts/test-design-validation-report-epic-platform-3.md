---
runScope: 'epic'
runKey: 'epic-platform-3'
epicId: 'PLAT-E3'
epicDomain: 'platform'
epicSourcePath: '_bmad-output/planning-artifacts/platform/epics.md'
epicNumber: 3
operation: 'Epic Validate'
verdict: 'CONCERNS'
supersedes: 'CONCERNS (2026-09-12, re-validation), same path, pre-Edit text'
date: '2026-09-12'
runBaseline: '4956cf68ab015d1f802df61a84447c2ff4a68df4'
independence: 'independent of authorship — see Independence'
---

# Epic Validation Report — PLAT-E3 Access Control Kernel MVP

**Verdict: CONCERNS**, with two concerns and four WARNs.

The four concerns and the WARN raised against the pre-Edit text are **closed and verified closed**.
The Edit run's substantive work — tracing C-2 from three artifacts to its root in SPEC CAP-6,
establishing the correction ordering, and scoping the approval — was re-checked against primary
sources and **holds**.

Two new concerns remain, both narrow, neither touching an obligation, risk, priority, threshold or
estimate. One of them is the **third recurrence** of a defect class this document pair has now
produced three times.

This run supersedes the report previously written to this same path. Per contract §5 it inherits no
verdict from its predecessor; per §4.5 it evaluates the text at the hashes below and writes only
this report and the PLAT-E3 index entry.

## Identity and baseline

| Field | Value |
| --- | --- |
| Scope kind | `epic` |
| `runScope` / `runKey` | `epic` / `epic-platform-3` |
| Canonical epic ID | `PLAT-E3` |
| Domain | `platform` |
| Source path | `_bmad-output/planning-artifacts/platform/epics.md` |
| Epic heading | `## Epic 3: Access Control Kernel MVP` (line 424; the `### Epic 3` at line 140 is the Epic List summary) |
| Epic number | 3 |
| Run baseline (`HEAD` before first write) | `4956cf68ab015d1f802df61a84447c2ff4a68df4` |

Identity metadata agrees across the plan, the checkpoint, the canonical source and the index. §3
permitted the run to proceed. Unlike the previous run, the evaluated outputs were **stable
throughout**: both were committed at `9c5fef8` and `4956cf6` before this run opened, and neither
changed on disk during it.

## Evaluated paths and content hashes

| Path | SHA-256 |
| --- | --- |
| `test-design-epic-platform-3.md` | `85a6bb5bf0b3b787f20d489c9ab35616c2b3ca2d14ea8306f1d3ed355590c414` |
| `test-design-progress-epic-platform-3.md` | `4c0f32acb73418a0c1cf2489fe5bbf1b0a2b57499820c4aa3390117d24febda4` |
| `test-design-architecture.md` | `133efa612ad55b012fc8be9bc6a77d1d6f55e4bbdba99a8ee0404acccb648ec5` |
| `test-design-qa.md` | `b9f95b0946054063df722f8b007577b37fa35893c0a2ba9cc35d5c6e69aad84c` |

The system pair is loaded as shared authority under §4.2 and is unchanged since the previous run.
It is not re-validated here; its own verdict remains `test-design-validation-report.md` (PASS,
2026-09-11).

### A cited source is in flight

`_bmad-output/specs/spec-access-control-kernel-mvp/` carries **uncommitted** changes from a
concurrent session — `SPEC.md`, `stories.yaml`, `validate.py`, `.memlog.md` — and CAP-6 is exactly
the artifact Open item 12 names as the root of C-2. The SPEC is a **source this run checks
citations against**, not an evaluated output, so it does not enter the hash table.

**Level-1 citation checks were therefore made against the committed text at `HEAD`**, which is what
the plan's own table says it describes ("stated at this plan's HEAD"). The in-flight amendment was
read separately to verify the plan's in-flight claims. Both are reported below and kept distinct.

## Independence

This run, like its predecessor, is independent of authorship: it did not write the plan, the
corrections, the Edit, or any previous report. Same caveat as before — a second agent pass in the
same repository, not a third-party audit.

## Predecessor findings — verified closed

| Finding | State |
| --- | --- |
| **C-1** — checkpoint claimed S10/S11 Colleague narrowing had "no named owner" after the plan retracted that as false | **Closed.** Both sites corrected (`:110` coverage row, `:167` second-pass summary). Both now name UM `FR-17` and `TT-E1-S1.2`, state the real gap as `FR-17` being deferred and unscheduled, and leave S1 photo mutation as the only ownerless piece. No occurrence of "no named owner" for S10/S11 survives. |
| **C-3** — plan contradicted itself on approval and validation state | **Closed.** Both prose blocks rewritten. No occurrence of "has not yet run", "re-validation pending", or "No approval is granted by this Create run" survives. Frontmatter `validationStatus` corrected PASS → `CONCERNS (2026-09-12, re-validation)`; `independentRevalidation` updated to its result. The rewritten **Approval** section is a clear improvement on what it replaced: it states what the approval covers, what it does not become, and the validation state it was granted against. |
| **C-4** — plan and checkpoint disagreed on approval and validation status | **Closed** for the fields named. `approvalStatus` and `validationStatus` now agree across both files. See C-1 below for the one metadata field that did not follow. |
| **W-1** — sentence duplicated verbatim in the checkpoint | **Closed.** Zero occurrences remain. |
| **W-2** — index summary paragraph contradicted its own PLAT-E3 row | **Closed** by the previous validation run's index edit. |

## Open item 12 — re-checked against primary sources, and it holds

The Edit run's central claim is that C-2 traces past the scenario cards to the SPEC. That claim is
new prose, so it carries new citation risk, and this run treated it as such. **Every level-1 through
level-4 citation was verified:**

| Claim | Source checked | Result |
| --- | --- | --- |
| CAP-6's *success* criterion still carries the interim binding, at `SPEC.md:150` | `git show HEAD:…/SPEC.md` line 150 — "`ACCESS_CONTROL_PORT` remains bound to `InterimAccessControlAdapter`" | ✅ Exact line, exact text |
| `access-control.module.ts` header comment still states the interim binding | Comment block opens at `:15`; the "still binds … to `InterimAccessControlAdapter`" clause is at `:17–18` | ✅ Quote accurate (line cite points at the block's first line, not the quoted clause — see the note under W-4) |
| `README.md:452` index row repeats it | Verified | ✅ |
| `acm8-kc-02` / `acm8-kc-03:27` assert it | Verified | ✅ |
| The executable `ACM8-KC-02` and the scenario card of the same name have diverged | `acm8-kernel-composition.e2e-spec.ts:90–98` asserts `AccessControlFacadeAdapter`; the card asserts the opposite | ✅ The distinction the plan draws is real and correctly drawn |
| The UMAC-1 story left an explicit follow-up list, unclaimed for eleven days | `…/UMAC-1-production-rebind-access-control-port-to-the-real-adapter.md:47–50` — the heading is quoted **verbatim**, and the three items are exactly the `acm8-kc-02/03` realignment, the stale `access-control.module.ts` header comment, and `deferred-work.md` #83/#85 | ✅ Verbatim |
| There is no `access-control` planning domain | `_bmad-output/planning-artifacts/` listed — 12 domain directories, none of them `access-control` | ✅ The structural explanation holds |
| The cards are approved Stage-1 artifacts | `spec-access-control-kernel-mvp/approvals.yaml:1012+` — `story_id: ACM-8-scenarios`, `stage: stage-1-scenarios`, approver Anna Pikula, `2026-08-31T09:45:00Z` | ✅ Exact |
| A concurrent uncommitted change amends CAP-6 and adds `ACM-8R-scenarios` scoped to the five `ACM8-KC` docs and the module comment | `git diff` on `stories.yaml` — the story exists with that id, title and scope | ✅ Accurate, and correctly labelled in-flight rather than done |
| The ordering constraint — CAP-6 before the cards | The cards' Trace lines resolve *to* CAP-6 | ✅ The constraint is real |

**The provenance failure mode has not recurred.** Three consecutive passes of new prose on this
plan have now produced no fabricated citation. The reasoning that `ACM-8R-scenarios` is a better
owner than the earlier DEPT-4 suggestion is also sound: DEPT-2/DEPT-4 own the `profile:timeline`
permission-catalog reconciliation, which has nothing to do with the ACM-8 port binding.

## Concerns

### C-1 — The checkpoint's `nextStep` still routes C-2 to the owner the same pass retracted

`test-design-progress-epic-platform-3.md:8`:

> `nextStep: 'C-1, C-3, C-4 and W-1 closed; C-2 recorded as plan Open item 12 (five artifacts, root
> at SPEC CAP-6) **and recommended to DEPT-4**. …'`

The Step-8 pass that wrote that same file retracted the DEPT-4 routing. Its own body says so at
`:255–258` — the in-flight `ACM-8R-scenarios` story is "the owner if it lands, **superseding this
step's earlier DEPT-4** suggestion" — and the commit message for `4956cf6` says the same. The plan's
Open item 12 calls `ACM-8R-scenarios` "a better home than this plan's earlier suggestion of DEPT-4".

Frontmatter and body of one file now disagree about who owns C-2.

**This is the third occurrence of one defect class.** The independent audit's finding F-4 was a
plan-side correction not carried into the checkpoint. C-1 of the previous run was the same. This is
the same again, now entirely inside the checkpoint — body corrected, frontmatter not. The Edit run
closed the second instance and created the third in the same pass.

`nextStep` is not decorative: §4.4 makes it the field Resume reads to decide what happens next. A
Resume or a handoff taking `nextStep` at face value routes C-2 to DEPT-4.

### C-2 — Open item 12 presents a completed root-trace, and the enumeration is short by two

Open item 12 states that "the stale claim runs four levels deep" and gives a five-row table as the
result of tracing C-2 to its root. Two further artifacts carry the superseded expectation and are
not in it:

| Artifact | What it carries |
| --- | --- |
| `acm8-kc-01-facade-resolves-from-real-container.md:5` | Trace quotes CAP-6's success criterion **including** "while `ACCESS_CONTROL_PORT` remains bound to `InterimAccessControlAdapter`" |
| `acm8-kc-05-corrected-module-header-comment.md:9, 29–30` | Trace quotes the sprint proposal's "`UserManagementModule` continues binding `ACCESS_CONTROL_PORT` to `InterimAccessControlAdapter`"; and its **Then** requires the corrected comment to say rebinding "is a separate, **not-yet-authorized** decision" — which the UMAC-1 Stage 3 cutover made false |

Seven surfaces, not five. `acm8-kc-04` is clean.

The level model is sound and the root identification is right; it is the level-2 enumeration that is
incomplete. This matters because the item is written as finished tracing work — "Tracing the claim
to its source showed five" — and a reader takes the table as the work list.

**Mitigation, and it is substantial:** the in-flight `ACM-8R-scenarios` story is scoped to **all
five** `ACM8-KC` cards, and its dispatch text says "acm8-kc-01, -04, and -05 are re-checked against
amended CAP-6 and edited only where they repeat the struck expectation." The remediation scope
already covers the gap. The plan's own table is the artifact that is short, not the plan of record
for fixing it.

Correcting these files stays outside this plan's allowed file set, so the disposition remains
record-only either way. The fix is to complete the table, not to act on it.

## WARNs

**W-1 — The committed repository contradicts itself about this epic's verdict.** At `HEAD`
(`4956cf6`), `test-design-validation-report-epic-platform-3.md` still carries `verdict: 'PASS'`,
while the committed plan and checkpoint both record `validationStatus: CONCERNS (2026-09-12,
re-validation)` and cite that report as their source. The CONCERNS report and the matching index
entry were written to the working tree by the previous run and were never committed, while the Edit
run's changes were. Anyone reading the repository at `HEAD` gets the superseded verdict from the
report and the current one from the two documents citing it. **This report and its index entry
should be committed** — the split resolves on commit and cannot be fixed inside the documents.

**W-2 — The pair's fourth gate threshold is still not carried.** Unchanged from the previous run and
not in the Edit's scope. `test-design-qa.md:1266–1268` states its own fourth explicitly — *"The
fourth is restated: 'k6 baseline or waiver' becomes 'All-Employees-list performance baseline or a
recorded waiver, harness undecided'."* The plan quotes the three-threshold sentence and stops
immediately before it. Not carrying the bar is defensible (it is Contract A / `PG-04`, explicitly
scoped out); ending the quote where a reader would learn a fourth exists is the gap. The separate
`≥ 80 % functional-requirement coverage` bar in the pair's **Exit criteria** (`:1658`) is likewise
not carried, consistent with the plan's stated no-percentage stance.

**W-3 — No test counts.** Unchanged and correctly assessed in both predecessors. The plan
deliberately gives scenario families instead, consistent with `PR-009`. The effort estimate cannot
be checked against a scenario count.

**W-4 — Input inventory still incomplete; one pinpoint cite is imprecise.** `inputDocuments` still
omits `pactjs-utils-zod-to-pact.md`, and `pact-broker-webhooks.md`, `pact-consumer-di.md` and
`pact-consumer-framework-setup.md` appear neither there nor in the plan's not-applicable set, which
claims to enumerate "the six `pactjs-*` / `pact-mcp.md` documents". Immaterial to a headless epic.
Separately, Open item 12 cites the module header comment at `access-control.module.ts:15` while the
quoted clause is at `:17–18`; the in-flight story cites `:18-19` for the same text. Every other cite
in that table is pinpoint-exact, so the inconsistency is worth a line.

## Checklist results

Unchanged from the previous run except where noted; the Edit moved no obligation, risk, priority,
threshold or estimate, and this was verified rather than assumed.

- **Prerequisites, Epic-Level Mode** · PASS
- **Step 1 · Context loading** · PASS — the `docs/test-cases/access-control-kernel/` input that the
  previous run found loaded-but-unreconciled is now reconciled in Open item 12, subject to C-2.
- **Step 2 · Risk assessment** · PASS — eight risks, arithmetic re-verified (one 3×3=9, seven
  2×3=6), residual risk documented.
- **Step 2A · NFR planning** · PASS — thresholds traced to sources; unknowns marked UNKNOWN.
- **Step 3 · Coverage design** · PASS — all 49 canonical acceptance criteria mapped; re-counted from
  the epic body this run (3.1=9, 3.2=5, 3.3=9, 3.4=8, 3.5=3, 3.6=6, 3.7=4, 3.8=5) and unchanged by
  the Edit.
- **Step 4 · Deliverables** · PASS
- **Output validation — risk matrix** · PASS
- **Output validation — coverage matrix** · PASS with WARN (W-3)
- **Output validation — execution strategy** · PASS
- **Output validation — resource estimates** · PASS
- **Output validation — quality gate criteria** · PASS with WARN (W-2)
- **Quality checks — evidence, classification, priority, levels** · PASS
- **Integration points** · PASS with WARN (W-4) — the C-1 defect the previous run recorded here is
  closed.
- **Cross-document consistency** · CONCERNS (C-1) — plan and checkpoint agree on approval and
  validation status; the checkpoint's `nextStep` disagrees with its own body on C-2's owner.
- **Accountability and logistics** · PASS — Open item 12 adds a named external dependency with an
  ordering constraint and an approval constraint, both verified.

## Checks not executed

- **Status File Integration.** No "Quality & Testing Progress" section exists in
  `platform/sprint-status.yaml`; contract §5 forbids this workflow from changing sprint status.
- **System-Level two-document validation**, the architecture/QA structural checklists, the anti-bloat
  and actionable-first checks, and **BMAD Handoff Validation.** Not applicable to an epic run.
- **Test execution.** No suite was run.
- **The in-flight SPEC amendment.** Read to verify the plan's in-flight claims; **not validated**.
  It is another session's uncommitted work, it is not a PLAT-E3 evaluated output, and whether it
  lands is outside this run.
- **`PLAT-E4`.** Not evaluated — §4.2 and §4.5.
- **Rollback procedure.** Not applicable; the run succeeded.

## What this verdict does not grant, and does not retract

No coverage claim. No gate result. No release readiness. No assertion that any test exists or
passes. It resolves no open item and closes no blocker.

**It does not retract the requester's approval,** granted 2026-09-12 and scoped in the plan's
rewritten Approval section. Approval and validation are separate states (contract §5). CONCERNS here
means the document set is not yet fully self-consistent — not that the approval was misplaced, and
not that the design is unsound. The design substance has now been checked three times and holds.

## Recommended next action

1. **Commit this report and the index entry** — W-1 is a repository-state contradiction that no
   document edit can fix.
2. **A short Edit** closing C-1 (one frontmatter line) and C-2 (two table rows). Both are small and
   neither needs a file outside the plan and checkpoint.
3. Then a further Epic Validate, which is the only operation that can clear CONCERNS.

On the recurring pattern: three passes have now corrected a body and left a metadata field behind.
It may be worth making "frontmatter agrees with body" an explicit pre-write check in this pair's
Edit routine rather than rediscovering it each round.

---

**Completed by:** Epic Validate (third run), acting as Master Test Architect
**Date:** 2026-09-12
**Epic:** `PLAT-E3` — Access Control Kernel MVP
