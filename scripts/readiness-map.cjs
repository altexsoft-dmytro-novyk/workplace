'use strict';

function newestRun(runs, branch) {
  const run = runs.filter(r => r.headBranch === branch && r.status === 'completed')
    .sort((a,b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.databaseId-a.databaseId)[0];
  if (!run) throw new Error(`No completed Tests run for branch ${branch}`);
  return run;
}

function overlayEvidence(seed, evidence, run = {}) {
  if (!evidence.source_sha || !Number.isFinite(Date.parse(evidence.observed_at)) ||
      !Array.isArray(evidence.results) || !evidence.run_summary ||
      !Array.isArray(evidence.run_summary.missing_reports)) throw new Error('Invalid CI evidence');
  if (run.headSha && run.headSha !== evidence.source_sha) throw new Error('CI evidence SHA does not match selected run SHA');
  const data = structuredClone(seed);
  const grouped = new Map();
  const counts = { pass: 0, fail: 0, skipped: 0 };
  for (const result of evidence.results) {
    if (!Object.hasOwn(counts, result.status)) throw new Error(`Unknown result status: ${result.status}`);
    if (typeof result.requirement_id !== 'string' || !result.requirement_id) throw new Error('Missing evidence requirement_id');
    counts[result.status]++;
    if (!grouped.has(result.requirement_id)) grouped.set(result.requirement_id, []);
    grouped.get(result.requirement_id).push(result);
  }
  const ids = new Set(data.criteria.map(c => c.id));
  let inventoryGaps = 0;
  for (const [id, results] of grouped) {
    if (ids.has(id)) continue;
    inventoryGaps++;
    data.criteria.push({ id, title: results[0].title || id, area: 'inventory-gap',
      priority: '?', coverage: 'UNKNOWN', impl_state: 'UNKNOWN', doc: '', tests: [] });
  }
  const complete = evidence.run_summary.missing_reports.length === 0;
  for (const c of data.criteria) {
    const results = grouped.get(c.id) || [];
    const passed = results.some(r => r.status === 'pass');
    const skipped = results.some(r => r.status === 'skipped');
    const expected = c.tests || [];
    const allExpectedPassed = expected.length > 0 && expected.every(t => results.some(r =>
      r.status === 'pass' && (r.evidence === t.file || r.evidence?.endsWith(`: ${t.file}`)) &&
      (r.title === t.title || r.title?.endsWith(` › ${t.title}`))));
    c.live_cases = results;
    c.live_observation = results.some(r => r.status === 'fail') ? 'failing'
      : passed && (skipped || !complete || !allExpectedPassed) ? 'observed_partial'
      : passed ? 'observed_pass' : skipped ? 'skipped_only' : 'not_observed';
  }
  data.areas = [...new Set(data.criteria.map(c => c.area))].sort();
  data.ci = { ...run, sourceSha: evidence.source_sha, observedAt: evidence.observed_at,
    producer: evidence.producer, counts, complete, inventoryGaps,
    missingReports: evidence.run_summary.missing_reports,
    casesSeen: evidence.run_summary.cases_seen,
    untraceable: evidence.untraceable_summary?.count || 0,
    unmatched: evidence.unmatched_summary?.count || 0 };
  return data;
}

module.exports = { overlayEvidence, newestRun };
