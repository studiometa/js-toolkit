import { jest } from '@jest/globals';
import { html } from 'htl';
import { Base, withExtraConfig, importOnMediaQuery } from '@studiometa/js-toolkit';
import wait from '../__utils__/wait';
import {
  mockMatchMediaPositive,
  mockMatchMediaNegative,
} from '../__setup__/mockMediaQuery';


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

describe('The `importOnMediaQuery` lazy import helper', () => {
  it('should import a component when user prefers motion', async () => {
    // Media query should be true at window load.
    mockMatchMediaPositive();

    const div = html`<div>
      <div data-component="Component"></div>
    </div>`;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () =>
          importOnMediaQuery(
            () => Promise.resolve(Component),
            'not (prefers-reduced-motion)'
          ),
      },
    });

    new AppOverride(div).$mount();
    await wait(0);
    expect(div.firstElementChild.__base__.get(Component)).toBeInstanceOf(Component);
  });

  it('should not import a component when user prefers reduced motion', async () => {
    // Media query should be false at window load.
    mockMatchMediaNegative();

    const div = html`<div>
      <div data-component="Component"></div>
    </div>`;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () =>
          importOnMediaQuery(
            () => Promise.resolve(Component),
            'not (prefers-reduced-motion)'
          ),
      },
    });

    new AppOverride(div).$mount();
    await wait(0);
    expect(div.firstElementChild.__base__).toBeUndefined();
  });
});
