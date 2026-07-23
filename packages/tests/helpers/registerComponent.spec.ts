import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Base, registerComponent } from '@studiometa/js-toolkit';
import { h } from '#test-utils';

beforeEach(() => {
  const component = h('div', { dataComponent: 'Component' });
  document.body.append(component);
});

afterEach(() => {
  for (const childNode of document.body.childNodes) {
    childNode.remove();
  }
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
});
