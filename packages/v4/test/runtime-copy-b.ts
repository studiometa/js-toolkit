import * as copy from '../src/index.js';

const key = Symbol.for('@studiometa/js-toolkit-v4/test/copy-b');
(globalThis as unknown as Record<PropertyKey, unknown>)[key] = copy;
globalThis.dispatchEvent(new Event('@studiometa/js-toolkit-v4/test/copy-ready'));
