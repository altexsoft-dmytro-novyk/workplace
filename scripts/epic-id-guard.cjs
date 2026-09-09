'use strict';

// Guard against ambiguous Epic/Story identifiers.
//
// Two collisions reached main undetected: platform carried two "## Epic 4"
// bodies (Consolidation and Project-Line) and user-management carried two
// "## Epic 6" bodies (Current-State Reads and Custom Fields). Neither the
// sprint parser nor the ClickUp collector caught them: sprint_plan.py groups
// stories under `epics.setdefault(int(n), [])` and only rejects a repeat when
// the whole title slug matches, and collectStoryDescriptions warns and keeps
// the first description. Different titles under the same number therefore look
// like extra stories of one epic rather than two epics wearing one number.
//
// This module is deliberately repo-owned rather than a patch to the installed
// BMad skill: `.agents/skills/**/scripts/sprint_plan.py` is replaced wholesale
// on every skill update. The skill is pointed at this guard through the
// supported customization layer (`_bmad/custom/bmad-sprint-planning.toml`), and
// CI enforces it independently so a bypassed wrapper still fails the PR.

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const yaml = require('js-yaml');

const PLANNING_ARTIFACTS_DIR = '_bmad-output/planning-artifacts';
const IMPLEMENTATION_ARTIFACTS_DIR = '_bmad-output/implementation-artifacts';

// Non-numeric sprint-status keys that are legitimate today. Listed exactly,
// never as a `dept-` prefix rule: an unknown key that merely starts with the
// right letters is the failure this guard exists to catch.
const DEPT_TRACKING_KEYS = Object.freeze([
  'dept-epic',
  'dept-1-department-manager-fact-and-direct-derivation',
  'dept-2-profile-timeline-dual-gate-and-dec-um-001',
  'dept-3-full-department-reporting-line-audience',
  'dept-4-timeline-dual-gate-test-fallout',
]);

const FENCE_RE = /^\s{0,3}(?:```|~~~)/;
// A definition: "## Epic 4: Access Control Authorization Consolidation".
const EPIC_DEF_RE = /^##\s+Epic\s+(\d+)\s*:\s*(.+?)\s*$/;
// A definition: "### Story 4.1: Generalise section-access authorisation".
const STORY_DEF_RE = /^###\s+Story\s+(\d+)\.(\d+)([a-z]?)\s*:\s*(.+?)\s*$/;
// A retirement marker: "### Story 0.3 — REMOVED (2026-09-01, ...)". Not a
// definition, and not a collision with a live story of the same number.
const STORY_RETIRED_RE =
  /^###\s+Story\s+(\d+)\.(\d+)([a-z]?)\s*[—–-]+\s*(REMOVED|RETIRED|SPLIT|MOVED|SUPERSEDED)\b/i;
// Anything else heading-shaped that names a story: prose, a migration note, an
// Epic List summary. Tracked only so a definition written in an unexpected
// shape cannot hide behind a number that is already defined.
const STORY_SUSPECT_RE = /^#{2,4}\s+Story\s+(\d+)\.(\d+)([a-z]?)\b/;
const ANY_H2_RE = /^##\s+/;
const EPIC_LIST_RE = /^##\s+Epic\s+List\s*$/i;

const EXPLICIT_ID_RE = /\*\*ID:\*\*\s*`([A-Z][A-Z0-9]*)-E(\d+)-S(\d+)\.(\d+)([a-z]?)`/;
const EXPLICIT_SPRINT_KEY_RE = /\*\*Sprint key:\*\*\s*`([^`]+)`/;

const STORY_TRACKING_KEY_RE = /^(\d+)-(\d+)([a-z]?)-(.+)$/;
const EPIC_TRACKING_KEY_RE = /^epic-(\d+)$/;
const RETRO_TRACKING_KEY_RE = /^epic-(\d+)-retrospective$/;

class GuardFinding {
  constructor(code, message, locations = []) {
    this.code = code;
    this.message = message;
    this.locations = locations;
  }

  toString() {
    const where = this.locations.length > 0 ? `\n    at ${this.locations.join('\n    at ')}` : '';
    return `[${this.code}] ${this.message}${where}`;
  }
}

class EpicIdCollisionError extends Error {
  constructor(findings) {
    super(
      `Epic/Story identifier guard failed with ${findings.length} ${findings.length === 1 ? 'problem' : 'problems'}:\n  `
      + findings.map((finding) => finding.toString()).join('\n  '),
    );
    this.name = 'EpicIdCollisionError';
    this.findings = findings;
  }
}

function locate(filePath, lineNumber) {
  return `${filePath}:${lineNumber}`;
}

// A file outside the root is named absolutely rather than as a chain of `..`.
// These paths end up in failure messages a human has to act on.
function displayPath(rootDir, filePath) {
  const relative = path.relative(rootDir, filePath);
  return relative.startsWith('..') ? filePath : relative;
}

// planning-artifacts/epics.md is a symlink to platform-capabilities/epics.md.
// Counting it twice would report every definition in that file as a duplicate
// of itself, so discovery keys on realpath and keeps the shortest visible path
// for reporting.
function dedupeByRealPath(entries) {
  const byRealPath = new Map();
  for (const entry of entries) {
    let realPath;
    try {
      realPath = fs.realpathSync(entry.path);
    } catch {
      realPath = path.resolve(entry.path);
    }
    const existing = byRealPath.get(realPath);
    if (!existing || entry.relativePath.length < existing.relativePath.length) {
      byRealPath.set(realPath, { ...entry, realPath });
    }
  }
  return [...byRealPath.values()].sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

const COVERAGE_REGISTRY = `${PLANNING_ARTIFACTS_DIR}/global-coverage/global-fr-epic-story-coverage.yaml`;

// Which ID namespace a domain owns is a declaration, not something to infer
// from a directory name: global-fr-epic-story-coverage.yaml carries the
// `source_slices` registry (id + path) and the matching `namespace_rules`
// (`user_management_epics: UM-E*`). A file the registry does not declare gets
// no namespace check — an undeclared domain has no namespace to violate, and
// inventing one here would put this guard at odds with the coverage model.
async function loadSliceNamespaces(rootDir) {
  const registryPath = path.join(rootDir, COVERAGE_REGISTRY);
  let raw;
  try {
    raw = await fsp.readFile(registryPath, 'utf8');
  } catch {
    return new Map();
  }

  const namespaces = new Map();
  // Deliberately a line scan rather than a YAML load: the registry is a large
  // canonical document and this guard needs two fields from one list.
  let inSlices = false;
  let current = null;
  for (const line of raw.split('\n')) {
    if (/^source_slices\s*:/.test(line)) {
      inSlices = true;
      continue;
    }
    if (!inSlices) continue;
    if (/^\S/.test(line)) break;

    const idMatch = line.match(/^\s*-\s*id:\s*(\S+)\s*$/);
    if (idMatch) {
      current = idMatch[1];
      continue;
    }
    const pathMatch = line.match(/^\s*path:\s*(\S+)\s*$/);
    if (pathMatch && current) {
      const slicePath = path.join(rootDir, pathMatch[1]);
      let realPath;
      try {
        realPath = fs.realpathSync(slicePath);
      } catch {
        realPath = path.resolve(slicePath);
      }
      namespaces.set(realPath, current);
      current = null;
    }
  }
  return namespaces;
}

async function listDirectories(baseDir) {
  let dirents;
  try {
    dirents = await fsp.readdir(baseDir, { withFileTypes: true });
  } catch {
    return [];
  }
  return dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
}

async function discoverEpicFiles(rootDir) {
  const baseDir = path.join(rootDir, PLANNING_ARTIFACTS_DIR);
  const candidates = [];
  const push = (relativePath, domain) => {
    const filePath = path.join(rootDir, relativePath);
    if (fs.existsSync(filePath)) candidates.push({ path: filePath, relativePath, domain });
  };

  push(`${PLANNING_ARTIFACTS_DIR}/epics.md`, '(root)');
  for (const domain of await listDirectories(baseDir)) {
    push(`${PLANNING_ARTIFACTS_DIR}/${domain}/epics.md`, domain);
    push(`${PLANNING_ARTIFACTS_DIR}/${domain}/dept-epic.md`, domain);
  }
  return dedupeByRealPath(candidates).map((entry) => ({
    ...entry,
    // After dedupe the domain must come from the file that actually holds the
    // definitions, not from the symlink that pointed at it.
    domain: path.basename(path.dirname(entry.realPath)),
  }));
}

async function discoverSprintStatusFiles(rootDir) {
  const baseDir = path.join(rootDir, IMPLEMENTATION_ARTIFACTS_DIR);
  const candidates = [];
  const push = (relativePath) => {
    const filePath = path.join(rootDir, relativePath);
    if (fs.existsSync(filePath)) candidates.push({ path: filePath, relativePath });
  };

  push(`${IMPLEMENTATION_ARTIFACTS_DIR}/sprint-status.yaml`);
  for (const domain of await listDirectories(baseDir)) {
    push(`${IMPLEMENTATION_ARTIFACTS_DIR}/${domain}/sprint-status.yaml`);
  }
  return dedupeByRealPath(candidates).map((entry) => ({
    ...entry,
    track: path.basename(path.dirname(entry.realPath)),
  }));
}

// Walks one epics.md and separates live definitions from the things that
// legitimately repeat a number: "## Epic List" summaries, retirement markers,
// migration maps and historical prose.
function parseEpicDocument(markdown, relativePath) {
  const epics = [];
  const stories = [];
  const retired = [];
  const suspects = [];

  let inFence = false;
  let inEpicList = false;
  let currentEpic = null;
  let currentStory = null;

  const lines = String(markdown).split('\n');
  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;

    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    if (EPIC_LIST_RE.test(line)) {
      inEpicList = true;
      currentEpic = null;
      currentStory = null;
      continue;
    }

    const epicMatch = line.match(EPIC_DEF_RE);
    if (epicMatch) {
      // "## Epic List" already returned above; any other H2 closes the summary
      // region, so this is a real epic body.
      inEpicList = false;
      currentStory = null;
      currentEpic = {
        epicNumber: Number(epicMatch[1]),
        title: epicMatch[2],
        file: relativePath,
        line: lineNumber,
      };
      epics.push(currentEpic);
      continue;
    }

    if (ANY_H2_RE.test(line)) {
      inEpicList = false;
      currentEpic = null;
      currentStory = null;
      continue;
    }

    const retiredMatch = line.match(STORY_RETIRED_RE);
    if (retiredMatch) {
      currentStory = null;
      retired.push({
        epicNumber: Number(retiredMatch[1]),
        storyNumber: Number(retiredMatch[2]),
        suffix: retiredMatch[3] || '',
        marker: retiredMatch[4].toUpperCase(),
        file: relativePath,
        line: lineNumber,
      });
      continue;
    }

    const storyMatch = line.match(STORY_DEF_RE);
    if (storyMatch && !inEpicList) {
      currentStory = {
        epicNumber: Number(storyMatch[1]),
        storyNumber: Number(storyMatch[2]),
        suffix: storyMatch[3] || '',
        title: storyMatch[4],
        parentEpic: currentEpic ? currentEpic.epicNumber : null,
        parentEpicLine: currentEpic ? currentEpic.line : null,
        explicitId: null,
        explicitSprintKey: null,
        file: relativePath,
        line: lineNumber,
      };
      stories.push(currentStory);
      continue;
    }

    if (STORY_SUSPECT_RE.test(line) && !inEpicList) {
      const suspectMatch = line.match(STORY_SUSPECT_RE);
      suspects.push({
        epicNumber: Number(suspectMatch[1]),
        storyNumber: Number(suspectMatch[2]),
        suffix: suspectMatch[3] || '',
        text: line.trim(),
        file: relativePath,
        line: lineNumber,
      });
      currentStory = null;
      continue;
    }

    if (!currentStory) continue;

    const idMatch = line.match(EXPLICIT_ID_RE);
    if (idMatch && !currentStory.explicitId) {
      currentStory.explicitId = {
        raw: idMatch[0].match(/`([^`]+)`/)[1],
        prefix: idMatch[1],
        epicNumber: Number(idMatch[2]),
        storyEpicNumber: Number(idMatch[3]),
        storyNumber: Number(idMatch[4]),
        suffix: idMatch[5] || '',
        line: lineNumber,
      };
    }
    const sprintKeyMatch = line.match(EXPLICIT_SPRINT_KEY_RE);
    if (sprintKeyMatch && !currentStory.explicitSprintKey) {
      currentStory.explicitSprintKey = { value: sprintKeyMatch[1], line: lineNumber };
    }
  }

  return { epics, stories, retired, suspects, file: relativePath };
}

function storyLabel(story) {
  return `${story.epicNumber}.${story.storyNumber}${story.suffix}`;
}

// Invariants 1-5: identity inside the planning artifacts.
function checkEpicDocuments(documentsByDomain) {
  const findings = [];

  for (const [domain, documents] of documentsByDomain) {
    const epicsByNumber = new Map();
    const storiesByLabel = new Map();

    for (const document of documents) {
      for (const epic of document.epics) {
        if (!epicsByNumber.has(epic.epicNumber)) epicsByNumber.set(epic.epicNumber, []);
        epicsByNumber.get(epic.epicNumber).push(epic);
      }
      for (const story of document.stories) {
        const label = storyLabel(story);
        if (!storiesByLabel.has(label)) storiesByLabel.set(label, []);
        storiesByLabel.get(label).push(story);
      }
    }

    for (const [epicNumber, definitions] of [...epicsByNumber].sort((a, b) => a[0] - b[0])) {
      if (definitions.length > 1) {
        findings.push(new GuardFinding(
          'DUPLICATE_EPIC_DEFINITION',
          `${domain}: Epic ${epicNumber} has ${definitions.length} epic bodies (${definitions.map((d) => `"${d.title}"`).join(' vs ')}). One Epic ID must name one epic.`,
          definitions.map((d) => locate(d.file, d.line)),
        ));
      }
    }

    for (const [label, definitions] of [...storiesByLabel].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))) {
      if (definitions.length > 1) {
        findings.push(new GuardFinding(
          'DUPLICATE_STORY_DEFINITION',
          `${domain}: Story ${label} has ${definitions.length} definitions (${definitions.map((d) => `"${d.title}"`).join(' vs ')}). One Story ID must name one story.`,
          definitions.map((d) => locate(d.file, d.line)),
        ));
      }
    }

    for (const document of documents) {
      for (const story of document.stories) {
        if (story.parentEpic === null) {
          findings.push(new GuardFinding(
            'ORPHAN_STORY',
            `${domain}: Story ${storyLabel(story)} "${story.title}" is not inside any "## Epic N:" body.`,
            [locate(story.file, story.line)],
          ));
        } else if (story.parentEpic !== story.epicNumber) {
          findings.push(new GuardFinding(
            'STORY_PARENT_MISMATCH',
            `${domain}: Story ${storyLabel(story)} sits under Epic ${story.parentEpic}. A story prefix must match its parent epic.`,
            [locate(story.file, story.line), locate(story.file, story.parentEpicLine)],
          ));
        }

        const explicit = story.explicitId;
        if (explicit && document.sliceId && explicit.prefix !== document.sliceId) {
          findings.push(new GuardFinding(
            'NAMESPACE_MISMATCH',
            `${domain}: Story ${storyLabel(story)} declares ID \`${explicit.raw}\`, but ${document.file} is declared as slice ${document.sliceId} in ${COVERAGE_REGISTRY}. A ${explicit.prefix}- ID in a ${document.sliceId} file points at another domain's story.`,
            [locate(story.file, explicit.line)],
          ));
        }
        if (explicit) {
          if (explicit.epicNumber !== story.epicNumber
            || explicit.storyEpicNumber !== story.epicNumber
            || explicit.storyNumber !== story.storyNumber
            || explicit.suffix !== story.suffix) {
            findings.push(new GuardFinding(
              'EXPLICIT_ID_MISMATCH',
              `${domain}: Story ${storyLabel(story)} declares ID \`${explicit.raw}\`, which does not match its heading.`,
              [locate(story.file, explicit.line)],
            ));
          }
        }

        const sprintKey = story.explicitSprintKey;
        if (sprintKey) {
          const expectedPrefix = `${story.epicNumber}-${story.storyNumber}${story.suffix}-`;
          if (!sprintKey.value.startsWith(expectedPrefix)) {
            findings.push(new GuardFinding(
              'SPRINT_KEY_PREFIX_MISMATCH',
              `${domain}: Story ${storyLabel(story)} declares Sprint key \`${sprintKey.value}\`, which does not start with "${expectedPrefix}".`,
              [locate(story.file, sprintKey.line)],
            ));
          }
        }
      }

      // A heading that names a story number already defined elsewhere in the
      // domain, in a shape this guard does not recognise as a definition, is
      // the one case where "it's only prose" cannot be assumed.
      for (const suspect of document.suspects) {
        const label = `${suspect.epicNumber}.${suspect.storyNumber}${suspect.suffix}`;
        if (storiesByLabel.has(label)) {
          findings.push(new GuardFinding(
            'AMBIGUOUS_STORY_HEADING',
            `${domain}: heading "${suspect.text}" reuses Story ${label}, which is already defined. Rewrite it so it is unambiguously a reference, or give it its own ID.`,
            [locate(suspect.file, suspect.line), ...storiesByLabel.get(label).map((d) => locate(d.file, d.line))],
          ));
        }
      }
    }
  }

  return findings;
}

// Line locations for reporting only. The authority on what a tracking file
// contains is readTrackingStatuses below, which uses a real YAML parser; this
// scan exists because a YAML error object cannot tell you that a duplicate key
// sits on lines 3 and 4 of a file the parser refused to load.
//
// It accepts every spelling YAML accepts for the same mapping: quoted or bare
// keys, quoted or bare statuses, and whatever indentation the block uses. A key
// written as `"epic-1": done` is the same key as `epic-1: done`, and a scanner
// that sees only one of them reports an empty file as if it were unchanged.
function parseTrackingKeys(content) {
  const lines = String(content).split('\n');
  const entries = [];
  let inDevelopmentStatus = false;
  let blockIndent = null;

  for (const [index, line] of lines.entries()) {
    if (!inDevelopmentStatus) {
      if (/^\s*development_status\s*:/.test(line)) inDevelopmentStatus = true;
      continue;
    }
    if (line.trim() === '' || /^\s*#/.test(line)) continue;

    const indent = line.match(/^(\s*)/)[1].length;
    if (indent === 0) break;
    if (blockIndent === null) blockIndent = indent;
    // Deeper indentation belongs to a nested value, not to a tracking key.
    if (indent !== blockIndent) continue;

    const match = line.match(
      /^\s*(?:"([^"]+)"|'([^']+)'|([^\s:#"'][^:#]*?))\s*:\s*(?:"([^"]*)"|'([^']*)'|([^\s#]*))/,
    );
    if (!match) continue;
    const key = (match[1] ?? match[2] ?? match[3]).trim();
    const status = match[4] ?? match[5] ?? (match[6] || null);
    entries.push({ key, status: status === '' ? null : status, line: index + 1 });
  }
  return entries;
}

class TrackingFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TrackingFormatError';
  }
}

// The authority on a tracking file's contents. A format this cannot read is an
// error, never an empty map: an empty map compares equal to nothing being lost,
// which is how a quoted-key file passed a comparison that should have stopped a
// full status reset. js-yaml rejects duplicated mapping keys itself.
function readTrackingStatuses(content, label = 'sprint status file') {
  let document;
  try {
    document = yaml.load(content);
  } catch (error) {
    throw new TrackingFormatError(`${label} is not valid YAML: ${error.message.split('\n')[0]}`);
  }

  if (document === null || document === undefined || document === '') {
    throw new TrackingFormatError(`${label} is empty`);
  }
  if (typeof document !== 'object' || Array.isArray(document)) {
    throw new TrackingFormatError(`${label} must be a YAML mapping`);
  }
  if (!Object.hasOwn(document, 'development_status')) {
    throw new TrackingFormatError(`${label} has no development_status section`);
  }

  const developmentStatus = document.development_status;
  if (!developmentStatus || typeof developmentStatus !== 'object' || Array.isArray(developmentStatus)) {
    throw new TrackingFormatError(`${label}: development_status must be a YAML mapping`);
  }

  const statuses = new Map();
  for (const [key, value] of Object.entries(developmentStatus)) {
    if (value === null || typeof value === 'object') {
      throw new TrackingFormatError(`${label}: tracking key "${key}" has no scalar status`);
    }
    statuses.set(String(key), String(value));
  }
  return statuses;
}

function classifyTrackingKey(key) {
  if (RETRO_TRACKING_KEY_RE.test(key)) {
    return { kind: 'retro', epicNumber: Number(key.match(RETRO_TRACKING_KEY_RE)[1]) };
  }
  if (EPIC_TRACKING_KEY_RE.test(key)) {
    return { kind: 'epic', epicNumber: Number(key.match(EPIC_TRACKING_KEY_RE)[1]) };
  }
  const storyMatch = key.match(STORY_TRACKING_KEY_RE);
  if (storyMatch) {
    return {
      kind: 'story',
      epicNumber: Number(storyMatch[1]),
      storyNumber: Number(storyMatch[2]),
      suffix: storyMatch[3] || '',
    };
  }
  if (DEPT_TRACKING_KEYS.includes(key)) return { kind: 'dept' };
  return { kind: 'unknown' };
}

// Invariants 6-7: identity inside the tracking files. Deliberately does NOT
// require a tracking key to equal the slug of its story title — several live
// keys are shortened by hand (4-1-generalise-section-access-authorisation,
// 6-1-read-current-manager-and-people-partner) and renaming them would
// re-create the very ambiguity this guard prevents.
function checkTrackingDocuments(trackingDocuments) {
  const findings = [];

  for (const document of trackingDocuments) {
    const { relativePath, keys } = document;

    const seen = new Map();
    const epicKeys = new Set();

    for (const { key, line } of keys) {
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key).push(line);
      if (EPIC_TRACKING_KEY_RE.test(key)) epicKeys.add(Number(key.match(EPIC_TRACKING_KEY_RE)[1]));
    }

    // Reported before the format error it also causes: js-yaml rejects a
    // duplicated mapping key, but only the line scan can say which key and on
    // which lines. `"epic-1"` and `epic-1` are the same key here, as they are
    // to YAML.
    const duplicates = [...seen].filter(([, lineNumbers]) => lineNumbers.length > 1);
    for (const [key, lineNumbers] of duplicates) {
      findings.push(new GuardFinding(
        'DUPLICATE_TRACKING_KEY',
        `${relativePath}: tracking key "${key}" appears ${lineNumbers.length} times.`,
        lineNumbers.map((line) => locate(relativePath, line)),
      ));
    }
    if (duplicates.length > 0) continue;

    if (document.formatError) {
      findings.push(new GuardFinding(
        'MALFORMED_TRACKING_FILE',
        `${document.formatError}. A tracking file this guard cannot read is treated as a failure, never as an empty one.`,
        [relativePath],
      ));
      continue;
    }

    for (const { key, line } of keys) {
      const classified = classifyTrackingKey(key);
      if (classified.kind === 'unknown') {
        findings.push(new GuardFinding(
          'UNRECOGNISED_TRACKING_KEY',
          `${relativePath}: tracking key "${key}" is neither epic-N, epic-N-retrospective, N-M-slug, nor one of the recorded DEPT keys (${DEPT_TRACKING_KEYS.join(', ')}).`,
          [locate(relativePath, line)],
        ));
        continue;
      }
      // Only meaningful for a file that tracks epics at all. A hand-written
      // partial file (the `1-99-*` merge-gate key, a test fixture) declares no
      // epic records and makes no epic claim to contradict.
      if (classified.kind === 'story' && epicKeys.size > 0 && !epicKeys.has(classified.epicNumber)) {
        findings.push(new GuardFinding(
          'STORY_WITHOUT_EPIC_RECORD',
          `${relativePath}: story key "${key}" belongs to Epic ${classified.epicNumber}, which has no "epic-${classified.epicNumber}" record.`,
          [locate(relativePath, line)],
        ));
      }
    }
  }

  return findings;
}

async function collectGuardInput(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const epicFiles = options.epicFiles
    ? dedupeByRealPath(options.epicFiles.map((filePath) => ({
      path: path.resolve(rootDir, filePath),
      relativePath: displayPath(rootDir, path.resolve(rootDir, filePath)) || filePath,
      domain: path.basename(path.dirname(path.resolve(rootDir, filePath))),
    }))).map((entry) => ({ ...entry, domain: path.basename(path.dirname(entry.realPath)) }))
    : await discoverEpicFiles(rootDir);

  const trackingFiles = options.sprintStatusPaths
    ? dedupeByRealPath(options.sprintStatusPaths.map((filePath) => ({
      path: path.resolve(rootDir, filePath),
      relativePath: displayPath(rootDir, path.resolve(rootDir, filePath)) || filePath,
    }))).map((entry) => ({ ...entry, track: path.basename(path.dirname(entry.realPath)) }))
    : await discoverSprintStatusFiles(rootDir);

  const sliceNamespaces = options.sliceNamespaces || await loadSliceNamespaces(rootDir);

  const documentsByDomain = new Map();
  for (const file of epicFiles) {
    const markdown = await fsp.readFile(file.path, 'utf8');
    const document = parseEpicDocument(markdown, file.relativePath);
    document.sliceId = sliceNamespaces.get(file.realPath) ?? null;
    if (!documentsByDomain.has(file.domain)) documentsByDomain.set(file.domain, []);
    documentsByDomain.get(file.domain).push(document);
  }

  const trackingDocuments = [];
  for (const file of trackingFiles) {
    const content = await fsp.readFile(file.path, 'utf8');
    const document = { ...file, keys: parseTrackingKeys(content), formatError: null };
    try {
      // Parsed for its side effect here: a file this rejects is reported as a
      // finding rather than silently contributing nothing.
      readTrackingStatuses(content, file.relativePath);
    } catch (error) {
      document.formatError = error.message;
    }
    trackingDocuments.push(document);
  }

  return { rootDir, epicFiles, trackingFiles, documentsByDomain, trackingDocuments };
}

// Invariant 8: every numeric tracking key must resolve to a ClickUp epic
// parent. An unmapped numeric key is an error, not a skip-with-warning — a
// warning is how 14 stories silently went missing from the board.
function checkClickUpMappings(trackingDocuments, resolveEpicParentId, trackFilter) {
  const findings = [];
  const unmappedByTrack = new Map();

  for (const document of trackingDocuments) {
    const { track, relativePath, keys } = document;
    if (trackFilter && !trackFilter.includes(track)) continue;

    for (const { key, line } of keys) {
      const classified = classifyTrackingKey(key);
      if (classified.kind === 'dept') continue;
      if (classified.kind === 'retro') continue;
      if (classified.kind === 'unknown') continue; // reported by checkTrackingDocuments
      const lookupKey = classified.kind === 'epic' ? `${classified.epicNumber}-` : key;
      if (resolveEpicParentId(lookupKey, track)) continue;
      if (!unmappedByTrack.has(track)) unmappedByTrack.set(track, []);
      unmappedByTrack.get(track).push({ key, location: locate(relativePath, line), epicNumber: classified.epicNumber });
    }
  }

  for (const [track, unmapped] of unmappedByTrack) {
    const epicNumbers = [...new Set(unmapped.map((entry) => entry.epicNumber))].sort((a, b) => a - b);
    findings.push(new GuardFinding(
      'UNMAPPED_CLICKUP_PARENT',
      `${track}: ${unmapped.length} tracking ${unmapped.length === 1 ? 'key has' : 'keys have'} no ClickUp epic parent (Epic ${epicNumbers.join(', ')}). Add the real parent task IDs to EPIC_BY_TRACK in scripts/clickup-lib.cjs; never invent them.`,
      unmapped.map((entry) => `${entry.key} (${entry.location})`),
    ));
  }

  return findings;
}

async function runEpicIdGuard(options = {}) {
  const input = await collectGuardInput(options);
  const findings = [
    ...checkEpicDocuments(input.documentsByDomain),
    ...checkTrackingDocuments(input.trackingDocuments),
  ];

  if (options.checkClickUpMappings) {
    const { resolveEpicParentId, INCLUDED_TRACKS } = require('./clickup-lib.cjs');
    findings.push(...checkClickUpMappings(
      input.trackingDocuments,
      options.resolveEpicParentId || resolveEpicParentId,
      // Only the tracks the sync actually writes. Domains such as mentorship or
      // platform-capabilities keep tracking files that no ClickUp job reads, and
      // demanding parents for them would be a permanently red gate.
      options.tracks || INCLUDED_TRACKS,
    ));
  }

  return {
    ok: findings.length === 0,
    findings,
    epicFiles: input.epicFiles.map((file) => file.relativePath),
    trackingFiles: input.trackingFiles.map((file) => file.relativePath),
    epicDefinitions: [...input.documentsByDomain.values()].reduce((total, documents) => total + documents.reduce((n, d) => n + d.epics.length, 0), 0),
    storyDefinitions: [...input.documentsByDomain.values()].reduce((total, documents) => total + documents.reduce((n, d) => n + d.stories.length, 0), 0),
    trackingKeys: input.trackingDocuments.reduce((total, d) => total + d.keys.length, 0),
  };
}

// The single call every writer makes before its first write. Throws, so a
// caller cannot proceed to a POST/PUT or a sprint-status write by ignoring a
// return value.
async function assertNoAmbiguousEpicIds(options = {}) {
  const report = await runEpicIdGuard(options);
  if (!report.ok) throw new EpicIdCollisionError(report.findings);
  return report;
}

module.exports = {
  DEPT_TRACKING_KEYS,
  EpicIdCollisionError,
  GuardFinding,
  assertNoAmbiguousEpicIds,
  checkClickUpMappings,
  checkEpicDocuments,
  checkTrackingDocuments,
  classifyTrackingKey,
  collectGuardInput,
  discoverEpicFiles,
  discoverSprintStatusFiles,
  loadSliceNamespaces,
  parseEpicDocument,
  parseTrackingKeys,
  readTrackingStatuses,
  runEpicIdGuard,
  TrackingFormatError,
};

if (require.main === module) {
  const argv = process.argv.slice(2);
  const asJson = argv.includes('--json');
  const withClickUp = argv.includes('--clickup-mappings');
  const rootIndex = argv.indexOf('--root');
  const rootDir = rootIndex >= 0 ? argv[rootIndex + 1] : process.cwd();

  // Repeatable, so a caller can check exactly the files it is about to feed a
  // generator rather than trusting that a scan of the repository covers them.
  const collect = (flag) => argv.reduce(
    (values, arg, index) => (arg === flag && argv[index + 1] ? [...values, argv[index + 1]] : values),
    [],
  );
  const epicFiles = collect('--epic-file');
  const statusFiles = collect('--status-file');

  runEpicIdGuard({
    rootDir,
    checkClickUpMappings: withClickUp,
    ...(epicFiles.length > 0 ? { epicFiles } : {}),
    ...(statusFiles.length > 0 ? { sprintStatusPaths: statusFiles } : {}),
  })
    .then((report) => {
      if (asJson) {
        console.log(JSON.stringify({
          ok: report.ok,
          epicFiles: report.epicFiles,
          trackingFiles: report.trackingFiles,
          epicDefinitions: report.epicDefinitions,
          storyDefinitions: report.storyDefinitions,
          trackingKeys: report.trackingKeys,
          findings: report.findings.map((finding) => ({ ...finding })),
        }, null, 2));
      } else if (report.ok) {
        console.log(
          `Epic/Story identifier guard: OK — ${report.epicDefinitions} epic and ${report.storyDefinitions} story definitions across ${report.epicFiles.length} files, ${report.trackingKeys} tracking keys across ${report.trackingFiles.length} files.`,
        );
      } else {
        console.error('Epic/Story identifier guard: FAIL');
        for (const finding of report.findings) console.error(`  ${finding}`);
      }
      if (!report.ok) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(`Epic/Story identifier guard failed to run: ${error.message}`);
      process.exitCode = 1;
    });
}
