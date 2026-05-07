import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.js';
import { noDeprecatedProperties } from './no-deprecated-properties.js';

describe('no-deprecated-properties', () => {
  it('passes and fails correctly', () => {
    tester.run('no-deprecated-properties', noDeprecatedProperties as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           mounted() {
             const parent = this.$closest(Base);
             const items = this.$queryAll('.item');
           }
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   mounted() { return this.$children; }
                 }`,
          errors: [{ messageId: 'deprecated' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   mounted() { return this.$parent; }
                 }`,
          errors: [{ messageId: 'removed' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   mounted() { return this.$root; }
                 }`,
          errors: [{ messageId: 'removed' }],
        },
      ],
    });
  });
});
