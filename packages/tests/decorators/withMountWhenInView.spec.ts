import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { Base, withMountWhenInView } from '@studiometa/js-toolkit';
import { wait } from '@studiometa/js-toolkit/utils';
import {
  intersectionObserverBeforeAllCallback,
  intersectionObserverAfterEachCallback,
  mockIsIntersecting,
  intersectionMockInstance,
} from '#test-utils';

beforeAll(() => intersectionObserverBeforeAllCallback());

afterEach(() => {
  intersectionObserverAfterEachCallback();
});

async function getContext() {
  class Foo extends withMountWhenInView(Base) {
    static config = {
      name: 'Foo',
    };
  }

  const div = document.createElement('div');
  const instance = new Foo(div);
  instance.$mount();

  return {
    div,
    instance,
  };
}

describe('The withMountWhenInView decorator', () => {
  it('should mount the component when in view', async () => {
    const { div, instance } = await getContext();
    mockIsIntersecting(div, true);
    await wait(16);
    expect(instance.$isMounted).toBe(true);
  });

  it('should not mount the component when not in view', async () => {
    const { div, instance } = await getContext();
    mockIsIntersecting(div, false);
    expect(instance.$isMounted).toBe(false);
  });

  it('should destroy the component when not in view', async () => {
    const { div, instance } = await getContext();
    mockIsIntersecting(div, true);
    await wait(16);
    expect(instance.$isMounted).toBe(true);
    mockIsIntersecting(div, false);
    await wait(16);
    expect(instance.$isMounted).toBe(false);
  });

  it('should disconnect the observer when terminated', async () => {
    const { div, instance } = await getContext();
    const observer = intersectionMockInstance(div);
    const disconnect = vi.spyOn(observer, 'disconnect');
    await instance.$terminate();
    await wait(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
