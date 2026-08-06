import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { buildDistExports } from './lib/subpath-exports.js';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const pkgRoot = resolve(root, 'packages/js-toolkit');
const distRoot = resolve(root, 'dist');

/**
 * Write the `dist/package.json` consumed when publishing.
 *
 * It mirrors the source manifest but rewrites the entrypoints and the `exports` map to point at the
 * emitted `.js`/`.d.ts` artefacts instead of the `.ts` sources. The grouped entries (`.`, `./utils`,
 * `./package.json`) are rewritten by hand; the per-symbol subpath entries come from the shared
 * enumerator (an explicit, closed surface — no `./*` wildcard).
 */
function writeDistPackage() {
  console.log('Writing dist/package.json...');
  const pkg = JSON.parse(readFileSync(resolve(pkgRoot, 'package.json'), 'utf8'));

  pkg.main = './index.js';
  pkg.module = './index.js';
  pkg.types = './index.d.ts';
  pkg.exports = {
    '.': {
      import: './index.js',
      types: './index.d.ts',
      default: './index.js',
    },
    './utils': {
      import: './utils/index.js',
      types: './utils/index.d.ts',
      default: './utils/index.js',
    },
    './package.json': './package.json',
    ...buildDistExports(),
  };

  const json = `${JSON.stringify(pkg, null, 2)}\n`;
  writeFileSync(resolve(distRoot, 'package.json'), json);
  console.log(json);

  for (const file of ['LICENSE', 'README.md']) {
    const source = resolve(root, file);
    if (existsSync(source)) {
      copyFileSync(source, resolve(distRoot, file));
    }
  }

  console.log('Done writing dist/package.json!');
}

writeDistPackage();
