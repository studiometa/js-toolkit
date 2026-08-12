import { afterEach, describe, expect, it } from 'vitest';
import { Base, type BaseConfig } from './Base.js';
import { whenDOMSettled } from './dom-mutations.js';
import { registerComponent } from './registry.js';
import { resetDom } from './test-utils.js';

let counter = 0;

function uniqueName(prefix: string): string {
  counter += 1;
  return `${prefix}${counter}`;
}

afterEach(resetDom);

describe('whenDOMSettled', () => {
  it('waits for an inserted eager component to mount', async () => {
    const name = uniqueName('SettledEager');
    class Eager extends Base {
      static config = { name };
    }
    registerComponent(Eager);

    const el = document.createElement('div');
    el.setAttribute('data-component', name);
    document.body.append(el);

    await whenDOMSettled();
    expect(el.__base__?.get(name)?.$isMounted).toBe(true);
  });

  it('follows mutations created by eager lifecycle work', async () => {
    const childName = uniqueName('SettledChild');
    const parentName = uniqueName('SettledParent');

    class Child extends Base {
      static config = { name: childName };
    }

    class Parent extends Base {
      static config: BaseConfig = { name: parentName, components: { Child } };

      mounted(): void {
        const child = document.createElement('span');
        child.setAttribute('data-component', childName);
        this.$el.append(child);
      }
    }

    registerComponent(Parent);
    const parent = document.createElement('div');
    parent.setAttribute('data-component', parentName);
    document.body.append(parent);

    await whenDOMSettled();
    const child = parent.firstElementChild;
    expect(child?.__base__?.get(childName)?.$isMounted).toBe(true);
  });

  it('does not wait for a conditional mount strategy', async () => {
    const name = uniqueName('SettledVisible');
    class Visible extends Base {
      static config = { name };
    }
    registerComponent(Visible);

    const el = document.createElement('div');
    el.setAttribute('data-component', name);
    el.setAttribute('data-mount', 'visible');
    el.setAttribute('style', 'position:absolute;top:300vh;width:10px;height:10px');
    document.body.append(el);

    await whenDOMSettled();
    expect(el.__base__?.get(name)).toBeUndefined();
  });

  it('waits for eager teardown caused by removal', async () => {
    const name = uniqueName('SettledRemoval');
    class Removed extends Base {
      static config = { name };
      destroys = 0;
      destroyed(): void {
        this.destroys += 1;
      }
    }
    registerComponent(Removed);

    const el = document.createElement('div');
    el.setAttribute('data-component', name);
    document.body.append(el);
    await whenDOMSettled();
    const instance = el.__base__?.get(name) as Removed;

    el.remove();
    await whenDOMSettled();
    expect(instance.$isMounted).toBe(false);
    expect(instance.destroys).toBe(1);
  });
});
