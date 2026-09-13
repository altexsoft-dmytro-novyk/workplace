# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: services/frontend/e2e/flows/dashboards/dashboards.spec.ts >> People Management Dashboards — Unit Manager (Story 2.1 / PMC-E2-S2.1) >> FE-DASH-08 · Preset navigation, keyboard accessibility, motion, and no customization >> grouping dimension displays People as active
- Location: services/frontend/e2e/flows/dashboards/dashboards.spec.ts:366:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/dashboards", waiting until "load"

```

# Test source

```ts
  268 |       await expect(table).toBeVisible()
  269 | 
  270 |       // If uncovered columns exist in the table, verify they render explicit unavailable indicators/badges
  271 |       const projectHeader = table.getByRole('columnheader', { name: /Project/i })
  272 |       const leaveHeader = table.getByRole('columnheader', { name: /Leave/i })
  273 |       const riskHeader = table.getByRole('columnheader', { name: /Risk/i })
  274 | 
  275 |       const hasProjectHeader = (await projectHeader.count()) > 0
  276 |       const hasLeaveHeader = (await leaveHeader.count()) > 0
  277 |       const hasRiskHeader = (await riskHeader.count()) > 0
  278 | 
  279 |       if (hasProjectHeader || hasLeaveHeader || hasRiskHeader) {
  280 |         const unavailableBadges = table
  281 |           .locator('.unavailable-column, [data-unavailable="true"]')
  282 |           .or(table.getByText(/Unavailable|Not connected/i))
  283 |         await expect(unavailableBadges.first()).toBeVisible()
  284 |         const badgeCount = await unavailableBadges.count()
  285 |         expect(badgeCount).toBeGreaterThan(0)
  286 |       }
  287 | 
  288 |       // 2. Case B: With completely omitted uncovered columns
  289 |       await setupOmittedColumnsDashboard(page)
  290 |       await page.goto('/dashboards')
  291 | 
  292 |       const omittedTable = page.getByRole('table').or(page.getByTestId('dashboard-people-table'))
  293 |       await expect(omittedTable).toBeVisible()
  294 |       await expect(omittedTable.getByText('Diana Prince')).toBeVisible()
  295 | 
  296 |       // Explicitly assert that uncovered column headers are absent when omitted
  297 |       await expect(omittedTable.getByRole('columnheader', { name: /^Project$/i })).not.toBeVisible()
  298 |       await expect(omittedTable.getByRole('columnheader', { name: /^Leave/i })).not.toBeVisible()
  299 |       await expect(omittedTable.getByRole('columnheader', { name: /^Risk/i })).not.toBeVisible()
  300 |     })
  301 | 
  302 |     test('does not render silently blank cells or fabricated values for missing source capabilities', async ({ page }) => {
  303 |       await setupPopulatedDashboard(page)
  304 |       await page.goto('/dashboards')
  305 | 
  306 |       const table = page.getByRole('table').or(page.getByTestId('dashboard-people-table'))
  307 |       await expect(table).toBeVisible()
  308 | 
  309 |       // Ensure no blank cells with whitespace-only
  310 |       const emptyCells = table.locator('td:empty')
  311 |       await expect(emptyCells).toHaveCount(0)
  312 | 
  313 |       // Ensure no raw undefined / null / NaN text in table cells
  314 |       await expect(table.getByText('undefined', { exact: true })).not.toBeVisible()
  315 |       await expect(table.getByText('null', { exact: true })).not.toBeVisible()
  316 |       await expect(table.getByText('NaN', { exact: true })).not.toBeVisible()
  317 |     })
  318 |   })
  319 | 
  320 |   test.describe('FE-DASH-07 · Dashboard access denial and unauthenticated handling', () => {
  321 |     test('renders access-denied panel when dashboard-view permission is not held', async ({ page }) => {
  322 |       await setupAccessDeniedDashboard(page)
  323 |       await page.goto('/dashboards')
  324 | 
  325 |       // Fail-closed access denied UI using stable test ID
  326 |       const accessDeniedPanel = page.getByTestId('access-denied-panel')
  327 |       await expect(accessDeniedPanel).toBeVisible()
  328 |       await expect(accessDeniedPanel).toContainText(/Access denied|No permission/i)
  329 | 
  330 |       // Dashboard widgets and people table must NOT be rendered
  331 |       await expect(page.getByTestId('dashboard-headcount-widget')).not.toBeVisible()
  332 |       await expect(page.getByRole('table')).not.toBeVisible()
  333 |     })
  334 | 
  335 |     test('unauthenticated 401 response triggers the application global unauthenticated redirect handler', async ({
  336 |       page,
  337 |     }) => {
  338 |       await setupUnauthenticatedDashboard(page)
  339 |       await page.goto('/dashboards')
  340 | 
  341 |       // Expect global unauthenticated redirect to /login per FE-AUTH-01 / FE-EMP-07 / spec-frontend-foundation
  342 |       await expect(page).toHaveURL(/\/login(?:\?.*)?$/)
  343 |     })
  344 |   })
  345 | 
  346 |   test.describe('FE-DASH-08 · Preset navigation, keyboard accessibility, motion, and no customization', () => {
  347 |     test('preset tab strip displays Unit Manager preset only and is arrow-key navigable', async ({ page }) => {
  348 |       await setupPopulatedDashboard(page)
  349 |       await page.goto('/dashboards')
  350 | 
  351 |       const tabList = page.getByRole('tablist')
  352 |       await expect(tabList).toBeVisible()
  353 | 
  354 |       // Only Unit Manager tab present in Epic 2 Story 2.1 scope (no DM/PM tabs)
  355 |       await expect(page.getByRole('tab', { name: /Unit Manager/i })).toBeVisible()
  356 |       await expect(page.getByRole('tab', { name: /Delivery Manager/i })).not.toBeVisible()
  357 |       await expect(page.getByRole('tab', { name: /Project Manager/i })).not.toBeVisible()
  358 | 
  359 |       // Arrow-key navigable
  360 |       const umTab = page.getByRole('tab', { name: /Unit Manager/i })
  361 |       await umTab.focus()
  362 |       await page.keyboard.press('ArrowRight')
  363 |       await expect(umTab).toBeFocused()
  364 |     })
  365 | 
  366 |     test('grouping dimension displays People as active', async ({ page }) => {
  367 |       await setupPopulatedDashboard(page)
> 368 |       await page.goto('/dashboards')
      |                  ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  369 | 
  370 |       const peopleGrouping = page
  371 |         .getByRole('button', { name: /People/i })
  372 |         .or(page.getByRole('tab', { name: /People/i }))
  373 |         .or(page.getByRole('radio', { name: /People/i }))
  374 |         .or(page.locator('[data-grouping="people"]'))
  375 |       await expect(peopleGrouping).toBeVisible()
  376 | 
  377 |       const isGroupingActive = await peopleGrouping.evaluate((el) => {
  378 |         return (
  379 |           el.getAttribute('aria-pressed') === 'true' ||
  380 |           el.getAttribute('aria-selected') === 'true' ||
  381 |           el.getAttribute('aria-checked') === 'true' ||
  382 |           el.getAttribute('data-state') === 'active' ||
  383 |           el.getAttribute('data-state') === 'on' ||
  384 |           el.classList.contains('active')
  385 |         )
  386 |       })
  387 |       expect(isGroupingActive).toBe(true)
  388 |     })
  389 | 
  390 |     test('prefers-reduced-motion disables transitions and animations', async ({ page }) => {
  391 |       await page.emulateMedia({ reducedMotion: 'reduce' })
  392 |       await setupPopulatedDashboard(page)
  393 |       await page.goto('/dashboards')
  394 | 
  395 |       // Ensure Dashboard UI is rendered and interactive
  396 |       const dashboardHeader = page.locator('.pghd')
  397 |       await expect(dashboardHeader).toBeVisible()
  398 | 
  399 |       // Verify reduced-motion media query matches in browser context
  400 |       const mediaMatches = await page.evaluate(() => {
  401 |         return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  402 |       })
  403 |       expect(mediaMatches).toBe(true)
  404 | 
  405 |       // Query dashboard interactive/animated elements and verify motion is disabled
  406 |       const motionCheck = await page.evaluate(() => {
  407 |         const elements = Array.from(
  408 |           document.querySelectorAll(
  409 |             '.pghd, [role="tab"], [role="tablist"], [data-widget], [data-skeleton], .animate-pulse, .data-stat, aside, button'
  410 |           )
  411 |         )
  412 |         if (elements.length === 0) {
  413 |           return { elementsFound: 0, motionDisabled: false, failureReason: 'No dashboard elements found to inspect' }
  414 |         }
  415 | 
  416 |         for (const el of elements) {
  417 |           const style = window.getComputedStyle(el)
  418 |           const animDur = parseFloat(style.animationDuration) || 0
  419 |           const transDur = parseFloat(style.transitionDuration) || 0
  420 |           const animName = style.animationName
  421 | 
  422 |           // If animation is present, its duration must be effectively 0
  423 |           if (animName && animName !== 'none' && animDur > 0.05) {
  424 |             return {
  425 |               elementsFound: elements.length,
  426 |               motionDisabled: false,
  427 |               failureReason: `Element <${el.tagName.toLowerCase()} class="${el.className}"> has active animation ${animName} with duration ${style.animationDuration}`,
  428 |             }
  429 |           }
  430 | 
  431 |           // If transition is present, its duration must be effectively 0
  432 |           if (transDur > 0.05) {
  433 |             return {
  434 |               elementsFound: elements.length,
  435 |               motionDisabled: false,
  436 |               failureReason: `Element <${el.tagName.toLowerCase()} class="${el.className}"> has active transition duration ${style.transitionDuration}`,
  437 |             }
  438 |           }
  439 |         }
  440 | 
  441 |         return { elementsFound: elements.length, motionDisabled: true }
  442 |       })
  443 | 
  444 |       expect(motionCheck.elementsFound).toBeGreaterThan(0)
  445 |       expect(motionCheck.motionDisabled, motionCheck.failureReason).toBe(true)
  446 |     })
  447 | 
  448 |     test('customization affordances (customize mode, widget catalog, drag/remove handles, custom tabs) are absent', async ({
  449 |       page,
  450 |     }) => {
  451 |       await setupPopulatedDashboard(page)
  452 |       await page.goto('/dashboards')
  453 | 
  454 |       // Customization controls must be absent by construction (PM/AD-33, SD-1)
  455 |       await expect(page.getByRole('button', { name: /Customize/i })).not.toBeVisible()
  456 |       await expect(page.getByText(/Widget Catalog/i)).not.toBeVisible()
  457 |       await expect(page.locator('.drag-handle, [data-drag-handle]')).not.toBeVisible()
  458 |       await expect(page.locator('.remove-handle, [data-remove-widget]')).not.toBeVisible()
  459 |       await expect(page.getByRole('tab', { name: /\+ Custom/i })).not.toBeVisible()
  460 |     })
  461 |   })
  462 | })
  463 | 
```