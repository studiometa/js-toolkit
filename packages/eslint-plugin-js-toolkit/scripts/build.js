import { resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import esbuild from 'esbuild';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');

rmSync(resolve(root, 'dist'), { recursive: true, force: true });
console.log('Building @studiometa/eslint-plugin-js-toolkit...');

const { errors, warnings } = await esbuild.build({
  entryPoints: [resolve(root, 'src/index.ts')],
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
