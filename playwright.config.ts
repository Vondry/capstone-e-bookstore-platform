import { defineConfig, devices } from '@playwright/test';

/**
 * E2E test suite.
 * - Default / mock mode: against Vite dev server (port 5173), MSW answers API requests.
 * - Live mode: every spec on desktop against Vite dev:live (port 5174) and the seeded Medusa
 *   backend at http://localhost:9100 (`npm run live:env` writes its publishable key first).
 *
 * Viewports follow .bob/rules/05-testing.md: mobile 375×812, tablet 768×1024, desktop 1440×900.
 * Every spec runs on desktop; the golden path and responsive checks also run on mobile and tablet.
 * See https://playwright.dev/docs/test-configuration.
 */
const crossDeviceSpecs = /(golden-path|responsive)\.spec\.ts$/;

const isLive = process.argv.includes('--project=live') || process.env.E2E_LIVE === 'true';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: !isLive,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: isLive ? 1 : process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: isLive ? 'http://localhost:5174' : 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      testIgnore: isLive ? /.*/ : undefined,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      testMatch: isLive ? [] : crossDeviceSpecs,
      use: { ...devices['iPhone 12'], viewport: { width: 375, height: 812 } },
    },
    {
      name: 'tablet',
      testMatch: isLive ? [] : crossDeviceSpecs,
      use: { ...devices['iPad Pro'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'live',
      testMatch: isLive ? /\.spec\.ts$/ : [],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        baseURL: 'http://localhost:5174',
      },
    },
  ],

  webServer: isLive
    ? {
        command: 'npm run dev:live -- --port 5174 --strictPort',
        url: 'http://localhost:5174',
        reuseExistingServer: !process.env.CI,
        env: { BROWSER: 'none' },
      }
    : {
        command: 'npm run dev -- --strictPort',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        env: { BROWSER: 'none' },
      },
});
