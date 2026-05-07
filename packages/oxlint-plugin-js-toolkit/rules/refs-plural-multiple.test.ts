import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.js';
import { refsPluralMultiple } from './refs-plural-multiple.js';

describe('refs-plural-multiple', () => {
  it('passes and fails correctly', () => {
    tester.run('refs-plural-multiple', refsPluralMultiple as any, {
      valid: [
        // Plural name with [] suffix
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           static config = { name: 'Slider', refs: ['links[]', 'buttons[]', 'items[]'] };
         }`,
        // Single refs without [] are not checked by this rule
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           static config = { name: 'Slider', refs: ['link', 'button'] };
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   static config = { name: 'Slider', refs: ['link[]'] };
                 }`,
          errors: [{ messageId: 'notPlural' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   static config = { name: 'Slider', refs: ['navItem[]'] };
                 }`,
          errors: [{ messageId: 'notPlural' }],
        },
      ],
    });
  });
});
