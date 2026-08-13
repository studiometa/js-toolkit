import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { brotliCompressSync } from 'node:zlib';
import esbuild from 'esbuild';

const pkgRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const modulesRoot = resolve(pkgRoot, 'dist');

/**
 * Matches the specifier of every static `import`/`export … from` of a relative module.
 *
 * The emitted modules are plain ESM with explicit relative specifiers, so a regexp is enough and
 * keeps this script dependency-free. Dynamic `import()` calls are deliberately ignored: they are a
 * separate request the consumer opted into, not part of the entry's initial cost.
 */
const SPECIFIER_RE = /(?:^|[\s;}])(?:import|export)\s*(?:[^'"()]*?\sfrom\s*)?['"](\.[^'"]+)['"]/g;

/**
 * Walk the transitive module graph of an emitted entry.
 *
 * This is the cost a consumer pays on a CDN which serves modules as-is instead of bundling them —
 * every module in the graph is one request, and the longest chain of imports is a chain of round
 * trips the browser cannot parallelise. Both matter more than the byte count on a real connection.
 *
 * @param   {string} entry Absolute path of the entry module.
 * @returns {{ files: number, bytes: number, depth: number }}
 */
function walkGraph(entry) {
  const sizes = new Map();
  const edges = new Map();
  const queue = [entry];

  while (queue.length) {
    const file = queue.pop();
    if (sizes.has(file)) continue;

    let source;
    try {
      source = readFileSync(file, 'utf8');
    } catch {
      // A type-only re-export resolves to a declaration with no emitted module; it costs nothing.
      sizes.set(file, 0);
      edges.set(file, []);
      continue;
    }

    sizes.set(file, Buffer.byteLength(source));
    const imports = [...source.matchAll(SPECIFIER_RE)].map((match) =>
      resolve(dirname(file), match[1]),
    );
    edges.set(file, imports);
    queue.push(...imports);
  }

  return {
    files: [...sizes.values()].filter((size) => size > 0).length,
    bytes: [...sizes.values()].reduce((total, size) => total + size, 0),
    depth: longestChain(entry, edges),
  };
}

/**
 * Length of the longest import chain reachable from `entry`, i.e. the number of sequential round
 * trips a browser needs before the whole graph has been fetched. Cycles are broken by the visited
 * set on the current path.
 *
 * @param   {string} entry
 * @param   {Map<string, string[]>} edges
 * @returns {number}
 */
function longestChain(entry, edges) {
  const memo = new Map();

  const walk = (file, onPath) => {
    if (memo.has(file)) return memo.get(file);
    if (onPath.has(file)) return 0;

    onPath.add(file);
    let longest = 0;
    for (const next of edges.get(file) ?? []) {
      longest = Math.max(longest, 1 + walk(next, onPath));
    }
    onPath.delete(file);

    memo.set(file, longest);
    return longest;
  };

  return walk(entry, new Set()) + 1;
}

/**
 * Bundle and tree-shake an entry to get the floor of what it actually needs. The gap between this
 * and the graph size is the cost paid purely for going through a barrel.
 *
 * @param   {string} entry Absolute path of the entry module.
 * @returns {Promise<{ minified: number, brotli: number }>}
 */
async function measureFloor(entry) {
  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: 'esm',
    target: 'esnext',
    minify: true,
    logLevel: 'silent',
  });
  const output = Buffer.from(result.outputFiles[0].contents);
  return { minified: output.length, brotli: brotliCompressSync(output).length };
}

/**
 * Every entry point a consumer can import, read from the published `exports` map so the report can
 * never drift from what is actually shipped.
 *
 * @returns {{ subpath: string, entry: string }[]}
 */
function collectEntries() {
  const pkgPath = resolve(pkgRoot, 'package.json');

  const { exports: map } = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const entries = [];
  for (const [subpath, target] of Object.entries(map)) {
    if (subpath === './package.json') continue;
    const file = typeof target === 'string' ? target : target.import;
    if (!file?.endsWith('.js')) continue;
    entries.push({ subpath, entry: resolve(pkgRoot, file) });
  }
  return entries;
}

/**
 * Measure every entry point and return one row per subpath.
 *
 * @returns {Promise<Row[]>}
 */
async function measure() {
  const rows = [];
  for (const { subpath, entry } of collectEntries()) {
    const graph = walkGraph(entry);
    const floor = await measureFloor(entry);
    // A type-only subpath emits an empty module; it has no runtime cost to report.
    if (floor.minified === 0) continue;
    rows.push({ subpath, ...graph, ...floor, waste: graph.bytes - floor.minified });
  }
  return rows.sort((a, b) => b.waste - a.waste);
}

/**
 * @param {Row[]} rows
 * @param {number} limit
 */
function report(rows, limit) {
  const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;
  const total = rows.reduce(
    (acc, row) => ({ files: acc.files + row.files, bytes: acc.bytes + row.bytes }),
    { files: 0, bytes: 0 },
  );

  console.log(`\n${rows.length} runtime entry points\n`);
  console.log(
    `  ${'subpath'.padEnd(34)}${'requests'.padStart(9)}${'graph'.padStart(11)}${'RTT'.padStart(5)}${'needed'.padStart(11)}${'ratio'.padStart(8)}`,
  );
  console.log(`  ${'-'.repeat(76)}`);
  for (const row of rows.slice(0, limit)) {
    const ratio = `${(row.bytes / row.minified).toFixed(1)}x`;
    console.log(
      `  ${row.subpath.padEnd(34)}${String(row.files).padStart(9)}${kb(row.bytes).padStart(11)}${String(row.depth).padStart(5)}${kb(row.minified).padStart(11)}${ratio.padStart(8)}`,
    );
  }
  if (rows.length > limit) console.log(`  … ${rows.length - limit} more (use --all)`);

  const ratios = rows.map((row) => row.bytes / row.minified).sort((a, b) => a - b);
  console.log(`\n  median ratio      ${ratios[Math.floor(ratios.length / 2)].toFixed(1)}x`);
  console.log(`  median requests   ${median(rows.map((row) => row.files))}`);
  console.log(`  median RTT        ${median(rows.map((row) => row.depth))}`);
  console.log(`  mean graph size   ${kb(total.bytes / rows.length)}`);
  console.log(`  entries over 5x   ${rows.filter((row) => row.bytes / row.minified > 5).length}`);
}

/**
 * Print the delta between a previously saved report and the current one.
 *
 * @param {Row[]} before
 * @param {Row[]} after
 * @param {number} limit
 */
function compare(before, after, limit) {
  const previous = new Map(before.map((row) => [row.subpath, row]));
  const rows = after
    .map((row) => ({ row, was: previous.get(row.subpath) }))
    .filter((pair) => pair.was)
    .map(({ row, was }) => ({
      ...row,
      wasFiles: was.files,
      wasBytes: was.bytes,
      wasDepth: was.depth,
    }))
    .sort((a, b) => b.wasBytes - b.bytes - (a.wasBytes - a.bytes));

  const kb = (bytes) => `${(bytes / 1024).toFixed(1)}`;
  console.log(`\nBefore → after over ${rows.length} shared entry points\n`);
  console.log(
    `  ${'subpath'.padEnd(34)}${'requests'.padStart(14)}${'graph kB'.padStart(18)}${'RTT'.padStart(10)}`,
  );
  console.log(`  ${'-'.repeat(76)}`);
  for (const row of rows.slice(0, limit)) {
    console.log(
      `  ${row.subpath.padEnd(34)}${`${row.wasFiles} → ${row.files}`.padStart(14)}${`${kb(row.wasBytes)} → ${kb(row.bytes)}`.padStart(18)}${`${row.wasDepth} → ${row.depth}`.padStart(10)}`,
    );
  }
  if (rows.length > limit) console.log(`  … ${rows.length - limit} more (use --all)`);

  const sum = (list, key) => list.reduce((total, row) => total + row[key], 0);
  const wasBytes = sum(rows, 'wasBytes');
  const nowBytes = sum(rows, 'bytes');
  const wasFiles = sum(rows, 'wasFiles');
  const nowFiles = sum(rows, 'files');
  console.log(
    `\n  total graph bytes ${kb(wasBytes)} kB → ${kb(nowBytes)} kB  (${percent(wasBytes, nowBytes)})`,
  );
  console.log(`  total requests    ${wasFiles} → ${nowFiles}  (${percent(wasFiles, nowFiles)})`);
}

/**
 * @param   {number} before
 * @param   {number} after
 * @returns {string}
 */
function percent(before, after) {
  if (before === 0) return 'n/a';
  const delta = ((after - before) / before) * 100;
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
}

/**
 * @param   {number[]} values
 * @returns {number}
 */
function median(values) {
  return values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];
}

const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : (args[index + 1] ?? true);
};

if (!existsSync(modulesRoot)) {
  console.error(
    `No build found at ${relative(pkgRoot, modulesRoot)} — run \`npm run build\` first.`,
  );
  process.exit(1);
}

const rows = await measure();
const limit = flag('--all') ? rows.length : Number(flag('--limit') ?? 25);

const baseline = flag('--compare');
if (typeof baseline === 'string') {
  compare(JSON.parse(readFileSync(resolve(process.cwd(), baseline), 'utf8')), rows, limit);
} else {
  report(rows, limit);
}

const out = flag('--json');
if (typeof out === 'string') {
  writeFileSync(resolve(process.cwd(), out), `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`\nWrote ${rows.length} rows to ${out}`);
}

/**
 * @typedef {{ subpath: string, files: number, bytes: number, depth: number, minified: number, brotli: number, waste: number }} Row
 */
