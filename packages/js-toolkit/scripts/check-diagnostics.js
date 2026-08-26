import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import glob from 'fast-glob';

const packageRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const sourceRoot = resolve(packageRoot, 'src');
// Specs and benchmarks are test programs, not modules shipped in the runtime package.
const files = glob.sync(['**/*.ts', '!**/*.spec.ts', '!**/*.bench.ts', '!diagnostics.ts'], {
  cwd: sourceRoot,
});
/**
 * Drop comments before the checks below.
 *
 * All three guards are about *emitted code*: a console call, a `reportError()`
 * call, a reference that pulls in the whole frozen object. A comment is none of
 * those — it is gone by the time the bundle exists. Testing the raw source made
 * prose trip the guard, and the doc-page links are the case that surfaced it:
 * `@link .../DIAGNOSTICS.html` matched the `DIAGNOSTICS.` reference test.
 *
 * @param   {string} source The file contents.
 * @returns {string} The contents with block comments and whole-line `//` comments removed.
 */
function withoutComments(source) {
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, '').replaceAll(/^[ \t]*\/\/.*$/gm, '');
}

const directOutput = [];
const directErrorReports = [];
const fullObjectReferences = [];

for (const file of files) {
  const source = withoutComments(await readFile(resolve(sourceRoot, file), 'utf8'));
  if (/console\.(?:debug|info|log|warn|error)\s*\(/.test(source)) {
    directOutput.push(file);
  }
  if (/\breportError\s*\(/.test(source)) {
    directErrorReports.push(file);
  }
  if (/\bDIAGNOSTICS\./.test(source) || /import\s+\{[^}]*\bDIAGNOSTICS\b/s.test(source)) {
    fullObjectReferences.push(file);
  }
}

assert.deepEqual(
  directOutput,
  [],
  `Core runtime files must not write directly to the console:\n${directOutput.join('\n')}`,
);
assert.deepEqual(
  directErrorReports,
  [],
  `Core runtime files must use the diagnostic error sink instead of reportError() directly:\n${directErrorReports.join('\n')}`,
);
assert.deepEqual(
  fullObjectReferences,
  [],
  `Core runtime files must pass typed code literals instead of loading the full DIAGNOSTICS object:\n${fullObjectReferences.join('\n')}`,
);
console.log('Diagnostics: sinks are centralized and internal code references are tree-shakeable.');
