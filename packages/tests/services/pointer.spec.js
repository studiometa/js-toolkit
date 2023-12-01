import { jest } from '@jest/globals';
import { usePointer } from '@studiometa/js-toolkit';

describe('usePointer', () => {
  const { add, remove, props } = usePointer();
  let pointerProps;
  const fn = jest.fn((p) => {
    pointerProps = p;
  });

  add('usePointer', fn);

  beforeEach(() => {
    fn.mockClear();
  });

  it('should export the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  it('should trigger the callbacks on mousedown and mouseup', () => {
    document.dispatchEvent(new MouseEvent('mousedown'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(pointerProps.isDown).toBe(true);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(pointerProps.isDown).toBe(false);
  });

  it('should trigger the callbacks on touchstart and touchend', () => {
    document.dispatchEvent(new TouchEvent('touchstart'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(pointerProps.isDown).toBe(true);
    document.dispatchEvent(new TouchEvent('touchend'));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(pointerProps.isDown).toBe(false);
  });

  it('should trigger multiple callbacks', () => {
    const otherFn = jest.fn();
    add('otherUsePointer', otherFn);
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(otherFn).toHaveBeenCalledTimes(1);
  });

  it('should not trigger callbacks after removal', () => {
    remove('usePointer');
    document.dispatchEvent(new MouseEvent('mouseup'));
    document.dispatchEvent(new MouseEvent('mousedown'));
    document.dispatchEvent(new MouseEvent('mousemove'));
    document.dispatchEvent(new TouchEvent('touchstart'));
    document.dispatchEvent(new TouchEvent('touchend'));
    document.dispatchEvent(new TouchEvent('touchmove'));
    expect(fn).toHaveBeenCalledTimes(0);
    add('usePointer', fn);
  });

  it('should trigger the callbacks on mousemove', () => {
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0 }));
    const progress = 0.1;
    const x = Math.round(window.innerWidth * progress);
    const y = Math.round(window.innerHeight * progress);

    const event = new MouseEvent('mousemove', {  clientX: x, clientY: y });
    document.dispatchEvent(event);

    expect(fn).toHaveBeenLastCalledWith({
      event,
      isDown: false,
      x,
      y,
      changed: {
        x: true,
        y: true,
      },
      last: {
        x: 0,
        y: 0,
      },
      delta: {
        x,
        y,
      },
      progress: {
        x: x / window.innerWidth,
        y: y / window.innerHeight,
      },
      max: {
        x: window.innerWidth,
        y: window.innerHeight,
      },
    });

    const newX = x + 10;
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: newX, clientY: y }));
    expect(fn).toHaveBeenLastCalledWith({
      event,
      isDown: false,
      x: newX,
      y,
      changed: {
        x: true,
        y: false,
      },
      last: {
        x,
        y,
      },
      delta: {
        x: newX - x,
        y: 0,
      },
      progress: {
        x: newX / window.innerWidth,
        y: y / window.innerHeight,
      },
      max: {
        x: window.innerWidth,
        y: window.innerHeight,
      },
    });
  });

  it('should trigger the callbacks on touchmove', () => {
    document.dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 0, clientY: 0 }] }));

    const progress = 0.1;
    const x = Math.round(window.innerWidth * progress);
    const y = Math.round(window.innerHeight * progress);

    const event = new TouchEvent('touchmove', { touches: [{ clientX: x, clientY: y }] });
    document.dispatchEvent(event);

    expect(fn).toHaveBeenLastCalledWith({
      event,
      isDown: false,
      x,
      y,
      changed: {
        x: true,
        y: true,
      },
      last: {
        x: 0,
        y: 0,
      },
      delta: {
        x,
        y,
      },
      progress: {
        x: x / window.innerWidth,
        y: y / window.innerHeight,
      },
      max: {
        x: window.innerWidth,
        y: window.innerHeight,
      },
    });

    const newX = x + 10;
    const otherEvent = new TouchEvent('touchmove', { touches: [{ clientX: newX, clientY: y }] });
    document.dispatchEvent(otherEvent);
    expect(fn).toHaveBeenLastCalledWith({
      event: otherEvent,
      isDown: false,
      x: newX,
      y,
      changed: {
        x: true,
        y: false,
      },
      last: {
        x,
        y,
      },
      delta: {
        x: newX - x,
        y: 0,
      },
      progress: {
        x: newX / window.innerWidth,
        y: y / window.innerHeight,
      },
      max: {
        x: window.innerWidth,
        y: window.innerHeight,
      },
    });
  });
});
