import * as utils from '../src/utils';
import wait from './__utils__/wait';

test('utils exports', () => {
  expect(Object.keys(utils)).toEqual([
    'debounce',
    'focusTrap',
    'hasMethod',
    'isObject',
    'keyCodes',
    'nextFrame',
    'setClasses',
    'setStyles',
    'throttle',
  ]);
});

describe('utils.debounce method', () => {
  it('should wait the given delay to call given function', async () => {
    const fn = jest.fn(() => true);
    const debounced = utils.debounce(fn, 400);

    debounced();
    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    await wait(150);
    expect(fn).not.toHaveBeenCalled();

    await wait(400);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should wait for 300ms when used without the delay parameter', async () => {
    const fn = jest.fn();
    const debounced = utils.debounce(fn);

    debounced();
    debounced();

    await wait(200);
    expect(fn).not.toHaveBeenCalled();
    await wait(301);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('utils.throttle method', () => {
  it('should call the given function only once in the given delay', async () => {
    const fn = jest.fn(() => true);
    const throttled = utils.throttle(fn, 300);

    throttled();
    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);

    await wait(400);
    throttled();
    throttled();
    throttled();
    throttled();
    await wait(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call the callback after 16ms when no delay provided', async () => {
    const fn = jest.fn(() => true);
    const throttled = utils.throttle(fn);

    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);

    await wait(10);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    await wait(20);
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
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

describe('utils.nextFrame method', () => {
  it('should execute the callback function in the next frame', async () => {
    const fn = jest.fn();
    utils.nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    await wait(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should work server-side', async () => {
    // Mock window === undefined
    // @see https://stackoverflow.com/a/56999581
    const windowSpy = jest.spyOn(global, 'window', 'get');
    const fn = jest.fn();
    windowSpy.mockImplementation(() => undefined);

    utils.nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    await wait(1);
    await wait(1);
    expect(fn).toHaveBeenCalledTimes(1);
    windowSpy.mockRestore();
  });
});

describe('utils.setClasses method', () => {
  const element = document.createElement('div');

  it('should add classes to an element', () => {
    utils.setClasses(element, 'foo bar');
    expect(Array.from(element.classList)).toEqual(['foo', 'bar']);
  });

  it('should remove classes from an element', () => {
    utils.setClasses(element, 'foo bar', 'remove');
    expect(Array.from(element.classList)).toEqual([]);
  });

  it('should toggle classes from an element', () => {
    utils.setClasses(element, 'foo bar', 'toggle');
    expect(Array.from(element.classList)).toEqual(['foo', 'bar']);
    utils.setClasses(element, 'foo bar', 'toggle');
    expect(Array.from(element.classList)).toEqual([]);
  });

  it('should fail silently', () => {
    expect(utils.setClasses(element)).toBeUndefined();
    expect(utils.setClasses()).toBeUndefined();
  });
});

describe('utils.setStyles method', () => {
  const element = document.createElement('div');

  it('should add styles to an element', () => {
    utils.setStyles(element, { display: 'block', width: '100px' });
    expect(element.style.cssText).toEqual('display: block; width: 100px;');
  });

  it('should remove styles from an element', () => {
    utils.setStyles(element, { display: 'block' }, 'remove');
    expect(element.style.cssText).toEqual('width: 100px;');
    utils.setStyles(element, { width: '100px' }, 'remove');
    expect(element.style.cssText).toEqual('');
  });

  it('should fail silently', () => {
    expect(utils.setStyles(element, 'foo')).toBeUndefined();
    expect(utils.setStyles(element)).toBeUndefined();
    expect(utils.setStyles()).toBeUndefined();
  });
});
