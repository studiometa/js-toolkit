import { jest } from '@jest/globals';
import usePointer from '@studiometa/js-toolkit/services/pointer';
import nextFrame from '@studiometa/js-toolkit/utils/nextFrame';
import resizeWindow from '../__utils__/resizeWindow';
import wait from '../__utils__/wait';

/**
 * Dispatch an event on the document and wait for 100ms.
 *
 * @param  {Event}   event The event to dispatch.
 * @return {Promise}       A promise resolving after 100ms.
 */
async function dispatchEvent(event) {
  document.dispatchEvent(event);
  return wait(100);
}

describe('usePointer', () => {
  const { add, remove, props } = usePointer();
  let pointerProps;
  let fn;

  beforeEach(() => {
    remove('usePointer');
    fn = jest.fn((p) => {
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
    const event = new MouseEvent('mousemove', { clientX: 10, clientY: 10 });
    await dispatchEvent(event);

    expect(fn).toHaveBeenCalled();

    expect(pointerProps).toEqual({
      event,
      isDown: false,
      x: 10,
      y: 10,
      changed: {
        x: false,
        y: false,
      },
      last: {
        x: 10,
        y: 10,
      },
      delta: {
        x: 0,
        y: 0,
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

    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 11, clientY: 10 }));
    await nextFrame();
    expect(pointerProps.changed.x).toBe(true);
    expect(pointerProps.changed.y).toBe(false);
    expect(pointerProps.progress.x).toBe(0.011);
    await wait(100);
  });

  it('should trigger the callbacks on touchmove', async () => {
    await resizeWindow({ width: 1000, height: 1000 });
    await dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 0, clientY: 0 }] }));
    const event = new TouchEvent('touchmove', { touches: [{ clientX: 10, clientY: 10 }] });
    await dispatchEvent(event);

    expect(fn).toHaveBeenCalled();

    expect(pointerProps).toEqual({
      event,
      isDown: false,
      x: 10,
      y: 10,
      changed: {
        x: false,
        y: false,
      },
      last: {
        x: 10,
        y: 10,
      },
      delta: {
        x: 0,
        y: 0,
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

    const otherEvent = new TouchEvent('touchmove', { touches: [{ clientX: 11, clientY: 10 }] });
    document.dispatchEvent(otherEvent);
    await nextFrame();
    expect(pointerProps).toEqual({
      event: otherEvent,
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
