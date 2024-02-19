/* eslint-disable require-jsdoc, max-classes-per-file */
import { describe, it, expect } from 'bun:test';
import { html } from 'htl';
import {
  Base,
  withExtraConfig,
  importOnInteraction,
  getInstanceFromElement,
} from '@studiometa/js-toolkit';
import { wait } from '@studiometa/js-toolkit/utils';

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
    const div = document.createElement('div');
    const component = document.createElement('div');
    component.dataset.component = 'Component';
    div.append(component);

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
    const div = document.createElement('div');
    const component = document.createElement('div');
    component.dataset.component = 'Component';
    const btn = document.createElement('btn');
    btn.dataset.ref = 'btn[]';
    const btn2 = btn.cloneNode() as HTMLButtonElement;
    div.append(component, btn, btn2);

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
    const div = document.createElement('div');
    const component = document.createElement('div');
    component.dataset.component = 'Component';
    div.append(component);

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

  it.todo('should import a component given a selector outside the parent context', async () => {
    const div = document.createElement('div');
    const component = document.createElement('div');
    component.dataset.component = 'Component';
    div.append(component);
    const btn = document.createElement('btn');
    const doc = document.createElement('div');
    doc.append(div, btn);

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
