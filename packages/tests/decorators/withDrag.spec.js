import { jest } from '@jest/globals';
import { Base, withDrag } from '@studiometa/js-toolkit';

function createEvent(type, data, options) {
  const event = new Event(type, options);
  Object.entries(data).forEach(([name, value]) => {
    event[name] = value;
  });

  return event;
}

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
