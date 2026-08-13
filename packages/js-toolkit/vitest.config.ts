import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The `exports` map points every public subpath at `dist/`; the `typescript`
  // condition points it at `src/`. The specs must exercise the sources, so a
  // stale or missing build can never change what they cover.
  resolve: {
    conditions: ['typescript'],
  },
  // The `node` environment specs (`*.server.spec.ts`) resolve through Vite's SSR
  // pipeline, which carries its own condition list. Without this they fall back
  // to the `import` condition and land on `dist/`, so they fail on any checkout
  // that has not been built.
  ssr: {
    resolve: {
      conditions: ['typescript'],
    },
  },
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
