import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noConflictingNegatedOption } from './no-conflicting-negated-option.ts';

describe('no-conflicting-negated-option', () => {
  it('passes and fails correctly', () => {
    tester.run('no-conflicting-negated-option', noConflictingNegatedOption as any, {
      valid: [
        // `noSort` alone owns data-option-no-sort, and its own off spelling
        // doubles the prefix — data-option-no-no-sort — so nothing collides.
        `class Foo extends Base {
           static config = { name: 'Foo', options: { noSort: Boolean } };
         }`,
        `class Foo extends Base {
           static config = { name: 'Foo', options: { sort: Boolean, order: String } };
         }`,
        // `sort` is not a boolean, so it has no negated spelling to claim.
        `class Foo extends Base {
           static config = { name: 'Foo', options: { sort: String, noSort: Boolean } };
         }`,
        `class Foo extends Base {
           static config = { name: 'Foo' };
         }`,
      ],
      invalid: [
        {
          code: `class Foo extends Base {
                   static config = { name: 'Foo', options: { sort: Boolean, noSort: Boolean } };
                 }`,
          errors: [{ messageId: 'conflict' }],
        },
        {
          code: `class Foo extends Base {
                   static config = {
                     name: 'Foo',
                     options: { sort: { type: Boolean, default: true }, noSort: String },
                   };
                 }`,
          errors: [{ messageId: 'conflict' }],
        },
        {
          // A union which can hold a boolean still has a negated spelling.
          code: `class Foo extends Base {
                   static config = {
                     name: 'Foo',
                     options: { wrap: [Boolean, String], noWrap: Boolean },
                   };
                 }`,
          errors: [{ messageId: 'conflict' }],
        },
      ],
    });
  });
});
