const assert = require('node:assert/strict');
const { test } = require('node:test');

const path = require('node:path');

const {
  UNMAPPED_PREFIX_ACTION,
  buildListTasksUrl,
  collectDevelopmentStatusRecords,
  findDuplicateStoryKeys,
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
test('every sprint-status story key in this repo resolves to an epic parent', async () => {
  const rootDir = path.join(__dirname, '..');
  const records = await collectDevelopmentStatusRecords({ rootDir });

  assert.ok(records.length > 0, 'expected the repo to declare story keys');
  const unmapped = records
    .filter((record) => !resolveEpicParentId(record.developmentStatusKey, record.track))
    .map((record) => `${record.track}: ${record.developmentStatusKey}`);

  assert.deepEqual(unmapped, [], `${unmapped.length} story key(s) have no epic parent. ${UNMAPPED_PREFIX_ACTION}`);
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
