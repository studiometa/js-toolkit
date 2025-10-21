import { resolve, dirname } from 'node:path';
import glob from 'fast-glob';
import esbuild from 'esbuild';
import { setVersion } from './utils/set-version.js';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const { npm_package_version: version = 'dev' } = process.env;

setVersion(version);

console.log(`Building ${version}...`);
const { errors, warnings } = await esbuild.build({
  entryPoints: glob.globSync(['packages/js-toolkit/**/*.ts', '!**/node_modules/**'], {
    cwd: root,
  }),
  write: true,
  outdir: resolve(root, 'dist'),
  target: 'esnext',
  format: 'esm',
  sourcemap: true,
});

errors.forEach(console.error);
warnings.forEach(console.warn);

console.log(`Done building!`);
