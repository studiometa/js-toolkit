import { resolve, dirname } from 'node:path';
import glob from 'fast-glob';
import esbuild from 'esbuild';
import { distDir } from './lib/subpath-exports.js';

const pkgRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const root = resolve(pkgRoot, '../..');
const { npm_package_version: version = 'dev' } = process.env;

console.log(`Building ${version}...`);
const { errors, warnings } = await esbuild.build({
  entryPoints: glob.globSync(
    [
      '**/*.ts',
      '!**/node_modules/**',
      '!**/*.d.ts',
      '!**/*.spec.ts',
      '!__utils__/**',
      '!__benchmarks__/**',
      '!**/__snapshots__/**',
    ],
    { cwd: resolve(pkgRoot, 'src'), absolute: true },
  ),
  write: true,
  // The modules are nested one level deeper than the package root, see `distDir`.
  outdir: resolve(root, 'dist', distDir),
  target: 'esnext',
  format: 'esm',
  sourcemap: true,
});

errors.forEach(console.error);
warnings.forEach(console.warn);

console.log(`Done building!`);
