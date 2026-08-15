const token = new URL(location.href).searchParams.get('token');
const source = 'v4-shared-runtime-fixture';

function post(payload) {
  parent.postMessage({ source, token, ...payload }, location.origin);
}

const NativeMutationObserver = globalThis.MutationObserver;
const NativeResizeObserver = globalThis.ResizeObserver;
const NativeIntersectionObserver = globalThis.IntersectionObserver;

const observers = {
  mutation: { created: 0, active: 0 },
  resize: { created: 0, active: 0 },
  intersection: { created: 0, active: 0 },
};

function countedObserver(Native, counts) {
  return class extends Native {
    isActive = false;

    constructor(callback) {
      super(callback);
      counts.created += 1;
    }

    observe(...args) {
      if (!this.isActive) {
        this.isActive = true;
        counts.active += 1;
      }
      return super.observe(...args);
    }

    disconnect() {
      if (this.isActive) {
        this.isActive = false;
        counts.active -= 1;
      }
      return super.disconnect();
    }
  };
}

globalThis.MutationObserver = countedObserver(NativeMutationObserver, observers.mutation);
globalThis.ResizeObserver = countedObserver(NativeResizeObserver, observers.resize);
globalThis.IntersectionObserver = countedObserver(
  NativeIntersectionObserver,
  observers.intersection,
);

const COPY_A_KEY = Symbol.for('@studiometa/js-toolkit-v4/test/copy-a');
const COPY_B_KEY = Symbol.for('@studiometa/js-toolkit-v4/test/copy-b');

async function run(copyA, copyB) {
  try {
    let parentMounts = 0;
    let parentDestroys = 0;
    let childMounts = 0;
    let childDestroys = 0;
    let lazyMounts = 0;
    let lazyDestroys = 0;

    class SharedChild extends copyB.Base {
      static config = { name: 'RuntimeFixtureChild' };

      mounted() {
        childMounts += 1;
      }

      destroyed() {
        childDestroys += 1;
      }
    }

    class SharedParent extends copyA.Base {
      static config = {
        name: 'RuntimeFixtureParent',
        components: { RuntimeFixtureChild: SharedChild },
      };

      mounted() {
        parentMounts += 1;
      }

      destroyed() {
        parentDestroys += 1;
      }
    }

    class SharedLazy extends copyB.Base {
      static config = { name: 'RuntimeFixtureLazy' };

      mounted() {
        lazyMounts += 1;
      }

      destroyed() {
        lazyDestroys += 1;
      }
    }

    // With independent registries these calls install two processors and two
    // observers, then both construct the same declaration.
    copyA.registerComponent(SharedParent);
    copyB.registerComponent(SharedParent);
    copyA.registerManifest({
      RuntimeFixtureLazy: () => Promise.resolve({ default: SharedLazy }),
    });

    const root = document.createElement('section');
    root.setAttribute('data-component', 'RuntimeFixtureParent');
    root.innerHTML = '<div data-component="RuntimeFixtureChild"></div>';
    const lazy = document.createElement('div');
    lazy.setAttribute('data-component', 'RuntimeFixtureLazy');
    document.body.append(root, lazy);

    await Promise.all([copyA.whenDOMSettled(), copyB.whenDOMSettled()]);

    const registryObservers = observers.mutation.created;
    const registryResult = {
      parentMounts,
      childMounts,
      lazyMounts,
      parentFromA: root.__base__?.get('RuntimeFixtureParent') instanceof SharedParent,
      childFromB:
        root.firstElementChild?.__base__?.get('RuntimeFixtureChild') instanceof SharedChild,
      lazyFromB: lazy.__base__?.get('RuntimeFixtureLazy') instanceof SharedLazy,
    };

    let frameRequests = 0;
    const nativeRequestAnimationFrame = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = (callback) => {
      frameRequests += 1;
      return nativeRequestAnimationFrame(callback);
    };
    try {
      await Promise.all([
        copyA.defaultScheduler.read(() => undefined).promise,
        copyB.defaultScheduler.read(() => undefined).promise,
      ]);
    } finally {
      globalThis.requestAnimationFrame = nativeRequestAnimationFrame;
    }

    const serviceTarget = document.createElement('div');
    const otherTarget = document.createElement('div');
    document.body.append(serviceTarget, otherTarget);

    const serviceIdentity = {
      raf: copyA.useRaf() === copyB.useRaf(),
      scroll: copyA.useScroll(serviceTarget) === copyB.useScroll(serviceTarget),
      resize: copyA.useResize(serviceTarget) === copyB.useResize(serviceTarget),
      pointer: copyA.usePointer() === copyB.usePointer(),
      drag:
        copyA.useDrag(serviceTarget, { dampFactor: 0.8 }) ===
        copyB.useDrag(serviceTarget, { dampFactor: 0.8 }),
      media: copyA.useMediaQuery('(min-width: 1px)') === copyB.useMediaQuery(' (min-width: 1px) '),
      inView:
        copyA.useInView(serviceTarget, { threshold: 0.5 }) ===
        copyB.useInView(serviceTarget, { threshold: 0.5 }),
      scrollProgress:
        copyA.useScrollProgress(serviceTarget, { offset: 'start end / end start' }) ===
        copyB.useScrollProgress(serviceTarget, { offset: 'start end / end start' }),
    };

    const optionDistinction = {
      target: copyA.useScroll(serviceTarget) !== copyB.useScroll(otherTarget),
      drag:
        copyA.useDrag(serviceTarget, { dampFactor: 0.8 }) !==
        copyB.useDrag(serviceTarget, { dampFactor: 0.9 }),
      media: copyA.useMediaQuery('(min-width: 1px)') !== copyB.useMediaQuery('(min-width: 2px)'),
      inView:
        copyA.useInView(serviceTarget, { threshold: 0.5 }) !==
        copyB.useInView(serviceTarget, { threshold: 0.75 }),
      scrollProgress:
        copyA.useScrollProgress(serviceTarget, { offset: 'start end / end start' }) !==
        copyB.useScrollProgress(serviceTarget, { offset: 'start center / end center' }),
    };

    const resizeService = copyA.useResize(serviceTarget);
    const resizeCreatedBefore = observers.resize.created;
    const stopResizeA = resizeService.subscribe(() => {});
    const stopResizeB = copyB.useResize(serviceTarget).subscribe(() => {});
    const resizeCreated = observers.resize.created - resizeCreatedBefore;
    const resizeActiveWithBoth = observers.resize.active;
    stopResizeA();
    const resizeActiveAfterOne = observers.resize.active;
    stopResizeB();
    const resizeActiveAfterBoth = observers.resize.active;

    const inViewService = copyA.useInView(serviceTarget, { threshold: 0.5 });
    const intersectionCreatedBefore = observers.intersection.created;
    const stopInViewA = inViewService.subscribe(() => {});
    const stopInViewB = copyB.useInView(serviceTarget, { threshold: 0.5 }).subscribe(() => {});
    const intersectionCreated = observers.intersection.created - intersectionCreatedBefore;
    const intersectionActiveWithBoth = observers.intersection.active;
    stopInViewA();
    const intersectionActiveAfterOne = observers.intersection.active;
    stopInViewB();
    const intersectionActiveAfterBoth = observers.intersection.active;

    let rootCreates = 0;
    const rootKey = Symbol.for('@studiometa/js-toolkit-v4/test/root-context');
    const rootValueA = copyA.provideRootContext(rootKey, () => ({ copy: ++rootCreates }));
    const rootValueB = copyB.provideRootContext(rootKey, () => ({ copy: ++rootCreates }));

    const contextScope = document.createElement('div');
    const contextConsumer = document.createElement('span');
    contextScope.append(contextConsumer);
    document.body.append(contextScope);
    const pendingKey = Symbol.for('@studiometa/js-toolkit-v4/test/pending-context');
    const pending = copyB.injectContext(contextConsumer, pendingKey);
    const pendingValue = { source: 'copy-a' };
    const provided = copyA.provideContext(contextScope, pendingKey, pendingValue);
    const resolvedPending = await Promise.race([
      pending.promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('context replay timed out')), 500),
      ),
    ]);
    pending.cancel();
    provided.dispose();

    let mountListeners = 0;
    const nativeDocumentAddEventListener = document.addEventListener;
    document.addEventListener = function (type, ...args) {
      if (type === 'component:mounted') {
        mountListeners += 1;
      }
      return nativeDocumentAddEventListener.call(this, type, ...args);
    };
    const subscribedKey = Symbol.for('@studiometa/js-toolkit-v4/test/subscribed-context');
    const subscribedProvider = copyA.provideContext(contextScope, subscribedKey, { ok: true });
    const subscribedA = copyA.injectContext(contextConsumer, subscribedKey, {
      subscribe: true,
      onProvide() {},
    });
    const subscribedB = copyB.injectContext(contextConsumer, subscribedKey, {
      subscribe: true,
      onProvide() {},
    });
    subscribedA.cancel();
    subscribedB.cancel();
    subscribedProvider.dispose();
    document.addEventListener = nativeDocumentAddEventListener;

    root.remove();
    lazy.remove();
    serviceTarget.remove();
    otherTarget.remove();
    contextScope.remove();
    await Promise.all([copyA.whenDOMSettled(), copyB.whenDOMSettled()]);

    post({
      ok: true,
      result: {
        scheduler: {
          same: copyA.defaultScheduler === copyB.defaultScheduler,
          frameRequests,
        },
        registry: {
          observers: registryObservers,
          ...registryResult,
          parentDestroys,
          childDestroys,
          lazyDestroys,
        },
        services: {
          identity: serviceIdentity,
          distinction: optionDistinction,
          resize: {
            created: resizeCreated,
            activeWithBoth: resizeActiveWithBoth,
            activeAfterOne: resizeActiveAfterOne,
            activeAfterBoth: resizeActiveAfterBoth,
          },
          intersection: {
            created: intersectionCreated,
            activeWithBoth: intersectionActiveWithBoth,
            activeAfterOne: intersectionActiveAfterOne,
            activeAfterBoth: intersectionActiveAfterBoth,
          },
        },
        context: {
          sameRoot: rootValueA === rootValueB,
          rootCreates,
          pendingReplay: resolvedPending === pendingValue,
          mountListeners,
        },
      },
    });
  } catch (error) {
    post({
      ok: false,
      error:
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { message: String(error) },
    });
  } finally {
    globalThis.MutationObserver = NativeMutationObserver;
    globalThis.ResizeObserver = NativeResizeObserver;
    globalThis.IntersectionObserver = NativeIntersectionObserver;
  }
}

function startWhenReady() {
  const copyA = globalThis[COPY_A_KEY];
  const copyB = globalThis[COPY_B_KEY];
  if (!copyA || !copyB) {
    return;
  }
  globalThis.removeEventListener('@studiometa/js-toolkit-v4/test/copy-ready', startWhenReady);
  void run(copyA, copyB);
}

globalThis.addEventListener('@studiometa/js-toolkit-v4/test/copy-ready', startWhenReady);
startWhenReady();
