# Test-Design Consolidation Verification

**Verification status:** **PASS — Task 5 routing mechanics and preservation checks are complete.**
**Task 4 routing configuration:** **PASS.**
**Task 5 platform trace/planning-row subset check:** **PASS.**
**Task 5 full 56-ID legacy-priority checker:** **PASS after a verified RED/GREEN fix wave.**
**Task 5 copied-entrypoint exercises:** **PASS for routing outcomes; generated-prose quality was not assessed.**
**Product readiness verdict:** none; this report is not a gate decision.

The post-fix `.claude` report records 22 isolated Git-copy cases covering the primary and
adversarial routing matrix; every routing outcome matched the contract. Its
`DONE_WITH_CONCERNS` verdict leaves only generated-prose quality unassessed. The updated
post-fix `.agents` report has verdict `DONE`: it records per-case loaded-input manifests and a
completed real-Git synthetic Create → terminal Resume → Validate lifecycle. The independent
post-fix review's two remaining `.agents` evidence gaps are therefore closed. None of these
results is a product-readiness, approval, coverage, or gate-status claim.

## 1. Baseline and scope

| Pin | Value |
| --- | --- |
| Workspace baseline / current `HEAD` before migration writes | `76a7220701ac6f16843dad8b303934f9a958b54c` |
| Backend gitlink | `f1eea3c048821011da96fba20d9b517f7d0e4f1b` (submodule uninitialised in this worktree) |
| Frontend gitlink | `fa3d3198aa9921c26d22307542ab72834a03b899` (submodule uninitialised in this worktree) |
| Branch | `docs/2026-09-10-test-design-consolidation` |
| Isolated worktree | `/Users/home/bootcamp/workplace-test-design-consolidation` |
| Fixture root | `/private/tmp/test-design-routing-fixture-20260910-01` |

The verification covers documentation migration, identity routing, historical citation anchors,
ledger preservation, and forbidden-file boundaries. It executes no service suite, scenario,
trace completion hook, ClickUp operation, live-provider call, or product readiness gate.

## 2. Task 4 routing result

Created:

- `docs/test-design-workflow-contract.md`;
- `_bmad/custom/bmad-testarch-test-design.toml`.

The team override is sparse. Its effective values through both installed entrypoints are:

```json
{
  "workflow": {
    "activation_steps_prepend": [
      "Before workflow mode selection, read {project-root}/_bmad-output/test-artifacts/test-design/README.md and {project-root}/docs/test-design-workflow-contract.md; resolve the requested scope exactly as the contract requires before choosing or writing any input, output, checkpoint, edit target, resume target, or validation report. On ambiguity or identity mismatch, halt without writes."
    ],
    "activation_steps_append": [],
    "persistent_facts": [
      "file:docs/test-design-workflow-contract.md"
    ],
    "on_complete": ""
  }
}
```

`diff -qr` reports no difference between the `.agents` and `.claude` skill trees. No repository
personal override exists. The fixture adds a highest-precedence `.user.toml` with
`workflow.on_complete = ""`; the resolved completion hook and append action list are empty.

The contract explicitly overrides stock bare-`epic_num`, title-derived slug, unconditional
validation-report, and display-name-derived handoff routing. It also refuses identity mismatch,
missing inputs, duplicate authoritative epic bodies, path/symlink escape, partial plan/checkpoint
pairs, and report/index partial-write state.

## 3. Multi-lens review

The Task 4 contract was reviewed sequentially with the BMad adversarial, edge-case, structure,
and prose lenses. A later independent post-fix review confirmed the substantive preservation
fixes and identified two `.agents` evidence gaps, both subsequently closed by the updated
post-fix `.agents` rerun.

The first draft had the following 15 actionable gaps; all were corrected before the final checks:

| Finding | Resolution |
| --- | --- |
| Create did not name the index as an allowed write | Index is writable only for changed indexed facts |
| A previously unplanned real epic had no creation rule | Create writes exactly one canonical plan/checkpoint and indexes it |
| Validate said “only report” while also requiring an index update | Allowed write sets now name report plus one index entry |
| “Baseline commit” was ambiguous | Defined as `HEAD` captured before the first write |
| Filename token characters were unconstrained | Lowercase ASCII token and canonical decimal rules added |
| An unnumbered slug could collide with a numbered epic | Same-domain slug/number collision is refused |
| A unique canonical ID supplied alone had no path | It may complete only from exactly one canonical-source match |
| Duplicate epic bodies were not handled | A second authoritative body is a no-write ambiguity |
| Missing index/contract/system pair/source had no branch | Missing or unreadable routing inputs refuse without reconstruction |
| Output containment was lexical only | Normalized path and real-parent confinement are required |
| Plan-only or checkpoint-only partial state was undefined | It requires an explicit fresh-Create choice before any write |
| Required epic identity metadata was implicit | `epicId`, domain, source, number/slug, and `runKey` are explicit |
| Edit could accidentally create a missing target | Edit refuses and directs the user to Create |
| Validate could run on missing or cross-scope inputs | It refuses without report or index writes |
| Report and index could be left inconsistent | They are one logical change with pre-run restoration on failure |

The final contract is 2,239 words. Repetition of no-write conditions is intentional for an LLM
reader and was not treated as removable prose.

## 4. Self-contained fixture and hook confinement

The fixture contains copies, not symlinks, of:

- both complete `bmad-testarch-test-design` skill trees;
- `resolve_customization.py` and `config_utils.py`;
- `_bmad/config.toml`, `_bmad/config.user.toml`, and `_bmad/tea/config.yaml`;
- the candidate team override and routing contract;
- the current index, platform pair, handoff, system checkpoint/report;
- the UM-E1 and PMC-E1 plans, checkpoints, and canonical epic sources;
- the migration ledger;
- a pinned historical `runKey: user-management` checkpoint;
- a deliberate mismatched checkpoint;
- a synthetic unnumbered fixture epic with canonical domain `fixture`, canonical ID
  `FIX-E-IDENTITY-RECOVERY`, and canonical slug `identity-recovery`.

No credential-like file and no symlink is present. Both fixture resolver calls pass an explicit
`--project-root /private/tmp/test-design-routing-fixture-20260910-01`; no live skill path is used.
All candidate output paths normalize under
`/private/tmp/test-design-routing-fixture-20260910-01/_bmad-output/test-artifacts`.

Before/after SHA-256 inventories around both static probes were byte-identical. The probes wrote
no fixture artifact, test, report, checkpoint, plan, or repository file.

## 5. Observed post-fix routing matrix

**Reproducibility note.** The original entrypoint exercise reports lived under
`/private/tmp/test-design-routing-fixture-20260910-01/` and are **not committed**. That matrix
is therefore **not independently inspectable from the repository alone**. Reproducible routing
coverage is provided by `scripts/test-design-workflow-routing.cjs` and
`npm run test:test-design-routing`, which enforce the contract's terminal `nextStep`, system
Validate scope, Resume refusal rules, and plan/checkpoint hash pairing on the committed artifact
set.

| Case | Observed post-fix outcome |
| --- | --- |
| System Create | PASS — canonical outputs only; `.claude` observed byte-identical output and no unintended delta |
| UM Epic 1 Create | PASS — domain-qualified outputs only; input manifest proves UM isolation |
| Platform Capabilities Epic 1 Create | PASS — distinct domain-qualified outputs only; input manifest proves PMC isolation |
| Bare `Epic 1` | PASS — ambiguous request refused without writes |
| Matching Resume | PASS — terminal checkpoint halted without writes |
| Mismatched Resume | PASS — identity mismatch refused without writes |
| Historical checkpoint | PASS — historical-only target refused without writes |
| System Validate | PASS — actual `HEAD` captured; only system report and index written |
| Epic Validate | PASS — actual `HEAD` captured; only selected Epic report and index written |
| Repeated Create | PASS — deterministic byte-identical result, no suffix variant |
| System Edit | PASS — only the allowed QA section changed |
| Selected epic Edit | PASS — only the selected Epic plan changed |
| Unnumbered Create/select/Resume/Validate | PASS — both entrypoints completed the slug lifecycle; `.agents` used real baseline `1181034350ac6eae11becba2029c21df53792575`, terminal Resume made no write, and final diff was exactly index, slug plan, slug checkpoint, and slug validation report |

The `.claude` rerun also observed all seven adversarial cases: missing contract, partial canonical
pair, duplicate body identity, invalid identity token, forbidden suffix alias, symlinked
real-parent mismatch, and Validate rollback. Each matched the required refusal or restoration
behavior. The independent review initially left `.agents` input-manifest and real-Git generated
Resume evidence unverified; the updated `.agents` report supplies both. No Task 5 routing item
remains unverified. Generated-prose quality was not assessed.

## 6. Ledger and trace-input comparison

Two read-only fixture probes re-derived:

| Property | Result |
| --- | ---: |
| Ledger rows | 565 |
| `preserve` | 328 |
| `merge` | 90 |
| `replace` | 96 |
| `retire` | 51 |
| Bare inherited targets | 19 (`same pattern`: 6; `same`: 13) |
| Canonical `TR-*` rows | 119 |
| Ledger `plat:TR-*` rows | 119 |
| Missing/extra `TR-*` IDs | 0 |
| Platform planning IDs (`P0-PLAT-*` + `P1-PLAT-*`) | 16 old, 16 new |
| Platform planning-ID identity delta | 0 |
| Legacy `TD-UM-*` source IDs after combined-cell expansion | 56: 8 P0, 33 P1, 10 P2, 5 P3 |
| Legacy disposition results | 51 active, 5 retired |
| Pure-preserve legacy priorities | 33 of 33 exact |
| Explained legacy priority changes | 5: `DOC-01` P3→P1; `EXP-03` P3→P2; `LIST-04` P2→P1; `NFR-PERF-01` P1→P0; `NFR-PII-01` P3→P2 |
| Unexplained legacy priority delta | 0 |
| Unexplained evidence-contract delta | 0 |

One evidence cell is textually different and semantically explained:

- `TR-7-03`: the ledger says “harness UNDECIDED; not k6, not ACM-9, not P6; contract A.” The
  canonical row says “harness UNDECIDED; contract A only” and links the contract-A section,
  which explicitly says no ACM-9 or P6 result is evidence and the harness does not exist. This is
  a justified compression, not an evidence-meaning change.

The All Employees list contract remains P0 and ≤2 seconds, with its statistic/environment/load
model and harness unresolved. ACM-9 and P6 remain separate subjects and are not evidence for it.
Approval-ungranted and NOT-RUN states remain visible in system and epic checkpoints.

Task 4 closes the five forward destinations recorded in ledger §16.4a; ledger §17 records the
closure without rewriting the earlier Task 3 snapshot.

## 7. Removed artifacts and historical citations

Exactly nine superseded files remain staged for deletion. All 14 historical files linked by the
current index and canonical artifacts exist at commit `76a7220`. Current canonical references to
the removed names are historical commit links (or ledger source/disposition entries), never live
input/output paths. During Task 5, unlinked historical citations found in canonical epic plans,
checkpoints, the index, system progress, validation history, and the handoff were converted to
commit links without changing their claims; Story 1.6 now links each retired artifact it names to
the same commit as well.

## 8. Forbidden-change boundary

`git diff` and `git status` show no change to:

- canonical trace, coverage, gate, or live-verification JSON;
- any sprint-status YAML or coverage field;
- `docs/project-requirements.md` or `docs/architecture/**`;
- any scenario under `docs/test-cases/**`;
- either service gitlink or any service file;
- ClickUp scripts, mappings, workflows, or external data.

No trace completion hook or live integration was invoked.

## 9. Candidate SHA-256 hashes

| Candidate | SHA-256 |
| --- | --- |
| `_bmad/custom/bmad-testarch-test-design.toml` | `1c2a1da9bf67d2aac165a20c70783e2bba88e756ee88cc3ee68813d9bbb29bf9` |
| `docs/test-design-workflow-contract.md` | `1212e87968a6e08de455afd5f100bd862196b829bd4031677ea42d85fcc09151` |
| `test-design-architecture.md` | `ad0c675f5ffa6512366e1b2899e162727072ebf5917540e2c83605ef06b61a65` |
| `test-design-qa.md` | `436ac635e0013350394288428e11c1d2caf7142d6045ba7b58fe85df6bf57c1c` |
| `test-design-epic-mentorship-1.md` | `f6a28ff7c5fe706159416d9b1332faeda31de8eedc3b735dae883b9cd10e33d2` |
| `test-design-epic-platform-capabilities-1.md` | `f9a5a44286d3cb4defd02879e72e6adc18973cb72e542a938e68fc0f6c540728` |
| `test-design-epic-user-management-0.md` | `b0aba3eabc9681bf24e5ac86eca9dec9637e3172bb7c14340be21e45d29c2e61` |
| `test-design-epic-user-management-1.md` | `12ef0c87ff694140914cd9b08cf308e0269e6cac68441e394667756dc5ad5372` |
| `test-design-epic-user-management-2.md` | `2705e61413ec42863847a3053c1cb3dd6ad241f9d5940fffc5e7c46cfa556e36` |
| `test-design-epic-user-management-3.md` | `9ea0a8f38c3ebb03bff5316d4fc7fde9c17be8580b0e177a63df76147345878e` |
| `test-design-epic-user-management-4.md` | `32fb1b841351d3b7295e631afad5ab3de45fcc8836c445d373040833306ac7ac` |
| `test-design-epic-user-management-5.md` | `2ff9124fc30c4b582805bd1b03eba3b3685011f499bdf3d9eacba61165f2fcb7` |
| `test-design-epic-user-management-7.md` | `fedaea30065f5d8c01a1b5c942b81bfe5b1e33dbd7e63e681005ca35e2e8892c` |
| `test-design-progress-system.md` | `701bd5818e881e9158ec263f24003c08c11d528cbbf7042aeca98983364b13cf` |
| `test-design-progress-epic-mentorship-1.md` | `088e3f890c7daef2e450abb5b946f40406d521d80b97bde4ec798f0e4b07c1ff` |
| `test-design-progress-epic-platform-capabilities-1.md` | `43da65f27208daee3c523011cbe37b1f88c78c8a420bf33858d66c926f0e0a67` |
| `test-design-progress-epic-user-management-0.md` | `4abf5efeb87664ee949f5f25e1f503ff99f0f3dfc3ae0b7a1425d7f4d006de29` |
| `test-design-progress-epic-user-management-1.md` | `2c82c02e3b2fcc653f78498800cf4b3a600936f1e1c245d729589c1bbcefc913` |
| `test-design-progress-epic-user-management-2.md` | `8ef0d71669d02511ebe0ebcb53e4d973665d66fc4266e4661706918f81011f53` |
| `test-design-progress-epic-user-management-3.md` | `0d6cc0e6b657539e0e0872256f45abf36a9e94344b2ae48c09d4fe3ac83dc352` |
| `test-design-progress-epic-user-management-4.md` | `d528c492b3cf572d18c8f3ff1d7f758a14f56387f65c96605d48e36189923ba4` |
| `test-design-progress-epic-user-management-5.md` | `882d5c2cdf07b6821c627a273714602923bb7bf9c674b14a03f7f0f038b197e7` |
| `test-design-progress-epic-user-management-7.md` | `2049bf307aebc7c12ef973dede283e7cd50bd170f593325693a1b4aa60cff722` |
| `test-design-validation-report.md` | `0174ba6598c7a9ccf50e929a6776104974b0089ddd7e65a3fa37ea022ee9d095` |
| `test-design/people-management-handoff.md` | `535a61b4307125d77ec5e551dbdaaae314f7e6896ab6d1c7efb73184898296b4` |
| `test-design/README.md` | `6c32dfdb2f0b20267903adaaabff279a8f838f0212c89f7cf8a107f6a9e6d76b` |
| `test-design/migration-map.md` | `9f2dd6b27f68dd2f83fd61ee4ea00e54bf6b188ae1e98f8b37c888a1408d2a32` |

These hashes were captured after the PR review fix wave on 2026-09-11 and match the committed
files at that moment (`npm run test:test-design-routing` verifies plan/checkpoint pairing).

## 10. Commands and outcomes

Passed:

```text
node scripts/epic-id-guard.cjs --root .
  OK — 37 epic and 134 story definitions across 13 files, 140 tracking keys across 5 files

node --test test/trace-artifact-naming.test.cjs
  2 pass, 0 fail

diff -qr .agents/skills/bmad-testarch-test-design .claude/skills/bmad-testarch-test-design
  no output

resolve_customization.py --project-root . --skill <each installed entrypoint> --key workflow
  identical effective blocks

resolve_customization.py --project-root <fixture> --skill <each copied entrypoint> --key workflow
  identical effective blocks; on_complete empty

node <fixture>/verify-routing-contract.cjs <fixture>
  static assertions pass; no writes

node <fixture>/verify-trace-inputs.cjs <fixture>
  565 ledger rows; 119 trace IDs; 16 platform planning IDs; no unexplained delta

node <fixture>/verify-legacy-priorities.cjs <fixture>
  56 legacy IDs (8 P0, 33 P1, 10 P2, 5 P3); 51 active; 5 retired;
  33 pure-preserve exact; 5 explained changes; 9 identities/terminal checkpoints agree

git diff --check
  no output
```

Post-fix copied-entrypoint evidence:

- `.claude`: 15 primary plus seven adversarial isolated Git-copy cases; all routing outcomes
  matched the contract.
- `.agents`: actual loaded-input manifests for system, UM-E1, PMC-E1, and synthetic cases; a
  completed real-Git synthetic Create → terminal Resume → Validate lifecycle with exact scoped
  write sets.
- Independent review reconciliation: its two remaining `.agents` evidence gaps are closed by
  the updated `.agents` rerun report.

## 11. Completion decision and unverified boundaries

Both copied entrypoints were exercised after the fix wave. The `.claude` report records the full
primary and adversarial matrix; the updated `.agents` report supplies per-case input manifests
and the real-Git completed synthetic lifecycle that the independent review requested. No Task 5
routing-matrix item remains unverified.

Final SHA-256 recheck confirmed the override hash as
`1c2a1da9bf67d2aac165a20c70783e2bba88e756ee88cc3ee68813d9bbb29bf9`; the complete
candidate table above was compared mechanically with the current files with no mismatch.

Task 5 **routing mechanics and preservation verification** is therefore complete. Generated-prose
quality was not assessed and is not claimed. Task 6 is not started, and no integration commit is
created. Service behavior, browser/API behavior, product readiness, approval state, coverage, and
gate status remain unverified and are not claimed by this report.
