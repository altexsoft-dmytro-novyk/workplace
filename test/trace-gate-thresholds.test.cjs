const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// The bmad-testarch-trace quality gate reads its thresholds from customization TOML rather than
// from constants in the step file. That indirection has one failure mode worth a test: the
// installed customize.toml carries a "DO NOT EDIT -- overwritten on every update" header, so a
// skill update can silently remove the base layer these {workflow.*} tokens resolve against.
// These tests fail loudly when that happens, instead of leaving it to be discovered by a gate run.

const repoRoot = path.join(__dirname, '..');
// The skill is installed twice, once per agent runtime. Claude Code loads .claude/skills, so a fix
// applied to only one copy leaves the gate that actually runs on the pre-fix logic — which is how
// the configurable thresholds sat inert after they were introduced. Every check below runs against
// both copies, and one test asserts they have not drifted apart again.
const SKILL_DIRS = ['.agents/skills/bmad-testarch-trace', '.claude/skills/bmad-testarch-trace'].map((dir) =>
  path.join(repoRoot, dir),
);
const skillDir = SKILL_DIRS[0];
const installedDefaults = path.join(skillDir, 'customize.toml');
const teamOverride = path.join(repoRoot, '_bmad/custom/bmad-testarch-trace.toml');

const THRESHOLD_KEYS = [
  'p0_coverage_required',
  'p1_coverage_target',
  'p1_coverage_minimum',
  'overall_coverage_minimum',
  'verified_coverage_target',
  'verified_coverage_minimum',
];

// [target, minimum] pairs that must leave a non-inverted PASS band.
const BAND_KEYS = [
  ['p1_coverage_target', 'p1_coverage_minimum'],
  ['verified_coverage_target', 'verified_coverage_minimum'],
];

// Deliberately not a full TOML parser: both files are flat `key = "value"` tables and the repo has
// no TOML dependency. Reads scalars from the [workflow] table only, ignoring comments.
const readWorkflowScalars = (file) => {
  const scalars = {};
  let inWorkflow = false;
  for (const rawLine of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('#') || line === '') continue;
    if (line.startsWith('[')) {
      inWorkflow = line === '[workflow]';
      continue;
    }
    if (!inWorkflow) continue;
    const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*"(.*)"\s*$/);
    if (match) scalars[match[1]] = match[2];
  }
  return scalars;
};

const skillMarkdownFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return skillMarkdownFiles(full);
    return entry.isFile() && entry.name.endsWith('.md') ? [full] : [];
  });

// Mirrors render_skill.py's _CUSTOM_TOKEN.
const CUSTOM_TOKEN = /\{workflow\.([A-Za-z0-9_.-]+)\}/g;

for (const dir of SKILL_DIRS) {
  const label = path.relative(repoRoot, dir);

  test(`${label}: every {workflow.*} token used by the skill has a default in customize.toml`, () => {
    const defaults = readWorkflowScalars(path.join(dir, 'customize.toml'));
    const arrayKeys = new Set(['persistent_facts', 'activation_steps_prepend', 'activation_steps_append']);
    const missing = [];

    for (const file of skillMarkdownFiles(dir)) {
      const content = fs.readFileSync(file, 'utf8');
      for (const [, key] of content.matchAll(CUSTOM_TOKEN)) {
        if (arrayKeys.has(key)) continue; // declared as arrays, not scalars
        if (!(key in defaults)) missing.push(`${path.relative(repoRoot, file)} -> {workflow.${key}}`);
      }
    }

    assert.deepEqual(
      missing,
      [],
      `customize.toml is missing defaults for tokens the skill resolves. A skill update likely ` +
        `overwrote it; restore the keys rather than lowering the gate.\n${missing.join('\n')}`,
    );
  });

  test(`${label}: the installed defaults declare every gate threshold as a usable number`, () => {
    const defaults = readWorkflowScalars(path.join(dir, 'customize.toml'));
    for (const key of THRESHOLD_KEYS) {
      assert.ok(key in defaults, `customize.toml lost the ${key} default`);
      const value = Number(defaults[key]);
      assert.ok(defaults[key].trim() !== '', `${key} is empty; Number('') is 0, which would disable the gate`);
      assert.ok(Number.isFinite(value) && value >= 0 && value <= 100, `${key} is not a number from 0 through 100: ${defaults[key]}`);
    }
  });

  test(`${label}: step-05 never compares coverage against a hardcoded threshold`, () => {
    const step = fs.readFileSync(path.join(dir, 'steps-c/step-05-gate-decision.md'), 'utf8');
    const decisionBlock = step.slice(step.indexOf('let gateDecision'), step.indexOf('### 3. Generate Gate Report'));
    const hardcoded =
      decisionBlock.match(/(?:p0Coverage|effectiveP1Coverage|overallCoverage|verifiedCoverage)\s*[<>]=?\s*\d/g) || [];
    assert.deepEqual(hardcoded, [], `gate rules must compare against gateThresholds, not literals: ${hardcoded.join(', ')}`);
  });
}

test('the installed skill copies have not drifted apart', () => {
  const [first, ...rest] = SKILL_DIRS;
  const relativeFiles = (dir) =>
    skillMarkdownFiles(dir)
      .concat([path.join(dir, 'customize.toml')])
      .map((file) => path.relative(dir, file))
      .sort();

  for (const other of rest) {
    assert.deepEqual(
      relativeFiles(other),
      relativeFiles(first),
      `${path.relative(repoRoot, other)} and ${path.relative(repoRoot, first)} contain different files`,
    );
    const differing = relativeFiles(first).filter(
      (file) => fs.readFileSync(path.join(first, file), 'utf8') !== fs.readFileSync(path.join(other, file), 'utf8'),
    );
    assert.deepEqual(
      differing,
      [],
      `The installed copies of bmad-testarch-trace have diverged. A fix applied to one runtime's copy ` +
        `leaves the other running the old logic — apply it to both.\n${differing.join('\n')}`,
    );
  }
});

test('the team override declares every threshold, so a lost base layer cannot relax the gate', () => {
  const override = readWorkflowScalars(teamOverride);
  for (const key of THRESHOLD_KEYS) {
    assert.ok(key in override, `_bmad/custom/bmad-testarch-trace.toml must pin ${key} explicitly`);
    assert.ok(override[key].trim() !== '', `${key} is empty; Number('') is 0, which would disable the gate`);
  }
});

test('resolved thresholds leave a coherent PASS band in every layer', () => {
  for (const file of [installedDefaults, teamOverride]) {
    const scalars = readWorkflowScalars(file);
    for (const [targetKey, minimumKey] of BAND_KEYS) {
      const target = Number(scalars[targetKey]);
      const minimum = Number(scalars[minimumKey]);
      assert.ok(
        target >= minimum,
        `${path.relative(repoRoot, file)}: ${targetKey} (${target}) is below ${minimumKey} (${minimum})`,
      );
    }
  }
});
