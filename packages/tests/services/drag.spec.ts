import { describe, it, expect } from 'bun:test';
import { jest } from '@jest/globals';
import { useDrag } from '@studiometa/js-toolkit';
import { wait } from '@studiometa/js-toolkit/utils';

function createEvent(type, data = {}, options = {}) {
  const event = new Event(type, options);
  for (const [name, value] of Object.entries(data)) {
    event[name] = value;
  }

  return event;
}

describe('The drag service', () => {
  it('should start, drag and drop', () => {
    const fn = jest.fn();
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
    const fn = jest.fn();
    const div = document.createElement('div');
    const { add, props } = useDrag(div, { dampFactor: 0.2 });
    add('key', fn);
    div.dispatchEvent(createEvent('pointerdown', { x: 0, y: 0, button: 0 }));
    const clientX = window.innerWidth / 2 + 10;
    const clientY = window.innerHeight / 2 + 10;
    document.dispatchEvent(createEvent('mousemove', { clientX, clientY }));
    await wait(100);
    expect(fn).toHaveBeenLastCalledWith(props());
  });

  it('should prevent native drag', () => {
    const fn = jest.fn();
    const div = document.createElement('div');
    div.innerHTML = '<div></div>';
    const { add } = useDrag(div, { dampFactor: 0.1 });

    add('key', () => ({}));
    div.addEventListener('dragstart', fn);
    div.firstElementChild?.dispatchEvent(new Event('dragstart'));
    expect(fn).not.toHaveBeenCalled();
  });

  it('should not trigger the callback when stopped', () => {
    const fn = jest.fn();
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
    let event;
    const fn = jest.fn((e) => (event = e));
    const div = document.createElement('div');
    div.innerHTML = '<div></div>';
    const { add } = useDrag(div, { dampFactor: 0.1 });

    add('key', () => ({}));
    div.firstElementChild?.addEventListener('click', fn);
    div.dispatchEvent(createEvent('pointerdown', { x: 0, y: 0, button: 0 }));
    document.dispatchEvent(createEvent('mousemove', { clientX: 0, clientY: 0 }));
    document.dispatchEvent(createEvent('mousemove', { clientX: 11, clientY: 11 }));
    await wait(100);
    div.firstElementChild?.dispatchEvent(new Event('click'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBeTrue();
  });
});
