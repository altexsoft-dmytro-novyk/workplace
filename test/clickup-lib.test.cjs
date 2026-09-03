const assert = require('node:assert/strict');
const { test } = require('node:test');

const {
  buildListTasksUrl,
  findDuplicateStoryKeys,
  findTaskIdByBmadKeyInTasks,
  formatDuplicateStoryKeys,
  readCustomFieldValue,
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
