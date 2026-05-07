import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    exclude: ['dist', 'node_modules'],
    coverage: {
      provider: 'v8',
      include: ['src/rules/**/*.ts', 'src/utils/**/*.ts'],
      exclude: ['**/*.test.ts'],
    },
  },
});
