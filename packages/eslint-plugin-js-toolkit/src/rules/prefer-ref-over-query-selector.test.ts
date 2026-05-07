import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { preferRefOverQuerySelector } from './prefer-ref-over-query-selector.ts';

describe('prefer-ref-over-query-selector', () => {
  it('passes and fails correctly', () => {
    tester.run('prefer-ref-over-query-selector', preferRefOverQuerySelector as any, {
      valid: [
        // querySelector outside a Base subclass is fine
        `document.querySelector('.btn');`,
        // Using refs properly
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { refs: ['btn'] };
           mounted() { const { btn } = this.$refs; }
         }`,
        // Not this.$el
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           mounted() { this.$el.classList.add('active'); }
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  mounted() { const btn = this.$el.querySelector('.btn'); }
}`,
          errors: [{ messageId: 'preferRef' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  mounted() { const items = this.$el.querySelectorAll('.item'); }
}`,
          errors: [{ messageId: 'preferRef' }],
        },
      ],
    });
  });
});
