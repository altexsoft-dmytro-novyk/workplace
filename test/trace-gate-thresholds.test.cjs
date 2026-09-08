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
const skillDir = path.join(repoRoot, '.agents/skills/bmad-testarch-trace');
const installedDefaults = path.join(skillDir, 'customize.toml');
const teamOverride = path.join(repoRoot, '_bmad/custom/bmad-testarch-trace.toml');

const THRESHOLD_KEYS = ['p0_coverage_required', 'p1_coverage_target', 'p1_coverage_minimum', 'overall_coverage_minimum'];

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

test('every {workflow.*} token used by the skill has a default in customize.toml', () => {
  const defaults = readWorkflowScalars(installedDefaults);
  const arrayKeys = new Set(['persistent_facts', 'activation_steps_prepend', 'activation_steps_append']);
  const missing = [];

  for (const file of skillMarkdownFiles(skillDir)) {
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

test('the installed defaults declare all four gate thresholds as usable numbers', () => {
  const defaults = readWorkflowScalars(installedDefaults);
  for (const key of THRESHOLD_KEYS) {
    assert.ok(key in defaults, `customize.toml lost the ${key} default`);
    const value = Number(defaults[key]);
    assert.ok(defaults[key].trim() !== '', `${key} is empty; Number('') is 0, which would disable the gate`);
    assert.ok(Number.isFinite(value) && value >= 0 && value <= 100, `${key} is not a number from 0 through 100: ${defaults[key]}`);
  }
});

test('the team override declares all four thresholds, so a lost base layer cannot relax the gate', () => {
  const override = readWorkflowScalars(teamOverride);
  for (const key of THRESHOLD_KEYS) {
    assert.ok(key in override, `_bmad/custom/bmad-testarch-trace.toml must pin ${key} explicitly`);
    assert.ok(override[key].trim() !== '', `${key} is empty; Number('') is 0, which would disable the gate`);
  }
});

test('resolved thresholds leave a coherent PASS band in both layers', () => {
  for (const file of [installedDefaults, teamOverride]) {
    const scalars = readWorkflowScalars(file);
    const target = Number(scalars.p1_coverage_target);
    const minimum = Number(scalars.p1_coverage_minimum);
    assert.ok(
      target >= minimum,
      `${path.relative(repoRoot, file)}: p1_coverage_target (${target}) is below p1_coverage_minimum (${minimum})`,
    );
  }
});

test('step-05 never compares coverage against a hardcoded threshold', () => {
  const step = fs.readFileSync(path.join(skillDir, 'steps-c/step-05-gate-decision.md'), 'utf8');
  const decisionBlock = step.slice(step.indexOf('let gateDecision'), step.indexOf('### 3. Generate Gate Report'));
  const hardcoded = decisionBlock.match(/(?:p0Coverage|effectiveP1Coverage|overallCoverage)\s*[<>]=?\s*\d/g) || [];
  assert.deepEqual(hardcoded, [], `gate rules must compare against gateThresholds, not literals: ${hardcoded.join(', ')}`);
});
