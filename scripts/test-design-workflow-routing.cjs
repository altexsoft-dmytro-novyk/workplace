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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function epicValidationReports(rootDir) {
  const artifactsRoot = path.join(rootDir, '_bmad-output/test-artifacts');
  return fs
    .readdirSync(artifactsRoot)
    .filter((name) => /^test-design-validation-report-epic-[a-z0-9-]+\.md$/.test(name))
    .sort()
    .map((name) => {
      const text = fs.readFileSync(path.join(artifactsRoot, name), 'utf8');
      return { name, text, frontmatter: parseFrontmatter(text) };
    });
}

function auditValidationIndex(rootDir) {
  const findings = [];
  const artifactsRoot = path.join(rootDir, '_bmad-output/test-artifacts');
  const indexPath = path.join(
    rootDir,
    '_bmad-output/test-artifacts/test-design/README.md',
  );
  const indexText = fs.readFileSync(indexPath, 'utf8');

  for (const report of epicValidationReports(rootDir)) {
    const metadata = report.frontmatter || {};
    const verdict = metadata.verdict;
    const validationDate = metadata.validationDate || metadata.date;
    const expectedSuffix = report.name
      .replace(/^test-design-validation-report-epic-/, '')
      .replace(/\.md$/, '');
    const expectedRunKey = `epic-${expectedSuffix}`;

    if (metadata.runKey !== expectedRunKey) {
      findings.push({
        code: 'VALIDATION_REPORT_RUNKEY_MISMATCH',
        report: report.name,
        expected: expectedRunKey,
        actual: metadata.runKey || null,
      });
      continue;
    }
    if (!verdict || !validationDate) {
      findings.push({
        code: 'VALIDATION_REPORT_METADATA_MISSING',
        report: report.name,
      });
      continue;
    }

    const indexRows = indexText
      .split(/\r?\n/)
      .filter((line) => line.startsWith('|') && line.includes(report.name));
    if (indexRows.length === 0) {
      findings.push({ code: 'VALIDATION_REPORT_NOT_INDEXED', report: report.name });
      continue;
    }
    if (indexRows.length > 1) {
      findings.push({
        code: 'VALIDATION_REPORT_INDEXED_MULTIPLE_TIMES',
        report: report.name,
        count: indexRows.length,
      });
      continue;
    }
    const [indexRow] = indexRows;

    const verdictPattern = new RegExp(
      `Validation\\s+\\*\\*${escapeRegExp(verdict)}\\s+\\(${escapeRegExp(validationDate)}(?:[^)]*)\\)\\*\\*`,
      'i',
    );
    if (!verdictPattern.test(indexRow)) {
      findings.push({
        code: 'VALIDATION_INDEX_VERDICT_DRIFT',
        report: report.name,
        verdict,
        validationDate,
      });
    }

    for (const artifactName of [
      `test-design-epic-${expectedSuffix}.md`,
      `test-design-progress-epic-${expectedSuffix}.md`,
    ]) {
      const artifactPath = path.join(artifactsRoot, artifactName);
      if (!fs.existsSync(artifactPath)) {
        findings.push({
          code: 'VALIDATED_ARTIFACT_MISSING',
          report: report.name,
          artifact: artifactName,
        });
        continue;
      }

      const artifactText = fs.readFileSync(artifactPath, 'utf8');
      const artifactMetadata = parseFrontmatter(artifactText) || {};
      const artifactVerdict = artifactMetadata.validationStatus || artifactMetadata.validation;
      const artifactDate = artifactMetadata.validationDate || artifactMetadata.validatedAt;
      const artifactReport = artifactMetadata.validationReport;
      if (
        artifactVerdict !== verdict ||
        artifactDate !== validationDate ||
        path.basename(artifactReport || '') !== report.name
      ) {
        findings.push({
          code: 'VALIDATION_ARTIFACT_PROJECTION_DRIFT',
          report: report.name,
          artifact: artifactName,
          expected: { verdict, validationDate, validationReport: report.name },
          actual: {
            verdict: artifactVerdict || null,
            validationDate: artifactDate || null,
            validationReport: artifactReport || null,
          },
        });
      }

      const escapedReportName = escapeRegExp(report.name);
      const directAbsenceClaim = new RegExp(
        `${escapedReportName}[^.\\n]{0,80}does not exist`,
        'i',
      );
      const genericAbsenceClaim = /no epic validation\s*>?\s*report exists for this epic/i;
      if (directAbsenceClaim.test(artifactText) || genericAbsenceClaim.test(artifactText)) {
        findings.push({
          code: 'STALE_VALIDATION_REPORT_ABSENCE_CLAIM',
          report: report.name,
          artifact: artifactName,
        });
      }
    }
  }

  return { ok: findings.length === 0, findings };
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

  findings.push(...auditValidationIndex(rootDir).findings);

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
  epicValidationReports,
  auditValidationIndex,
  planCheckpointPair,
  auditRoutingContract,
};
