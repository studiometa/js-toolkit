import { isAbsolute, resolve, dirname } from 'node:path';
import glob from 'fast-glob';
import { build as tsdownBuild } from 'tsdown';

const pkgRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const srcRoot = resolve(pkgRoot, 'src');
const outDir = resolve(pkgRoot, 'dist');

// Every module under `src/` except the specs and the benchmarks. `unbundle` keeps
// the emitted `dist/` tree one-to-one with the sources.
const entryPoints = glob.sync(
  ['**/*.ts', '!**/*.d.ts', '!**/*.spec.ts', '!**/*.bench.ts', '!**/node_modules/**'],
  { cwd: srcRoot, absolute: true },
);

const defaultOptions = {
  entry: entryPoints,
  outDir,
  format: 'esm',
  platform: 'neutral',
  target: 'esnext',
  unbundle: true,
  config: false,
  external: (id) => !id.startsWith('.') && !isAbsolute(id),
  tsconfig: resolve(pkgRoot, 'tsconfig.build.json'),
  logLevel: 'silent',
};

/**
 * The JavaScript modules and their declarations are emitted by two separate
 * passes: a single mixed pass lets the JavaScript source maps leak a dangling
 * `//# sourceMappingURL` comment into the declarations.
 *
 * @param   {import('tsdown').Options} opts
 * @returns {Promise<unknown>}
 */
function build(opts = {}) {
  return tsdownBuild({ ...defaultOptions, ...opts });
}

console.log(`Building ${entryPoints.length} modules...`);
await build({ sourcemap: true, dts: false, clean: true });
await build({ sourcemap: false, dts: { emitDtsOnly: true }, clean: false });
console.log('Done building!');
