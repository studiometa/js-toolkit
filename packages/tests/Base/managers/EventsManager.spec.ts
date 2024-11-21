import { describe, it, expect, vi } from 'vitest';
import { Base, BaseConfig } from '@studiometa/js-toolkit';
import { dashCase, pascalCase } from '@studiometa/js-toolkit/utils';
import { h } from '#test-utils';

function getContext() {
  const rootElementFn = vi.fn();
  const documentFn = vi.fn();
  const windowFn = vi.fn();
  const singleRefFn = vi.fn();
  const multipleRefFn = vi.fn();
  const prefixedRefFn = vi.fn();
  const componentFn = vi.fn();
  const onComponentPointerdown = vi.fn();
  const componentInnerFn = vi.fn();
  const asyncComponentFn = vi.fn();

  class Component extends Base {
    static config = {
      name: 'Component',
      emits: ['custom-event'],
    };

    onCustomEvent(...args) {
      componentInnerFn(...args);
    }

    onClick(...args) {
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

    onComponentPointerdown(...args) {
      onComponentPointerdown(...args);
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
    <div data-component="Component"><span></span></div>
    <div data-component="Component"></div>
    <div data-component="AsyncComponent"></div>
    <div data-ref="App.prefixed"></div>
  </div>
`;

  const single = tpl.querySelector('[data-ref="single"]') as HTMLElement;
  const prefixed = tpl.querySelector('[data-ref="App.prefixed"]') as HTMLElement;
  const multiple = Array.from(tpl.querySelectorAll('[data-ref="multiple[]"]')) as HTMLElement[];
  const component = tpl.querySelector('[data-component="Component"]') as HTMLElement;
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
    component,
    onComponentPointerdown,
    componentInnerFn,
    asyncComponentFn,
    documentFn,
    windowFn,
    prefixedRefFn,
  };
}

describe('The EventsManager class', () => {
  it('can bind and unbind event methods to the root element', async () => {
    const { tpl, rootElementFn, app } = getContext();
    tpl.click();
    expect(rootElementFn).not.toHaveBeenCalled();
    await app.$mount();
    tpl.click();
    expect(rootElementFn).toHaveBeenCalledTimes(1);
    rootElementFn.mockClear();
    await app.$destroy();
    tpl.click();
    expect(rootElementFn).not.toHaveBeenCalled();
  });

  it('can bind and unbind event methods to the document', async () => {
    const { clickEvent, documentFn, app } = getContext();
    document.dispatchEvent(clickEvent);
    expect(documentFn).not.toHaveBeenCalled();
    await app.$mount();
    document.dispatchEvent(clickEvent);
    expect(documentFn).toHaveBeenCalledTimes(1);
    documentFn.mockClear();
    await app.$destroy();
    document.dispatchEvent(clickEvent);
    expect(documentFn).not.toHaveBeenCalled();
  });

  it('can bind and unbind event methods to the window', async () => {
    const { clickEvent, windowFn, app } = getContext();
    window.dispatchEvent(clickEvent);
    expect(windowFn).not.toHaveBeenCalled();
    await app.$mount();
    window.dispatchEvent(clickEvent);
    expect(windowFn).toHaveBeenCalledTimes(1);
    windowFn.mockClear();
    await app.$destroy();
    window.dispatchEvent(clickEvent);
    expect(windowFn).not.toHaveBeenCalled();
  });

  it('can bind and unbind event methods to single refs', async () => {
    const { single, singleRefFn, app } = getContext();
    const event = new PointerEvent('click');
    single.dispatchEvent(event);
    expect(singleRefFn).not.toHaveBeenCalled();
    await app.$mount();
    single.dispatchEvent(event);
    expect(singleRefFn).toHaveBeenCalledTimes(1);
    expect(singleRefFn).toHaveBeenLastCalledWith({
      event,
      args: [],
      index: 0,
      target: single,
    });
    singleRefFn.mockClear();
    await app.$destroy();
    single.dispatchEvent(event);
    expect(singleRefFn).not.toHaveBeenCalled();
  });

  it('can bind and unbind event methods to multiple refs', async () => {
    const { multiple, multipleRefFn, app } = getContext();
    const event = new PointerEvent('click');
    multiple[1].dispatchEvent(event);
    expect(multipleRefFn).not.toHaveBeenCalled();
    await app.$mount();
    multiple[1].dispatchEvent(event);
    expect(multipleRefFn).toHaveBeenCalledTimes(1);
    expect(multipleRefFn).toHaveBeenLastCalledWith({
      event,
      args: [],
      index: 1,
      target: multiple[1],
    });
    multipleRefFn.mockClear();
    await app.$destroy();
    multiple[0].click();
    expect(multipleRefFn).not.toHaveBeenCalled();
  });

  it('can bind, unbind and rebind event methods to children', async () => {
    const { componentFn, componentInnerFn, app } = getContext();
    expect(componentFn).not.toHaveBeenCalled();
    await app.$mount();
    expect(componentFn).toHaveBeenCalledTimes(2);
    const event = new CustomEvent('custom-event', { detail: [1, 2] });
    app.$children.Component[0].$emit(event);
    expect(componentFn).toHaveBeenCalledTimes(3);
    expect(componentFn).toHaveBeenLastCalledWith({
      event,
      args: [1, 2],
      index: 0,
      target: app.$children.Component[0],
    });
    expect(componentInnerFn).toHaveBeenLastCalledWith({
      event,
      args: [1, 2],
      index: 0,
      target: app.$children.Component[0],
    });
    const event2 = new CustomEvent('custom-event');
    app.$children.Component[0].$emit(event2);
    expect(componentFn).toHaveBeenLastCalledWith({
      event: event2,
      args: [],
      index: 0,
      target: app.$children.Component[0],
    });
    expect(componentInnerFn).toHaveBeenLastCalledWith({
      event: event2,
      args: [],
      index: 0,
      target: app.$children.Component[0],
    });
    const event3 = new PointerEvent('click');
    app.$children.Component[0].$el.dispatchEvent(event3);
    expect(componentFn).toHaveBeenLastCalledWith({
      event: event3,
      args: [],
      index: 0,
      target: app.$children.Component[0],
    });
    expect(componentInnerFn).toHaveBeenLastCalledWith({
      event: event3,
      args: [],
      index: 0,
      target: app.$children.Component[0].$el,
    });
    componentFn.mockClear();
    expect(componentFn).not.toHaveBeenCalled();
    await app.$destroy();
    expect(componentFn).not.toHaveBeenCalled();
    app.$children.Component[0].$emit(event);
    expect(componentFn).not.toHaveBeenCalled();
    await app.$mount();
    app.$children.Component[0].$emit(event);
    expect(componentFn).toHaveBeenLastCalledWith({
      event,
      args: [1, 2],
      index: 0,
      target: app.$children.Component[0],
    });
    expect(componentInnerFn).toHaveBeenLastCalledWith({
      event,
      args: [1, 2],
      index: 0,
      target: app.$children.Component[0],
    });
    await app.$destroy();
  });

  it('can listen to event dispatched from nested DOM children (bubbling up)', async () => {
    const { onComponentPointerdown, component, app } = getContext();
    await app.$mount();
    component.firstElementChild.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(onComponentPointerdown).toHaveBeenCalledTimes(1);
  });

  it('can bind and unbind event methods to async children', async () => {
    const { asyncComponentFn, app } = getContext();
    expect(asyncComponentFn).not.toHaveBeenCalled();
    await app.$mount();
    expect(asyncComponentFn).toHaveBeenCalledTimes(1);
    const instances = await Promise.all(app.$children.AsyncComponent);
    instances[0].$emit('custom-event', 1, 2);
    expect(asyncComponentFn).toHaveBeenCalledTimes(2);
    asyncComponentFn.mockClear();
    expect(asyncComponentFn).not.toHaveBeenCalled();
    await app.$destroy();
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
      expect(pascalCase(input)).toBe(output);
    }
  });

  it('should normalize PascalCase event names to their kebab-case equivalent', () => {
    const names = [
      ['Single', 'single'],
      ['MultipleParts', 'multiple-parts'],
    ];

    for (const [input, output] of names) {
      expect(dashCase(input)).toBe(output);
    }
  });

  it('can bind event methods to prefixed refs', async () => {
    const { prefixed, prefixedRefFn, app } = getContext();
    const event = new PointerEvent('click');
    prefixed.dispatchEvent(event);
    expect(prefixedRefFn).not.toHaveBeenCalled();
    await app.$mount();
    prefixed.dispatchEvent(event);
    expect(prefixedRefFn).toHaveBeenCalledTimes(1);
    expect(prefixedRefFn).toHaveBeenLastCalledWith({
      event,
      args: [],
      index: 0,
      target: prefixed,
    });
    prefixedRefFn.mockClear();
    await app.$destroy();
    prefixed.dispatchEvent(event);
    expect(prefixedRefFn).not.toHaveBeenCalled();
  });

  it('should not call undefined `on...` methods', async () => {
    const fn = vi.fn();

    class Foo extends Base {
      static config = {
        name: 'Foo',
        emits: ['custom-event'],
      };
    }

    class Bar extends Base {
      static config = {
        name: 'Bar',
      };
    }

    class App extends Base<{ $children: { Foo: Foo[]; Bar: Bar[] } }> {
      static config = {
        name: 'App',
        components: {
          Bar,
          Foo,
        },
      };

      onFooCustomEvent() {
        fn();
      }
    }

    const div = h('div', [h('div', { dataComponent: 'Foo Bar' })]);
    const app = new App(div);
    await app.$mount();

    const event = new CustomEvent('custom-event');
    const [foo] = app.$children.Foo;
    foo.$emit(event);
    expect(fn).toHaveBeenCalledOnce();
  });
});
