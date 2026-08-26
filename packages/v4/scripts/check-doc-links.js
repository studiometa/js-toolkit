import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import glob from 'fast-glob';

/**
 * Every public export carries an `@link` to the page that documents it.
 *
 * The subpath stubs are generated re-exports with no comment of their own, so an
 * editor follows them through to the implementation — which is where the link
 * has to be, and the only place this checks.
 *
 * It asserts the link *exists*, not that it resolves: resolving an anchor means
 * building the site, and this runs on every `npm test`. The build is where a
 * dead link is caught, through VitePress' own dead-link check.
 */
const packageRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const sourceRoot = resolve(packageRoot, 'src');
const DOCS_ORIGIN = 'https://js-toolkit-v4.studiometa.dev';

const stubs = glob.sync('subpaths/**/*.ts', { cwd: sourceRoot });
const missing = [];

for (const stub of stubs) {
  const source = await readFile(resolve(sourceRoot, stub), 'utf8');
  const from = /from '([^']+)';/.exec(source);
  const [, symbol] = /export \{ (\w+)/.exec(source) ?? [];
  if (!from || !symbol) continue;

  const implementation = resolve(sourceRoot, dirname(stub), from[1]).replace(/\.js$/, '.ts');
  const code = await readFile(implementation, 'utf8');
  const declaration = new RegExp(
    String.raw`^[ \t]*export (?:async )?(?:function|const|class|let) ${symbol}\b`,
    'm',
  );
  const match = declaration.exec(code);
  if (!match) continue;

  // The docblock, if there is one, is whatever `/** … */` closes right before it.
  const head = code.slice(0, match.index).trimEnd();
  const block = head.endsWith('*/') ? head.slice(head.lastIndexOf('/**')) : '';
  if (!new RegExp(String.raw`@link ${DOCS_ORIGIN}\S`).test(block)) {
    missing.push(`${symbol} (${implementation.slice(sourceRoot.length + 1)})`);
  }
}

assert.deepEqual(
  missing,
  [],
  `Every public export must link to its documentation page with \`@link ${DOCS_ORIGIN}/…\`:\n${missing.join('\n')}`,
);
console.log(`Doc links: ${stubs.length} public exports each point at their documentation page.`);
