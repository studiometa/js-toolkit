import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { refsCamelCase } from './refs-camel-case.ts';

describe('refs-camel-case', () => {
  it('passes and fails correctly', () => {
    tester.run('refs-camel-case', refsCamelCase as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           static config = { name: 'Slider', refs: ['nextButton', 'previousButton'] };
         }`,
        // Multiple ref with [] suffix — base name still camelCase
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           static config = { name: 'Slider', refs: ['links[]', 'items[]', 'disabledBtn[]'] };
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Slider extends Base {
  static config = { name: 'Slider', refs: ['NextButton'] };
}`,
          errors: [{ messageId: 'notCamelCase' }],
          output: `import { Base } from '@studiometa/js-toolkit';
class Slider extends Base {
  static config = { name: 'Slider', refs: ['nextButton'] };
}`,
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Slider extends Base {
  static config = { name: 'Slider', refs: ['next-button'] };
}`,
          errors: [{ messageId: 'notCamelCase' }],
          output: `import { Base } from '@studiometa/js-toolkit';
class Slider extends Base {
  static config = { name: 'Slider', refs: ['nextButton'] };
}`,
        },
      ],
    });
  });
});
