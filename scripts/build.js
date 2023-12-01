import { resolve, dirname } from 'node:path';
import glob from 'fast-glob';
import esbuild from 'esbuild';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');

const options = {
  entryPoints: glob.globSync(['packages/js-toolkit/**/*.ts', '!**/node_modules/**'], {
    cwd: root,
  }),
  write: true,
  outdir: resolve(root, 'dist'),
  target: 'esnext',
  format: 'esm',
  sourcemap: true,
};

console.log(`Building...`);
const { errors, warnings } = await esbuild.build(options);

errors.forEach(console.error);
warnings.forEach(console.warn);

console.log(`Done building!`);
