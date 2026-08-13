import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, globSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
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
 * The stub every enumerated symbol must have, keyed by its path relative to `src/subpaths/`.
 *
 * @returns {Map<string, string>}
 */
function expectedStubs() {
  const { root, utils } = enumerate();
  const stubs = new Map();
  for (const symbol of root) stubs.set(`${symbol.exported}.ts`, stubSource(symbol));
  for (const symbol of utils) stubs.set(`utils/${symbol.exported}.ts`, stubSource(symbol));
  return stubs;
}

/**
 * Write the per-symbol subpath stub modules into `packages/js-toolkit/src/subpaths/`, and refresh
 * the `exports` map that points at them.
 *
 * The stubs are committed, so what the tests import is what the package ships. Run this when a
 * barrel export is added, removed or renamed; `--check` fails the suite until you do. Every stub is
 * a pure re-export, keeping the `sideEffects: false` guarantee intact and every subpath
 * tree-shakeable.
 */
function generate() {
  const stubs = expectedStubs();

  rmSync(subpathsDir, { recursive: true, force: true });
  mkdirSync(resolve(subpathsDir, 'utils'), { recursive: true });
  for (const [file, source] of stubs) writeFileSync(resolve(subpathsDir, file), source);

  writeExports();
  console.log(`Generated ${stubs.size} subpath stubs.`);
}

/**
 * Verify the committed stubs and the committed `exports` map both match what the barrels declare.
 *
 * Generation is a manual step, so this is what catches a barrel export added, removed or renamed
 * without it: the contract test runs this and fails with the command to run. Checking the stub files
 * on disk — not just the `exports` map — is the point. They are what the tests import and what the
 * package ships, so nothing may repair them silently on the way to a build.
 */
function check() {
  const problems = [];

  const expectedMap = { ...groupedExports(), ...buildSubpathExports() };
  const actualMap = JSON.parse(readFileSync(pkgPath, 'utf8')).exports ?? {};
  for (const [key, target] of Object.entries(expectedMap)) {
    if (!(key in actualMap)) problems.push(`exports: missing ${key}`);
    else if (JSON.stringify(actualMap[key]) !== JSON.stringify(target)) {
      problems.push(`exports: stale target for ${key}`);
    }
  }
  for (const key of Object.keys(actualMap)) {
    if (!(key in expectedMap)) problems.push(`exports: unexpected ${key}`);
  }

  const expectedStubFiles = expectedStubs();
  const actualStubFiles = new Set(
    existsSync(subpathsDir)
      ? globSync('**/*.ts', { cwd: subpathsDir }).map((file) => file.split(sep).join('/'))
      : [],
  );
  for (const [file, source] of expectedStubFiles) {
    const path = resolve(subpathsDir, file);
    if (!actualStubFiles.has(file)) problems.push(`stub: missing ${file}`);
    else if (readFileSync(path, 'utf8') !== source) problems.push(`stub: stale ${file}`);
  }
  for (const file of actualStubFiles) {
    if (!expectedStubFiles.has(file)) problems.push(`stub: unexpected ${file}`);
  }

  if (problems.length) {
    console.error('The subpath stubs no longer match the barrel exports:');
    for (const problem of problems) console.error(`  ${problem}`);
    console.error('Run `npm run subpaths` to regenerate them, then commit the result.');
    process.exit(1);
  }
  console.log(`${expectedStubFiles.size} subpath stubs and the exports map are up to date.`);
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
} else {
  generate();
}
