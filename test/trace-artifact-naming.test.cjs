const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Step 4 writes the Phase 1 coverage matrix to `/tmp/tea-trace-coverage-matrix-{{timestamp}}.json`.
// That name is right for a temp file and wrong for anything committed, but for a long time the copy
// into this repo was made by hand and kept the timestamp, which accumulated a folder of dated
// near-duplicates of all four trace artifacts. `_bmad/custom/bmad-testarch-trace.toml` now persists
// the matrix under one fixed name via its `on_complete` hook; this test is what keeps a manual copy,
// a resumed run, or a future skill update from quietly reintroducing the pile.

const repoRoot = path.join(__dirname, '..');
const artifactDir = path.join(repoRoot, '_bmad-output/test-artifacts');

// Only the four trace families are governed here. Other artifacts in this directory — audits,
// test-design progress documents — are per-occurrence records and are legitimately dated.
const CANONICAL = [
  'traceability-matrix.md',
  'e2e-trace-summary.json',
  'tea-trace-coverage-matrix.json',
  'gate-decision.json',
];

const stemOf = (name) => name.replace(/\.(md|json)$/, '');

test('no dated or timestamped copies of the trace artifacts are committed', () => {
  const canonicalStems = CANONICAL.map(stemOf);
  const offenders = fs
    .readdirSync(artifactDir)
    .filter((name) => {
      if (CANONICAL.includes(name)) return false;
      const stem = stemOf(name);
      return canonicalStems.some((canonical) => stem.startsWith(`${canonical}-`));
    })
    .sort();

  assert.deepEqual(
    offenders,
    [],
    `Trace artifacts carry one canonical name each and are overwritten in place; superseded ` +
      `versions live in git history, not beside the current one. Fold these back into the ` +
      `canonical file and delete them — see the "Trace artifacts" section of AGENTS.md:\n` +
      offenders.map((name) => `  ${name}`).join('\n'),
  );
});

test('the canonical trace artifacts a re-trace overwrites are present', () => {
  // gate-decision.json is deliberately absent unless a run issued a verdict: the current trace is a
  // whole-repository planning audit, which runs with allow_gate=false. The other three are written
  // by every run, so their absence means a trace was interrupted or an output path drifted.
  for (const name of CANONICAL.filter((n) => n !== 'gate-decision.json')) {
    assert.ok(
      fs.existsSync(path.join(artifactDir, name)),
      `${name} is missing from _bmad-output/test-artifacts/. Every trace run writes it.`,
    );
  }
});
