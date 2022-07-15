import {
  Base,
  getDirectChildren,
  getInstanceFromElement,
  isDirectChild,
} from '@studiometa/js-toolkit';

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
      Parent,
    },
  };
}

const div = document.createElement('div');
div.innerHTML = `
  <div data-component="Parent">
    <div data-component="Child" id="first-child"></div>
    <div data-component="Parent">
      <div data-component="Child" id="grand-child"></div>
    </div>
  </div>
`;
const firstChild = div.querySelector('#first-child');
const grandChild = div.querySelector('#grand-child');

const parent = new Parent(div.firstElementChild);
parent.$mount();

const directChildren = getDirectChildren(parent, 'Parent', 'Child');

describe('The `getDirectChildren` helper function', () => {
  it('should return first-child components', () => {
    expect(directChildren).toHaveLength(1);
    expect(directChildren).toEqual([getInstanceFromElement(firstChild, Child)]);
  });

  it('should not return grand-child components', () => {
    expect(getDirectChildren(parent, 'Parent', 'Child')).not.toContain(grandChild);
  });
});

describe('The `isDirectChild` helper function', () => {
  it('should return true when a component is a direct child', () => {
    expect(
      isDirectChild(parent, 'Parent', getInstanceFromElement(firstChild, Child), 'Child')
    ).toBe(true);
  });

  it('should return false when a component is a grand child', () => {
    expect(
      isDirectChild(parent, 'Parent', getInstanceFromElement(grandChild, Child), 'Child')
    ).toBe(false);
  });
});
