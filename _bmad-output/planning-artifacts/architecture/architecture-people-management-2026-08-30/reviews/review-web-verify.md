---
name: 'review-web-verify'
type: review
target: _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-30/ARCHITECTURE-SPINE.md
purpose: 'verify committed technical decisions in the spine against live web research rather than training-data assertion'
created: '2026-08-30'
---

# Web-Verification Review — Architecture Spine (user-management & access-control)

Method: WebSearch against current (2026-08-30) sources — npm registry pages, official release notes/GitHub releases, PostgreSQL.org, Prisma docs/changelog, NestJS docs/GitHub. Each section states what was found, the source, and whether it confirms or contradicts the spine's claim.

## 1. Stack table — pinned versions (marked `[ADOPTED, not re-verified]`)

### NestJS 11 (Express, CommonJS)

**Found:** NestJS 12.0.0 was released 2026-08-27 (three days before this review), introducing a full ESM migration across official packages, Vitest/oxlint/Rspack as new defaults for new projects. NestJS 11 is **not EOL** — it continues receiving concurrent patch releases (11.2.3 on 2026-08-25, same week as v12's launch), and the v11→v12 upgrade is framed as gradual/opt-in via `nest upgrade`, with CommonJS apps explicitly stated to keep working under v12 too.

**Verdict: CONFIRMS**, with a caveat worth noting. NestJS 11 is real, current, and actively patched — not deprecated or superseded in the sense of losing support. It is one major version behind the very latest (which shipped days before this spine's date), and v12's direction (ESM-first) is a signal that CommonJS is not where new development is trending — but that doesn't invalidate "adopted, pre-existing, not reconsidered" for this spine's scope. No correction needed; flag as a freshness note for a future re-evaluation window, not a defect now.

**Sources:** github.com/nestjs/nest/releases (v12.0.0, 2026-08-27; v11.2.3, 2026-08-25); infoq.com "NestJS v12 Roadmap"; trilon.io "NestJS v12 is Coming".

### Prisma 7, with `@prisma/adapter-pg`

**Found:** Prisma ORM 7 requires a driver adapter for **all** database connections (the "leaner core" redesign) — so pairing Prisma 7 with `@prisma/adapter-pg` isn't just a valid option, it is the *mandatory* shape for Postgres under v7, not a stale optional add-on. `@prisma/adapter-pg` is at 7.9.1 (published ~25 days before this review), actively released in lockstep with core. Prisma 7 is still the **current recommended production major** as of 2026-08-30; Prisma 8 was only announced 2026-03-04 as a forward-looking TypeScript-native rewrite and is still pre-release (8.0.0-rc.8 / 8.1.0-dev builds only) — not yet production-ready.

**Verdict: CONFIRMS**, and strengthens the spine's claim — the adapter-pg pairing is not merely still-valid, it's now required by Prisma 7's architecture, and Prisma 7 remains the right production choice (not superseded).

**Sources:** prisma.io/docs/guides/upgrade-prisma-orm/v7; npmjs.com/package/@prisma/adapter-pg; prisma.io/blog "The Next Evolution of Prisma ORM"; releasebot.io/updates/prisma.

### PostgreSQL 18

**Found:** Released 2025-09-25 (about 11 months before this review), current minor as of 2026-08-13 is 18.6, estimated EOL November 2030. Not deprecated, well inside its support window, actively receiving minor/security releases.

**Verdict: CONFIRMS.** Fully current, non-EOL.

**Sources:** postgresql.org/about/news/postgresql-18-released-3142; postgresql.org/support/versioning.

### Node >=24

**Found:** Node.js 24 ("Krypton") is the **Active LTS** line as of August 2026, supported through 2028-04-30. Node 26 exists as the newer "Current" (non-LTS) release and won't become Active LTS until October 2026. So Node >=24 as a floor is exactly the currently-recommended production choice, not a stale pin.

**Verdict: CONFIRMS.**

**Sources:** endoflife.date/nodejs; versionlog.com/nodejs/24; dev.to "Node.js 26 vs Node.js 24 LTS".

### Overall Stack verdict

All four pinned technologies are real, current, non-EOL, and fit their stated purpose. The spine's "[ADOPTED, not re-verified]" caveat turns out to be safe in practice — nothing here needed correcting. One freshness note only: NestJS 12 landed literally this week; not a defect, just worth a note for whenever this spine is next revisited.

---

## 2. AD-16 — Departure executor (`SELECT ... FOR UPDATE SKIP LOCKED`)

**Pattern currency:** `FOR UPDATE SKIP LOCKED` remains the standard, currently-recommended Postgres pattern for a polling job queue in 2026 — multiple 2026-dated sources (production guides, Medium deep-dives) confirm it's still the baseline approach that libraries like Que/Oban build on. **No Postgres native job-scheduling feature exists in core Postgres 17/18** — job scheduling still requires an extension (`pg_cron`) or an external scheduler; there is nothing built into Postgres itself that would supersede the "NestJS scheduled task polls the table" approach. So AD-16's choice not to reach for a new Postgres-native scheduler is correct — no such thing exists to reach for.

**`@nestjs/schedule` currency:** Confirmed actively maintained as the official NestJS module wrapping the `cron` package, with 2026-dated docs/usage; nothing suggests it's been superseded or that its `@Cron()`/`@Interval()` API has changed in a way that affects this AD.

**Known pitfall found (real, worth flagging):** 2026-dated sources note `FOR UPDATE SKIP LOCKED` alone does **not** enforce global constraints (e.g., "never run this job type more than once concurrently," "no duplicate active rows") — that requires an additional primitive like `pg_advisory_xact_lock`. This matters less here than in a generic queue: AD-16's due-row selection is naturally idempotent-guarded by `appliedAt IS NULL`, and the population of concurrently-due departures is expected to be small (not a high-throughput multi-worker queue), so the "thousands of workers hammering the table" scale pitfall cited in 2026 sources is unlikely to bite. Still, if this executor is ever run with more than one concurrent poller/instance, the AD's text doesn't explicitly address the "two pollers grab overlapping rows" case beyond SKIP LOCKED's per-row exclusivity — which is in fact exactly what SKIP LOCKED solves for row-level claims, so this is not a real gap, just worth being explicit that SKIP LOCKED's guarantee is per-row, not "only one poller runs at all."

**Prisma 7 specific pitfall found (real, worth flagging — MEDIUM):** Prisma has **no native query-builder support for `FOR UPDATE SKIP LOCKED`** — there's a long-standing open feature request (prisma/prisma#5983) that is still unresolved. The only way to express this pattern in Prisma (7 included) is `$queryRaw`/`$executeRaw` inside an interactive `$transaction(async (tx) => {...})` callback. This is a well-known, supported workaround (Prisma's own docs cover raw queries inside transactions), and interactive transactions have been production-ready since Prisma 4.7 — nothing Prisma-7-specific breaks this. But **the AD's text doesn't mention that raw SQL is required** to implement it; an implementer following the AD literally via Prisma's typed query methods would find no such method exists. This is a documentation/implementation-detail gap, not a soundness problem — the idempotency claim (gated on `appliedAt`) still holds regardless of raw-vs-typed query API, since idempotency comes from the transactional field update, not from how the lock is acquired.

**Verdict: CONFIRMS** the pattern is sound and current, with idempotency intact under Prisma 7. **One documentation gap flagged**: AD-16 should note the executor's row-selection query must be raw SQL (`$queryRaw` inside `$transaction`), since Prisma's typed client has no `SKIP LOCKED` equivalent.

**Sources:** github.com/prisma/prisma/issues/5983 (open FOR UPDATE SKIP LOCKED feature request); prisma.io/docs/orm/prisma-client/queries/transactions; medium.com "Why FOR UPDATE SKIP LOCKED Isn't Enough" (2026); netdata.cloud "Using FOR UPDATE SKIP LOCKED For Queue Workflows"; npmjs.com/package/@nestjs/schedule; severalnines.com "Overview of Job Scheduling Tools for PostgreSQL".

---

## 3. AD-21 — Two token kinds (opaque DB-backed magic link + stateless JWT session)

**Pattern currency:** Confirmed still the currently-recommended shape for passwordless auth in 2026: single-use magic-link tokens need server-side state to enforce single-use/replay-prevention (an opaque random value hashed at rest, exactly as AD-21 specifies, is called out by 2026 sources as *simpler and harder to misuse* than trying to force single-use semantics onto a JWT via a denylist). Once redeemed, issuing a separate stateless session JWT is the standard split — this is exactly AD-21's shape, not an outdated pattern. 15-minute magic-link expiry (not specified numerically in this AD, deferred detail) matches industry default (Clerk/Auth0/Supabase).

**`@nestjs/jwt` currency:** Confirmed current and actively maintained — latest 11.0.2 (~8 months old at review time), 1000+ dependent packages, still the standard NestJS wrapper around `jsonwebtoken`. This is the right library for AD-21's "stateless signed JWT" leg.

**2026 threat note (informational, not contradicting the AD):** sources flag AiTM (adversary-in-the-middle) proxy interception of magic links/session tokens as a live 2026 concern, and "alg: none" JWT misconfiguration as a still-seen audit finding — neither is addressed explicitly in AD-21's text (algorithm choice, HttpOnly/Secure cookie vs. bearer-header delivery aren't specified), but these are implementation-level hardening details appropriately deferred past spine altitude, not evidence the *pattern* itself is wrong.

**Verdict: CONFIRMS.** The two-token-kind split is still the recommended pattern, and `@nestjs/jwt` is still the expected, current, maintained library for the stateless leg. No correction needed.

**Sources:** mojoauth.com "Are Magic Links Secure"; apiscout.dev "How to Implement Magic Link Auth in 2026"; npmjs.com/package/@nestjs/jwt; github.com/nestjs/jwt/releases.

---

## 4. Other named technology/pattern spot-checks

### `uuidv7` as the id convention (Consistency Conventions table)

**Found:** PostgreSQL 18 added **native** `uuidv7()` support in core (RFC 9562-compliant, time-ordered UUIDs, no extension required), alongside an updated `uuid_extract_timestamp()` that understands v7. This wasn't a claim under test in the brief, but it's a spine convention that pairs directly with the pinned PostgreSQL 18 — and it turns out PG18 is the *first* Postgres version where this pairing is natively supported without an extension (`pgcrypto`/`uuid-ossp` workarounds were needed pre-18). This is a genuine (uncredited) strength of the stack choice, worth noting positively rather than flagging as a gap.

**Verdict: CONFIRMS / strengthens.** Not contradicted; actually underscores that PG18 was a sound floor for this convention, whether or not that was the original reasoning.

**Sources:** postgresql.org (release-18 notes); neon.com/postgresql/18/uuidv7-support; betterstack.com "UUID v7 in PostgreSQL 18".

### Recursive CTEs (AD-24, department-tree / reports-to walk)

Recursive CTEs (`WITH RECURSIVE`) are long-standing core Postgres functionality (since 8.4), fully present and unchanged in Postgres 18 — not a new or risky claim. No contradiction; not treated as a material finding given how well-established this is, included here only for completeness of the sweep.

---

## Summary Table

| # | Item | Verdict | Severity of any finding |
| --- | --- | --- | --- |
| 1a | NestJS 11 | Confirms — current, non-EOL, actively patched | Info: v12 shipped 3 days before spine date; not a defect |
| 1b | Prisma 7 + @prisma/adapter-pg | Confirms — adapter is now *mandatory*, not optional, under Prisma 7 | None |
| 1c | PostgreSQL 18 | Confirms — current, EOL ~2030 | None |
| 1d | Node >=24 | Confirms — Active LTS through 2028-04-30 | None |
| 2 | AD-16 SKIP LOCKED pattern | Confirms pattern + idempotency hold under Prisma 7 | Medium: AD-16 doesn't state the executor's claim query must be raw SQL (`$queryRaw` in `$transaction`) — Prisma's typed client has no SKIP LOCKED equivalent (open feature request prisma/prisma#5983) |
| 3 | AD-21 two-token auth pattern | Confirms — still the recommended 2026 pattern; @nestjs/jwt current | None |
| 4 | uuidv7 / PG18 pairing | Confirms, and is a stronger fit than the spine credits | None (positive note) |
