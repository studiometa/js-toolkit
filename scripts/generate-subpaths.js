import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, globSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
import { enumerate, stubSource, buildSubpathExports, conditions } from './lib/subpath-exports.js';

const repositoryRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');

/**
 * Resolve the paths the generator works with for one package.
 *
 * @param   {string} packageDir The package directory, relative to the repository root.
 * @returns {{ dir: string, manifest: string, srcRoot: string, subpathsDir: string }}
 */
function paths(packageDir) {
  const dir = resolve(repositoryRoot, packageDir);
  return {
    dir,
    manifest: resolve(dir, 'package.json'),
    srcRoot: resolve(dir, 'src'),
    subpathsDir: resolve(dir, 'src/subpaths'),
  };
}

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
 * @param   {string} srcRoot
 * @returns {Map<string, string>}
 */
function expectedStubs(srcRoot) {
  const { root, utils } = enumerate(srcRoot);
  const stubs = new Map();
  for (const symbol of root) stubs.set(`${symbol.exported}.ts`, stubSource(symbol));
  for (const symbol of utils) stubs.set(`utils/${symbol.exported}.ts`, stubSource(symbol));
  return stubs;
}

/**
 * The `exports` map a package should carry: the grouped entries first, then one per symbol.
 *
 * @param   {string} srcRoot
 * @returns {Record<string, unknown>}
 */
function expectedExports(srcRoot) {
  return { ...groupedExports(), ...buildSubpathExports(srcRoot) };
}

/**
 * Write the per-symbol subpath stub modules into `<package>/src/subpaths/`, and refresh the
 * `exports` map that points at them.
 *
 * The stubs are committed, so what the tests import is what the package ships. Run this when a
 * barrel export is added, removed or renamed; `--check` fails until you do. Every stub is a pure
 * re-export, keeping the `sideEffects: false` guarantee intact and every subpath tree-shakeable.
 *
 * @param {string} packageDir
 */
function generate(packageDir) {
  const { manifest, srcRoot, subpathsDir } = paths(packageDir);
  const stubs = expectedStubs(srcRoot);

  rmSync(subpathsDir, { recursive: true, force: true });
  mkdirSync(resolve(subpathsDir, 'utils'), { recursive: true });
  for (const [file, source] of stubs) writeFileSync(resolve(subpathsDir, file), source);

  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  pkg.exports = expectedExports(srcRoot);
  writeFileSync(manifest, `${JSON.stringify(pkg, null, 2)}\n`);

  console.log(
    `${packageDir}: generated ${stubs.size} subpath stubs and refreshed the exports map.`,
  );
}

/**
 * Verify the committed stubs and the committed `exports` map both match what the barrels declare.
 *
 * Generation is a manual step, so this is what catches a barrel export added, removed or renamed
 * without it. Checking the stub files on disk — not just the `exports` map — is the point. They are
 * what the tests import and what the package ships, so nothing may repair them silently on the way
 * to a build.
 *
 * @param   {string} packageDir
 * @returns {string[]} One message per problem found.
 */
export function check(packageDir) {
  const { manifest, srcRoot, subpathsDir } = paths(packageDir);
  const problems = [];

  const expectedMap = expectedExports(srcRoot);
  const actualMap = JSON.parse(readFileSync(manifest, 'utf8')).exports ?? {};
  for (const [key, target] of Object.entries(expectedMap)) {
    if (!(key in actualMap)) problems.push(`exports: missing ${key}`);
    else if (JSON.stringify(actualMap[key]) !== JSON.stringify(target)) {
      problems.push(`exports: stale target for ${key}`);
    }
  }
  for (const key of Object.keys(actualMap)) {
    if (!(key in expectedMap)) problems.push(`exports: unexpected ${key}`);
  }

  const expected = expectedStubs(srcRoot);
  const actual = new Set(
    existsSync(subpathsDir)
      ? globSync('**/*.ts', { cwd: subpathsDir }).map((file) => file.split(sep).join('/'))
      : [],
  );
  for (const [file, source] of expected) {
    if (!actual.has(file)) problems.push(`stub: missing ${file}`);
    else if (readFileSync(resolve(subpathsDir, file), 'utf8') !== source) {
      problems.push(`stub: stale ${file}`);
    }
  }
  for (const file of actual) {
    if (!expected.has(file)) problems.push(`stub: unexpected ${file}`);
  }

  return problems;
}

const args = process.argv.slice(2);
const packageDirs = args.filter((arg) => !arg.startsWith('--'));

if (!packageDirs.length) {
  console.error('usage: node scripts/generate-subpaths.js [--check] <package-dir>…');
  process.exit(1);
}

if (args.includes('--check')) {
  let failed = false;
  for (const packageDir of packageDirs) {
    const problems = check(packageDir);
    if (problems.length) {
      failed = true;
      console.error(`${packageDir}: the subpath stubs no longer match the barrel exports:`);
      for (const problem of problems) console.error(`  ${problem}`);
    } else {
      console.log(`${packageDir}: subpath stubs and exports map are up to date.`);
    }
  }
  if (failed) {
    console.error('Run `npm run subpaths` to regenerate them, then commit the result.');
    process.exit(1);
  }
} else {
  for (const packageDir of packageDirs) generate(packageDir);
}
