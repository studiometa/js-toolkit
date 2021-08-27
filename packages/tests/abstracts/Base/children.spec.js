import { jest } from '@jest/globals';
import Base from '@studiometa/js-toolkit/index';
import { getComponentElements } from '@studiometa/js-toolkit/abstracts/Base/utils';

describe('The component resolution', () => {
  it('should resolve components by name', () => {
    const component1 = document.createElement('div');
    component1.setAttribute('data-component', 'Component');
    const component2 = document.createElement('div');
    component2.setAttribute('data-component', 'OtherComponent');
    document.body.appendChild(component1);
    document.body.appendChild(component2);
    expect(getComponentElements('Component')).toEqual([component1]);
  });

  it('should resolve components by CSS selector', () => {
    const component1 = document.createElement('div');
    component1.classList.add('component');
    const component2 = document.createElement('div');
    component2.setAttribute('data-component', 'component');
    document.body.appendChild(component1);
    document.body.appendChild(component2);
    expect(getComponentElements('.component')).toEqual([component1]);
  });

  it('should resolve components by complex selector', () => {
    const link1 = document.createElement('a');
    link1.href = 'https://www.studiometa.fr';
    const link2 = document.createElement('a');
    link2.href = '#anchor';
    document.body.appendChild(link1);
    document.body.appendChild(link2);
    expect(getComponentElements('a[href^="#"]')).toEqual([link2]);
  });

  it('should resolve components from a custom root element', () => {
    const root = document.createElement('div');
    const component = document.createElement('div');
    component.setAttribute('data-component', 'Component');
    root.appendChild(component);
    expect(getComponentElements('Component', root)).toEqual([component]);
  });

  it('should resolve async component dedede', () => {
    const div = document.createElement('div');
    div.innerHTML = `<div data-component="AsyncComponent"></div>`;

    const fn = jest.fn();
    class AsyncComponent extends Base {
      static config = {
        name: 'AsyncComponent',
      };

      constructor(...args) {
        super(...args);
        fn(...args);
      }
    }

    class Component extends Base {
      static config = {
        name: 'Component',
        components: {
          AsyncComponent: () =>
            new Promise((resolve) => setTimeout(() => resolve(AsyncComponent), 10)),
        },
      };
    }

    const component = new Component(div);
    expect(component.$children.AsyncComponent[0]).toBeInstanceOf(Promise);
    expect(fn).toHaveBeenCalledTimes(0);

    return new Promise((resolve) => {
      setTimeout(() => {
        expect(component.$children.AsyncComponent[0]).toBeInstanceOf(Base);
        expect(fn).toHaveBeenCalledTimes(1);
        resolve();
      }, 20);
    });
  });
});
