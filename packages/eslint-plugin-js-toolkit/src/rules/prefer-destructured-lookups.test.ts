import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { preferDestructuredLookups } from './prefer-destructured-lookups.ts';

describe('prefer-destructured-lookups', () => {
  it('passes and fails correctly', () => {
    tester.run('prefer-destructured-lookups', preferDestructuredLookups as any, {
      valid: [
        // Not a Base subclass
        `class Foo { method() { this.$refs.btn; this.$refs.btn; } }`,
        // Single access — no need to destructure
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           mounted() { this.$refs.btn.focus(); }
         }`,
        // Already destructured
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           mounted() { const { btn } = this.$refs; btn.focus(); btn.blur(); }
         }`,
        // Two different refs — each accessed once
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           mounted() { this.$refs.btn.focus(); this.$refs.input.value = ''; }
         }`,
        // Lookup outside a method (e.g. in a property initializer) — no enclosing method, should not warn
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           x = this.$refs.btn;
           y = this.$refs.btn;
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  mounted() {
    this.$refs.input.focus();
    this.$refs.input.value = '';
  }
}`,
          errors: [{ messageId: 'preferDestructured' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  mounted() {
    this.$options.foo;
    this.$options.foo;
  }
}`,
          errors: [{ messageId: 'preferDestructured' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  mounted() {
    this.$children.modal.open();
    this.$children.modal.close();
  }
}`,
          errors: [{ messageId: 'preferDestructured' }],
        },
      ],
    });
  });
});
