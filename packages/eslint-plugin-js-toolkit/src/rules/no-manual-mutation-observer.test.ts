import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noManualMutationObserver } from './no-manual-mutation-observer.ts';

describe('no-manual-mutation-observer', () => {
  it('passes and fails correctly', () => {
    tester.run('no-manual-mutation-observer', noManualMutationObserver as any, {
      valid: [
        // Outside a Base subclass — allowed
        `const mo = new MutationObserver(cb);`,
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           mounted() { /* uses withMutation */ }
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  mounted() {
    this._mo = new MutationObserver(cb);
    this._mo.observe(this.$el, { childList: true });
  }
}`,
          errors: [{ messageId: 'noManual' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  mounted() {
    new MutationObserver((records) => {}).observe(this.$el, { attributes: true });
  }
}`,
          errors: [{ messageId: 'noManual' }],
        },
      ],
    });
  });
});
