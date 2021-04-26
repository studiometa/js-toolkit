import isObject from '@studiometa/js-toolkit/utils/object/isObject';

describe('isObject method', () => {
  it('`{}` is an object', () => {
    expect(isObject({})).toBe(true);
  });

  it('`1` is not an object', () => {
    expect(isObject(1)).toBe(false);
  });

  it('`"foo"` is not an object', () => {
    expect(isObject('foo')).toBe(false);
  });

  it('`() => ({})` is not an object', () => {
    expect(isObject(() => {})).toBe(false);
  });

  it('`function() {}` is not an object', () => {
    expect(isObject(function fn() {})).toBe(false);
  });

  it('`[]` is not an object', () => {
    expect(isObject([])).toBe(false);
  });
});
