import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '..',
    environment: 'happy-dom',
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
