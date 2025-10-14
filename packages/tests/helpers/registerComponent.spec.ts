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
});
