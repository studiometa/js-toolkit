import { resolve, dirname } from 'node:path';
import { build } from 'tsdown';

const pkgRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');

console.log('Building @studiometa/eslint-plugin-js-toolkit...');

// A single bundled entry: the plugin is loaded by oxlint/ESLint as one module, so
// there is nothing to gain from shipping the rule tree unbundled.
await build({
  entry: [resolve(pkgRoot, 'src/index.ts')],
  outDir: resolve(pkgRoot, 'dist'),
  format: 'esm',
  platform: 'node',
  // The package is ESM-only, so keep the plain `.js`/`.d.ts` extensions the
  // `exports` map points at instead of tsdown's `.mjs`/`.d.mts` default for node.
  fixedExtension: false,
  target: 'esnext',
  sourcemap: true,
  dts: true,
  clean: true,
  config: false,
  tsconfig: resolve(pkgRoot, 'tsconfig.build.json'),
  logLevel: 'silent',
});

console.log('Done!');
