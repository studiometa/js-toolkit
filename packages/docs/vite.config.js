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
    {
      name: 'try-ts-files',
      resolveId(id, importer) {
        if (importer.includes('packages/js-toolkit/utils/css/') && id === './utils.js') {
          return path.join(path.dirname(importer), 'utils.ts');
        }

        if (importer.includes('packages/js-toolkit/services/') && id === '../utils/index.js') {
          return path.resolve(path.dirname(importer), '../utils/index.ts');
        }

        return null;
      },
    },
  ],
  resolve: {
    alias: {
      '@studiometa/js-toolkit/utils': path.resolve('../js-toolkit/utils/index.ts'),
      '@studiometa/js-toolkit': path.resolve('../js-toolkit/index.ts'),
      './VPNavBarTitle.vue': path.resolve('.vitepress/theme/components/NavBarTitle.vue'),
    },
  },
});
