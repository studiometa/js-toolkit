import codspeedPlugin from '@codspeed/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [codspeedPlugin()],
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
