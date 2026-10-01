import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 1,

  // Maximum time limits for public demo sites; these do not add fixed waits.
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  outputDir: 'test-results',

  use: {
    viewport: {
      width: 1920,
      height: 1080,
    },
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {
          width: 1920,
          height: 1080,
        },
      },
    },
  ],
});
