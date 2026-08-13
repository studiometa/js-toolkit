import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    // The specs sit next to the sources they cover, so the include list is the
    // whole `src/` tree minus the helpers and the benchmarks.
    include: ['src/**/*.spec.ts'],
    setupFiles: ['./src/__utils__/happydom.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/__utils__/**', 'src/__benchmarks__/**'],
    },
  },
});
