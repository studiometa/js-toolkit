let callbacks: Array<MutationCallback> = [];
let observer: MutationObserver;

function mainCallback(mutations: MutationRecord[]) {
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

  function observe(element: Node, options: MutationObserverInit) {
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
