const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const yaml = require('js-yaml');

const {
  DEPT_TRACKING_KEYS,
  assertNoAmbiguousEpicIds,
  classifyTrackingKey,
  loadSliceNamespaces,
  parseEpicDocument,
  parseTrackingKeys,
  readTrackingStatuses,
  runEpicIdGuard,
} = require('../scripts/epic-id-guard.cjs');
const { compareTrackingStatuses, parseSetPairs } = require('../scripts/sprint-status-diff.cjs');
const { createMissingClickUpTasks } = require('../scripts/create-clickup-task.cjs');
const { syncClickUp } = require('../scripts/sync-clickup.cjs');
const {
  jsonResponse,
  listTasksResponse,
  withClickUpValidation,
} = require('./clickup-test-helpers.cjs');

const execFileAsync = promisify(execFile);
const REPO_ROOT = path.join(__dirname, '..');
const FIXTURES = path.join(__dirname, 'fixtures', 'epic-id-guard');
const BMAD_KEY_FIELD_ID = 'd2d74782-2c7c-4c71-8fe8-eb7f7d7fb18b';

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

async function temporaryDir(prefix) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  temporaryDirectories.push(directory);
  return directory;
}

function codes(report) {
  return report.findings.map((finding) => finding.code);
}

function findingFor(report, code) {
  return report.findings.find((finding) => finding.code === code);
}

// ── The two original defects, on isolated fixtures ────────────────────────

test('platform Epic 4 collision fails: two epic bodies and two Story 4.1/4.2 definitions', async () => {
  const report = await runEpicIdGuard({ rootDir: path.join(FIXTURES, 'platform-epic-4-collision') });

  assert.equal(report.ok, false);
  const epicFinding = findingFor(report, 'DUPLICATE_EPIC_DEFINITION');
  assert.match(epicFinding.message, /platform: Epic 4 has 2 epic bodies/);
  assert.match(epicFinding.message, /Access Control Authorization Consolidation/);
  assert.match(epicFinding.message, /Project-Line Audience/);
  assert.equal(epicFinding.locations.length, 2, 'both definitions are located, not just the first');
  for (const location of epicFinding.locations) {
    assert.match(location, /planning-artifacts\/platform\/epics\.md:\d+$/);
  }

  const storyFindings = report.findings.filter((finding) => finding.code === 'DUPLICATE_STORY_DEFINITION');
  assert.deepEqual(
    storyFindings.map((finding) => finding.message.match(/Story (\S+) has/)[1]),
    ['4.1', '4.2'],
  );
});

test('user-management Epic 6 collision fails: two epic bodies and three duplicated stories', async () => {
  const report = await runEpicIdGuard({ rootDir: path.join(FIXTURES, 'user-management-epic-6-collision') });

  assert.equal(report.ok, false);
  const epicFinding = findingFor(report, 'DUPLICATE_EPIC_DEFINITION');
  assert.match(epicFinding.message, /user-management: Epic 6 has 2 epic bodies/);
  assert.match(epicFinding.message, /Current-State Read Endpoints/);
  assert.match(epicFinding.message, /Custom Fields as Data/);

  const storyFindings = report.findings.filter((finding) => finding.code === 'DUPLICATE_STORY_DEFINITION');
  assert.deepEqual(
    storyFindings.map((finding) => finding.message.match(/Story (\S+) has/)[1]),
    ['6.1', '6.2', '6.3'],
  );
});

// The defect the parser could not see: sprint_plan.py groups by epic number and
// only rejects a repeat when the whole title slug matches, so two epics under
// one number look like one epic with extra stories.
test('the colliding fixtures differ only by title, which is what hid them from the sprint parser', async () => {
  const markdown = await fs.readFile(
    path.join(FIXTURES, 'platform-epic-4-collision/_bmad-output/planning-artifacts/platform/epics.md'),
    'utf8',
  );
  const document = parseEpicDocument(markdown, 'epics.md');
  const fourOnes = document.stories.filter((story) => story.epicNumber === 4 && story.storyNumber === 1);

  assert.equal(fourOnes.length, 2);
  assert.notEqual(fourOnes[0].title, fourOnes[1].title, 'differing titles are exactly why a slug check passed');
});

// ── Legitimate repetition must keep passing ───────────────────────────────

test('legitimate repeats pass: Epic List, cross-domain numbers, retired markers, migration maps, fences, dept keys', async () => {
  const report = await runEpicIdGuard({
    rootDir: path.join(FIXTURES, 'legitimate-repeats'),
    checkClickUpMappings: true,
  });

  assert.deepEqual(report.findings, []);
  assert.equal(report.ok, true);
});

test('an Epic List summary is not counted as a second epic definition', async () => {
  const markdown = [
    '## Epic List',
    '',
    '### Epic 4: Access Control Authorization Consolidation',
    '',
    'Summary.',
    '',
    '## Epic 4: Access Control Authorization Consolidation',
    '',
    '### Story 4.1: Only Definition',
    '',
    'Body.',
  ].join('\n');
  const document = parseEpicDocument(markdown, 'epics.md');

  assert.equal(document.epics.length, 1);
  assert.equal(document.stories.length, 1);
});

test('a retirement marker is recorded as retired, never as a definition', async () => {
  const markdown = [
    '## Epic 0: Access Control Adoption',
    '',
    '### Story 0.3: Live Story',
    '',
    'Body.',
    '',
    '### Story 0.3 — REMOVED (2026-09-01, human product decision)',
    '',
    'History.',
  ].join('\n');
  const document = parseEpicDocument(markdown, 'epics.md');

  assert.equal(document.stories.length, 1, 'the retired marker does not collide with the live story');
  assert.deepEqual(document.retired.map((entry) => entry.marker), ['REMOVED']);
});

test('headings inside a fenced block contribute no definitions', async () => {
  const markdown = [
    '## Epic 4: Real Epic',
    '',
    '### Story 4.1: Real Story',
    '',
    '```markdown',
    '## Epic 4: Pasted Example',
    '### Story 4.1: Pasted Example Story',
    '```',
    '',
    'Body.',
  ].join('\n');
  const document = parseEpicDocument(markdown, 'epics.md');

  assert.equal(document.epics.length, 1);
  assert.equal(document.stories.length, 1);
});

// planning-artifacts/epics.md is a symlink to platform-capabilities/epics.md.
// Counting both would report every definition in that file as duplicating itself.
test('a symlinked epics.md is counted once, by realpath', async () => {
  const rootDir = await temporaryDir('epic-guard-symlink-');
  const domainDir = path.join(rootDir, '_bmad-output/planning-artifacts/platform-capabilities');
  await fs.mkdir(domainDir, { recursive: true });
  await fs.writeFile(path.join(domainDir, 'epics.md'), [
    '## Epic 1: Directory',
    '',
    '### Story 1.1: Tier-Safe Directory Rows',
    '',
    'Body.',
  ].join('\n'));
  await fs.symlink(
    'platform-capabilities/epics.md',
    path.join(rootDir, '_bmad-output/planning-artifacts/epics.md'),
  );

  const report = await runEpicIdGuard({ rootDir });

  assert.deepEqual(report.findings, []);
  assert.equal(report.epicFiles.length, 1, 'the symlink and its target are one file');
  assert.equal(report.epicDefinitions, 1);
  assert.equal(report.storyDefinitions, 1);
});

test('a sprint-status.yaml reached through a symlink is counted once', async () => {
  const rootDir = await temporaryDir('epic-guard-symlink-status-');
  const trackDir = path.join(rootDir, '_bmad-output/implementation-artifacts/platform');
  await fs.mkdir(trackDir, { recursive: true });
  await fs.writeFile(path.join(trackDir, 'sprint-status.yaml'), [
    'development_status:',
    '  epic-1: done',
    '  1-1-tier-safe-directory-rows: done',
  ].join('\n'));
  await fs.symlink(
    'platform/sprint-status.yaml',
    path.join(rootDir, '_bmad-output/implementation-artifacts/sprint-status.yaml'),
  );

  const report = await runEpicIdGuard({ rootDir });

  assert.deepEqual(report.findings, []);
  assert.equal(report.trackingFiles.length, 1);
});

// ── Parent / ID / key consistency ─────────────────────────────────────────

test('a story whose prefix does not match its parent epic fails', async () => {
  const rootDir = await temporaryDir('epic-guard-parent-');
  const domainDir = path.join(rootDir, '_bmad-output/planning-artifacts/platform');
  await fs.mkdir(domainDir, { recursive: true });
  await fs.writeFile(path.join(domainDir, 'epics.md'), [
    '## Epic 5: Department Walk',
    '',
    '### Story 8.1: Project-Line Derivation',
    '',
    'Body.',
  ].join('\n'));

  const report = await runEpicIdGuard({ rootDir });

  assert.deepEqual(codes(report), ['STORY_PARENT_MISMATCH']);
  assert.match(report.findings[0].message, /Story 8\.1 sits under Epic 5/);
});

test('an explicit ID that contradicts its heading fails', async () => {
  const rootDir = await temporaryDir('epic-guard-explicit-id-');
  const domainDir = path.join(rootDir, '_bmad-output/planning-artifacts/platform');
  await fs.mkdir(domainDir, { recursive: true });
  await fs.writeFile(path.join(domainDir, 'epics.md'), [
    '## Epic 8: Project-Line Audience',
    '',
    '### Story 8.1: Project-Line Derivation',
    '',
    '**ID:** `PLAT-E4-S4.1` · **Sprint key:** `8-1-project-line-derivation`',
    '',
    'Body.',
  ].join('\n'));

  const report = await runEpicIdGuard({ rootDir });

  assert.deepEqual(codes(report), ['EXPLICIT_ID_MISMATCH']);
  assert.match(report.findings[0].message, /declares ID `PLAT-E4-S4\.1`/);
});

test('an explicit Sprint key whose prefix contradicts its heading fails', async () => {
  const rootDir = await temporaryDir('epic-guard-sprint-key-');
  const domainDir = path.join(rootDir, '_bmad-output/planning-artifacts/platform');
  await fs.mkdir(domainDir, { recursive: true });
  await fs.writeFile(path.join(domainDir, 'epics.md'), [
    '## Epic 8: Project-Line Audience',
    '',
    '### Story 8.1: Project-Line Derivation',
    '',
    '**ID:** `PLAT-E8-S8.1` · **Sprint key:** `4-1-project-line-derivation`',
    '',
    'Body.',
  ].join('\n'));

  const report = await runEpicIdGuard({ rootDir });

  assert.deepEqual(codes(report), ['SPRINT_KEY_PREFIX_MISMATCH']);
  assert.match(report.findings[0].message, /does not start with "8-1-"/);
});

// A hand-shortened key is the live state in both real tracking files. The guard
// checks identity, not spelling: renaming these would be a second migration.
test('a tracking key shorter than its story title slug is accepted', async () => {
  const rootDir = await temporaryDir('epic-guard-short-key-');
  const domainDir = path.join(rootDir, '_bmad-output/planning-artifacts/platform');
  const trackDir = path.join(rootDir, '_bmad-output/implementation-artifacts/platform');
  await fs.mkdir(domainDir, { recursive: true });
  await fs.mkdir(trackDir, { recursive: true });
  await fs.writeFile(path.join(domainDir, 'epics.md'), [
    '## Epic 4: Access Control Authorization Consolidation',
    '',
    '### Story 4.1: Generalise section-access authorisation + human section keys',
    '',
    'Body.',
  ].join('\n'));
  await fs.writeFile(path.join(trackDir, 'sprint-status.yaml'), [
    'development_status:',
    '  epic-4: done',
    '  4-1-generalise-section-access-authorisation: done',
    '  epic-4-retrospective: optional',
  ].join('\n'));

  const report = await runEpicIdGuard({ rootDir });

  assert.deepEqual(report.findings, []);
});

// ── Tracking-file invariants ──────────────────────────────────────────────

test('a duplicated tracking key fails with every line it appears on', async () => {
  const rootDir = await temporaryDir('epic-guard-dup-key-');
  const trackDir = path.join(rootDir, '_bmad-output/implementation-artifacts/platform');
  await fs.mkdir(trackDir, { recursive: true });
  await fs.writeFile(path.join(trackDir, 'sprint-status.yaml'), [
    'development_status:',
    '  epic-4: done',
    '  4-1-generalise-section-access-authorisation: done',
    '  4-1-generalise-section-access-authorisation: backlog',
  ].join('\n'));

  const report = await runEpicIdGuard({ rootDir });

  assert.deepEqual(codes(report), ['DUPLICATE_TRACKING_KEY']);
  assert.equal(report.findings[0].locations.length, 2);
});

test('the five recorded dept keys are accepted and an invented dept-like key is not', async () => {
  const rootDir = await temporaryDir('epic-guard-dept-');
  const trackDir = path.join(rootDir, '_bmad-output/implementation-artifacts/platform');
  await fs.mkdir(trackDir, { recursive: true });
  await fs.writeFile(path.join(trackDir, 'sprint-status.yaml'), [
    'development_status:',
    ...DEPT_TRACKING_KEYS.map((key) => `  ${key}: backlog`),
  ].join('\n'));

  assert.deepEqual((await runEpicIdGuard({ rootDir })).findings, []);

  await fs.writeFile(path.join(trackDir, 'sprint-status.yaml'), [
    'development_status:',
    '  dept-9-invented-forward-work: backlog',
  ].join('\n'));
  const report = await runEpicIdGuard({ rootDir });

  assert.deepEqual(codes(report), ['UNRECOGNISED_TRACKING_KEY']);
  assert.match(report.findings[0].message, /dept-9-invented-forward-work/);
});

test('classifyTrackingKey separates epics, retrospectives, split stories and dept records', () => {
  assert.deepEqual(classifyTrackingKey('epic-8'), { kind: 'epic', epicNumber: 8 });
  assert.deepEqual(classifyTrackingKey('epic-8-retrospective'), { kind: 'retro', epicNumber: 8 });
  assert.deepEqual(classifyTrackingKey('8-2a-split'), { kind: 'story', epicNumber: 8, storyNumber: 2, suffix: 'a' });
  assert.deepEqual(classifyTrackingKey('dept-epic'), { kind: 'dept' });
  assert.deepEqual(classifyTrackingKey('something-else'), { kind: 'unknown' });
});

test('parseTrackingKeys reads only the development_status block', () => {
  const keys = parseTrackingKeys([
    'generated: 09-09-2026 10:00',
    'development_status:',
    '  epic-4: done',
    '  4-1-story: done',
    'action_items:',
    '  - note: not a tracking key',
  ].join('\n'));

  assert.deepEqual(keys.map((entry) => entry.key), ['epic-4', '4-1-story']);
});

// ── The whole set is judged before the first write ────────────────────────

async function lateConflictFixture() {
  const rootDir = await temporaryDir('epic-guard-late-');
  const trackDir = path.join(rootDir, '_bmad-output/implementation-artifacts/platform');
  await fs.mkdir(trackDir, { recursive: true });
  // The valid record comes first and the unmapped one last: a check that ran
  // per-record inside the loop would already have created the first task.
  await fs.writeFile(path.join(trackDir, 'sprint-status.yaml'), [
    'development_status:',
    '  1-99-valid-mapped-story: backlog',
    '  9-9-conflicting-story: backlog',
  ].join('\n'));
  await fs.writeFile(path.join(rootDir, 'clickup-sync.yaml'), [
    'workspace_id: "90122019689"',
    'list_id: "901221186877"',
    'status_map:',
    '  backlog: "TO DO"',
    'custom_fields:',
    `  bmad_key: "${BMAD_KEY_FIELD_ID}"`,
    'tasks: {}',
  ].join('\n'));
  return rootDir;
}

test('create makes zero writes when the conflict is the last record in the set', async () => {
  const rootDir = await lateConflictFixture();
  const requests = [];
  const fetchImpl = withClickUpValidation(async (url, init = {}) => {
    requests.push({ url, method: init.method || 'GET' });
    if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
    if (url.includes('/task?')) return listTasksResponse([]);
    return jsonResponse(200, { id: 'created-task' });
  });

  await assert.rejects(
    createMissingClickUpTasks({ rootDir, token: 'secret-token', sleepImpl: async () => {}, fetchImpl }),
    (error) => {
      assert.equal(error.name, 'EpicIdCollisionError');
      assert.match(error.message, /9-9-conflicting-story/);
      return true;
    },
  );

  assert.deepEqual(requests, [], 'no request at all is issued, so no POST can have happened');
});

test('sync makes zero writes when the conflict is the last record in the set', async () => {
  const rootDir = await lateConflictFixture();
  const requests = [];
  const fetchImpl = withClickUpValidation(async (url, init = {}) => {
    requests.push({ url, method: init.method || 'GET' });
    if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
    if (url.includes('/task?')) return listTasksResponse([]);
    return jsonResponse(200, { id: 'task', team_id: '90122019689' });
  });

  await assert.rejects(
    syncClickUp({ rootDir, token: 'secret-token', sleepImpl: async () => {}, fetchImpl }),
    (error) => {
      assert.equal(error.name, 'EpicIdCollisionError');
      return true;
    },
  );

  assert.equal(requests.filter(({ method }) => method === 'PUT' || method === 'POST').length, 0);
  assert.deepEqual(requests, []);
});

test('a duplicate epic definition blocks create even when every tracking key is mapped', async () => {
  const rootDir = await temporaryDir('epic-guard-create-collision-');
  const domainDir = path.join(rootDir, '_bmad-output/planning-artifacts/platform');
  const trackDir = path.join(rootDir, '_bmad-output/implementation-artifacts/platform');
  await fs.mkdir(domainDir, { recursive: true });
  await fs.mkdir(trackDir, { recursive: true });
  await fs.copyFile(
    path.join(FIXTURES, 'platform-epic-4-collision/_bmad-output/planning-artifacts/platform/epics.md'),
    path.join(domainDir, 'epics.md'),
  );
  await fs.writeFile(path.join(trackDir, 'sprint-status.yaml'), [
    'development_status:',
    '  epic-4: done',
    '  4-1-generalise-section-access-authorisation: done',
  ].join('\n'));
  await fs.writeFile(path.join(rootDir, 'clickup-sync.yaml'), [
    'workspace_id: "90122019689"',
    'list_id: "901221186877"',
    'status_map:',
    '  done: "COMPLETE"',
    'custom_fields:',
    `  bmad_key: "${BMAD_KEY_FIELD_ID}"`,
    'tasks: {}',
  ].join('\n'));

  const requests = [];
  await assert.rejects(
    createMissingClickUpTasks({
      rootDir,
      token: 'secret-token',
      sleepImpl: async () => {},
      fetchImpl: withClickUpValidation(async (url, init = {}) => {
        requests.push({ url, method: init.method || 'GET' });
        if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
        if (url.includes('/task?')) return listTasksResponse([]);
        return jsonResponse(200, {});
      }),
    }),
    (error) => {
      assert.equal(error.name, 'EpicIdCollisionError');
      assert.ok(error.findings.some((finding) => finding.code === 'DUPLICATE_EPIC_DEFINITION'));
      return true;
    },
  );

  assert.deepEqual(requests, []);
});

test('assertNoAmbiguousEpicIds throws rather than returning a value a caller can ignore', async () => {
  await assert.rejects(
    assertNoAmbiguousEpicIds({ rootDir: path.join(FIXTURES, 'platform-epic-4-collision') }),
    { name: 'EpicIdCollisionError' },
  );

  const report = await assertNoAmbiguousEpicIds({ rootDir: path.join(FIXTURES, 'legitimate-repeats') });
  assert.equal(report.ok, true);
});

// ── The repository's own artifacts ────────────────────────────────────────

test('the repository is free of ambiguous Epic/Story IDs and unmapped ClickUp parents', async () => {
  const report = await runEpicIdGuard({ rootDir: REPO_ROOT, checkClickUpMappings: true });

  assert.deepEqual(report.findings.map((finding) => finding.toString()), []);
  assert.equal(report.ok, true);
});

test('the guard CLI exits non-zero on a collision and zero on the repaired tree', async () => {
  await assert.rejects(
    execFileAsync('node', [path.join(REPO_ROOT, 'scripts/epic-id-guard.cjs'), '--root', path.join(FIXTURES, 'platform-epic-4-collision')]),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /DUPLICATE_EPIC_DEFINITION/);
      return true;
    },
  );

  const { stdout } = await execFileAsync('node', [
    path.join(REPO_ROOT, 'scripts/epic-id-guard.cjs'),
    '--root', path.join(FIXTURES, 'legitimate-repeats'),
    '--clickup-mappings',
  ]);
  assert.match(stdout, /^Epic\/Story identifier guard: OK/);
});

// ── Wiring ────────────────────────────────────────────────────────────────

test('the guard is a blocking job in PR CI and reruns when its own files change', async () => {
  const workflow = yaml.load(await fs.readFile(path.join(REPO_ROOT, '.github/workflows/tests.yml'), 'utf8'));

  assert.ok(workflow.on.pull_request !== undefined, 'the guard must gate pull requests');
  const steps = workflow.jobs['epic-id-guard'].steps;
  assert.ok(steps.some((step) => step.run === 'npm ci'));
  assert.ok(steps.some((step) => step.run === 'npm run guard:epic-ids'));
  assert.ok(steps.some((step) => step.run === 'npm run test:epic-ids'));
  assert.equal(
    workflow.jobs['epic-id-guard']['continue-on-error'],
    undefined,
    'the guard is a real gate, not an informational job',
  );
});

test('both live ClickUp jobs run the guard before their write step', async () => {
  const raw = await fs.readFile(path.join(REPO_ROOT, '.github/workflows/sync-clickup.yml'), 'utf8');
  const workflow = yaml.load(raw);

  for (const jobName of ['create-if-missing', 'sync']) {
    const runs = workflow.jobs[jobName].steps.map((step) => step.run).filter(Boolean);
    const guardIndex = runs.indexOf('npm run guard:epic-ids:clickup');
    const writeIndex = runs.findIndex((run) => run.startsWith('npm run create:clickup') || run.startsWith('npm run sync:clickup'));
    assert.ok(guardIndex >= 0, `${jobName} must run the guard`);
    assert.ok(writeIndex >= 0, `${jobName} must still run its write step`);
    assert.ok(guardIndex < writeIndex, `${jobName} must run the guard before writing`);
  }

  const paths = workflow.on.push.paths;
  assert.ok(paths.includes('scripts/epic-id-guard.cjs'), 'a change to the guard itself must re-run the workflow');
  assert.ok(paths.includes('test/epic-id-guard.test.cjs'));
});

// A stub standing in for sprint_plan.py, so the wrapper's own behaviour is
// testable without a Python toolchain. It writes `candidate` to whatever
// --status-file it is handed and records every invocation — which is exactly
// what the real generator does, and what makes the copy-run comparison work.
async function stubGenerator({ candidate }) {
  const directory = await temporaryDir('sprint-plan-stub-');
  const scriptPath = path.join(directory, 'sprint_plan.py');
  const logPath = path.join(directory, 'invocations.log');
  await fs.writeFile(scriptPath, [
    'import json, sys',
    'argv = sys.argv[1:]',
    `open(${JSON.stringify(logPath)}, "a").write(" ".join(argv) + "\\n")`,
    'target = argv[argv.index("--status-file") + 1]',
    `open(target, "w").write(${JSON.stringify(candidate)})`,
    'print(json.dumps({"ok": True}))',
  ].join('\n'));
  return { scriptPath, logPath, directory };
}

const CURRENT_STATUS = [
  'development_status:',
  '  epic-4: done',
  '  4-1-generalise-section-access-authorisation: done',
  '  6-1-read-current-manager-and-people-partner: review',
  '  dept-epic: backlog',
  '',
].join('\n');

async function statusFileWith(content) {
  const directory = await temporaryDir('sprint-status-');
  const filePath = path.join(directory, 'sprint-status.yaml');
  await fs.writeFile(filePath, content);
  return filePath;
}

async function runWrapper(stub, statusFile, { extraArgs = [], env = {} } = {}) {
  return execFileAsync(path.join(REPO_ROOT, 'scripts/sprint-status-generate.sh'), [
    'generate',
    '--status-file', statusFile,
    '--stories-dir', 'stories',
    '--project', 'platform',
    '--date', '09-09-2026 19:00',
    ...extraArgs,
  ], {
    env: {
      ...process.env,
      SPRINT_PLAN_SCRIPT: stub.scriptPath,
      SPRINT_PLAN_RUNNER: 'python3',
      ...env,
    },
  });
}

async function invocationsOf(stub) {
  try {
    return (await fs.readFile(stub.logPath, 'utf8')).trim().split('\n');
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

// Measured against a copy of the real platform file: a plain regenerate drops
// all five dept-* records and renames 4-1/4-2 to their full title slugs.
test('the wrapper refuses a candidate that drops tracking entries and leaves the file byte-identical', async () => {
  const statusFile = await statusFileWith(CURRENT_STATUS);
  const before = await fs.readFile(statusFile);
  const stub = await stubGenerator({
    candidate: 'development_status:\n  epic-4: done\n  4-1-generalise-section-access-authorisation: done\n  6-1-read-current-manager-and-people-partner: review\n',
  });

  await assert.rejects(runWrapper(stub, statusFile), (error) => {
    assert.equal(error.code, 1);
    assert.match(error.stderr, /1 tracking entry would be dropped/);
    assert.match(error.stderr, /dept-epic \(backlog\)/);
    assert.match(error.stderr, /was not modified/);
    return true;
  });

  assert.deepEqual(await fs.readFile(statusFile), before, 'the real file is byte-identical');
  assert.equal((await invocationsOf(stub)).length, 1, 'only the copy run happened');
});

// The gap a dropped-orphans check cannot see: --fresh reports no dropped
// orphans while recomputing every status from scratch. On a copy of the real
// user-management file it downgraded 21 entries and dropped 7 more.
test('the wrapper refuses a --fresh candidate that downgrades recorded progress', async () => {
  const statusFile = await statusFileWith(CURRENT_STATUS);
  const before = await fs.readFile(statusFile);
  const stub = await stubGenerator({
    candidate: 'development_status:\n  epic-4: backlog\n  4-1-generalise-section-access-authorisation: backlog\n  6-1-read-current-manager-and-people-partner: backlog\n  dept-epic: backlog\n',
  });

  await assert.rejects(runWrapper(stub, statusFile, { extraArgs: ['--fresh'] }), (error) => {
    assert.equal(error.code, 1);
    assert.match(error.stderr, /3 status changes were not requested with --set/);
    assert.match(error.stderr, /epic-4: done -> backlog/);
    assert.match(error.stderr, /6-1-read-current-manager-and-people-partner: review -> backlog/);
    return true;
  });

  assert.deepEqual(await fs.readFile(statusFile), before, 'the real file is byte-identical');
  assert.equal((await invocationsOf(stub)).length, 1, 'the write pass was never reached');
});

test('a status change requested with --set is acknowledged and the generate proceeds', async () => {
  const statusFile = await statusFileWith(CURRENT_STATUS);
  const stub = await stubGenerator({
    candidate: 'development_status:\n  epic-4: done\n  4-1-generalise-section-access-authorisation: done\n  6-1-read-current-manager-and-people-partner: done\n  dept-epic: backlog\n',
  });

  const { stdout } = await runWrapper(stub, statusFile, {
    extraArgs: ['--set', '6-1-read-current-manager-and-people-partner=done'],
  });

  assert.match(stdout, /"ok": true/);
  assert.equal((await invocationsOf(stub)).length, 2, 'the copy run, then the real write');
  const written = await fs.readFile(statusFile, 'utf8');
  assert.match(written, /6-1-read-current-manager-and-people-partner: done/);
});

test('a --set naming a different status than the candidate produces does not acknowledge it', async () => {
  const statusFile = await statusFileWith(CURRENT_STATUS);
  const stub = await stubGenerator({
    candidate: 'development_status:\n  epic-4: done\n  4-1-generalise-section-access-authorisation: done\n  6-1-read-current-manager-and-people-partner: backlog\n  dept-epic: backlog\n',
  });

  await assert.rejects(
    runWrapper(stub, statusFile, {
      extraArgs: ['--set', '6-1-read-current-manager-and-people-partner=done'],
    }),
    (error) => {
      assert.match(error.stderr, /6-1-read-current-manager-and-people-partner: review -> backlog/);
      return true;
    },
  );
});

test('the wrapper proceeds when the candidate preserves every key and status', async () => {
  const statusFile = await statusFileWith(CURRENT_STATUS);
  const stub = await stubGenerator({
    candidate: `${CURRENT_STATUS}  8-1-a-newly-added-story: backlog\n`,
  });

  const { stdout } = await runWrapper(stub, statusFile);

  assert.match(stdout, /"ok": true/);
  assert.equal((await invocationsOf(stub)).length, 2);
  assert.match(await fs.readFile(statusFile, 'utf8'), /8-1-a-newly-added-story/);
});

test('the wrapper permits first generation when the output status file does not exist', async () => {
  const directory = await temporaryDir('first-sprint-status-');
  const statusFile = path.join(directory, 'sprint-status.yaml');
  const stub = await stubGenerator({ candidate: CURRENT_STATUS });
  const epicFile = path.join(REPO_ROOT, '_bmad-output/planning-artifacts/platform/epics.md');

  const { stdout } = await runWrapper(stub, statusFile, {
    extraArgs: ['--epic-file', epicFile],
  });

  assert.match(stdout, /"ok": true/);
  assert.equal((await invocationsOf(stub)).length, 1, 'first generation has no copy run');
  assert.equal(await fs.readFile(statusFile, 'utf8'), CURRENT_STATUS);
});

test('SPRINT_STATUS_ALLOW_UNSAFE is the only way past the comparison', async () => {
  const statusFile = await statusFileWith(CURRENT_STATUS);
  const stub = await stubGenerator({ candidate: 'development_status:\n  epic-4: backlog\n' });

  const { stdout } = await runWrapper(stub, statusFile, { env: { SPRINT_STATUS_ALLOW_UNSAFE: '1' } });

  assert.match(stdout, /"ok": true/);
  assert.equal((await invocationsOf(stub)).length, 1, 'the comparison is skipped when acknowledged');
});

// The generator parses whatever --epic-file it is handed, so "the repository is
// clean" proves nothing about the run. A colliding file from outside the tree
// produced a tracking file containing both Epic 4 story sets while the guard
// reported OK on 13 repository files.
test('the wrapper checks the epic files actually passed, not just the repository', async () => {
  const statusFile = await statusFileWith(CURRENT_STATUS);
  const before = await fs.readFile(statusFile);
  const stub = await stubGenerator({ candidate: CURRENT_STATUS });
  const rogue = path.join(FIXTURES, 'platform-epic-4-collision/_bmad-output/planning-artifacts/platform/epics.md');

  await assert.rejects(
    runWrapper(stub, statusFile, { extraArgs: ['--epic-file', rogue] }),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /DUPLICATE_EPIC_DEFINITION/);
      assert.match(error.stderr, /Project-Line Audience/);
      return true;
    },
  );

  assert.deepEqual(await fs.readFile(statusFile), before);
  assert.deepEqual(await invocationsOf(stub), [], 'the generator was never invoked');
});

test('an out-of-tree epic file is reported by absolute path, not a chain of ..', async () => {
  const directory = await temporaryDir('rogue-epics-');
  const rogue = path.join(directory, 'epics.md');
  await fs.copyFile(
    path.join(FIXTURES, 'platform-epic-4-collision/_bmad-output/planning-artifacts/platform/epics.md'),
    rogue,
  );

  const report = await runEpicIdGuard({ rootDir: REPO_ROOT, epicFiles: [rogue] });

  assert.equal(report.ok, false);
  assert.ok(report.findings[0].locations.every((location) => location.startsWith(directory)));
});

// ── CLI form normalisation ────────────────────────────────────────────────
// argparse accepts `--flag value` and `--flag=value` alike. A wrapper that
// understood only the first form read `--status-file=path` as an opaque token,
// found no status file, skipped every check, and handed the argument to a
// generator that understood it — `--fresh` then wiped the file with exit 0.

test('--flag=value is understood, so --fresh is caught in that form too', async () => {
  const statusFile = await statusFileWith(CURRENT_STATUS);
  const before = await fs.readFile(statusFile);
  const stub = await stubGenerator({ candidate: 'development_status:\n  epic-4: backlog\n' });

  await assert.rejects(
    execFileAsync(path.join(REPO_ROOT, 'scripts/sprint-status-generate.sh'), [
      'generate',
      '--fresh',
      `--status-file=${statusFile}`,
      '--stories-dir=stories',
      '--project=platform',
      '--date=09-09-2026 19:00',
    ], {
      env: { ...process.env, SPRINT_PLAN_SCRIPT: stub.scriptPath, SPRINT_PLAN_RUNNER: 'python3' },
    }),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /does not preserve the current tracking state/);
      return true;
    },
  );

  assert.deepEqual(await fs.readFile(statusFile), before, 'the real file is byte-identical');
  assert.equal((await invocationsOf(stub)).length, 1, 'the write pass was never reached');
});

test('--set=key=status in the =value form still acknowledges exactly that change', async () => {
  const statusFile = await statusFileWith(CURRENT_STATUS);
  const stub = await stubGenerator({
    candidate: 'development_status:\n  epic-4: done\n  4-1-generalise-section-access-authorisation: done\n  6-1-read-current-manager-and-people-partner: done\n  dept-epic: backlog\n',
  });

  const { stdout } = await execFileAsync(path.join(REPO_ROOT, 'scripts/sprint-status-generate.sh'), [
    'generate',
    `--status-file=${statusFile}`,
    '--stories-dir=stories',
    '--project=platform',
    '--date=09-09-2026 19:00',
    '--set=6-1-read-current-manager-and-people-partner=done',
  ], {
    env: { ...process.env, SPRINT_PLAN_SCRIPT: stub.scriptPath, SPRINT_PLAN_RUNNER: 'python3' },
  });

  assert.match(stdout, /"ok": true/);
  assert.equal((await invocationsOf(stub)).length, 2);
});

test('the normalised arguments are what the generator receives', async () => {
  const statusFile = await statusFileWith(CURRENT_STATUS);
  const stub = await stubGenerator({ candidate: CURRENT_STATUS });

  await execFileAsync(path.join(REPO_ROOT, 'scripts/sprint-status-generate.sh'), [
    'generate', `--status-file=${statusFile}`, '--stories-dir=stories',
    '--project=platform', '--date=09-09-2026 19:00',
  ], {
    env: { ...process.env, SPRINT_PLAN_SCRIPT: stub.scriptPath, SPRINT_PLAN_RUNNER: 'python3' },
  });

  // The checked invocation and the executed one must be the same invocation.
  for (const invocation of await invocationsOf(stub)) {
    assert.doesNotMatch(invocation, /--status-file=/, 'the =value form was folded before execution');
    assert.match(invocation, /--status-file \S/);
  }
});

test('a generate whose --status-file cannot be identified is refused, not run', async () => {
  const stub = await stubGenerator({ candidate: CURRENT_STATUS });

  await assert.rejects(
    execFileAsync(path.join(REPO_ROOT, 'scripts/sprint-status-generate.sh'), [
      'generate', '--stories-dir=stories', '--project=platform', '--date=09-09-2026 19:00',
    ], {
      env: { ...process.env, SPRINT_PLAN_SCRIPT: stub.scriptPath, SPRINT_PLAN_RUNNER: 'python3' },
    }),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /no --status-file was found/);
      return true;
    },
  );

  assert.deepEqual(await invocationsOf(stub), [], 'the generator was never invoked');
});

// ── Tracking files are read as YAML, not scanned ──────────────────────────
// A quoted key is the same key. The line scanner used to miss `"epic-1": done`
// entirely and hand back an empty map, which compares equal to "nothing lost"
// — so a full reset of done/review to backlog reported no findings at all.

test('quoted and bare keys are the same identities', () => {
  const quoted = 'development_status:\n  "epic-1": done\n  "1-1-stable-key": review\n';
  const bare = 'development_status:\n  epic-1: done\n  1-1-stable-key: review\n';

  assert.deepEqual([...readTrackingStatuses(quoted)], [...readTrackingStatuses(bare)]);
});

test('a quoted-key file compared against its own reset is not reported as unchanged', () => {
  const before = 'development_status:\n  "epic-1": done\n  "1-1-stable-key": review\n';
  const after = 'development_status:\n  "epic-1": backlog\n  "1-1-stable-key": backlog\n';

  const result = compareTrackingStatuses(before, after, new Map());

  assert.deepEqual(result.changed, [
    { key: 'epic-1', from: 'done', to: 'backlog' },
    { key: '1-1-stable-key', from: 'review', to: 'backlog' },
  ]);
});

test('quoting either side of the pair changes nothing', () => {
  const before = "development_status:\n  'epic-1': done\n  1-1-stable-key: \"review\"\n";
  const after = 'development_status:\n  epic-1: "done"\n  "1-1-stable-key": review\n';

  const result = compareTrackingStatuses(before, after, new Map());

  assert.deepEqual(result, { dropped: [], changed: [], acknowledged: [], added: [] });
});

test('the line scanner locates quoted keys, single-quoted keys and quoted statuses', () => {
  const entries = parseTrackingKeys([
    'development_status:',
    '  "epic-1": done',
    "  'epic-2': 'in-progress'",
    '  1-1-bare: "review"',
  ].join('\n'));

  assert.deepEqual(entries, [
    { key: 'epic-1', status: 'done', line: 2 },
    { key: 'epic-2', status: 'in-progress', line: 3 },
    { key: '1-1-bare', status: 'review', line: 4 },
  ]);
});

test('a four-space indented development_status block is read normally', () => {
  const content = 'development_status:\n    epic-1: done\n    1-1-story: review\n';

  assert.deepEqual([...readTrackingStatuses(content)], [['epic-1', 'done'], ['1-1-story', 'review']]);
  assert.deepEqual(parseTrackingKeys(content).map((entry) => entry.key), ['epic-1', '1-1-story']);
});

test('comments and blank lines inside the block are skipped, trailing comments are not statuses', () => {
  const entries = parseTrackingKeys([
    'development_status:',
    '  # a section comment',
    '',
    '  1-7-um-planning-residual: done  # CAP-1 is seed; registration folder retired',
  ].join('\n'));

  assert.deepEqual(entries, [{ key: '1-7-um-planning-residual', status: 'done', line: 4 }]);
});

test('an unreadable tracking format is an error, never an empty map', () => {
  const cases = [
    ['', /is not valid YAML|is empty/],
    ['just a string\n', /must be a YAML mapping/],
    ['- a\n- b\n', /must be a YAML mapping/],
    ['project: platform\n', /has no development_status section/],
    ['development_status: not-a-mapping\n', /development_status must be a YAML mapping/],
    ['development_status:\n  epic-1:\n    nested: value\n', /has no scalar status/],
    ['development_status:\n  epic-1: done\n   bad-indent: [\n', /is not valid YAML/],
  ];

  for (const [content, expected] of cases) {
    assert.throws(
      () => readTrackingStatuses(content),
      (error) => {
        assert.equal(error.name, 'TrackingFormatError');
        assert.match(error.message, expected);
        return true;
      },
      `expected ${JSON.stringify(content)} to be rejected`,
    );
  }
});

test('a duplicated key is rejected by the YAML parser and located by the scanner', async () => {
  const rootDir = await temporaryDir('epic-guard-dup-yaml-');
  const trackDir = path.join(rootDir, '_bmad-output/implementation-artifacts/platform');
  await fs.mkdir(trackDir, { recursive: true });
  await fs.writeFile(path.join(trackDir, 'sprint-status.yaml'), [
    'development_status:',
    '  epic-4: done',
    '  "epic-4": backlog',
  ].join('\n'));

  const report = await runEpicIdGuard({ rootDir });

  assert.deepEqual(codes(report), ['DUPLICATE_TRACKING_KEY']);
  assert.equal(report.findings[0].locations.length, 2, 'quoted and bare spellings are one key');
  assert.throws(
    () => readTrackingStatuses('development_status:\n  epic-4: done\n  epic-4: backlog\n'),
    /duplicated mapping key/,
  );
});

test('the guard reports a malformed tracking file rather than treating it as empty', async () => {
  const rootDir = await temporaryDir('epic-guard-malformed-');
  const trackDir = path.join(rootDir, '_bmad-output/implementation-artifacts/platform');
  await fs.mkdir(trackDir, { recursive: true });
  await fs.writeFile(path.join(trackDir, 'sprint-status.yaml'), 'project: platform\n');

  const report = await runEpicIdGuard({ rootDir });

  assert.deepEqual(codes(report), ['MALFORMED_TRACKING_FILE']);
  assert.match(report.findings[0].message, /never as an empty one/);
});

test('the comparator refuses to judge a candidate it cannot read', () => {
  assert.throws(
    () => compareTrackingStatuses(CURRENT_STATUS, 'project: platform\n', new Map()),
    (error) => {
      assert.equal(error.name, 'TrackingFormatError');
      assert.match(error.message, /candidate sprint-status file/);
      return true;
    },
  );
});

test('a status file that does not exist yet is a first generation, not a malformed one', () => {
  const result = compareTrackingStatuses(null, CURRENT_STATUS, new Map());

  assert.deepEqual(result.dropped, []);
  assert.deepEqual(result.changed, []);
  assert.equal(result.added.length, 4);
});

// ── Comparator ────────────────────────────────────────────────────────────

test('compareTrackingStatuses separates drops, unrequested changes, acknowledged changes and additions', () => {
  const before = 'development_status:\n  a-1-x: done\n  b-2-y: review\n  c-3-z: backlog\n';
  const after = 'development_status:\n  a-1-x: backlog\n  b-2-y: done\n  d-4-w: backlog\n';

  const result = compareTrackingStatuses(before, after, new Map([['b-2-y', 'done']]));

  assert.deepEqual(result.dropped, [{ key: 'c-3-z', status: 'backlog' }]);
  assert.deepEqual(result.changed, [{ key: 'a-1-x', from: 'done', to: 'backlog' }]);
  assert.deepEqual(result.acknowledged, [{ key: 'b-2-y', from: 'review', to: 'done' }]);
  assert.deepEqual(result.added, [{ key: 'd-4-w', status: 'backlog' }]);
});

// null means "the file does not exist yet". An empty string does NOT: an
// existing file that reads as empty is a format failure, because treating it as
// an empty document is exactly how a reset passes an emptiness check.
test('a first generation is signalled by null, while an empty existing file is rejected', () => {
  const result = compareTrackingStatuses(null, 'development_status:\n  a-1-x: backlog\n', new Map());

  assert.deepEqual(result.dropped, []);
  assert.deepEqual(result.changed, []);
  assert.equal(result.added.length, 1);

  assert.throws(
    () => compareTrackingStatuses('', 'development_status:\n  a-1-x: backlog\n', new Map()),
    { name: 'TrackingFormatError' },
  );
});

test('parseSetPairs reads repeated --set values and ignores malformed ones', () => {
  const pairs = parseSetPairs(['a-1-x=done', 'b-2-y=review', 'malformed', '=leading']);

  assert.deepEqual([...pairs], [['a-1-x', 'done'], ['b-2-y', 'review']]);
});

test('readTrackingStatuses reads statuses, ignoring trailing comments', () => {
  const statuses = readTrackingStatuses([
    'development_status:',
    '  1-7-um-planning-residual: done  # CAP-1 is seed; registration folder retired',
    '  epic-4: done',
  ].join('\n'));

  assert.equal(statuses.get('1-7-um-planning-residual'), 'done');
  assert.equal(statuses.get('epic-4'), 'done');
});

// ── Namespace, by declaration ─────────────────────────────────────────────

async function sliceFixture(idLine) {
  const rootDir = await temporaryDir('epic-guard-namespace-');
  const coverageDir = path.join(rootDir, '_bmad-output/planning-artifacts/global-coverage');
  const domainDir = path.join(rootDir, '_bmad-output/planning-artifacts/user-management');
  await fs.mkdir(coverageDir, { recursive: true });
  await fs.mkdir(domainDir, { recursive: true });
  await fs.writeFile(path.join(coverageDir, 'global-fr-epic-story-coverage.yaml'), [
    'namespace_rules:',
    '  user_management_epics: UM-E*',
    'source_slices:',
    '  - id: UM',
    '    path: _bmad-output/planning-artifacts/user-management/epics.md',
    '    role: bounded-context-slice',
  ].join('\n'));
  await fs.writeFile(path.join(domainDir, 'epics.md'), [
    '## Epic 8: Custom Fields as Data',
    '',
    '### Story 8.1: Define a Custom Field with Declared Visibility',
    '',
    idLine,
    '',
    'Body.',
  ].join('\n'));
  return rootDir;
}

test('a PLAT- ID inside the declared UM slice fails', async () => {
  const rootDir = await sliceFixture('**ID:** `PLAT-E8-S8.1` · **Sprint key:** `8-1-define-a-custom-field-with-declared-visibility`');

  const report = await runEpicIdGuard({ rootDir });

  assert.deepEqual(codes(report), ['NAMESPACE_MISMATCH']);
  assert.match(report.findings[0].message, /declared as slice UM/);
  assert.match(report.findings[0].message, /PLAT- ID in a UM file/);
});

test('the declared namespace passes', async () => {
  const rootDir = await sliceFixture('**ID:** `UM-E8-S8.1` · **Sprint key:** `8-1-define-a-custom-field-with-declared-visibility`');

  assert.deepEqual((await runEpicIdGuard({ rootDir })).findings, []);
});

// The registry is the authority. Inventing a namespace for a file it does not
// declare would put this guard at odds with the coverage model it serves.
test('a file the slice registry does not declare gets no namespace check', async () => {
  const rootDir = await temporaryDir('epic-guard-undeclared-');
  const domainDir = path.join(rootDir, '_bmad-output/planning-artifacts/scratch-domain');
  await fs.mkdir(domainDir, { recursive: true });
  await fs.writeFile(path.join(domainDir, 'epics.md'), [
    '## Epic 8: Something',
    '',
    '### Story 8.1: A Story',
    '',
    '**ID:** `PLAT-E8-S8.1` · **Sprint key:** `8-1-a-story`',
    '',
    'Body.',
  ].join('\n'));

  assert.deepEqual((await runEpicIdGuard({ rootDir })).findings, []);
});

test('the real slice registry declares the two domains this repair touched', async () => {
  const namespaces = await loadSliceNamespaces(REPO_ROOT);
  const byPath = new Map([...namespaces].map(([realPath, id]) => [path.relative(REPO_ROOT, realPath), id]));

  assert.equal(byPath.get('_bmad-output/planning-artifacts/platform/epics.md'), 'PLAT');
  assert.equal(byPath.get('_bmad-output/planning-artifacts/user-management/epics.md'), 'UM');
});

test('a collision stops the wrapper before the generator is invoked at all', async () => {
  const stub = await stubGenerator({ droppedOrphans: [] });

  await assert.rejects(
    execFileAsync(path.join(REPO_ROOT, 'scripts/sprint-status-generate.sh'), ['generate', '--status-file', 'x'], {
      env: {
        ...process.env,
        SPRINT_PLAN_SCRIPT: stub.scriptPath,
        SPRINT_PLAN_RUNNER: 'python3',
        // Point the guard at the colliding fixture by running the wrapper with a
        // root whose artifacts are ambiguous.
        SPRINT_STATUS_GUARD_ROOT: path.join(FIXTURES, 'platform-epic-4-collision'),
      },
    }),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /DUPLICATE_EPIC_DEFINITION/);
      return true;
    },
  );

  await assert.rejects(fs.readFile(stub.logPath, 'utf8'), { code: 'ENOENT' });
});

test('the sprint-status generator wrapper runs the guard before invoking sprint_plan.py', async () => {
  const script = await fs.readFile(path.join(REPO_ROOT, 'scripts/sprint-status-generate.sh'), 'utf8');
  const guardIndex = script.indexOf('epic-id-guard.cjs');
  const generatorIndex = script.indexOf('exec "${SPRINT_PLAN_RUNNER[@]}"');

  assert.ok(guardIndex >= 0 && generatorIndex >= 0);
  assert.ok(guardIndex < generatorIndex, 'the guard must precede the generator');
  assert.match(script, /set -euo pipefail/, 'a failing guard must abort the wrapper');
});

// The installed skill is replaced wholesale on update, so the guard is wired in
// through the supported customization layer rather than by patching the script.
test('the sprint-planning customization override points the skill at the guard', async () => {
  const override = await fs.readFile(path.join(REPO_ROOT, '_bmad/custom/bmad-sprint-planning.toml'), 'utf8');

  assert.match(override, /\[workflow\]/);
  assert.match(override, /activation_steps_prepend/);
  assert.match(override, /scripts\/epic-id-guard\.cjs/);
  assert.match(override, /sprint-status-generate\.sh/);
});
