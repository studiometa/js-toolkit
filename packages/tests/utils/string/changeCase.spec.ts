import { describe, it, expect } from 'vitest';
import {
  camelCase,
  dashCase,
  lowerCase,
  pascalCase,
  snakeCase,
  upperCase,
} from '@studiometa/js-toolkit/utils';

const fns = {
  camelCase,
  dashCase,
  lowerCase,
  pascalCase,
  snakeCase,
  upperCase,
};

type Specs = {
  camelCase: string,
  dashCase: string,
  lowerCase: string,
  pascalCase: string,
  snakeCase: string,
  upperCase: string,
};

const tests = [
  [
    [''],
    {
      camelCase: '',
      pascalCase: '',
      snakeCase: '',
      dashCase: '',
      lowerCase: '',
      upperCase: '',
    },
  ],
  [
    ['foo', 'Foo', 'FOO'],
    {
      camelCase: 'foo',
      pascalCase: 'Foo',
      snakeCase: 'foo',
      dashCase: 'foo',
      lowerCase: 'foo',
      upperCase: 'FOO',
    },
  ],
  [
    ['fooBar', 'foo-bar', 'FOO-BAR', 'foo_bar', 'FOO_BAR', 'foo bar', 'FOO BAR'],
    {
      camelCase: 'fooBar',
      pascalCase: 'FooBar',
      snakeCase: 'foo_bar',
      dashCase: 'foo-bar',
    },
  ],
] as [string[], Specs][];

for (const [name, fn] of Object.entries(fns)) {
  describe(`The "${name}" function`, () => {
    for (const [values, specs] of tests) {
      const result = specs[name];
      if (result) {
        for (const value of values) {
          it(`should convert "${value}" to "${result}".`, () => {
            expect(fn(value)).toBe(result);
          });
        }
      }
    }
  });
}
