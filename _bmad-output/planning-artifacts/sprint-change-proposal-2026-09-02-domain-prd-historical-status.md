---
title: Sprint Change Proposal — Domain PRD Historical Status
status: approved-and-applied
date: 2026-09-02
mode: incremental
scope: minor
change_type: documentation-only
amends: sprint-change-proposal-2026-09-02-people-management-rebaseline.md
approved_by: User
approved_on: 2026-09-02
---

# Sprint Change Proposal: Domain PRD Historical Status

## 1. Issue Summary

The approved People Management re-baseline preserves the former User Management and Mentorship PRDs as historical records, but both files still declare `status: draft`. That metadata can cause readers and agents to treat them as active competing PRDs.

## 2. Impact Analysis

- Product scope and application behavior do not change.
- The canonical People Management PRD and both canonical domain specs remain authoritative.
- No epic, story, sprint status, architecture, code, or test changes are required.
- Historical PRD bodies remain unchanged.

## 3. Recommended Approach

Apply a direct metadata clarification:

- Change each former bounded-context PRD from `draft` to `historical`.
- Add `superseded_by` pointing to its canonical domain spec.
- Add a historical-record banner prohibiting use for new requirements or dispatch.
- Append the disposition to each existing memlog without rewriting prior entries.

Rollback and MVP review are not applicable.

## 4. Detailed Change Proposal

### User Management PRD

**OLD**

```yaml
status: draft
```

**NEW**

```yaml
status: historical
superseded_by: _bmad-output/specs/spec-user-management-domain/SPEC.md
```

Add a banner stating that the document is retained for historical traceability and that new requirements and dispatch use the canonical product PRD and User Management domain spec.

### Mentorship PRD

**OLD**

```yaml
status: draft
```

**NEW**

```yaml
status: historical
superseded_by: _bmad-output/specs/spec-mentorship-domain/SPEC.md
```

Add the equivalent historical-record banner.

### Memlogs

Append one disposition entry to each PRD memlog. Existing entries remain unchanged.

## 5. Handoff

Scope is **Minor** and documentation-only.

Success criteria:

- Both former domain PRDs declare `status: historical`.
- Each points to the correct canonical domain spec.
- Historical bodies and prior memlog entries are preserved.
- No application, epic, story, sprint-status, architecture, or test artifact changes.

## 6. Checklist

| Item | Status | Result |
|---|---|---|
| Trigger and evidence | Done | Historical intent conflicts with `draft` metadata |
| Epic/story impact | N/A | No delivery structure changes |
| PRD impact | Done | Metadata, banner, append-only memlog only |
| Architecture/UX impact | N/A | None |
| Direct adjustment | Viable | Low effort and low risk |
| Rollback/MVP review | N/A | No behavior or scope change |
| Incremental review | Done | User approved the individual proposal |
| Final approval | Done | User approved implementation on 2026-09-02 |
| Sprint-status update | N/A | No epic/story changes |

## 7. Execution Record

- Both former bounded-context PRDs now declare `status: historical`.
- Each PRD points to its canonical domain spec and carries a historical-use banner.
- Each existing memlog received one append-only disposition entry.
- No application, epic, story, sprint-status, architecture, or test artifact was changed.
