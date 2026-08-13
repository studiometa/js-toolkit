import codspeedPlugin from '@codspeed/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [codspeedPlugin()],
  test: {
    environment: 'happy-dom',
    include: ['src/__benchmarks__/**/*.bench.ts'],
    benchmark: {
      include: ['src/__benchmarks__/**/*.bench.ts'],
    },
  },
});
