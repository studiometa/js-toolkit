import {
  Base,
  getInstances,
  registerComponent,
  type BaseConfig,
  type BaseConstructor,
} from '@studiometa/js-toolkit';
import {
  ComponentLoader,
  IDLE_TIMEOUT,
  VISIBLE_ROOT_MARGIN,
  type ComponentLoadStrategy,
  type ComponentManifest,
  type ComponentManifestEntry,
  type LoaderDependencies,
} from '@studiometa/js-toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';

class TestComponent extends Base {}

interface ManifestOptions {
  strategy?: ComponentLoadStrategy;
  children?: readonly string[];
  load?: () => Promise<BaseConstructor>;
}

function manifestEntry(token: string, options: ManifestOptions = {}): ComponentManifestEntry {
  return {
    token,
    packageName: '@studiometa/ui',
    subpath: token,
    exportName: token,
    strategy: options.strategy ?? 'eager',
    group: 'test',
    children: options.children,
    load: options.load ?? vi.fn(async () => TestComponent),
  };
}

function createLoader(manifest: ComponentManifest, dependencies: Partial<LoaderDependencies> = {}) {
  const register = vi.fn(async () => []);
  const logger = { warn: vi.fn(), error: vi.fn() };
  const loader = new ComponentLoader({
    manifest,
    dependencies: {
      document,
      registerComponent: register,
      console: logger,
      ...dependencies,
    },
  });
  return { loader, register, logger };
}

async function settle(): Promise<void> {
  for (let index = 0; index < 8; index += 1) {
    await Promise.resolve();
  }
}

async function settleMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await settle();
}

async function settleToolkit(): Promise<void> {
  for (let index = 0; index < 8; index += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  await settle();
}

class IntersectionObserverMock {
  static instances: IntersectionObserverMock[] = [];
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  elements: Element[] = [];
  disconnected = false;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    IntersectionObserverMock.instances.push(this);
  }

  observe(element: Element): void {
    this.elements.push(element);
  }

  unobserve(): void {}

  disconnect(): void {
    this.disconnected = true;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(): void {
    this.callback(
      [{ isIntersecting: true, target: this.elements[0] } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

afterEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  IntersectionObserverMock.instances = [];
  vi.useRealTimers();
});

describe('ComponentLoader discovery', () => {
  it('installs the mutation observer before scanning the initial DOM', async () => {
    const load = vi.fn(async () => TestComponent);
    const events: string[] = [];

    class RaceMutationObserver {
      constructor(_callback: MutationCallback) {}

      observe(): void {
        events.push('observe');
        const element = document.createElement('div');
        element.dataset.component = 'Race';
        document.body.append(element);
      }

      disconnect(): void {}
      takeRecords(): MutationRecord[] {
        return [];
      }
    }

    const { loader } = createLoader(
      { Race: manifestEntry('Race', { load }) },
      { MutationObserver: RaceMutationObserver as unknown as typeof MutationObserver },
    );
    loader.start();
    events.push('started');
    await settle();

    expect(events).toEqual(['observe', 'started']);
    expect(load).toHaveBeenCalledOnce();
  });

  it('discovers initial elements, multiple whitespace tokens, and added subtrees', async () => {
    const firstLoad = vi.fn(async () => TestComponent);
    const secondLoad = vi.fn(async () => TestComponent);
    const addedLoad = vi.fn(async () => TestComponent);
    document.body.innerHTML = '<div data-component="  First\nUnknown\tSecond First  "></div>';
    const { loader, register, logger } = createLoader({
      First: manifestEntry('First', { load: firstLoad }),
      Second: manifestEntry('Second', { load: secondLoad }),
      Added: manifestEntry('Added', { load: addedLoad }),
    });

    loader.start();
    await settle();

    const subtree = document.createElement('section');
    subtree.innerHTML = '<div><span data-component="Added"></span></div>';
    document.body.append(subtree);
    await settleMutations();

    expect(firstLoad).toHaveBeenCalledOnce();
    expect(secondLoad).toHaveBeenCalledOnce();
    expect(addedLoad).toHaveBeenCalledOnce();
    expect(register).toHaveBeenCalledTimes(3);
    expect(logger.warn).toHaveBeenCalledWith(
      '[@studiometa/js-toolkit/autoload] An unknown component token was ignored.',
    );
  });

  it('does not react to data-component attribute changes or scan shadow DOM', async () => {
    const load = vi.fn(async () => TestComponent);
    const shadowLoad = vi.fn(async () => TestComponent);
    const element = document.createElement('div');
    const host = document.createElement('div');
    const shadowComponent = document.createElement('span');
    shadowComponent.dataset.component = 'Shadow';
    host.attachShadow({ mode: 'open' }).append(shadowComponent);
    document.body.append(element, host);
    const { loader } = createLoader({
      Later: manifestEntry('Later', { load }),
      Shadow: manifestEntry('Shadow', { load: shadowLoad }),
    });
    loader.start();

    element.dataset.component = 'Later';
    await settleMutations();

    expect(load).not.toHaveBeenCalled();
    expect(shadowLoad).not.toHaveBeenCalled();
  });
});

describe('ComponentLoader strategies', () => {
  it('supports eager, visible, idle, and interaction triggers', async () => {
    const loads = Object.fromEntries(
      ['Eager', 'Visible', 'Idle', 'Interaction'].map((token) => [
        token,
        vi.fn(async () => TestComponent),
      ]),
    );
    const idleCallbacks: Array<() => void> = [];
    const requestIdleCallback = vi.fn((callback: () => void) => {
      idleCallbacks.push(callback);
      return idleCallbacks.length;
    });
    document.body.innerHTML = `
      <div data-component="Eager"></div>
      <div data-component="Visible"></div>
      <div data-component="Idle"></div>
      <button data-component="Interaction"></button>
    `;
    const { loader } = createLoader(
      {
        Eager: manifestEntry('Eager', { load: loads.Eager }),
        Visible: manifestEntry('Visible', { strategy: 'visible', load: loads.Visible }),
        Idle: manifestEntry('Idle', { strategy: 'idle', load: loads.Idle }),
        Interaction: manifestEntry('Interaction', {
          strategy: 'interaction',
          load: loads.Interaction,
        }),
      },
      {
        IntersectionObserver: IntersectionObserverMock as unknown as typeof IntersectionObserver,
        requestIdleCallback,
        cancelIdleCallback: vi.fn(),
      },
    );
    loader.start();
    await settle();

    expect(loads.Eager).toHaveBeenCalledOnce();
    expect(IntersectionObserverMock.instances[0].options?.rootMargin).toBe(VISIBLE_ROOT_MARGIN);
    expect(requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), {
      timeout: IDLE_TIMEOUT,
    });
    expect(loads.Visible).not.toHaveBeenCalled();
    expect(loads.Idle).not.toHaveBeenCalled();
    expect(loads.Interaction).not.toHaveBeenCalled();

    IntersectionObserverMock.instances[0].trigger();
    idleCallbacks[0]();
    document
      .querySelector('[data-component="Interaction"]')
      ?.dispatchEvent(new Event('focusin', { bubbles: true }));
    await settle();

    expect(loads.Visible).toHaveBeenCalledOnce();
    expect(loads.Idle).toHaveBeenCalledOnce();
    expect(loads.Interaction).toHaveBeenCalledOnce();
  });

  it('falls back safely when scheduling APIs are unavailable', async () => {
    vi.useFakeTimers();
    const visibleLoad = vi.fn(async () => TestComponent);
    const idleLoad = vi.fn(async () => TestComponent);
    document.body.innerHTML = `
      <div data-component="Visible"></div>
      <div data-component="Idle"></div>
    `;
    const { loader, logger } = createLoader(
      {
        Visible: manifestEntry('Visible', { strategy: 'visible', load: visibleLoad }),
        Idle: manifestEntry('Idle', { strategy: 'idle', load: idleLoad }),
      },
      {
        IntersectionObserver: undefined,
        requestIdleCallback: undefined,
        setTimeout,
        clearTimeout,
      },
    );
    loader.start();
    await settle();

    expect(visibleLoad).toHaveBeenCalledOnce();
    expect(idleLoad).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      '[@studiometa/js-toolkit/autoload] IntersectionObserver is unavailable; loading component "Visible" eagerly.',
    );
    expect(logger.warn).toHaveBeenCalledWith(
      '[@studiometa/js-toolkit/autoload] requestIdleCallback is unavailable; using a timeout for component "Idle".',
    );

    await vi.advanceTimersByTimeAsync(IDLE_TIMEOUT);
    await settle();
    expect(idleLoad).toHaveBeenCalledOnce();
  });

  it('uses valid data-load values and falls back from invalid values', async () => {
    const visibleLoad = vi.fn(async () => TestComponent);
    const fallbackLoad = vi.fn(async () => TestComponent);
    const globalFallbackLoad = vi.fn(async () => TestComponent);
    document.body.innerHTML = `
      <div data-component="Visible" data-load="interaction"></div>
      <div data-component="Fallback" data-load="never"></div>
      <div data-component="GlobalFallback"></div>
    `;
    const globalFallback = manifestEntry('GlobalFallback', { load: globalFallbackLoad });
    globalFallback.strategy = 'invalid' as ComponentLoadStrategy;
    const { loader, logger } = createLoader({
      Visible: manifestEntry('Visible', { strategy: 'visible', load: visibleLoad }),
      Fallback: manifestEntry('Fallback', { load: fallbackLoad }),
      GlobalFallback: globalFallback,
    });
    loader.start();
    await settle();

    expect(visibleLoad).not.toHaveBeenCalled();
    expect(fallbackLoad).toHaveBeenCalledOnce();
    expect(globalFallbackLoad).toHaveBeenCalledOnce();
    expect(logger.warn).toHaveBeenCalledWith(
      '[@studiometa/js-toolkit/autoload] Component "Fallback" has an invalid data-load value; using its default.',
    );
    expect(logger.warn).toHaveBeenCalledWith(
      '[@studiometa/js-toolkit/autoload] Component "GlobalFallback" has an invalid manifest strategy; loading eagerly.',
    );

    document.querySelector('[data-component="Visible"]')?.dispatchEvent(new Event('pointerdown'));
    await settle();
    expect(visibleLoad).toHaveBeenCalledOnce();
  });

  it('gives startup eager components precedence over element strategies', async () => {
    const load = vi.fn(async () => TestComponent);
    document.body.innerHTML =
      '<button data-component="StartupEager" data-load="interaction"></button>';
    const { loader } = createLoader({
      StartupEager: manifestEntry('StartupEager', { strategy: 'visible', load }),
    });

    loader.start({ eagerComponents: ['StartupEager'] });
    await settle();

    expect(load).toHaveBeenCalledOnce();
  });

  it('lets the earliest trigger win and memoizes one import across conflicting discoveries', async () => {
    const load = vi.fn(async () => TestComponent);
    document.body.innerHTML = `
      <div data-component="Shared" data-load="visible"></div>
      <button data-component="Shared" data-load="interaction"></button>
    `;
    const { loader, register } = createLoader(
      { Shared: manifestEntry('Shared', { strategy: 'idle', load }) },
      {
        IntersectionObserver: IntersectionObserverMock as unknown as typeof IntersectionObserver,
      },
    );
    loader.start();

    document.querySelector('button')?.dispatchEvent(new Event('pointerover'));
    IntersectionObserverMock.instances[0].trigger();
    await settle();

    expect(load).toHaveBeenCalledOnce();
    expect(register).toHaveBeenCalledOnce();
    expect(IntersectionObserverMock.instances[0].disconnected).toBe(true);
  });

  it('accelerates existing lazy scheduling when a later eager element is discovered', async () => {
    const load = vi.fn(async () => TestComponent);
    document.body.innerHTML = '<div data-component="Accelerated" data-load="visible"></div>';
    const { loader } = createLoader(
      { Accelerated: manifestEntry('Accelerated', { strategy: 'visible', load }) },
      {
        IntersectionObserver: IntersectionObserverMock as unknown as typeof IntersectionObserver,
      },
    );
    loader.start();
    expect(load).not.toHaveBeenCalled();

    const eager = document.createElement('div');
    eager.dataset.component = 'Accelerated';
    eager.dataset.load = 'eager';
    document.body.append(eager);
    await settleMutations();

    expect(load).toHaveBeenCalledOnce();
    expect(IntersectionObserverMock.instances[0].disconnected).toBe(true);
  });

  it('disconnects visible observers for removed elements without cancelling connected triggers', async () => {
    const load = vi.fn(async () => TestComponent);
    document.body.innerHTML = `
      <section id="removed-subtree">
        <div data-component="SharedVisible"></div>
      </section>
      <div id="connected" data-component="SharedVisible"></div>
    `;
    const { loader } = createLoader(
      {
        SharedVisible: manifestEntry('SharedVisible', { strategy: 'visible', load }),
      },
      {
        IntersectionObserver: IntersectionObserverMock as unknown as typeof IntersectionObserver,
      },
    );
    loader.start();

    document.querySelector('#removed-subtree')?.remove();
    await settleMutations();

    expect(IntersectionObserverMock.instances[0].disconnected).toBe(true);
    expect(IntersectionObserverMock.instances[1].disconnected).toBe(false);

    IntersectionObserverMock.instances[1].trigger();
    await settle();

    expect(load).toHaveBeenCalledOnce();
  });

  it('removes interaction listeners with their element without cancelling connected triggers', async () => {
    const load = vi.fn(async () => TestComponent);
    document.body.innerHTML = `
      <button id="removed" data-component="SharedInteraction"></button>
      <button id="connected" data-component="SharedInteraction"></button>
    `;
    const { loader } = createLoader({
      SharedInteraction: manifestEntry('SharedInteraction', {
        strategy: 'interaction',
        load,
      }),
    });
    loader.start();

    const removed = document.querySelector('#removed');
    removed?.remove();
    await settleMutations();
    removed?.dispatchEvent(new Event('pointerdown'));
    await settle();
    expect(load).not.toHaveBeenCalled();

    document.querySelector('#connected')?.dispatchEvent(new Event('pointerdown'));
    await settle();
    expect(load).toHaveBeenCalledOnce();
  });
});

describe('ComponentLoader registration', () => {
  it('registers configured recursive and shared children without importing them again', async () => {
    class SharedComponent extends Base {
      static config: BaseConfig = { name: 'Shared' };
    }
    SharedComponent.config.components = { Shared: SharedComponent };

    class ChildComponent extends Base {
      static config: BaseConfig = {
        name: 'Child',
        components: { Shared: SharedComponent },
      };
    }

    class ParentComponent extends Base {
      static config: BaseConfig = {
        name: 'Parent',
        components: { Child: ChildComponent, Shared: SharedComponent },
      };
    }

    const parentLoad = vi.fn(async () => ParentComponent);
    const childLoad = vi.fn(async () => ChildComponent);
    const sharedLoad = vi.fn(async () => SharedComponent);
    document.body.innerHTML = `
      <div data-component="Parent"></div>
      <div data-component="Child Shared" data-load="interaction"></div>
    `;
    const { loader, register } = createLoader({
      Parent: manifestEntry('Parent', { children: ['Child', 'Shared'], load: parentLoad }),
      Child: manifestEntry('Child', {
        strategy: 'interaction',
        children: ['Shared'],
        load: childLoad,
      }),
      Shared: manifestEntry('Shared', {
        strategy: 'interaction',
        children: ['Shared'],
        load: sharedLoad,
      }),
    });
    loader.start();
    await settle();

    document
      .querySelector('[data-component="Child Shared"]')
      ?.dispatchEvent(new Event('pointerdown'));
    await settle();

    expect(parentLoad).toHaveBeenCalledOnce();
    expect(childLoad).not.toHaveBeenCalled();
    expect(sharedLoad).not.toHaveBeenCalled();
    expect(register).toHaveBeenCalledWith(ParentComponent, 'Parent');
    expect(register).toHaveBeenCalledWith(ChildComponent, 'Child');
    expect(register).toHaveBeenCalledWith(SharedComponent, 'Shared');
    expect(register).toHaveBeenCalledTimes(3);
  });

  it('mounts a pre-existing standalone recursive child with js-toolkit registration', async () => {
    const suffix = Math.random().toString(36).slice(2);
    const parentToken = `LoaderParent${suffix}`;
    const childToken = `LoaderChild${suffix}`;

    class RecursiveChild extends Base {
      static config: BaseConfig = { name: childToken };
    }

    class RecursiveParent extends Base {
      static config: BaseConfig = {
        name: parentToken,
        components: { [childToken]: RecursiveChild },
      };
    }

    const child = document.createElement('div');
    child.dataset.component = childToken;
    child.dataset.load = 'interaction';
    const parent = document.createElement('div');
    parent.dataset.component = parentToken;
    document.body.append(child, parent);

    const childLoad = vi.fn(async () => RecursiveChild);
    const { loader } = createLoader(
      {
        [parentToken]: manifestEntry(parentToken, {
          children: [childToken],
          load: vi.fn(async () => RecursiveParent),
        }),
        [childToken]: manifestEntry(childToken, {
          strategy: 'interaction',
          load: childLoad,
        }),
      },
      { registerComponent },
    );
    loader.start();
    await settleToolkit();

    const childInstances = [...getInstances(RecursiveChild)];
    expect(childLoad).not.toHaveBeenCalled();
    expect(childInstances).toHaveLength(1);
    expect(childInstances[0].$el).toBe(child);
    expect(childInstances[0].$isMounted).toBe(true);
  });

  it('still loads a child that was independently discovered first', async () => {
    const childLoad = vi.fn(async () => TestComponent);
    const parentLoad = vi.fn(async () => TestComponent);
    document.body.innerHTML = `
      <div data-component="Child"></div>
      <div data-component="Parent"></div>
    `;
    const { loader, register } = createLoader({
      Parent: manifestEntry('Parent', { children: ['Child'], load: parentLoad }),
      Child: manifestEntry('Child', { load: childLoad }),
    });
    loader.start();
    await settle();

    expect(childLoad).toHaveBeenCalledOnce();
    expect(parentLoad).toHaveBeenCalledOnce();
    expect(register).toHaveBeenCalledTimes(2);
  });

  it('isolates import, validation, and registration failures and emits diagnostics', async () => {
    const importError = new Error('import failed');
    const registrationError = new Error('registration failed');
    const register = vi.fn(async (_Constructor: BaseConstructor, token: string) => {
      if (token === 'RegisterFailure') {
        throw registrationError;
      }
    });
    const logger = { warn: vi.fn(), error: vi.fn() };
    const events: CustomEvent[] = [];
    document.addEventListener('js-toolkit:error', (event) => events.push(event as CustomEvent), {
      once: false,
    });
    document.body.innerHTML = `
      <div data-component="ImportFailure RegisterFailure Success Invalid"></div>
    `;
    const { loader } = createLoader(
      {
        ImportFailure: manifestEntry('ImportFailure', {
          load: vi.fn(async () => {
            throw importError;
          }),
        }),
        RegisterFailure: manifestEntry('RegisterFailure'),
        Success: manifestEntry('Success'),
        Invalid: manifestEntry('Invalid', {
          load: vi.fn(async () => (() => undefined) as unknown as BaseConstructor),
        }),
      },
      { registerComponent: register, console: logger },
    );
    loader.start();
    await settle();

    expect(register).toHaveBeenCalledWith(TestComponent, 'Success');
    expect(register).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalledTimes(3);
    expect(events.map(({ detail }) => [detail.token, detail.stage])).toEqual([
      ['ImportFailure', 'import'],
      ['Invalid', 'import'],
      ['RegisterFailure', 'registration'],
    ]);
    expect(events.every((event) => event.bubbles)).toBe(true);
  });
});
