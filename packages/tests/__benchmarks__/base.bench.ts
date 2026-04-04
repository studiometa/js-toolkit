import { describe, bench, afterAll } from 'vitest';
import { Base } from '@studiometa/js-toolkit';
import type { BaseConfig } from '@studiometa/js-toolkit';
import { getAllProperties } from '#private/utils/object/getAllProperties.js';
import { getInstances, addInstance, deleteInstance } from '#private/Base/utils.js';
import { memo, memoize } from '@studiometa/js-toolkit/utils';
import { SmartQueue } from '#private/utils/SmartQueue.js';

// --- Setup: create component classes ---

class GrandParent extends Base {
  static config: BaseConfig = {
    name: 'GrandParent',
    components: { Parent: null as any },
  };
}

class Parent extends Base {
  static config: BaseConfig = {
    name: 'Parent',
    refs: ['title', 'items[]'],
    components: { Child: null as any },
    options: {
      speed: { type: Number, default: 1 },
      label: { type: String, default: '' },
    },
  };
  mounted() {}
  resized() {}
  scrolled() {}
  onTitleClick() {}
}

class Child extends Base {
  static config: BaseConfig = {
    name: 'Child',
    options: {
      delay: { type: Number, default: 0 },
    },
  };
  mounted() {}
  ticked() {}
}

GrandParent.config.components.Parent = Parent;
Parent.config.components.Child = Child;

function createElement(name: string): HTMLElement {
  const el = document.createElement('div');
  el.dataset.component = name;
  document.body.appendChild(el);
  return el;
}

describe('Base internals', () => {
  describe('__config (prototype chain merge)', () => {
    const child = new Child(createElement('Child'));

    bench('access __config', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const config = child.__config;
    });

    const parent = new Parent(createElement('Parent'));

    bench('access __config (deeper inheritance)', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const config = parent.__config;
    });
  });

  describe('getAllProperties', () => {
    const child = new Child(createElement('Child'));

    bench('getAllProperties (no filter)', () => {
      getAllProperties(child);
    });

    bench('getAllProperties (with regex filter)', () => {
      getAllProperties(child, [], (method) => /^on[A-Z].*$/.test(method));
    });

    const parent = new Parent(createElement('Parent'));

    bench('getAllProperties on Parent (more methods)', () => {
      getAllProperties(parent, [], (method) => /^on[A-Z].*$/.test(method));
    });
  });

  describe('getInstances', () => {
    // Populate with N instances
    const instances: Base[] = [];
    for (let i = 0; i < 100; i++) {
      const el = createElement('Child');
      const instance = new Child(el);
      addInstance(instance);
      instances.push(instance);
    }

    bench('getInstances() (100 instances, copy Set)', () => {
      getInstances();
    });

    bench('getInstances(Child) (100 instances, filtered)', () => {
      getInstances(Child);
    });

    // Cleanup
    afterAll(() => {
      for (const instance of instances) {
        deleteInstance(instance);
      }
    });
  });

  describe('Queue.add (Promise creation)', () => {
    const queue = new SmartQueue();

    bench('queue.add (creates Promise + closure)', () => {
      queue.add(() => {});
    });
  });

  describe('memo / memoize', () => {
    const memoFn = memo((x: string) => x.toUpperCase());
    const memoizeFn = memoize((x: string) => x.toUpperCase());

    bench('memo hit', () => {
      memoFn('hello');
    });

    bench('memo miss', () => {
      memoFn(Math.random().toString());
    });

    bench('memoize hit', () => {
      memoizeFn('hello');
    });

    bench('memoize miss', () => {
      memoizeFn(Math.random().toString());
    });
  });
});
