import { Base, getClosestParent } from '@studiometa/js-toolkit';

describe('The `getInstanceFromElement` helper function', () => {
  class GrandChild extends Base {
    static config = {
      name: 'GrandChild',
    };
  }

  class Child extends Base {
    static config = {
      name: 'Child',
      components: {
        GrandChild,
      },
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
  const parent = new Parent(div.firstElementChild);
  parent.$mount();
  const [firstChild, secondChild] = parent.$children.Child;
  const [nestedParent] = parent.$children.Parent;

  it('should return the closest parent', () => {
    expect(getClosestParent(firstChild, Parent)).toBe(parent);
    expect(getClosestParent(secondChild, Parent)).toBe(nestedParent);
  });

  it('should return null when no parent has been found', () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
      };
    }
    expect(getClosestParent(firstChild, Foo)).toBeNull();
  });
});
