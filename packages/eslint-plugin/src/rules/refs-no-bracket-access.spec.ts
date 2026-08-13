import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { refsNoBracketAccess } from './refs-no-bracket-access.ts';

describe('refs-no-bracket-access', () => {
  it('passes and fails correctly', () => {
    tester.run('refs-no-bracket-access', refsNoBracketAccess as any, {
      valid: [
        `this.$refs.items;`,
        `this.$refs['items'];`,
        `this.$refs['items[]'.replace('[]', '')];`,
      ],
      invalid: [
        {
          code: `this.$refs['items[]'];`,
          errors: [{ messageId: 'noBracketAccess' }],
          output: `this.$refs.items;`,
        },
        {
          code: `this.$refs['other-items[]'];`,
          errors: [{ messageId: 'noBracketAccess' }],
          output: `this.$refs.otherItems;`,
        },
        {
          code: `this.$refs['my_items[]'];`,
          errors: [{ messageId: 'noBracketAccess' }],
          output: `this.$refs.myItems;`,
        },
      ],
    });
  });
});
