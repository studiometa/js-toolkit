import { resolve, dirname } from 'node:path';
import { build } from 'tsdown';

const packageRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const fixtureRoot = resolve(packageRoot, 'test/.runtime');

const options = {
  format: 'esm',
  platform: 'browser',
  target: 'esnext',
  config: false,
  dts: false,
  deps: { alwaysBundle: ['morphdom'], onlyBundle: false },
  sourcemap: false,
  clean: true,
  logLevel: 'silent',
};

await Promise.all([
  build({
    ...options,
    entry: [resolve(packageRoot, 'test/runtime-copy-a.ts')],
    outDir: resolve(fixtureRoot, 'copy-a'),
  }),
  build({
    ...options,
    entry: [resolve(packageRoot, 'test/runtime-copy-b.ts')],
    outDir: resolve(fixtureRoot, 'copy-b'),
  }),
]);
