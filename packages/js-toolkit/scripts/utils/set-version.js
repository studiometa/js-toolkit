import { resolve, dirname } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { distDir } from '../lib/subpath-exports.js';

/**
 * Replace the `__VERSION__` placeholder with the real version in the built
 * entry files.
 *
 * This runs against `dist/` (not the tracked source), so the placeholder always
 * stays in the repository and a local build can never commit a stale version
 * string. Both the JavaScript output and the type declaration are patched, so
 * the exact published version shows up at runtime and in editors.
 */
const version = process.env.npm_package_version ?? 'dev';
const root = resolve(dirname(new URL(import.meta.url).pathname), '../../../..');

for (const file of [`dist/${distDir}/version.js`, `dist/${distDir}/version.d.ts`]) {
  const path = resolve(root, file);
  const content = readFileSync(path, { encoding: 'UTF-8' });
  if (!content.includes('__VERSION__')) {
    throw new Error(`set-version: could not find the '__VERSION__' placeholder in ${file}`);
  }
  writeFileSync(path, content.replaceAll('__VERSION__', version), { encoding: 'UTF-8' });
}
