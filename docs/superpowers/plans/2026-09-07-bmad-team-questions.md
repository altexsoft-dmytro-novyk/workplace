# BMAD Team Questions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This document describes future implementation; execution has not started.

**Goal:** Automatically route clear BMAD questions to the four team members and resume planning without losing state when answers arrive hours or days later.

**Architecture:** The MVP uses a separate Node.js CLI over the ClickUp REST API, checkpoints alongside BMAD artifacts, and standard Teams notifications. The coordinator explicitly starts response collection and resumption. A background worker, personal Teams cards, and automatic model invocation are separate follow-up phases.

**Tech Stack:** Existing Node.js 20/CJS, native fetch, node:test, and js-yaml; BMAD 6.11.0 overrides and memlog. No new dependencies are required for the MVP.

**Spec:** [Architecture and process rules](../specs/2026-09-07-bmad-team-questions-design.md).

## Global Constraints

- The only participants are Anna (QA), Dima (architect and developer), Tamar (developer), and Carlos (BA).
- Each question has one accountable owner for routing and reminders. Any of the four team members may record a response or an agreed team decision; the author need not be the assignee. Submission does not automatically reassign ownership or approve a decision.
- Never invent email addresses, ClickUp IDs, or Teams IDs; verify actual values before the first delivery.
- Support ClickUp Free without Custom Fields, internal Automations, or mandatory paid add-ons.
- All generated team-facing content must be in English: question titles and descriptions, ClickUp task descriptions and integration comments, Teams notifications/cards, reminders, status and decision summaries, resume packets, templates, examples, and operational documentation. This applies even when the initiator chats in another language.
- Questions must be self-contained and understandable without opening links; technical IDs supplement the explanation.
- Preserve original human responses and source quotations verbatim; clearly label any English translation or summary. Do not translate identifiers or file paths.
- No active LLM waiting. No response never means approval.
- The new CLI must not invoke existing `create:clickup`/`sync:clickup` commands or modify `clickup-sync.yaml` or their production CI.
- Do not edit installed `.agents/skills/bmad-*` or `.claude/skills/bmad-*` files; use supported overrides and a custom runbook.
- Read secrets from the environment; no tokens in git, checkpoints, or logs.
- The MVP has one write coordinator per run. Background multi-user execution requires transactional storage.

---

## 1. MVP outcome

Carlos starts the PRD workflow. The agent encounters an unresolved technical decision and creates a ClickUp question for Dima; Anna receives QA questions; Tamar receives implementation questions about stories she owns. The agent saves its next action and ends the session. Three days later, Carlos requests “Check responses and continue.” The agent imports responses, checks their sufficiency and relevance, updates documents, and continues only the unblocked work.

Comments, status changes, and repeated runs must not create duplicate tasks or apply the same decision twice. Restarting the computer must not lose the checkpoint. Working from another computer requires transferring the checkpoint with the documents.

## 2. Implementation responsibilities

This is a proposed allocation of work, not tasks already assigned in ClickUp.

| Work | Implementer | Reviewer |
|---|---|---|
| Question format, routing, business authority boundaries | Carlos | Anna, Dima |
| Checkpoint contracts, duplicate prevention, recovery | Dima | Tamar |
| New ClickUp adapter, CLI, Teams onboarding | Tamar | Dima |
| BMAD overrides, runbook, pilot setup | Dima + Carlos | Anna |
| Negative scenarios, acceptance, delayed-response verification | Anna | Carlos for content |

Do not assume “Dima handles backend and Tamar handles frontend”; the user did not specify this allocation. Determine each story owner from an existing assignment or have Dima assign the work.

## 3. Planned file map

All paths below are relative to the `workplace` root. These are planned files unless explicitly marked as existing.

| File | Responsibility |
|---|---|
| `config/team-questions.yaml` | Four-person registry, routing, ClickUp list, calendar, deadline policy, explicit English output-language setting |
| `docs/team-questions-policy.md` | Self-contained English questions, authority, states, pause and response rules |
| `docs/team-questions-runbook.md` | Natural-language commands, CLI, crash recovery, Teams setup |
| `docs/templates/team-question.md` | Standard English question description template |
| `scripts/team-questions.cjs` | CLI: validate, prepare, send, collect, resume, applied |
| `scripts/team-questions/model.cjs` | Data validation, routing, allowed state transitions |
| `scripts/team-questions/store.cjs` | Atomic checkpoint, lock, delivery intent, application receipt |
| `scripts/team-questions/render.cjs` | English question descriptions and routing reports |
| `scripts/team-questions/clickup.cjs` | REST adapter, pagination, authorship, deduplication, retry |
| `scripts/team-questions/resume.cjs` | Resume packet generation, hash checks, dependency checks |
| `test/team-questions-*.test.cjs` | Separate tests for the new integration with fake fetch and clock |
| `test/fixtures/team-questions.cjs` | Synthetic questions, comments, and configuration without live recipients |
| `_bmad/custom/bmad-agent-{analyst,pm,architect,dev}.toml` | Communication style and rules for the corresponding agents; one file per agent |
| `_bmad/custom/bmad-{prd,architecture,create-epics-and-stories}.toml` | Rules for direct invocation of these workflows; one file per workflow |
| `_bmad-output/planning-artifacts/team-questions/<run-id>/checkpoint.json` | Persistent state for a specific run |
| `_bmad-output/planning-artifacts/team-questions/<run-id>/resume.md` | Readable English resume packet generated by the CLI |
| `package.json` (existing) | Add only the new npm scripts |
| `AGENTS.md` (existing) | Short rule outside the managed bmad:context block |

## Task 1: Verify access and establish routing

**Implementers:** Carlos + Tamar. **Dependencies:** none. **Deliverable:** validated configuration without external messages.

**Files:** `config/team-questions.yaml`, `scripts/team-questions/model.cjs`, `test/team-questions-routing.test.cjs`, `test/fixtures/team-questions.cjs`.

**Interfaces:** `validateConfig(config) -> config`; `routeQuestion({category, storyOwner}, config) -> {owner, reason, needsAssignment}`. Allowed categories: business, architecture, qa, implementation, unknown; owners: anna, dima, tamar, carlos. Set `output_language: en` in the configuration and require it in `validateConfig`.

- [ ] Verify the four actual ClickUp accounts and an available questions list. Carlos verifies names; Tamar verifies IDs through read-only API calls. Do not publish questions during verification.
- [ ] Check whether the existing accounts can enable the standard Teams integration and access a shared public channel. If none of the four has the required permissions, record the specific dependency; do not invent a fifth participant or mark Teams complete.
- [ ] Store only confirmed IDs in configuration. Until they are supplied, `validate` fails and `send` performs no write requests. Validate `output_language: en` independently of the initiator's chat language.
- [ ] Write routing tests: business→Carlos, architecture→Dima, qa→Anna, implementation with storyOwner Tamar→Tamar, implementation without an owner→Dima with needsAssignment=true, unknown→Carlos with needsAssignment=true. Reject unknown participants.
- [ ] Implement routing according to the spec table. Dima's two roles map to one account, not two recipients.
- [ ] Run `node --test test/team-questions-routing.test.cjs`; all listed scenarios must pass.

Example of a self-contained unit test without real users or API access:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { routeQuestion } = require('../scripts/team-questions/model.cjs');
test('route an implementation question about Tamar\'s story to Tamar', () => {
  const config = { participants: {
    anna: { roles: ['qa'] }, dima: { roles: ['architect', 'developer'] },
    tamar: { roles: ['developer'] }, carlos: { roles: ['ba'] }
  } };
  assert.deepEqual(routeQuestion({ category: 'implementation', storyOwner: 'tamar' }, config),
    { owner: 'tamar', reason: 'story_owner', needsAssignment: false });
});
```

## Task 2: Introduce clear English questions

**Owner:** Carlos; technical implementation by Tamar. **Reviewer:** Anna. **Dependencies:** Task 1.

**Files:** `docs/team-questions-policy.md`, `docs/templates/team-question.md`, `scripts/team-questions/render.cjs`, `test/team-questions-render.test.cjs`.

**Interfaces:** `validateQuestion(question) -> question` in model; `renderQuestion(question, config) -> string` in render. Question fields: key, revision, title, context, decisionNeeded, category, owner, dueAt, blockedWork[], sources[{title,path,section,sha256}], options[{label,consequence}], recommendation (optional).

- [ ] Write 8 reference questions in English: one each for BA/architecture/QA, one each for Dima and Tamar as developers, an unknown owner, a mixed topic, and a question outside the team's authority.
- [ ] Check each question for self-contained context, one decision, an owner, and consequences. Do not present unverified section names as actual sources. All generated prose and option descriptions must be English.
- [ ] Structural tests reject empty context/decisionNeeded, unknown owners, invalid dueAt, and an ID-only source without a title; allow an ID accompanied by an explanation.
- [ ] Implement the English template: question → context → decision needed → consequences → owner/deadline → sources → administrative marker. Do not require response prefixes, IDs, or a special response format.
- [ ] Add fixtures with a non-English initiating message and verify that generated template labels and expected question descriptions remain English. Preserve original human response text separately from a labeled English translation/summary. Do not treat a character-set check as proof that prose is English or understandable.
- [ ] Run `node --test test/team-questions-render.test.cjs`; Anna separately reads all 8 rendered examples for plain English and clarity. Automated tests verify structure; Anna verifies comprehension that a regex cannot guarantee.

## Task 3: Implement checkpoints and safe run termination

**Owner:** Dima. **Reviewer:** Tamar. **Dependencies:** Tasks 1–2.

**Files:** `scripts/team-questions/store.cjs`, additions to `model.cjs`, `test/team-questions-store.test.cjs`.

**Interfaces:** `loadCheckpoint(runDir) -> Promise<Checkpoint>`; `updateCheckpoint(runDir, expectedRevision, transform) -> Promise<Checkpoint>`; `transition(question, event) -> question`. Checkpoint fields: schemaVersion=1, revision, runId, coordinator, workflow, docWorkspace, bmadVersion, nextAction, sourceHashes, questions[], decisions[], deliveryIntents[], applicationReceipts[].

- [ ] Write atomic-write failure tests: failure before rename leaves the previous valid JSON; reject concurrent revision changes; never replace a corrupted checkpoint with an empty one.
- [ ] Implement a short exclusive lock using `fs.open(lockPath, 'wx')`, temporary-file write, flush, and rename. After a crash, do not remove a lock based solely on its age: the runbook requires verification that the previous process has stopped. Hold the lock only around local mutations, not HTTP calls or human waiting.
- [ ] Implement the spec's states. Reject `applied` without the response author, current revision, and application receipt. An unknown schemaVersion must produce an explicit migration error rather than a best-effort rewrite.
- [ ] Persist sources and nextAction before ending the session. Do not mark the PRD final while a phase blocker remains unresolved.
- [ ] Run `node --test test/team-questions-store.test.cjs`; simulate a new process using the same runDir and verify full recovery.

## Task 4: Create ClickUp questions without Custom Fields

**Owner:** Tamar. **Reviewer:** Dima. **Dependencies:** Tasks 1–3.

**Files:** `scripts/team-questions/clickup.cjs`, `scripts/team-questions.cjs`, `test/team-questions-send.test.cjs`, npm scripts in `package.json`.

**Interfaces:** `sendQuestions({runDir, config, fetchImpl, token, dryRun}) -> Promise<{created, existing, uncertain, failed}>`. POST `/api/v2/list/{list_id}/task` uses name, markdown_description, assignees, and due_date; omit custom_fields. Do not invoke the existing story sender.

- [ ] Using fake fetch, write tests for the wrong workspace/list, unknown assignee, dry-run, repeated send, timeout after sending POST, a marker on the second list page, 429, and a missing token. Match fixture HTTP payloads to current ClickUp API documentation before implementation.
- [ ] Validate workspace/list and member mapping before the first write; do not log credentials. Dry-run permits GET and prohibits POST/PUT/DELETE.
- [ ] Persist delivery intent before POST and the returned task ID after success. On rerun, locate questions by task ID or marker, not title. Reconcile uncertain POST outcomes first; unresolved uncertainty returns uncertain without another POST.
- [ ] Add `npm run questions -- <command>` as an alias for `node scripts/team-questions.cjs`; `npm run test:questions` explicitly lists the six test files from Tasks 1–6. Use request timeouts, at most 3 retries of safe GET requests with backoff, stop the current operation on 401/403, and respect 429 reset without invoking the model.
- [ ] Verify that name, markdown_description, and any generated integration comment use the English renderer. Do not translate or modify technical markers.
- [ ] Run `node --test test/team-questions-send.test.cjs`; prove that the mock log contains no `/field/` requests and no custom_fields in request bodies.

Proposed CLI contract (these commands do not exist yet):

```text
npm run questions -- validate
npm run questions -- prepare --run <run-id> --input <question-batch.json>
npm run questions -- send --run <run-id> --dry-run
npm run questions -- send --run <run-id>
npm run questions -- collect --run <run-id>
npm run questions -- resume --run <run-id>
npm run questions -- applied --run <run-id> --receipt <application-receipt.json>
```

Run IDs and filenames are CLI arguments populated by the integration; people communicate in natural language. `prepare` validates a batch and saves drafts, `send` publishes, `collect` reads responses and updates the checkpoint, `resume` generates a packet without writing requirements, and `applied` verifies a receipt after actual application.

## Task 5: Collect responses and determine readiness

**Owner:** Tamar. **Reviewer:** Anna. **Dependencies:** Task 4.

**Files:** additions to `clickup.cjs`, `model.cjs`, and `scripts/team-questions.cjs`; `test/team-questions-collect.test.cjs`.

**Interfaces:** `collectResponses({runDir, config, fetchImpl, token}) -> Promise<{newResponses, changedResponses, needsClarification}>`. Read GET `/api/v2/task/{task_id}/comment` with pagination until known comments are reached; preserve a new version when text changes. Fully reconcile the comments of any question whose decision is about to be applied. Response provenance fields: submittedBy (verified comment author), reportedAgreedBy (team members reported to have agreed), responseBasis (direct, team_discussion, delegated), acceptedBy (coordinator accepting the decision), acceptanceNote (reason/basis for acceptance). Meeting date/notes URL are optional; do not require a transcript. Leave reported agreement unconfirmed until reviewed, and do not infer agreement from attendance.

- [ ] Write tests for an owner's response, a consultant's comment, two different owner comments, “thank you” only, a closed task without an answer, repeated import, multiple comment pages, an edited/deleted accepted response, and a response after superseded. Add a response recorded by Carlos after a call about Dima's question, a delegated response from Tamar, an unconfirmed claim of team agreement, conflicting responses, and a comment from outside the four-person roster.
- [ ] Store comment ID, author ID, timestamps, and text hash. Another participant's comment is information, not automatic permission. Do not infer sufficiency from response length or task status. Add a test proving that comment text is not executed as shell, cannot change routing, and enters the resume packet as quoted input.
- [ ] `collect` records a new comment from any registered team member as response_received for an open question; owner mismatch alone must not discard it. In the existing BMAD review step, the coordinator sees the original, proposed English summary, author, and claimed decision basis. Explicit acceptance of a sufficient, current response with an established decision basis moves it to ready_to_apply. Accept a confirmed team-call outcome without requiring the assignee to repeat it. The coordinator may accept several decisions from the call together; this does not grant authority to make unagreed decisions for another domain. “I don't know,” a follow-up question, or an unclear claim of agreement leads to needs_clarification. Request owner clarification only when needed; do not require meeting recordings or extra confirmation for an already established agreement.
- [ ] Keep submittedBy distinct from reportedAgreedBy and acceptedBy; never replace Carlos's author identity with Dima's. Leave routing/reminders assigned to the original owner. Conflicting answers require reconciliation rather than last-comment-wins. Clarifying who agreed does not increment the question revision unless the question itself changes.
- [ ] An edited/deleted response before application invalidates ready_to_apply; after application, it raises a decision-review signal rather than automatically reverting documents.
- [ ] Generate English summaries such as “Response received from Dima: ...” and “Awaiting Anna's response: ...”. In the MVP, show reminders to the coordinator during collect without promising scheduled delivery.
- [ ] Preserve a non-English human response exactly in its source field; render any generated English translation separately and label it as a translation. Never replace the audit source with translated text.
- [ ] Run `node --test test/team-questions-collect.test.cjs`.

## Task 6: Resume BMAD and connect overrides

**Owners:** Dima + Carlos. **Reviewer:** Anna. **Dependencies:** Tasks 3–5.

**Files:** `scripts/team-questions/resume.cjs`, `test/team-questions-resume.test.cjs`, overrides from the file map, `docs/team-questions-runbook.md`, a short addition to the existing `AGENTS.md`.

**Interfaces:** `buildResumePacket(checkpoint, currentSourceHashes) -> {status, markdown, applicableDecisionKeys, blockedWork}`; status: ready, partial, waiting, review_required. `verifyApplicationReceipt(checkpoint, receipt, actualHashes) -> receipt`. Receipt fields: decision key, revision, comment ID/hash, submittedBy, reportedAgreedBy, responseBasis, acceptedBy, acceptanceNote, document path, before/after hashes, audit marker, appliedAt. Resume packets distinguish who recorded an outcome from who reportedly agreed and who accepted it for application.

- [ ] Write tests for resumption after 1 hour/3 days/40 days using a fake clock, process termination, partial responses, changed documents, a crash between the document write and receipt, and repeated application of the same revision.
- [ ] Generate resume.md in English: run goal, current documents, accepted decisions with authorship, original responses, open questions, blockers, and next action. Clearly separate verbatim source responses from English summaries. Full chat history must not be a dependency.
- [ ] Resume the PRD in its existing document workspace using the installed workflow. Apply the spec's applying/receipt protocol around the change. Append the PRD journal using `_bmad/scripts/memlog.py`; pass other workflows their own context rather than forcing a PRD memlog onto them.
- [ ] Add policy references through persistent_facts and an activation-time checkpoint check in supported overrides. Preserve existing overrides. Direct workflow invocations need workflow-level rules as well as agent-level rules.
- [ ] Replace the dev agent's communication_style with: “Explain the substance, context, and decision needed in plain English. Name requirements and sections in words. Add paths and IDs after the explanation for traceability. A question must be understandable without opening its sources.”
- [ ] Add an explicit policy instruction to every affected agent/workflow: “Write all generated team-facing questions, task descriptions, integration comments, notifications, reminders, decision summaries, and resume documentation in English, regardless of the initiator's chat language. Preserve original responses and quoted sources verbatim; label English translations separately.” Do not rely on communication_style alone or assume a global document-output setting controls every message.
- [ ] Resolve each changed skill's override through `_bmad/scripts/resolve_customization.py --skill <installed-skill-path> --key <agent-or-workflow>`; verify the fields exist and the rules are present. Check `.agents`, `.claude`, and the actual Cursor installation separately. Do not edit shipped files.
- [ ] Document the English requests “Send questions to their owners,” “Check responses and continue,” and “Show blocked work” in the runbook. The agent maps these requests to CLI steps; these are not new built-in BMAD commands. Other-language initiating requests may be understood, but generated team-facing output remains English.
- [ ] Run `node --test test/team-questions-resume.test.cjs`; perform manual transcript checks for invocation through an agent and direct bmad-prd invocation, including a non-English initiating request. Verify English descriptions and summaries in both paths and no dependent final decision before a sufficient response.

## Task 7: Pilot, acceptance, and operating instructions

**Owner:** Anna. **Participants:** Carlos, Dima, Tamar. **Dependencies:** Tasks 1–6.

**Files:** `docs/team-questions-runbook.md`, `docs/team-questions-pilot-report.md`.

- [ ] Run `npm run test:questions` and the existing `npm run test:clickup`. Root npm test is a stub and is not evidence of correctness. Backend/frontend checks are unnecessary for this integration-only change.
- [ ] Run a dry-run on a separate pilot list and capture a GET-only log. The new CLI does not use story keys `1-99-*` or the old `9-9-clickup-sync-smoke-test`; its `BMAD-Q` namespace must not collide with story sync.
- [ ] Once the integration run is authorized, send 5 meaningful English pilot questions: Carlos, Anna, Dima as architect, Dima as developer, and Tamar as developer. Label proposed deadlines as pilot deadlines.
- [ ] Verify ClickUp assignee notifications and Teams activity notifications in the real channel. Record “assigned,” “sent to channel,” and “response received” separately; channel delivery is not a personal DM. Verify generated English content separately from service-owned UI labels.
- [ ] Close the session/CLI. One participant responds after a restart; another responds on the next business day. Test longer 3/40-day intervals with a fake clock rather than keeping tests open for weeks.
- [ ] In one pilot case, assign the question to Dima but have Carlos record the outcome of a discussion with Dima and Tamar. Verify that the response is imported, the coordinator can accept the established agreement without Dima posting again, ownership remains Dima, and provenance records the different roles accurately. Also verify that an unclear or disputed agreement remains unresolved.
- [ ] Repeat send, collect, and resume: no duplicate task and no decision applied twice.
- [ ] Carlos and Anna review all five questions for plain English and comprehension without following links. Check task descriptions, generated comments, notifications, reminders, and resume summaries as well. Dima verifies source hashes and accepted-decision records.
- [ ] Document each acceptance result, actual API counts, Teams limitations, and the recovery procedure in English. If existing ClickUp scripts nevertheless require changes, separately execute `docs/clickup-merge-gate.md`, accounting for its outdated example paths; do not run the live gate automatically as part of unit tests.

## 4. MVP acceptance criteria

| Criterion | Evidence |
|---|---|
| Exactly 4 real people; Dima has two roles | Routing tests and verified account mapping |
| Questions are understandable without IDs or links | Anna and Carlos accept 8 examples and 5 pilot questions |
| All generated descriptions and team-facing output are English | Renderer fixtures plus agent/direct-workflow transcript checks, including a non-English initiating request |
| Original responses are preserved | Import and resume tests distinguish original text from labeled translations |
| No Custom Field writes or ClickUp Automations | Fake HTTP log and list configuration |
| The agent is inactive while waiting | Session is closed; collect/resume works in a new session |
| Recovery does not depend on chat history | A new process restores nextAction from the checkpoint and documents |
| Any team member can record an agreed answer | A non-assignee's response is imported; confirmed team-call outcomes need no duplicate owner reply |
| Authorship is separate from decision acceptance | Provenance and acceptance checks; neither owner identity nor a claim of agreement automatically unblocks work |
| An uncertain POST does not create a duplicate | Timeout/reconciliation test |
| A changed document/response is not silently applied | review_required in the corresponding tests |
| Teams actually works in the tenant | Pilot report, not documentation alone |
| Existing story sync is preserved | Existing ClickUp tests pass; old scripts/config/CI have no diff |

The MVP does not guarantee scheduled reminders, personal Teams DMs, or automatic BMAD invocation after a response. Implement those capabilities in the phases below rather than simulating them with a long-running session.

## 5. Follow-up phase: background collection and execution

**Owners:** Dima — architecture and runner; Tamar — worker; Anna — verification; Carlos — response-sufficiency rules.

1. Select an existing continuously available team host. If none is available, retain manual resumption rather than describing a laptop as a persistent service.
2. Move state/outbox into a shared transactional database; retain local JSON as an export. Add run leases with fencing, backup/restore, and queue deduplication. Do not use multiple git checkouts as a shared database.
3. Poll REST every 30 minutes during business hours for open questions, with a 30 requests/minute budget, pagination, and 429 backoff. Estimate: 10 open questions × 18 checks during a 9-hour day = 180 baseline GET requests/day, excluding pagination and additional checks. These are neither LLM calls nor official MCP calls.
4. Add deadline-based English reminders, at most one reminder of each type per revision. Escalate conflicts or missing authority to the coordinator from the four-person roster.
5. Initially, the worker reports “Responses are available; planning can continue.” Then separately verify the specific agent CLI runner: fresh session, clean checkout, resume packet input, status/result, timeout, credentials, and limits on cycles and retries. Permit automatic application only for responses that have already passed the defined acceptance step; a new comment alone is insufficient.
6. Use an isolated checkout and reviewable diff before automatically writing documents. Allow at most one active writer per document and stop on a new revision/source hash. Do not automatically merge or deploy as a side effect of a response.
7. Acceptance scenarios: worker crash, expired lease, ClickUp outage, duplicate event, two simultaneous responses, a response after 40 days, and an unavailable runner. In every case, retain state and avoid duplicate changes. Generated reports and notifications remain English.

## 6. Follow-up phase: responses directly in Teams

This phase is independent of the automatic runner. Tamar checks available licenses and tenant permissions; Dima chooses Power Automate or a Teams bot based on those findings. Do not purchase a license based on an assumption.

- Send a separate English card to each owner: full context, options, a free-text explanation field, and “Clarification needed / Different owner” actions. All generated card titles, descriptions, option consequences, buttons, and confirmation messages are English.
- Store verified responder identity, question revision, and original text. If an integration account writes the ClickUp comment, do not present it as the human author: show the actual Teams responder and audit provenance. Preserve the original response language and label any English translation.
- Do not treat ordinary chat as automatic decision acceptance; accept only responses correlated with a specific card and revision.
- Save the response in ClickUp and the same state machine. Reconcile uncertain write outcomes.
- Do not keep a Power Automate waiting flow beyond its 30-day limit; timeout leaves the question open in persistent storage and reissues the card with a new delivery ID. An expired card must not approve an old revision.
- Permit responses recorded on behalf of the team by another registered member through an accessible card or the ClickUp comment path. A personal card must not be assumed accessible to other people; the ClickUp path remains available when it is not. Apply the same provenance and acceptance rules as Task 5 rather than an assignee-only filter.
- Anna verifies an unknown responder, a registered non-assignee recording a team decision, duplicate submission, an old card, timeout, outage, valid free text, a responder without ClickUp access, and English generated copy with verbatim preservation of non-English source responses.

## 7. Sequence and estimate

Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7. Carlos and Anna can prepare examples and conduct reviews during development, respecting task dependencies.

Planning estimate, not a commitment: 7–11 person-days of development/integration plus 2–3 person-days of BA/QA for the MVP, approximately two working weeks depending on team and service availability. Dima and Tamar reassess after Task 1. Estimate the background runner and Teams-card phases separately after verifying the host, CLI, and licenses.

Starting requires the four actual account IDs, an available ClickUp list, a Teams channel/connection, and a coordinator for the first run from the same roster. Task 1 collects these values; missing access details do not prevent policy drafting or offline tests.

## 8. Sources

Repository findings are based on the files listed in the spec. Service limitations and official documentation links are in the [spec's sources and limitations section](../specs/2026-09-07-bmad-team-questions-design.md#sources-and-limitations). Verify exact endpoint payloads and permissions before implementing each adapter.
