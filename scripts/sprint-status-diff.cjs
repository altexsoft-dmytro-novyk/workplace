'use strict';

// Compare a candidate sprint-status.yaml against the file it would replace.
//
// The generator's own `dropped_orphans` is not a sufficient basis for deciding
// whether a write is safe. With `--fresh` it is empty while every status is
// recomputed from scratch: measured on a copy of the real user-management file,
// a `--fresh` regenerate reported no dropped orphans and still downgraded 21
// entries (five epics and thirteen stories from `done`, `epic-0`/`epic-6` from
// in-progress) and dropped seven more, including 6.1's `review`.
//
// So the wrapper runs the generator against a COPY and hands both files here.
// This compares what the run would actually produce, whatever combination of
// --fresh, --set and story-file detection produced it.
//
// A status change is acknowledged only when the caller asked for exactly that
// change on the command line (`--set key=status`). Everything else — a lost
// key, an unrequested status change — is an unacknowledged migration.

const fs = require('node:fs');
const { readTrackingStatuses } = require('./epic-id-guard.cjs');

function parseSetPairs(values) {
  const pairs = new Map();
  for (const value of values) {
    const index = String(value).indexOf('=');
    if (index <= 0) continue;
    pairs.set(String(value).slice(0, index), String(value).slice(index + 1));
  }
  return pairs;
}

// `beforeContent` is null when the status file does not exist yet — a first
// generation has nothing to protect. It is NOT null for an unreadable file:
// that throws, because a format this cannot parse must stop the write rather
// than compare as an empty document and report that nothing would be lost.
function compareTrackingStatuses(beforeContent, afterContent, setPairs = new Map()) {
  const before = beforeContent === null
    ? new Map()
    : readTrackingStatuses(beforeContent, 'the current sprint-status file');
  const after = readTrackingStatuses(afterContent, 'the candidate sprint-status file');

  const dropped = [];
  const changed = [];
  const acknowledged = [];
  const added = [];

  for (const [key, status] of before) {
    if (!after.has(key)) {
      dropped.push({ key, status });
      continue;
    }
    const next = after.get(key);
    if (next === status) continue;
    // `--set key=status` is the caller stating the new value explicitly. That,
    // and only that, makes a status change a requested migration.
    if (setPairs.get(key) === next) acknowledged.push({ key, from: status, to: next });
    else changed.push({ key, from: status, to: next });
  }

  for (const [key, status] of after) {
    if (!before.has(key)) added.push({ key, status });
  }

  return { dropped, changed, acknowledged, added };
}

function formatReport(result) {
  const lines = [];
  if (result.dropped.length > 0) {
    lines.push(`${result.dropped.length} tracking ${result.dropped.length === 1 ? 'entry would be dropped' : 'entries would be dropped'}:`);
    for (const { key, status } of result.dropped) lines.push(`  - ${key} (${status})`);
  }
  if (result.changed.length > 0) {
    lines.push(`${result.changed.length} status ${result.changed.length === 1 ? 'change was' : 'changes were'} not requested with --set:`);
    for (const { key, from, to } of result.changed) lines.push(`  - ${key}: ${from} -> ${to}`);
  }
  return lines;
}

module.exports = { compareTrackingStatuses, formatReport, parseSetPairs };

if (require.main === module) {
  const argv = process.argv.slice(2);
  const valueOf = (flag) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : null;
  };
  const collect = (flag) => argv.reduce(
    (values, arg, index) => (arg === flag && argv[index + 1] ? [...values, argv[index + 1]] : values),
    [],
  );

  const beforePath = valueOf('--before');
  const afterPath = valueOf('--after');
  if (!beforePath || !afterPath) {
    console.error('usage: sprint-status-diff.cjs --before <file> --after <file> [--set key=status ...]');
    process.exitCode = 2;
  } else {
    // A status file that does not exist yet has nothing to protect. One that
    // exists but cannot be read is a failure, not an empty document.
    const beforeContent = fs.existsSync(beforePath) ? fs.readFileSync(beforePath, 'utf8') : null;
    if (!fs.existsSync(afterPath)) {
      console.error(`the generator produced no candidate at ${afterPath}`);
      process.exitCode = 1;
    } else {
      const afterContent = fs.readFileSync(afterPath, 'utf8');
      let result;
      try {
        result = compareTrackingStatuses(beforeContent, afterContent, parseSetPairs(collect('--set')));
      } catch (error) {
        console.error(`${error.message}.`);
        console.error('Refusing to decide whether a write is safe from a file this cannot read.');
        process.exitCode = 1;
      }

      if (result) {
        if (argv.includes('--json')) {
          console.log(JSON.stringify(result, null, 2));
        }

        const problems = formatReport(result);
        if (problems.length > 0) {
          if (!argv.includes('--json')) for (const line of problems) console.error(line);
          process.exitCode = 1;
        }
      }
    }
  }
}
