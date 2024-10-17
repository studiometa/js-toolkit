let store = new Map<string, any>();

export function mockElementLoad(ctor: string, prop = 'src') {
  store.set(ctor, global[ctor]);

  global[ctor] = class extends store.get(ctor) {
    set [prop](value) {
      this.setAttribute(prop, value);
      this.dispatchEvent(new Event('load'));
    }

    get [prop]() {
      return this.getAttribute(prop);
    }
  }

  return global[ctor];
}

export function unmockElementLoad(ctor) {
  global[ctor] = store.get(ctor);
  store.delete(ctor);
}
