# UM-DEP-06 · Recording a departure is idempotent per `Idempotency-Key`

**Trace:** PRD FR-6 · requirements §4.16 · epics.md Story 5.1 · api-conventions.md "Departure command and status (AD-20)" — canonical idempotency hash · [database-schema.md](../../../architecture/database-schema.md) §Departure (`idempotencyKey unique`, `requestHash`, `UNIQUE: one non-applied Departure per user`) · DEC-UM-002 (permission-negative probes) · ARCHITECTURE-RATIFICATION 2026-09-02 (CC-06 design approved)

> **Stage-2 first-class (authored 2026-09-03).** The `requestHash` rule and the
> partial `UNIQUE: one non-applied Departure per user` are ratified schema
> (`database-schema.md` §Departure). Deferred: Story 5.2's executor — not
> exercised here.

## Scenario-stage decisions (for the human gate)

- **Canonical `requestHash` contents** (from `database-schema.md` §Departure /
  `api-conventions.md`): API contract version, path user id, normalized ISO
  `effectiveDate`, normalized `reason`, authenticated creator id. **Not** the
  `Idempotency-Key` itself and **not** the wall clock. Stage 2 normalizes
  `reason` by `trim()` + internal-whitespace collapse before hashing (flag: whether
  case is also folded — recommend **no** case fold, `reason` is human prose).
- **Three distinct `409` conditions:**
  1. same key + **different** payload → `409` `idempotency_key_payload_mismatch`
     (`idempotencyKey` matches an existing row, `requestHash` differs);
  2. **different** key while a non-applied `Departure` already exists for that
     user → `409` `departure_already_scheduled` (the partial `UNIQUE`);
  3. (replay) same key + same payload → **not** an error: returns the original
     `201` result, after re-checking current authorization.
- **Replay rechecks authz first.** A replayed request from a caller who has
  since lost `employee:departure:record` (or lost access to the subject) →
  `403`, and never discloses the stored departure (`api-conventions.md` — "Replay
  always rechecks current authorization and never discloses status to a caller
  who has since lost access").

## Scenario

**Given** Alice manages/partners nobody; an actor holds `employee:departure:record`.

## Test

- **Test 1 — replay: same key + same payload → original `201`**
  - **inputURL:** `POST /users/<aliceId>/departures` (twice)
  - **inputRequest (both):** `{ "headers": { "authorization": "Bearer <token:Root>", "Idempotency-Key": "K1" }, "body": { "effectiveDate": "2026-12-01", "reason": "relocation" } }`
  - **expectedResult:** both `201` with the **same** `departureId` and body; stage 2 asserts exactly **one** `Departure` row.
- **Test 2 — same key + different `effectiveDate` → `409`**
  - **inputRequest:** `Idempotency-Key: "K1"`, body `{ "effectiveDate": "2027-01-15", "reason": "relocation" }`
  - **expectedResult:** `409` (`idempotency_key_payload_mismatch`); still exactly one `Departure` row, unchanged (`effectiveDate` still `2026-12-01`).
- **Test 3 — different key while a non-applied departure exists → `409`**
  - **inputRequest:** `Idempotency-Key: "K2"`, body `{ "effectiveDate": "2026-12-01", "reason": "relocation" }`
  - **expectedResult:** `409` (`departure_already_scheduled` — the partial `UNIQUE: one non-applied Departure per user`); no second row.
- **Test 4 — unauthorized actor → `403`, no row**
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Ida>", "Idempotency-Key": "K3" }, "body": { "effectiveDate": "2026-12-01", "reason": "relocation" } }` — Ida holds only an unrelated feature permission (DEC-UM-002).
  - **expectedResult:** `403` leak-free; stage 2 asserts **no** `Departure` row was created and `K3` is unconsumed.
- **Test 5 — replay after losing authorization → `403`, no disclosure**
  - **Given** Test 1 created a departure under `K1`; the actor's
    `employee:departure:record` grant is then revoked.
  - **inputRequest:** the exact Test 1 request again (`Idempotency-Key: "K1"`).
  - **expectedResult:** `403`; the body does **not** contain the stored
    `departureId` / `state`; the stored `Departure` row is unchanged.
- **Test 6 — `@concurrency`: two identical first-time requests (same key) in parallel** → exactly one `201` creates the row; the other returns the same `201` body (replay) or `409` on the losing insert, resolving to the same single `Departure` row.
