/* eslint-disable require-jsdoc, max-classes-per-file */
import { describe, it, expect, jest, beforeEach } from 'bun:test';
import { html } from 'htl';
import { Base } from '@studiometa/js-toolkit';
import { wait } from '@studiometa/js-toolkit/utils';
import { normalizeEventName, normalizeName } from '../../../js-toolkit/Base/managers/EventsManager';

describe('The EventsManager class', () => {
  const rootElementFn = jest.fn();
  const documentFn = jest.fn();
  const windowFn = jest.fn();
  const singleRefFn = jest.fn();
  const multipleRefFn = jest.fn();
  const prefixedRefFn = jest.fn();
  const componentFn = jest.fn();
  const componentInnerFn = jest.fn();
  const asyncComponentFn = jest.fn();

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

  class App extends Base {
    static config = {
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

  const tpl = html`
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

  const single = tpl.querySelector('[data-ref="single"]');
  const prefixed = tpl.querySelector('[data-ref="App.prefixed"]');
  const multiple = Array.from(tpl.querySelectorAll('[data-ref="multiple[]"]'));
  const component = tpl.querySelector('[data-component="Component"]');
  const asyncComponent = tpl.querySelector('[data-component="AsyncComponent"]');

  const app = new App(tpl);

  const clickEvent = new Event('click');

  beforeEach(() => {
    rootElementFn.mockClear();
    singleRefFn.mockClear();
    multipleRefFn.mockClear();
    componentFn.mockClear();
    asyncComponentFn.mockClear();
    documentFn.mockClear();
    windowFn.mockClear();
    prefixedRefFn.mockClear();
  });

  it('can bind event methods to the root element', () => {
    tpl.click();
    expect(rootElementFn).not.toHaveBeenCalled();
    app.$mount();
    tpl.click();
    expect(rootElementFn).toHaveBeenCalledTimes(1);
  });

  it('can unbind event methods to the root element', () => {
    app.$destroy();
    tpl.click();
    expect(rootElementFn).not.toHaveBeenCalled();
  });

  it('can bind event methods to the document', () => {
    document.dispatchEvent(clickEvent);
    expect(documentFn).not.toHaveBeenCalled();
    app.$mount();
    document.dispatchEvent(clickEvent);
    expect(documentFn).toHaveBeenCalledTimes(1);
  });

  it('can unbind event methods from the document', () => {
    app.$destroy();
    document.dispatchEvent(clickEvent);
    expect(documentFn).not.toHaveBeenCalled();
  });

  it('can bind event methods to the window', () => {
    window.dispatchEvent(clickEvent);
    expect(windowFn).not.toHaveBeenCalled();
    app.$mount();
    window.dispatchEvent(clickEvent);
    expect(windowFn).toHaveBeenCalledTimes(1);
  });

  it('can unbind event methods from the window', () => {
    app.$destroy();
    window.dispatchEvent(clickEvent);
    expect(windowFn).not.toHaveBeenCalled();
  });

  it('can bind event methods to single refs', () => {
    single.click();
    expect(singleRefFn).not.toHaveBeenCalled();
    app.$mount();
    single.click();
    expect(singleRefFn).toHaveBeenCalledTimes(1);
    expect(singleRefFn.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    expect(singleRefFn.mock.calls[0][1]).toBe(0);
  });

  it('can unbind event methods from single refs', () => {
    app.$destroy();
    single.click();
    expect(singleRefFn).not.toHaveBeenCalled();
  });

  it('can bind event methods to multiple refs', () => {
    multiple[1].click();
    expect(multipleRefFn).not.toHaveBeenCalled();
    app.$mount();
    multiple[1].click();
    expect(multipleRefFn).toHaveBeenCalledTimes(1);
    expect(multipleRefFn.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    expect(multipleRefFn.mock.calls[0][1]).toBe(1);
  });

  it('can unbind event methods from multiple refs', () => {
    app.$destroy();
    multiple[0].click();
    expect(multipleRefFn).not.toHaveBeenCalled();
  });

  it('can bind event methods to children', () => {
    expect(componentFn).not.toHaveBeenCalled();
    app.$mount();
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
  });

  it('can unbind and rebind event methods from children', () => {
    expect(componentFn).not.toHaveBeenCalled();
    app.$destroy();
    expect(componentFn).not.toHaveBeenCalled();
    app.$children.Component[0].$emit('custom-event', 1, 2);
    expect(componentFn).not.toHaveBeenCalled();
    app.$mount();
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
  });

  it('can bind event methods to async children', async () => {
    expect(asyncComponentFn).not.toHaveBeenCalled();
    app.$mount();
    await Promise.all(app.$children.AsyncComponent);
    await wait(1);
    expect(asyncComponentFn).toHaveBeenCalledTimes(1);
    app.$children.AsyncComponent[0].$emit('custom-event', 1, 2);
    expect(asyncComponentFn).toHaveBeenCalledTimes(2);
  });

  it('can unbind event methods from async children', () => {
    expect(asyncComponentFn).not.toHaveBeenCalled();
    app.$destroy();
    expect(asyncComponentFn).not.toHaveBeenCalled();
    app.$children.AsyncComponent[0].$emit('custom-event', 1, 2);
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

    names.forEach(([input, output]) => expect(normalizeName(input)).toBe(output));
  });

  it('should normalize PascalCase event names to their kebab-case equivalent', () => {
    const names = [
      ['Single', 'single'],
      ['MultipleParts', 'multiple-parts'],
    ];

    names.forEach(([input, output]) => expect(normalizeEventName(input)).toBe(output));
  });

  it('can bind event methods to prefixed refs', () => {
    prefixed.click();
    expect(prefixedRefFn).not.toHaveBeenCalled();
    app.$mount();
    prefixed.click();
    expect(prefixedRefFn).toHaveBeenCalledTimes(1);
    expect(prefixedRefFn.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    expect(prefixedRefFn.mock.calls[0][1]).toBe(0);
  });

  it('can unbind event methods from prefixed refs', () => {
    app.$destroy();
    prefixed.click();
    expect(prefixedRefFn).not.toHaveBeenCalled();
  });
});
