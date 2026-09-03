const assert = require('node:assert/strict');
const { test } = require('node:test');

const {
  buildBmadKeyFilterUrl,
  findDuplicateStoryKeys,
  formatDuplicateStoryKeys,
  shouldSkipDevelopmentStatus,
} = require('../scripts/clickup-lib.cjs');

test('buildBmadKeyFilterUrl uses exact-match operator and URLSearchParams encoding', () => {
  const url = buildBmadKeyFilterUrl(
    '7012056981667022142',
    'd2d74782-2c7c-4c71-8fe8-eb7f7d7fb18b',
    '1-99-happy-path-test',
  );

  assert.match(url, /^https:\/\/api\.clickup\.com\/api\/v2\/list\/7012056981667022142\/task\?/);
  const query = new URL(url).searchParams.get('custom_fields');
  assert.deepEqual(JSON.parse(query), [{
    field_id: 'd2d74782-2c7c-4c71-8fe8-eb7f7d7fb18b',
    operator: '==',
    value: '1-99-happy-path-test',
  }]);
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
