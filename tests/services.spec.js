import * as services from '../src/services';
import resizeWindow from './__utils__/resizeWindow';
import wait from './__utils__/wait';

const dispatchEvent = event => {
  document.dispatchEvent(event);
  return wait(100);
};

test('services exports', () => {
  expect(Object.keys(services)).toEqual([
    'useKey',
    'usePointer',
    'useRaf',
    'useResize',
    'useScroll',
  ]);
});

describe('useKey', () => {
  const keydown = new KeyboardEvent('keydown', { keyCode: 27 });
  const keyup = new KeyboardEvent('keyup', { keyCode: 27 });
  const { add, remove, props } = services.useKey();
  let keyProps;
  const fn = jest.fn(p => {
    keyProps = p;
  });
  add('useKey', fn);

  test('exports the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  test('callbacks with the same key are not allowed', () => {
    expect(() => {
      add('useKey', () => {});
    }).toThrow('A callback with the key `useKey` has already been registered.');
  });

  test('callback should be triggered on keydown', () => {
    document.dispatchEvent(keydown);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(keyProps.direction).toBe('down');
    expect(keyProps.ESC).toBe(true);
    expect(keyProps.triggered).toBe(1);
    document.dispatchEvent(keydown);
    expect(keyProps.triggered).toBe(2);
  });

  test('callback should be triggered on keyup', () => {
    document.dispatchEvent(keyup);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(keyProps.direction).toBe('up');
    expect(keyProps.ESC).toBe(true);
    expect(keyProps.triggered).toBe(1);
    document.dispatchEvent(keyup);
    expect(keyProps.triggered).toBe(1);
  });

  test('callback should not be triggered after removal', () => {
    remove('useKey');
    document.dispatchEvent(keydown);
    expect(fn).toHaveBeenCalledTimes(4);
    expect(keyProps.direction).toBe('up');
  });
});

describe('usePointer', () => {
  const { add, remove, props } = services.usePointer();
  let pointerProps;
  let fn;

  beforeEach(() => {
    remove('usePointer');
    fn = jest.fn(p => {
      pointerProps = p;
    });
    add('usePointer', fn);
  });

  it('should export the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  it('should trigger the callbacks on mousedown and mouseup', async () => {
    await dispatchEvent(new MouseEvent('mousedown'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(pointerProps.isDown).toBe(true);
    await dispatchEvent(new MouseEvent('mouseup'));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(pointerProps.isDown).toBe(false);
  });

  it('should trigger the callbacks on touchstart and touchend', async () => {
    await dispatchEvent(new TouchEvent('touchstart'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(pointerProps.isDown).toBe(true);
    await dispatchEvent(new TouchEvent('touchend'));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(pointerProps.isDown).toBe(false);
  });

  it('should trigger multiple callbacks', async () => {
    const otherFn = jest.fn();
    add('otherUsePointer', otherFn);
    await dispatchEvent(new MouseEvent('mouseup'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(otherFn).toHaveBeenCalledTimes(1);
  });

  it('should not trigger callbacks after removal', async () => {
    remove('usePointer');
    await dispatchEvent(new MouseEvent('mouseup'));
    await dispatchEvent(new MouseEvent('mousedown'));
    await dispatchEvent(new MouseEvent('mousemove'));
    await dispatchEvent(new TouchEvent('touchstart'));
    await dispatchEvent(new TouchEvent('touchend'));
    await dispatchEvent(new TouchEvent('touchmove'));
    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('should trigger the callbacks on mousemove', async () => {
    await resizeWindow({ width: 1000, height: 1000 });
    await dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0 }));
    await dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }));

    expect(fn).toHaveBeenCalled();

    expect(pointerProps).toEqual({
      isDown: false,
      x: 10,
      y: 10,
      changed: {
        x: true,
        y: true,
      },
      last: {
        x: 0,
        y: 0,
      },
      delta: {
        x: 10,
        y: 10,
      },
      progress: {
        x: 0.01,
        y: 0.01,
      },
      max: {
        x: 1000,
        y: 1000,
      },
    });

    await dispatchEvent(new MouseEvent('mousemove', { clientX: 11, clientY: 10 }));
    expect(pointerProps.changed.x).toBe(true);
    expect(pointerProps.changed.y).toBe(false);
    expect(pointerProps.progress.x).toBe(0.011);
  });

  it('should trigger the callbacks on touchmove', async () => {
    await resizeWindow({ width: 1000, height: 1000 });
    await dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 0, clientY: 0 }] }));
    await dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 10, clientY: 10 }] }));

    expect(fn).toHaveBeenCalled();

    expect(pointerProps).toEqual({
      isDown: false,
      x: 10,
      y: 10,
      changed: {
        x: true,
        y: true,
      },
      last: {
        x: 0,
        y: 0,
      },
      delta: {
        x: 10,
        y: 10,
      },
      progress: {
        x: 0.01,
        y: 0.01,
      },
      max: {
        x: 1000,
        y: 1000,
      },
    });

    await dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 11, clientY: 10 }] }));

    expect(pointerProps).toEqual({
      isDown: false,
      x: 11,
      y: 10,
      changed: {
        x: true,
        y: false,
      },
      last: {
        x: 10,
        y: 10,
      },
      delta: {
        x: 1,
        y: 0,
      },
      progress: {
        x: 0.011,
        y: 0.01,
      },
      max: {
        x: 1000,
        y: 1000,
      },
    });
  });
});

describe('useRaf', () => {
  const { add, remove, props } = services.useRaf();
  let rafProps;
  let fn;
  let instance;

  beforeEach(() => {
    remove('key');
    fn = jest.fn(p => {
      rafProps = p;
    });
    instance = add('key', fn);
  });

  it('should export the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  it('should have a `time` prop', async () => {
    await wait(16);
    expect(typeof props().time).toBe('number');
    expect(typeof rafProps.time).toBe('number');
  });

  it('should trigger the callbkacks', async () => {
    await wait(16);
    expect(fn).toHaveBeenCalled();
    let numberOfCalls = fn.mock.calls.length;
    await wait(16);
    expect(fn.mock.calls.length).toBeGreaterThan(numberOfCalls);
    remove('key');
    numberOfCalls = fn.mock.calls.length;
    await wait(16);
    expect(fn.mock.calls.length).toBe(numberOfCalls);
  });

  it('should be ticking when having a callback', () => {
    expect(instance.callbacks.size).toBe(1);
    expect(instance.isTicking).toBe(true);
  });

  it('should stop ticking when having no callback', () => {
    remove('key');
    expect(instance.callbacks.size).toBe(0);
    expect(instance.isTicking).toBe(false);
  });
});

describe('useResize', () => {
  const { add, remove, props } = services.useResize();

  it('should export the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  it('should not trigger the callbacks when killed', async () => {
    const fn = jest.fn();
    add('key', fn);
    await resizeWindow({ width: 1000 });
    expect(fn).toHaveBeenCalledTimes(1);
    remove('key');
    await resizeWindow({ width: 800 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should have breakpoints props', async () => {
    expect(props().breakpoints).toBeUndefined();
    expect(props().breakpoint).toBeUndefined();

    document.body.innerHTML = '<div data-breakpoint></div>';
    await wait(100);

    expect(props().breakpoints).toEqual(['s', 'm', 'l']);
    await resizeWindow({ width: 600 });
    expect(props().breakpoint).toBe('s');
    await resizeWindow({ width: 800 });
    expect(props().breakpoint).toBe('m');
    await resizeWindow({ width: 1200 });
    expect(props().breakpoint).toBe('l');
  });
});

describe('useScroll', () => {
  const { add, remove, props } = services.useScroll();
  let fn;
  let scrollProps;

  beforeEach(() => {
    remove('key');
    fn = jest.fn(p => {
      scrollProps = p;
    });
    add('key', fn);
  });

  it('should export the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  it('should show a progress of 1 if there is no scroll', async () => {
    await resizeWindow({ width: 1000, height: 1000 });
    const scrollWidthSpy = jest.spyOn(document.body, 'scrollWidth', 'get');
    scrollWidthSpy.mockImplementation(() => window.innerWidth);

    const scrollHeightSpy = jest.spyOn(document.body, 'scrollHeight', 'get');
    scrollHeightSpy.mockImplementation(() => window.innerHeight);

    await dispatchEvent(new CustomEvent('scroll'));

    expect(scrollProps.progress).toEqual({ x: 1, y: 1 });

    scrollWidthSpy.mockRestore();
    scrollHeightSpy.mockRestore();
  });

  it('should trigger the callbacks on scroll', async () => {
    await resizeWindow({ width: 1000, height: 1000 });
    expect(fn).toHaveBeenCalledTimes(0);

    const scrollWidthSpy = jest.spyOn(document.body, 'scrollWidth', 'get');
    scrollWidthSpy.mockImplementation(() => window.innerWidth * 2);

    const scrollHeightSpy = jest.spyOn(document.body, 'scrollHeight', 'get');
    scrollHeightSpy.mockImplementation(() => window.innerHeight * 2);

    await dispatchEvent(new CustomEvent('scroll'));
    expect(scrollProps).toEqual({
      x: 0,
      y: 0,
      changed: { x: false, y: false },
      last: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      progress: { x: 0, y: 0 },
      max: { x: 1000, y: 1000 },
    });

    expect(fn).toHaveBeenCalledTimes(3);

    window.pageYOffset = 100;
    window.pageXOffset = 100;
    document.dispatchEvent(new CustomEvent('scroll'));
    expect(scrollProps).toEqual({
      x: 100,
      y: 100,
      changed: { x: true, y: true },
      last: { x: 0, y: 0 },
      delta: { x: 100, y: 100 },
      progress: { x: 0.1, y: 0.1 },
      max: { x: 1000, y: 1000 },
    });

    remove('key');
    await dispatchEvent(new CustomEvent('scroll'));
    expect(fn).toHaveBeenCalledTimes(4);

    scrollWidthSpy.mockRestore();
    scrollHeightSpy.mockRestore();
  });
});
