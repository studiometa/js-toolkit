import Base from '~/abstracts/Base';
import { warn } from '~/abstracts/Base/utils';

describe('The Base utility `getConfig` function', () => {
  it('Should warn when using the deprecated `config` getter.', () => {
    const div = document.createElement('div');
    class App extends Base {
      get config() {
        return { name: 'App' };
      }
    }

    const spy = jest.spyOn(window.console, 'warn');
    spy.mockImplementation(() => true);
    new App(div);
    expect(spy).toHaveBeenCalledWith(
      '[App]',
      'Defining the `config` as a getter is deprecated, replace it with a static property.'
    );
  });
});

describe('The Base utility `warn` function', () => {
  it('should display contextual warning in the console', () => {
    class App extends Base {
      static config = {
        name: 'App',
      };
    }

    const app = new App(document.createElement('div'));
    const spy = jest.spyOn(window.console, 'warn');
    spy.mockImplementation(() => true);
    warn(app, 'Foo');
    expect(spy).toHaveBeenCalledWith(
      '[App]',
      'Foo'
    );
  })
});
