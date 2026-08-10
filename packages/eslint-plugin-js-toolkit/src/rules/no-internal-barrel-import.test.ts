import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noInternalBarrelImport } from './no-internal-barrel-import.ts';

describe('no-internal-barrel-import', () => {
  it('passes and fails correctly', () => {
    tester.run('no-internal-barrel-import', noInternalBarrelImport as any, {
      valid: [
        `import { isDev } from '../utils/is.js';`,
        `import { damp } from '../../utils/math/damp.js';`,
        `import { Base } from './Base.js';`,
        `import { AbstractManager } from './AbstractManager.js';`,
        `import deepmerge from 'deepmerge';`,
        `import { Base } from '@studiometa/js-toolkit';`,
        // A barrel re-exporting through another barrel is how the public surface is built.
        `export { damp } from './math/index.js';`,
      ],
      invalid: [
        {
          code: `import { isDev } from '../utils/index.js';`,
          errors: [{ messageId: 'noBarrelImport' }],
        },
        {
          code: `import { isDev, isArray } from '../../utils/index.js';`,
          errors: [{ messageId: 'noBarrelImport' }],
        },
        // `import type { … }` is covered too — the node is a plain ImportDeclaration — but the rule
        // tester parses with espree, which has no TypeScript syntax.
        {
          code: `import { Base } from '../Base/index.js';`,
          errors: [{ messageId: 'noBarrelImport' }],
        },
        {
          code: `import { useScroll } from './services/index.js';`,
          errors: [{ messageId: 'noBarrelImport' }],
        },
      ],
    });
  });
});
