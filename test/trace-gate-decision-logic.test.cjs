const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// test/trace-gate-thresholds.test.cjs only regex-scans step-05-gate-decision.md's source text (no
// hardcoded literals, TOML keys present, PASS band non-empty). None of that runs the decision logic
// against real data, so a rounding regression, a flipped comparison operator, or a threshold-parsing
// bug could all pass that suite untouched. This file extracts the actual "Apply Gate Decision Logic"
// code block from the skill file and executes it against fixture coverage matrices, asserting on the
// resulting gateDecision/rationale the same way a real trace run would produce them.

const stepFile = path.join(
  __dirname,
  '..',
  '.agents/skills/bmad-testarch-trace/steps-c/step-05-gate-decision.md',
);

function extractDecisionLogic(source) {
  const heading = '### 2. Apply Gate Decision Logic';
  const headingIndex = source.indexOf(heading);
  if (headingIndex === -1) throw new Error('"Apply Gate Decision Logic" section not found in step-05-gate-decision.md');
  const fenceStart = source.indexOf('```javascript', headingIndex);
  if (fenceStart === -1) throw new Error('No javascript code fence found under "Apply Gate Decision Logic"');
  const codeStart = fenceStart + '```javascript'.length;
  const fenceEnd = source.indexOf('\n```', codeStart);
  if (fenceEnd === -1) throw new Error('Unterminated code fence under "Apply Gate Decision Logic"');
  return source.slice(codeStart, fenceEnd);
}

const DEFAULT_THRESHOLDS = {
  p0_coverage_required: '100',
  p1_coverage_target: '90',
  p1_coverage_minimum: '80',
  overall_coverage_minimum: '80',
};

// Runs the real decision-tree code from the skill file against a fixture coverageMatrix. Mirrors
// what render_skill.py + the workflow runner do at execution time: substitute the {workflow.*}
// threshold tokens with literal values, then execute.
function runGateDecision(coverageMatrix, thresholdOverrides = {}) {
  const thresholds = { ...DEFAULT_THRESHOLDS, ...thresholdOverrides };
  const source = fs.readFileSync(stepFile, 'utf8');
  let code = extractDecisionLogic(source);
  for (const [key, value] of Object.entries(thresholds)) {
    code = code.split(`{workflow.${key}}`).join(value);
  }
  code += `
__RESULT__.gateDecision = gateDecision;
__RESULT__.rationale = rationale;
__RESULT__.gateEligible = gateEligible;
__RESULT__.gateThresholds = gateThresholds;
__RESULT__.thresholdErrors = thresholdErrors;
__RESULT__.p0Coverage = p0Coverage;
__RESULT__.effectiveP1Coverage = effectiveP1Coverage;
__RESULT__.overallCoverage = overallCoverage;
`;
  const sandbox = {
    coverageMatrix,
    console: { log() {}, error() {}, warn() {} },
    Array,
    Boolean,
    Map,
    Math,
    Number,
    Set,
    String,
    __RESULT__: {},
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'step-05-gate-decision.js', timeout: 2000 });
  return sandbox.__RESULT__;
}

function priorityBreakdown({ p0, p1 = { total: 0, covered: 0, percentage: 100 } }) {
  return {
    P0: p0,
    P1: p1,
    P2: { total: 0, covered: 0, percentage: 100 },
    P3: { total: 0, covered: 0, percentage: 100 },
  };
}

test('199 of 200 P0 requirements rounds to 100% but must still FAIL against a 100% requirement', () => {
  const matrix = {
    coverage_statistics: {
      total_requirements: 200,
      fully_covered: 199,
      overall_coverage_percentage: 100, // Step 4's rounded value; must not be trusted at face value
      priority_breakdown: priorityBreakdown({ p0: { total: 200, covered: 199, percentage: 100 } }),
    },
    requirements: [],
  };
  const result = runGateDecision(matrix);
  assert.equal(result.gateDecision, 'FAIL');
  assert.match(result.rationale, /P0 coverage is 99\.5%/);
});

test('an empty threshold resolves to a deterministic FAIL, never a relaxed gate', () => {
  const matrix = {
    coverage_statistics: {
      total_requirements: 100,
      fully_covered: 100,
      overall_coverage_percentage: 100,
      priority_breakdown: priorityBreakdown({ p0: { total: 100, covered: 100, percentage: 100 } }),
    },
    requirements: [],
  };
  const result = runGateDecision(matrix, { p0_coverage_required: '' });
  assert.equal(result.gateDecision, 'FAIL');
  assert.match(result.rationale, /could not be resolved/);
  assert.match(result.thresholdErrors.join(' '), /P0 coverage required threshold is empty/);
});

test('a non-numeric threshold fails closed instead of throwing', () => {
  const matrix = {
    coverage_statistics: {
      total_requirements: 100,
      fully_covered: 100,
      overall_coverage_percentage: 100,
      priority_breakdown: priorityBreakdown({ p0: { total: 100, covered: 100, percentage: 100 } }),
    },
    requirements: [],
  };
  const result = runGateDecision(matrix, { p1_coverage_target: 'abc' });
  assert.equal(result.gateDecision, 'FAIL');
  assert.match(result.rationale, /could not be resolved/);
  assert.match(result.thresholdErrors.join(' '), /Invalid P1 coverage target threshold: abc/);
});

test('a P1 target below the P1 minimum leaves no PASS band and fails closed', () => {
  const matrix = {
    coverage_statistics: {
      total_requirements: 100,
      fully_covered: 100,
      overall_coverage_percentage: 100,
      priority_breakdown: priorityBreakdown({
        p0: { total: 100, covered: 100, percentage: 100 },
        p1: { total: 10, covered: 8, percentage: 80 },
      }),
    },
    requirements: [],
  };
  const result = runGateDecision(matrix, { p1_coverage_target: '70', p1_coverage_minimum: '80' });
  assert.equal(result.gateDecision, 'FAIL');
  assert.match(result.rationale, /leaves no PASS band/);
});

test('coverage that cannot be resolved to a number fails closed, never NOT_EVALUATED', () => {
  const matrix = {
    coverage_statistics: {
      total_requirements: 100,
      fully_covered: 100,
      overall_coverage_percentage: 100,
      // P0 is present (passes the earlier existence guard) but carries no total/covered/percentage.
      priority_breakdown: priorityBreakdown({ p0: {} }),
    },
    requirements: [],
  };
  const result = runGateDecision(matrix);
  assert.equal(result.gateDecision, 'FAIL');
  assert.notEqual(result.gateDecision, 'NOT_EVALUATED');
  assert.ok(result.rationale, 'rationale must not be left undefined');
  assert.match(result.rationale, /Coverage values could not be determined/);
});

test('P0 100%, P1 95%, overall 92% against default thresholds is a clean PASS', () => {
  const matrix = {
    coverage_statistics: {
      total_requirements: 100,
      fully_covered: 92,
      overall_coverage_percentage: 92,
      priority_breakdown: priorityBreakdown({
        p0: { total: 30, covered: 30, percentage: 100 },
        p1: { total: 20, covered: 19, percentage: 95 },
      }),
    },
    requirements: [],
  };
  const result = runGateDecision(matrix);
  assert.equal(result.gateDecision, 'PASS');
});

test('CONCERNS rationale reports the actual measured P0 coverage, not the configured threshold', () => {
  const matrix = {
    coverage_statistics: {
      total_requirements: 100,
      fully_covered: 90,
      overall_coverage_percentage: 90,
      priority_breakdown: priorityBreakdown({
        p0: { total: 100, covered: 95, percentage: 95 },
        p1: { total: 20, covered: 17, percentage: 85 },
      }),
    },
    requirements: [],
  };
  // p0_coverage_required is deliberately not 100 here: with the default 100% requirement, actual
  // P0 coverage can only ever equal the threshold when it passes, which would hide this bug.
  const result = runGateDecision(matrix, { p0_coverage_required: '90' });
  assert.equal(result.gateDecision, 'CONCERNS');
  assert.match(result.rationale, /P0 coverage is 95%/);
  assert.doesNotMatch(result.rationale, /P0 coverage is 90%/);
});

test('an overall-coverage FAIL caused only by P2/P3 gaps names the priorities and calls out P0/P1 as complete', () => {
  const matrix = {
    coverage_statistics: {
      // P0 and P1 fully covered; overall short only because of P2/P3 — the informational
      // priorities can still decide the gate since the overall minimum spans P0-P3.
      total_requirements: 100,
      fully_covered: 70,
      overall_coverage_percentage: 70,
      priority_breakdown: {
        P0: { total: 30, covered: 30, percentage: 100 },
        P1: { total: 20, covered: 20, percentage: 100 },
        P2: { total: 30, covered: 15, percentage: 50 },
        P3: { total: 20, covered: 5, percentage: 25 },
      },
    },
    requirements: [],
  };
  const result = runGateDecision(matrix);
  assert.equal(result.gateDecision, 'FAIL');
  assert.match(result.rationale, /P2: 15, P3: 15/);
  assert.match(result.rationale, /P0 and P1 are complete; this gate failed on P2\/P3 alone/);
});

test('an overall-coverage FAIL that also involves P0/P1 gaps does not claim P0 and P1 are complete', () => {
  const matrix = {
    coverage_statistics: {
      total_requirements: 100,
      fully_covered: 70,
      overall_coverage_percentage: 70,
      priority_breakdown: {
        P0: { total: 30, covered: 30, percentage: 100 },
        P1: { total: 20, covered: 15, percentage: 75 },
        P2: { total: 30, covered: 15, percentage: 50 },
        P3: { total: 20, covered: 10, percentage: 50 },
      },
    },
    requirements: [],
  };
  const result = runGateDecision(matrix);
  assert.equal(result.gateDecision, 'FAIL');
  assert.doesNotMatch(result.rationale, /P0 and P1 are complete/);
});

// Master Rule requires an unresolvable threshold or coverage value to be recorded as a `critical`
// blocker in the emitted summary, not just described in the rationale. This extracts the small
// blockers-assembly snippet from "3b. Emit e2e-trace-summary.json" and runs it directly against
// synthetic upstream state, since running that whole section requires the full Phase 1 pipeline.
function extractBlockersLogic(source) {
  const start = source.indexOf('const collectedBlockers =');
  if (start === -1) throw new Error('"const collectedBlockers =" not found in step-05-gate-decision.md');
  const end = source.indexOf('\nconst heuristicCounts', start);
  if (end === -1) throw new Error('End marker for the blockers snippet not found');
  return source.slice(start, end);
}

function runBlockersLogic({ thresholdErrors, coverageValuesValid, p0Coverage, effectiveP1Coverage, overallCoverage, coverageMatrix, fallbackInventory }) {
  const source = fs.readFileSync(stepFile, 'utf8');
  const code = `${extractBlockersLogic(source)}\n__RESULT__.blockers = blockers;`;
  const formatCoverage = (value) => (Number.isFinite(value) ? String(value) : String(value));
  const sandbox = {
    thresholdErrors, coverageValuesValid, p0Coverage, effectiveP1Coverage, overallCoverage,
    coverageMatrix, fallbackInventory, formatCoverage, Array, Number, __RESULT__: {},
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'step-05-blockers.js', timeout: 2000 });
  return sandbox.__RESULT__.blockers;
}

test('an unresolved threshold produces a critical blocker entry in the emitted summary', () => {
  const blockers = runBlockersLogic({
    thresholdErrors: ['The P0 coverage required threshold is empty or unresolved. Expected a number from 0 through 100.'],
    coverageValuesValid: true,
    p0Coverage: 100, effectiveP1Coverage: 100, overallCoverage: 100,
    coverageMatrix: {}, fallbackInventory: { blockers: [] },
  });
  assert.equal(blockers.length, 1);
  assert.equal(blockers[0].severity, 'critical');
  assert.equal(blockers[0].id, 'gate-threshold-config-1');
  assert.match(blockers[0].reason, /P0 coverage required threshold is empty/);
});

test('an unresolved coverage value produces a critical blocker entry alongside any collected blockers', () => {
  const blockers = runBlockersLogic({
    thresholdErrors: [],
    coverageValuesValid: false,
    p0Coverage: NaN, effectiveP1Coverage: 100, overallCoverage: 90,
    coverageMatrix: { blockers: [{ id: 'existing', severity: 'high', reason: 'pre-existing' }] },
    fallbackInventory: { blockers: [] },
  });
  assert.equal(blockers.length, 2);
  assert.equal(blockers[0].id, 'gate-coverage-unresolved');
  assert.equal(blockers[0].severity, 'critical');
  assert.equal(blockers[1].id, 'existing');
});
