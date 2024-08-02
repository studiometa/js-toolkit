import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { Base, withMountWhenInView } from '@studiometa/js-toolkit';
import {
  intersectionObserverBeforeAllCallback,
  intersectionObserverAfterEachCallback,
  mockIsIntersecting,
  intersectionMockInstance,
  useFakeTimers,
  useRealTimers,
  advanceTimersByTimeAsync,
} from '#test-utils';

beforeAll(() => intersectionObserverBeforeAllCallback());

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  intersectionObserverAfterEachCallback();
  useRealTimers();
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
    await advanceTimersByTimeAsync(1);
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
    await advanceTimersByTimeAsync(1);
    expect(instance.$isMounted).toBe(true);
    mockIsIntersecting(div, false);
    await advanceTimersByTimeAsync(1);
    expect(instance.$isMounted).toBe(false);
  });

  it('should disconnect the observer when terminated', async () => {
    const { div, instance } = await getContext();
    const observer = intersectionMockInstance(div);
    const disconnect = vi.spyOn(observer, 'disconnect');
    instance.$terminate();
    await advanceTimersByTimeAsync(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
