import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';

const pkgRoot = resolve(dirname(new URL(import.meta.url).pathname), '../..');
const srcRoot = resolve(pkgRoot, 'src');

/**
 * Parse the `export { … } from '…'` re-export blocks of a barrel file into a flat list of the
 * symbols it exposes, one descriptor per name.
 *
 * Each descriptor carries the exported name, the original (source) name when the barrel aliases it
 * (`push as historyPush`), the origin module the name comes from, and whether the symbol is
 * type-only (`type X` inline, or a block-level `export type { … }`).
 *
 * @param   {string} file The absolute path of the barrel to parse.
 * @returns {{ exported: string, orig: string, origin: string, isType: boolean }[]}
 */
function parseBarrel(file) {
  const source = readFileSync(file, 'utf8');
  const blockRe = /export\s+(type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
  const symbols = [];
  let match;
  while ((match = blockRe.exec(source))) {
    const blockIsType = Boolean(match[1]);
    const origin = match[3];
    for (const raw of match[2].split(',')) {
      let token = raw.trim();
      if (!token) continue;
      let isType = blockIsType;
      if (token.startsWith('type ')) {
        isType = true;
        token = token.slice('type '.length).trim();
      }
      const [orig, exported] = token.includes(' as ')
        ? token.split(/\s+as\s+/).map((part) => part.trim())
        : [token, token];
      symbols.push({ exported, orig, origin, isType });
    }
  }
  return symbols;
}

/**
 * Resolve a module specifier as written in the sources (always extension-ful and ESM-style, e.g.
 * `'./Base/index.js'`) to the absolute path of the TypeScript file backing it.
 *
 * @param   {string} fromFile The absolute path of the importing file.
 * @param   {string} specifier
 * @returns {string}
 */
export function resolveSpecifier(fromFile, specifier) {
  return resolve(dirname(fromFile), specifier).replace(/\.js$/, '.ts');
}

/**
 * Follow the re-export chain of a symbol down to the module which actually declares it.
 *
 * A barrel routinely re-exports through other barrels — `damp` reaches the package through
 * `utils/index.ts` → `utils/math/index.ts` → `utils/math/damp.ts`. Pointing a subpath stub at the
 * first hop makes importing one symbol pull every sibling the intermediate barrel names, which no
 * CDN can tree-shake away. Resolving to the leaf keeps the stub's graph down to what the symbol
 * genuinely needs.
 *
 * Anything the walk cannot follow — a locally declared symbol, a namespace re-export
 * (`export * as ease`), a missing file — stops it, and the last known module is used. That keeps the
 * fallback identical to the previous behaviour instead of emitting a stub which cannot link.
 *
 * @param   {string} file The absolute path of the barrel to walk down from.
 * @param   {string} name The symbol's name as exported by `file`.
 * @returns {{ file: string, name: string }} The declaring module and the name it declares.
 */
export function resolveToLeaf(file, name) {
  const onPath = new Set();
  let current = { file, name };

  while (!onPath.has(`${current.file}\0${current.name}`) && existsSync(current.file)) {
    onPath.add(`${current.file}\0${current.name}`);

    const entry = parseBarrel(current.file).find((symbol) => symbol.exported === current.name);
    if (!entry) break;

    const next = resolveSpecifier(current.file, entry.origin);
    if (!existsSync(next)) break;

    current = { file: next, name: entry.orig };
  }

  return current;
}

/**
 * Build the specifier a stub uses to reach its leaf module, relative to the stub's own directory.
 *
 * @param   {string} stubDir The absolute directory the stub is emitted into.
 * @param   {string} leafFile The absolute path of the declaring module.
 * @returns {string}
 */
function specifierFrom(stubDir, leafFile) {
  const path = relative(stubDir, leafFile).split(sep).join('/').replace(/\.ts$/, '.js');
  return path.startsWith('.') ? path : `./${path}`;
}

/**
 * Enumerate every subpath-worthy symbol of the package.
 *
 * The root symbols come from the root barrel `index.ts` (Base, decorators, helpers, services,
 * autoload and `version`) and become top-level subpaths (`./<Name>`). The util symbols come from
 * `utils/index.ts` and become `./utils/<name>` subpaths. Every symbol is then resolved through the
 * intermediate barrels down to the module declaring it, so each stub imports one leaf instead of a
 * barrel.
 *
 * @returns {{ root: Descriptor[], utils: Descriptor[] }}
 */
export function enumerate() {
  const rootBarrel = resolve(srcRoot, 'index.ts');
  const utilsBarrel = resolve(srcRoot, 'utils/index.ts');
  // Stubs live in `src/subpaths/` and `src/subpaths/utils/`.
  const rootStubDir = resolve(srcRoot, 'subpaths');
  const utilsStubDir = resolve(rootStubDir, 'utils');

  const root = parseBarrel(rootBarrel).map((symbol) => {
    const leaf = resolveToLeaf(rootBarrel, symbol.exported);
    return { ...symbol, orig: leaf.name, from: specifierFrom(rootStubDir, leaf.file) };
  });
  const utils = parseBarrel(utilsBarrel).map((symbol) => {
    const leaf = resolveToLeaf(utilsBarrel, symbol.exported);
    return { ...symbol, orig: leaf.name, from: specifierFrom(utilsStubDir, leaf.file) };
  });

  assertUnique(root, 'root');
  assertUnique(utils, 'utils');

  assignFileBases(root);
  assignFileBases(utils);

  return { root, utils };
}

/**
 * Assign a case-insensitively unique `fileBase` to every symbol so the emitted stub files never
 * clash on case-insensitive filesystems (a bundler refuses two outputs whose paths differ only by
 * case, e.g. the `animate` value and the `Animate` type). The export subpath key still uses the
 * exact symbol name; only the underlying file name is disambiguated. Values keep the plain name; a
 * colliding type gets a `.<n>` suffix.
 *
 * @param {Descriptor[]} symbols
 */
function assignFileBases(symbols) {
  const groups = new Map();
  for (const symbol of symbols) {
    const key = symbol.exported.toLowerCase();
    (groups.get(key) ?? groups.set(key, []).get(key)).push(symbol);
  }
  for (const group of groups.values()) {
    if (group.length === 1) {
      group[0].fileBase = group[0].exported;
      continue;
    }
    // Values first, so a runtime value subpath keeps the clean file name.
    group.sort((a, b) => Number(a.isType) - Number(b.isType));
    group.forEach((symbol, index) => {
      symbol.fileBase = index === 0 ? symbol.exported : `${symbol.exported}.${index}`;
    });
  }
}

/**
 * @param {{ exported: string }[]} symbols
 * @param {string} label
 */
function assertUnique(symbols, label) {
  const seen = new Set();
  for (const { exported } of symbols) {
    if (seen.has(exported)) {
      throw new Error(`subpath-exports: duplicate ${label} symbol "${exported}"`);
    }
    seen.add(exported);
  }
}

/**
 * Build the source of a per-symbol stub module. Each stub re-exports the symbol both as a named
 * export and as the default export, so the subpath resolves either way. Type-only symbols use the
 * `type` modifier (the bundler elides the whole module to an empty `.js`; the declaration keeps the
 * types).
 *
 * @param   {Descriptor} symbol
 * @returns {string}
 */
export function stubSource({ exported, orig, from, isType }) {
  const type = isType ? 'type ' : '';
  const named = orig === exported ? `${type}${exported}` : `${type}${orig} as ${exported}`;
  const asDefault = `${type}${orig} as default`;
  return `export { ${named}, ${asDefault} } from '${from}';\n`;
}

/**
 * The three conditions every entry of the `exports` map resolves through.
 *
 * `typescript` points at the `.ts` source, so the specs, the linter and an editor
 * with `customConditions: ["typescript"]` read the sources directly and never a
 * stale build. `types` and `import` point at the emitted declaration and module,
 * which is what a consumer of the published package gets.
 *
 * @param   {string} source The `.ts` module, relative to the package root without its extension.
 * @returns {{ typescript: string, types: string, import: string }}
 */
export function conditions(source) {
  return {
    typescript: `./src/${source}.ts`,
    types: `./dist/${source}.d.ts`,
    import: `./dist/${source}.js`,
  };
}

/**
 * Build the per-symbol fragment of the `exports` map.
 *
 * Every entry is a closed, explicit subpath — no `./*` wildcard — pointing at the
 * stub which re-exports one leaf module. That is what keeps a CDN from serving a
 * whole barrel's graph for one symbol.
 *
 * @returns {Record<string, { typescript: string, types: string, import: string }>}
 */
export function buildSubpathExports() {
  const { root, utils } = enumerate();
  const map = {};
  for (const { exported, fileBase } of root) {
    map[`./${exported}`] = conditions(`subpaths/${fileBase}`);
  }
  for (const { exported, fileBase } of utils) {
    map[`./utils/${exported}`] = conditions(`subpaths/utils/${fileBase}`);
  }
  return map;
}

/**
 * @typedef {{ exported: string, orig: string, origin: string, from: string, isType: boolean }} Descriptor
 */
