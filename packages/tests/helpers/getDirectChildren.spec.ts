import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  Base,
  getDirectChildren,
  getInstanceFromElement,
  isDirectChild,
} from '@studiometa/js-toolkit';
import { h, useFakeTimers, useRealTimers, advanceTimersByTimeAsync  } from '#test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

async function createContext() {
  class Child extends Base {
    static config = {
      name: 'Child',
    };
  }

  class Parent extends Base {
    static config = {
      name: 'Parent',
      components: {
        Child,
        OtherChild: Child,
        Parent,
      },
    };
  }

  const firstChild = h('div', { dataComponent: 'Child', id: 'first-child' });
  const grandChild = h('div', { dataComponent: 'Child', id: 'grand-child' });
  const innerParent = h('div', { dataComponent: 'Parent' }, [grandChild]);
  const div = h('div', { dataComponent: 'Parent' }, [firstChild, innerParent]);

  const parent = new Parent(div);
  parent.$mount();
  await advanceTimersByTimeAsync(1);

  const directChildren = getDirectChildren(parent, 'Parent', 'Child');

  return { parent, firstChild, grandChild, directChildren, Parent, Child };
}

describe('The `getDirectChildren` helper function', () => {
  it('should return an empty array if no children components where found', async () => {
    const { parent } = await createContext();
    expect(getDirectChildren(parent, 'Parent', 'OtherChild')).toEqual([]);
    expect(getDirectChildren(parent, 'Parent', 'UndefinedChild')).toEqual([]);
  });

  it('should return first-child components', async () => {
    const { directChildren, firstChild, Child } = await createContext();
    expect(directChildren).toHaveLength(1);
    expect(directChildren).toEqual([getInstanceFromElement(firstChild, Child)]);
  });

  it('should not return grand-child components', async () => {
    const { parent, grandChild } = await createContext();
    expect(getDirectChildren(parent, 'Parent', 'Child')).not.toContain(grandChild);
  });

  it('should return all children if there is no nested parent', async () => {
    const { firstChild, Parent } = await createContext();
    const instance = new Parent(
      h('div', { dataComponent: 'Parent' }, [firstChild.cloneNode(), firstChild.cloneNode()]),
    );
    instance.$mount();
    await advanceTimersByTimeAsync(1);
    expect(getDirectChildren(instance, 'Parent', 'Child')).toHaveLength(2);
  });
});

describe('The `isDirectChild` helper function', () => {
  it('should return true when a component is a direct child', async () => {
    const { parent, firstChild, Child } = await createContext();
    expect(
      isDirectChild(parent, 'Parent', 'Child', getInstanceFromElement(firstChild, Child)),
    ).toBe(true);
  });

  it('should return false when a component is a grand child', async () => {
    const { parent, grandChild, Child } = await createContext();
    expect(
      isDirectChild(parent, 'Parent', 'Child', getInstanceFromElement(grandChild, Child)),
    ).toBe(false);
  });
});
