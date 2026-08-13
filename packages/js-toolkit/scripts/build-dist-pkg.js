import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import glob from 'fast-glob';
import { buildDistExports, distDir } from './lib/subpath-exports.js';

const pkgRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const root = resolve(pkgRoot, '../..');
const distRoot = resolve(root, 'dist');

/**
 * Write the `dist/package.json` consumed when publishing.
 *
 * It mirrors the source manifest but rewrites the entrypoints and the `exports` map to point at the
 * emitted `.js`/`.d.ts` artefacts instead of the `.ts` sources. Every target sits under `distDir`,
 * where the build nests the modules. The grouped entries (`.`, `./utils`, `./package.json`) are
 * rewritten by hand; the per-symbol subpath entries come from the shared enumerator (an explicit,
 * closed surface — no `./*` wildcard).
 */
function writeDistPackage() {
  console.log('Writing dist/package.json...');
  const pkg = JSON.parse(readFileSync(resolve(pkgRoot, 'package.json'), 'utf8'));

  pkg.main = `./${distDir}/index.js`;
  pkg.module = `./${distDir}/index.js`;
  pkg.types = `./${distDir}/index.d.ts`;
  pkg.exports = {
    '.': {
      import: `./${distDir}/index.js`,
      types: `./${distDir}/index.d.ts`,
      default: `./${distDir}/index.js`,
    },
    './utils': {
      import: `./${distDir}/utils/index.js`,
      types: `./${distDir}/utils/index.d.ts`,
      default: `./${distDir}/utils/index.js`,
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

/**
 * Assert no emitted module sits at the path of a subpath key.
 *
 * A CDN which names its build output after the requested subpath — esm.sh does — gives the same URL
 * to the `./utils/debounce` entry and to the `utils/debounce.js` module it re-exports. The stub then
 * imports itself, and every consumer of that URL dies on
 * `SyntaxError: Detected cycle while resolving name`. Nesting the build under `distDir` keeps the two
 * path spaces disjoint; this check fails the build if anything ever breaks that guarantee.
 */
function assertNoSubpathShadowing() {
  console.log('Checking subpath keys against the emitted files...');
  const files = new Set(
    glob
      .globSync('**/*', { cwd: distRoot, onlyFiles: true })
      .map((file) => file.replace(/\\/g, '/')),
  );
  const shadowed = [];

  for (const key of Object.keys(
    JSON.parse(readFileSync(resolve(distRoot, 'package.json'), 'utf8')).exports,
  )) {
    if (key === '.' || key === './package.json') continue;
    const path = key.slice('./'.length);
    for (const extension of ['.js', '.mjs', '.d.ts']) {
      if (files.has(`${path}${extension}`)) shadowed.push(`${key} ↔ ${path}${extension}`);
    }
  }

  if (shadowed.length) {
    console.error(
      'Subpath keys shadowed by an emitted module — CDNs naming their output after the requested',
    );
    console.error('subpath would serve a module which imports itself:');
    for (const entry of shadowed) console.error(`  ${entry}`);
    process.exit(1);
  }

  console.log(`Done, no shadowing among ${files.size} emitted files.`);
}

writeDistPackage();
assertNoSubpathShadowing();
