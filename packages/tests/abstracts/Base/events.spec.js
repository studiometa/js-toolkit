import { jest } from '@jest/globals';
import { html } from 'htl';
import Base from '@studiometa/js-toolkit/index';

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
});
