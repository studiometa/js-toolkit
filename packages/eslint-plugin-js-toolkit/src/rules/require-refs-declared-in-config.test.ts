import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { requireRefsDeclaredInConfig } from './require-refs-declared-in-config.ts';

describe('require-refs-declared-in-config', () => {
  it('passes and fails correctly', () => {
    tester.run('require-refs-declared-in-config', requireRefsDeclaredInConfig as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { refs: ['button', 'panel'] };
           mounted() {
             this.$refs.button.click();
             this.$refs.panel.hidden = false;
           }
         }`,
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { refs: ['items[]'] };
           mounted() { const { items } = this.$refs; }
         }`,
        // Outside a Base subclass — not checked
        `class Foo {
           mounted() { this.$refs.anything; }
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { refs: ['button'] };
  mounted() { this.$refs.panel.hidden = false; }
}`,
          errors: [{ messageId: 'undeclared' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { refs: ['button'] };
  mounted() {
    this.$refs.button.click();
    this.$refs.missing.focus();
  }
}`,
          errors: [{ messageId: 'undeclared' }],
        },
      ],
    });
  });
});
