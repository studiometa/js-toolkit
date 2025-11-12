import { beforeEach } from 'vitest';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

beforeEach(() => {
  globalThis.__JS_TOOLKIT_ELEMENTS__ = new Set();
  globalThis.__JS_TOOLKIT_INSTANCES__ = new Set();
  globalThis.__JS_TOOLKIT_REGISTRY__ = new Map();
});

GlobalRegistrator.register();

window.__DEV__ = true;

let y = 0;
let x = 0;

Object.defineProperties(window, {
  scrollY: {
    get: () => {
      return y;
    },
    set: (value) => {
      y = Number(value);
    },
  },
  scrollX: {
    get: () => {
      return x;
    },
    set: (value) => {
      x = Number(value);
    },
  },
  requestAnimationFrame: {
    value(callback) {
      return setTimeout(() => {
        callback(performance.now());
      }, 16);
    },
  },
});

Object.defineProperties(globalThis, {
  requestAnimationFrame: {
    value(callback) {
      return setTimeout(() => {
        callback(performance.now());
      }, 16);
    },
  },
});
