const test = require('node:test');
const assert = require('node:assert/strict');
const { overlayEvidence, newestRun } = require('../scripts/readiness-map.cjs');

const seed = () => ({ criteria: [
  { id: 'A', tests: [{ file: 'a', title: 'one' }], coverage: 'FULL', live_observation: 'observed_pass' },
  { id: 'B', tests: [{ file: 'b', title: 'two' }], coverage: 'FULL', live_observation: 'observed_pass' },
  { id: 'C', tests: [], coverage: 'NONE', live_observation: 'failing' },
] });
const evidence = results => ({ source_sha: 'abc', observed_at: '2026-09-07T12:00:00Z', results,
  run_summary: { missing_reports: [] }, producer: 'CI' });
const record = (requirement_id, status, title='one') => ({ requirement_id, status, title, evidence: 'backend-unit: a' });

test('new failing evidence replaces a previous green and absent criteria lose old pass', () => {
  const result = overlayEvidence(seed(), evidence([record('A','fail')]), { headSha: 'abc' });
  assert.equal(result.criteria[0].live_observation, 'failing');
  assert.equal(result.criteria[1].live_observation, 'not_observed');
  assert.equal(result.criteria[2].live_observation, 'not_observed');
  assert.deepEqual(result.ci.counts, { pass: 0, fail: 1, skipped: 0 });
  assert.equal(result.criteria[0].coverage, 'FULL'); // written tests != passing tests
});
test('pass plus skipped is partial and skipped-only never turns green', () => {
  const result = overlayEvidence(seed(), evidence([record('A','pass'),record('A','skipped','other'),record('B','skipped')]), {headSha:'abc'});
  assert.equal(result.criteria[0].live_observation,'observed_partial');
  assert.equal(result.criteria[1].live_observation,'skipped_only');
});
test('an extra passing case cannot substitute for a missing mapped test', () => {
  const s=seed();s.criteria[0].tests.push({file:'a',title:'required negative case'});
  const r=overlayEvidence(s,evidence([record('A','pass'),record('A','pass','unrelated extra')]),{headSha:'abc'});
  assert.equal(r.criteria[0].live_observation,'observed_partial');
});
test('matching file and nested full title confirms the expected test', () => {
  const r=overlayEvidence(seed(),evidence([record('A','pass','Suite › one')]),{headSha:'abc'});
  assert.equal(r.criteria[0].live_observation,'observed_pass');
});
test('missing reports make even observed passes partial, not complete evidence', () => {
  const e=evidence([record('A','pass')]);e.run_summary.missing_reports=['backend-e2e'];
  const r=overlayEvidence(seed(),e,{headSha:'abc'});
  assert.equal(r.criteria[0].live_observation,'observed_partial');
  assert.equal(r.ci.complete,false);
});
test('rejects mismatched commit and malformed evidence instead of publishing green', () => {
  assert.throws(()=>overlayEvidence(seed(),evidence([]),{headSha:'different'}),/SHA/);
  assert.throws(()=>overlayEvidence(seed(),evidence([record('A','mystery')]),{headSha:'abc'}),/status/);
  assert.throws(()=>overlayEvidence(seed(),{results:[]},{headSha:'abc'}),/evidence/);
});
test('preserves unknown criterion results as visible inventory gaps', () => {
  const r=overlayEvidence(seed(),evidence([record('NEW','fail')]),{headSha:'abc'});
  assert.equal(r.criteria.find(c=>c.id==='NEW').live_observation,'failing');
  assert.equal(r.ci.inventoryGaps,1);
});
test('selects latest completed run on the requested branch even when it failed', () => {
  const runs=[
    {databaseId:1,headBranch:'main',status:'completed',conclusion:'success',createdAt:'2026-09-01'},
    {databaseId:2,headBranch:'main',status:'completed',conclusion:'failure',createdAt:'2026-09-02'},
    {databaseId:3,headBranch:'other',status:'completed',createdAt:'2026-09-03'},
    {databaseId:4,headBranch:'main',status:'in_progress',createdAt:'2026-09-04'},
  ];
  assert.equal(newestRun(runs,'main').databaseId,2);
  assert.throws(()=>newestRun(runs,'missing'),/completed/);
});
