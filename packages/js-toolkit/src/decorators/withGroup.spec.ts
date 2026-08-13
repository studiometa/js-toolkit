import { describe, it, expect } from 'vitest';
import { Base, BaseConfig, withGroup, getScopedGroups } from '@studiometa/js-toolkit';
import { destroy, h, hConnected, mount } from '#test-utils';

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

  it('should isolate two scopes using the same group name', async () => {
    const scopeA = {};
    const scopeB = {};
    const scopes = new WeakMap<Base, object>();

    class Foo extends withGroup(Base, 'scoped:', {
      getScope: (instance) => scopes.get(instance),
    }) {
      static config: BaseConfig = {
        name: 'Foo',
      };
    }

    const a = new Foo(hConnected('div', { data: { optionGroup: 'group' } }));
    const b = new Foo(hConnected('div', { data: { optionGroup: 'group' } }));
    scopes.set(a, scopeA);
    scopes.set(b, scopeB);

    await mount(a, b);

    expect(a.$group).not.toBe(b.$group);
    expect(a.$group).toContain(a);
    expect(a.$group).not.toContain(b);
    expect(b.$group).toContain(b);
    expect(b.$group).not.toContain(a);
  });

  it('should inherit the group name from the scope via getGroup', async () => {
    const scope = { group: 'from-scope' };
    const scopes = new WeakMap<Base, typeof scope>();

    class Foo extends withGroup<Base, typeof scope>(Base, 'scoped:', {
      getScope: (instance) => scopes.get(instance),
      getGroup: (instance, resolvedScope) => instance.$options.group || resolvedScope?.group || '',
    }) {
      static config: BaseConfig = {
        name: 'Foo',
      };
    }

    // No explicit `data-option-group`, so the group name comes from the scope.
    const a = new Foo(hConnected('div'));
    const b = new Foo(hConnected('div'));
    scopes.set(a, scope);
    scopes.set(b, scope);

    await mount(a, b);

    expect(a.$group).toBe(b.$group);
    expect(getScopedGroups(scope).get('scoped:from-scope')).toBe(a.$group);
  });

  it('should fall back to the global registry when getScope returns undefined', async () => {
    class Foo extends withGroup(Base, 'fallback:', {
      getScope: () => undefined,
    }) {
      static config: BaseConfig = {
        name: 'Foo',
      };
    }

    class Bar extends withGroup(Base, 'fallback:') {
      static config: BaseConfig = {
        name: 'Bar',
      };
    }

    const foo = new Foo(hConnected('div', { data: { optionGroup: 'group' } }));
    const bar = new Bar(hConnected('div', { data: { optionGroup: 'group' } }));

    await mount(foo, bar);

    // Both resolve to the same global set for the key `fallback:group`.
    expect(foo.$group).toBe(bar.$group);
    expect(foo.$group).toContain(foo);
    expect(foo.$group).toContain(bar);
  });

  it('should remove the member from the set it joined at mount even if the scope changed', async () => {
    const scopeA = {};
    const scopeB = {};
    let currentScope: object = scopeA;

    class Foo extends withGroup(Base, 'snapshot:', {
      getScope: () => currentScope,
    }) {
      static config: BaseConfig = {
        name: 'Foo',
      };
    }

    const foo = new Foo(hConnected('div', { data: { optionGroup: 'group' } }));
    await mount(foo);

    const joinedSet = foo.$group;
    expect(joinedSet).toContain(foo);
    expect(getScopedGroups(scopeA).get('snapshot:group')).toBe(joinedSet);

    // The scope resolves differently now: a naive re-resolution on destroy
    // would target scopeB and leak `foo` in scopeA's set.
    currentScope = scopeB;

    // While still mounted, `$group` must keep returning the exact set joined at
    // mount, not re-resolve against the changed scope.
    expect(foo.$group).toBe(joinedSet);

    await destroy(foo);

    expect(joinedSet.has(foo)).toBe(false);
    expect(getScopedGroups(scopeB).has('snapshot:group')).toBe(false);
  });

  it('should re-resolve the group on remount after the scope changed', async () => {
    const scopeA = {};
    const scopeB = {};
    let currentScope: object = scopeA;

    class Foo extends withGroup(Base, 'remount:', {
      getScope: () => currentScope,
    }) {
      static config: BaseConfig = {
        name: 'Foo',
      };
    }

    const foo = new Foo(hConnected('div', { data: { optionGroup: 'group' } }));

    await mount(foo);
    expect(getScopedGroups(scopeA).get('remount:group')).toContain(foo);

    await destroy(foo);

    // The scope resolves differently now: on remount the instance must join
    // scopeB's set rather than the stale scopeA snapshot.
    currentScope = scopeB;

    await mount(foo);

    expect(getScopedGroups(scopeB).get('remount:group')).toContain(foo);
    expect(getScopedGroups(scopeA).get('remount:group')?.has(foo) ?? false).toBe(false);
  });

  it('should enumerate scoped members and return an empty result for unknown scopes', async () => {
    const scope = {};
    const scopes = new WeakMap<Base, object>();

    class Foo extends withGroup(Base, 'enum:', {
      getScope: (instance) => scopes.get(instance),
    }) {
      static config: BaseConfig = {
        name: 'Foo',
      };
    }

    const unknownScope = {};
    expect(getScopedGroups(unknownScope).size).toBe(0);

    const foo = new Foo(hConnected('div', { data: { optionGroup: 'group' } }));
    scopes.set(foo, scope);
    await mount(foo);

    const map = getScopedGroups(scope);
    expect(map.size).toBe(1);
    expect(map.get('enum:group')).toContain(foo);

    // Reading an unknown scope must not register it.
    expect(getScopedGroups(unknownScope).size).toBe(0);
  });

  it('should forget scoped instances not in the DOM anymore', async () => {
    const scope = {};
    const scopes = new WeakMap<Base, object>();

    class Foo extends withGroup(Base, 'scoped-clean:', {
      getScope: (instance) => scopes.get(instance),
    }) {
      static config: BaseConfig = {
        name: 'Foo',
      };
    }

    const fragment = new Document();
    const divA = h('div', { data: { optionGroup: 'group' } });
    const divB = h('div', { data: { optionGroup: 'group' } });
    fragment.append(divA, divB);

    const instanceA = new Foo(divA);
    const instanceB = new Foo(divB);
    scopes.set(instanceA, scope);
    scopes.set(instanceB, scope);

    await mount(instanceA, instanceB);

    expect(instanceA.$group).toContain(instanceA);
    expect(instanceA.$group).toContain(instanceB);

    divB.replaceWith(h('div', { data: { optionGroup: 'group' } }));

    expect(divB.isConnected).toBe(false);
    expect(instanceA.$group).toContain(instanceA);
    expect(instanceA.$group).not.toContain(instanceB);
  });
});
