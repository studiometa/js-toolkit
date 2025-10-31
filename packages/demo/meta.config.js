import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { defineConfig } from '@studiometa/webpack-config';
import { prototyping } from '@studiometa/webpack-config-preset-prototyping';

export default defineConfig({
  presets: [
    prototyping({
      ts: true,
      twig: {
        namespaces: {
          ui: dirname(fileURLToPath(import.meta.resolve('@studiometa/ui'))),
        },
      },
    }),
  ],
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@studiometa/js-toolkit': resolve('../js-toolkit'),
    };

    config.cache = {
      ...config.cache,
      buildDependencies: {
        config: [import.meta.filename],
        toolkit: [resolve('../js-toolkit')],
      },
    };
    config.cache = false;
  },
});
