const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');

const {
  TERMINAL_NEXT_STEP,
  auditRoutingContract,
  epicValidateWriteSet,
  isMalformedGeneratedCheckpoint,
  isTerminalGeneratedCheckpoint,
  planCheckpointPair,
  readCheckpoint,
  resolveAmbiguousEpicNumber,
  resolveEpicRunKey,
  resumeDecision,
  systemValidateWriteSet,
} = require('../scripts/test-design-workflow-routing.cjs');

const REPO_ROOT = path.join(__dirname, '..');

test('system scope resolves to architecture, QA, and literal handoff only', () => {
  const writeSet = systemValidateWriteSet();
  assert.deepEqual(writeSet.evaluated, [
    'test-design-architecture.md',
    'test-design-qa.md',
    'test-design/people-management-handoff.md',
  ]);
  assert.equal(writeSet.report, 'test-design-validation-report.md');
});

test('numbered epic scope resolves to domain-qualified runKey', () => {
  assert.deepEqual(resolveEpicRunKey('user-management', 1), {
    ok: true,
    runKey: 'epic-user-management-1',
  });
  assert.deepEqual(resolveEpicRunKey('platform-capabilities', 1), {
    ok: true,
    runKey: 'epic-platform-capabilities-1',
  });
  assert.equal(resolveEpicRunKey('user_management', 1).ok, false);
  assert.equal(resolveEpicRunKey('user-management', '01').ok, false);
});

test('bare Epic 1 is ambiguous and refuses writes', () => {
  assert.deepEqual(resolveAmbiguousEpicNumber(), {
    ok: false,
    reason: 'ambiguous-bare-epic-number',
    write: false,
  });
});

test('terminal generated checkpoint halts Resume without writes', () => {
  const checkpoint = readCheckpoint(REPO_ROOT, 'test-design-progress-system.md');
  const decision = resumeDecision('system', checkpoint);
  assert.deepEqual(decision, { ok: true, action: 'terminal-halt', write: false });
});

test('malformed generated checkpoint refuses Resume', () => {
  const malformed = {
    workflowStatus: 'generated',
    runKey: 'system',
    lastStep: 'step-05-generate-output',
    nextStep: 'human review, then a separate Validate run',
    stepsCompleted: [
      'step-01-detect-mode',
      'step-02-load-context',
      'step-03-risk-and-testability',
      'step-04-coverage-plan',
      'step-05-generate-output',
    ],
  };
  assert.equal(isMalformedGeneratedCheckpoint(malformed), true);
  assert.equal(isTerminalGeneratedCheckpoint(malformed), false);
  const decision = resumeDecision('system', { frontmatter: malformed });
  assert.deepEqual(decision, {
    ok: false,
    reason: 'malformed-generated-checkpoint',
    write: false,
  });
});

test('mismatched runKey refuses Resume without writes', () => {
  const checkpoint = readCheckpoint(REPO_ROOT, 'test-design-progress-epic-user-management-1.md');
  const decision = resumeDecision('epic-user-management-2', checkpoint);
  assert.deepEqual(decision, { ok: false, reason: 'runkey-mismatch', write: false });
});

test('epic Validate writes epic report and loads selected plan', () => {
  const writeSet = epicValidateWriteSet('user-management', 1);
  assert.equal(writeSet.report, 'test-design-validation-report-epic-user-management-1.md');
  assert.ok(writeSet.evaluated.includes('test-design-epic-user-management-1.md'));
  assert.ok(!writeSet.report.includes('test-design-validation-report.md'));
});

test('indexed epic plan/checkpoint pairs match recorded output hashes', () => {
  const pair = planCheckpointPair(REPO_ROOT, 'epic-user-management-1');
  assert.equal(pair.ok, true);
});

test('routing contract audit passes on the repository artifact set', () => {
  const report = auditRoutingContract(REPO_ROOT);
  assert.equal(report.ok, true, JSON.stringify(report.findings, null, 2));
  assert.equal(report.contract.terminalNextStep, TERMINAL_NEXT_STEP);
});
