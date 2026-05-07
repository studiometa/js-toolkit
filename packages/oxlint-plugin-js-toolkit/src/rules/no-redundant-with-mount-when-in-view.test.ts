import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noRedundantWithMountWhenInView } from './no-redundant-with-mount-when-in-view.ts';

describe('no-redundant-with-mount-when-in-view', () => {
  it('passes and fails correctly', () => {
    tester.run('no-redundant-with-mount-when-in-view', noRedundantWithMountWhenInView as any, {
      valid: [
        `import { Base, withScrolledInView } from '@studiometa/js-toolkit';
         class Foo extends withScrolledInView(Base) {}`,
        `import { Base, withMountWhenInView } from '@studiometa/js-toolkit';
         class Foo extends withMountWhenInView(Base) {}`,
        `import { Base } from '@studiometa/js-toolkit';
         class Foo extends Base {}`,
      ],
      invalid: [
        {
          code: `import { Base, withScrolledInView, withMountWhenInView } from '@studiometa/js-toolkit';
class Foo extends withScrolledInView(withMountWhenInView(Base)) {}`,
          errors: [{ messageId: 'redundant' }],
        },
        {
          code: `import { Base, withScrolledInView, withMountWhenInView } from '@studiometa/js-toolkit';
class Foo extends withScrolledInView(withMountWhenInView(withScrolledInView(Base))) {}`,
          errors: [{ messageId: 'redundant' }],
        },
      ],
    });
  });
});
