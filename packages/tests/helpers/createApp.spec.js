import { jest } from '@jest/globals';
import Base from '@studiometa/js-toolkit';
import createApp from '@studiometa/js-toolkit/helpers/createApp';

describe('The `createApp` function', () => {
  const fn = jest.fn();

  class App extends Base {
    static config = {
      name: 'App',
    };

    mounted() {
      fn();
    }
  }

  beforeEach(() => fn.mockRestore());

  it('should instantiate the app directly if the page is alreay loaded', async () => {
    const useApp = createApp(App, document.createElement('div'));
    expect(fn).toHaveBeenCalledTimes(1);
    const app = await useApp();
    expect(app).toBeInstanceOf(App);
  });

  it('should instantiate the app on page load', async () => {
    const readyStateMock = jest.spyOn(document, 'readyState', 'get');

    // Loading state
    readyStateMock.mockImplementation(() => 'loading');
    const useApp = createApp(App, document.createElement('div'));
    expect(fn).not.toHaveBeenCalled();
    expect(useApp()).toBeInstanceOf(Promise);

    // Interactive state
    readyStateMock.mockImplementation(() => 'interactive');
    document.dispatchEvent(new CustomEvent('readystatechange'));
    expect(fn).not.toHaveBeenCalled();
    expect(useApp()).toBeInstanceOf(Promise);

    // Complete state
    readyStateMock.mockImplementation(() => 'complete');
    document.dispatchEvent(new CustomEvent('readystatechange'));
    expect(fn).toHaveBeenCalledTimes(1);
    const app = await useApp();
    expect(app).toBeInstanceOf(App);
  });
});
