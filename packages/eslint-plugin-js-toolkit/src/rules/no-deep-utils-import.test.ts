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
      ],
      invalid: [
        {
          code: `import debounce from '@studiometa/js-toolkit/utils/debounce';`,
          errors: [{ messageId: 'noDeepImport' }],
          output: `import { debounce } from '@studiometa/js-toolkit/utils';`,
        },
        {
          code: `import { foo } from '@studiometa/js-toolkit/utils/dom/foo';`,
          errors: [{ messageId: 'noDeepImport' }],
          output: `import { foo } from '@studiometa/js-toolkit/utils';`,
        },
        {
          code: `import { foo as bar } from '@studiometa/js-toolkit/utils/dom/foo';`,
          errors: [{ messageId: 'noDeepImport' }],
          output: `import { foo as bar } from '@studiometa/js-toolkit/utils';`,
        },
      ],
    });
  });
});
