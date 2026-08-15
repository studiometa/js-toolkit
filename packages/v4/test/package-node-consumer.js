import assert from 'node:assert/strict';
import * as toolkit from '@studiometa/js-toolkit-v4';
import BaseDefault, { Base } from '@studiometa/js-toolkit-v4/Base';
import EVENTSDefault, { EVENTS } from '@studiometa/js-toolkit-v4/EVENTS';
import useRafDefault, { useRaf } from '@studiometa/js-toolkit-v4/useRaf';
import clampDefault, { clamp } from '@studiometa/js-toolkit-v4/utils/clamp';

assert.equal(Base, toolkit.Base);
assert.equal(BaseDefault, Base);
assert.equal(EVENTS, toolkit.EVENTS);
assert.equal(EVENTSDefault, EVENTS);
assert.deepEqual(EVENTS, {
  component: {
    mounted: 'js-toolkit:component:mounted',
    destroyed: 'js-toolkit:component:destroyed',
  },
  error: 'js-toolkit:error',
});
assert(Object.isFrozen(EVENTS));
assert(Object.isFrozen(EVENTS.component));
assert(!('viewTransition' in toolkit));
assert.equal(useRaf, toolkit.useRaf);
assert.equal(useRafDefault, useRaf);
assert.equal(clampDefault, clamp);
assert.equal(clamp(12, 0, 10), 10);

console.log('Node packed consumer: root and public subpaths passed.');
