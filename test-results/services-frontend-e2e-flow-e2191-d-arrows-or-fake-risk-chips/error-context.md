# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: services/frontend/e2e/flows/dashboards/dashboards.spec.ts >> People Management Dashboards — Unsourced Widget Slots (Story 2.2 / PMC-E2-S2.2) >> FE-DASH-10 · Prevention of fake zero, dashes, blank space, empty charts, or fabricated data in unavailable slots >> unavailable risk slot does not render numeric 0, trend arrows, or fake risk chips
- Location: services/frontend/e2e/flows/dashboards/dashboards.spec.ts:541:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/dashboards", waiting until "load"

```

# Test source

```ts
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
  464 | test.describe('People Management Dashboards — Unsourced Widget Slots (Story 2.2 / PMC-E2-S2.2)', () => {
  465 |   test.describe('FE-DASH-09 · Explicit unavailable state rendering for uncovered widget slots with permission-literate messaging', () => {
  466 |     test('renders explicit unavailable card for uncovered risk counts slot (PM-FR-21)', async ({ page }) => {
  467 |       await setupPopulatedDashboard(page)
  468 |       await page.goto('/dashboards')
  469 | 
  470 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  471 |       const riskSlot = panel.locator('[data-slot="riskCounts"]')
  472 | 
  473 |       await expect(riskSlot).toBeVisible()
  474 |       await expect(riskSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.riskCounts.missingCapability)).toBeVisible()
  475 |       await expect(riskSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.riskCounts.unavailableReason)).toBeVisible()
  476 |     })
  477 | 
  478 |     test('renders explicit unavailable card for uncovered unit action items and my action items slots (PM-FR-19)', async ({
  479 |       page,
  480 |     }) => {
  481 |       await setupPopulatedDashboard(page)
  482 |       await page.goto('/dashboards')
  483 | 
  484 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  485 |       const unitActionSlot = panel.locator('[data-slot="unitActionItems"]')
  486 |       const myActionSlot = panel.locator('[data-slot="myActionItems"]')
  487 | 
  488 |       await expect(unitActionSlot).toBeVisible()
  489 |       await expect(unitActionSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.unitActionItems.missingCapability)).toBeVisible()
  490 |       await expect(unitActionSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.unitActionItems.unavailableReason)).toBeVisible()
  491 | 
  492 |       await expect(myActionSlot).toBeVisible()
  493 |       await expect(myActionSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.myActionItems.missingCapability)).toBeVisible()
  494 |       await expect(myActionSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.myActionItems.unavailableReason)).toBeVisible()
  495 |     })
  496 | 
  497 |     test('renders explicit unavailable card for uncovered resourcing requests slot (PM-FR-23)', async ({ page }) => {
  498 |       await setupPopulatedDashboard(page)
  499 |       await page.goto('/dashboards')
  500 | 
  501 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  502 |       const resourcingSlot = panel.locator('[data-slot="resourcingRequests"]')
  503 | 
  504 |       await expect(resourcingSlot).toBeVisible()
  505 |       await expect(resourcingSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.resourcingRequests.missingCapability)).toBeVisible()
  506 |       await expect(resourcingSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.resourcingRequests.unavailableReason)).toBeVisible()
  507 |     })
  508 | 
  509 |     test('renders explicit unavailable card for uncovered open campaigns slot (PM-FR-20)', async ({ page }) => {
  510 |       await setupPopulatedDashboard(page)
  511 |       await page.goto('/dashboards')
  512 | 
  513 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  514 |       const campaignsSlot = panel.locator('[data-slot="openCampaigns"]')
  515 | 
  516 |       await expect(campaignsSlot).toBeVisible()
  517 |       await expect(campaignsSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.openCampaigns.missingCapability)).toBeVisible()
  518 |       await expect(campaignsSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.openCampaigns.unavailableReason)).toBeVisible()
  519 |     })
  520 | 
  521 |     test('displays missing capability name and explanation without apologetic or motivational filler across all unavailable slots', async ({
  522 |       page,
  523 |     }) => {
  524 |       await setupPopulatedDashboard(page)
  525 |       await page.goto('/dashboards')
  526 | 
  527 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  528 |       const slotKeys = ['riskCounts', 'unitActionItems', 'myActionItems', 'resourcingRequests', 'openCampaigns'] as const
  529 | 
  530 |       for (const key of slotKeys) {
  531 |         const slot = panel.locator(`[data-slot="${key}"]`)
  532 |         await expect(slot).toBeVisible()
  533 |         await expect(slot.getByText(/sorry/i)).not.toBeVisible()
  534 |         await expect(slot.getByText(/coming soon/i)).not.toBeVisible()
  535 |         await expect(slot.getByText(/we('?re| are) working on this/i)).not.toBeVisible()
  536 |       }
  537 |     })
  538 |   })
  539 | 
  540 |   test.describe('FE-DASH-10 · Prevention of fake zero, dashes, blank space, empty charts, or fabricated data in unavailable slots', () => {
  541 |     test('unavailable risk slot does not render numeric 0, trend arrows, or fake risk chips', async ({ page }) => {
  542 |       await setupPopulatedDashboard(page)
> 543 |       await page.goto('/dashboards')
      |                  ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  544 | 
  545 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  546 |       const riskSlot = panel.locator('[data-slot="riskCounts"]')
  547 | 
  548 |       await expect(riskSlot).toBeVisible()
  549 | 
  550 |       // Negative assertions: no numeric counters, fake 0, trend arrows, or risk chips
  551 |       await expect(riskSlot.locator('.data-stat')).not.toBeVisible()
  552 |       await expect(riskSlot.getByText('0', { exact: true })).not.toBeVisible()
  553 |       await expect(riskSlot.getByText('—', { exact: true })).not.toBeVisible()
  554 |       await expect(riskSlot.locator('.rchip, .trend-arrow, [data-trend]')).not.toBeVisible()
  555 |       await expect(riskSlot.getByText(/low risk|medium risk|high risk/i)).not.toBeVisible()
  556 |     })
  557 | 
  558 |     test('unavailable action items slots do not render numeric 0, dashes, or blank list containers', async ({ page }) => {
  559 |       await setupPopulatedDashboard(page)
  560 |       await page.goto('/dashboards')
  561 | 
  562 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  563 |       const unitActionSlot = panel.locator('[data-slot="unitActionItems"]')
  564 |       const myActionSlot = panel.locator('[data-slot="myActionItems"]')
  565 | 
  566 |       for (const slot of [unitActionSlot, myActionSlot]) {
  567 |         await expect(slot).toBeVisible()
  568 |         await expect(slot.locator('.data-stat')).not.toBeVisible()
  569 |         await expect(slot.getByText('0', { exact: true })).not.toBeVisible()
  570 |         await expect(slot.getByText('—', { exact: true })).not.toBeVisible()
  571 |         await expect(slot.locator('.task-item, [data-action-item]')).not.toBeVisible()
  572 |       }
  573 |     })
  574 | 
  575 |     test('unavailable resourcing slot does not render numeric 0, dashes, or empty chart visualizations', async ({
  576 |       page,
  577 |     }) => {
  578 |       await setupPopulatedDashboard(page)
  579 |       await page.goto('/dashboards')
  580 | 
  581 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  582 |       const resourcingSlot = panel.locator('[data-slot="resourcingRequests"]')
  583 | 
  584 |       await expect(resourcingSlot).toBeVisible()
  585 |       await expect(resourcingSlot.locator('.data-stat')).not.toBeVisible()
  586 |       await expect(resourcingSlot.getByText('0', { exact: true })).not.toBeVisible()
  587 |       await expect(resourcingSlot.getByText('—', { exact: true })).not.toBeVisible()
  588 |       // Prohibit chart canvases, SVG chart graphics, and empty visualization containers (while allowing standard status icons)
  589 |       await expect(resourcingSlot.locator('canvas, .recharts-surface, [data-chart], .chart-container, svg.chart')).not.toBeVisible()
  590 |     })
  591 | 
  592 |     test('unavailable campaigns slot does not render numeric 0, dashes, or synthetic items', async ({ page }) => {
  593 |       await setupPopulatedDashboard(page)
  594 |       await page.goto('/dashboards')
  595 | 
  596 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  597 |       const campaignsSlot = panel.locator('[data-slot="openCampaigns"]')
  598 | 
  599 |       await expect(campaignsSlot).toBeVisible()
  600 |       await expect(campaignsSlot.locator('.data-stat')).not.toBeVisible()
  601 |       await expect(campaignsSlot.getByText('0', { exact: true })).not.toBeVisible()
  602 |       await expect(campaignsSlot.getByText('—', { exact: true })).not.toBeVisible()
  603 |       await expect(campaignsSlot.locator('.campaign-item, [data-campaign-item]')).not.toBeVisible()
  604 |     })
  605 |   })
  606 | 
  607 |   test.describe('FE-DASH-11 · Multi-widget coexistence and independent slot metadata isolation', () => {
  608 |     test('renders all five unavailable widget slots coexisting alongside available headcount and people table widgets', async ({
  609 |       page,
  610 |     }) => {
  611 |       await setupPopulatedDashboard(page)
  612 |       await page.goto('/dashboards')
  613 | 
  614 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  615 | 
  616 |       // Available widgets from Story 2.1
  617 |       await expect(panel.getByTestId('dashboard-headcount-widget').or(panel.locator('[data-widget="headcount"]'))).toBeVisible()
  618 |       await expect(panel.getByTestId('dashboard-people-table-widget').or(panel.locator('[data-widget="people-table"]'))).toBeVisible()
  619 | 
  620 |       // All 5 unavailable slots coexist using canonical [data-slot="..."] identity
  621 |       await expect(panel.locator('[data-slot="riskCounts"]')).toBeVisible()
  622 |       await expect(panel.locator('[data-slot="unitActionItems"]')).toBeVisible()
  623 |       await expect(panel.locator('[data-slot="myActionItems"]')).toBeVisible()
  624 |       await expect(panel.locator('[data-slot="resourcingRequests"]')).toBeVisible()
  625 |       await expect(panel.locator('[data-slot="openCampaigns"]')).toBeVisible()
  626 |     })
  627 | 
  628 |     test('each unavailable widget slot renders from its own dedicated read-model property', async ({ page }) => {
  629 |       await setupPopulatedDashboard(page)
  630 |       await page.goto('/dashboards')
  631 | 
  632 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  633 | 
  634 |       const riskSlot = panel.locator('[data-slot="riskCounts"]')
  635 |       const resourcingSlot = panel.locator('[data-slot="resourcingRequests"]')
  636 |       const campaignsSlot = panel.locator('[data-slot="openCampaigns"]')
  637 | 
  638 |       await expect(riskSlot).toBeVisible()
  639 |       await expect(resourcingSlot).toBeVisible()
  640 |       await expect(campaignsSlot).toBeVisible()
  641 | 
  642 |       // Each distinct slot displays its own metadata
  643 |       await expect(riskSlot).toContainText(mockPopulatedUnitManagerDashboard.widgets.riskCounts.missingCapability)
```