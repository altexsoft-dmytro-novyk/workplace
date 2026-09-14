const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');

const {
  auditValidationIndex,
  epicValidationReports,
} = require('../scripts/test-design-workflow-routing.cjs');

const REPO_ROOT = path.join(__dirname, '..');

test('discovers every canonical epic validation report without a hard-coded roster', () => {
  const reports = epicValidationReports(REPO_ROOT);
  assert.deepEqual(
    reports.map((report) => report.frontmatter.runKey),
    [
      'epic-platform-1',
      'epic-platform-2',
      'epic-platform-3',
      'epic-platform-4',
      'epic-user-management-1',
      'epic-user-management-2',
    ],
  );
});

test('every epic validation report matches its index, plan, and checkpoint projections', () => {
  const audit = auditValidationIndex(REPO_ROOT);
  assert.equal(audit.ok, true, JSON.stringify(audit.findings, null, 2));
});
