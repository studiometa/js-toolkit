import { describe, it, expect, vi } from 'vitest';
import { Base, withMutation } from '@studiometa/js-toolkit';
import { nextTick } from '@studiometa/js-toolkit/utils';
import { h } from '#test-utils';

describe('The `withMutation` decorator', () => {
  it('should add a `mutated` hook', async () => {
    const fn = vi.fn();

    class Foo extends withMutation(Base) {
      static config = {
        name: 'Foo',
      };

      mutated(props) {
        fn(props);
      }
    }

    const div = h('div');
    const foo = new Foo(div);

    await foo.$mount();
    div.classList.add('foo');
    await nextTick();

    expect(fn).toHaveBeenCalledTimes(1);

    await foo.$destroy();
    div.classList.remove('foo');

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
