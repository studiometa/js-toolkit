import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '..',
    alias: {
      '^#private/(.*)': '../js-toolkit/$1',
    },
    coverage: {
      provider: 'v8',
      include: ['js-toolkit/**'],
    },
    browser: {
      provider: 'playwright',
      enabled: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }],
    },
  },
});
