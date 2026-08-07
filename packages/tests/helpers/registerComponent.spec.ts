import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Base, registerComponent } from '@studiometa/js-toolkit';
import { h } from '#test-utils';

beforeEach(() => {
  const component = h('div', { dataComponent: 'Component' });
  document.body.append(component);
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('The `registerComponent` lazy import helper', () => {
  it('should register a given component', async () => {
    class Component extends Base {
      static config = {
        name: 'Component',
      };
    }

    const instances = await registerComponent(Component);
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Component);
  });

  it('should register a given async component', async () => {
    class Component extends Base {
      static config = {
        name: 'Component',
      };
    }

    const instances = await registerComponent(Promise.resolve(Component));
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Component);
  });

  it('should register a given component with custom name', async () => {
    class Component extends Base {
      static config = {
        name: 'Component',
      };
    }

    const instances = await registerComponent(Component, 'div');
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Component);
  });

  it('should register a given async component', async () => {
    class Component extends Base {
      static config = {
        name: 'Component',
      };
    }

    const instances = await registerComponent(Promise.resolve(Component), 'div');
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Component);
  });

  it('should register a component from a module namespace (dynamic import)', async () => {
    class Component extends Base {
      static config = {
        name: 'Component',
      };
    }

    // `import('./Component.js')` resolves to a module namespace `{ default: Component }`.
    const instances = await registerComponent(Promise.resolve({ default: Component }));
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Component);
  });

  it('should register a component from a factory returning a constructor', async () => {
    class Component extends Base {
      static config = {
        name: 'Component',
      };
    }

    const instances = await registerComponent(() => Promise.resolve(Component));
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Component);
  });

  it('should register a component from a factory returning a module namespace', async () => {
    class Component extends Base {
      static config = {
        name: 'Component',
      };
    }

    // Mirrors declaring lazy child components with `() => import('./Component.js')`.
    const instances = await registerComponent(() => Promise.resolve({ default: Component }));
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Component);
  });

  it('should register a directly given class owning a static `default` member', async () => {
    class Component extends Base {
      static config = {
        name: 'Component',
      };

      // A user-defined static member named `default` must not be mistaken for a
      // module namespace when the class is passed directly.
      static default = 'not a component';
    }

    const instances = await registerComponent(Component);
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Component);
  });

  it('should register a resolved class owning a static `default` member', async () => {
    class Component extends Base {
      static config = {
        name: 'Component',
      };

      // The `$isBase` marker, not the presence of a `default` member, tells a
      // resolved constructor apart from a module namespace.
      static default = 'not a component';
    }

    const instances = await registerComponent(Promise.resolve(Component));
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Component);
  });

  it('should mount the remaining instances when one element fails', async () => {
    const failing = h('div', { dataComponent: 'Component' });
    failing.setAttribute('data-fail', '');
    document.body.append(failing);

    class Component extends Base {
      static config = {
        name: 'Component',
      };

      constructor(el: HTMLElement) {
        super(el);
        if (el.hasAttribute('data-fail')) {
          throw new Error('boom');
        }
      }
    }

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // One of the two matching elements throws while mounting; the other must
    // still be returned instead of failing the whole call.
    const instances = await registerComponent(Component);
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Component);
    expect(errorSpy).toHaveBeenCalledTimes(1);

    errorSpy.mockRestore();
  });

  it('should skip an instance whose mount failed', async () => {
    const failing = h('div', { dataComponent: 'Component' });
    failing.setAttribute('data-fail', '');
    document.body.append(failing);

    class Component extends Base {
      static config = {
        name: 'Component',
      };

      constructor(el: HTMLElement) {
        super(el);
        if (el.hasAttribute('data-fail')) {
          // Fail while wiring, so the instance never becomes mounted.
          this.__services.enableAll = () => {
            throw new Error('boom');
          };
        }
      }
    }

    // `$mount()` resolves instead of rejecting, so the failure is reported on
    // the global error channel. Intercept it here.
    const microtask = vi.spyOn(globalThis, 'queueMicrotask').mockImplementation(() => {});

    // A never-mounted instance must not be handed back as a successful
    // registration.
    const instances = await registerComponent(Component);
    expect(instances).toHaveLength(1);
    expect(instances[0].$el).not.toBe(failing);
    expect(instances[0].$isMounted).toBe(true);

    microtask.mockRestore();
  });
});
