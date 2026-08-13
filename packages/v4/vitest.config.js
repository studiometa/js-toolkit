import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { decorators } from './vite-plugin-decorators.js';

export default defineConfig({
  plugins: [decorators()],
  // `exports` points every subpath at `dist/`; the `typescript` condition points
  // it at `src/`. `exports.spec.ts` imports the package by name, so without this
  // it resolves to a build that does not exist on a fresh checkout.
  resolve: {
    conditions: ['typescript'],
  },
  ssr: {
    resolve: {
      conditions: ['typescript'],
    },
  },
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
