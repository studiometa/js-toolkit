import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { requireDestroyedCleanup } from './require-destroyed-cleanup.ts';

describe('require-destroyed-cleanup', () => {
  it('passes and fails correctly', () => {
    tester.run('require-destroyed-cleanup', requireDestroyedCleanup as any, {
      valid: [
        // Not a Base subclass
        `class Foo { mounted() { setTimeout(() => {}, 1000); } }`,
        // No timers
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           mounted() { this.$refs.btn.focus(); }
         }`,
        // Has timers and has destroyed()
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           mounted() { this._timer = setTimeout(() => {}, 1000); }
           destroyed() { clearTimeout(this._timer); }
         }`,
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           mounted() { this._raf = requestAnimationFrame(() => {}); }
           destroyed() { cancelAnimationFrame(this._raf); }
         }`,
        // ClassExpression with timers and destroyed — should pass
        `import { Base } from '@studiometa/js-toolkit';
         const Foo = class extends Base {
           mounted() { this._timer = setTimeout(() => {}, 1000); }
           destroyed() { clearTimeout(this._timer); }
         };`,
        // ClassExpression without timers — should pass
        `import { Base } from '@studiometa/js-toolkit';
         const Foo = class extends Base {
           mounted() { this.$refs.btn.focus(); }
         };`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  mounted() { this._timer = setTimeout(() => {}, 1000); }
}`,
          errors: [{ messageId: 'requireDestroyed' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  mounted() { this._interval = setInterval(() => {}, 500); }
}`,
          errors: [{ messageId: 'requireDestroyed' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  mounted() { this._raf = requestAnimationFrame(() => {}); }
}`,
          errors: [{ messageId: 'requireDestroyed' }],
        },
        // ClassExpression variant
        {
          code: `import { Base } from '@studiometa/js-toolkit';
const Foo = class extends Base {
  mounted() { this._timer = setTimeout(() => {}, 1000); }
};`,
          errors: [{ messageId: 'requireDestroyed' }],
        },
      ],
    });
  });
});
