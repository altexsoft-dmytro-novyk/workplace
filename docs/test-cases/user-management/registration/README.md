# User Management — `registration/` — RETIRED (v1.5)

**RETIRED (v1.5, 2026-09-01).** `um-reg-01`..`um-reg-15` covered `POST /users`
HTTP employee create — removed by AD-14 / AD-16 / §4.17. There is no product
create/registration path in v1.5.

**Superseded by:** `seed/um-seed-01..03` (Epic 1 Story 1.1 — Import Seeded
Population). See [`../seed/README.md`](../seed/README.md).

- `um-seed-01` — import success (one canonical `User` row per seeded employee; normalized `workEmail`; `joined_company` per row).
- `um-seed-02` — no `POST /users` create path.
- `um-seed-03` — bootstrap HR Admin present + ACM-0 root id reuse (DEC-UM-009).

The 15 `um-reg-*.md` files are **retained in this folder as history only** — do
not translate them to stage-2, do not cite them from any trace line, do not
approve them. `DEC-UM-006` (server-owned create fields) and `DEC-UM-008`
(registration dispatch durability) are RETIRED alongside them
([user-management-test-decisions.md](../../../architecture/user-management-test-decisions.md)).
Magic-link dispatch durability now lives entirely in `auth/` (Epic 2 Story 2.1).

The backend `services/backend/test/user-management/registration.e2e-spec.ts`
is a corresponding retirement — see
`_bmad-output/test-artifacts/e2e-actual-state-audit-2026-09-01.md`.
