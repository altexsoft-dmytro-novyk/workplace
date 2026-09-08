# Asynchronous BMAD Questions for the Team

Date: 2026-09-07. Status: proposed design for the implementation plan; integrations have not been configured.

## Goal and scope

The person starting planning should not have to answer on behalf of colleagues. BMAD writes a clear question, identifies its owner, publishes it in ClickUp, and saves its state. After a response arrives, a new run continues the dependent work. There is no active LLM generation while waiting.

The complete team is Anna — QA; Dima — architect and developer; Tamar — developer; Carlos — BA. Do not add other participants, a Product Owner, PM, UX designer, or administrator to routing. Verify administrative permissions separately; a team role does not imply Microsoft or ClickUp privileges.

All generated team-facing content must be in English: question titles and descriptions, ClickUp task descriptions and integration comments, Teams notifications and cards, status summaries, reminders, decision summaries, resume packets, templates, examples, and operational documentation. This requirement applies regardless of the initiator's chat language. Preserve original human responses and source quotations verbatim for audit purposes; provide a clearly labeled English translation or summary when needed. Keep identifiers and file paths unchanged.

## Verified repository state

- `_bmad/_config/manifest.yaml`: BMAD 6.11.0 is installed, with Claude Code, Codex, and Cursor IDE integrations.
- `scripts/create-clickup-task.cjs`, `scripts/sync-clickup.cjs`, `scripts/clickup-lib.cjs`: a REST API integration already exists for stories. Story creation requires configuration of the `bmad_key` Custom Field.
- `.github/workflows/sync-clickup.yml`: these scripts run against live services on selected changes to main; this is not a test environment.
- `.agents/skills/bmad-prd/SKILL.md`: the PRD workflow supports resuming unfinished runs and uses `.memlog.md`; `_bmad/scripts/memlog.py` writes its entries.
- `.agents/skills/bmad-agent-dev/customize.toml`: the communication style includes `Speaks in file paths and AC IDs`. This may contribute to unclear wording, but is not a proven explanation for every question.
- The workspace contains artifacts and integration scripts; product code lives in submodules. This work does not require backend/frontend changes.

## Approach selection

| Approach | Decision |
|---|---|
| Official ClickUp MCP with agent polling | Not the primary transport: daily quota and unnecessary model invocations |
| REST API CLI with saved state and manual continuation | Main MVP: uses the existing stack and needs no background server |
| Persistent coordinator with REST API and automatic BMAD invocation | Follow-up phase after the pilot; requires persistent storage, a runner, and a verified IDE/CLI invocation method |

MCP may later expose the same CLI functionality; it is not a separate store or waiting mechanism. Do not build a custom MCP server for the MVP.

## Ownership rules

| Topic | Response owner | Consult when needed |
|---|---|---|
| Business rules, terminology, scope, priorities, product behavior | Carlos | Anna for testability; Dima for technical implications |
| Architecture, API contracts, data, integrations, technical security | Dima | Tamar as a developer; Anna for verification |
| Testing, regression, quality, test data, verification approach | Anna | Carlos for ambiguous requirements; implementation owner |
| Implementation, estimates, technical details of a specific story | Dima or Tamar — the actual story/component owner | Dima as architect only for decisions spanning components |
| Unknown development owner | Dima selects Dima or Tamar | Do not automatically assign both |
| Unknown topic | Carlos clarifies the category and recipient | This does not authorize him to decide another domain's issues |

Routing product questions to Carlos does not grant Product Owner authority. A question outside the authority of these four people remains in “Authority decision required”; do not invent approval. Reassignment is limited to these four participants.

Split mixed questions: “what should the product do?” goes to Carlos, “how should it be implemented?” to Dima/the story owner, and “how should it be verified?” to Anna. If answers conflict, the respective owners record a joint decision. AI-agent voting does not replace human responses.

### Responses recorded on behalf of the team

The assigned owner is accountable for resolving the question and receives reminders; they are not the only person allowed to submit an answer. Any of Anna, Dima, Tamar, or Carlos may record an answer, including a decision agreed during a team call. Keep the original owner unless responsibility is explicitly reassigned.

Distinguish the comment author (`submittedBy`), the people reported to have agreed to the decision (`reportedAgreedBy`), and the coordinator who accepts it for application (`acceptedBy`). Store `responseBasis` as direct, team_discussion, or delegated, plus `acceptanceNote`. A meeting date or notes link is optional supporting context, not a required recording or transcript. Being present at a meeting does not automatically mean agreeing to its outcome.

For example, a question assigned to Dima may receive this comment from Carlos:

> We discussed this on today's team call. Dima and Tamar agreed that reactivation should require an explicit permission check. Anna will cover allowed and denied access in the tests. I am recording the agreed outcome here.

Import the response rather than rejecting it because Carlos is not the assignee. During the existing MVP response-review step, the coordinator confirms that it records an agreed decision within the relevant participants' authority. This confirmation can cover several decisions from the same call together. Do not require Dima to retype or reconfirm an agreement already established during that review. If the coordinator cannot establish whether it was agreed, ask one focused clarification of the relevant owner; a claim of “we agreed” alone must not trigger automatic application. If there is disagreement, preserve all responses and resolve the conflict instead of choosing the latest comment.

## Question content

Required human-facing fields: a question as the title; 2–4 sentences of context; the exact decision needed; why an answer matters; the recipient and role; a deadline with a time zone; dependent work; and sources described in words. Answer options are optional, but each must explain its consequences and allow a free-text alternative. Clearly label assumptions and recommendations. Write all generated descriptions in plain English, not just identifiers or links.

Example:

> **Who can reactivate an employee profile?**
>
> Carlos, the deactivation scenario describes revoking access, but does not specify who can return an employee to active status. This affects the access rule and the sign-in flow after reactivation.
>
> Please identify which product user role has this permission and whether additional approval is required. You can propose a different rule.
>
> **Blocked work:** completing the reactivation requirement. Other profile scenarios can continue.
>
> **Source:** employee management requirements, “Deactivation and reactivation” section; add the link after verifying the section.

This illustrates the format; it is not a confirmed gap in the current requirements. A live question must contain verified source information, a deadline, and a recipient. IDs may appear in a small administrative footer; they must not replace the explanation. People respond in ordinary text, without JSON, commands, or IDs. Preserve their original wording; any generated English translation must be distinguishable from the original.

## Storage and resumption

- ClickUp holds original questions and human comments; BMAD documents hold applied decisions; the checkpoint links them and records execution state.
- Each run has one write coordinator. Store state in `_bmad-output/planning-artifacts/team-questions/<run-id>/checkpoint.json`, using atomic temporary-file writes and rename. A short lock prevents simultaneous local writes; do not hold it while waiting for a person.
- The checkpoint contains schema version, run ID, workflow, document workspace, BMAD version, initiator, coordinator, next action, sources and their SHA-256 hashes, decisions, dependencies, question key/revision, task ID, response authors and IDs, delivery state, and application receipts. Never store tokens.
- In the MVP, transfer the checkpoint and documents together to another coordinator through the normal review/commit process. This is not a distributed queue; two checkouts must not manage the same run concurrently. A new environment without the checkpoint must not create tasks “from memory.”
- The checkpoint supplements `.memlog.md`. Use the standard script for PRD memlog entries. Resumption starts a new session with saved context; it does not restore the model's internal state.
- Treat human comments as data for a particular decision, not instructions to change routing, execute shell commands, or access unrelated secrets. Authorship of a response does not authorize integration configuration changes.

Question states: `draft → awaiting_response → response_received → ready_to_apply → applying → applied`. Additional states: `needs_clarification`, `needs_authority`, `superseded`, `cancelled`. Overdue is a separate flag, not an answer. Delivery state (`pending/sent/uncertain/failed`) remains separate from decision state. Human-facing state labels are English.

After any of the four registered team members comments, the importer records the input and sets `response_received` for an open question. This means input has arrived, not that a decision has been approved. In the MVP, the coordinator checks meaning, sufficiency, and the basis for acceptance in the existing review step, including decisions recorded on behalf of the team. Neither matching the assignee nor claiming a team agreement automatically makes a comment approval. If clarification is needed, preserve history; increment the question revision only if the question's meaning or requested decision changes, and show the complete revised question to its recipient. A clarification of who agreed does not itself change the question revision. Only an explicitly accepted response to the current revision becomes `ready_to_apply`. Preserve `submittedBy`, `reportedAgreedBy`, `responseBasis`, `acceptedBy`, and `acceptanceNote` with the decision and application receipt. Comments from outside the four-person roster remain reference material and cannot advance the decision automatically.

Check sources before applying a decision. If a hash has changed, do not write automatically: the new session compares the changes and assesses whether the response still applies. Record an `applying` intent, target document, and initial hash before applying; record the new hash and journal entry afterward. A crash between these steps triggers reconciliation of the incomplete application, not blind repetition.

## Delivery and ClickUp Free

Use a dedicated “Planning Questions” list with ordinary tasks: name, Markdown description, assignee, due date, and comments. Do not use Custom Fields or internal Automations for this process. The internal state machine is independent of available ClickUp statuses: a ClickUp status is only a display value; closing a task without an answer does not unblock BMAD.

Link records using the task ID in the checkpoint and a stable `BMAD-Q:<run-id>:<question-key>` marker at the bottom of the description for crash recovery. Store the revision separately. Task titles must always describe the question. Persist the delivery intent before POST. If a POST outcome is uncertain, reconcile the list's tasks, including pagination, by marker first. Do not automatically repeat an uncertain POST; keep it `uncertain` until resolved.

For the MVP, use standard ClickUp notifications in a dedicated accessible public Teams channel. This does not guarantee a personal DM or @mention. The pilot must verify that the owner receives their ClickUp assignment and the team sees a meaningful Teams notification. If the standard preview is insufficient, full context remains in ClickUp; personal, self-contained cards are a separate follow-up phase. Without an available Teams connection, the basic cycle works through ClickUp, but Teams delivery remains an incomplete implementation item. Generated notification content is English; do not assume control over the service's own localized interface labels.

Read responses through the REST API with pagination. The MVP accepts top-level responses; explicitly ask participants to move a threaded reply into a regular comment. Add thread support only as a separate verified task. Deduplicate imports by comment ID and edits by text hash. Repeated comments or polling must not apply a document change twice.

## Waiting, reminders, and scaling

MVP: send → checkpoint → end session → “Check responses and continue” → collect → resume packet → BMAD. No model polling, long sleep, or promise keeping the session open.

Proposed pilot policy: allow 2 business days for a response; issue one reminder after the deadline; notify the run coordinator after another 2 business days. Pilot calendar: Monday–Friday, 09:00–18:00 Europe/Kyiv, with no assumed public-holiday calendar. An explicit deadline can override this default. The MVP generates reminders only during collect; it does not promise delivery at an exact scheduled time.

Automation phase: use a separate persistent worker, shared transactional database, run leases/fencing, and a delivery queue. Initially poll the REST API every 30 minutes during business hours for known open questions only; reduce to every 2 hours after prolonged inactivity. Limit this process to 30 requests/minute while accounting for other integrations using the token; respect the reset header after HTTP 429. Invoke the LLM only for a new sufficient response or an ambiguity requiring interpretation. Verify the specific CLI's runner capabilities separately; do not assume a universal BMAD resume API exists.

## Sources and limitations

Checked on 2026-09-07; verify the actual workspace quotas before implementation.

- [ClickUp MCP](https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server): developer documentation lists 50 calls/24 hours on Free without Everything AI. This is the official MCP quota, not the REST API quota.
- [REST rate limits](https://developer.clickup.com/docs/rate-limits): 100 requests/minute per token on Free.
- [Custom Field uses](https://help.clickup.com/hc/en-us/articles/10993484102167-Custom-Fields-uses): Free includes 60 uses.
- [Automations](https://help.clickup.com/hc/en-us/articles/23477062949911-Automations-feature-availability-and-limits): Free includes 5 active Automations and 100 actions/month; Automation webhook actions are unavailable. This is not a claim about all developer API webhooks; the MVP does not depend on them.
- [Teams integration](https://help.clickup.com/hc/en-us/articles/6305932146455-Microsoft-Teams-integration): available on all plans, with role restrictions and public channels for activity sync; actual tenant permissions have not been verified.
- [Power Automate limits](https://learn.microsoft.com/en-us/power-automate/limits-and-config): one cloud flow can run for up to 30 days, including waiting. Power Automate is not a mandatory MVP dependency.

Documentation and local files were inspected; no live API operations or messages to the team were performed.
