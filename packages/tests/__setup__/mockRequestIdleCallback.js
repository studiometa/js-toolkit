const callbacks = [];

globalThis.requestIdleCallback = function (callback) {
  callbacks.push(callback);
};

export function mockRequestIdleCallback() {
  callbacks.forEach((callback) => callback());
}
