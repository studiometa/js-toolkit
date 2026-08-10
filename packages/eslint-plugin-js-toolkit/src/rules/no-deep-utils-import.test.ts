import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noDeepUtilsImport } from './no-deep-utils-import.ts';

describe('no-deep-utils-import', () => {
  it('passes and fails correctly', () => {
    tester.run('no-deep-utils-import', noDeepUtilsImport as any, {
      valid: [
        `import { debounce } from '@studiometa/js-toolkit/utils';`,
        `import { Base } from '@studiometa/js-toolkit';`,
        `import debounce from 'lodash/debounce';`,
        // Published per-symbol subpaths — public API since v3.9.0, and the cheapest import.
        `import { debounce } from '@studiometa/js-toolkit/utils/debounce';`,
        `import debounce from '@studiometa/js-toolkit/utils/debounce';`,
        `import { damp } from '@studiometa/js-toolkit/utils/damp';`,
        `import { historyPush } from '@studiometa/js-toolkit/utils/historyPush';`,
      ],
      invalid: [
        {
          code: `import { foo } from '@studiometa/js-toolkit/utils/dom/foo';`,
          errors: [{ messageId: 'noDeepImport' }],
        },
        {
          code: `import { foo as bar } from '@studiometa/js-toolkit/utils/dom/foo';`,
          errors: [{ messageId: 'noDeepImport' }],
        },
        {
          code: `import { damp } from '@studiometa/js-toolkit/utils/math/damp.js';`,
          errors: [{ messageId: 'noDeepImport' }],
        },
        {
          code: `import { debounce } from '@studiometa/js-toolkit/utils/debounce.js';`,
          errors: [{ messageId: 'noDeepImport' }],
        },
      ],
    });
  });
});
