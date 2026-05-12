import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { emitsMultiWord } from './emits-multi-word.ts';

describe('emits-multi-word', () => {
  it('passes and fails correctly', () => {
    tester.run('emits-multi-word', emitsMultiWord as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo', emits: ['content-change'] };
         }`,
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo', emits: ['value-input', 'panel-toggle'] };
         }`,
        // No emits — should not error
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo' };
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', emits: ['click'] };
}`,
          errors: [{ messageId: 'singleWord' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', emits: ['switch'] };
}`,
          errors: [{ messageId: 'singleWord' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', emits: ['dragged', 'content-change'] };
}`,
          errors: [{ messageId: 'singleWord' }],
        },
      ],
    });
  });
});
