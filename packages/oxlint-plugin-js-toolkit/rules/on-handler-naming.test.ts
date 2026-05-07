import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.js';
import { onHandlerNaming } from './on-handler-naming.js';

describe('on-handler-naming', () => {
  it('passes and fails correctly', () => {
    tester.run('on-handler-naming', onHandlerNaming as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           onClickButton() {}
           onWindowResize() {}
           onSliderChange() {}
         }`,
        // Getter starting with "on" — not an event handler
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           get onlyOfficial() { return true; }
         }`,
        // Method starting with "on" but not followed by uppercase — not an event handler
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           onlyOfficial() {}
         }`,
      ],
      invalid: [
        // Underscore in handler name — not valid camelCase
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   onClick_button() {}
                 }`,
          errors: [{ messageId: 'invalidName' }],
        },
      ],
    });
  });
});
