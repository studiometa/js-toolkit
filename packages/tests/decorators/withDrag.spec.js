import { jest } from '@jest/globals';
import { Base } from '@studiometa/js-toolkit';
import withDrag from '@studiometa/js-toolkit/decorators/withDrag';

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
    div.dispatchEvent(new MouseEvent('mousedown'));
    expect(fn).toHaveBeenCalledTimes(1);
    foo.$destroy();
    div.dispatchEvent(new MouseEvent('mousedown'));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
