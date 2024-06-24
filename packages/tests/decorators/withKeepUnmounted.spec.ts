import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Base, BaseConfig, withKeepUnmounted } from '@studiometa/js-toolkit';
import { advanceTimersByTimeAsync, h, useFakeTimers, useRealTimers } from '#test-utils';

async function getContext(options?: { template?: string; autoMount?: boolean }) {
  const div = h('div');

  div.innerHTML = options?.template ?? '<div data-component="Component"></div>';

  class Component extends withKeepUnmounted(Base, options?.autoMount ?? true) {
    static config = {
      name: 'Component',
    };
  }

  type AppProps = {
    $children: { Component: Component[] };
  };

  class App extends Base<AppProps> {
    static config: BaseConfig = {
      name: 'App',
      components: {
        Component,
      },
    };
  }

  const app = new App(div);
  app.$mount();
  await advanceTimersByTimeAsync(100);
  const [component] = app.$children.Component;
  return { app, div, component };
}

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  useRealTimers();
});

describe('The withKeepUnmounted decorator', () => {
  it('should not mount the component if it is not enabled', async () => {
    const { component } = await getContext();
    expect(component.$isMounted).toBe(false);
  });

  it('should mount the component if it is enabled', async () => {
    const { component } = await getContext({
      template: '<div data-component="Component" data-option-enabled></div>',
    });
    expect(component.$isMounted).toBe(true);
  });

  it('should mount the component automatically after enabling', async () => {
    const { component } = await getContext();
    expect(component.$isMounted).toBe(false);
    component.$options.enabled = true;
    await advanceTimersByTimeAsync(100);
    expect(component.$isMounted).toBe(true);
  });

  it('should not mount the component automatically after enabling if autoMount is not active', async () => {
    const { component } = await getContext({
      autoMount: false,
    });

    expect(component.$isMounted).toBe(false);
    component.$options.enabled = true;
    await advanceTimersByTimeAsync(100);
    expect(component.$isMounted).toBe(false);
    component.$mount();
    await advanceTimersByTimeAsync(100);
    expect(component.$isMounted).toBe(true);
  });
});
