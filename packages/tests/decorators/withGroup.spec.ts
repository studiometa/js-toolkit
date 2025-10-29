import { describe, it, expect, vi } from 'vitest';
import { Base, BaseConfig, withGroup } from '@studiometa/js-toolkit';
import { destroy, h, mount } from '#test-utils';

describe('The `withGroup` decorator', () => {
  it('should group mounted components', async () => {
    class Foo extends withGroup(Base) {
      static config: BaseConfig = {
        name: 'Foo',
      };
    }

    class Bar extends withGroup(Base) {
      static config: BaseConfig = {
        name: 'Bar',
      };
    }

    const foo = new Foo(h('div', { data: { optionGroup: 'group' } }));
    const bar = new Bar(h('div', { data: { optionGroup: 'group' } }));
    await mount(foo, bar);
    expect(foo.$group).toBe(bar.$group);
  });

  it('should group mounted components with namespace', async () => {
    class Foo extends withGroup(Base, 'ns:') {
      static config: BaseConfig = {
        name: 'Foo',
      };
    }

    class Bar extends withGroup(Base) {
      static config: BaseConfig = {
        name: 'Bar',
      };
    }

    const foo = new Foo(h('div', { data: { optionGroup: 'group' } }));
    const bar = new Bar(h('div', { data: { optionGroup: 'group' } }));
    await mount(foo, bar);
    expect(foo.$group).not.toContain(bar);
  });

  it('should not include destroyed components', async () => {
    class Foo extends withGroup(Base) {
      static config: BaseConfig = {
        name: 'Foo',
      };
    }

    class Bar extends withGroup(Base) {
      static config: BaseConfig = {
        name: 'Bar',
      };
    }

    const foo = new Foo(h('div'));
    const bar = new Bar(h('div'));
    await mount(foo, bar);
    expect(foo.$group).toBe(bar.$group);
    await destroy(foo);
    expect(foo.$group.has(foo)).toBe(false);
  });

  it('should forget grouped instances not in the DOM anymore', async () => {
    class Foo extends withGroup(Base) {
      static config: BaseConfig = {
        name: 'Foo',
      };
    }

    const fragment = new Document();
    const divA = h('div', {
      data: { optionGroup: 'group' },
    });
    const divB = h('div', {
      data: { optionGroup: 'group' },
    });

    fragment.append(divA, divB);

    const instanceA = new Foo(divA);
    const instanceB = new Foo(divB);

    await mount(instanceA, instanceB);

    expect(divA.isConnected).toBe(true);
    expect(divB.isConnected).toBe(true);
    expect(instanceA.$group).toContain(instanceA);
    expect(instanceA.$group).toContain(instanceB);

    divB.replaceWith(
      h('div', {
        data: { optionGroup: 'group' },
      }),
    );

    expect(divA.isConnected).toBe(true);
    expect(divB.isConnected).toBe(false);
    expect(instanceA.$group).toContain(instanceA);
    expect(instanceA.$group).not.toContain(instanceB);
  });
});
