import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '..',
    environment: 'happy-dom',
    // The v4 package brings its own runner: its specs sit next to the sources
    // and need a real browser, so they must not be collected here.
    exclude: [...configDefaults.exclude, 'v4/**'],
    alias: {
      '^#private/(.*)': '../js-toolkit/$1',
    },
    setupFiles: ['./tests/__utils__/happydom.ts'],
    coverage: {
      provider: 'v8',
      include: ['js-toolkit/**/*.ts'],
      exclude: ['**/tests/**/*.ts'],
    },
  },
});
