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
const directOutput = [];
const directErrorReports = [];

for (const file of files) {
  const source = await readFile(resolve(sourceRoot, file), 'utf8');
  if (/console\.(?:debug|info|log|warn|error)\s*\(/.test(source)) {
    directOutput.push(file);
  }
  if (/\breportError\s*\(/.test(source)) {
    directErrorReports.push(file);
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
console.log('Diagnostics: direct core console and reportError calls exist only in the sink.');
