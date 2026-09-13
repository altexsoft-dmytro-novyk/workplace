# Frontend — Stage-1 scenario documents

Scenario documents for the React client's Playwright suite
(`services/frontend/e2e/`). One folder per user flow, one document per
**user-visible behaviour**.

## Why the shape differs from the backend suites

The `user-management/`, `access-control-*/` and `mentorship/` suites are
backend-shaped: each document pins one HTTP contract with `inputURL`,
`inputRequest` and an `expectedResult` status. Nothing of that shape describes a
UI, which is why the frontend suite carried no oracle at all until 2026-09-04
and scored zero coverage despite being real test effort.

These documents are **behavioural**: Given the app in some state, When the user
acts, Then this is visible or this request is (or is not) sent. A frontend
assertion is about what a person sees and what the client sends — not about a
status code, which the backend documents already own.

## Granularity: per behaviour, not per case

The backend oracle is per-contract because each HTTP contract is genuinely
distinct. UI assertions are variations on a much smaller set of behaviours — six
different error copies for one failed assignment are one behaviour, not six
requirements. So a document groups the cases that prove one behaviour, and the
suite's 124 cases resolve to 57 scenarios (≈2.2 cases each — slightly coarser
than the backend's ≈1.8).

Each document lists the exact case titles it covers, and every case names its
scenario id in its own `test(...)` title, so traceability resolves from the test
titles alone and does not depend on the coverage matrix staying fresh.

## Stage ordering — read this before approving

**These documents were written from a suite that already shipped.** The flows
were built and their tests were green well before any scenario document existed;
these were authored on 2026-09-04 by reading the suite and grouping it. That is
the reverse of AD-1, recorded rather than hidden. Approving them ratifies
behaviour that already runs — it does not certify that the behaviour was
specified first, because it was not.

The behavioural prose is a faithful reading of the assertions, but it is a
*reading*. Where a document states intent the tests only imply, that intent is
the reviewer's to confirm.

## Flows

| Folder | Ids | Cases | Suite |
| --- | --- | --- | --- |
| `app-shell/` | `fe-shell-01` | 2 | `e2e/app.spec.ts` |
| `auth/` | `fe-auth-01`…`05` | 11 | `e2e/flows/auth/auth.spec.ts` |
| `departure/` | `fe-dep-01`…`08` | 20 | `e2e/flows/departure/departure.spec.ts` |
| `employees/` | `fe-emp-01`…`07` | 11 | `e2e/flows/employees/employees.spec.ts` |
| `import/` | `fe-imp-01`…`09` | 17 | `e2e/flows/import/import.spec.ts` |
| `organisation/` | `fe-org-01`…`16` | 39 | `e2e/flows/organisation/organisation.spec.ts` |
| `profile/` | `fe-prof-01`…`11` | 24 | `e2e/flows/profile/profile.spec.ts` |
| `dashboards/` | `fe-dash-01`…`13` | — | `e2e/flows/dashboards/dashboards.spec.ts` |

**124 cases across 57 documents.** Note: the 2026-09-04 coverage matrix records
this suite as 133 cases. That figure is wrong — `npx playwright test --list`
reports 124, and the AST of the seven files agrees.

## Preconditions common to every document

The suite mocks the API at the network layer (each flow's `helpers.ts`) and
Playwright starts Vite itself, so no backend runs. Assertions are user-visible
outcomes and observed requests, following the locator priority in
`services/frontend/.claude/rules/react-e2e.md`: `getByRole` > `getByLabel` >
`getByTestId`.
