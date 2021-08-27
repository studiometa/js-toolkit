import { jest } from '@jest/globals';
import { html } from 'htl';
import Base from '@studiometa/js-toolkit/index';
import wait from '../../__utils__/wait.js';

describe('The events to method binding', () => {
  it('should only bind the latest method in the prototype chain', () => {
    const fn = jest.fn();
    const fn2 = jest.fn();

    class Foo extends Base {
      static config = {
        name: 'Foo',
        refs: ['btn'],
      };

      onBtnClick() {
        fn();
      }
    }

    class Bar extends Foo {
      onBtnClick() {
        fn2();
      }
    }

    const tpl = html`
      <div>
        <button data-ref="btn">Click me</button>
      </div>
    `;

    const bar = new Bar(tpl);
    bar.$mount();
    bar.$refs.btn.click();
    expect(fn).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('should bind event methods to children with a one letter name', () => {
    const fn = jest.fn();

    class A extends Base {
      static config = {
        name: 'A',
      };

      onClick() {
        this.$emit('click');
      }
    }

    class Foo extends Base {
      static config = {
        name: 'Foo',
        components: { A },
      };

      onAClick(event, index) {
        fn();
      }
    }

    const btn = html`<button data-component="A">Click me</button>`;
    const tpl = html`<div>${btn}</div>`;

    const foo = new Foo(tpl);
    foo.$mount();
    btn.click();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should bind method on async children', async () => {
    const fn = jest.fn();

    class Async extends Base {
      static config = {
        name: 'Async',
      };

      onClick() {
        this.$emit('click');
      }
    }

    async function importWithTimeout(response, delay = 100) {
      return new Promise(resolve => setTimeout(() => resolve(response), delay));
    }

    class Foo extends Base {
      static config = {
        name: 'Foo',
        components: { Async: () => importWithTimeout(Async) },
      };

      onAsyncClick(event, index) {
        fn();
      }
    }

    const btn = html`<button data-component="Async">Click me</button>`;
    const tpl = html`<div>${btn}</div>`;
    const foo = new Foo(tpl);
    foo.$mount();
    btn.click();
    expect(fn).toHaveBeenCalledTimes(0);
    await wait(150);
    expect(fn).toHaveBeenCalledTimes(0);
    btn.click();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
