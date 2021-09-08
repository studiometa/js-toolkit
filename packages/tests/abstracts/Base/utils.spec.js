import { jest } from '@jest/globals';
import { hasMethod } from '@studiometa/js-toolkit/abstracts/Base/utils';

describe('Base utils functions', () => {
  test('the `hasMethod` function should work', () => {
    const obj = { foo: () => null, bar: 'bar' };
    expect(hasMethod(obj, 'foo')).toBe(true);
    expect(hasMethod(obj, 'bar')).toBe(false);
    expect(hasMethod(obj, 'baz')).toBe(false);
  });
});
