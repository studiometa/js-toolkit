import { describe, it, expect, vi } from 'vitest';
import { Base, withRelativePointer } from '@studiometa/js-toolkit';

function createEvent(type: string, data: Record<string, unknown> = {}, options?: EventInit) {
  const event = new Event(type, options);
  for (const [name, value] of Object.entries(data)) {
    event[name] = value;
  }

  return event;
}

describe('The `withRelativePointer` decorator', () => {
  it('should add a `movedrelative` hook', async () => {
    const fn = vi.fn();

    class Foo extends withRelativePointer(Base) {
      static config = {
        name: 'Foo',
        emits: ['foo'],
      };

      movedrelative(props) {
        fn(props);
      }
    }

    const foo = new Foo(document.createElement('div'));
    await foo.$mount();
    document.dispatchEvent(createEvent('mousemove', { button: 0, clientX: 0, clientY: 0 }));
    expect(fn).toHaveBeenCalledTimes(1);
    await foo.$destroy();
    document.dispatchEvent(createEvent('mousemove', { button: 0, clientX: 0, clientY: 0 }));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
