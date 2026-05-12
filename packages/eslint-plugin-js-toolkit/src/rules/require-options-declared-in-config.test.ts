import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { requireOptionsDeclaredInConfig } from './require-options-declared-in-config.ts';

describe('require-options-declared-in-config', () => {
  it('passes and fails correctly', () => {
    tester.run('require-options-declared-in-config', requireOptionsDeclaredInConfig as any, {
      valid: [
        // $options access matches declared option
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo', options: { label: String } };
           async mounted() { console.log(this.$options.label); }
         }`,
        // Multiple options all accessed correctly
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo', options: { count: Number, isActive: Boolean } };
           async mounted() {
             console.log(this.$options.count);
             console.log(this.$options.isActive);
           }
         }`,
        // No $options access
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo' };
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', options: { label: String } };
  async mounted() {
    console.log(this.$options.count);
  }
}`,
          errors: [{ messageId: 'undeclared' }],
        },
        {
          // No options in config at all
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo' };
  async mounted() {
    console.log(this.$options.label);
  }
}`,
          errors: [{ messageId: 'undeclared' }],
        },
      ],
    });
  });
});
