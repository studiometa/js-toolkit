import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noDispatchEvent } from './no-dispatch-event.ts';

describe('no-dispatch-event', () => {
  it('passes and fails correctly', () => {
    tester.run('no-dispatch-event', noDispatchEvent as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           mounted() { this.$emit('change', { value: 1 }); }
         }`,
        // dispatchEvent outside a Base class — allowed
        `function foo(el) { el.dispatchEvent(new Event('click')); }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   mounted() { this.dispatchEvent(new Event('change')); }
                 }`,
          errors: [{ messageId: 'useEmit' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   mounted() { this.$el.dispatchEvent(new Event('change')); }
                 }`,
          errors: [{ messageId: 'useEmit' }],
        },
      ],
    });
  });
});
