import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Base, registerComponents } from '@studiometa/js-toolkit';
import { h } from '#test-utils';

beforeEach(() => {
  document.body.append(
    h('div', { dataComponent: 'Foo' }),
    h('div', { dataComponent: 'Bar' }),
    h('div', { dataComponent: 'Bar' }),
  );
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('The `registerComponents` helper', () => {
  it('should register multiple given components', async () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
      };
    }

    class Bar extends Base {
      static config = {
        name: 'Bar',
      };
    }

    const instances = await registerComponents(Foo, Bar);
    expect(instances).toHaveLength(3);
    expect(instances.filter((instance) => instance instanceof Foo)).toHaveLength(1);
    expect(instances.filter((instance) => instance instanceof Bar)).toHaveLength(2);
  });

  it('should register async components', async () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
      };
    }

    class Bar extends Base {
      static config = {
        name: 'Bar',
      };
    }

    const instances = await registerComponents(Promise.resolve(Foo), Promise.resolve(Bar));
    expect(instances).toHaveLength(3);
    expect(instances.filter((instance) => instance instanceof Foo)).toHaveLength(1);
    expect(instances.filter((instance) => instance instanceof Bar)).toHaveLength(2);
  });

  it('should register a mix of constructors, factories and module namespaces', async () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
      };
    }

    class Bar extends Base {
      static config = {
        name: 'Bar',
      };
    }

    const instances = await registerComponents(Foo, () => Promise.resolve({ default: Bar }));
    expect(instances).toHaveLength(3);
    expect(instances.filter((instance) => instance instanceof Foo)).toHaveLength(1);
    expect(instances.filter((instance) => instance instanceof Bar)).toHaveLength(2);
  });

  it('should return an empty array when called without components', async () => {
    const instances = await registerComponents();
    expect(instances).toEqual([]);
  });
});
