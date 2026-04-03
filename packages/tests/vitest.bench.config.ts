import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '..',
    environment: 'happy-dom',
    alias: {
      '^#private/(.*)': '../js-toolkit/$1',
    },
    include: ['tests/__benchmarks__/**/*.bench.ts'],
    benchmark: {
      include: ['tests/__benchmarks__/**/*.bench.ts'],
    },
  },
});
