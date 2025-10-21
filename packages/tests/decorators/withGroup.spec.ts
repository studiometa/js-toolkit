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

    const foo = new Foo(h('div',));
    const bar = new Bar(h('div',));
    await mount(foo, bar);
    expect(foo.$group).toBe(bar.$group);
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
});
