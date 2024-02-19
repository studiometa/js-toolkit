/* eslint-disable require-jsdoc, max-classes-per-file */
import { describe, it, expect } from 'bun:test';
import {
  Base,
  withExtraConfig,
  importOnInteraction,
  getInstanceFromElement,
} from '@studiometa/js-toolkit';
import { wait } from '@studiometa/js-toolkit/utils';
import { h } from '../__utils__/h.js';

describe('The `importOnInteraction` lazy import helper', () => {
  class App extends Base {
    static config = {
      name: 'App',
    };
  }

  class Component extends Base {
    static config = {
      name: 'Component',
    };
  }
  it('should import a component given one event', async () => {
    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: (app) =>
          importOnInteraction(() => Promise.resolve(Component), 'Component', 'click', app),
      },
    });

    new AppOverride(div).$mount();

    expect(getInstanceFromElement(div.firstElementChild as HTMLElement, Component)).toBeNull();
    component.click();
    await wait(0);
    expect(getInstanceFromElement(div.firstElementChild as HTMLElement, Component)).toBeInstanceOf(
      Component,
    );
  });

  it('should import a component given a ref as target', async () => {
    const btn = h('button', { dataRef: 'btn[]' });
    const btn2 = h('button', { dataRef: 'btn[]' });
    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component, btn, btn2]);

    const AppOverride = withExtraConfig(App, {
      refs: ['btn[]'],
      components: {
        Component: (app) =>
          importOnInteraction(() => Promise.resolve(Component), app.$refs.btn, 'click'),
      },
    });

    new AppOverride(div).$mount();

    expect(getInstanceFromElement(component, Component)).toBeNull();
    btn2.click();
    await wait(0);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);
  });

  it('should import a component given an array of events', async () => {
    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: (app) =>
          importOnInteraction(() => Promise.resolve(Component), 'Component', ['click'], app),
      },
    });

    new AppOverride(div).$mount();

    expect(getInstanceFromElement(component, Component)).toBeNull();
    component.click();
    await wait(0);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);
  });

  it('should import a component given a selector outside the parent context', async () => {
    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);
    const btn = h('button', { id: 'btn' });
    document.body.append(div, btn);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () => importOnInteraction(() => Promise.resolve(Component), '#btn', 'click'),
      },
    });

    new AppOverride(div).$mount();

    expect(getInstanceFromElement(component, Component)).toBeNull();
    btn.click();
    await wait(0);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);
  });
});
