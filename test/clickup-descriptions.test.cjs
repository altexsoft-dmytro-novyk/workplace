const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { syncClickUp } = require('../scripts/sync-clickup.cjs');
const { createMissingClickUpTasks } = require('../scripts/create-clickup-task.cjs');
const {
  collectStoryDescriptions,
  descriptionsConfig,
  parseEpicStories,
  readTaskDescription,
} = require('../scripts/clickup-lib.cjs');
const { jsonResponse, listTasksResponse, withClickUpValidation } = require('./clickup-test-helpers.cjs');

const temporaryDirectories = [];
const BMAD_KEY_FIELD_ID = 'd2d74782-2c7c-4c71-8fe8-eb7f7d7fb18b';

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

const EPICS_MARKDOWN = [
  '## Epic 1: Some Epic',
  '',
  '### Story 1.99: Test Story With A Declared Key',
  '',
  '**ID:** `PLAT-E1-S1.99` · **Sprint key:** `1-99-test-story`',
  '',
  'As a reader,',
  'I want the story body carried across,',
  'So that ClickUp shows what the epic says.',
  '',
  '**Acceptance Criteria:**',
  '',
  '- The description is generated from the epic file.',
  '',
  '### Story 1.98: Derived Key (ACM-7)',
  '',
  'This story declares no sprint key, so the key comes from the heading.',
  '',
  '## Epic 2: Another Epic',
  '',
  'Not a story, must not be captured.',
].join('\n');

const OVERWRITE_CONFIG = [
  'workspace_id: "90122019689"',
  'list_id: "901221186877"',
  'status_map:',
  '  in-progress: "IN PROGRESS"',
  'descriptions:',
  '  overwrite: true',
  'tasks:',
  '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
  '    task_id: "task-123"',
].join('\n');

async function createFixture({ config, status = 'in-progress', storyKey = '1-99-test-story', epics = EPICS_MARKDOWN, twoStories = false } = {}) {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'clickup-descriptions-'));
  temporaryDirectories.push(rootDir);
  const sourcePath = path.join(rootDir, '_bmad-output/implementation-artifacts/platform/sprint-status.yaml');
  const epicsPath = path.join(rootDir, '_bmad-output/planning-artifacts/platform/epics.md');
  const configPath = path.join(rootDir, 'clickup-sync.yaml');
  const sourceKey = `_bmad-output/implementation-artifacts/platform/sprint-status.yaml#${storyKey}`;
  await fs.mkdir(path.dirname(sourcePath), { recursive: true });
  await fs.mkdir(path.dirname(epicsPath), { recursive: true });
  const developmentStatus = twoStories
    ? `  ${storyKey}: ${status}\n  1-98-derived-key-acm-7: ${status}\n`
    : `  ${storyKey}: ${status}\n`;
  await fs.writeFile(sourcePath, `development_status:\n${developmentStatus}`);
  if (epics !== null) await fs.writeFile(epicsPath, epics);
  await fs.writeFile(configPath, config ?? [
    'workspace_id: "90122019689"',
    'list_id: "901221186877"',
    'status_map:',
    '  in-progress: "IN PROGRESS"',
    'tasks:',
    `  "${sourceKey}":`,
    '    task_id: "task-123"',
  ].join('\n'));
  return { configPath, rootDir, sourcePath, sourceKey, storyKey };
}

function taskFetch(description, recorded) {
  return withClickUpValidation(async (url, init = {}) => {
    recorded.push({ url, init });
    if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
    if (url.includes('/task/') && !init.method) {
      return jsonResponse(200, { id: 'task-123', team_id: '90122019689', ...description });
    }
    return jsonResponse(200, {});
  });
}

function descriptionWrites(recorded) {
  return recorded
    .filter(({ init }) => init.method === 'PUT' && String(init.body).includes('markdown_description'))
    .map(({ init }) => JSON.parse(init.body).markdown_description);
}

test('parseEpicStories prefers a declared sprint key and derives one from the heading otherwise', () => {
  const stories = parseEpicStories(EPICS_MARKDOWN);

  assert.equal(stories.length, 2);
  assert.equal(stories[0].sprintKey, '1-99-test-story');
  assert.equal(stories[0].sprintKeySource, 'declared');
  assert.equal(stories[0].title, 'Test Story With A Declared Key');
  assert.equal(stories[1].sprintKey, '1-98-derived-key-acm-7');
  assert.equal(stories[1].sprintKeySource, 'derived');
  assert.ok(!stories.some((story) => story.body.includes('Not a story')));
});

test('collectStoryDescriptions builds markdown carrying the story body and its source', async () => {
  const { rootDir } = await createFixture();

  const descriptions = await collectStoryDescriptions({ rootDir, tracks: ['platform'] });
  const story = descriptions.get('1-99-test-story');

  assert.ok(story.markdown.startsWith('**Test Story With A Declared Key**'));
  assert.ok(story.markdown.includes('I want the story body carried across,'));
  assert.ok(story.markdown.includes('_bmad-output/planning-artifacts/platform/epics.md'));
  assert.equal(story.track, 'platform');
});

test('collectStoryDescriptions tolerates a track with no epics file', async () => {
  const { rootDir } = await createFixture({ epics: null });

  const descriptions = await collectStoryDescriptions({ rootDir, tracks: ['platform'] });

  assert.equal(descriptions.size, 0);
});

test('descriptionsConfig defaults to fill-empty and honours explicit settings', () => {
  assert.deepEqual(descriptionsConfig({}), { enabled: true, overwrite: false });
  assert.deepEqual(descriptionsConfig({ descriptions: false }), { enabled: false, overwrite: false });
  assert.deepEqual(descriptionsConfig({ descriptions: { enabled: false } }), { enabled: false, overwrite: false });
  assert.deepEqual(descriptionsConfig({ descriptions: { overwrite: true } }), { enabled: true, overwrite: true });
});

test('readTaskDescription prefers markdown_description and falls back to description', () => {
  assert.equal(readTaskDescription({ markdown_description: '# md', description: 'plain' }), '# md');
  assert.equal(readTaskDescription({ markdown_description: '   ', description: 'plain' }), 'plain');
  assert.equal(readTaskDescription({}), '');
});

test('syncClickUp writes the generated description into a task that has none', async () => {
  const fixture = await createFixture();
  const recorded = [];

  const summary = await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: taskFetch({}, recorded),
  });

  assert.equal(summary.descriptionsUpdated, 1);
  const written = descriptionWrites(recorded);
  assert.equal(written.length, 1);
  assert.ok(written[0].includes('**Test Story With A Declared Key**'));
});

test('syncClickUp leaves an existing description alone when overwrite is off', async () => {
  const fixture = await createFixture();
  const recorded = [];

  const summary = await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: taskFetch({ markdown_description: 'written by a human in ClickUp' }, recorded),
  });

  assert.equal(summary.updated, 1);
  assert.equal(summary.descriptionsUpdated, 0);
  assert.deepEqual(descriptionWrites(recorded), []);
});

test('syncClickUp replaces an existing description when overwrite is on', async () => {
  const fixture = await createFixture({
    config: [
      'workspace_id: "90122019689"',
      'list_id: "901221186877"',
      'status_map:',
      '  in-progress: "IN PROGRESS"',
      'descriptions:',
      '  overwrite: true',
      'tasks:',
      '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
      '    task_id: "task-123"',
    ].join('\n'),
  });
  const recorded = [];

  const summary = await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: taskFetch({ markdown_description: 'stale text' }, recorded),
  });

  assert.equal(summary.descriptionsUpdated, 1);
  assert.ok(descriptionWrites(recorded)[0].includes('**Test Story With A Declared Key**'));
});

test('syncClickUp writes no description when descriptions are disabled', async () => {
  const fixture = await createFixture({
    config: [
      'workspace_id: "90122019689"',
      'list_id: "901221186877"',
      'status_map:',
      '  in-progress: "IN PROGRESS"',
      'descriptions: false',
      'tasks:',
      '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
      '    task_id: "task-123"',
    ].join('\n'),
  });
  const recorded = [];

  const summary = await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: taskFetch({}, recorded),
  });

  assert.equal(summary.descriptionsUpdated, 0);
  assert.deepEqual(descriptionWrites(recorded), []);
});

test('createMissingClickUpTasks sends the generated description on create', async () => {
  const fixture = await createFixture({
    status: 'backlog',
    config: [
      'workspace_id: "90122019689"',
      'list_id: "901221186877"',
      'status_map:',
      '  backlog: "TO DO"',
      'custom_fields:',
      `  bmad_key: "${BMAD_KEY_FIELD_ID}"`,
      'tasks: {}',
    ].join('\n'),
  });
  const recorded = [];

  const summary = await createMissingClickUpTasks({
    ...fixture,
    token: 'secret-token',
    sleepImpl: async () => {},
    fetchImpl: withClickUpValidation(async (url, init = {}) => {
      recorded.push({ url, init });
      if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
      if (url.includes('/task?')) return listTasksResponse([]);
      if (url.includes('/list/') && init.method === 'POST') return jsonResponse(200, { id: 'created-1' });
      if (url.includes('/task/') && !init.method) {
        return jsonResponse(200, {
          id: 'created-1',
          team_id: '90122019689',
          custom_fields: [{ id: BMAD_KEY_FIELD_ID, value: '1-99-test-story' }],
        });
      }
      return jsonResponse(200, {});
    }),
  });

  assert.equal(summary.created, 1);
  const createBody = JSON.parse(recorded.find(({ init }) => init.method === 'POST' && init.body?.includes('parent')).init.body);
  assert.ok(createBody.markdown_description.includes('**Test Story With A Declared Key**'));
  assert.equal(createBody.name, '1-99-test-story');
});

test('syncClickUp leaves a description alone when its fingerprint is current, even in overwrite mode', async () => {
  const fixture = await createFixture({ config: OVERWRITE_CONFIG });
  const descriptions = await collectStoryDescriptions({ rootDir: fixture.rootDir, tracks: ['platform'] });
  const current = descriptions.get('1-99-test-story');
  const recorded = [];

  // ClickUp renders the stored markdown back as plain text, so the round-tripped
  // body never matches character for character. Only the fingerprint does.
  const asPlainText = current.markdown.replace(/\*\*/g, '').replace(/`/g, '').replace(/_/g, '');
  assert.notEqual(asPlainText, current.markdown);

  const summary = await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: taskFetch({ description: asPlainText }, recorded),
  });

  assert.equal(summary.descriptionsUpdated, 0);
  assert.deepEqual(descriptionWrites(recorded), []);
});

test('syncClickUp rewrites a description whose fingerprint is stale', async () => {
  const fixture = await createFixture({ config: OVERWRITE_CONFIG });
  const recorded = [];

  const summary = await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: taskFetch({ description: 'older text bmad-sync:000000000000' }, recorded),
  });

  assert.equal(summary.descriptionsUpdated, 1);
  assert.ok(descriptionWrites(recorded)[0].includes('bmad-sync:'));
});

test('syncClickUp survives a rejected description write and keeps going', async () => {
  const fixture = await createFixture({
    status: 'in-progress',
    twoStories: true,
    config: [
      'workspace_id: "90122019689"',
      'list_id: "901221186877"',
      'status_map:',
      '  in-progress: "IN PROGRESS"',
      'custom_fields:',
      '  git_branch: "git-branch-field"',
      'tasks:',
      '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
      '    task_id: "task-123"',
      '    git_branch: feature/story-1',
      '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-98-derived-key-acm-7":',
      '    task_id: "task-456"',
    ].join('\n'),
  });
  const recorded = [];

  const summary = await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    sleepImpl: async () => {},
    fetchImpl: withClickUpValidation(async (url, init = {}) => {
      recorded.push({ url, init });
      if (url.endsWith('/team')) return jsonResponse(200, { teams: [{ id: '90122019689' }] });
      if (url.includes('/task/') && !init.method) {
        return jsonResponse(200, { id: 'task', team_id: '90122019689' });
      }
      if (url.includes('task-123') && String(init.body).includes('markdown_description')) {
        return jsonResponse(400, { err: 'Description too long', ECODE: 'ITEM_099' });
      }
      return jsonResponse(200, {});
    }),
  });

  assert.equal(summary.descriptionsFailed, 1);
  assert.equal(summary.updated, 2, 'the second entry is still processed');
  assert.equal(summary.descriptionsUpdated, 1, 'the second description is still written');
  assert.ok(
    recorded.some(({ url }) => url.includes('/task/task-123/field/git-branch-field')),
    'the custom field write after the failed description still runs',
  );
});

test('syncClickUp treats an empty descriptions block as the default rather than failing', async () => {
  const fixture = await createFixture({
    config: [
      'workspace_id: "90122019689"',
      'list_id: "901221186877"',
      'status_map:',
      '  in-progress: "IN PROGRESS"',
      'descriptions:',
      'tasks:',
      '  "_bmad-output/implementation-artifacts/platform/sprint-status.yaml#1-99-test-story":',
      '    task_id: "task-123"',
    ].join('\n'),
  });
  const recorded = [];

  const summary = await syncClickUp({
    ...fixture,
    sprintStatusPaths: [fixture.sourcePath],
    token: 'secret-token',
    fetchImpl: taskFetch({}, recorded),
  });

  assert.equal(summary.descriptionsUpdated, 1);
});

test('collectStoryDescriptions reports a read error that is not a missing file', async () => {
  const { rootDir } = await createFixture({ epics: null });
  await fs.mkdir(path.join(rootDir, '_bmad-output/planning-artifacts/platform/epics.md'), { recursive: true });

  await assert.rejects(
    collectStoryDescriptions({ rootDir, tracks: ['platform'] }),
    /Unable to read epic stories at _bmad-output\/planning-artifacts\/platform\/epics\.md/,
  );
});
