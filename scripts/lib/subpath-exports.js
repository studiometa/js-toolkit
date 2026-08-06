import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const pkgRoot = resolve(dirname(new URL(import.meta.url).pathname), '../../packages/js-toolkit');

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
 * Enumerate every subpath-worthy symbol of the package.
 *
 * The root symbols come from the root barrel `index.ts` (Base, decorators, helpers, services,
 * autoload and `version`) and become top-level subpaths (`./<Name>`). The util symbols come from
 * `utils/index.ts` and become `./utils/<name>` subpaths. Both lists keep the origin module rewritten
 * relative to the generated stub's location under `subpaths/`.
 *
 * @returns {{ root: Descriptor[], utils: Descriptor[] }}
 */
export function enumerate() {
  const rootSymbols = parseBarrel(resolve(pkgRoot, 'index.ts'));
  const utilSymbols = parseBarrel(resolve(pkgRoot, 'utils/index.ts'));

  const root = rootSymbols.map((symbol) => ({
    ...symbol,
    // Stubs live in `subpaths/`; the root barrel origins are relative to the package root.
    from: symbol.origin.replace(/^\.\//, '../'),
  }));
  const utils = utilSymbols.map((symbol) => ({
    ...symbol,
    // Stubs live in `subpaths/utils/`; the utils barrel origins are relative to `utils/`.
    from: symbol.origin.replace(/^\.\//, '../../utils/'),
  }));

  assertUnique(root, 'root');
  assertUnique(utils, 'utils');

  assignFileBases(root);
  assignFileBases(utils);

  return { root, utils };
}

/**
 * Assign a case-insensitively unique `fileBase` to every symbol so the emitted stub files never
 * clash on case-insensitive filesystems (esbuild refuses two outputs whose paths differ only by
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
 * `type` modifier (esbuild elides the whole module to an empty `.js`; the declaration keeps the
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
 * Build the `exports` map fragment for the source `package.json` (string targets pointing at the
 * `.ts` stubs, resolved directly in-repo and by the test/lint tooling).
 *
 * @returns {Record<string, string>}
 */
export function buildSourceExports() {
  const { root, utils } = enumerate();
  const map = {};
  for (const { exported, fileBase } of root) {
    map[`./${exported}`] = `./subpaths/${fileBase}.ts`;
  }
  for (const { exported, fileBase } of utils) {
    map[`./utils/${exported}`] = `./subpaths/utils/${fileBase}.ts`;
  }
  return map;
}

/**
 * Build the `exports` map fragment for the published `dist/package.json` (object targets pointing at
 * the emitted `.js` module and its `.d.ts` declaration).
 *
 * @returns {Record<string, { types: string, import: string }>}
 */
export function buildDistExports() {
  const { root, utils } = enumerate();
  const map = {};
  for (const { exported, fileBase } of root) {
    map[`./${exported}`] = {
      types: `./subpaths/${fileBase}.d.ts`,
      import: `./subpaths/${fileBase}.js`,
    };
  }
  for (const { exported, fileBase } of utils) {
    map[`./utils/${exported}`] = {
      types: `./subpaths/utils/${fileBase}.d.ts`,
      import: `./subpaths/utils/${fileBase}.js`,
    };
  }
  return map;
}

/**
 * @typedef {{ exported: string, orig: string, origin: string, from: string, isType: boolean }} Descriptor
 */
