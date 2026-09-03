
## Deferred from: code review (2026-09-04)

Branch `feat/clickup-task-descriptions`, diff `main...HEAD`. Review run in `no-spec` mode; Acceptance Auditor layer skipped.

- **Pacing hole on skipped entries** — `syncClickUp` pauses only after an entry it fully processed. An entry skipped by the `bmad_key` lookup has already spent list API calls, so the rate-limit pacing does not cover it. `scripts/sync-clickup.cjs`.
- **No length cap on generated descriptions** — longest today is 6241 characters. ClickUp's limit is unverified, and an arbitrary cap would silently truncate epic prose, so this needs a real number before it is worth adding. `scripts/clickup-lib.cjs`.
- **`storyFingerprint` and `buildStoryDescription` are named for stories but now serve epics too** — the `story.sprintKey ?? story.epicKey` fallback inside them is the symptom. A rename touches several call sites and is churn during an open branch. `scripts/clickup-lib.cjs`.
- **Declared sprint keys are unvalidated** — `SPRINT_KEY_FIELD` captures anything that is not a backtick. A declared key containing a colon would land in the same map as the `track:epic-N` keys. Needs a decision on the allowed key shape before adding a check. `scripts/clickup-lib.cjs`.
- **Epic prose carries its own `**Status:**` line** — e.g. platform epic-3. Now that the ClickUp status field is synced, the prose is a second source of truth that can drift. This is an epics.md content question, not a code one. `_bmad-output/planning-artifacts/platform/epics.md`.
