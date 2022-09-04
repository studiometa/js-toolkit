// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  optimizeDeps: {
    include: ['@studiometa/js-toolkit'],
  },
  plugins: [
    {
      name: 'add-common-js-package-plugin',
      writeBundle(viteConfig) {
        if (viteConfig.format === 'cjs' && viteConfig.esModule) {
          fs.writeFileSync(
            path.join(viteConfig.dir, 'package.json'),
            JSON.stringify({ type: 'commonjs' }),
          );
        }
      },
    },
  ],
  resolve: {
    alias: {
      './VPNavBarTitle.vue': path.resolve('.vitepress/theme/components/NavBarTitle.vue'),
      './VPNavBarSearch.vue': path.resolve('.vitepress/theme/components/SearchBtn.vue'),
    },
  },
});
