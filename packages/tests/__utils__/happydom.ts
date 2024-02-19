import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();

window.__DEV__ = true;

let y = 0;

Object.defineProperties(window, {
  pageYOffset: {
    get: () => {
      return y;
    },
    set: (value) => {
      y = Number(value);
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
