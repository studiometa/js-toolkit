import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.js';
import { asyncLifecycleMethods } from './async-lifecycle-methods.js';

describe('async-lifecycle-methods', () => {
  it('passes and fails correctly', () => {
    tester.run('async-lifecycle-methods', asyncLifecycleMethods as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Slider extends Base {
           static config = { name: 'Slider' };
           async mounted() {}
           async destroyed() {}
           async ticked() {}
         }`,
        // Non-Base class — ignored
        `class Slider extends Other {
           mounted() {}
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Slider extends Base {
  mounted() {}
}`,
          errors: [{ messageId: 'notAsync' }],
          output: `import { Base } from '@studiometa/js-toolkit';
class Slider extends Base {
  async mounted() {}
}`,
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Slider extends Base {
  destroyed() {}
  scrolled() {}
}`,
          errors: [{ messageId: 'notAsync' }, { messageId: 'notAsync' }],
          output: `import { Base } from '@studiometa/js-toolkit';
class Slider extends Base {
  async destroyed() {}
  async scrolled() {}
}`,
        },
      ],
    });
  });
});
