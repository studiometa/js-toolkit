import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDrag } from '@studiometa/js-toolkit';
import { h, advanceTimersByTimeAsync, useFakeTimers, useRealTimers, dispatch } from '#test-utils';

describe('The drag service', () => {
  beforeEach(() => useFakeTimers());
  afterEach(() => useRealTimers());

  it('should start, drag and drop', () => {
    const fn = vi.fn();
    const div = h('div');
    const { add, props } = useDrag(div, { dampFactor: 0.1 });

    add('key', fn);
    dispatch(div, 'pointerdown', { x: 0, y: 0, button: 0 });
    expect(fn).toHaveBeenCalledWith({
      target: div,
      mode: 'start',
      MODES: {
        START: 'start',
        DRAG: 'drag',
        DROP: 'drop',
        INERTIA: 'inertia',
        STOP: 'stop',
      },
      hasInertia: false,
      isGrabbing: true,
      x: 0,
      y: 0,
      delta: { x: 0, y: 0 },
      distance: { x: 0, y: 0 },
      final: { x: 0, y: 0 },
      origin: { x: 0, y: 0 },
    });
    expect(props().mode).toBe('start');

    const clientX = 10;
    const clientY = 10;
    dispatch(document, 'mousemove', { clientX, clientY });
    expect(fn).toHaveBeenLastCalledWith(props());
    expect(props().mode).toBe('drag');

    // Test double start prevention
    dispatch(div, 'pointerdown', { x: 0, y: 0, button: 0 });
    expect(props().mode).toBe('drag');
    dispatch(window, 'pointerup');
    expect(props().mode).toBe('drop');
  });

  it('should run with inertia and stop', async () => {
    const fn = vi.fn();
    const div = h('div');
    const { add, props } = useDrag(div, { dampFactor: 0.2 });
    add('key', fn);
    dispatch(div, 'pointerdown', { x: 0, y: 0, button: 0 });
    let clientX = window.innerWidth / 2 + 10;
    let clientY = window.innerHeight / 2 + 10;
    dispatch(document, 'mousemove', { clientX, clientY });
    await advanceTimersByTimeAsync(100);
    clientX += 100;
    clientY += 100;
    dispatch(window, 'pointerup', { clientX, clientY });
    expect(props().mode).toBe('drop');
    await advanceTimersByTimeAsync(100);
    expect(props().mode).toBe('stop');
  });

  it('should prevent native drag', () => {
    const fn = vi.fn();
    const div = h('div');
    div.innerHTML = '<div></div>';
    const { add } = useDrag(div, { dampFactor: 0.1 });

    add('key', () => ({}));
    div.addEventListener('dragstart', fn);
    div.firstElementChild?.dispatchEvent(new Event('dragstart'));
    expect(fn).not.toHaveBeenCalled();
  });

  it('should not trigger the callback when stopped', () => {
    const fn = vi.fn();
    const div = h('div');
    const { add, remove } = useDrag(div, { dampFactor: 0.2 });

    add('key', fn);
    dispatch(div, 'pointerdown', { x: 0, y: 0, button: 0 });
    expect(fn).toHaveBeenCalledTimes(1);
    remove('key');
    dispatch(div, 'pointerdown', { x: 0, y: 0, button: 0 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  // This test fails when run along the othe one in `drag.spec.js`
  it('should prevent click on child elements while dragging', async () => {
    const span = h('span');
    const div = h('div', [span]);
    const { add } = useDrag(div, { dampFactor: 0.1 });

    add('key', () => ({}));
    dispatch(div, 'pointerdown', { x: 0, y: 0, button: 0 });
    dispatch(document, 'mousemove', { clientX: 0, clientY: 0 });
    dispatch(document, 'mousemove', { clientX: 0, clientY: 11 });
    await advanceTimersByTimeAsync(100);
    const event = new Event('click');
    const eventSpy = vi.spyOn(event, 'preventDefault');
    span.dispatchEvent(event);
    expect(eventSpy).toHaveBeenCalledTimes(1);
    eventSpy.mockRestore();
  });

  it('should reset delta props correctly', () => {
    const fn = vi.fn();
    const div = h('div');
    const { add, props } = useDrag(div, { dampFactor: 0.1 });

    add('key', fn);

    // First drag
    dispatch(div, 'pointerdown', { x: 0, y: 0, button: 0 });
    expect(props().delta).toEqual({ x: 0, y: 0 });
    dispatch(document, 'touchmove', { touches: [{ clientX: 0, clientY: 0 }] });
    expect(props().delta).toEqual({ x: 0, y: 0 });
    dispatch(document, 'touchmove', { touches: [{ clientX: 10, clientY: 10 }] });
    expect(props().delta).toEqual({ x: 10, y: 10 });
    dispatch(window, 'pointerup');
    expect(props().mode).toBe('drop');

    // Second drag
    dispatch(div, 'pointerdown', { x: 0, y: 0, button: 0 });
    expect(props().delta).toEqual({ x: 0, y: 0 });
    dispatch(document, 'touchmove', { touches: [{ clientX: 0, clientY: 0 }] });
    expect(props().delta).toEqual({ x: 0, y: 0 });
    dispatch(document, 'touchmove', { touches: [{ clientX: 20, clientY: 20 }] });
    expect(props().delta).toEqual({ x: 20, y: 20 });
    dispatch(window, 'pointerup');
    expect(props().mode).toBe('drop');
  });

  it('should not trigger the drop mode when no drag', () => {
    const fn = vi.fn();
    const div = h('div');
    const service = useDrag(div, { dampFactor: 0.1 });
    service.add('key', fn);
    dispatch(window, 'pointerup');
    expect(service.props().mode).not.toBe('drop');
    expect(fn).not.toHaveBeenCalled();
    service.remove('key');
  });
});
