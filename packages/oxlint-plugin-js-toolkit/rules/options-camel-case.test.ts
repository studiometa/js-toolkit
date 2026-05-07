import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.js';
import { optionsCamelCase } from './options-camel-case.js';

describe('options-camel-case', () => {
  it('passes and fails correctly', () => {
    tester.run('options-camel-case', optionsCamelCase as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           static config = { name: 'Slider', options: { slidesToShow: 3, autoplay: false } };
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Slider extends Base {
  static config = { name: 'Slider', options: { 'slides-to-show': 3 } };
}`,
          errors: [{ messageId: 'notCamelCase' }],
          output: `import { Base } from '@studiometa/js-toolkit';
class Slider extends Base {
  static config = { name: 'Slider', options: { 'slidesToShow': 3 } };
}`,
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Slider extends Base {
  static config = { name: 'Slider', options: { SlidesToShow: 3 } };
}`,
          errors: [{ messageId: 'notCamelCase' }],
          output: `import { Base } from '@studiometa/js-toolkit';
class Slider extends Base {
  static config = { name: 'Slider', options: { slidesToShow: 3 } };
}`,
        },
      ],
    });
  });
});
