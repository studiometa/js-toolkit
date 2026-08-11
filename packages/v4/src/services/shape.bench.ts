/**
 * Closure-per-instance versus prototype-shared methods for the service
 * primitive.
 *
 * The question only became material when services went per-target: five
 * singletons make the shape irrelevant, one service per observed element
 * does not. Each variant below implements the same contract — lazy start on
 * the first subscriber, stop on the last, subscribe returns its undo.
 */
import { bench, describe } from 'vitest';

declare global {
  // eslint-disable-next-line no-var
  var __benchSink: unknown;
}

interface Definition<T> {
  props(): T;
  start(emit: (props: T) => void): () => void;
}

interface Subscribable<T> {
  props(): T;
  add(callback: (props: T) => unknown): () => void;
}

/** What the package ships today: methods captured per instance. */
function closureService<T>({ props, start }: Definition<T>): Subscribable<T> {
  const callbacks = new Set<(props: T) => unknown>();
  let stop: (() => void) | null = null;

  function emit(current: T) {
    for (const callback of callbacks) {
      callback(current);
    }
  }

  return {
    props,
    add(callback) {
      callbacks.add(callback);
      stop ??= start(emit);
      return () => {
        if (!callbacks.delete(callback) || callbacks.size > 0) return;
        stop?.();
        stop = null;
      };
    },
  };
}

/** Methods on the prototype; `add` still hands back a closure. */
class ClassService<T> implements Subscribable<T> {
  #callbacks = new Set<(props: T) => unknown>();
  #stop: (() => void) | null = null;
  #definition: Definition<T>;
  #emit: (props: T) => void;

  constructor(definition: Definition<T>) {
    this.#definition = definition;
    // Bound once because `start()` is handed a plain function.
    this.#emit = (current) => {
      for (const callback of this.#callbacks) {
        callback(current);
      }
    };
  }

  props(): T {
    return this.#definition.props();
  }

  add(callback: (props: T) => unknown): () => void {
    this.#callbacks.add(callback);
    this.#stop ??= this.#definition.start(this.#emit);
    return () => {
      if (!this.#callbacks.delete(callback) || this.#callbacks.size > 0) return;
      this.#stop?.();
      this.#stop = null;
    };
  }
}

/** Prototype-shared throughout: unsubscribing is an object, not a closure. */
class Subscription<T> {
  #service: PureClassService<T>;
  #callback: (props: T) => unknown;

  constructor(service: PureClassService<T>, callback: (props: T) => unknown) {
    this.#service = service;
    this.#callback = callback;
  }

  unsubscribe(): void {
    this.#service.remove(this.#callback);
  }
}

class PureClassService<T> {
  #callbacks = new Set<(props: T) => unknown>();
  #stop: (() => void) | null = null;
  #definition: Definition<T>;

  constructor(definition: Definition<T>) {
    this.#definition = definition;
  }

  emit = (current: T): void => {
    for (const callback of this.#callbacks) {
      callback(current);
    }
  };

  add(callback: (props: T) => unknown): Subscription<T> {
    this.#callbacks.add(callback);
    this.#stop ??= this.#definition.start(this.emit);
    return new Subscription(this, callback);
  }

  remove(callback: (props: T) => unknown): void {
    if (!this.#callbacks.delete(callback) || this.#callbacks.size > 0) return;
    this.#stop?.();
    this.#stop = null;
  }
}

const definition: Definition<number> = { props: () => 0, start: () => () => {} };
const COUNT = 500;

describe(`create ${COUNT} services`, () => {
  bench('closure', () => {
    const services = [];
    for (let i = 0; i < COUNT; i += 1) {
      services.push(closureService(definition));
    }
    globalThis.__benchSink = services;
  });

  bench('class', () => {
    const services = [];
    for (let i = 0; i < COUNT; i += 1) {
      services.push(new ClassService(definition));
    }
    globalThis.__benchSink = services;
  });

  bench('class + subscription object', () => {
    const services = [];
    for (let i = 0; i < COUNT; i += 1) {
      services.push(new PureClassService(definition));
    }
    globalThis.__benchSink = services;
  });
});

describe(`create ${COUNT} services, one subscriber each`, () => {
  bench('closure', () => {
    const undo = [];
    for (let i = 0; i < COUNT; i += 1) {
      undo.push(closureService(definition).add(() => {}));
    }
    globalThis.__benchSink = undo;
  });

  bench('class', () => {
    const undo = [];
    for (let i = 0; i < COUNT; i += 1) {
      undo.push(new ClassService(definition).add(() => {}));
    }
    globalThis.__benchSink = undo;
  });

  bench('class + subscription object', () => {
    const undo = [];
    for (let i = 0; i < COUNT; i += 1) {
      undo.push(new PureClassService(definition).add(() => {}));
    }
    globalThis.__benchSink = undo;
  });
});

describe('subscribe then unsubscribe, one service', () => {
  const closure = closureService(definition);
  const klass = new ClassService(definition);
  const pure = new PureClassService(definition);

  bench('closure', () => {
    closure.add(() => {})();
  });

  bench('class', () => {
    klass.add(() => {})();
  });

  bench('class + subscription object', () => {
    pure.add(() => {}).unsubscribe();
  });
});

describe('retained footprint of 5000 services (heap delta)', () => {
  // `performance.memory` is Chrome-only and unreliable without a forced GC,
  // so this is indicative, not a measurement to quote.
  const memory = () =>
    (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0;

  bench('closure', () => {
    const before = memory();
    const kept = [];
    for (let i = 0; i < 5000; i += 1) {
      const service = closureService(definition);
      service.add(() => {});
      kept.push(service);
    }
    globalThis.__benchSink = [kept, memory() - before];
  });

  bench('class', () => {
    const before = memory();
    const kept = [];
    for (let i = 0; i < 5000; i += 1) {
      const service = new ClassService(definition);
      service.add(() => {});
      kept.push(service);
    }
    globalThis.__benchSink = [kept, memory() - before];
  });
});

/**
 * The deeper comparison: the whole service, not just the wrapper.
 *
 * The factory shape allocates a closure per behaviour per instance —
 * `props`, `update`, `start` — on top of the primitive's `add` and `emit`.
 * v3's shape put those on a prototype and kept only state per instance
 * (`AbstractService` with `init`/`kill` overridden by each service). That
 * is the real fork, and the last group puts both against the cost of the
 * `ResizeObserver` they exist to wrap.
 */
interface BoxProps {
  width: number;
  height: number;
  ratio: number;
}

function closureResizeService(target: Element, observe: boolean): Subscribable<BoxProps> {
  const props: BoxProps = { width: 0, height: 0, ratio: 0 };

  function update(): BoxProps {
    props.width = target.clientWidth;
    props.height = target.clientHeight;
    props.ratio = props.width / Math.max(props.height, 1);
    return props;
  }

  return closureService<BoxProps>({
    props: () => props,
    start(emit) {
      if (!observe) return () => {};
      const observer = new ResizeObserver(() => emit(update()));
      observer.observe(target);
      return () => observer.disconnect();
    },
  });
}

/** v3's shape: behaviour on the prototype, state on the instance. */
abstract class AbstractService<T> {
  #callbacks = new Set<(props: T) => unknown>();
  #isRunning = false;

  abstract get props(): T;
  protected abstract init(): void;
  protected abstract kill(): void;

  protected trigger(current: T): void {
    for (const callback of this.#callbacks) {
      callback(current);
    }
  }

  add(callback: (props: T) => unknown): () => void {
    this.#callbacks.add(callback);
    if (!this.#isRunning) {
      this.#isRunning = true;
      this.init();
    }
    return () => {
      if (!this.#callbacks.delete(callback) || this.#callbacks.size > 0) return;
      this.#isRunning = false;
      this.kill();
    };
  }
}

class ResizeServiceClass extends AbstractService<BoxProps> {
  #target: Element;
  #observe: boolean;
  #observer: ResizeObserver | null = null;
  #props: BoxProps = { width: 0, height: 0, ratio: 0 };

  constructor(target: Element, observe: boolean) {
    super();
    this.#target = target;
    this.#observe = observe;
  }

  get props(): BoxProps {
    return this.#props;
  }

  update(): BoxProps {
    this.#props.width = this.#target.clientWidth;
    this.#props.height = this.#target.clientHeight;
    this.#props.ratio = this.#props.width / Math.max(this.#props.height, 1);
    return this.#props;
  }

  protected init(): void {
    if (!this.#observe) return;
    this.#observer = new ResizeObserver(() => this.trigger(this.update()));
    this.#observer.observe(this.#target);
  }

  protected kill(): void {
    this.#observer?.disconnect();
    this.#observer = null;
  }
}

const host = document.createElement('div');
document.body.append(host);
const boxes = Array.from({ length: 200 }, () => {
  const el = document.createElement('div');
  el.style.cssText = 'width:10px;height:10px';
  host.append(el);
  return el;
});

describe('whole service, 200 targets, no observer started', () => {
  bench('factory of closures', () => {
    globalThis.__benchSink = boxes.map((el) => closureResizeService(el, false));
  });

  bench('v3-style abstract class', () => {
    globalThis.__benchSink = boxes.map((el) => new ResizeServiceClass(el, false));
  });
});

describe('whole service, 200 targets, subscribed (real ResizeObserver)', () => {
  bench('factory of closures', () => {
    globalThis.__benchSink = boxes.map((el) => {
      const service = closureResizeService(el, true);
      return service.add(() => {});
    });
  });

  bench('v3-style abstract class', () => {
    globalThis.__benchSink = boxes.map((el) => {
      const service = new ResizeServiceClass(el, true);
      return service.add(() => {});
    });
  });
});
