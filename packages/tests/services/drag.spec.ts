import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDrag } from '@studiometa/js-toolkit';
import { h, advanceTimersByTimeAsync, useFakeTimers, useRealTimers } from '#test-utils';

function createEvent(type, data = {}, options = {}) {
  const event = new Event(type, options);
  for (const [name, value] of Object.entries(data)) {
    event[name] = value;
  }

  return event;
}

describe('The drag service', () => {
  beforeEach(() => useFakeTimers());
  afterEach(() => useRealTimers());

  it('should start, drag and drop', () => {
    const fn = vi.fn();
    const div = document.createElement('div');
    const { add, props } = useDrag(div, { dampFactor: 0.1 });

    add('key', fn);
    div.dispatchEvent(createEvent('pointerdown', { x: 0, y: 0, button: 0 }));
    expect(fn).toHaveBeenCalledWith({
      target: div,
      mode: 'start',
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
    document.dispatchEvent(createEvent('mousemove', { clientX, clientY }));
    expect(fn).toHaveBeenLastCalledWith(props());
    expect(props().mode).toBe('drag');

    // Test double start prevention
    div.dispatchEvent(createEvent('pointerdown', { x: 0, y: 0, button: 0 }));
    expect(props().mode).toBe('drag');
    window.dispatchEvent(createEvent('pointerup'));
    expect(props().mode).toBe('drop');
  });

  it('should run with inertia and stop', async () => {
    const fn = vi.fn();
    const div = document.createElement('div');
    const { add, props } = useDrag(div, { dampFactor: 0.2 });
    add('key', fn);
    div.dispatchEvent(createEvent('pointerdown', { x: 0, y: 0, button: 0 }));
    const clientX = window.innerWidth / 2 + 10;
    const clientY = window.innerHeight / 2 + 10;
    document.dispatchEvent(createEvent('mousemove', { clientX, clientY }));
    await advanceTimersByTimeAsync(100);
    expect(fn).toHaveBeenLastCalledWith(props());
  });

  it('should prevent native drag', () => {
    const fn = vi.fn();
    const div = document.createElement('div');
    div.innerHTML = '<div></div>';
    const { add } = useDrag(div, { dampFactor: 0.1 });

    add('key', () => ({}));
    div.addEventListener('dragstart', fn);
    div.firstElementChild?.dispatchEvent(new Event('dragstart'));
    expect(fn).not.toHaveBeenCalled();
  });

  it('should not trigger the callback when stopped', () => {
    const fn = vi.fn();
    const div = document.createElement('div');
    const { add, remove } = useDrag(div, { dampFactor: 0.2 });

    add('key', fn);
    div.dispatchEvent(createEvent('pointerdown', { x: 0, y: 0, button: 0 }));
    expect(fn).toHaveBeenCalledTimes(1);
    remove('key');
    div.dispatchEvent(createEvent('pointerdown', { x: 0, y: 0, button: 0 }));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  // This test fails when run along the othe one in `drag.spec.js`
  it('should prevent click on child elements while dragging', async () => {
    const span = h('span');
    const div = h('div', [span]);
    const { add } = useDrag(div, { dampFactor: 0.1 });

    add('key', () => ({}));
    div.dispatchEvent(createEvent('pointerdown', { x: 0, y: 0, button: 0 }));
    document.dispatchEvent(createEvent('mousemove', { clientX: 0, clientY: 0 }));
    document.dispatchEvent(createEvent('mousemove', { clientX: 11, clientY: 11 }));
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
    div.dispatchEvent(createEvent('pointerdown', { x: 0, y: 0, button: 0 }));
    expect(props().delta).toEqual({ x: 0, y: 0 });
    document.dispatchEvent(createEvent('mousemove', { clientX: 0, clientY: 0 }));
    expect(props().delta).toEqual({ x: 0, y: 0 });
    document.dispatchEvent(createEvent('mousemove', { clientX: 10, clientY: 10 }));
    expect(props().delta).toEqual({ x: 10, y: 10 });
    window.dispatchEvent(createEvent('pointerup'));
    expect(props().mode).toBe('drop');

    // Second drag
    div.dispatchEvent(createEvent('pointerdown', { x: 0, y: 0, button: 0 }));
    expect(props().delta).toEqual({ x: 0, y: 0 });
    document.dispatchEvent(createEvent('mousemove', { clientX: 0, clientY: 0 }));
    expect(props().delta).toEqual({ x: 0, y: 0 });
    document.dispatchEvent(createEvent('mousemove', { clientX: 20, clientY: 20 }));
    expect(props().delta).toEqual({ x: 20, y: 20 });
    window.dispatchEvent(createEvent('pointerup'));
    expect(props().mode).toBe('drop');
  });
});
