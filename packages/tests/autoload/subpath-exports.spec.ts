import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
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

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

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
    expect(() => execFileSync(process.execPath, [generator, '--check'])).not.toThrow();
  });
});
