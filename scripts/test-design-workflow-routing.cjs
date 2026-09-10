'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const TERMINAL_NEXT_STEP =
  'document generation is complete; no Create step remains; proceed with human review, then choose Validate, Edit, or a fresh Create';

const CREATE_STEPS = [
  'step-01-detect-mode',
  'step-02-load-context',
  'step-03-risk-and-testability',
  'step-04-coverage-plan',
  'step-05-generate-output',
];

const SYSTEM_VALIDATE_PATHS = [
  'test-design-architecture.md',
  'test-design-qa.md',
  'test-design/people-management-handoff.md',
];

const INDEXED_EPIC_RUN_KEYS = [
  'epic-user-management-0',
  'epic-user-management-1',
  'epic-user-management-2',
  'epic-user-management-3',
  'epic-user-management-4',
  'epic-user-management-5',
  'epic-user-management-7',
  'epic-mentorship-1',
  'epic-platform-capabilities-1',
];

function sha256File(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return null;
  }
  const frontmatter = {};
  const lines = match[1].split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) {
      continue;
    }
    const [, key, rawValue] = kv;
    if (rawValue === '' && lines[index + 1]?.trim().startsWith('- ')) {
      const items = [];
      index += 1;
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(lines[index].trim().slice(2).replace(/^'|'$/g, ''));
        index += 1;
      }
      frontmatter[key] = items;
      index -= 1;
      continue;
    }
    if (rawValue.startsWith('[')) {
      frontmatter[key] = rawValue
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/^'|'$/g, ''))
        .filter(Boolean);
      continue;
    }
    frontmatter[key] = rawValue.replace(/^'|'$/g, '');
  }
  return frontmatter;
}

function readContract(rootDir) {
  const contractPath = path.join(rootDir, 'docs/test-design-workflow-contract.md');
  const text = fs.readFileSync(contractPath, 'utf8');
  const normalized = text.replace(/\s+/g, ' ');
  const normalizedTerminal = TERMINAL_NEXT_STEP.replace(/\s+/g, ' ');
  return {
    contractPath,
    text,
    terminalNextStep: normalized.includes(normalizedTerminal) ? TERMINAL_NEXT_STEP : null,
    systemValidatePaths: SYSTEM_VALIDATE_PATHS.filter((relativePath) =>
      text.includes(relativePath),
    ),
  };
}

function readCheckpoint(rootDir, relativePath) {
  const absolutePath = path.join(rootDir, '_bmad-output/test-artifacts', relativePath);
  const text = fs.readFileSync(absolutePath, 'utf8');
  const frontmatter = parseFrontmatter(text);
  return { absolutePath, relativePath, text, frontmatter };
}

function isTerminalGeneratedCheckpoint(frontmatter) {
  if (!frontmatter) {
    return false;
  }
  const steps = frontmatter.stepsCompleted || [];
  return (
    frontmatter.workflowStatus === 'generated' &&
    frontmatter.lastStep === 'step-05-generate-output' &&
    frontmatter.nextStep === TERMINAL_NEXT_STEP &&
    CREATE_STEPS.every((step) => steps.includes(step)) &&
    steps.length === CREATE_STEPS.length
  );
}

function isMalformedGeneratedCheckpoint(frontmatter) {
  if (!frontmatter || frontmatter.workflowStatus !== 'generated') {
    return false;
  }
  return !isTerminalGeneratedCheckpoint(frontmatter);
}

function resolveEpicRunKey(domain, number) {
  if (!/^[a-z0-9-]+$/.test(domain)) {
    return { ok: false, reason: 'invalid-domain-token' };
  }
  if (!/^(0|[1-9]\d*)$/.test(String(number))) {
    return { ok: false, reason: 'invalid-number-token' };
  }
  return { ok: true, runKey: `epic-${domain}-${number}` };
}

function resolveAmbiguousEpicNumber() {
  return { ok: false, reason: 'ambiguous-bare-epic-number', write: false };
}

function resumeDecision(expectedRunKey, checkpoint) {
  const frontmatter = checkpoint.frontmatter;
  if (!frontmatter) {
    return { ok: false, reason: 'missing-frontmatter', write: false };
  }
  if (frontmatter.runKey !== expectedRunKey) {
    return { ok: false, reason: 'runkey-mismatch', write: false };
  }
  if (isTerminalGeneratedCheckpoint(frontmatter)) {
    return { ok: true, action: 'terminal-halt', write: false };
  }
  if (isMalformedGeneratedCheckpoint(frontmatter)) {
    return { ok: false, reason: 'malformed-generated-checkpoint', write: false };
  }
  if (frontmatter.workflowStatus === 'in-progress') {
    return { ok: true, action: 'continue-create', write: true };
  }
  return { ok: false, reason: 'unknown-progress-state', write: false };
}

function systemValidateWriteSet() {
  return {
    report: 'test-design-validation-report.md',
    index: 'test-design/README.md',
    evaluated: SYSTEM_VALIDATE_PATHS,
  };
}

function epicValidateWriteSet(domain, number) {
  return {
    report: `test-design-validation-report-epic-${domain}-${number}.md`,
    index: 'test-design/README.md',
    evaluated: [
      ...SYSTEM_VALIDATE_PATHS,
      `test-design-epic-${domain}-${number}.md`,
    ],
  };
}

function planCheckpointPair(rootDir, runKey) {
  const suffix = runKey.replace(/^epic-/, '');
  const plan = `test-design-epic-${suffix}.md`;
  const checkpointPath = `test-design-progress-epic-${suffix}.md`;
  const artifactsRoot = path.join(rootDir, '_bmad-output/test-artifacts');
  const planPath = path.join(artifactsRoot, plan);
  const checkpointAbsolutePath = path.join(artifactsRoot, checkpointPath);
  if (!fs.existsSync(planPath) || !fs.existsSync(checkpointAbsolutePath)) {
    return { ok: false, reason: 'missing-plan-or-checkpoint' };
  }
  const checkpoint = readCheckpoint(rootDir, checkpointPath);
  if (checkpoint.frontmatter?.runKey !== runKey) {
    return { ok: false, reason: 'checkpoint-runkey-mismatch' };
  }
  const planHash = sha256File(planPath);
  const recorded = checkpoint.text.match(
    new RegExp(`\\| \`[^\\n]*${plan}\` \\| \`([a-f0-9]{64})\``),
  );
  if (!recorded) {
    return { ok: false, reason: 'missing-recorded-plan-hash' };
  }
  if (recorded[1] !== planHash) {
    return { ok: false, reason: 'plan-hash-drift', expected: planHash, recorded: recorded[1] };
  }
  return { ok: true, plan, checkpoint: checkpointPath, planHash };
}

function auditRoutingContract(rootDir) {
  const findings = [];
  const contract = readContract(rootDir);

  if (!contract.terminalNextStep) {
    findings.push({ code: 'MISSING_TERMINAL_NEXT_STEP' });
  }

  const systemCheckpoint = readCheckpoint(rootDir, 'test-design-progress-system.md');
  if (!isTerminalGeneratedCheckpoint(systemCheckpoint.frontmatter)) {
    findings.push({ code: 'SYSTEM_CHECKPOINT_NOT_TERMINAL' });
  }

  for (const runKey of INDEXED_EPIC_RUN_KEYS) {
    const pair = planCheckpointPair(rootDir, runKey);
    if (!pair.ok) {
      findings.push({ code: 'PLAN_CHECKPOINT_PAIR', runKey, reason: pair.reason });
    }
  }

  return { ok: findings.length === 0, findings, contract };
}

module.exports = {
  TERMINAL_NEXT_STEP,
  CREATE_STEPS,
  SYSTEM_VALIDATE_PATHS,
  INDEXED_EPIC_RUN_KEYS,
  sha256File,
  parseFrontmatter,
  readContract,
  readCheckpoint,
  isTerminalGeneratedCheckpoint,
  isMalformedGeneratedCheckpoint,
  resolveEpicRunKey,
  resolveAmbiguousEpicNumber,
  resumeDecision,
  systemValidateWriteSet,
  epicValidateWriteSet,
  planCheckpointPair,
  auditRoutingContract,
};
