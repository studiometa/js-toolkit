import { describe, expect, expectTypeOf, it } from 'vitest';
import { EVENTS } from './events.js';

describe('EVENTS', () => {
  it('uses the exact public framework event names', () => {
    expect(EVENTS).toEqual({
      component: {
        mounted: 'js-toolkit:component:mounted',
        destroyed: 'js-toolkit:component:destroyed',
      },
      error: 'js-toolkit:error',
    });
  });

  it('is deeply frozen at runtime and readonly with literal types', () => {
    expect(Object.isFrozen(EVENTS)).toBe(true);
    expect(Object.isFrozen(EVENTS.component)).toBe(true);
    expectTypeOf(EVENTS).toEqualTypeOf<{
      readonly component: {
        readonly mounted: 'js-toolkit:component:mounted';
        readonly destroyed: 'js-toolkit:component:destroyed';
      };
      readonly error: 'js-toolkit:error';
    }>();
  });
});
