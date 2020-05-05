import * as utils from '../src/utils';

test('utils exports', () => {
  expect(Object.keys(utils)).toEqual([
    'debounce',
    'hasMethod',
    'isObject',
    'keyCodes',
    'nextFrame',
    'tabTrap',
    'throttle',
  ]);
});

describe('utils.debounce method', () => {
  it('should wait the given delay to call given function', () => {
    const fn = jest.fn(() => true);
    const debounced = utils.debounce(fn, 300);

    debounced();
    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    setTimeout(() => {
      expect(fn).not.toHaveBeenCalled();
    }, 150);

    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1);
    }, 300);
  });
});

describe('utils.throttle method', () => {
  it('should call the given function only once in the given delay', () => {
    const fn = jest.fn(() => true);
    const throttled = utils.throttle(fn, 300);

    throttled();
    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);

    setTimeout(() => {
      throttled();
      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(2);
    }, 300);
  });
});

describe('utils.hasMethod method', () => {
  it('should tell if an object has a method', () => {
    const obj = {
      foo: () => true,
    };

    expect(utils.hasMethod(obj, 'foo')).toBe(true);
    expect(utils.hasMethod(obj, 'bar')).toBe(false);
  });
});

describe('utils.isObject method', () => {
  it('`{}` is an object', () => {
    expect(utils.isObject({})).toBe(true);
  });

  it('`1` is not an object', () => {
    expect(utils.isObject(1)).toBe(false);
  });

  it('`"foo"` is not an object', () => {
    expect(utils.isObject('foo')).toBe(false);
  });

  it('`() => ({})` is not an object', () => {
    expect(utils.isObject(() => {})).toBe(false);
  });

  it('`function() {}` is not an object', () => {
    expect(utils.isObject(function fn() {})).toBe(false);
  });

  it('`[]` is not an object', () => {
    expect(utils.isObject([])).toBe(false);
  });
});
