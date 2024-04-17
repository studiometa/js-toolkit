import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { Base, BaseConfig } from '@studiometa/js-toolkit';
import { h, useFakeTimers, useRealTimers, advanceTimersByTimeAsync } from '#test-utils';
import { normalizeEventName, normalizeName } from '#private/Base/managers/EventsManager.js';

function getContext() {
  const rootElementFn = mock();
  const documentFn = mock();
  const windowFn = mock();
  const singleRefFn = mock();
  const multipleRefFn = mock();
  const prefixedRefFn = mock();
  const componentFn = mock();
  const componentInnerFn = mock();
  const asyncComponentFn = mock();

  class Component extends Base {
    static config = {
      name: 'Component',
      emits: ['custom-event'],
    };

    onCustomEvent(...args) {
      componentInnerFn(...args);
    }
  }

  class AsyncComponent extends Base {
    static config = {
      name: 'AsyncComponent',
      emits: ['custom-event'],
    };
  }

  class App extends Base<{
    $refs: {
      single: HTMLElement;
      multiple: HTMLElement[];
      prefixed: HTMLElement;
    };
    $children: {
      Component: Component[];
      AsyncComponent: Promise<AsyncComponent>[];
    };
  }> {
    static config: BaseConfig = {
      name: 'App',
      refs: ['single', 'multiple[]', 'prefixed'],
      components: {
        Component,
        AsyncComponent: () => Promise.resolve(AsyncComponent),
      },
    };

    onClick(...args) {
      rootElementFn(...args);
    }

    onDocumentClick(...args) {
      documentFn(...args);
    }

    onWindowClick(...args) {
      windowFn(...args);
    }

    onSingleClick(...args) {
      singleRefFn(...args);
    }

    onMultipleClick(...args) {
      multipleRefFn(...args);
    }

    onComponentMounted(...args) {
      componentFn(...args);
    }

    onComponentCustomEvent(...args) {
      componentFn(...args);
    }

    onComponentClick(...args) {
      componentFn(...args);
    }

    onAsyncComponentMounted(...args) {
      asyncComponentFn(...args);
    }

    onAsyncComponentCustomEvent(...args) {
      asyncComponentFn(...args);
    }

    onPrefixedClick(...args) {
      prefixedRefFn(...args);
    }
  }

  const tpl = h('div');
  tpl.innerHTML = `
  <div>
    <div data-ref="single"></div>
    <div data-ref="multiple[]"></div>
    <div data-ref="multiple[]"></div>
    <div data-component="Component"></div>
    <div data-component="Component"></div>
    <div data-component="AsyncComponent"></div>
    <div data-ref="App.prefixed"></div>
  </div>
`;

  const single = tpl.querySelector('[data-ref="single"]') as HTMLElement;
  const prefixed = tpl.querySelector('[data-ref="App.prefixed"]') as HTMLElement;
  const multiple = Array.from(tpl.querySelectorAll('[data-ref="multiple[]"]')) as HTMLElement[];
  const app = new App(tpl);
  const clickEvent = new Event('click');

  return {
    tpl,
    app,
    single,
    prefixed,
    multiple,
    clickEvent,
    rootElementFn,
    singleRefFn,
    multipleRefFn,
    componentFn,
    componentInnerFn,
    asyncComponentFn,
    documentFn,
    windowFn,
    prefixedRefFn,
  };
}

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  useRealTimers();
});

describe('The EventsManager class', () => {
  it('can bind and unbind event methods to the root element', async () => {
    const { tpl, rootElementFn, app } = getContext();
    tpl.click();
    expect(rootElementFn).not.toHaveBeenCalled();
    app.$mount();
    await advanceTimersByTimeAsync(1);
    tpl.click();
    expect(rootElementFn).toHaveBeenCalledTimes(1);
    rootElementFn.mockClear();
    app.$destroy();
    await advanceTimersByTimeAsync(1);
    tpl.click();
    expect(rootElementFn).not.toHaveBeenCalled();
  });

  it('can bind and unbind event methods to the document', async () => {
    const { clickEvent, documentFn, app } = getContext();
    document.dispatchEvent(clickEvent);
    expect(documentFn).not.toHaveBeenCalled();
    app.$mount();
    await advanceTimersByTimeAsync(1);
    document.dispatchEvent(clickEvent);
    expect(documentFn).toHaveBeenCalledTimes(1);
    documentFn.mockClear();
    app.$destroy();
    await advanceTimersByTimeAsync(1);
    document.dispatchEvent(clickEvent);
    expect(documentFn).not.toHaveBeenCalled();
  });

  it('can bind and unbind event methods to the window', async () => {
    const { clickEvent, windowFn, app } = getContext();
    window.dispatchEvent(clickEvent);
    expect(windowFn).not.toHaveBeenCalled();
    app.$mount();
    await advanceTimersByTimeAsync(1);
    window.dispatchEvent(clickEvent);
    expect(windowFn).toHaveBeenCalledTimes(1);
    windowFn.mockClear();
    app.$destroy();
    await advanceTimersByTimeAsync(1);
    window.dispatchEvent(clickEvent);
    expect(windowFn).not.toHaveBeenCalled();
  });

  it('can bind and unbind event methods to single refs', async () => {
    const { single, singleRefFn, app } = getContext();
    single.click();
    expect(singleRefFn).not.toHaveBeenCalled();
    app.$mount();
    await advanceTimersByTimeAsync(1);
    single.click();
    expect(singleRefFn).toHaveBeenCalledTimes(1);
    expect(singleRefFn.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    expect(singleRefFn.mock.calls[0][1]).toBe(0);
    singleRefFn.mockClear();
    app.$destroy();
    await advanceTimersByTimeAsync(1);
    single.click();
    expect(singleRefFn).not.toHaveBeenCalled();
  });

  it('can bind and unbind event methods to multiple refs', async () => {
    const { multiple, multipleRefFn, app } = getContext();
    multiple[1].click();
    expect(multipleRefFn).not.toHaveBeenCalled();
    app.$mount();
    await advanceTimersByTimeAsync(1);
    multiple[1].click();
    expect(multipleRefFn).toHaveBeenCalledTimes(1);
    expect(multipleRefFn.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    expect(multipleRefFn.mock.calls[0][1]).toBe(1);
    multipleRefFn.mockClear();
    app.$destroy();
    await advanceTimersByTimeAsync(1);
    multiple[0].click();
    expect(multipleRefFn).not.toHaveBeenCalled();
  });

  it('can bind, unbind and rebind event methods to children', async () => {
    const { componentFn, componentInnerFn, app } = getContext();
    expect(componentFn).not.toHaveBeenCalled();
    app.$mount();
    await advanceTimersByTimeAsync(1);
    expect(componentFn).toHaveBeenCalledTimes(2);
    app.$children.Component[0].$emit('custom-event', 1, 2);
    expect(componentFn).toHaveBeenCalledTimes(3);
    expect(componentFn).toHaveBeenLastCalledWith(
      1,
      2,
      0,
      expect.objectContaining({ type: 'custom-event', detail: [1, 2] }),
    );
    expect(componentInnerFn).toHaveBeenLastCalledWith(
      1,
      2,
      expect.objectContaining({ type: 'custom-event', detail: [1, 2] }),
    );
    app.$children.Component[0].dispatchEvent(new CustomEvent('custom-event'));
    expect(componentFn).toHaveBeenLastCalledWith(
      0,
      expect.objectContaining({ type: 'custom-event', detail: null }),
    );
    expect(componentInnerFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'custom-event', detail: null }),
    );
    app.$children.Component[0].$el.click();
    expect(componentFn).toHaveBeenLastCalledWith(0, expect.objectContaining({ type: 'click' }));
    componentFn.mockClear();
    expect(componentFn).not.toHaveBeenCalled();
    app.$destroy();
    await advanceTimersByTimeAsync(1);
    expect(componentFn).not.toHaveBeenCalled();
    app.$children.Component[0].$emit('custom-event', 1, 2);
    expect(componentFn).not.toHaveBeenCalled();
    app.$mount();
    await advanceTimersByTimeAsync(1);
    app.$children.Component[0].$emit('custom-event', 1, 2);
    expect(componentFn).toHaveBeenLastCalledWith(
      1,
      2,
      0,
      expect.objectContaining({ type: 'custom-event', detail: [1, 2] }),
    );
    expect(componentInnerFn).toHaveBeenLastCalledWith(
      1,
      2,
      expect.objectContaining({ type: 'custom-event', detail: [1, 2] }),
    );
    app.$destroy();
    await advanceTimersByTimeAsync(1);
  });

  it('can bind and unbind event methods to async children', async () => {
    const { asyncComponentFn, app } = getContext();
    expect(asyncComponentFn).not.toHaveBeenCalled();
    app.$mount();
    await advanceTimersByTimeAsync(1);
    expect(asyncComponentFn).toHaveBeenCalledTimes(1);
    const instances = await Promise.all(app.$children.AsyncComponent);
    instances[0].$emit('custom-event', 1, 2);
    expect(asyncComponentFn).toHaveBeenCalledTimes(2);
    asyncComponentFn.mockClear();
    expect(asyncComponentFn).not.toHaveBeenCalled();
    app.$destroy();
    await advanceTimersByTimeAsync(1);
    expect(asyncComponentFn).not.toHaveBeenCalled();
    const instances1 = await Promise.all(app.$children.AsyncComponent);
    instances1[0].$emit('custom-event', 1, 2);
    expect(asyncComponentFn).not.toHaveBeenCalled();
  });

  it('should normalize refs and children names', () => {
    const names = [
      ['sentence case', 'SentenceCase'],
      ['lowercase', 'Lowercase'],
      ['UPPERCASE', 'Uppercase'],
      ['kebab-case', 'KebabCase'],
      ['snake_case', 'SnakeCase'],
      ['camelCase', 'CamelCase'],
      ['PascalCase', 'PascalCase'],
      ['.class-selector', 'ClassSelector'],
      ['.bem__selector', 'BemSelector'],
      ['#id-selector', 'IdSelector'],
      ['.complex[class^ ="#"]', 'ComplexClass'],
    ];

    for (const [input, output] of names) {
      expect(normalizeName(input)).toBe(output);
    }
  });

  it('should normalize PascalCase event names to their kebab-case equivalent', () => {
    const names = [
      ['Single', 'single'],
      ['MultipleParts', 'multiple-parts'],
    ];

    for (const [input, output] of names) {
      expect(normalizeEventName(input)).toBe(output);
    }
  });

  it('can bind event methods to prefixed refs', async () => {
    const { prefixed, prefixedRefFn, app } = getContext();
    prefixed.click();
    expect(prefixedRefFn).not.toHaveBeenCalled();
    app.$mount();
    await advanceTimersByTimeAsync(1);
    prefixed.click();
    expect(prefixedRefFn).toHaveBeenCalledTimes(1);
    expect(prefixedRefFn.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    expect(prefixedRefFn.mock.calls[0][1]).toBe(0);
    prefixedRefFn.mockClear();
    app.$destroy();
    await advanceTimersByTimeAsync(1);
    prefixed.click();
    expect(prefixedRefFn).not.toHaveBeenCalled();
  });
});
