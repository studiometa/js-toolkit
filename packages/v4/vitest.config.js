import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { decorators } from './vite-plugin-decorators.js';

export default defineConfig({
  plugins: [decorators()],
  test: {
    include: ['src/**/*.spec.ts', 'migration/**/*.spec.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }],
    },
  },
});
