import codspeedPlugin from '@codspeed/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [codspeedPlugin()],
  // The benchmarks import the package by name, like the specs do, so they need
  // the same condition to reach the sources instead of an unbuilt `dist/`.
  resolve: {
    conditions: ['typescript'],
  },
  ssr: {
    resolve: {
      conditions: ['typescript'],
    },
  },
  test: {
    environment: 'happy-dom',
    fileParallelism: true,
    maxWorkers: 4,
    include: ['src/__benchmarks__/**/*.bench.ts'],
    benchmark: {
      include: ['src/__benchmarks__/**/*.bench.ts'],
    },
  },
});
