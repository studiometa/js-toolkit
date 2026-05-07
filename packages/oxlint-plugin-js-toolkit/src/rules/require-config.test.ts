import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { requireConfig } from './require-config.ts';

describe('require-config', () => {
  it('passes and fails correctly', () => {
    tester.run('require-config', requireConfig as any, {
      valid: [
        // Has static config with name
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           static config = { name: 'Slider' };
         }`,
        // Not a Base subclass — ignored
        `class Slider extends SomeOtherClass {}`,
        // No superclass — ignored
        `class Slider {}`,
      ],
      invalid: [
        // Missing config entirely
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {}`,
          errors: [{ messageId: 'missingConfig' }],
        },
        // Config exists but no name
        {
          code: `import { Base } from '@studiometa/js-toolkit';
                 class Slider extends Base {
                   static config = { refs: ['btn'] };
                 }`,
          errors: [{ messageId: 'missingName' }],
        },
        // Bare Base identifier
        {
          code: `class Slider extends Base {}`,
          errors: [{ messageId: 'missingConfig' }],
        },
      ],
    });
  });
});
