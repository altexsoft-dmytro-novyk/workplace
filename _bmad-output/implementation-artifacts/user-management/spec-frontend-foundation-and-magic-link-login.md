---
title: 'Frontend foundation and magic-link login'
type: 'feature'
created: '2026-09-03'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'd06b977c714d69036eb9407dffaf33d953e6fa15' # services/frontend HEAD (workspace 12d01ada5b286028b3093a725bf06e807bb4fd83)
context:
  - '{project-root}/services/frontend/CLAUDE.md'
  - '{project-root}/services/frontend/.claude/rules/'
  - '{project-root}/docs/design/people-platform-prototype/design-notes.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `services/frontend` is the bare React starter (only Home/Error pages, no auth, no API hooks, no routes). The User Management backend is fully built (`/api/v1`, passwordless magic-link → `Authorization: Bearer <jwt>`), but nothing can call it and there is no app shell or routing for the UM screens (goals G2–G5) to build on.

**Approach:** Stand up the shared foundation: design tokens for the prototype "stretch layer", an authenticated axios client, a session/auth context (token in `sessionStorage`, current-user id decoded from the JWT `sub`), route protection, the prototype app chrome (header + grouped sidebar), and the full magic-link login flow (request link + consume token → session).

## Boundaries & Constraints

**Always:**
- Follow every `services/frontend/.claude/rules/*` convention: pages = folder + UI-only component + `hooks/` for logic; API calls only through TanStack Query hooks in `src/api/hooks/`, request fns suffixed `ApiCall`; all user-facing text via i18n keys (key added to `translation.json` first); arrow-function components; `@/` imports; components < 200 lines.
- Styling via semantic tokens only — no hardcoded colours / hex / inline styles / manual `dark:` variants. The prototype's stretch-layer colours (Geist Mono, provenance tags, per-screen accent hues, page-header band) are added as **new CSS variables + `@theme inline` tokens** in `src/index.css`, then used as `bg-*/text-*` utilities.
- Session token persists in `sessionStorage` (not `localStorage`). Current-user id comes from decoding the JWT payload `sub` — there is no `/me` endpoint.
- API base URL is `http://localhost:3001/api/v1` (default in `config/env.ts`); the browser must reach it as `localhost` (backend `CORS_ORIGIN` is `http://localhost:4200`).
- Magic-link request/consume responses are enumeration-safe: identical UI for known / unknown / inactive email. Every consume failure (bad/expired/consumed token, inactive owner) is one generic error.
- Add deps with npm: `react-hook-form`, `@hookform/resolvers`, `zod`, and a Geist Mono font package. Add shadcn components via `npx shadcn@latest add` only.

**Ask First:**
- Introducing a state library beyond React context + TanStack Query.
- Any change to `services/backend`, or adding a route/endpoint the backend does not already expose.
- Persisting anything auth-related outside `sessionStorage` (e.g. a refresh-token scheme).

**Never:**
- Goals G2–G5 screens (employee directory, profile, org-relationships, departures) or the deferred G6/G7 (Roles & permissions, Access preview) — foundation + login only. The sidebar shows only live nav items; do not add placeholder pages for unbuilt screens.
- No SSO / password / registration UI. No dev-infra mail container.
- Do not weaken the backend `Bearer <token:...>` test shorthand or rely on it in app code.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Request link — any email | Valid email submitted on `/login` | `POST /auth/magic-link {email}` → confirmation panel ("If that address matches an account, a sign-in link is on its way") | Network/5xx → inline generic error, form re-enabled |
| Request link — invalid email | Malformed / empty field | zod blocks submit, field error shown | No request sent |
| Consume — valid token | Visit `/auth/magic-link/consume?token=…` | `POST /auth/magic-link/consume {token}` → store `sessionToken`, set auth state, redirect to `/` | — |
| Consume — missing/invalid/expired token | No `token` param, or backend `401` | Generic "This sign-in link is invalid or has expired" + link to `/login` | No session stored |
| Protected route while unauthenticated | Navigate to `/` (or any AppLayout route) with no session | Redirect to `/login` | — |
| Authenticated request returns `401` | Any API call rejects with `401` | Clear stored session, hard-redirect to `/login` | Handled once in the axios response interceptor |
| Logout | User picks "Sign out" in header menu | Clear `sessionStorage`, reset auth state, go to `/login` | — |
| Reload while authenticated | Token present in `sessionStorage`, not expired | Stay authenticated (auth state rehydrates from storage) | Expired/garbage token → treated as logged out |

</frozen-after-approval>

## Code Map

- `services/frontend/src/config/env.ts` -- `env.api.baseUrl`; change default to `http://localhost:3001/api/v1`. Also `.env.example`.
- `services/frontend/src/api/client.ts` -- `ApiClient` singleton; `setupInterceptors()` has TODO stubs. Add request interceptor (attach `Authorization` from session store) + response interceptor (on 401: clear session, `window.location.assign('/login')`). Keep the generic get/post/put/delete + `raw`.
- `services/frontend/src/contexts/LayoutContext.tsx` -- pattern for a context file (Provider + `useX` hook that throws; persistence inside provider). New `AuthContext.tsx` mirrors it.
- `services/frontend/src/App.tsx` -- providers wired here; wrap `Router` with `AuthProvider` (outside `LayoutProvider` is fine).
- `services/frontend/src/router/index.tsx` -- `createBrowserRouter`; currently `/app-error`, `/` (AppLayout→HomePage), `*`→`/`. Add `/login`, `/auth/magic-link/consume` (public, outside AppLayout); gate the AppLayout branch behind `RequireAuth`; `*` → redirect to `/` (which itself redirects to `/login` if unauthed).
- `services/frontend/src/components/MainHeader/MainHeader.tsx` + `components/Logo/Logo.tsx` -- restyle to the prototype: "PeoplePlatform" brand mark, centered global search input (visual only), notification bell, avatar with a dropdown menu (current user initials + "Sign out").
- `services/frontend/src/components/SideMenu/SideMenu.tsx` + `components/SideMenuItem` -- keep collapse/mobile-drawer behavior; add grouped sections (a `SideMenuSection` label matching the prototype's "Administration" header) and the prototype's active-item treatment. G1 renders only the **Home** item.
- `services/frontend/src/components/MainLayout/MainLayout.tsx` + `AppLayout/AppLayout.tsx` -- layout host; may need the page-header band tokens but no structural change.
- `services/frontend/src/i18n/config.ts`, `src/locales/en/translation.json`, `src/@types/i18next.d.ts` -- add `auth.*`, `shell.*`, extend `sidebar.*`.
- `services/frontend/src/index.css` -- `:root` / `.dark` token blocks + `@theme inline`; add mono font family var, `--accent-amber/-violet`, provenance colour pairs, page-header band vars.
- `services/frontend/src/pages/HomePage/HomePage.tsx` -- keep; it is the only live AppLayout route. Keep `data-testid="home-title"`.
- `services/frontend/e2e/app.spec.ts` -- currently asserts `/` shows `home-title`; now `/` redirects to `/login` when unauthed. Update + add `e2e/flows/auth/` (fixtures + helpers + spec) per `react-e2e` rules.
- Backend refs (read-only, do not edit): `services/backend/src/user-management/application/controllers/auth.controller.ts` (`POST /auth/magic-link`, `POST /auth/magic-link/consume`), `.../domain/services/magic-link.service.ts` (`EstablishedSession { sessionToken, tokenType:'Bearer', expiresIn }`), `.../infrastructure/jwt.util.ts` (`SessionJwtPayload { sub, iat, exp }`), `.../infrastructure/smtp-magic-link-dispatcher.adapter.ts` (email link → `${APP_BASE_URL}/auth/magic-link/consume?token=…`).

## Tasks & Acceptance

**Execution:**
- [ ] `services/frontend/package.json` -- add `react-hook-form`, `@hookform/resolvers`, `zod`, `@fontsource-variable/geist-mono` (or equivalent); run `npx shadcn@latest add input form label avatar dropdown-menu`.
- [ ] `src/index.css` -- add stretch-layer tokens (mono font family, `accent`/`accent-amber`/`accent-violet`, `provenance-synced`/`-derived`/`-platform`/`-access` colour pairs, page-header band vars) to `:root` + `.dark` + `@theme inline`; import the mono font.
- [ ] `src/config/env.ts` + `.env.example` -- API base default `http://localhost:3001/api/v1`.
- [ ] `src/lib/session.ts` -- tiny module: `readSession()/writeSession()/clearSession()` over `sessionStorage` (key `pp.session`), plus `decodeJwtSub(token)` and `isJwtExpired(token)` (base64url-decode the payload segment; no signature check client-side).
- [ ] `src/api/client.ts` -- request + response interceptors as in Code Map; import from `src/lib/session.ts`.
- [ ] `src/contexts/AuthContext.tsx` -- `AuthProvider` + `useAuth()`; state `{ token, userId, isAuthenticated }` rehydrated from `readSession()` (ignoring an expired token); `login(session: EstablishedSession)` writes storage + state; `logout()` clears + navigates. Export exactly the Provider + hook.
- [ ] `src/App.tsx` -- wrap with `AuthProvider`.
- [ ] `src/types/api.ts` -- add `EstablishedSession` and the magic-link request/response shapes.
- [ ] `src/api/hooks/useRequestMagicLink.ts` + `src/api/hooks/useConsumeMagicLink.ts` -- TanStack `useMutation` wrapping `requestMagicLinkApiCall` / `consumeMagicLinkApiCall`.
- [ ] `src/components/RequireAuth/RequireAuth.tsx` -- reads `useAuth()`; renders `<Outlet/>` when authenticated, else `<Navigate to="/login" replace/>`.
- [ ] `src/router/index.tsx` -- add public `/login`, `/auth/magic-link/consume`; nest AppLayout under `RequireAuth`.
- [ ] `src/pages/LoginPage/LoginPage.tsx` + `hooks/useLoginPage.ts` -- email form (react-hook-form + zod + shadcn `form`/`input`), submit → `useRequestMagicLink`; success → confirmation panel. Prototype-styled auth card (brand mark, provenance/eyebrow treatment optional).
- [ ] `src/pages/ConsumeMagicLinkPage/ConsumeMagicLinkPage.tsx` + `hooks/useConsumeMagicLinkPage.ts` -- read `token` from `useSearchParams`; call consume once on mount; success → `login()` + `navigate('/', {replace:true})`; failure/no-token → generic error + link to `/login`.
- [ ] `src/components/MainHeader/**`, `src/components/SideMenu/**`, `src/components/MainHeader/components/Logo/Logo.tsx` -- restyle to prototype; header avatar dropdown shows current-user initials (from `GET`? no — G1 has no name; use a generic avatar/"Signed in" + "Sign out") and calls `logout()`.
- [ ] `src/locales/en/translation.json` (+ `@types/i18next.d.ts` auto-picks up) -- `auth.*`, `shell.*`, `sidebar.*` keys.
- [ ] `src/pages/HomePage/HomePage.tsx` -- minor: keep `home-title` testid; optional prototype page-header band.
- [ ] `e2e/flows/auth/{fixtures.ts,helpers.ts,auth.spec.ts}` + update `e2e/app.spec.ts` -- cover: unauthed `/` → `/login`; request-link happy path shows confirmation; consume with a mocked valid token lands authenticated on `/`; consume with backend `401` shows the generic error.

**Acceptance Criteria:**
- Given a fresh browser (no session), when I open any AppLayout route, then I land on `/login`.
- Given I submit a syntactically valid email on `/login`, when the request succeeds, then I see an enumeration-safe confirmation and no token is exposed in the UI.
- Given I open `/auth/magic-link/consume?token=<valid>` (backend returns a session), when the page loads, then the token is stored in `sessionStorage`, `useAuth().userId` equals the JWT `sub`, and I am redirected to `/`.
- Given a stored session, when any API call returns `401`, then the session is cleared and the browser is redirected to `/login` exactly once.
- Given a stored, unexpired token, when I reload the app, then I remain authenticated without re-requesting a link.
- Given I am authenticated, when I choose "Sign out", then `sessionStorage` is cleared and I return to `/login`.
- `npm run build`, `npm run lint`, and `npm run test` (e2e) all pass in `services/frontend`.

## Design Notes

Stretch-layer tokens — add to `src/index.css`, do not hardcode in components:

```css
:root{
  --font-mono: 'Geist Mono Variable', ui-monospace, 'SFMono-Regular', monospace;
  --accent: var(--primary);              /* blue — default chrome accent */
  --accent-amber: oklch(0.58 0.12 66);   /* synced / can-go-stale surfaces */
  --accent-violet: oklch(0.54 0.17 300); /* access-inspection surfaces */
  --provenance-synced: oklch(0.47 0.10 60);
  --provenance-access: oklch(0.44 0.15 264);
  --page-band-tick: 3px;
}
@theme inline{
  --font-mono: var(--font-mono);
  --color-accent-amber: var(--accent-amber);
  --color-accent-violet: var(--accent-violet);
  --color-provenance-synced: var(--provenance-synced);
  --color-provenance-access: var(--provenance-access);
}
```

Auth-state shape rehydration: on load, `readSession()` → if token missing or `isJwtExpired` → treat as logged out (do not auto-clear storage in a render path; clear lazily in `logout()` / the 401 interceptor).

The magic-link email built by the backend points at `${APP_BASE_URL}/auth/magic-link/consume?token=…`, so the frontend route path must be exactly `/auth/magic-link/consume`. `APP_BASE_URL` in the backend env is expected to be `http://localhost:4200`.

## Verification

**Commands:**
- `cd services/frontend && npm run build` -- expected: typecheck + Vite build succeed.
- `cd services/frontend && npm run lint` -- expected: no errors.
- `cd services/frontend && npm run test` -- expected: `e2e/app.spec.ts` + `e2e/flows/auth/auth.spec.ts` green (Playwright starts Vite itself on 4200).

**Manual checks:**
- With `services/backend` running (`npm run start:dev`, port 3001) and the frontend on `http://localhost:4200`: submitting a seeded work email on `/login` returns the confirmation panel; pasting the consume URL from the backend log / email establishes a session and lands on Home; reload keeps you signed in; "Sign out" returns to `/login`.

## Suggested Review Order

**Session model (the design core)**

- Entry point — how a session becomes/stays "authenticated": token in `sessionStorage`, user id from JWT `sub`, expired/garbage token = logged out.
  [`AuthContext.tsx:43`](../../../services/frontend/src/contexts/AuthContext.tsx#L43)
- The storage + JWT-introspection primitives `AuthContext` and the interceptors build on; client-side signature is deliberately not checked.
  [`session.ts:70`](../../../services/frontend/src/lib/session.ts#L70)
- `login()` returns `boolean` and self-guards — a bad token from `/consume` falls through to the generic-error branch rather than half-authenticating.
  [`AuthContext.tsx:12`](../../../services/frontend/src/contexts/AuthContext.tsx#L12)

**Authenticated transport**

- Request interceptor attaches `Authorization: Bearer <token>`; response interceptor clears + hard-redirects on a `401` while a session is held, excluding the `/auth/magic-link*` endpoints (anchored suffix check).
  [`client.ts:53`](../../../services/frontend/src/api/client.ts#L53)

**Routing & guards**

- `RequireAuth` gates the whole app shell; unauthenticated → `/login`.
  [`RequireAuth.tsx:11`](../../../services/frontend/src/components/RequireAuth/RequireAuth.tsx#L11)
- Public auth routes sit outside `AppLayout`; the consume path is fixed by the backend email link shape; catch-all bounces through the guard.
  [`router/index.tsx:28`](../../../services/frontend/src/router/index.tsx#L28)

**Magic-link flow**

- Consume: run-once effect, strip `?token=` from history on every outcome, redirect home once a session exists.
  [`useConsumeMagicLinkPage.ts:38`](../../../services/frontend/src/pages/ConsumeMagicLinkPage/hooks/useConsumeMagicLinkPage.ts#L38)
- Request: enumeration-safe — a successful POST always shows the confirmation; failures surface via `isError`, form re-enables.
  [`useLoginPage.ts:26`](../../../services/frontend/src/pages/LoginPage/hooks/useLoginPage.ts#L26)

**Design system & shell (presentation)**

- Prototype "stretch layer" added as CSS variables + `@theme inline` tokens — never hardcoded in components; amber/violet/provenance hues staged for G2–G5.
  [`index.css:26`](../../../services/frontend/src/index.css#L26)
- Grouped sidebar wired for later epics to drop items in; G1 renders only Home.
  [`SideMenu.tsx:15`](../../../services/frontend/src/components/SideMenu/SideMenu.tsx#L15)

**Tests (supporting)**

- Full flow coverage incl. expired-token redirect, request-failure branch, and the consume-once guard.
  [`auth.spec.ts:25`](../../../services/frontend/e2e/flows/auth/auth.spec.ts#L25)
