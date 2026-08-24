import { describe, expect, expectTypeOf, it } from 'vitest';
import { EVENTS } from './events.js';

describe('EVENTS', () => {
  it('uses the exact public framework event names', () => {
    expect(EVENTS).toEqual({
      component: {
        mounted: 'js-toolkit:component:mounted',
        unmounted: 'js-toolkit:component:unmounted',
      },
      dom: { update: 'js-toolkit:dom:update' },
      diagnostic: 'js-toolkit:diagnostic',
    });
  });

  it('is deeply frozen at runtime and readonly with literal types', () => {
    expect(Object.isFrozen(EVENTS)).toBe(true);
    expect(Object.isFrozen(EVENTS.component)).toBe(true);
    expect(Object.isFrozen(EVENTS.dom)).toBe(true);
    expectTypeOf(EVENTS).toEqualTypeOf<{
      readonly component: {
        readonly mounted: 'js-toolkit:component:mounted';
        readonly unmounted: 'js-toolkit:component:unmounted';
      };
      readonly dom: { readonly update: 'js-toolkit:dom:update' };
      readonly diagnostic: 'js-toolkit:diagnostic';
    }>();
  });
});
