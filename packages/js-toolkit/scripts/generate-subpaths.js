import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { enumerate, stubSource, buildSubpathExports, conditions } from './lib/subpath-exports.js';

const pkgRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const pkgPath = resolve(pkgRoot, 'package.json');
const subpathsDir = resolve(pkgRoot, 'src/subpaths');

/**
 * The `exports` entries which are not one per symbol: the root barrel, the utils
 * barrel and the manifest itself. `./package.json` stays a plain string — it is
 * the same file under every condition.
 *
 * @returns {Record<string, unknown>}
 */
function groupedExports() {
  return {
    '.': conditions('index'),
    './utils': conditions('utils/index'),
    './package.json': './package.json',
  };
}

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
    writeFileSync(resolve(subpathsDir, `${symbol.exported}.ts`), stubSource(symbol));
  }
  for (const symbol of utils) {
    writeFileSync(resolve(subpathsDir, 'utils', `${symbol.exported}.ts`), stubSource(symbol));
  }

  console.log(
    `Generated ${root.length + utils.length} subpath stubs (${root.length} root, ${utils.length} utils).`,
  );
}

/**
 * Verify the committed `package.json` `exports` map still lists exactly the enumerated subpath
 * entries, each resolving through the three expected conditions. Used by the contract test to catch
 * drift when a barrel export is added or removed without regenerating the map.
 */
function check() {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const expected = { ...groupedExports(), ...buildSubpathExports() };
  const actual = pkg.exports ?? {};

  const missing = [];
  const mismatched = [];
  for (const [key, target] of Object.entries(expected)) {
    if (!(key in actual)) missing.push(key);
    else if (JSON.stringify(actual[key]) !== JSON.stringify(target)) mismatched.push(key);
  }

  if (missing.length || mismatched.length) {
    console.error('subpath-exports drift detected in packages/js-toolkit/package.json:');
    if (missing.length) console.error(`  missing: ${missing.join(', ')}`);
    if (mismatched.length) console.error(`  mismatched: ${mismatched.join(', ')}`);
    console.error('Run `npm run build:subpaths -- --write-exports` to refresh it.');
    process.exit(1);
  }
  console.log('subpath-exports map is up to date.');
}

/**
 * Rewrite the `exports` map, keeping the grouped entries first and replacing the per-symbol subpath
 * entries. Run manually when a barrel export changes.
 */
function writeExports() {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.exports = { ...groupedExports(), ...buildSubpathExports() };
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
