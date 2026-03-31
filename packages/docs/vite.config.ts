import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import llmstxt from 'vitepress-plugin-llms';

export default defineConfig({
  plugins: [
    tailwindcss(),
    llmstxt(),
  ],
  resolve: {
    alias: {
      '@studiometa/js-toolkit/utils': resolve('../js-toolkit/utils/index.ts'),
      '@studiometa/js-toolkit': resolve('../js-toolkit/index.ts'),
    },
  },
});
