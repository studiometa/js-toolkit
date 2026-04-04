import { describe, it, expect } from 'vitest';
import { Base, withName } from '@studiometa/js-toolkit';
import { h, mount } from '#test-utils';

describe('The `$query` method', () => {
  it('should return descendant instances matching the given query', async () => {
    const child = h('div');
    const root = h('div', [child]);
    const Parent = withName(Base, 'Parent');
    const Child = withName(Base, 'Child');

    const parentInstance = new Parent(root);
    const childInstance = new Child(child);
    await mount(parentInstance, childInstance);

    expect(parentInstance.$query('Child')).toEqual([childInstance]);
    expect(parentInstance.$query('Unknown')).toEqual([]);
  });

  it('should not return instances outside the scope', async () => {
    const child = h('div');
    const root = h('div', [child]);
    const outside = h('div');
    const Parent = withName(Base, 'QueryParent');
    const Child = withName(Base, 'QueryChild');

    const parentInstance = new Parent(root);
    const childInstance = new Child(child);
    const outsideInstance = new Child(outside);
    await mount(parentInstance, childInstance, outsideInstance);

    expect(parentInstance.$query('QueryChild')).toEqual([childInstance]);
  });
});

describe('The `$closest` method', () => {
  it('should return the closest ancestor instance matching the given query', async () => {
    const child = h('div');
    const root = h('div', [child]);
    const Parent = withName(Base, 'ClosestParent');
    const Child = withName(Base, 'ClosestChild');

    const parentInstance = new Parent(root);
    const childInstance = new Child(child);
    await mount(parentInstance, childInstance);

    expect(childInstance.$closest('ClosestParent')).toBe(parentInstance);
    expect(childInstance.$closest('Unknown')).toBeUndefined();
  });

  it('should return undefined when no ancestor matches', async () => {
    const div = h('div');
    const Child = withName(Base, 'OrphanChild');
    const childInstance = new Child(div);
    await mount(childInstance);

    expect(childInstance.$closest('NonExistent')).toBeUndefined();
  });
});
