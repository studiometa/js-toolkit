import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { enumerate, stubSource, buildSourceExports } from './lib/subpath-exports.js';

const pkgRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const subpathsDir = resolve(pkgRoot, 'src/subpaths');

/**
 * Write the per-symbol subpath stub modules into `packages/js-toolkit/src/subpaths/`.
 *
 * The directory is git-ignored and regenerated from scratch on every build/test/lint run, so it
 * never drifts and never pollutes the working tree. Every stub is a pure re-export, keeping the
 * `sideEffects: false` guarantee intact and every subpath tree-shakeable.
 */
function generate() {
  const { root, utils } = enumerate();

  rmSync(subpathsDir, { recursive: true, force: true });
  mkdirSync(resolve(subpathsDir, 'utils'), { recursive: true });

  for (const symbol of root) {
    writeFileSync(resolve(subpathsDir, `${symbol.fileBase}.ts`), stubSource(symbol));
  }
  for (const symbol of utils) {
    writeFileSync(resolve(subpathsDir, 'utils', `${symbol.fileBase}.ts`), stubSource(symbol));
  }

  console.log(
    `Generated ${root.length + utils.length} subpath stubs (${root.length} root, ${utils.length} utils).`,
  );
}

/**
 * Verify the committed source `package.json` `exports` map still lists exactly the enumerated
 * subpath entries. Used by the contract test to catch drift when a barrel export is added or
 * removed without regenerating the map.
 */
function check() {
  const pkgPath = resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const expected = buildSourceExports();
  const actual = pkg.exports ?? {};

  const missing = [];
  const mismatched = [];
  for (const [key, target] of Object.entries(expected)) {
    if (!(key in actual)) missing.push(key);
    else if (actual[key] !== target) mismatched.push(key);
  }

  if (missing.length || mismatched.length) {
    console.error('subpath-exports drift detected in packages/js-toolkit/package.json:');
    if (missing.length) console.error(`  missing: ${missing.join(', ')}`);
    if (mismatched.length) console.error(`  mismatched: ${mismatched.join(', ')}`);
    console.error(
      'Run `npm run build:subpaths -- --write-exports -w @studiometa/js-toolkit` to refresh it.',
    );
    process.exit(1);
  }
  console.log('subpath-exports map is up to date.');
}

/**
 * Rewrite the source `package.json` `exports` map, preserving the grouped entries (`.`, `./utils`,
 * `./package.json`) and replacing the per-symbol subpath entries. Run manually when a barrel export
 * changes.
 */
function writeExports() {
  const pkgPath = resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const grouped = {
    '.': pkg.exports['.'],
    './utils': pkg.exports['./utils'],
    './package.json': './package.json',
  };
  pkg.exports = { ...grouped, ...buildSourceExports() };
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log('Refreshed packages/js-toolkit/package.json exports map.');
}

if (process.argv.includes('--check')) {
  check();
} else if (process.argv.includes('--write-exports')) {
  writeExports();
} else {
  generate();
}
