import { Base, getDirectChildren, getInstanceFromElement } from '@studiometa/js-toolkit';

describe('The `getDirectChildren` helper function', () => {
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

  it('should return first-child components', () => {
    expect(directChildren).toHaveLength(1);
    expect(directChildren).toEqual([getInstanceFromElement(firstChild, Child)]);
  });

  it('should not return grand-child components', () => {
    expect(getDirectChildren(parent, 'Parent', 'Child')).not.toContain(grandChild);
  });
});
