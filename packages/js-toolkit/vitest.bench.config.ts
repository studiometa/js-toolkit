import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
// The cross-version benchmarks import v4 sources, which use stage-3
// decorators. Vite's TypeScript transformer does not lower them, so v4's SWC
// plugin is reused here rather than copied: one transform, one place to fix.
import { decorators } from '../v4/vite-plugin-decorators.js';

/**
 * Benchmarks run in a real Chromium, not in Node with happy-dom.
 *
 * v4's suite already runs in a browser. A v3-against-v4 number measured with
 * v3 in an emulated DOM and v4 in a real one compares two environments, not
 * two frameworks — and the emulated one is the wrong answer anyway: v3's
 * `SmartQueue` yields through `setTimeout`, whose clamping, and the long-task
 * accounting that goes with it, only exist in a browser.
 *
 * Two modes share this config:
 * - `vitest bench` runs `*.bench.ts`, the wall-clock suite that
 *   `.github/actions/bench-diff` tracks.
 * - `vitest run` runs `*.profile.ts`, which reports the blocking profile a
 *   throughput number cannot show.
 *
 * `V3_BENCH_SIZES` sets the at-scale sizes. The default stops at 1 000 to keep
 * a run bounded: 5 000 costs both versions minutes of samples, so it belongs
 * in a report rather than in every run.
 */
const sizes = (process.env.V3_BENCH_SIZES ?? '100,1000')
  .split(',')
  .map((size) => Number(size.trim()))
  .filter((size) => Number.isFinite(size) && size > 0);

export default defineConfig({
  plugins: [decorators()],
  // The benchmarks import the package by name, like the specs do, so they need
  // the same condition to reach the sources instead of an unbuilt `dist/`.
  resolve: {
    conditions: ['typescript'],
  },
  define: { __BENCH_SIZES__: JSON.stringify(sizes) },
  test: {
    // Files share the browser's one main thread. Sampled in parallel they
    // measure each other, which for a mounting benchmark is most of the
    // signal.
    fileParallelism: false,
    include: ['src/__benchmarks__/**/*.profile.ts'],
    benchmark: {
      include: ['src/__benchmarks__/**/*.bench.ts'],
    },
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }],
    },
  },
});
