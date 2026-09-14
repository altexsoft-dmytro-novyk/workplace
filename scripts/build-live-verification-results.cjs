#!/usr/bin/env node
'use strict';

/**
 * Build `_bmad-output/test-artifacts/live-verification-results.json` from real
 * test-runner reports.
 *
 * `/bmad-testarch-trace` reads that file as `live` evidence. Without it the
 * trace run stays in `contract_static` mode, where a requirement's status is
 * inferred from the presence of a spec file rather than from a suite that
 * actually ran. This script is the producer side of that contract; trace never
 * writes the file and never runs anything to produce it.
 *
 * Mapping a runner result to a requirement is done in two passes:
 *   1. Exact `(file, title)` lookup against `tea-trace-coverage-matrix.json`,
 *      which already carries the requirement -> tests mapping the last trace
 *      run resolved. That one canonical name is what a trace run overwrites;
 *      the glob-and-take-newest below is a safety net for a stray copy, not an
 *      invitation to keep dated ones.
 *   2. Fallback: scan the test's full title path for an oracle ID derived from
 *      the `docs/test-cases/**` filenames (`um-rel-09-pp-atomic-replace.md` ->
 *      `UM-REL-09`), innermost title first so the most specific describe wins.
 *
 * Results that match nothing are reported on stderr and in `unmatched_summary`,
 * but kept out of `results` — trace records every unmatched entry as a blocker,
 * so shipping ID-less cases through it would bury the real ones. Tests that can
 * never resolve are declared in `untraceable-tests.json` and bucketed separately.
 *
 * Usage:
 *   node scripts/build-live-verification-results.cjs \
 *     --jest reports/backend-unit.json --suite unit \
 *     --jest reports/backend-e2e.json --suite e2e \
 *     --playwright reports/frontend-e2e.json --suite frontend-e2e
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const SCHEMA_VERSION = '0.1.0';

// ── CLI ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = {
    jest: [],
    playwright: [],
    oracleDir: path.join(REPO_ROOT, 'docs/test-cases'),
    matrix: null,
    out: path.join(REPO_ROOT, '_bmad-output/test-artifacts/live-verification-results.json'),
    sourceSha: null,
    producer: 'CI (.github/workflows/tests.yml)',
    target: 'repo',
  };
  // `--suite <label>` applies to the report named immediately before it.
  let lastReport = null;

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (value === undefined) throw new Error(`${arg} requires a value`);
      i += 1;
      return value;
    };
    switch (arg) {
      case '--jest':
        lastReport = { kind: 'jest', file: next(), suite: null };
        opts.jest.push(lastReport);
        break;
      case '--playwright':
        lastReport = { kind: 'playwright', file: next(), suite: null, base: null };
        opts.playwright.push(lastReport);
        break;
      case '--suite':
        if (!lastReport) throw new Error('--suite must follow --jest or --playwright');
        lastReport.suite = next();
        break;
      case '--base':
        // Repo-relative dir the report's paths are relative to. Only needed when
        // `config.rootDir` in the Playwright report cannot be resolved.
        if (!lastReport) throw new Error('--base must follow --playwright');
        lastReport.base = next();
        break;
      case '--oracle':
        opts.oracleDir = path.resolve(REPO_ROOT, next());
        break;
      case '--matrix':
        opts.matrix = path.resolve(REPO_ROOT, next());
        break;
      case '--out':
        opts.out = path.resolve(REPO_ROOT, next());
        break;
      case '--source-sha':
        opts.sourceSha = next();
        break;
      case '--producer':
        opts.producer = next();
        break;
      case '--target':
        opts.target = next();
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return opts;
}

// ── Oracle ─────────────────────────────────────────────────────────────────

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') out.push(full);
  }
  return out;
}

/**
 * `um-auth-02b-request-magic-link-deactivated-email` -> `UM-AUTH-02B`.
 * The ID ends at the first numeric segment (with an optional letter suffix).
 * A slug with no numeric segment keeps its first two segments — the one such
 * case in this repo is `acm0-ru-root-user-prerequisite` -> `ACM0-RU`.
 */
function idFromSlug(slug) {
  const parts = slug.split('-');
  const numericAt = parts.findIndex((part) => /^\d+[a-z]?$/.test(part));
  const take = numericAt >= 0 ? numericAt + 1 : Math.min(2, parts.length);
  return parts.slice(0, take).join('-').toUpperCase();
}

function loadOracleIds(oracleDir) {
  const ids = new Map(); // uppercase ID -> doc path (repo-relative)
  for (const file of walk(oracleDir)) {
    const slug = path.basename(file, '.md');
    const id = idFromSlug(slug);
    if (!ids.has(id)) ids.set(id, path.relative(REPO_ROOT, file));
  }
  return ids;
}

// ── Coverage matrix (primary mapping) ──────────────────────────────────────

function findNewestMatrix(explicit) {
  if (explicit) return explicit;
  const dir = path.join(REPO_ROOT, '_bmad-output/test-artifacts');
  let candidates;
  try {
    candidates = fs
      .readdirSync(dir)
      .filter((name) => name.startsWith('tea-trace-coverage-matrix') && name.endsWith('.json'))
      .map((name) => path.join(dir, name));
  } catch {
    return null;
  }
  if (candidates.length === 0) return null;
  // `generated_at` is the intent; mtime is only the tiebreaker for a file that
  // does not carry one.
  const scored = candidates.map((file) => {
    let stamp = 0;
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      stamp = Date.parse(parsed.generated_at || '') || 0;
    } catch {
      /* fall through to mtime */
    }
    if (!stamp) stamp = fs.statSync(file).mtimeMs;
    return { file, stamp };
  });
  scored.sort((a, b) => b.stamp - a.stamp);
  return scored[0].file;
}

function loadMatrixIndex(matrixPath) {
  // `${file}\u0000${title}` -> requirement ids. One test can legitimately evidence several
  // requirements (a shared `it` for ACM1-FB-01 and ACM1-FB-02..07), so every id is kept: a
  // first-wins index silently left the narrower requirements `not_observed` although green.
  const index = new Map();
  if (!matrixPath || !fs.existsSync(matrixPath)) return { index, matrixPath: null };
  const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
  for (const requirement of matrix.requirements || []) {
    for (const test of requirement.tests || []) {
      if (!test || !test.file || !test.title) continue;
      const key = `${normalizeFile(test.file)}\u0000${test.title.trim()}`;
      const ids = index.get(key) || [];
      if (!ids.includes(requirement.id)) ids.push(requirement.id);
      index.set(key, ids);
    }
  }
  return { index, matrixPath: path.relative(REPO_ROOT, matrixPath) };
}

/**
 * Submodule paths from `.gitmodules` (`services/backend`, `services/frontend`).
 * They anchor the fallback in `normalizeFile` below. Deriving them beats a
 * hardcoded `/services/` marker, which also matches the `domain/services/`
 * directory inside the backend source tree and truncates the path there.
 */
const SERVICE_ROOTS = (() => {
  try {
    const config = fs.readFileSync(path.join(REPO_ROOT, '.gitmodules'), 'utf8');
    return [...config.matchAll(/^\s*path\s*=\s*(.+)$/gm)].map((m) => m[1].trim()).filter(Boolean);
  } catch {
    return [];
  }
})();

/**
 * Report paths have to land on the same repo-relative form the coverage matrix
 * uses (`services/backend/test/...`).
 *
 * Jest writes absolute paths, and the aggregation job checks the workspace out
 * at the same path the test jobs used, so `path.relative` normally lands. It
 * does not when a report was produced elsewhere — a local run, or a runner with
 * a different workspace root — and the result is a `../../..` path that matches
 * nothing. Re-anchoring on a submodule root recovers those.
 */
function normalizeFile(file) {
  if (!file) return '';
  const posix = String(file).split(path.sep).join('/');
  if (!path.isAbsolute(file)) return posix.replace(/^\.\//, '');

  const rel = path.relative(REPO_ROOT, file).split(path.sep).join('/');
  if (!rel.startsWith('..')) return rel;

  for (const root of SERVICE_ROOTS) {
    const at = posix.lastIndexOf(`/${root}/`);
    if (at !== -1) return posix.slice(at + 1);
  }
  return posix.replace(/^\/+/, '');
}

/**
 * Playwright reports `spec.file` relative to the run's `rootDir` (the common
 * base of the discovered specs — `services/frontend/e2e` here, not the package
 * root), so the paths need that prefix put back before they can be matched.
 */
function playwrightBase(report, explicitBase) {
  if (explicitBase) return explicitBase.replace(/^\/+|\/+$/g, '');
  const rootDir = report && report.config && report.config.rootDir;
  if (!rootDir) return '';
  const normalized = normalizeFile(rootDir);
  return normalized.startsWith('..') ? '' : normalized;
}

// ── Untraceable registry ───────────────────────────────────────────────────

/**
 * Some tests can never resolve to a requirement — framework scaffold, assertions
 * about internals, packaging checks. Left in `unmatched` they never shrink, and a
 * list that never shrinks stops being read. The registry buckets them separately
 * so `unmatched` stays a to-do.
 */
function loadUntraceable(file) {
  if (!fs.existsSync(file)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return (parsed.rules || []).filter((r) => r && r.file);
  } catch (error) {
    console.error(`Ignoring ${path.relative(REPO_ROOT, file)}: ${error.message}`);
    return [];
  }
}

function untraceableReason(testCase, rules) {
  for (const rule of rules) {
    const pattern = rule.file.replace(/\/\*\*$/, '');
    const fileMatches = rule.file.endsWith('/**')
      ? testCase.file === pattern || testCase.file.startsWith(`${pattern}/`)
      : testCase.file === rule.file;
    if (!fileMatches) continue;
    // No `titles` means the whole file is untraceable.
    if (!rule.titles || rule.titles.includes(testCase.title)) return rule.reason || 'unspecified';
  }
  return null;
}

// ── Report parsers ─────────────────────────────────────────────────────────

const JEST_STATUS = {
  passed: 'pass',
  failed: 'fail',
  pending: 'skipped',
  todo: 'skipped',
  skipped: 'skipped',
  disabled: 'skipped',
};

function parseJestReport(file, suiteLabel) {
  const report = JSON.parse(fs.readFileSync(file, 'utf8'));
  const cases = [];
  for (const suite of report.testResults || []) {
    const suiteFile = normalizeFile(suite.name || suite.testFilePath);
    // A suite that fails to compile reports zero assertions and a message. It is
    // a real red signal, not an absence of tests, so surface it as one case.
    if ((suite.assertionResults || []).length === 0 && suite.status === 'failed') {
      cases.push({
        file: suiteFile,
        title: '(suite failed to run)',
        ancestors: [],
        status: 'fail',
        suite: suiteLabel,
        detail: firstLine(suite.message),
      });
      continue;
    }
    for (const assertion of suite.assertionResults || []) {
      cases.push({
        file: suiteFile,
        title: (assertion.title || '').trim(),
        ancestors: (assertion.ancestorTitles || []).map((t) => t.trim()),
        status: JEST_STATUS[assertion.status] || 'blocked',
        suite: suiteLabel,
        detail: firstLine((assertion.failureMessages || [])[0]),
      });
    }
  }
  return cases;
}

const PW_STATUS = {
  expected: 'pass',
  flaky: 'pass',
  unexpected: 'fail',
  skipped: 'skipped',
};

function parsePlaywrightReport(file, suiteLabel, explicitBase) {
  const report = JSON.parse(fs.readFileSync(file, 'utf8'));
  const base = playwrightBase(report, explicitBase);
  const resolve = (specFile) => normalizeFile(base ? `${base}/${specFile}` : specFile);
  const cases = [];

  const visit = (suite, ancestors, suiteFile) => {
    const file_ = suite.file ? resolve(suite.file) : suiteFile;
    // The root suite of a Playwright JSON report is the file itself; its title
    // duplicates the path and is not part of the human-readable title chain.
    const nextAncestors = suite.title && suite.title !== suite.file ? [...ancestors, suite.title.trim()] : ancestors;

    for (const spec of suite.specs || []) {
      const test = (spec.tests || [])[0];
      const result = test ? (test.results || [])[test.results.length - 1] : null;
      const status = test ? PW_STATUS[test.status] || 'blocked' : 'blocked';
      cases.push({
        file: spec.file ? resolve(spec.file) : file_,
        title: (spec.title || '').trim(),
        ancestors: nextAncestors,
        status,
        suite: suiteLabel,
        detail: firstLine(result && result.error && result.error.message),
      });
    }
    for (const child of suite.suites || []) visit(child, nextAncestors, file_);
  };

  for (const suite of report.suites || []) visit(suite, [], '');
  return cases;
}

function firstLine(text) {
  if (!text) return undefined;
  const line = String(text).split('\n').find((l) => l.trim().length > 0);
  if (!line) return undefined;
  const trimmed = line.trim().replace(/\s+/g, ' ');
  return trimmed.length > 300 ? `${trimmed.slice(0, 297)}...` : trimmed;
}

// ── Requirement resolution ─────────────────────────────────────────────────

function resolveRequirement(testCase, matrixIndex, oracleIds) {
  const exact = matrixIndex.get(`${testCase.file}\u0000${testCase.title}`);
  if (exact) return { ids: exact, via: 'matrix' };

  // Innermost title first: `describe('um-rel-09 ...')` beats a file-level
  // describe that lists several IDs in prose.
  const chain = [testCase.title, ...[...testCase.ancestors].reverse()];
  for (const text of chain) {
    const found = longestIdIn(text, oracleIds);
    if (found) return { ids: [found], via: 'title' };
  }
  return null;
}

function longestIdIn(text, oracleIds) {
  if (!text) return null;
  const upper = text.toUpperCase();
  let best = null;
  let bestAt = -1;
  for (const id of oracleIds.keys()) {
    const at = upper.indexOf(id);
    if (at === -1) continue;
    const before = at === 0 ? '' : upper[at - 1];
    if (/[A-Z0-9]/.test(before)) continue;

    // Token boundary on the right, with one exception. `UM-REL-1` must never
    // match inside `UM-REL-15`, so a trailing digit always rejects. But a suite
    // splits one scenario across sub-cases by suffixing a letter — `men-end-04a`,
    // `men-end-04b` all belong to MEN-END-04, whose doc covers all three — so a
    // single trailing letter is part of the reference, not a different token.
    // Where the oracle does carry the lettered form as its own document
    // (`um-auth-02b-...md` -> UM-AUTH-02B), longest-match still prefers it.
    const after = upper[at + id.length] || '';
    if (/[0-9]/.test(after)) continue;
    if (/[A-Z]/.test(after)) {
      const endsWithDigit = /[0-9]$/.test(id);
      const afterSuffix = upper[at + id.length + 1] || '';
      if (!endsWithDigit || /[A-Z0-9]/.test(afterSuffix)) continue;
    }
    // Leftmost reference wins: a title names its own scenario first and only
    // then contrasts it with another (`men-dep-02 ... (contrast men-end-02)`),
    // and two IDs of equal length would otherwise be separated by nothing but
    // the order the oracle directory happened to enumerate in — which differs
    // between a developer's machine and the runner. Length stays the tiebreaker
    // at one position, so `UM-AUTH-02B` still beats `UM-AUTH-02`.
    if (best === null || at < bestAt || (at === bestAt && id.length > best.length)) {
      best = id;
      bestAt = at;
    }
  }
  return best;
}

// ── Main ───────────────────────────────────────────────────────────────────

function gitHeadSha() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function main() {
  const opts = parseArgs(process.argv);
  const reports = [...opts.jest, ...opts.playwright];
  if (reports.length === 0) {
    console.error('No reports given. Pass at least one --jest or --playwright <file>.');
    process.exit(2);
  }

  const oracleIds = loadOracleIds(opts.oracleDir);
  const { index: matrixIndex, matrixPath } = loadMatrixIndex(findNewestMatrix(opts.matrix));

  const cases = [];
  const missingReports = [];
  for (const report of reports) {
    const file = path.resolve(REPO_ROOT, report.file);
    if (!fs.existsSync(file)) {
      // A job that never produced a report is a gap in the evidence, not a
      // reason to abandon the evidence that other jobs did produce.
      missingReports.push(report.file);
      continue;
    }
    const label = report.suite || path.basename(report.file, '.json');
    try {
      cases.push(
        ...(report.kind === 'jest' ? parseJestReport(file, label) : parsePlaywrightReport(file, label, report.base)),
      );
    } catch (error) {
      // A truncated or empty report — a cancelled job, a runner that ran out of
      // memory mid-write — is the same kind of gap as a report that was never
      // produced. Record it and keep the suites that did write readable
      // evidence, rather than abandoning the whole run.
      console.error(`Unreadable report ${report.file}: ${error.message}`);
      missingReports.push(report.file);
    }
  }

  const untraceableRules = loadUntraceable(
    path.join(REPO_ROOT, '_bmad-output/test-artifacts/untraceable-tests.json'),
  );

  const results = [];
  const unmatched = [];
  const untraceable = [];
  const viaCounts = { matrix: 0, title: 0 };
  let seq = 0;

  for (const testCase of cases) {
    const match = resolveRequirement(testCase, matrixIndex, oracleIds);
    if (!match) {
      const reason = untraceableReason(testCase, untraceableRules);
      const entry = { suite: testCase.suite, file: testCase.file, title: testCase.title, status: testCase.status };
      if (reason) untraceable.push({ ...entry, reason });
      else unmatched.push(entry);
      continue;
    }
    viaCounts[match.via] += 1;
    const fullTitle = [...testCase.ancestors, testCase.title].filter(Boolean).join(' › ');
    for (const requirementId of match.ids) {
      seq += 1;
      results.push({
        id: `${opts.target}-LIVE-${String(seq).padStart(3, '0')}`,
        requirement_id: requirementId,
        title: fullTitle,
        status: testCase.status,
        evidence: [
          `${testCase.suite}: ${testCase.file}`,
          testCase.detail ? `— ${testCase.detail}` : '',
        ]
          .filter(Boolean)
          .join(' '),
      });
    }
  }

  const sourceSha = opts.sourceSha || gitHeadSha();
  const statusCounts = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const manifest = {
    schema_version: SCHEMA_VERSION,
    source_sha: sourceSha,
    observed_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    producer: opts.producer,
    results,
    // Everything below is producer-side bookkeeping. Trace reads only the keys
    // above; these exist so a human can tell an empty run from a broken mapping.
    run_summary: {
      reports: reports.map((r) => ({ kind: r.kind, suite: r.suite, file: r.file })),
      missing_reports: missingReports,
      matrix_used: matrixPath,
      oracle_ids_known: oracleIds.size,
      cases_seen: cases.length,
      cases_mapped: viaCounts.matrix + viaCounts.title,
      results_emitted: results.length,
      mapped_via: viaCounts,
      status_counts: statusCounts,
      untraceable_count: untraceable.length,
    },
    untraceable_summary: {
      count: untraceable.length,
      by_reason: untraceable.reduce((acc, u) => {
        acc[u.reason] = (acc[u.reason] || 0) + 1;
        return acc;
      }, {}),
    },
    unmatched_summary: {
      count: unmatched.length,
      // Kept out of `results` on purpose: trace turns every unmatched entry into
      // a blocker, and the frontend suite carries no oracle IDs at all today.
      by_suite: unmatched.reduce((acc, u) => {
        acc[u.suite] = (acc[u.suite] || 0) + 1;
        return acc;
      }, {}),
      by_file: Object.entries(
        unmatched.reduce((acc, u) => {
          acc[u.file] = (acc[u.file] || 0) + 1;
          return acc;
        }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .map(([file, count]) => ({ file, count })),
      // The complete list, not a sample: this is the triage input for deciding
      // which tests should carry an oracle ID and which are correctly untraceable
      // (Nest scaffold tests, assertions about internals). A cap here would hide
      // most of it on a full run.
      cases: unmatched,
    },
  };

  fs.mkdirSync(path.dirname(opts.out), { recursive: true });
  fs.writeFileSync(opts.out, `${JSON.stringify(manifest, null, 2)}\n`);

  const rel = path.relative(REPO_ROOT, opts.out);
  console.log(`Wrote ${rel}`);
  console.log(`  source_sha:  ${sourceSha || '(unresolved)'}`);
  console.log(`  cases seen:  ${cases.length}`);
  console.log(`  mapped:      ${viaCounts.matrix + viaCounts.title} cases -> ${results.length} results (matrix ${viaCounts.matrix}, title ${viaCounts.title})`);
  console.log(`  statuses:    ${JSON.stringify(statusCounts)}`);
  console.log(`  unmatched:   ${unmatched.length} ${JSON.stringify(manifest.unmatched_summary.by_suite)}`);
  console.log(`  untraceable: ${untraceable.length} (registry-declared, excluded from the to-do list)`);
  if (missingReports.length) console.log(`  MISSING:     ${missingReports.join(', ')}`);
  if (!sourceSha) console.log('  WARNING: source_sha is empty; trace will treat every result as unverifiable.');
}

if (require.main === module) main();

module.exports = { loadMatrixIndex, resolveRequirement };
