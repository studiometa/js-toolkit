import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { Base, BaseConfig } from '@studiometa/js-toolkit';
import { getComponentElements } from '#private/Base/utils.js';
import { useFakeTimers, useRealTimers, advanceTimersByTimeAsync } from '#test-utils';

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  useRealTimers();
});

describe('The component resolution', () => {
  it('should resolve components by name', () => {
    const component1 = document.createElement('div');
    component1.dataset.component = 'Component';
    const component2 = document.createElement('div');
    component2.dataset.component = 'OtherComponent';
    document.body.append(component1);
    document.body.append(component2);
    expect(getComponentElements('Component')).toEqual([component1]);
  });

  it('should resolve components by CSS selector', () => {
    const component1 = document.createElement('div');
    component1.classList.add('component');
    const component2 = document.createElement('div');
    component2.dataset.component = 'component';
    document.body.append(component1);
    document.body.append(component2);
    expect(getComponentElements('.component')).toEqual([component1]);
  });

  it('should resolve components by complex selector', () => {
    const link1 = document.createElement('a');
    link1.href = 'https://www.studiometa.fr';
    const link2 = document.createElement('a');
    link2.href = '#anchor';
    document.body.append(link1);
    document.body.append(link2);
    expect(getComponentElements('a[href^="#"]')).toEqual([link2]);
  });

  it('should resolve components from a custom root element', () => {
    const root = document.createElement('div');
    const component = document.createElement('div');
    component.dataset.component = 'Component';
    root.append(component);
    expect(getComponentElements('Component', root)).toEqual([component]);
  });

  it('should resolve async component', async () => {
    const div = document.createElement('div');
    div.innerHTML = '<div data-component="AsyncComponent"></div>';

    const fn = mock();
    class AsyncComponent extends Base {
      static config = {
        name: 'AsyncComponent',
      };

      constructor(...args: [HTMLElement]) {
        super(...args);
        fn(...args);
      }
    }

    class Component extends Base {
      static config: BaseConfig = {
        name: 'Component',
        components: {
          AsyncComponent: () =>
            new Promise((resolve) => setTimeout(() => resolve(AsyncComponent), 10)),
        },
      };
    }

    const component = new Component(div).$mount();
    await advanceTimersByTimeAsync(1);
    expect(component.$children.AsyncComponent[0]).toBeInstanceOf(Promise);
    expect(fn).toHaveBeenCalledTimes(0);
    await advanceTimersByTimeAsync(30);
    expect(component.$children.AsyncComponent[0]).toBeInstanceOf(Base);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
