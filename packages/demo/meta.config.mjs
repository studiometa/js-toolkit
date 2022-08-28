import { resolve, dirname } from 'node:path';
import { defineConfig } from '@studiometa/webpack-config';
import { prototyping } from '@studiometa/webpack-config/presets';

const { pathname } = new URL(import.meta.url);

export default defineConfig({
  presets: [prototyping()],
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@studiometa/js-toolkit': resolve(dirname(pathname), '../js-toolkit'),
    };

    config.cache = {
      ...(config.cache || {}),
      buildDependencies: {
        config: [pathname],
        toolkit: [resolve(dirname(pathname), '../js-toolkit')],
      },
    };
  },
});
