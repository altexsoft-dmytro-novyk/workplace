# Sprint-status bypass mitigation — second line of defense

**Author:** Winston (architecture), 2026-09-09  
**Trigger:** PR #47 review finding M2 — `guard:epic-ids` validates committed artifacts; status downgrade protection exists only in `scripts/sprint-status-generate.sh`, which a direct `uv run sprint_plan.py` (especially `generate --fresh`) bypasses.  
**Related:** [epic-number-collision verification](2026-09-09-epic-number-collision-verification.md), `_bmad/custom/bmad-sprint-planning.toml`, `.github/workflows/tests.yml` (`epic-id-guard` job comments)

---

## 1. Problem statement

### What is protected today

Three repo-owned checks run inside `scripts/sprint-status-generate.sh` before the real `sprint-status.yaml` is written:

| Check | Module | CI (`npm run guard:epic-ids`) | Wrapper only |
|---|---|---|---|
| Epic/Story ID uniqueness on repo artifacts | `scripts/epic-id-guard.cjs` | Yes | Also re-run on `--epic-file` args passed to the generator |
| Epic/Story ID uniqueness on this invocation's inputs | `scripts/epic-id-guard.cjs` | No | Yes |
| Status preservation (no drops, no unrequested changes) | `scripts/sprint-status-diff.cjs` | No | Yes — candidate generated on a temp copy first |

The BMad skill is steered toward the wrapper via `_bmad/custom/bmad-sprint-planning.toml` (`on_complete`, `persistent_facts`). That layer is advisory; it does not enforce at the process level.

### The bypass

Any caller can invoke the installed skill script directly:

```bash
uv run .agents/skills/bmad-sprint-planning/scripts/sprint_plan.py generate --fresh \
  --status-file _bmad-output/implementation-artifacts/user-management/sprint-status.yaml ...
```

Measured on a copy of the real user-management file, `--fresh` downgraded 21 entries and dropped seven more while reporting zero dropped orphans. The resulting YAML is syntactically valid and passes `guard:epic-ids`. ClickUp sync reads repository YAML as authoritative and would propagate the regression.

### Risk surface

| Stage | Epic ID collision | Status downgrade |
|---|---|---|
| Wrapper run | Blocked | Blocked |
| Direct `sprint_plan.py` | Partially blocked (repo guard only if run separately) | **Not blocked** |
| Local commit | Blocked (identity only, via CI on push) | **Not blocked** |
| CI / merge | Blocked (identity) | **Not blocked** |
| ClickUp sync runtime | N/A (reads committed YAML) | **Would sync bad state** |

The gap is **pre-commit / local generation**, not CI identity checks or ClickUp itself.

### False-positive constraint (PR #47)

Legitimate additive regeneration must pass: 21 new keys entering as `backlog` with every pre-existing key and status unchanged. The second line must not treat "new keys" or normal forward progress (`backlog` → `in-progress` → `review` → `done`) as violations.

---

## 2. Options considered

| Option | Mechanism | Pros | Cons |
|---|---|---|---|
| **A. Pre-commit hook** | On staged `**/sprint-status.yaml`, compare staged vs `HEAD` with a repo-owned guard | Immediate local feedback; catches bypass before push | Opt-in install (`core.hooksPath` or documented setup); skippable with `--no-verify`; no `--set` context at commit time |
| **B. npm script alias** | e.g. `npm run sprint:generate` → `sprint-status-generate.sh` | Discoverability; documents the blessed path | Does not prevent direct `uv run sprint_plan.py`; zero enforcement |
| **C. Patch `sprint_plan.py`** | Refuse `generate` unless env var set by wrapper | Hard block at source | **Rejected:** skill directory replaced on every BMad update; violates repo policy (customization via `_bmad/custom/` and repo scripts only) |
| **D. CI status-preservation check** | On PR, diff each changed `sprint-status.yaml` vs merge-base using shared diff logic | Cannot merge a bypass; same module as wrapper; complements identity guard | Feedback after commit; must distinguish accidental downgrades from intentional manual edits |
| **E. CI re-run wrapper** | Checkout base, run full `sprint-status-generate.sh generate` on copy, compare to PR file | Strongest simulation of generation path | Needs epic-file/stories-dir/project args per domain; heavy; false positives if PR legitimately advances statuses manually after generation |
| **F. Block `--fresh` in skill references only** | Documentation / agent facts | Zero code | Already present in `persistent_facts`; bypass remains trivial |

### Policy fork: wrapper vs commit-time

The wrapper uses **strict preservation**: any status change on an existing key requires an explicit `--set key=status` on the same invocation (`sprint-status-diff.cjs`).

At commit/CI time there is no `--set` vector. Manual status updates (normal dev workflow) are expected. A commit guard that reused strict preservation would false-positive on every story marked `done`.

**Resolution:** commit/CI guard uses a **monotonic policy** on existing keys, not strict preservation:

- **Allow:** new keys (any status); status rank increase or lateral move within the same rank; unchanged keys
- **Fail:** dropped keys; status rank decrease (downgrade)
- **Escape hatch:** `SPRINT_STATUS_ALLOW_UNSAFE=1` (same env var as the wrapper) for reviewed migrations — documented, never default in CI

Status ranks mirror `sprint_plan.py` (`STORY_RANK`, `EPIC_RANK`, `RETRO_RANK`): story `backlog < ready-for-dev < in-progress < review < done`; epic `backlog < in-progress < done`; retro `optional < done`. Unknown statuses fail closed (treated as non-monotonic change requiring review).

This passes PR #47 (additions only, no drops, no downgrades) and catches `--fresh` bypass (mass downgrades + drops).

---

## 3. Recommended approach

**Layered defense — keep the wrapper as generation-time gate; add a repo-owned commit/CI guard as second line.**

```text
Generation time          Commit time              Merge time
─────────────────        ─────────────            ────────────
sprint-status-           sprint-status-           npm run guard:sprint-status
generate.sh              commit-guard.cjs         (CI, vs merge-base)
  ├ epic-id-guard          (optional pre-commit)
  └ sprint-status-diff     monotonic policy
     (strict + --set)
```

**Primary recommendation:** implement **D + A** sharing one script:

1. **`scripts/sprint-status-commit-guard.cjs`** — compares two YAML contents via `compareTrackingStatuses` from `sprint-status-diff.cjs`, then applies monotonic rules to `changed` entries; fails on `dropped` or downgrades.
2. **`npm run guard:sprint-status`** — discovers changed `**/sprint-status.yaml` paths (CLI args or git diff), loads before/after content, runs guard.
3. **CI** — add step to the existing `epic-id-guard` job (or adjacent job): `npm run guard:sprint-status -- --base "${{ github.event.pull_request.base.sha }}"` on `pull_request`; on `push` to `main`, compare against previous commit or skip (PR is the merge gate).
4. **Optional pre-commit** — `githooks/pre-commit` calling the same npm script on staged files vs `HEAD`; document `git config core.hooksPath githooks` in a short README snippet (no Husky dependency required).

**Secondary (UX only):** `npm run sprint:generate -- …` alias to the wrapper — helps agents and humans find the blessed path but is not relied on for enforcement.

**Explicitly not recommended:** patching `.agents/skills/**/sprint_plan.py` (C) or CI full wrapper re-run (E) as the default gate.

---

## 4. Implementation sketch

### 4.1 New / extended modules

| File | Change |
|---|---|
| `scripts/sprint-status-diff.cjs` | Export status rank helpers (`storyRank`, `epicRank`, `retroRank`, `rankForKey`); optionally export `evaluateMonotonicDiff(before, after)` wrapping `compareTrackingStatuses` |
| `scripts/sprint-status-commit-guard.cjs` | **New.** CLI: `--before <path\|git-ref:path>`, `--after <path\|git-ref:path>`, or `--staged` / `--base <sha>` for git integration; respects `SPRINT_STATUS_ALLOW_UNSAFE=1` |
| `package.json` | `"guard:sprint-status"`, `"sprint:generate"` scripts |
| `test/sprint-status-commit-guard.test.cjs` | **New.** Cases: PR #47 additive-only; `--fresh`-style mass downgrade; manual forward advance; drop; escape hatch |
| `.github/workflows/tests.yml` | Step under `epic-id-guard` (extend comment block to document what this job now covers) |
| `githooks/pre-commit` | **New, optional.** `npm run guard:sprint-status -- --staged` |
| `docs/...` (one line) | Point agents at `npm run sprint:generate` in workspace AGENTS.md or existing sprint doc — not skill files under `.agents/skills/` |

### 4.2 `evaluateMonotonicDiff` logic (pseudocode)

```javascript
const { compareTrackingStatuses } = require('./sprint-status-diff.cjs');

function evaluateMonotonicDiff(beforeContent, afterContent) {
  const result = compareTrackingStatuses(beforeContent, afterContent, new Map());
  const violations = [];

  for (const { key, status } of result.dropped) {
    violations.push({ kind: 'dropped', key, status });
  }

  for (const { key, from, to } of result.changed) {
    if (rankForKey(key, to) < rankForKey(key, from)) {
      violations.push({ kind: 'downgrade', key, from, to });
    }
    // rank increase or lateral same-rank change: allowed (manual progress)
  }

  // result.added: always allowed
  // result.acknowledged: empty without --set; irrelevant here

  return { ok: violations.length === 0, violations, ...result };
}
```

### 4.3 CI wiring (sketch)

```yaml
# In epic-id-guard job, after guard:epic-ids:
- name: Sprint-status monotonic guard (PR)
  if: github.event_name == 'pull_request'
  run: npm run guard:sprint-status -- --base "${{ github.event.pull_request.base.sha }}"
```

For PRs that include an intentional non-monotonic migration (rare), the PR author sets a label or workflow input that exports `SPRINT_STATUS_ALLOW_UNSAFE=1` with mandatory review — mirror the wrapper's migration story.

### 4.4 Verification matrix (acceptance)

| Scenario | Expected |
|---|---|
| PR #47-style: +21 backlog keys, existing keys unchanged | Pass |
| Direct `--fresh` on copy committed | Fail (downgrades + drops) |
| Single story `backlog` → `done` manual edit | Pass |
| Story `review` → `backlog` correction | Fail (unless `SPRINT_STATUS_ALLOW_UNSAFE=1`) |
| First-generation new domain file | Pass (no before content) |
| `npm run guard:epic-ids` unchanged | Still passes on valid tree |

---

## 5. Out of scope for this design

- Changing ClickUp sync (already read-only on repository YAML; fixing source of truth is sufficient).
- Patching installable skill files under `.agents/skills/` or `.claude/skills/`.
- Replacing the wrapper's strict `--set` semantics at generation time — the wrapper remains the right tool when regenerating from epics.
- Auto-detecting which epic files were used to produce a commit (would require provenance metadata in YAML or commit messages — unnecessary if monotonic commit guard is in place).

---

## 6. Decision summary

| Layer | Tool | When |
|---|---|---|
| 1 (existing) | `sprint-status-generate.sh` + strict diff | Every guarded generation |
| 2 (proposed) | `sprint-status-commit-guard.cjs` monotonic guard | Pre-commit (optional) + CI on PR |
| 3 (existing) | `guard:epic-ids` | CI on committed artifacts |

**Recommended next step:** implement `sprint-status-commit-guard.cjs`, tests, `guard:sprint-status` npm script, and one CI step — estimated small diff (~200–300 lines including tests), no skill updates required.
