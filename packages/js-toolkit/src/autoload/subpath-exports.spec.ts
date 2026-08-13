import { execFileSync } from 'node:child_process';
import { globSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { createApp, registerManifests } from '@studiometa/js-toolkit';
import { Base } from '@studiometa/js-toolkit';
import { damp } from '@studiometa/js-toolkit/utils';

// Representative subpaths: a Base class, a helper, a util (flattened from `utils/math`) and an
// autoload export. Each must resolve as BOTH the named export and the default export, to the exact
// same symbol the barrels expose.
import BaseDefault, { Base as BaseNamed } from '@studiometa/js-toolkit/Base';
import createAppDefault, { createApp as createAppNamed } from '@studiometa/js-toolkit/createApp';
import dampDefault, { damp as dampNamed } from '@studiometa/js-toolkit/utils/damp';
import registerManifestsDefault, {
  registerManifests as registerManifestsNamed,
} from '@studiometa/js-toolkit/registerManifests';

const srcRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = resolve(srcRoot, '..');
const repositoryRoot = resolve(packageRoot, '../..');

describe('per-symbol subpath exports', () => {
  it.each([
    ['Base', BaseDefault, BaseNamed, Base],
    ['createApp', createAppDefault, createAppNamed, createApp],
    ['utils/damp', dampDefault, dampNamed, damp],
    ['registerManifests', registerManifestsDefault, registerManifestsNamed, registerManifests],
  ])(
    'exposes %s as both the named and the default export',
    (_name, asDefault, asNamed, reference) => {
      expect(asDefault).toBe(reference);
      expect(asNamed).toBe(reference);
      expect(asDefault).toBe(asNamed);
    },
  );
});

describe('subpath exports map', () => {
  it('stays in sync with the barrel exports', () => {
    const generator = resolve(repositoryRoot, 'scripts/generate-subpaths.js');
    expect(() =>
      execFileSync(process.execPath, [generator, '--check', 'packages/js-toolkit']),
    ).not.toThrow();
  });
});

/** Every relative specifier a module imports from, barrel or not. */
function importedSpecifiers(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const pattern = /^import\s+(?:type\s+)?[^'"]*from\s*'(\.[^']+)';?$/gm;
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

/**
 * Importing a barrel costs every symbol the barrel names. A bundler tree-shakes that back out, but a
 * CDN serving the modules as-is cannot, so one symbol drags in the whole barrel's graph. These two
 * checks keep the package's own graph flat; `npm run measure` reports what it costs.
 */
describe('module graph', () => {
  it('never routes a subpath stub through a barrel', () => {
    // `ease` is a namespace re-export (`export * as ease from './ease.js'`) and the four storage
    // factories are declared in `utils/storage/index.ts` itself, so for these the barrel *is* the
    // declaring module. Everything else must resolve deeper.
    const declaredByABarrel = [
      'utils/createLocalStorage.ts',
      'utils/createSessionStorage.ts',
      'utils/createUrlSearchParamsInHashStorage.ts',
      'utils/createUrlSearchParamsStorage.ts',
      'utils/ease.ts',
    ];

    const throughABarrel = globSync('**/*.ts', { cwd: resolve(srcRoot, 'subpaths') })
      .filter((file) =>
        readFileSync(resolve(srcRoot, 'subpaths', file), 'utf8').includes("/index.js'"),
      )
      .map((file) => file.split('\\').join('/'))
      .toSorted();

    expect(throughABarrel).toStrictEqual(declaredByABarrel);
  });

  it('never imports a barrel from inside the package', () => {
    const offenders: string[] = [];

    // The specs, their helpers and the benchmarks are not shipped, so their own
    // imports say nothing about the published module graph.
    const notShipped = /^(subpaths|__utils__|__benchmarks__)\/|\.spec\.ts$/;

    for (const file of globSync('**/*.ts', { cwd: srcRoot })) {
      const path = resolve(srcRoot, file);
      if (notShipped.test(relative(srcRoot, path).split('\\').join('/'))) continue;

      for (const specifier of importedSpecifiers(path)) {
        if (specifier.endsWith('/index.js')) {
          offenders.push(`${relative(repositoryRoot, path)} → ${specifier}`);
        }
      }
    }

    expect(offenders).toStrictEqual([]);
  });
});
