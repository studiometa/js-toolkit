import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noShadowDom } from './no-shadow-dom.ts';

describe('no-shadow-dom', () => {
  it('passes and fails correctly', () => {
    tester.run('no-shadow-dom', noShadowDom as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           async mounted() { this.$el.classList.add('ready'); }
         }`,
        // attachShadow outside a Base class — allowed
        `class MyElement extends HTMLElement {
           connectedCallback() { this.attachShadow({ mode: 'open' }); }
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   async mounted() { this.$el.attachShadow({ mode: 'open' }); }
                 }`,
          errors: [{ messageId: 'noShadow' }],
        },
      ],
    });
  });
});
