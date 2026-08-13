import { resolve, dirname } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Replace the `__VERSION__` placeholder with the real version in the built
 * entry files.
 *
 * This runs against `dist/` (not the tracked source), so the placeholder always
 * stays in the repository and a local build can never commit a stale version
 * string. Both the JavaScript output and the type declaration are patched, so
 * the exact published version shows up at runtime and in editors.
 */
const pkgRoot = resolve(dirname(new URL(import.meta.url).pathname), '../..');
const { version: manifestVersion } = JSON.parse(
  readFileSync(resolve(pkgRoot, 'package.json'), 'utf8'),
);
const version = process.env.npm_package_version ?? manifestVersion;

for (const file of ['dist/version.js', 'dist/version.d.ts']) {
  const path = resolve(pkgRoot, file);
  const content = readFileSync(path, { encoding: 'UTF-8' });
  if (!content.includes('__VERSION__')) {
    throw new Error(`set-version: could not find the '__VERSION__' placeholder in ${file}`);
  }
  writeFileSync(path, content.replaceAll('__VERSION__', version), { encoding: 'UTF-8' });
}
