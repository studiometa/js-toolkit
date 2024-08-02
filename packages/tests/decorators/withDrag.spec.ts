import { describe, it, expect, vi } from 'vitest';
import { Base, withDrag } from '@studiometa/js-toolkit';
import { h, createEvent } from '#test-utils';

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
    await foo.$mount();
    div.dispatchEvent(createEvent('pointerdown', { button: 0, x: 0, y: 0 }));
    expect(fn).toHaveBeenCalledTimes(1);
    await foo.$destroy();
    div.dispatchEvent(createEvent('pointerdown', { button: 0, x: 0, y: 0 }));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
