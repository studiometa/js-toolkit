import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noDollarPrefix } from './no-dollar-prefix.ts';

describe('no-dollar-prefix', () => {
  it('passes and fails correctly', () => {
    tester.run('no-dollar-prefix', noDollarPrefix as any, {
      valid: [
        // Not a Base subclass
        `class Foo { $method() {} }`,
        // Normal method names
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           mounted() {}
           myMethod() {}
           myProperty = 'foo';
         }`,
        // Static members are allowed (e.g. static config)
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static $config = {};
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  $myMethod() {}
}`,
          errors: [{ messageId: 'noDollarPrefix' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  $myProperty = 'foo';
}`,
          errors: [{ messageId: 'noDollarPrefix' }],
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  $onScroll() {}
  $helper() {}
}`,
          errors: [{ messageId: 'noDollarPrefix' }, { messageId: 'noDollarPrefix' }],
        },
      ],
    });
  });
});
