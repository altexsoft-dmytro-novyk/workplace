const assert = require('node:assert/strict');
const { test } = require('node:test');

const path = require('node:path');

const {
  UNMAPPED_PREFIX_ACTION,
  buildListTasksUrl,
  collectDevelopmentStatusRecords,
  findDuplicateStoryKeys,
  findTaskByBmadKey,
  findTaskIdByBmadKeyInTasks,
  formatDuplicateStoryKeys,
  readCustomFieldValue,
  reportUnmappedPrefixes,
  resolveEpicParentId,
  shouldSkipDevelopmentStatus,
} = require('../scripts/clickup-lib.cjs');

const BMAD_KEY_FIELD_ID = 'd2d74782-2c7c-4c71-8fe8-eb7f7d7fb18b';

test('buildListTasksUrl requests subtasks without custom field filtering', () => {
  const url = buildListTasksUrl('901221186877', 0);

  assert.match(url, /^https:\/\/api\.clickup\.com\/api\/v2\/list\/901221186877\/task\?/);
  const parsedUrl = new URL(url);
  assert.equal(parsedUrl.searchParams.get('subtasks'), 'true');
  assert.equal(parsedUrl.searchParams.get('page'), '0');
  assert.equal(parsedUrl.searchParams.get('custom_fields'), null);
});

test('findTaskIdByBmadKeyInTasks matches bmad_key values locally', () => {
  const tasks = [
    {
      id: '869euwxyc',
      parent: '869eupgh3',
      list: { id: '901221186877' },
      custom_fields: [{ id: BMAD_KEY_FIELD_ID, value: '1-99-happy-path-test' }],
    },
    {
      id: '869eup3kz',
      parent: '869eupgh3',
      list: { id: '901221186877' },
      custom_fields: [{ id: BMAD_KEY_FIELD_ID, value: '1-1-changelog-traceability-matrix' }],
    },
  ];

  assert.equal(findTaskIdByBmadKeyInTasks(tasks, BMAD_KEY_FIELD_ID, '1-99-happy-path-test'), '869euwxyc');
  assert.equal(readCustomFieldValue(tasks[0], BMAD_KEY_FIELD_ID), '1-99-happy-path-test');
  assert.equal(findTaskIdByBmadKeyInTasks(tasks, BMAD_KEY_FIELD_ID, 'missing-key'), null);
});

test('shouldSkipDevelopmentStatus skips retrospective and optional keys', () => {
  assert.equal(shouldSkipDevelopmentStatus('epic-1-retrospective', 'optional'), true);
  assert.equal(shouldSkipDevelopmentStatus('epic-1', 'in-progress'), true);
  assert.equal(shouldSkipDevelopmentStatus('1-99-happy-path-test', 'optional'), true);
  assert.equal(shouldSkipDevelopmentStatus('1-99-happy-path-test', 'backlog'), false);
});

test('findDuplicateStoryKeys reports duplicate BMad keys across sprint files', () => {
  const duplicates = findDuplicateStoryKeys([
    {
      developmentStatusKey: '1-1-story',
      sourceKey: 'platform/sprint-status.yaml#1-1-story',
    },
    {
      developmentStatusKey: '1-1-story',
      sourceKey: 'user-management/sprint-status.yaml#1-1-story',
    },
  ]);

  assert.deepEqual(duplicates, [['1-1-story', [
    'platform/sprint-status.yaml#1-1-story',
    'user-management/sprint-status.yaml#1-1-story',
  ]]]);
  assert.match(
    formatDuplicateStoryKeys(duplicates),
    /1-1-story \(platform\/sprint-status\.yaml#1-1-story, user-management\/sprint-status\.yaml#1-1-story\)/,
  );
});

// The guard for the gap that hid 14 user-management stories: every story key the
// sync actually collects must resolve to a ClickUp epic parent, or it is dropped.
// Reports unmapped story keys instead of failing on them. A new epic lands in
// the planning artifacts before anyone can create its ClickUp parent, and on a
// plan with a task cap that gap can stay open a while -- failing here would
// block every unrelated change in the meantime. The sync itself already treats
// an unmapped story the same way (reportUnmappedPrefixes above): skip it, say
// so loudly, let the mapped stories through. This mirrors that, so there is one
// behaviour to reason about rather than a lenient sync and a strict test.
test('unmapped sprint-status story keys are reported, not failed on', async () => {
  const rootDir = path.join(__dirname, '..');
  const records = await collectDevelopmentStatusRecords({ rootDir });

  assert.ok(records.length > 0, 'expected the repo to declare story keys');
  const unmapped = records
    .filter((record) => !resolveEpicParentId(record.developmentStatusKey, record.track))
    .map((record) => ({ key: record.developmentStatusKey, track: record.track }));

  if (unmapped.length > 0) {
    // GitHub gets the Annotations panel and the job summary; a local run gets
    // stderr, which reportUnmappedPrefixes stays quiet about on its own.
    console.warn(
      `${unmapped.length} story key(s) have no epic parent:\n` +
        unmapped.map(({ track, key }) => `  - ${track}: ${key}`).join('\n') +
        `\n${UNMAPPED_PREFIX_ACTION}`,
    );
    await reportUnmappedPrefixes(unmapped);
  }
});

test('reportUnmappedPrefixes stays quiet when nothing was skipped', async () => {
  const logged = [];
  const originalLog = console.log;
  console.log = (line) => logged.push(line);
  try {
    await reportUnmappedPrefixes([], { env: { GITHUB_ACTIONS: 'true' } });
  } finally {
    console.log = originalLog;
  }

  assert.deepEqual(logged, []);
});

test('reportUnmappedPrefixes annotates the run and the job summary without failing it', async () => {
  const logged = [];
  const appended = [];
  const originalLog = console.log;
  console.log = (line) => logged.push(line);
  try {
    await reportUnmappedPrefixes(
      [{ key: '4-1-change-a-manager', track: 'user-management' }],
      {
        env: { GITHUB_ACTIONS: 'true', GITHUB_STEP_SUMMARY: '/tmp/summary.md' },
        appendFile: async (file, body) => appended.push({ file, body }),
      },
    );
  } finally {
    console.log = originalLog;
  }

  assert.equal(logged.length, 1);
  assert.match(logged[0], /^::warning title=ClickUp epic mapping incomplete::/);
  assert.match(logged[0], /user-management: 4-1-change-a-manager/);
  assert.ok(!logged[0].includes('\n'), 'an annotation must be a single line');
  assert.equal(appended[0].file, '/tmp/summary.md');
  assert.match(appended[0].body, /### ClickUp epic mapping incomplete/);
  assert.match(appended[0].body, /`user-management: 4-1-change-a-manager`/);
});

test('reportUnmappedPrefixes emits no annotation outside GitHub Actions', async () => {
  const logged = [];
  const originalLog = console.log;
  console.log = (line) => logged.push(line);
  try {
    await reportUnmappedPrefixes([{ key: '4-1-change-a-manager', track: 'user-management' }], { env: {} });
  } finally {
    console.log = originalLog;
  }

  assert.deepEqual(logged, []);
});

test('findTaskByBmadKey falls back to the task name when no bmad_key is set', async () => {
  const listTaskIndex = {
    byBmadKey: new Map([['1-1-stamped', 'task-stamped']]),
    byName: new Map([['1-2-orphan', 'task-orphan']]),
  };
  const fetchImpl = async () => {
    throw new Error('the index is already built; no request should be made');
  };

  assert.equal(await findTaskByBmadKey(fetchImpl, { bmadKey: '1-1-stamped', listTaskIndex }), 'task-stamped');
  assert.equal(await findTaskByBmadKey(fetchImpl, { bmadKey: '1-2-orphan', listTaskIndex }), 'task-orphan');
  assert.equal(await findTaskByBmadKey(fetchImpl, { bmadKey: '1-3-absent', listTaskIndex }), null);
});
