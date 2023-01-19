let callbacks:Array<MutationCallback> = [];
let observer;

function mainCallback(mutations, obs) {
  callbacks.forEach((callback) => {
    callback(mutations, observer);
  });
}

export default function useObserver(callback: MutationCallback) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!observer) {
    observer = new MutationObserver(mainCallback);
  }

  callbacks.push(callback);

  function cleanup() {
    callbacks = callbacks.filter((cb) => cb !== callback);
  }

  function observe(element, options) {
    observer.observe(element, options);
  }

  function disconnect() {
    observer.disconnect();
  }

  return {
    observe,
    cleanup,
    disconnect,
  };
}
