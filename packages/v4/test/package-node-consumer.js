import assert from 'node:assert/strict';
import * as toolkit from '@studiometa/js-toolkit-v4';
import BaseDefault, { Base } from '@studiometa/js-toolkit-v4/Base';
import EVENTSDefault, { EVENTS } from '@studiometa/js-toolkit-v4/EVENTS';
import domUpdateDefault, { domUpdate } from '@studiometa/js-toolkit-v4/domUpdate';
import emitExtendableDefault, { emitExtendable } from '@studiometa/js-toolkit-v4/emitExtendable';
import subscribeContextDefault, {
  subscribeContext,
} from '@studiometa/js-toolkit-v4/subscribeContext';
import useRafDefault, { useRaf } from '@studiometa/js-toolkit-v4/useRaf';
import clampDefault, { clamp } from '@studiometa/js-toolkit-v4/utils/clamp';

assert.equal(Base, toolkit.Base);
assert.equal(BaseDefault, Base);
assert.equal(EVENTS, toolkit.EVENTS);
assert.equal(EVENTSDefault, EVENTS);
assert.equal(EVENTS.component.mounted, 'js-toolkit:component:mounted');
assert.equal(domUpdate, toolkit.domUpdate);
assert.equal(domUpdateDefault, domUpdate);
assert.equal(emitExtendable, toolkit.emitExtendable);
assert.equal(emitExtendableDefault, emitExtendable);
assert.equal(subscribeContext, toolkit.subscribeContext);
assert.equal(subscribeContextDefault, subscribeContext);
assert.equal(useRaf, toolkit.useRaf);
assert.equal(useRafDefault, useRaf);
assert.equal(clampDefault, clamp);
assert.equal(clamp(12, 0, 10), 10);

console.log('Node packed consumer: root and public subpaths passed.');
