import { jest } from '@jest/globals';
import { html } from 'htl';
import { Base } from '@studiometa/js-toolkit';
import withExtraConfig from '@studiometa/js-toolkit/decorators/withExtraConfig';
import importOnInteraction from '@studiometa/js-toolkit/helpers/importOnInteraction';
import wait from '../__utils__/wait';

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

describe('The `importOnInteraction` lazy import helper', () => {
  it('should import a component given one event', async () => {
    const div = html`<div>
      <div data-component="Component"></div>
    </div>`;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: (app) =>
          importOnInteraction(
            () => Promise.resolve(Component),
            'Component',
            'click',
            app
          ),
      },
    });

    new AppOverride(div).$mount();

    expect(div.firstElementChild.__base__).toBeUndefined();
    div.firstElementChild.click();
    await wait(0);
    expect(div.firstElementChild.__base__).toBeInstanceOf(WeakMap);
    expect(div.firstElementChild.__base__.get(Component)).toBeInstanceOf(Component);
  });

  it('should import a component given a ref as target', async () => {
    const div = html`<div>
      <div data-component="Component"></div>
      <button data-ref="btn[]"></button>
      <button data-ref="btn[]"></button>
    </div>`;

    const AppOverride = withExtraConfig(App, {
      refs: ['btn[]'],
      components: {
        Component: (app) =>
          importOnInteraction(
            () => Promise.resolve(Component),
            app.$refs.btn,
            'click',
          ),
      },
    });

    new AppOverride(div).$mount();

    expect(div.firstElementChild.__base__).toBeUndefined();
    div.lastElementChild.click();
    await wait(0);
    expect(div.firstElementChild.__base__.get(Component)).toBeInstanceOf(Component);
  });

  it('should import a component given an array of events', async () => {
    const div = html`<div>
      <div data-component="Component"></div>
    </div>`;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: (app) =>
          importOnInteraction(
            () => Promise.resolve(Component),
            'Component',
            ['click'],
            app
          ),
      },
    });

    new AppOverride(div).$mount();

    expect(div.firstElementChild.__base__).toBeUndefined();
    div.firstElementChild.click();
    await wait(0);
    expect(div.firstElementChild.__base__.get(Component)).toBeInstanceOf(Component);
  });

  it('should import a component given a selector outside the parent context', async () => {
    const div = html`<div>
      <div data-component="Component"></div>
    </div>`;
    const doc = html`<div>${div}<button id="btn">Click me</button></div>`;
    document.body.appendChild(doc);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () =>
          importOnInteraction(
            () => Promise.resolve(Component),
            '#btn',
            'click'
          ),
      },
    });

    new AppOverride(div).$mount();

    expect(div.firstElementChild.__base__).toBeUndefined();
    document.querySelector('#btn').click();
    await wait(0);
    expect(div.firstElementChild.__base__.get(Component)).toBeInstanceOf(Component);
  });
});
