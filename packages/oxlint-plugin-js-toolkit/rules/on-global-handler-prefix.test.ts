import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.js';
import { onGlobalHandlerPrefix } from './on-global-handler-prefix.js';

describe('on-global-handler-prefix', () => {
  it('passes and fails correctly', () => {
    tester.run('on-global-handler-prefix', onGlobalHandlerPrefix as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           onWindowResize() {}
           onDocumentScroll() {}
           onWindowClick() {}
         }`,
        // onClickButton is fine — not a bare global-only event
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           onClickButton() {}
         }`,
        // onClick on its own is valid — click can fire on a DOM element
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           onClick() {}
         }`,
        // onScroll on its own is valid — scroll can fire on a DOM element
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           onScroll() {}
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   onResize() {}
                 }`,
          errors: [{ messageId: 'missingPrefix' }],
        },
      ],
    });
  });
});
