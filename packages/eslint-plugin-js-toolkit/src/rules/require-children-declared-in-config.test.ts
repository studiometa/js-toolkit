import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { requireChildrenDeclaredInConfig } from './require-children-declared-in-config.ts';

describe('require-children-declared-in-config', () => {
  it('passes and fails correctly', () => {
    tester.run('require-children-declared-in-config', requireChildrenDeclaredInConfig as any, {
      valid: [
        // $children access matches declared component
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo', components: { Slider } };
           async mounted() { const s = this.$children.Slider[0]; }
         }`,
        // Multiple components all accessed correctly
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo', components: { Header, Footer } };
           async mounted() {
             this.$children.Header[0].show();
             this.$children.Footer[0].hide();
           }
         }`,
        // No $children access
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo' };
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', components: { Slider } };
  async mounted() {
    const h = this.$children.Header[0];
  }
}`,
          errors: [{ messageId: 'undeclared' }],
        },
        {
          // No components in config at all
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo' };
  async mounted() {
    this.$children.Slider[0].play();
  }
}`,
          errors: [{ messageId: 'undeclared' }],
        },
      ],
    });
  });
});
