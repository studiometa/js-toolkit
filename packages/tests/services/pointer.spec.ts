import { describe, it, expect, vi, afterEach } from 'vitest';
import { PointerServiceProps, usePointer } from '@studiometa/js-toolkit';
import { createEvent } from '#test-utils';

const key = 'usePointer';
const { add, remove, props } = usePointer();

afterEach(() => {
  remove(key);
});

function getContext() {
  let pointerProps: PointerServiceProps;
  const fn = vi.fn((p) => {
    pointerProps = p;
  });

  add(key, fn);

  return {
    fn,
    pointerProps: () => pointerProps,
  };
}

describe('usePointer', () => {
  it('should export the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  it('should trigger the callbacks on mousedown and mouseup', () => {
    const { fn, pointerProps } = getContext();
    document.dispatchEvent(createEvent('mousedown'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(pointerProps().isDown).toBe(true);
    document.dispatchEvent(createEvent('mouseup'));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(pointerProps().isDown).toBe(false);
  });

  it('should trigger the callbacks on touchstart and touchend', () => {
    const { fn, pointerProps } = getContext();
    document.dispatchEvent(new TouchEvent('touchstart'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(pointerProps().isDown).toBe(true);
    document.dispatchEvent(new TouchEvent('touchend'));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(pointerProps().isDown).toBe(false);
  });

  it('should trigger multiple callbacks', () => {
    const { fn } = getContext();
    const otherFn = vi.fn();
    add('otherUsePointer', otherFn);
    document.dispatchEvent(createEvent('mouseup'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(otherFn).toHaveBeenCalledTimes(1);
    remove('otherUsePointer');
  });

  it('should not trigger callbacks after removal', () => {
    const { fn } = getContext();
    remove('usePointer');
    const options = { clientX: 0, clientY: 0 };
    const touchOptions = { touches: [{ clientX: 0, clientY: 0 }] };
    document.dispatchEvent(createEvent('mouseup', options));
    document.dispatchEvent(createEvent('mousedown', options));
    document.dispatchEvent(createEvent('mousemove', options));
    document.dispatchEvent(createEvent('touchstart', touchOptions));
    document.dispatchEvent(createEvent('touchend', touchOptions));
    document.dispatchEvent(createEvent('touchmove', touchOptions));
    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('should trigger the callbacks on mousemove', () => {
    const { fn } = getContext();
    document.dispatchEvent(createEvent('mousemove', { clientX: 0, clientY: 0 }));
    const progress = 0.1;
    const x = Math.round(window.innerWidth * progress);
    const y = Math.round(window.innerHeight * progress);

    const event = createEvent('mousemove', { clientX: x, clientY: y });
    document.dispatchEvent(event);

    expect(fn).toHaveBeenLastCalledWith(props());

    const newX = x + 10;
    document.dispatchEvent(createEvent('mousemove', { clientX: newX, clientY: y }));
    expect(fn).toHaveBeenLastCalledWith(props());
  });

  it('should trigger the callbacks on touchmove', () => {
    const { fn } = getContext();
    document.dispatchEvent(createEvent('touchmove', { touches: [{ clientX: 0, clientY: 0 }] }));

    const progress = 0.1;
    const x = Math.round(window.innerWidth * progress);
    const y = Math.round(window.innerHeight * progress);

    const event = createEvent('touchmove', { touches: [{ clientX: x, clientY: y }] });
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
    const otherEvent = createEvent('touchmove', { touches: [{ clientX: newX, clientY: y }] });
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
