import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noManualIntersectionObserver } from './no-manual-intersection-observer.ts';

describe('no-manual-intersection-observer', () => {
  it('passes and fails correctly', () => {
    tester.run('no-manual-intersection-observer', noManualIntersectionObserver as any, {
      valid: [
        // Outside a Base subclass — allowed
        `const io = new IntersectionObserver(cb);`,
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           mounted() { /* uses withIntersectionObserver */ }
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  mounted() {
    this._io = new IntersectionObserver(cb);
    this._io.observe(this.$el);
  }
}`,
          errors: [{ messageId: 'noManual' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  mounted() {
    new IntersectionObserver((entries) => {}).observe(this.$el);
  }
}`,
          errors: [{ messageId: 'noManual' }],
        },
      ],
    });
  });
});
