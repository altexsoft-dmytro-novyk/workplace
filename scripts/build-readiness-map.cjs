#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { overlayEvidence } = require('./readiness-map.cjs');
const ROOT = path.resolve(__dirname, '..');

function build(evidence, run = {}, root = ROOT) {
  const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const seed = read('docs/demo/workplace-readiness-data-2026-09-07.json');
  // Use the exact mapping inventory selected by the CI evidence producer.
  const matrixName = path.basename(evidence.run_summary?.matrix_used || '');
  if (!/^tea-trace-coverage-matrix[\w.-]*\.json$/.test(matrixName)) throw new Error('CI evidence does not identify a valid trace matrix');
  const matrixPath = `_bmad-output/test-artifacts/${matrixName}`;
  const matrix = read(matrixPath);
  seed.criteria = matrix.requirements;
  const canonical = yaml.load(fs.readFileSync(path.join(root,
    '_bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml'), 'utf8'));
  seed.product = canonical.requirements.map(r => {
    const old = seed.product.find(p => p.id === r.id);
    const module = seed.modules.find(m => m.ids.includes(Number(r.id.split('-').pop())));
    const linked = matrix.requirements.filter(c => {
      if (!c.doc || !c.doc.startsWith('docs/test-cases/') || c.doc.includes('..')) return false;
      const p = path.join(root, c.doc);
      return fs.existsSync(p) && new RegExp(`\\b${r.id}\\b`).test(fs.readFileSync(p, 'utf8'));
    }).map(c => c.id);
    return { ...r, module: module?.id || 'other', linked,
      implementation: old?.implementation || 'Implementation review needed' };
  });
  if (seed.product.some(r => r.module === 'other')) seed.modules.push({id:'other',name:'Other requirements',note:'Implementation review needed'});
  const data = overlayEvidence(seed, evidence, run);
  data.inventory = { matrix: matrixPath, generatedAt: matrix.generated_at,
    implementationNotesAt: '2026-09-07', canonicalBaseline: canonical.baseline_date };
  const template = fs.readFileSync(path.join(root, 'docs/demo/readiness-template.html'), 'utf8');
  if (template.split('__READINESS_DATA__').length !== 2) throw new Error('Invalid map template');
  const serialized = JSON.stringify(data).replace(/</g, '\\u003c');
  return { data, html: template.replace('__READINESS_DATA__', () => serialized) };
}

function writeMap(output, result) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const temp = `${output}.${process.pid}.tmp`;
  fs.writeFileSync(temp, result.html);
  fs.renameSync(temp, output);
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    const value = (key, fallback) => args.includes(key) ? args[args.indexOf(key)+1] : fallback;
    const evidenceFile = value('--evidence', '_bmad-output/test-artifacts/live-verification-results.json');
    const output = value('--out', 'reports/readiness-map/index.html');
    const evidence = JSON.parse(fs.readFileSync(path.resolve(evidenceFile), 'utf8'));
    const result = build(evidence, { headSha: value('--sha', evidence.source_sha),
      url: process.env.RUN_URL || '', headBranch: process.env.RUN_BRANCH || '' });
    writeMap(path.resolve(output), result);
    console.log(JSON.stringify({output, sourceSha:result.data.ci.sourceSha, ...result.data.ci.counts}));
  } catch (error) { console.error(error.stack || error.message); process.exitCode = 1; }
}
module.exports = { build, writeMap };
