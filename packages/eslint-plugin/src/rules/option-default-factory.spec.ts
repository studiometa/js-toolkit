import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { optionDefaultFactory } from './option-default-factory.ts';

describe('option-default-factory', () => {
  it('passes and fails correctly', () => {
    tester.run('option-default-factory', optionDefaultFactory as any, {
      valid: [
        `class Foo extends Base {
           static config = {
             name: 'Foo',
             options: { requestInit: { type: Object, default: () => ({}) } },
           };
         }`,
        `class Foo extends Base {
           static config = {
             name: 'Foo',
             options: { items: { type: Array, default: () => [] } },
           };
         }`,
        // A primitive default is shared harmlessly.
        `class Foo extends Base {
           static config = {
             name: 'Foo',
             options: { speed: { type: Number, default: 5 }, mode: { type: String, default: 'a' } },
           };
         }`,
        // Shorthand declarations carry no default at all.
        `class Foo extends Base {
           static config = { name: 'Foo', options: { open: Boolean } };
         }`,
      ],
      invalid: [
        {
          code: `class Foo extends Base {
                   static config = {
                     name: 'Foo',
                     options: { requestInit: { type: Object, default: {} } },
                   };
                 }`,
          errors: [{ messageId: 'literalDefault' }],
        },
        {
          code: `class Foo extends Base {
                   static config = {
                     name: 'Foo',
                     options: { items: { type: Array, default: ['a'] } },
                   };
                 }`,
          errors: [{ messageId: 'literalDefault' }],
        },
        {
          code: `class Foo extends Base {
                   static config = {
                     name: 'Foo',
                     options: {
                       a: { type: Object, default: { x: 1 } },
                       b: { type: Array, default: [] },
                     },
                   };
                 }`,
          errors: [{ messageId: 'literalDefault' }, { messageId: 'literalDefault' }],
        },
      ],
    });
  });
});
