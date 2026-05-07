import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.js';
import { requireConfigNamePascalCase } from './require-config-name-pascal-case.js';

describe('require-config-name-pascal-case', () => {
  it('passes and fails correctly', () => {
    tester.run('require-config-name-pascal-case', requireConfigNamePascalCase as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           static config = { name: 'Slider' };
         }`,
        `import { Base } from '@studiometa/js-toolkit';
         class FigureShopify extends Base {
           static config = { name: 'FigureShopify' };
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   static config = { name: 'slider' };
                 }`,
          errors: [{ messageId: 'notPascalCase' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   static config = { name: 'my-slider' };
                 }`,
          errors: [{ messageId: 'notPascalCase' }],
        },
      ],
    });
  });
});
