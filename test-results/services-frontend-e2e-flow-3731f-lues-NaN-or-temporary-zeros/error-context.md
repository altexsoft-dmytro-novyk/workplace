# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: services/frontend/e2e/flows/dashboards/dashboards.spec.ts >> People Management Dashboards — Unit Manager (Story 2.1 / PMC-E2-S2.1) >> FE-DASH-02 · Dashboard loading state with Skeleton placeholders >> loading state does not render fake numeric values, NaN, or temporary zeros
- Location: services/frontend/e2e/flows/dashboards/dashboards.spec.ts:120:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/dashboards", waiting until "load"

```

# Test source

```ts
  22  |       await expect(header).toBeVisible()
  23  |       await expect(header).toContainText('WORKSPACE / DASHBOARDS')
  24  | 
  25  |       // .prov tag stating live resolution scoped to dashboard header
  26  |       const provTag = header.locator('.prov')
  27  |       await expect(provTag).toBeVisible()
  28  |       await expect(provTag).toContainText('SCOPE RESOLVED LIVE PER REQUEST')
  29  | 
  30  |       // Unit Manager preset tab active
  31  |       const umTab = page.getByRole('tab', { name: /Unit Manager/i })
  32  |       await expect(umTab).toBeVisible()
  33  |       await expect(umTab).toHaveAttribute('aria-selected', 'true')
  34  | 
  35  |       // Grouping dimension control has People active with aria / data-state verification
  36  |       const peopleGrouping = page
  37  |         .getByRole('button', { name: /People/i })
  38  |         .or(page.getByRole('tab', { name: /People/i }))
  39  |         .or(page.getByRole('radio', { name: /People/i }))
  40  |         .or(page.locator('[data-grouping="people"]'))
  41  |       await expect(peopleGrouping).toBeVisible()
  42  | 
  43  |       const isGroupingActive = await peopleGrouping.evaluate((el) => {
  44  |         return (
  45  |           el.getAttribute('aria-pressed') === 'true' ||
  46  |           el.getAttribute('aria-selected') === 'true' ||
  47  |           el.getAttribute('aria-checked') === 'true' ||
  48  |           el.getAttribute('data-state') === 'active' ||
  49  |           el.getAttribute('data-state') === 'on' ||
  50  |           el.classList.contains('active')
  51  |         )
  52  |       })
  53  |       expect(isGroupingActive).toBe(true)
  54  |     })
  55  | 
  56  |     test('renders active headcount in data-stat mono with .wscope footer', async ({ page }) => {
  57  |       await setupPopulatedDashboard(page)
  58  |       await page.goto('/dashboards')
  59  | 
  60  |       const headcountCard = page.getByTestId('dashboard-headcount-widget').or(page.locator('[data-widget="headcount"]'))
  61  |       await expect(headcountCard).toBeVisible()
  62  | 
  63  |       // Count value rendered in mono typography
  64  |       const countStat = headcountCard.locator('.data-stat').or(headcountCard.getByText('3', { exact: true }))
  65  |       await expect(countStat).toBeVisible()
  66  | 
  67  |       // .wscope footer belonging to headcount card
  68  |       const wscope = headcountCard.locator('.wscope, [data-slot="widget-scope-footer"]').filter({
  69  |         hasText: /SCOPE: REPORTING_LINE/i,
  70  |       })
  71  |       await expect(wscope).toBeVisible()
  72  |     })
  73  | 
  74  |     test('renders tier-projected people table rows for reporting-line employees with .wscope footer', async ({ page }) => {
  75  |       await setupPopulatedDashboard(page)
  76  |       await page.goto('/dashboards')
  77  | 
  78  |       const tableContainer = page
  79  |         .getByTestId('dashboard-people-table-widget')
  80  |         .or(page.locator('[data-widget="people-table"]'))
  81  |         .or(page.locator('section').filter({ has: page.getByRole('table') }))
  82  |       await expect(tableContainer).toBeVisible()
  83  | 
  84  |       const table = tableContainer.getByRole('table').or(page.getByTestId('dashboard-people-table'))
  85  |       await expect(table).toBeVisible()
  86  | 
  87  |       // Rows for reporting-line employees
  88  |       await expect(table.getByText('Alice Smith')).toBeVisible()
  89  |       await expect(table.getByText('Bob Jones')).toBeVisible()
  90  |       await expect(table.getByText('Charlie Brown')).toBeVisible()
  91  | 
  92  |       // .wscope footer scoped specifically to the people-table container (not matching headcount wscope)
  93  |       const tableWscope = tableContainer.locator('.wscope, [data-slot="widget-scope-footer"]').filter({
  94  |         hasText: /SCOPE: REPORTING_LINE/i,
  95  |       })
  96  |       await expect(tableWscope).toBeVisible()
  97  |     })
  98  | 
  99  |     test('displays navigation shortcuts to related modules', async ({ page }) => {
  100 |       await setupPopulatedDashboard(page)
  101 |       await page.goto('/dashboards')
  102 | 
  103 |       // Scope navigation shortcuts to the Dashboard content panel
  104 |       const dashboardPanel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
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
> 122 |       await page.goto('/dashboards')
      |                  ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
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
  205 |       await page.goto('/dashboards')
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
```