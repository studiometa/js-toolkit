import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { decorators } from './vite-plugin-decorators.js';

/**
 * Benchmarks answering design questions, run in a real browser because the
 * APIs they measure — `matchMedia`, `ResizeObserver`, `AbortSignal`, the
 * mutation observer driving the registry — have no meaningful cost in an
 * emulated DOM.
 *
 * CodSpeed's simulation mode cannot instrument these: its plugin forces
 * `pool: "forks"` and measures the Node process, while a browser-mode
 * benchmark body runs in Chromium over CDP. Regressions are caught instead by
 * `.github/actions/bench-diff`, which runs this suite for the base and the
 * head commit on one runner and comments the difference.
 *
 * `V4_BENCH_SIZES` narrows the at-scale suite — CI compares a subset so the
 * job stays inside a few minutes.
 */
const sizes = (process.env.V4_BENCH_SIZES ?? '100,1000,5000')
  .split(',')
  .map((size) => Number(size.trim()))
  .filter((size) => Number.isFinite(size) && size > 0);

export default defineConfig({
  plugins: [decorators()],
  define: { __BENCH_SIZES__: JSON.stringify(sizes) },
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
