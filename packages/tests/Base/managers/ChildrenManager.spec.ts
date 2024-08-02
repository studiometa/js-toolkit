import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Base, BaseConfig } from '@studiometa/js-toolkit';
import { getComponentElements } from '#private/Base/utils.js';
import { h, useFakeTimers, useRealTimers, advanceTimersByTimeAsync } from '#test-utils';

beforeEach(() => {
  document.body.innerHTML = '';
  useFakeTimers();
});

afterEach(() => {
  useRealTimers();
});

describe('The component resolution', () => {
  it('should resolve components by name', () => {
    const component1 = h('div', { id: 'one' });
    component1.dataset.component = 'Component';
    const component2 = h('div', { id: 'two' });
    component2.dataset.component = 'OtherComponent';
    document.body.append(component1, component2);
    expect(getComponentElements('Component').map((el) => el.id)).toEqual(['one']);
  });

  it('should resolve components by CSS selector', () => {
    const component1 = h('div', { id: 'one' });
    component1.classList.add('component');
    const component2 = h('div', { id: 'two' });
    component2.dataset.component = 'component';
    document.body.append(component1, component2);
    expect(getComponentElements('.component').map((el) => el.id)).toEqual(['one']);
  });

  it('should resolve components by complex selector', () => {
    const link1 = h('a', { id: 'one', href: 'https://www.studiometa.fr' });
    const link2 = h('a', { id: 'two', href: '#anchor' });
    document.body.append(link1, link2);
    expect(getComponentElements('a[href^="#"]').map((el) => el.id)).toEqual(['two']);
  });

  it('should resolve components from a custom root element', () => {
    const root = h('div', { id: 'root' });
    const component = h('div', { id: 'component' });
    component.dataset.component = 'Component';
    root.append(component);
    expect(getComponentElements('Component', root).map((el) => el.id)).toEqual(['component']);
  });

  it('should resolve async component', async () => {
    const async = h('div', { dataComponent: 'AsyncComponent' });
    const div = h('div', {}, [async]);

    const fn = vi.fn();
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
          AsyncComponent: () => Promise.resolve(AsyncComponent),
        },
      };
    }

    const component = new Component(div);
    component.$mount();
    await advanceTimersByTimeAsync(1);
    const asyncInstances = await Promise.all(component.$children.AsyncComponent);
    expect(asyncInstances[0]).toBeInstanceOf(Base);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
