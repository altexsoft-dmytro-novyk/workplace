# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: services/frontend/e2e/flows/dashboards/dashboards.spec.ts >> People Management Dashboards — Unsourced Widget Slots (Story 2.2 / PMC-E2-S2.2) >> FE-DASH-11 · Multi-widget coexistence and independent slot metadata isolation >> renders all five unavailable widget slots coexisting alongside available headcount and people table widgets
- Location: services/frontend/e2e/flows/dashboards/dashboards.spec.ts:608:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/dashboards", waiting until "load"

```

# Test source

```ts
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
  543 |       await page.goto('/dashboards')
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
> 612 |       await page.goto('/dashboards')
      |                  ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
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
  644 |       await expect(resourcingSlot).toContainText(mockPopulatedUnitManagerDashboard.widgets.resourcingRequests.missingCapability)
  645 |       await expect(campaignsSlot).toContainText(mockPopulatedUnitManagerDashboard.widgets.openCampaigns.missingCapability)
  646 |     })
  647 | 
  648 |     test('displays metadata supplied by each corresponding property without cross-slot substitution (allowing identical metadata where legitimately shared, such as PM-FR-19 action items)', async ({
  649 |       page,
  650 |     }) => {
  651 |       // Supply typed custom metadata to verify property-to-slot mapping integrity
  652 |       await setupPopulatedDashboard(page, {
  653 |         widgets: {
  654 |           riskCounts: {
  655 |             status: 'unavailable',
  656 |             missingCapability: 'Risk Intelligence',
  657 |             sourceFr: 'PM-FR-21',
  658 |             unavailableReason: 'Custom risk engine reason',
  659 |           },
  660 |           unitActionItems: {
  661 |             status: 'unavailable',
  662 |             missingCapability: 'Action Items Hub',
  663 |             sourceFr: 'PM-FR-19',
  664 |             unavailableReason: 'Shared action items explanation',
  665 |           },
  666 |           myActionItems: {
  667 |             status: 'unavailable',
  668 |             missingCapability: 'Action Items Hub',
  669 |             sourceFr: 'PM-FR-19',
  670 |             unavailableReason: 'Shared action items explanation',
  671 |           },
  672 |           resourcingRequests: {
  673 |             status: 'unavailable',
  674 |             missingCapability: 'Resourcing Pipeline',
  675 |             sourceFr: 'PM-FR-23',
  676 |             unavailableReason: 'Custom resourcing reason',
  677 |           },
  678 |           openCampaigns: {
  679 |             status: 'unavailable',
  680 |             missingCapability: 'Organizational Campaigns',
  681 |             sourceFr: 'PM-FR-20',
  682 |             unavailableReason: 'Custom campaigns reason',
  683 |           },
  684 |         },
  685 |       })
  686 |       await page.goto('/dashboards')
  687 | 
  688 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  689 | 
  690 |       const riskSlot = panel.locator('[data-slot="riskCounts"]')
  691 |       const unitActionSlot = panel.locator('[data-slot="unitActionItems"]')
  692 |       const myActionSlot = panel.locator('[data-slot="myActionItems"]')
  693 |       const resourcingSlot = panel.locator('[data-slot="resourcingRequests"]')
  694 |       const campaignsSlot = panel.locator('[data-slot="openCampaigns"]')
  695 | 
  696 |       await expect(riskSlot).toBeVisible()
  697 |       await expect(unitActionSlot).toBeVisible()
  698 |       await expect(myActionSlot).toBeVisible()
  699 |       await expect(resourcingSlot).toBeVisible()
  700 |       await expect(campaignsSlot).toBeVisible()
  701 | 
  702 |       // Verify riskSlot received its specific metadata and NOT resourcing metadata
  703 |       await expect(riskSlot).toContainText('Risk Intelligence')
  704 |       await expect(riskSlot).toContainText('Custom risk engine reason')
  705 |       await expect(riskSlot).not.toContainText('Resourcing Pipeline')
  706 | 
  707 |       // Verify unitActionSlot and myActionSlot both display the shared PM-FR-19 metadata without error
  708 |       await expect(unitActionSlot).toContainText('Action Items Hub')
  709 |       await expect(unitActionSlot).toContainText('Shared action items explanation')
  710 |       await expect(myActionSlot).toContainText('Action Items Hub')
  711 |       await expect(myActionSlot).toContainText('Shared action items explanation')
  712 | 
```