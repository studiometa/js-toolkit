/* eslint-disable require-jsdoc, max-classes-per-file */
import { describe, it, expect } from 'bun:test';
import {
  Base,
  getDirectChildren,
  getInstanceFromElement,
  isDirectChild,
} from '@studiometa/js-toolkit';
import { h } from '../__utils__/h.js';

function createContext() {
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

  const directChildren = getDirectChildren(parent, 'Parent', 'Child');

  return { parent, firstChild, grandChild, directChildren, Parent, Child };
}

describe('The `getDirectChildren` helper function', () => {
  const { parent, directChildren, firstChild, grandChild, Child, Parent } = createContext();

  it('should return an empty array if no children components where found', () => {
    expect(getDirectChildren(parent, 'Parent', 'OtherChild')).toEqual([]);
    expect(getDirectChildren(parent, 'Parent', 'UndefinedChild')).toEqual([]);
  });

  it('should return first-child components', () => {
    expect(directChildren).toHaveLength(1);
    expect(directChildren).toEqual([getInstanceFromElement(firstChild, Child)]);
  });

  it('should not return grand-child components', () => {
    expect(getDirectChildren(parent, 'Parent', 'Child')).not.toContain(grandChild);
  });

  it('should return all children if there is no nested parent', () => {
    const instance = new Parent(
      h('div', { dataComponent: 'Parent' }, [firstChild.cloneNode(), firstChild.cloneNode()]),
    );
    instance.$mount();
    expect(getDirectChildren(instance, 'Parent', 'Child')).toHaveLength(2);
  });
});

describe('The `isDirectChild` helper function', () => {
  const { parent, firstChild, grandChild, Child } = createContext();

  it('should return true when a component is a direct child', () => {
    expect(
      isDirectChild(parent, 'Parent', 'Child', getInstanceFromElement(firstChild, Child)),
    ).toBe(true);
  });

  it('should return false when a component is a grand child', () => {
    expect(
      isDirectChild(parent, 'Parent', 'Child', getInstanceFromElement(grandChild, Child)),
    ).toBe(false);
  });
});
