import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { componentsPascalCase } from './components-pascal-case.ts';

describe('components-pascal-case', () => {
  it('passes and fails correctly', () => {
    tester.run('components-pascal-case', componentsPascalCase as any, {
      valid: [
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo', components: { MyChild: MyChild } };
         }`,
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo', components: { Slider, NavMenu, HeroBlock } };
         }`,
        // No components — should not error
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {
           static config = { name: 'Foo' };
         }`,
      ],
      invalid: [
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', components: { myChild: MyChild } };
}`,
          errors: [{ messageId: 'notPascalCase' }],
          output: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', components: { MyChild: MyChild } };
}`,
        },
        {
          code: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', components: { 'nav-menu': NavMenu } };
}`,
          errors: [{ messageId: 'notPascalCase' }],
          output: `import { Base } from '@studiometa/js-toolkit';
class Foo extends Base {
  static config = { name: 'Foo', components: { 'NavMenu': NavMenu } };
}`,
        },
      ],
    });
  });
});
