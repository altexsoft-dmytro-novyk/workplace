# Test Automation Summary — User Management (TDD red phase)

Request → expect translations of every scenario doc in
`docs/test-cases/user-management/`, matching the existing
`registration.e2e-spec.ts` convention. All currently fail (mostly `404`,
since no `user-management` controllers exist yet) — that's the expected
red state; green happens as each story is implemented.

Preconditions producible through an endpoint this suite covers (an existing
user, an edited field, a manually-added event) are fulfilled with a real
request within the test — never a hardcoded `<aliceId>`-style placeholder —
so each test actually turns green once its story lands, rather than staying
red forever against an id nothing ever created. See the new rule:
`services/backend/.claude/rules/nest-e2e.md#preconditions-must-be-real-not-assumed`.

## Generated Tests

### E2E Tests (`services/backend/test/user-management/`)

- [x] `registration.e2e-spec.ts` — um-reg-01..05 (pre-existing, story 1-1 in progress)
- [x] `auth.e2e-spec.ts` — um-auth-01..05 (5 tests) — creates its own user per case via `POST /users`
- [x] `profile.e2e-spec.ts` — um-pf-01..04 (4 tests) — creates Alice/Colin via `POST /users`
- [x] `deactivation.e2e-spec.ts` — um-deact-01..03 (3 tests) — creates Colin/Alice via `POST /users`; um-deact-02 reuses um-deact-01's Colin
- [x] `career-timeline.e2e-spec.ts` — um-ct-01..07 (11 tests) — creates Nina (um-ct-01) and one shared Alice (um-ct-02..07) via `POST /users`; um-ct-05 gets an extra seeding step (see Notes)

## Coverage

- User-management test-case docs: 24/24 transcribed
- Verified: `npm run test:e2e` runs all four new specs against the real `AppModule`/Postgres stack — 23/23 new tests fail on `404` (no route yet), confirming the app boots, the DB is reachable, and fixture creation/cleanup runs cleanly end to end.

## Notes

- Persona `Bearer <token:X>` headers stay literal placeholders — session/authz is access-control's suite's job, not this one's (README: "this suite tests workflow and data correctness, not who is entitled").
- The magic-link token itself (`um-auth-03..05`) stays a literal placeholder — it's delivered by email, no endpoint echoes it back. Same precedent as `registration.e2e-spec.ts`'s `um-reg-05` note.
- `um-ct-05`'s precondition is a *system-generated* event with a wrong inferred value — no request can force a genuine bad inference on purpose, so the test seeds an equivalent wrong entry through the same manual-add endpoint `um-ct-03/04` already exercise. The mechanic under test (soft-delete + append) is unaffected; flagged in-file with a comment.
- `career-timeline` scenarios depend on `UserEvents`, which has no Prisma model yet — schema work is a prerequisite for turning those 11 tests green.

## Next Steps

- AD-1 human checkpoint on this batch before implementation starts on auth/profile/deactivation/career-timeline stories.
- As each story lands, its file's fixture-creation calls (`POST /users`, etc.) start succeeding for real and the corresponding tests should flip green with no further edits.
