import { jest } from '@jest/globals';
import { Base, withRelativePointer } from '@studiometa/js-toolkit';

function createEvent(type, data, options) {
  const event = new Event(type, options);
  Object.entries(data).forEach(([name, value]) => {
    event[name] = value;
  });

  return event;
}

describe('The `withRelativePointer` decorator', () => {
  it('should add a `movedrelative` hook', () => {
    const fn = jest.fn();
    class Foo extends withRelativePointer(Base) {
      static config = { name: 'Foo', emits: ['foo'] };

      movedrelative(props) {
        fn(props);
      }
    }

    const foo = new Foo(document.createElement('div'));
    foo.$mount();
    document.dispatchEvent(createEvent('mousemove', { button: 0, clientX: 0, clientY: 0 }));
    expect(fn).toHaveBeenCalledTimes(1);
    foo.$destroy();
    document.dispatchEvent(createEvent('mousemove', { button: 0, clientX: 0, clientY: 0 }));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
