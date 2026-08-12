import { describe, expect, it } from 'vitest';
import * as barrel from './index.js';
import * as maths from './maths.js';
import * as selectors from './selectors.js';
import * as smoothToModule from './smoothTo.js';
import * as strings from './strings.js';
import type { SmoothTo, SmoothToOptions, SpringOptions } from './index.js';

describe('the utils barrel', () => {
  it('names every runtime export of every module it fronts', () => {
    // A hand-written list is only better than `export *` if it is complete, and
    // the only thing that keeps it complete is checking. Add a function to a
    // module without adding it here and this fails with the name in the diff.
    const expected = [
      ...Object.keys(maths),
      ...Object.keys(selectors),
      ...Object.keys(smoothToModule),
      ...Object.keys(strings),
    ].sort();

    expect(Object.keys(barrel).sort()).toEqual(expected);
  });

  it('forwards the types too, which the runtime check cannot see', () => {
    // Type-only exports leave no trace on the namespace object, so they are
    // asserted by using them: this fails to compile if the barrel drops one.
    const spring: SpringOptions = { stiffness: 0.2, damping: 0.6, mass: 1 };
    const options: SmoothToOptions = { ...spring, spring: true, precision: 0.01 };
    const value: SmoothTo = barrel.smoothTo(0, options);

    expect(value()).toBe(0);
    value.destroy();
  });

  it('exports nothing the framework barrel also exports', () => {
    // The two entries are meant to be disjoint: utils are not part of the
    // framework's surface, which is the whole reason this file exists.
    expect(Object.keys(barrel)).not.toContain('Base');
    expect(Object.keys(barrel)).not.toContain('registerComponent');
    expect(Object.keys(barrel)).not.toContain('scheduler');
  });
});
