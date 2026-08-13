import { isAbsolute, resolve, dirname } from 'node:path';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import glob from 'fast-glob';
import { build as tsdownBuild } from 'tsdown';

const pkgRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const srcRoot = resolve(pkgRoot, 'src');

/**
 * The sources build into the package-local `dist/`, which is what npm publishes.
 *
 * Keeping every emitted module under `dist/` is also what keeps the subpath keys
 * and the shipped file paths disjoint. A CDN which names its build output after
 * the requested subpath — esm.sh does — would otherwise give the same URL to the
 * `./utils/debounce` entry and to a file shipped at `utils/debounce.js`, and the
 * stub would import itself (`SyntaxError: Detected cycle while resolving name`).
 * `files` ships no module outside `dist/`, so no key can collide.
 */
const outDir = resolve(pkgRoot, 'dist');

// Every `.js`/`.ts` module under `src/` except the ones which are not shipped:
// the specs, the helpers they share and the benchmarks. `unbundle` keeps the
// emitted `dist/` tree one-to-one with these sources (e.g. `src/Base/Base.ts` →
// `dist/Base/Base.js`).
const entryPoints = glob.sync(
  [
    '**/*.js',
    '**/*.ts',
    '!**/node_modules/**',
    '!**/*.d.ts',
    '!**/*.spec.ts',
    '!__utils__/**',
    '!__benchmarks__/**',
    '!**/__snapshots__/**',
  ],
  { cwd: srcRoot, absolute: true },
);

// Every non-relative, non-absolute specifier stays external, mirroring the
// transpile-only esbuild build this replaces, which never bundled a bare import
// (e.g. `deepmerge`, `@motionone/easing`).
const isExternal = (id) => !id.startsWith('.') && !isAbsolute(id);

const defaultOptions = {
  entry: entryPoints,
  outDir,
  format: 'esm',
  platform: 'neutral',
  target: 'esnext',
  unbundle: true,
  config: false,
  external: isExternal,
  tsconfig: resolve(pkgRoot, 'tsconfig.build.json'),
  logLevel: 'silent',
};

/**
 * List every file below `dir`, returned as paths relative to `dir`.
 *
 * @param   {string} dir
 * @param   {string} root
 * @returns {Promise<string[]>}
 */
async function listFiles(dir, root = dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) files.push(...(await listFiles(path, root)));
    else files.push(path.slice(root.length + 1));
  }
  return files;
}

/**
 * Rolldown emits no source map for a pure re-export facade entry (`export { … }`
 * only), the same shape esbuild emitted with an empty (`sources: []`) map. Every
 * per-symbol subpath stub is exactly that shape, so without this the package
 * would ship hundreds of modules with no map at all. Synthesize the empty,
 * source-free map for each of them so the public "one source map per module"
 * invariant still holds.
 *
 * @param   {string} directory
 * @returns {Promise<void>}
 */
async function synthesizeFacadeSourceMaps(directory) {
  const files = await listFiles(directory);
  const present = new Set(files);
  for (const file of files) {
    if (!file.endsWith('.js') || present.has(`${file}.map`)) continue;
    const absolute = `${directory}/${file}`;
    const base = file.split('/').pop();
    const map = {
      version: 3,
      file: base,
      sources: [],
      sourcesContent: [],
      names: [],
      mappings: '',
    };
    await writeFile(`${absolute}.map`, `${JSON.stringify(map)}\n`);
    let source = await readFile(absolute, 'utf8');
    if (!source.includes('# sourceMappingURL=')) {
      source = `${source.replace(/\s+$/, '')}\n//# sourceMappingURL=${base}.map\n`;
      await writeFile(absolute, source);
    }
  }
}

/**
 * Run one tsdown (rolldown) pass over the sources.
 *
 * The JavaScript modules and their `.d.ts` declarations are emitted by two
 * separate passes (see `buildLibrary`): a single mixed pass would let the
 * JavaScript source maps leak `//# sourceMappingURL` comments into the
 * declarations (rolldown-plugin-dts forces the dts output map from the shared
 * JavaScript `sourcemap` option, then deletes the map, leaving a dangling
 * reference). Keeping the passes separate avoids that.
 *
 * @param   {import('tsdown').Options} opts
 * @returns {Promise<Awaited<ReturnType<typeof tsdownBuild>>>}
 */
function build(opts = {}) {
  return tsdownBuild({ ...defaultOptions, ...opts });
}

console.log(`Building ${entryPoints.length} modules...`);
await build({ sourcemap: true, dts: false, clean: true });
await build({ sourcemap: false, dts: { emitDtsOnly: true }, clean: false });
await synthesizeFacadeSourceMaps(outDir);
console.log('Done building!');
