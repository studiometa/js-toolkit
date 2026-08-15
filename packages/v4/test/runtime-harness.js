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
const intersectionObservers = [];

function countedObserver(Native, counts, instances) {
  return class extends Native {
    isActive = false;
    observed = new Set();

    constructor(...args) {
      super(...args);
      this.callback = args[0];
      this.options = args[1];
      counts.created += 1;
      instances?.push(this);
    }

    observe(...args) {
      this.observed.add(args[0]);
      if (!this.isActive) {
        this.isActive = true;
        counts.active += 1;
      }
      return super.observe(...args);
    }

    unobserve(...args) {
      this.observed.delete(args[0]);
      const result = super.unobserve(...args);
      if (this.isActive && this.observed.size === 0) {
        this.isActive = false;
        counts.active -= 1;
      }
      return result;
    }

    disconnect() {
      this.observed.clear();
      if (this.isActive) {
        this.isActive = false;
        counts.active -= 1;
      }
      return super.disconnect();
    }

    deliver(target, isIntersecting) {
      this.callback([{ target, isIntersecting }], this);
    }
  };
}

globalThis.MutationObserver = countedObserver(NativeMutationObserver, observers.mutation);
globalThis.ResizeObserver = countedObserver(NativeResizeObserver, observers.resize);
globalThis.IntersectionObserver = countedObserver(
  NativeIntersectionObserver,
  observers.intersection,
  intersectionObservers,
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
    let viewportMounts = 0;
    let viewportDestroys = 0;
    let viewportLazyImports = 0;
    let viewportLazyMounts = 0;
    let responsiveMounts = 0;
    let responsiveDestroys = 0;

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

    class SharedViewport extends copyB.Base {
      static config = {
        name: 'RuntimeFixtureViewport',
        mountStrategy: 'in-view:123px 45px',
      };

      mounted() {
        viewportMounts += 1;
      }

      destroyed() {
        viewportDestroys += 1;
      }
    }

    class SharedViewportLazy extends copyA.Base {
      static config = {
        name: 'RuntimeFixtureViewportLazy',
        mountStrategy: 'visible:321px 0px',
      };

      mounted() {
        viewportLazyMounts += 1;
      }
    }

    class SharedResponsive extends copyB.Base {
      static config = { name: 'RuntimeFixtureResponsive' };

      mounted() {
        responsiveMounts += 1;
      }

      destroyed() {
        responsiveDestroys += 1;
      }
    }

    class SubA extends copyA.Base {
      static config = { name: 'RuntimeFixtureSubA' };
    }
    class DeepSubA extends SubA {
      static config = { name: 'RuntimeFixtureDeepSubA' };
    }
    class SubB extends copyB.Base {
      static config = { name: 'RuntimeFixtureSubB' };
    }
    class DeepSubB extends SubB {
      static config = { name: 'RuntimeFixtureDeepSubB' };
    }
    class WrongWithConfig {
      static config = { name: 'RuntimeFixtureWrong' };
    }
    const importThunkA = () => Promise.resolve({ default: SubA });
    const importThunkB = () => Promise.resolve({ default: SubB });
    const branding = {
      direct: {
        aFromA: copyA.isBaseConstructor(copyA.Base),
        bFromA: copyA.isBaseConstructor(copyB.Base),
        aFromB: copyB.isBaseConstructor(copyA.Base),
        bFromB: copyB.isBaseConstructor(copyB.Base),
      },
      subclasses: {
        aFromA: copyA.isBaseConstructor(DeepSubA),
        bFromA: copyA.isBaseConstructor(DeepSubB),
        aFromB: copyB.isBaseConstructor(DeepSubA),
        bFromB: copyB.isBaseConstructor(DeepSubB),
      },
      wrongClasses: {
        fromA: copyA.isBaseConstructor(WrongWithConfig),
        fromB: copyB.isBaseConstructor(WrongWithConfig),
      },
      importThunks: {
        aFromA: copyA.isBaseConstructor(importThunkA),
        bFromA: copyA.isBaseConstructor(importThunkB),
        aFromB: copyB.isBaseConstructor(importThunkA),
        bFromB: copyB.isBaseConstructor(importThunkB),
      },
    };

    // With independent registries these calls install two processors and two
    // observers, then both construct the same declaration.
    copyA.registerComponent(SharedParent);
    copyB.registerComponent(SharedParent);
    copyA.registerManifest({
      RuntimeFixtureLazy: () => Promise.resolve({ default: SharedLazy }),
    });
    copyA.registerComponent(SharedViewport);
    copyB.registerComponent(SharedViewport);
    copyB.registerManifest({
      RuntimeFixtureViewportLazy: {
        load: () => {
          viewportLazyImports += 1;
          return Promise.resolve({ default: SharedViewportLazy });
        },
        mountStrategy: 'visible:321px 0px',
      },
    });

    const root = document.createElement('section');
    root.setAttribute('data-component', 'RuntimeFixtureParent');
    root.innerHTML = '<div data-component="RuntimeFixtureChild"></div>';
    const lazy = document.createElement('div');
    lazy.setAttribute('data-component', 'RuntimeFixtureLazy');
    const viewport = document.createElement('div');
    viewport.setAttribute('data-component', 'RuntimeFixtureViewport');
    viewport.style.cssText = 'position:absolute;top:300vh;width:10px;height:10px';
    const viewportLazy = document.createElement('div');
    viewportLazy.setAttribute('data-component', 'RuntimeFixtureViewportLazy');
    viewportLazy.style.cssText = 'position:absolute;top:300vh;width:10px;height:10px';
    document.body.append(root, lazy, viewport, viewportLazy);

    await Promise.all([copyA.whenDOMSettled(), copyB.whenDOMSettled()]);

    const directViewportObservers = intersectionObservers.filter((observer) =>
      observer.observed.has(viewport),
    );
    const lazyViewportObservers = intersectionObservers.filter((observer) =>
      observer.observed.has(viewportLazy),
    );
    for (const observer of directViewportObservers) {
      observer.deliver(viewport, true);
      observer.deliver(viewport, true);
      observer.deliver(viewport, false);
      observer.deliver(viewport, false);
    }
    for (const observer of lazyViewportObservers) {
      observer.deliver(viewportLazy, true);
      observer.deliver(viewportLazy, true);
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
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
      viewport: {
        direct: {
          observers: directViewportObservers.length,
          rootMargin: directViewportObservers[0]?.options?.rootMargin ?? null,
          mounts: viewportMounts,
          destroys: viewportDestroys,
          fromB: viewport.__base__?.get('RuntimeFixtureViewport') instanceof SharedViewport,
        },
        lazy: {
          observers: lazyViewportObservers.length,
          rootMargin: lazyViewportObservers[0]?.options?.rootMargin ?? null,
          imports: viewportLazyImports,
          mounts: viewportLazyMounts,
          fromA:
            viewportLazy.__base__?.get('RuntimeFixtureViewportLazy') instanceof SharedViewportLazy,
        },
      },
    };

    const sameEventValues =
      copyA.EVENTS.component.mounted === copyB.EVENTS.component.mounted &&
      copyA.EVENTS.component.destroyed === copyB.EVENTS.component.destroyed &&
      copyA.EVENTS.dom.update === copyB.EVENTS.dom.update &&
      copyA.EVENTS.diagnostic === copyB.EVENTS.diagnostic;

    const decoratorInitializers = [];
    let decoratorCalls = 0;
    class CrossCopyDecorated extends copyB.Base {
      static config = { name: 'RuntimeFixtureDecorated' };

      constructor(el) {
        super(el);
        for (const initialize of decoratorInitializers) {
          initialize.call(this);
        }
      }

      handleDecoratedEvent() {
        decoratorCalls += 1;
      }
    }
    copyA.on('runtime:decorated')(CrossCopyDecorated.prototype.handleDecoratedEvent, {
      kind: 'method',
      name: 'handleDecoratedEvent',
      static: false,
      private: false,
      addInitializer(initialize) {
        decoratorInitializers.push(initialize);
      },
    });
    const decoratedEl = document.createElement('div');
    const decorated = new CrossCopyDecorated(decoratedEl).$mount();
    decoratedEl.dispatchEvent(new Event('runtime:decorated'));

    const errorEventsA = [];
    const errorEventsB = [];
    const onErrorA = (event) => {
      event.preventDefault();
      errorEventsA.push(event);
    };
    const onErrorB = (event) => errorEventsB.push(event);
    document.addEventListener(copyA.EVENTS.diagnostic, onErrorA);
    document.addEventListener(copyB.EVENTS.diagnostic, onErrorB);

    const lifecycleFailureA = new Error('copy A lifecycle failure');
    const lifecycleFailureB = new Error('copy B lifecycle failure');
    const mountFailureB = new Error('copy B construction failure');
    const loadFailure = new Error('shared registry load failure');
    const expectedFailures = [lifecycleFailureA, lifecycleFailureB, mountFailureB, loadFailure];
    const expectedCodes = [
      copyA.DIAGNOSTICS.component.lifecycleFailed,
      copyA.DIAGNOSTICS.component.lifecycleFailed,
      copyA.DIAGNOSTICS.component.mountFailed,
      copyA.DIAGNOSTICS.component.loadFailed,
    ];
    const errorTargets = Array.from({ length: 4 }, () => document.createElement('div'));

    try {
      class LifecycleFailureA extends copyA.Base {
        static config = { name: 'RuntimeFixtureFailureA' };

        mounted() {
          throw lifecycleFailureA;
        }
      }

      class LifecycleFailureB extends copyB.Base {
        static config = { name: 'RuntimeFixtureFailureB' };

        mounted() {
          throw lifecycleFailureB;
        }
      }

      document.body.append(errorTargets[0], errorTargets[1]);
      new LifecycleFailureA(errorTargets[0]).$mount();
      new LifecycleFailureB(errorTargets[1]).$mount();

      class MountFailureB extends copyB.Base {
        static config = { name: 'RuntimeFixtureMountFailureB' };

        constructor(el) {
          super(el);
          throw mountFailureB;
        }
      }

      copyA.registerComponent(MountFailureB);
      errorTargets[2].setAttribute('data-component', 'RuntimeFixtureMountFailureB');
      document.body.append(errorTargets[2]);
      await Promise.all([copyA.whenDOMSettled(), copyB.whenDOMSettled()]);

      errorTargets[3].setAttribute('data-component', 'RuntimeFixtureLoadFailure');
      document.body.append(errorTargets[3]);
      copyB.registerManifest({
        RuntimeFixtureLoadFailure: () => Promise.reject(loadFailure),
      });
      await Promise.all([copyA.whenDOMSettled(), copyB.whenDOMSettled()]);
    } finally {
      document.removeEventListener(copyA.EVENTS.diagnostic, onErrorA);
      document.removeEventListener(copyB.EVENTS.diagnostic, onErrorB);
    }

    const errors = {
      sameEventName: copyA.EVENTS.diagnostic === copyB.EVENTS.diagnostic,
      heardByA: errorEventsA.length,
      heardByB: errorEventsB.length,
      sameEvents: errorEventsA.every((event, index) => event === errorEventsB[index]),
      contract: errorEventsA.every(
        (event) =>
          event.type === copyA.EVENTS.diagnostic &&
          event.bubbles &&
          event.composed &&
          event.cancelable &&
          event.defaultPrevented,
      ),
      identities: errorEventsA.every(
        (event, index) => event.detail.error === expectedFailures[index],
      ),
      codes: errorEventsA.every((event, index) => event.detail.code === expectedCodes[index]),
      targets: errorEventsA.every((event, index) => event.target === errorTargets[index]),
      details: errorEventsA.map((event) => ({
        severity: event.detail.severity,
        code: event.detail.code,
        component: event.detail.component,
      })),
    };

    const warningEventsA = [];
    const warningEventsB = [];
    const onWarningA = (event) => {
      if (event.detail.severity !== 'warning') return;
      event.preventDefault();
      warningEventsA.push(event);
    };
    const onWarningB = (event) => {
      if (event.detail.severity === 'warning') warningEventsB.push(event);
    };
    document.addEventListener(copyA.EVENTS.diagnostic, onWarningA);
    document.addEventListener(copyB.EVENTS.diagnostic, onWarningB);
    try {
      const modules = {
        './first/Duplicate.ts': async () => ({}),
        './second/Duplicate.ts': async () => ({}),
      };
      copyA.defineManifest({ modules });
      copyB.defineManifest({ modules });

      const definition = { type: Object, default: { shared: true } };
      class LiteralDefaultA extends copyA.Base {
        static config = { name: 'RuntimeFixtureLiteralA', options: { value: definition } };
      }
      class LiteralDefaultB extends copyB.Base {
        static config = { name: 'RuntimeFixtureLiteralB', options: { value: definition } };
      }
      new LiteralDefaultA(document.createElement('div'));
      new LiteralDefaultB(document.createElement('div'));

      const negotiatedTarget = document.createElement('div');
      document.body.append(negotiatedTarget);
      let lateWrap;
      negotiatedTarget.addEventListener(copyA.EVENTS.dom.update, (event) => {
        lateWrap = event.detail.wrap;
      });
      await copyA.domUpdate(negotiatedTarget, () => {});
      lateWrap?.(() => {});
      await copyB.domUpdate(negotiatedTarget, () => {});
      lateWrap?.(() => {});
      negotiatedTarget.remove();
    } finally {
      document.removeEventListener(copyA.EVENTS.diagnostic, onWarningA);
      document.removeEventListener(copyB.EVENTS.diagnostic, onWarningB);
    }
    const warnings = {
      heardByA: warningEventsA.length,
      heardByB: warningEventsB.length,
      sameEvents: warningEventsA.every((event, index) => event === warningEventsB[index]),
      codes: warningEventsA.map((event) => event.detail.code),
      oneStringProtocol:
        copyA.DIAGNOSTICS.manifest.duplicateToken === copyB.DIAGNOSTICS.manifest.duplicateToken &&
        copyA.DIAGNOSTICS.option.literalDefault === copyB.DIAGNOSTICS.option.literalDefault &&
        copyA.DIAGNOSTICS.protocol.lateRegistration === copyB.DIAGNOSTICS.protocol.lateRegistration,
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

    const sameBreakpointService = copyA.useBreakpoint() === copyB.useBreakpoint();
    copyA.setBreakpoints({ small: '0rem', large: '9999rem' });
    const breakpointsReadByB = copyB.getBreakpoints();
    const activeReadByB = copyB.useBreakpoint().props().name;

    // The class comes from B, registration comes from A, and the declaration
    // only becomes active when B replaces the shared breakpoint set.
    copyA.registerComponent(SharedResponsive);
    const responsive = document.createElement('div');
    responsive.setAttribute('data-component:large', 'RuntimeFixtureResponsive');
    document.body.append(responsive);
    await Promise.all([copyA.whenDOMSettled(), copyB.whenDOMSettled()]);
    const mountsBeforeReplacement = responsiveMounts;

    let responsiveReconciliations = 0;
    const nativeGetAttributeNames = responsive.getAttributeNames;
    responsive.getAttributeNames = function countedGetAttributeNames() {
      responsiveReconciliations += 1;
      return nativeGetAttributeNames.call(this);
    };
    copyB.setBreakpoints({ small: '0rem', large: '0rem' });
    await Promise.all([copyA.whenDOMSettled(), copyB.whenDOMSettled()]);
    responsive.getAttributeNames = nativeGetAttributeNames;
    const activeReadByA = copyA.useBreakpoint().props().name;

    const serviceTarget = document.createElement('div');
    const otherTarget = document.createElement('div');
    document.body.append(serviceTarget, otherTarget);

    const serviceIdentity = {
      breakpoint: sameBreakpointService,
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

    const sharedInViewRoot = document.createElement('section');
    const inViewRootA = document.createElement('section');
    const inViewRootB = document.createElement('section');
    sharedInViewRoot.append(inViewRootA);
    inViewRootA.append(inViewRootB);
    inViewRootB.append(serviceTarget);
    document.body.append(sharedInViewRoot);

    // The exact same root object and equivalent options still identify one
    // realm-wide service across independently bundled copies.
    const sharedRootServiceA = copyA.useInView(serviceTarget, {
      root: sharedInViewRoot,
      threshold: 0.5,
    });
    const sharedRootServiceB = copyB.useInView(serviceTarget, {
      root: sharedInViewRoot,
      threshold: 0.5,
    });
    const sharedRootCreatedBefore = observers.intersection.created;
    const sharedRootActiveBefore = observers.intersection.active;
    const sharedRootObserverOffset = intersectionObservers.length;
    const stopSharedRootA = sharedRootServiceA.subscribe(() => {});
    const stopSharedRootB = sharedRootServiceB.subscribe(() => {});
    const sharedRootObservers = intersectionObservers.slice(sharedRootObserverOffset);
    const sharedRootCreated = observers.intersection.created - sharedRootCreatedBefore;
    const sharedRootActiveWithBoth = observers.intersection.active - sharedRootActiveBefore;
    stopSharedRootA();
    const sharedRootActiveAfterOne = observers.intersection.active - sharedRootActiveBefore;
    stopSharedRootB();
    const sharedRootActiveAfterBoth = observers.intersection.active - sharedRootActiveBefore;

    // Each copy now asks for the same target with a distinct root. A copy-local
    // identity allocator would give both roots the same ID and silently return
    // A's service to B.
    const distinctRootServiceA = copyA.useInView(serviceTarget, {
      root: inViewRootA,
      threshold: 0.5,
    });
    const distinctRootServiceB = copyB.useInView(serviceTarget, {
      root: inViewRootB,
      threshold: 0.5,
    });
    let distinctRootCallsA = 0;
    let distinctRootCallsB = 0;
    const distinctRootCreatedBefore = observers.intersection.created;
    const distinctRootActiveBefore = observers.intersection.active;
    const distinctRootObserverOffset = intersectionObservers.length;
    const stopDistinctRootA = distinctRootServiceA.subscribe(() => {
      distinctRootCallsA += 1;
    });
    const stopDistinctRootB = distinctRootServiceB.subscribe(() => {
      distinctRootCallsB += 1;
    });
    const distinctRootObservers = intersectionObservers.slice(distinctRootObserverOffset);
    const observerForRootA = distinctRootObservers.find(
      (observer) => observer.options.root === inViewRootA,
    );
    const observerForRootB = distinctRootObservers.find(
      (observer) => observer.options.root === inViewRootB,
    );
    observerForRootA?.deliver(serviceTarget, true);
    const distinctRootCreated = observers.intersection.created - distinctRootCreatedBefore;
    const distinctRootActiveWithBoth = observers.intersection.active - distinctRootActiveBefore;
    stopDistinctRootA();
    const distinctRootActiveAfterOne = observers.intersection.active - distinctRootActiveBefore;
    stopDistinctRootB();
    const distinctRootActiveAfterBoth = observers.intersection.active - distinctRootActiveBefore;

    // Different axis options create distinct services, one from each bundled
    // copy. Their touch-action claims still belong to the realm: releasing one
    // copy must leave the other copy's claim in place, and only the final
    // release may restore the consumer's exact inline value.
    serviceTarget.style.touchAction = 'auto';
    const stopDragX = copyA.useDrag(serviceTarget, { axis: 'x' }).subscribe(() => {});
    const touchActionWithX = serviceTarget.style.touchAction;
    const stopDragY = copyB
      .useDrag(serviceTarget, { axis: 'y', inertia: false })
      .subscribe(() => {});
    const touchActionWithBoth = serviceTarget.style.touchAction;
    stopDragX();
    const touchActionAfterX = serviceTarget.style.touchAction;
    stopDragY();
    const touchActionAfterBoth = serviceTarget.style.touchAction;

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
      if (type === copyA.EVENTS.component.mounted) {
        mountListeners += 1;
      }
      return nativeDocumentAddEventListener.call(this, type, ...args);
    };
    const subscribedKey = Symbol.for('@studiometa/js-toolkit-v4/test/subscribed-context');
    const subscribedRoot = copyA.provideRootContext(subscribedKey, () => ({ source: 'root' }));
    const subscribedAnswersA = [];
    const subscribedAnswersB = [];
    const unsubscribeA = copyA.subscribeContext(contextConsumer, subscribedKey, (value) => {
      subscribedAnswersA.push(value);
    });
    const unsubscribeB = copyB.subscribeContext(contextConsumer, subscribedKey, (value) => {
      subscribedAnswersB.push(value);
    });
    const subscribedNear = { source: 'near' };
    const subscribedProvider = copyA.provideContext(contextScope, subscribedKey, subscribedNear);
    contextScope.dispatchEvent(new CustomEvent(copyB.EVENTS.component.mounted, { bubbles: true }));
    unsubscribeA();
    unsubscribeB();
    subscribedProvider.dispose();
    document.addEventListener = nativeDocumentAddEventListener;
    await copyA.whenDOMSettled();

    const watchedAttributes = document.createElement('div');
    const attributeChangesA = [];
    const attributeChangesB = [];
    const stopWatchingA = copyA.watchAttributes(watchedAttributes, (change) => {
      attributeChangesA.push(change);
    });
    const stopWatchingB = copyB.watchAttributes(watchedAttributes, (change) => {
      attributeChangesB.push(change);
    });
    const nativeBackground = copyA.defaultScheduler.background;
    let scheduledAttributeBatches = 0;
    copyA.defaultScheduler.background = function countedBackground(...args) {
      scheduledAttributeBatches += 1;
      return nativeBackground.apply(this, args);
    };
    try {
      watchedAttributes.setAttribute('data-runtime-watch', 'one');
      await copyB.whenDOMSettled();
      stopWatchingA();
      stopWatchingA();
      watchedAttributes.setAttribute('data-runtime-watch', 'two');
      await copyA.whenDOMSettled();
      stopWatchingB();
      stopWatchingB();
      watchedAttributes.setAttribute('data-runtime-watch', 'three');
      await copyA.whenDOMSettled();
    } finally {
      stopWatchingA();
      stopWatchingB();
      copyA.defaultScheduler.background = nativeBackground;
    }

    root.remove();
    lazy.remove();
    viewport.remove();
    viewportLazy.remove();
    responsive.remove();
    sharedInViewRoot.remove();
    otherTarget.remove();
    contextScope.remove();
    decorated.$terminate();
    await Promise.all([copyA.whenDOMSettled(), copyB.whenDOMSettled()]);
    copyA.setBreakpoints(copyA.BREAKPOINTS);
    await Promise.all([copyA.whenDOMSettled(), copyB.whenDOMSettled()]);

    post({
      ok: true,
      result: {
        protocol: {
          sameEventValues,
          decoratorCalls,
        },
        branding,
        scheduler: {
          same: copyA.defaultScheduler === copyB.defaultScheduler,
          frameRequests,
        },
        attributeWatching: {
          scheduledBatches: scheduledAttributeBatches,
          copyA: attributeChangesA,
          copyB: attributeChangesB,
        },
        errors,
        warnings,
        registry: {
          observers: registryObservers,
          ...registryResult,
          parentDestroys,
          childDestroys,
          lazyDestroys,
        },
        breakpoints: {
          sameService: sameBreakpointService,
          readByB: breakpointsReadByB,
          activeReadByB,
          activeReadByA,
          responsive: {
            mountsBeforeReplacement,
            mountsAfterReplacement: responsiveMounts,
            reconciliations: responsiveReconciliations,
            destroys: responsiveDestroys,
          },
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
            sameRoot: {
              sameService: sharedRootServiceA === sharedRootServiceB,
              correctRoot:
                sharedRootObservers.length === 1 &&
                sharedRootObservers[0].options.root === sharedInViewRoot,
              created: sharedRootCreated,
              activeWithBoth: sharedRootActiveWithBoth,
              activeAfterOne: sharedRootActiveAfterOne,
              activeAfterBoth: sharedRootActiveAfterBoth,
            },
            distinctRoots: {
              separateServices: distinctRootServiceA !== distinctRootServiceB,
              correctRoots:
                distinctRootObservers.length === 2 &&
                observerForRootA !== undefined &&
                observerForRootB !== undefined,
              isolatedState: distinctRootCallsA === 1 && distinctRootCallsB === 0,
              created: distinctRootCreated,
              activeWithBoth: distinctRootActiveWithBoth,
              activeAfterOne: distinctRootActiveAfterOne,
              activeAfterBoth: distinctRootActiveAfterBoth,
            },
          },
          dragTouchAction: {
            withX: touchActionWithX,
            withBoth: touchActionWithBoth,
            afterX: touchActionAfterX,
            afterBoth: touchActionAfterBoth,
          },
        },
        context: {
          sameRoot: rootValueA === rootValueB,
          rootCreates,
          pendingReplay: resolvedPending === pendingValue,
          mountListeners,
          subscribedReanswer:
            subscribedAnswersA.length === 2 &&
            subscribedAnswersA[0] === subscribedRoot &&
            subscribedAnswersA[1] === subscribedNear &&
            subscribedAnswersB.length === 2 &&
            subscribedAnswersB[0] === subscribedRoot &&
            subscribedAnswersB[1] === subscribedNear,
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
    // Keep failure paths isolated too. The parent removes the iframe after the
    // result, but restore shared configuration before that realm is released.
    copyA.setBreakpoints(copyA.BREAKPOINTS);
    for (const el of document.querySelectorAll('body > :not(script)')) {
      el.remove();
    }
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
