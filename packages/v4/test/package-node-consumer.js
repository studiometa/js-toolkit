import assert from 'node:assert/strict';
import * as toolkit from '@studiometa/js-toolkit-v4';
import BaseDefault, { Base } from '@studiometa/js-toolkit-v4/Base';
import DIAGNOSTICSDefault, { DIAGNOSTICS } from '@studiometa/js-toolkit-v4/DIAGNOSTICS';
import EVENTSDefault, { EVENTS } from '@studiometa/js-toolkit-v4/EVENTS';
import domUpdateDefault, { domUpdate } from '@studiometa/js-toolkit-v4/domUpdate';
import emitExtendableDefault, { emitExtendable } from '@studiometa/js-toolkit-v4/emitExtendable';
import subscribeContextDefault, {
  subscribeContext,
} from '@studiometa/js-toolkit-v4/subscribeContext';
import useRafDefault, { useRaf } from '@studiometa/js-toolkit-v4/useRaf';
import watchAttributesDefault, { watchAttributes } from '@studiometa/js-toolkit-v4/watchAttributes';
import createStorageDefault, { createStorage } from '@studiometa/js-toolkit-v4/createStorage';
import createMemoryStorageProviderDefault, {
  createMemoryStorageProvider,
} from '@studiometa/js-toolkit-v4/createMemoryStorageProvider';
import clampDefault, { clamp } from '@studiometa/js-toolkit-v4/utils/clamp';

assert.equal(Base, toolkit.Base);
assert.equal(BaseDefault, Base);
assert.equal(DIAGNOSTICS, toolkit.DIAGNOSTICS);
assert.equal(DIAGNOSTICSDefault, DIAGNOSTICS);
assert.equal(DIAGNOSTICS.component.loadFailed, 'component.load-failed');
assert.equal(EVENTS, toolkit.EVENTS);
assert.equal(EVENTSDefault, EVENTS);
assert.equal(EVENTS.component.mounted, 'js-toolkit:component:mounted');
assert.equal(EVENTS.diagnostic, 'js-toolkit:diagnostic');
assert.equal(EVENTS.error, undefined);
assert.equal(domUpdate, toolkit.domUpdate);
assert.equal(domUpdateDefault, domUpdate);
assert.equal(emitExtendable, toolkit.emitExtendable);
assert.equal(emitExtendableDefault, emitExtendable);
assert.equal(subscribeContext, toolkit.subscribeContext);
assert.equal(subscribeContextDefault, subscribeContext);
assert.equal(useRaf, toolkit.useRaf);
assert.equal(useRafDefault, useRaf);
assert.equal(watchAttributes, toolkit.watchAttributes);
assert.equal(watchAttributesDefault, watchAttributes);
assert.equal('$watchAttributes' in Base.prototype, false);
assert.equal(createStorage, toolkit.createStorage);
assert.equal(createStorageDefault, createStorage);
assert.equal(createMemoryStorageProvider, toolkit.createMemoryStorageProvider);
assert.equal(createMemoryStorageProviderDefault, createMemoryStorageProvider);
assert.equal(Object.keys(toolkit).length, 79);
assert.equal(toolkit.ToolkitErrorDetail, undefined);
assert.equal(toolkit.ToolkitErrorStage, undefined);

// Storage runs outside a browser: no provider of the default reaches for `window`.
const storage = createStorage({ provider: createMemoryStorageProvider() });
storage.set('theme', 'dark');
assert.equal(storage.get('theme'), 'dark');
assert.deepEqual(storage.keys(), ['theme']);
const seen = [];
const unsubscribe = storage.subscribe('theme', (value) => seen.push(value));
storage.set('theme', 'light');
unsubscribe();
storage.set('theme', 'dark');
assert.deepEqual(seen, ['light']);
assert.equal(clampDefault, clamp);
assert.equal(clamp(12, 0, 10), 10);

console.log('Node packed consumer: root and public subpaths passed.');
