import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { emitsKebabCase } from './emits-kebab-case.ts';

describe('emits-kebab-case', () => {
  it('passes and fails correctly', () => {
    tester.run('emits-kebab-case', emitsKebabCase as any, {
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
  static config = { name: 'Foo', emits: ['contentChange'] };
}`,
          errors: [{ messageId: 'notKebabCase' }],
          output: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', emits: ['content-change'] };
}`,
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', emits: ['ContentChange'] };
}`,
          errors: [{ messageId: 'notKebabCase' }],
          output: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', emits: ['content-change'] };
}`,
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', emits: ['content_change'] };
}`,
          errors: [{ messageId: 'notKebabCase' }],
          output: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', emits: ['content-change'] };
}`,
        },
      ],
    });
  });
});
