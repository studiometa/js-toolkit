import { resolve } from 'node:path';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { decorators } from './vite-plugin-decorators.js';

const srcRoot = resolve(import.meta.dirname, 'src');

export default defineConfig({
  plugins: [decorators()],
  // Package-name specs use sources on a fresh checkout. The packed-package check
  // runs without these aliases and verifies the published `dist/` targets.
  resolve: {
    alias: [
      {
        find: /^@studiometa\/js-toolkit-v4\/utils\/(.+)$/,
        replacement: `${srcRoot}/subpaths/utils/$1.ts`,
      },
      {
        find: /^@studiometa\/js-toolkit-v4\/utils$/,
        replacement: `${srcRoot}/utils/index.ts`,
      },
      {
        find: /^@studiometa\/js-toolkit-v4\/(.+)$/,
        replacement: `${srcRoot}/subpaths/$1.ts`,
      },
      { find: /^@studiometa\/js-toolkit-v4$/, replacement: `${srcRoot}/index.ts` },
    ],
  },
  test: {
    include: ['src/**/*.spec.ts', 'migration/**/*.spec.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }],
    },
  },
});
