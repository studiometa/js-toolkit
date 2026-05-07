import { resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import esbuild from 'esbuild';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');

console.log('Building @studiometa/oxlint-plugin-js-toolkit...');

const { errors, warnings } = await esbuild.build({
  entryPoints: [resolve(root, 'index.ts')],
  bundle: true,
  write: true,
  outdir: resolve(root, 'dist'),
  target: 'esnext',
  format: 'esm',
  sourcemap: true,
  platform: 'node',
});

errors.forEach(console.error);
warnings.forEach(console.warn);

console.log('Emitting types...');
execSync('tsc --build tsconfig.json', { cwd: root, stdio: 'inherit' });

console.log('Done!');
