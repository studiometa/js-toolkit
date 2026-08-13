import { describe, it, expect } from 'vitest';
import { Base, getInstanceFromElement } from '@studiometa/js-toolkit';
import { h } from '#test-utils';

describe('The `getInstanceFromElement` helper function', () => {
  class Foo extends Base {
    static config = {
      name: 'Foo',
    };
  }

  it('should return `null` if element not given', () => {
    expect(getInstanceFromElement(null, Foo)).toBeNull();
  });

  it('should return `null` when instance not found', () => {
    const div = h('div');
    expect(getInstanceFromElement(div, Foo)).toBeNull();
  });

  it('should return the instance attached to the given element', () => {
    const div = h('div');
    const foo = new Foo(div);
    expect(getInstanceFromElement(div, Foo)).toBe(foo);
  });
});
