import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Base, BaseConfig, getClosestParent } from '@studiometa/js-toolkit';
import { advanceTimersByTimeAsync, h, useFakeTimers, useRealTimers } from '#test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

async function getContext() {
  class GrandChild extends Base {
    static config: BaseConfig = {
      name: 'GrandChild',
    };
  }

  class Child extends Base<{ $children: { GrandChild: GrandChild[] } }> {
    static config: BaseConfig = {
      name: 'Child',
      components: {
        GrandChild,
      },
    };
  }

  class Parent extends Base<{
    $children: {
      Child: Child[];
      Parent: Parent[];
    };
  }> {
    static config: BaseConfig = {
      name: 'Parent',
      components: {
        Child,
        Parent,
      },
    };
  }

  const div = h('div');
  div.innerHTML = `
    <div data-component="Parent">
      <div data-component="Child">
        <div data-component="Parent">
          <div>
            <div data-component="Child">
              <div data-component="GrandChild"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  const parent = new Parent(div.firstElementChild as HTMLElement);
  parent.$mount();
  await advanceTimersByTimeAsync(1);
  const [firstChild, secondChild] = parent.$children.Child;
  const [nestedParent] = parent.$children.Parent;

  return {
    Parent,
    parent,
    firstChild,
    secondChild,
    nestedParent,
  };
}

describe('The `getInstanceFromElement` helper function', () => {
  it('should return the closest parent', async () => {
    const { Parent, firstChild, secondChild, parent, nestedParent } = await getContext();
    expect(getClosestParent(firstChild, Parent)).toBe(parent);
    expect(getClosestParent(secondChild, Parent)).not.toBeNull();
    expect(getClosestParent(secondChild, Parent)).toBe(nestedParent);
  });

  it('should return null when no parent has been found', async () => {
    const { firstChild } = await getContext();
    class Foo extends Base {
      static config = {
        name: 'Foo',
      };
    }
    expect(getClosestParent(firstChild, Foo)).toBeNull();
  });
});
