import { Base, getInstanceFromElement } from '@studiometa/js-toolkit';

describe('The `getInstanceFromElement` helper function', () => {
  class Foo extends Base {
    static config = {
      name: 'Foo',
    };
  }

  it('should return `null` when instance not found', () => {
    const div = document.createElement('div');
    expect(getInstanceFromElement(div, Foo)).toBeNull();
  });

  it('should return the instance attached to the given element', () => {
    const div = document.createElement('div');
    const foo = new Foo(div);
    expect(getInstanceFromElement(div, Foo)).toBe(foo);
  });
});
