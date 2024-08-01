import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Base, withDrag } from '@studiometa/js-toolkit';
import { h, createEvent, useFakeTimers, useRealTimers, advanceTimersByTimeAsync } from '#test-utils';

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  useRealTimers();
});

describe('The `withDrag` decorator', () => {
  it('should add a `dragged` hook', async () => {
    const fn = vi.fn();
    class Foo extends withDrag(Base) {
      static config = { name: 'Foo', emits: ['foo'] };

      dragged(props) {
        fn(props);
      }
    }

    const div = h('div');
    const foo = new Foo(div);
    foo.$mount();
    await advanceTimersByTimeAsync(1);
    div.dispatchEvent(createEvent('pointerdown', { button: 0, x: 0, y: 0 }));
    expect(fn).toHaveBeenCalledTimes(1);
    foo.$destroy();
    await advanceTimersByTimeAsync(1);
    div.dispatchEvent(createEvent('pointerdown', { button: 0, x: 0, y: 0 }));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
