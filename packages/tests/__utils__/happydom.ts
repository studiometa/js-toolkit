import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();

window.__DEV__ = true;

let x = 0;
let y = 0;

Object.defineProperties(window, {
  pageXOffset: {
    get: () => {
      return x;
    },
    set: (value) => {
      x = Number(value);
    },
  },
  pageYOffset: {
    get: () => {
      return y;
    },
    set: (value) => {
      y = Number(value);
    },
  },
});
