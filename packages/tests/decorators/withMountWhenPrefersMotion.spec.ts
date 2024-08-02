import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Base, withMountWhenPrefersMotion } from '@studiometa/js-toolkit';
import { advanceTimersByTimeAsync, useMatchMedia, useFakeTimers, useRealTimers } from '#test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

async function mountComponent(mediaQuery = 'not (prefers-reduced-motion)') {
  const matchMedia = useMatchMedia(mediaQuery);
  class Foo extends withMountWhenPrefersMotion(Base) {
    static config = {
      name: 'Foo',
    };
  }

  const div = document.createElement('div');
  const instance = new Foo(div);
  instance.$mount();
  await advanceTimersByTimeAsync(1);

  return { instance, matchMedia };
}

describe('The withMountWhenPrefersMotion decorator', () => {
  it('should mount the component when user prefers motion', async () => {
    const { instance } = await mountComponent();
    expect(instance.$isMounted).toBe(true);
  });

  it('should not mount the component when user prefers reduced motion', async () => {
    const { instance } = await mountComponent('(prefers-reduced-motion)');
    expect(instance.$isMounted).toBe(false);
  });
});
