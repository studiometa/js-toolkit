import { describe, it, expect, jest } from 'bun:test';
import { Base, withDrag } from '@studiometa/js-toolkit';
import { createEvent } from '../__utils__/event.js';

describe('The `withDrag` decorator', () => {
  it('should add a `dragged` hook', () => {
    const fn = jest.fn();
    class Foo extends withDrag(Base) {
      static config = { name: 'Foo', emits: ['foo'] };

      dragged(props) {
        fn(props);
      }
    }

    const div = document.createElement('div');
    const foo = new Foo(div);
    foo.$mount();
    div.dispatchEvent(createEvent('pointerdown', { button: 0, x: 0, y: 0 }));
    expect(fn).toHaveBeenCalledTimes(1);
    foo.$destroy();
    div.dispatchEvent(createEvent('pointerdown', { button: 0, x: 0, y: 0 }));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
