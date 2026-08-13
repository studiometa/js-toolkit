import { describe, it, expect } from 'vitest';
import {
  Base,
  queryComponent,
  queryComponentAll,
  closestComponent,
  withName,
} from '@studiometa/js-toolkit';
import {
  parseQuery,
  type ParsedQuery,
  instanceIsMatching,
} from '#private/helpers/queryComponent.js';
import { destroy, h, mount } from '#test-utils';

let index = 0;
function randomName() {
  index += 1;
  return `Foo${index}`;
}

describe('The `parseQuery` function', () => {
  const specs = [
    ['Foo', { name: 'Foo', cssSelector: undefined, state: undefined }],
    ['Foo:mounted', { name: 'Foo', cssSelector: undefined, state: 'mounted' }],
    ['Foo(#id)', { name: 'Foo', cssSelector: '#id', state: undefined }],
    [
      'Foo(.foo:is(.bar)):destroyed',
      { name: 'Foo', cssSelector: '.foo:is(.bar)', state: 'destroyed' },
    ],
  ] as [string, ParsedQuery][];

  for (const [query, result] of specs) {
    it(`should parse "${query}"`, () => {
      expect(parseQuery(query)).toEqual(result);
    });
  }
});

describe('The `instanceIsMatching` function', () => {
  it('should match names', async () => {
    const div = h();
    const instance = new (withName(Base, 'Foo'))(div);
    await mount(instance);
    expect(instanceIsMatching(instance, { name: 'Foo' })).toBe(true);
    expect(instanceIsMatching(instance, { name: 'Bar' })).toBe(false);
  });

  it('should match CSS selectors', async () => {
    const div = h('div', { id: 'foo' });
    const instance = new (withName(Base, 'Foo'))(div);
    await mount(instance);
    expect(instanceIsMatching(instance, { name: 'Foo', cssSelector: '#foo' })).toBe(true);
    expect(instanceIsMatching(instance, { name: 'Foo', cssSelector: '#bar' })).toBe(false);
  });

  it('should match states', async () => {
    const div = h('div');
    const instance = new (withName(Base, 'Foo'))(div);
    expect(instanceIsMatching(instance, { name: 'Foo', state: 'mounted' })).toBe(false);
    expect(instanceIsMatching(instance, { name: 'Foo', state: 'destroyed' })).toBe(true);
    await mount(instance);
    expect(instanceIsMatching(instance, { name: 'Foo', state: 'mounted' })).toBe(true);
    expect(instanceIsMatching(instance, { name: 'Foo', state: 'destroyed' })).toBe(false);
    await destroy(instance);
    expect(instanceIsMatching(instance, { name: 'Foo', state: 'mounted' })).toBe(false);
    expect(instanceIsMatching(instance, { name: 'Foo', state: 'destroyed' })).toBe(true);
  });
});

describe('The `queryComponent` function', () => {
  it('should return a single component matching the given query', async () => {
    const name = randomName();
    const div = h('div');
    const instance = new (withName(Base, name))(div);
    await mount(instance);
    expect(queryComponent(name)).toBe(instance);
    expect(queryComponent(randomName())).toBeUndefined();
  });

  it('should return a single component matching the given query from the given root', async () => {
    const name = randomName();
    const div = h('div');
    const middle = h('div', [div]);
    const root = h('div', [middle]);
    const instance = new (withName(Base, name))(div);
    await mount(instance);
    expect(queryComponent(name, { from: root })).toBe(instance);
    expect(queryComponent(name, { from: middle })).toBe(instance);
    expect(queryComponent(name, { from: div })).toBe(instance);
    expect(queryComponent(randomName(), { from: root })).toBeUndefined();
    expect(queryComponent(randomName(), { from: div })).toBeUndefined();
    expect(queryComponent(randomName(), { from: middle })).toBeUndefined();
    expect(queryComponent(randomName(), { from: h() })).toBeUndefined();
  });
});

describe('The `queryComponentAll` function', () => {
  it('should return a list of components matching the given query', async () => {
    const name = randomName();
    const divA = h('div');
    const divB = h('div');
    const root = h('div', [divA, divB]);
    const instanceA = new (withName(Base, name))(divA);
    const instanceB = new (withName(Base, name))(divB);
    await mount(instanceA, instanceB);
    expect(queryComponentAll(name, { from: root })).toEqual([instanceA, instanceB]);
    expect(queryComponentAll(randomName(), { from: root })).toEqual([]);

    expect(queryComponentAll(name, { from: divA })).toEqual([instanceA]);
    expect(queryComponentAll(randomName(), { from: divA })).toEqual([]);
  });

  it('should return a list of components matching the given query', async () => {
    const name = randomName();
    const instanceA = new (withName(Base, name))(h('div'));
    const instanceB = new (withName(Base, name))(h('div'));
    await mount(instanceA, instanceB);
    expect(queryComponentAll(name)).toEqual([instanceA, instanceB]);
    expect(queryComponentAll(randomName())).toEqual([]);
  });
});

describe('The `queryComponent` / `queryComponentAll` __base__ resolution', () => {
  it('returns detached elements with from=document (no attachment constraint)', async () => {
    const name = randomName();
    const div = h('div'); // detached, never appended to the global document
    const instance = new (withName(Base, name))(div);
    await mount(instance);
    expect(div.isConnected).toBe(false);
    expect(queryComponent(name)).toBe(instance);
    expect(queryComponentAll(name)).toEqual([instance]);
  });

  it('matches the `from` element itself as well as its descendants', async () => {
    const name = randomName();
    const selfEl = h('div');
    const childEl = h('div');
    const root = h('div', [selfEl, childEl]);
    const selfInstance = new (withName(Base, name))(selfEl);
    const childInstance = new (withName(Base, name))(childEl);
    await mount(selfInstance, childInstance);

    // Self match: `from` IS the instance element (querySelectorAll excludes it).
    expect(queryComponent(name, { from: selfEl })).toBe(selfInstance);
    expect(queryComponentAll(name, { from: selfEl })).toEqual([selfInstance]);

    // Descendants, in DOM order.
    expect(queryComponentAll(name, { from: root })).toEqual([selfInstance, childInstance]);
  });

  it('resolves components on elements without a name-derived attribute', async () => {
    const name = randomName();
    const plain = h('div'); // no data-component attribute, no `w-name` tag
    const root = h('div', [plain]);
    const instance = new (withName(Base, name))(plain);
    await mount(instance);

    // A `getSelector`-based query would miss this element entirely; the
    // `__base__` map lookup is keyed on config.name only, so it finds it.
    expect(plain.getAttribute('data-component')).toBeNull();
    expect(queryComponent(name, { from: root })).toBe(instance);
    expect(queryComponentAll(name, { from: root })).toEqual([instance]);
  });

  it('honors :mounted and :destroyed state filters from an element root', async () => {
    const name = randomName();
    const div = h('div');
    const root = h('div', [div]);
    const instance = new (withName(Base, name))(div);
    await mount(instance);

    expect(queryComponent(`${name}:mounted`, { from: root })).toBe(instance);
    expect(queryComponentAll(`${name}:mounted`, { from: root })).toEqual([instance]);
    expect(queryComponent(`${name}:destroyed`, { from: root })).toBeUndefined();
    expect(queryComponentAll(`${name}:destroyed`, { from: root })).toEqual([]);
  });

  it('skips terminated __base__ entries', async () => {
    const name = randomName();
    const div = h('div');
    const root = h('div', [div]);
    const instance = new (withName(Base, name))(div);
    await mount(instance);
    expect(queryComponent(name, { from: root })).toBe(instance);

    await instance.$terminate();

    // `$terminate` writes the literal `'terminated'` string in `__base__`.
    expect((div as Base['$el']).__base__.get(name)).toBe('terminated');
    expect(queryComponent(name, { from: root })).toBeUndefined();
    expect(queryComponentAll(name, { from: root })).toEqual([]);
  });
});

describe('The `closestComponent` function', () => {
  it('should return the closest instance matching the given query', async () => {
    const name = randomName();
    const child = h('div');
    const div = h('div', [child]);
    const instance = new (withName(Base, name))(div);
    await mount(instance);
    expect(closestComponent(name, { from: child })).toBe(instance);
    expect(closestComponent(randomName(), { from: child })).toBeUndefined();
  });

  it('should return the closest instance matching the given query with CSS selector', async () => {
    const name = randomName();
    const grandchild = h('div');
    const child = h('div', [grandchild]);
    const div = h('div', { id: 'id' }, [child]);
    const instance = new (withName(Base, name))(div);
    await mount(instance);
    expect(closestComponent(`${name}(#id)`, { from: grandchild })).toBe(instance);
    expect(closestComponent(`${randomName()}(#id)`, { from: grandchild })).toBeUndefined();
  });

  it('should not return a non-ancestor instance that exists in the DOM', async () => {
    const name = randomName();
    // Create two sibling trees: ancestor -> child, and sibling (not an ancestor)
    const child = h('div');
    const ancestor = h('div', [child]);
    const sibling = h('div');
    document.body.append(ancestor, sibling);

    const Comp = withName(Base, name);
    const siblingInstance = new Comp(sibling);
    await mount(siblingInstance);

    // closestComponent from child should NOT return the sibling instance
    expect(closestComponent(name, { from: child })).toBeUndefined();

    // Now mount an ancestor instance — it should be found
    const ancestorInstance = new Comp(ancestor);
    await mount(ancestorInstance);
    expect(closestComponent(name, { from: child })).toBe(ancestorInstance);

    await destroy(siblingInstance);
    await destroy(ancestorInstance);
  });
});
