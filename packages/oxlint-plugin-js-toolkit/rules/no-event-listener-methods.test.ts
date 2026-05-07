import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.js';
import { noEventListenerMethods } from './no-event-listener-methods.js';

describe('no-event-listener-methods', () => {
  it('passes and fails correctly', () => {
    tester.run('no-event-listener-methods', noEventListenerMethods as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           onClickButton() { /* handled by framework */ }
           onWindowResize() {}
         }`,
        // Outside a Base class — allowed
        `function setup(el) {
           el.addEventListener('click', handler);
           el.removeEventListener('click', handler);
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   async mounted() {
                     this.$el.addEventListener('click', this.onClick);
                   }
                 }`,
          errors: [{ messageId: 'useOnMethod' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   async destroyed() {
                     this.$el.removeEventListener('click', this.onClick);
                   }
                 }`,
          errors: [{ messageId: 'useOnMethod' }],
        },
      ],
    });
  });
});
