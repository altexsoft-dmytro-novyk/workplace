# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: services/frontend/e2e/flows/dashboards/dashboards.spec.ts >> People Management Dashboards — Unit Manager (Story 2.1 / PMC-E2-S2.1) >> FE-DASH-05 · Active headcount rendering >> faithfully renders the active headcount value supplied by the read model
- Location: services/frontend/e2e/flows/dashboards/dashboards.spec.ts:203:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/dashboards", waiting until "load"

```

# Test source

```ts
  105 |       await expect(dashboardPanel.getByRole('link', { name: /All Employees/i })).toBeVisible()
  106 |       await expect(dashboardPanel.getByRole('link', { name: /Saved Views/i })).toBeVisible()
  107 |     })
  108 |   })
  109 | 
  110 |   test.describe('FE-DASH-02 · Dashboard loading state with Skeleton placeholders', () => {
  111 |     test('loading state renders Skeleton placeholders matching widget grid and table layout', async ({ page }) => {
  112 |       await setupLoadingDashboard(page)
  113 |       await page.goto('/dashboards')
  114 | 
  115 |       // Skeletons are visible matching layout
  116 |       const skeletons = page.locator('[data-skeleton="true"]').or(page.locator('.animate-pulse'))
  117 |       await expect(skeletons.first()).toBeVisible()
  118 |     })
  119 | 
  120 |     test('loading state does not render fake numeric values, NaN, or temporary zeros', async ({ page }) => {
  121 |       await setupLoadingDashboard(page)
  122 |       await page.goto('/dashboards')
  123 | 
  124 |       // Ensure no flash of NaN or raw numbers
  125 |       await expect(page.getByText('NaN')).not.toBeVisible()
  126 |       await expect(page.getByText('undefined')).not.toBeVisible()
  127 |       await expect(page.locator('.data-stat')).not.toBeVisible()
  128 |     })
  129 |   })
  130 | 
  131 |   test.describe('FE-DASH-03 · Legitimate zero headcount and empty scope', () => {
  132 |     test('measured zero headcount renders as 0 in data-stat mono with .wscope footer', async ({ page }) => {
  133 |       await setupZeroHeadcountDashboard(page)
  134 |       await page.goto('/dashboards')
  135 | 
  136 |       const headcountCard = page.getByTestId('dashboard-headcount-widget').or(page.locator('[data-widget="headcount"]'))
  137 |       await expect(headcountCard).toBeVisible()
  138 | 
  139 |       // Must display '0' as a legitimate measured value
  140 |       const zeroStat = headcountCard.getByText('0', { exact: true })
  141 |       await expect(zeroStat).toBeVisible()
  142 | 
  143 |       // Must have .wscope footer on headcount card
  144 |       const headcountWscope = headcountCard.locator('.wscope, [data-slot="widget-scope-footer"]').filter({
  145 |         hasText: /SCOPE: REPORTING_LINE/i,
  146 |       })
  147 |       await expect(headcountWscope).toBeVisible()
  148 |     })
  149 | 
  150 |     test('empty reporting scope renders the empty-state component instead of an error or table rows', async ({ page }) => {
  151 |       await setupZeroHeadcountDashboard(page)
  152 |       await page.goto('/dashboards')
  153 | 
  154 |       // .emptyst empty state component is rendered
  155 |       const emptyState = page.locator('.emptyst').or(page.getByTestId('dashboard-empty-state'))
  156 |       await expect(emptyState).toBeVisible()
  157 | 
  158 |       // No employee rows rendered
  159 |       await expect(page.getByText('Alice Smith')).not.toBeVisible()
  160 |     })
  161 | 
  162 |     test('zero is distinguishable from unavailable widget states', async ({ page }) => {
  163 |       await setupZeroHeadcountDashboard(page)
  164 |       await page.goto('/dashboards')
  165 | 
  166 |       const headcountCard = page.getByTestId('dashboard-headcount-widget').or(page.locator('[data-widget="headcount"]'))
  167 |       // Headcount widget is NOT shown as unavailable
  168 |       await expect(headcountCard.getByText(/unavailable/i)).not.toBeVisible()
  169 |       await expect(headcountCard.getByText('0', { exact: true })).toBeVisible()
  170 |     })
  171 |   })
  172 | 
  173 |   test.describe('FE-DASH-04 · Scope correctness and reporting-line isolation', () => {
  174 |     test('renders all reporting-line employee rows supplied by the read model', async ({ page }) => {
  175 |       await setupPopulatedDashboard(page)
  176 |       await page.goto('/dashboards')
  177 | 
  178 |       for (const row of mockPopulatedUnitManagerDashboard.peopleTable.data.rows) {
  179 |         await expect(page.getByText(`${row.firstName} ${row.lastName}`)).toBeVisible()
  180 |       }
  181 |     })
  182 | 
  183 |     test('does not add or fabricate employees outside the supplied read model', async ({ page }) => {
  184 |       await setupPopulatedDashboard(page)
  185 |       await page.goto('/dashboards')
  186 | 
  187 |       // An unentitled employee not in the read model must not appear
  188 |       await expect(page.getByText('Unknown Outside Employee')).not.toBeVisible()
  189 |       await expect(page.getByText('Unassigned Colleague')).not.toBeVisible()
  190 |     })
  191 | 
  192 |     test('renders the evaluated scope policy label and .wscope footer correctly', async ({ page }) => {
  193 |       await setupPopulatedDashboard(page)
  194 |       await page.goto('/dashboards')
  195 | 
  196 |       const wscopeElements = page.locator('.wscope, [data-slot="widget-scope-footer"]')
  197 |       await expect(wscopeElements.first()).toBeVisible()
  198 |       await expect(wscopeElements.first()).toContainText('SCOPE: REPORTING_LINE')
  199 |     })
  200 |   })
  201 | 
  202 |   test.describe('FE-DASH-05 · Active headcount rendering', () => {
  203 |     test('faithfully renders the active headcount value supplied by the read model', async ({ page }) => {
  204 |       await setupPopulatedDashboard(page)
> 205 |       await page.goto('/dashboards')
      |                  ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  206 | 
  207 |       const headcountCard = page.getByTestId('dashboard-headcount-widget').or(page.locator('[data-widget="headcount"]'))
  208 |       await expect(headcountCard).toContainText('3')
  209 |     })
  210 | 
  211 |     test('renders the headcount metric in data-stat mono with .wscope footer', async ({ page }) => {
  212 |       await setupPopulatedDashboard(page)
  213 |       await page.goto('/dashboards')
  214 | 
  215 |       const headcountCard = page.getByTestId('dashboard-headcount-widget').or(page.locator('[data-widget="headcount"]'))
  216 |       const statElem = headcountCard.locator('.data-stat').or(headcountCard.getByText('3', { exact: true }))
  217 |       await expect(statElem).toBeVisible()
  218 |       await expect(
  219 |         headcountCard.locator('.wscope, [data-slot="widget-scope-footer"]').filter({
  220 |           hasText: /SCOPE: REPORTING_LINE/i,
  221 |         })
  222 |       ).toBeVisible()
  223 |     })
  224 | 
  225 |     test('does not recompute or alter the supplied headcount value on the client', async ({ page }) => {
  226 |       // Pass a specific count in the read model
  227 |       await setupPopulatedDashboard(page, {
  228 |         headcount: {
  229 |           status: 'available',
  230 |           data: {
  231 |             count: 42,
  232 |             wscope: 'SCOPE: REPORTING_LINE',
  233 |           },
  234 |         },
  235 |       })
  236 |       await page.goto('/dashboards')
  237 | 
  238 |       const headcountCard = page.getByTestId('dashboard-headcount-widget').or(page.locator('[data-widget="headcount"]'))
  239 |       await expect(headcountCard).toContainText('42')
  240 |     })
  241 |   })
  242 | 
  243 |   test.describe('FE-DASH-06 · Tier-safe people table and uncovered columns', () => {
  244 |     test('renders shared read model fields permitted for reporting tier', async ({ page }) => {
  245 |       await setupPopulatedDashboard(page)
  246 |       await page.goto('/dashboards')
  247 | 
  248 |       const table = page.getByRole('table').or(page.getByTestId('dashboard-people-table'))
  249 |       await expect(table).toBeVisible()
  250 | 
  251 |       // Select deterministic employee row to verify projection without relying on globally unique field values
  252 |       const aliceRow = table.getByRole('row').filter({ hasText: 'Alice Smith' })
  253 |       await expect(aliceRow).toBeVisible()
  254 |       await expect(aliceRow.getByText('Alice Smith')).toBeVisible()
  255 |       await expect(aliceRow.getByText('Senior Engineer')).toBeVisible()
  256 |       await expect(aliceRow.getByText('L4')).toBeVisible()
  257 |       await expect(aliceRow.getByText('Full-time')).toBeVisible()
  258 |     })
  259 | 
  260 |     test('handles uncovered project, leave, and risk columns via explicit unavailable states or column omission', async ({
  261 |       page,
  262 |     }) => {
  263 |       // 1. Case A: With explicitly declared unavailable columns
  264 |       await setupPopulatedDashboard(page)
  265 |       await page.goto('/dashboards')
  266 | 
  267 |       const table = page.getByRole('table').or(page.getByTestId('dashboard-people-table'))
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
```