# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: services/frontend/e2e/flows/dashboards/dashboards.spec.ts >> People Management Dashboards — Unit Manager (Story 2.1 / PMC-E2-S2.1) >> FE-DASH-07 · Dashboard access denial and unauthenticated handling >> unauthenticated 401 response triggers the application global unauthenticated redirect handler
- Location: services/frontend/e2e/flows/dashboards/dashboards.spec.ts:328:5

# Error details

```
Error: browserType.launch: Executable doesn't exist at /tmp/cursor-sandbox-cache/10c32dff435630c8eebd6c49ba80e796/playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```