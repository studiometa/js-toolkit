import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noDeprecatedProperties } from './no-deprecated-properties.ts';

const v4 = [{ version: 'v4' }];

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
        // The v3 names stay silent unless the v4 set is asked for.
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   mounted() { this.$log('hello'); this.$warn('careful'); }
                   updated() {}
                   static config = { name: 'Slider', emits: ['change'] };
                 }`,
          options: [{ version: 'v3' }],
        },
        // v4 keeps $services — only its two switches are gone.
        {
          code: `class Slider extends Base {
                   mounted() {
                     this.$services.ticked.start();
                     this.$services.scrolled.stop();
                   }
                 }`,
          options: v4,
        },
        {
          code: `class Slider extends Base {
                   mounted() { this.$watchChildren(Item, () => {}); }
                   destroyed() {}
                   static config = { name: 'Slider' };
                 }`,
          options: v4,
        },
        // `updated` on something which is not a component is untouched.
        {
          code: `class Store { updated() {} }`,
          options: v4,
        },
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
          errors: [{ messageId: 'deprecated' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   mounted() { return this.$root; }
                 }`,
          errors: [{ messageId: 'deprecated' }],
        },
        {
          code: `class Slider extends Base {
                   static config = { name: 'Slider' };
                   mounted() { this.$log('a'); }
                 }`,
          options: v4,
          errors: [{ messageId: 'removed' }],
        },
        {
          code: `class Slider extends Base {
                   static config = { name: 'Slider' };
                   mounted() { this.$warn('a'); }
                 }`,
          options: v4,
          errors: [{ messageId: 'removed' }],
        },
        {
          code: `class Slider extends Base {
                   static config = { name: 'Slider' };
                   mounted() { this.$update(); }
                 }`,
          options: v4,
          errors: [{ messageId: 'removed' }],
        },
        {
          code: `class Slider extends Base {
                   static config = { name: 'Slider' };
                   onClick() { this.$terminate(); }
                 }`,
          options: v4,
          errors: [{ messageId: 'removed' }],
        },
        {
          code: `class Slider extends Base {
                   mounted() { this.$services.enable(); }
                 }`,
          options: v4,
          errors: [{ messageId: 'removed' }],
        },
        {
          code: `class Slider extends Base {
                   mounted() { this.$services.disable(); }
                 }`,
          options: v4,
          errors: [{ messageId: 'removed' }],
        },
        {
          code: `class Slider extends Base {
                   static config = { name: 'Slider' };
                   updated() {}
                 }`,
          options: v4,
          errors: [{ messageId: 'removedMethod' }],
        },
        {
          code: `class Slider extends Base {
                   static config = { name: 'Slider' };
                   terminated() {}
                 }`,
          options: v4,
          errors: [{ messageId: 'removedMethod' }],
        },
        {
          code: `class Slider extends Base {
                   static config = { name: 'Slider', emits: ['change'] };
                 }`,
          options: v4,
          errors: [{ messageId: 'removedConfig' }],
        },
      ],
    });
  });
});
