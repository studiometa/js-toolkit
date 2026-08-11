import { afterEach, describe, expect, it } from 'vitest';
import { nextFrame } from './scheduler.js';
import { resetDom } from './test-utils.js';
import { viewTransition } from './viewTransition.js';

afterEach(resetDom);

describe('view transitions (native)', () => {
  it('batches updates into one native transition and resolves when finished', async () => {
    expect(typeof document.startViewTransition).toBe('function');

    const target = document.createElement('p');
    target.textContent = 'before';
    document.body.append(target);

    const a = viewTransition(() => {
      target.textContent = 'after';
    });
    const b = viewTransition(() => {
      target.dataset.done = 'yes';
    });
    await Promise.all([a, b]);

    expect(target.textContent).toBe('after');
    expect(target.dataset.done).toBe('yes');
    await nextFrame();
  });
});
