import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { requireEmitDeclaredInConfig } from './require-emit-declared-in-config.ts';

describe('require-emit-declared-in-config', () => {
  it('passes and fails correctly', () => {
    tester.run('require-emit-declared-in-config', requireEmitDeclaredInConfig as any, {
      valid: [
        // Emit declared and used
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo', emits: ['content-change'] };
           async mounted() { this.$emit('content-change', 'value'); }
         }`,
        // Multiple emits all declared
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo', emits: ['item-select', 'panel-close'] };
           onButtonClick() {
             this.$emit('item-select', 1);
             this.$emit('panel-close');
           }
         }`,
        // No $emit calls — nothing to validate
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo' };
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', emits: ['content-change'] };
  onButtonClick() {
    this.$emit('item-select');
  }
}`,
          errors: [{ messageId: 'undeclared' }],
        },
        {
          // No emits in config at all
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo' };
  onButtonClick() {
    this.$emit('content-change');
  }
}`,
          errors: [{ messageId: 'undeclared' }],
        },
      ],
    });
  });
});
