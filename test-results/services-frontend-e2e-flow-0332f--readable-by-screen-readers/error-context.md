# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: services/frontend/e2e/flows/dashboards/dashboards.spec.ts >> People Management Dashboards — Unsourced Widget Slots (Story 2.2 / PMC-E2-S2.2) >> FE-DASH-13 · Semantic structure, accessibility, responsive layout, and lack of customization for unavailable widget cards >> unavailable widget cards have semantic structure and accessible headings readable by screen readers
- Location: services/frontend/e2e/flows/dashboards/dashboards.spec.ts:770:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/dashboards", waiting until "load"

```

# Test source

```ts
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
  713 |       // Verify resourcingSlot and campaignsSlot received their specific metadata
  714 |       await expect(resourcingSlot).toContainText('Resourcing Pipeline')
  715 |       await expect(resourcingSlot).toContainText('Custom resourcing reason')
  716 |       await expect(campaignsSlot).toContainText('Organizational Campaigns')
  717 |       await expect(campaignsSlot).toContainText('Custom campaigns reason')
  718 |     })
  719 |   })
  720 | 
  721 |   test.describe('FE-DASH-12 · State disambiguation across unavailable source, legitimate measured zero, empty scope, loading skeleton, and access denial', () => {
  722 |     test('unavailable widget slots render unavailable cards and never display .emptyst empty state or numeric 0', async ({
  723 |       page,
  724 |     }) => {
  725 |       await setupPopulatedDashboard(page)
  726 |       await page.goto('/dashboards')
  727 | 
  728 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  729 |       const riskSlot = panel.locator('[data-slot="riskCounts"]')
  730 | 
  731 |       await expect(riskSlot).toBeVisible()
  732 |       // Unavailable cards must NOT use the empty-state styling or data-stat counters
  733 |       await expect(riskSlot.locator('.emptyst, [data-testid="dashboard-empty-state"]')).not.toBeVisible()
  734 |       await expect(riskSlot.locator('.data-stat')).not.toBeVisible()
  735 |     })
  736 | 
  737 |     test('legitimate zero headcount (FE-DASH-03) does not render an unavailable card in headcount slot', async ({ page }) => {
  738 |       await setupZeroHeadcountDashboard(page)
  739 |       await page.goto('/dashboards')
  740 | 
  741 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  742 |       const headcountCard = panel.getByTestId('dashboard-headcount-widget').or(panel.locator('[data-widget="headcount"]'))
  743 | 
  744 |       await expect(headcountCard).toBeVisible()
  745 |       await expect(headcountCard.locator('.data-stat').or(headcountCard.getByText('0', { exact: true }))).toBeVisible()
  746 |       // Headcount widget must NOT be marked or rendered as an unavailable card
  747 |       await expect(headcountCard.locator('[data-slot="riskCounts"], [data-slot="unitActionItems"], [data-slot="myActionItems"]')).not.toBeVisible()
  748 |       await expect(headcountCard.getByText(/unavailable|not implemented/i)).not.toBeVisible()
  749 |     })
  750 | 
  751 |     test('empty reporting scope (FE-DASH-03) renders .emptyst empty-state component and does not replace the table with an unavailable card', async ({
  752 |       page,
  753 |     }) => {
  754 |       await setupZeroHeadcountDashboard(page)
  755 |       await page.goto('/dashboards')
  756 | 
  757 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  758 |       const peopleTableSection = panel.getByTestId('dashboard-people-table-widget').or(panel.locator('[data-widget="people-table"]'))
  759 | 
  760 |       await expect(peopleTableSection).toBeVisible()
  761 |       // Empty scope renders .emptyst component
  762 |       const emptyState = peopleTableSection.locator('.emptyst, [data-testid="dashboard-empty-state"]')
  763 |       await expect(emptyState).toBeVisible()
  764 |       // Table container must NOT be replaced with an unavailable card
  765 |       await expect(peopleTableSection.locator('[data-slot="riskCounts"], [data-slot="unitActionItems"], [data-slot="myActionItems"], [data-slot="resourcingRequests"], [data-slot="openCampaigns"]')).not.toBeVisible()
  766 |     })
  767 |   })
  768 | 
  769 |   test.describe('FE-DASH-13 · Semantic structure, accessibility, responsive layout, and lack of customization for unavailable widget cards', () => {
  770 |     test('unavailable widget cards have semantic structure and accessible headings readable by screen readers', async ({
  771 |       page,
  772 |     }) => {
  773 |       await setupPopulatedDashboard(page)
> 774 |       await page.goto('/dashboards')
      |                  ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  775 | 
  776 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  777 |       const riskSlot = panel.locator('[data-slot="riskCounts"]')
  778 | 
  779 |       await expect(riskSlot).toBeVisible()
  780 |       // Must contain an accessible heading (h3, h4, or element with heading role)
  781 |       const heading = riskSlot.getByRole('heading').or(riskSlot.locator('h3, h4'))
  782 |       await expect(heading.first()).toBeVisible()
  783 |       await expect(heading.first()).toHaveText(/Risk/i)
  784 |     })
  785 | 
  786 |     test('unavailable widget cards maintain responsive grid layout without layout shifts or overflow', async ({ page }) => {
  787 |       await setupPopulatedDashboard(page)
  788 |       await page.goto('/dashboards')
  789 | 
  790 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  791 |       const riskSlot = panel.locator('[data-slot="riskCounts"]')
  792 | 
  793 |       await expect(riskSlot).toBeVisible()
  794 | 
  795 |       // Bounding box must fit within container client width (no horizontal overflow)
  796 |       const isLayoutStable = await riskSlot.evaluate((el) => {
  797 |         const rect = el.getBoundingClientRect()
  798 |         return rect.width > 0 && rect.height > 0 && el.scrollWidth <= el.clientWidth + 2
  799 |       })
  800 |       expect(isLayoutStable).toBe(true)
  801 |     })
  802 | 
  803 |     test('unavailable widget cards do not introduce interactive focus traps or unexpected tabbable descendants', async ({
  804 |       page,
  805 |     }) => {
  806 |       await setupPopulatedDashboard(page)
  807 |       await page.goto('/dashboards')
  808 | 
  809 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  810 |       const slotKeys = ['riskCounts', 'unitActionItems', 'myActionItems', 'resourcingRequests', 'openCampaigns'] as const
  811 | 
  812 |       // All five cards must exist and not contain focusable/tabbable interactive descendants
  813 |       for (const key of slotKeys) {
  814 |         const card = panel.locator(`[data-slot="${key}"]`)
  815 |         await expect(card).toBeVisible()
  816 | 
  817 |         const focusableDescendants = card.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
  818 |         await expect(focusableDescendants).toHaveCount(0)
  819 |       }
  820 |     })
  821 | 
  822 |     test('no customize handles, drag affordances, or remove buttons exist on unavailable cards', async ({ page }) => {
  823 |       await setupPopulatedDashboard(page)
  824 |       await page.goto('/dashboards')
  825 | 
  826 |       const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
  827 |       const slotKeys = ['riskCounts', 'unitActionItems', 'myActionItems', 'resourcingRequests', 'openCampaigns'] as const
  828 | 
  829 |       for (const key of slotKeys) {
  830 |         const card = panel.locator(`[data-slot="${key}"]`)
  831 |         await expect(card).toBeVisible()
  832 | 
  833 |         // Customization handles must be absent from unavailable cards (PM/AD-33, SD-1)
  834 |         await expect(card.locator('.drag, .drag-handle, [data-drag-handle]')).not.toBeVisible()
  835 |         await expect(card.locator('.rm, .remove-handle, [data-remove-widget]')).not.toBeVisible()
  836 |         await expect(card.getByRole('button', { name: /Add widget|Add to dashboard|Remove/i })).not.toBeVisible()
  837 |       }
  838 |     })
  839 |   })
  840 | })
  841 | 
  842 | 
  843 | 
```