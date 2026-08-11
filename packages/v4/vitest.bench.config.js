import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { decorators } from './vite-plugin-decorators.js';

/**
 * Benchmarks answering design questions, run in a real browser because the
 * APIs they measure — `matchMedia`, `ResizeObserver`, `AbortSignal` — have
 * no meaningful cost in an emulated DOM. Deliberately separate from the
 * CodSpeed suite in `packages/tests`, which guards against regressions.
 */
export default defineConfig({
  plugins: [decorators()],
  test: {
    include: ['src/**/*.bench.ts'],
    benchmark: { include: ['src/**/*.bench.ts'] },
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }],
    },
  },
});
