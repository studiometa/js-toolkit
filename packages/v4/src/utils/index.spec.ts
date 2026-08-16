import { describe, expect, it } from 'vitest';
import * as barrel from './index.js';
import * as dom from './dom.js';
import * as easings from './easings.js';
import * as historyModule from './history.js';
import * as is from './is.js';
import * as maths from './maths.js';
import * as memoModule from './memo.js';
import * as selectors from './selectors.js';
import * as smoothToModule from './smoothTo.js';
import * as strings from './strings.js';
import * as timing from './timing.js';
import * as transformModule from './transform.js';
import type { Memo, SmoothTo, SmoothToOptions, SpringOptions } from './index.js';

describe('the utils barrel', () => {
  it('names every runtime export of every module it fronts', () => {
    const expected = [
      ...Object.keys(dom),
      ...Object.keys(easings),
      ...Object.keys(historyModule),
      ...Object.keys(is),
      ...Object.keys(maths),
      ...Object.keys(memoModule),
      ...Object.keys(selectors),
      ...Object.keys(smoothToModule),
      ...Object.keys(strings),
      ...Object.keys(timing),
      ...Object.keys(transformModule),
    ].sort();

    expect(Object.keys(barrel).sort()).toEqual(expected);
  });

  it('forwards the types too, which the runtime check cannot see', () => {
    const spring: SpringOptions = { stiffness: 0.2, damping: 0.6, mass: 1 };
    const options: SmoothToOptions = { ...spring, spring: true, precision: 0.01 };
    const value: SmoothTo = barrel.smoothTo(0, options);
    const upper: Memo<[key: string], string> = barrel.memo((key: string) => key.toUpperCase());

    expect(upper('a')).toBe('A');
    expect(value()).toBe(0);
    value.destroy();
  });

  it('exports nothing the framework barrel also exports', () => {
    expect(Object.keys(barrel)).not.toContain('Base');
    expect(Object.keys(barrel)).not.toContain('registerComponent');
    expect(Object.keys(barrel)).not.toContain('defaultScheduler');
  });
});
