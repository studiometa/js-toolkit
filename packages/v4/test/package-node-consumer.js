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
import * as utils from '@studiometa/js-toolkit-v4/utils';
import kebabCaseDefault, { kebabCase } from '@studiometa/js-toolkit-v4/utils/kebabCase';
import transformDefault, { transform } from '@studiometa/js-toolkit-v4/utils/transform';
import easeOutQuadDefault, { easeOutQuad } from '@studiometa/js-toolkit-v4/utils/easeOutQuad';
import randomIntDefault, { randomInt } from '@studiometa/js-toolkit-v4/utils/randomInt';
import deepmergeDefault, { deepmerge } from '@studiometa/js-toolkit-v4/utils/deepmerge';

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

// The ported utilities, through their own subpath and through the barrel.
assert.equal(kebabCaseDefault, kebabCase);
assert.equal(kebabCase, utils.kebabCase);
assert.equal(kebabCase('SliderDragStart'), 'slider-drag-start');
assert.equal(utils.capitalize('btn'), 'Btn');
assert.equal(utils.pascalCase('my-ref'), 'MyRef');
assert.equal(utils.withoutTrailingSlash('/foo/'), '/foo');
assert.equal(transformDefault, transform);
assert.equal(transform({ x: 10 }), 'translate3d(10px, 0px, 0px)');
assert.equal(utils.matrix(), 'matrix(1, 0, 0, 1, 0, 0)');
assert.equal(easeOutQuadDefault, easeOutQuad);
assert.equal(easeOutQuad(1), 1);
assert.equal(randomIntDefault, randomInt);
assert.equal(randomInt(0, 0), 0);
assert.equal(deepmergeDefault, deepmerge);
assert.deepEqual(deepmerge({ a: { b: 1 } }, { a: { c: 2 } }), { a: { b: 1, c: 2 } });
assert.equal(utils.deepmerge({ a: 1 }, { a: 2 }, { a: 3 }).a, 3);
assert.equal(utils.isObject({}), true);
assert.equal(utils.round(1.2345, 2), 1.23);
assert.deepEqual(utils.createRange(0, 2, 1), [0, 1, 2]);
assert.equal(typeof utils.debounce(() => {}), 'function');
await utils.wait(1);

console.log('Node packed consumer: root and public subpaths passed.');
