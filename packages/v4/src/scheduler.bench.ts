/**
 * `class Scheduler` versus `createScheduler()` — a closure factory — for the
 * one scheduler the framework ever instantiates.
 *
 * The class shipped first, and `defaultScheduler` is its only instance ever.
 * A single instance removes the usual argument for a prototype (state per
 * instance, behaviour shared), and leaves two claims worth testing: that a
 * closure factory drops the `class`/`constructor` boilerplate from the
 * shipped bytes, and that reading a closure variable beats the private-brand
 * check every `this.#field` access performs on the per-frame flush path.
 *
 * Both variants below implement the same contract — `tick`, `read`, `write`,
 * `background`, `whenIdle`, `phase`, cancelable handles, error isolation
 * through `reportError()`, one flush per frame, double-buffered phases.
 *
 * Two deliberate departures from `scheduler.ts`, applied identically to both
 * copies so the comparison stays fair:
 *
 * 1. The frame and the off-frame turn come from an injected driver instead of
 *    `requestAnimationFrame()` and `postBackgroundTask()`. Without it there
 *    is nothing to measure: a real animation frame caps the flush at ~60
 *    turns a second, which measures the display and not the scheduler.
 * 2. Nothing here throws. The cost of a throwing task is the cost of
 *    `reportError()` dispatching a window `error` event — a platform call
 *    that swamps the shape of whatever calls it, in both variants equally.
 */
import { bench, describe } from 'vitest';

declare global {
  // eslint-disable-next-line no-var
  var __benchSink: unknown;
}

const BACKGROUND_BUDGET = 5;
const MIN_DELTA = 1;
const MAX_DELTA = 40;
const DEFAULT_DELTA = 1000 / 60;
const FRAME_PHASES = ['read', 'write'] as const;

type SchedulerPhase = 'idle' | 'tick' | 'read' | 'write' | 'background';
type QueueName = 'read' | 'write' | 'background';

interface TickProps {
  readonly time: DOMHighResTimeStamp;
  readonly delta: number;
}

type TickCallback = (props: TickProps) => void;

interface ScheduledTask<T = unknown> {
  promise: Promise<T | undefined>;
  cancel(): void;
}

interface QueueItem {
  fn: () => unknown;
  isCanceled: boolean;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

/** The public surface both variants expose, and the only one benched. */
interface Variant {
  readonly phase: SchedulerPhase;
  tick(callback: TickCallback): () => void;
  read<T>(fn: () => T): ScheduledTask<T>;
  write<T>(fn: () => T): ScheduledTask<T>;
  background<T>(fn: () => T): ScheduledTask<T>;
  whenIdle(): Promise<void>;
}

/**
 * Stands in for `requestAnimationFrame` and `postBackgroundTask`. One driver
 * per scheduler, so two instances never fight over the same pending slot.
 */
interface Driver {
  requestFrame(callback: (time: DOMHighResTimeStamp) => void): void;
  postTurn(run: () => void): void;
  /** Run the pending frame, and only that one: a re-armed flush waits. */
  runFrame(time: DOMHighResTimeStamp): void;
  /** Drain the off-frame lane turn by turn, bounded. */
  runTurns(limit?: number): void;
}

function createDriver(): Driver {
  let pendingFrame: ((time: DOMHighResTimeStamp) => void) | undefined;
  let pendingTurn: (() => void) | undefined;

  return {
    requestFrame(callback) {
      pendingFrame = callback;
    },
    postTurn(run) {
      pendingTurn = run;
    },
    runFrame(time) {
      const callback = pendingFrame;
      pendingFrame = undefined;
      callback?.(time);
    },
    runTurns(limit = 64) {
      for (let index = 0; index < limit && pendingTurn; index += 1) {
        const run = pendingTurn;
        pendingTurn = undefined;
        run();
      }
    },
  };
}

/* -------------------------------------------------------------------------
 * Variant 1 — the class, as `scheduler.ts` ships it.
 * ---------------------------------------------------------------------- */

class ClassScheduler implements Variant {
  #queues: Record<QueueName, QueueItem[]> = {
    read: [],
    write: [],
    background: [],
  };

  #phase: SchedulerPhase = 'idle';

  #isScheduled = false;

  #isBackgroundScheduled = false;

  #idleResolvers: Array<() => void> = [];

  #tickCallbacks = new Set<TickCallback>();

  #lastFrameTime = -1;

  #driver: Driver;

  constructor(driver: Driver) {
    this.#driver = driver;
  }

  get phase(): SchedulerPhase {
    return this.#phase;
  }

  tick(callback: TickCallback): () => void {
    if (this.#tickCallbacks.size === 0) {
      this.#lastFrameTime = -1;
    }
    this.#tickCallbacks.add(callback);
    this.#schedule();
    return () => {
      this.#tickCallbacks.delete(callback);
    };
  }

  read<T>(fn: () => T): ScheduledTask<T> {
    return this.#add('read', fn);
  }

  write<T>(fn: () => T): ScheduledTask<T> {
    return this.#add('write', fn);
  }

  background<T>(fn: () => T): ScheduledTask<T> {
    return this.#add('background', fn);
  }

  whenIdle(): Promise<void> {
    if (this.#isIdle()) {
      return Promise.resolve();
    }
    return new Promise((resolve) => this.#idleResolvers.push(resolve));
  }

  #isIdle(): boolean {
    return Object.values(this.#queues).every((queue) => queue.length === 0);
  }

  #add<T>(queueName: QueueName, fn: () => T): ScheduledTask<T> {
    let resolve!: (value: unknown) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    promise.catch(() => {});
    const item: QueueItem = { fn, isCanceled: false, resolve, reject };
    this.#queues[queueName].push(item);
    if (queueName === 'background') {
      this.#scheduleBackground();
    } else {
      this.#schedule();
    }
    return {
      promise: promise as Promise<T | undefined>,
      cancel() {
        item.isCanceled = true;
      },
    };
  }

  #schedule(): void {
    if (this.#isScheduled) {
      return;
    }
    this.#isScheduled = true;
    this.#driver.requestFrame((frameTime) => this.#flush(frameTime));
  }

  #scheduleBackground(): void {
    if (this.#isBackgroundScheduled) {
      return;
    }
    this.#isBackgroundScheduled = true;
    this.#driver.postTurn(() => this.#drainBackground());
  }

  #drainBackground(): void {
    this.#isBackgroundScheduled = false;
    const start = performance.now();
    const queue = this.#queues.background;

    this.#phase = 'background';
    while (queue.length > 0 && performance.now() - start < BACKGROUND_BUDGET) {
      this.#run(queue.shift() as QueueItem);
    }
    this.#phase = 'idle';

    if (queue.length > 0) {
      this.#scheduleBackground();
    }
    this.#resolveIdle();
  }

  #flush(frameTime: DOMHighResTimeStamp): void {
    this.#isScheduled = false;

    if (this.#tickCallbacks.size > 0) {
      this.#phase = 'tick';
      const props: TickProps = {
        time: frameTime,
        delta: this.#clampDelta(frameTime),
      };
      this.#lastFrameTime = frameTime;
      for (const callback of this.#tickCallbacks) {
        try {
          callback(props);
        } catch (error) {
          reportError(error);
        }
      }
    }

    for (const phase of FRAME_PHASES) {
      this.#phase = phase;
      const batch = this.#queues[phase];
      this.#queues[phase] = [];
      for (const item of batch) {
        this.#run(item);
      }
    }

    this.#phase = 'idle';

    if (this.#hasFrameWork() || this.#tickCallbacks.size > 0) {
      this.#schedule();
    }
    this.#resolveIdle();
  }

  #hasFrameWork(): boolean {
    return FRAME_PHASES.some((phase) => this.#queues[phase].length > 0);
  }

  #clampDelta(frameTime: DOMHighResTimeStamp): number {
    if (this.#lastFrameTime < 0) {
      return DEFAULT_DELTA;
    }
    return Math.min(Math.max(frameTime - this.#lastFrameTime, MIN_DELTA), MAX_DELTA);
  }

  #resolveIdle(): void {
    if (this.#idleResolvers.length === 0 || !this.#isIdle()) {
      return;
    }
    const resolvers = this.#idleResolvers;
    this.#idleResolvers = [];
    for (const resolve of resolvers) {
      resolve();
    }
  }

  #run(item: QueueItem): void {
    if (item.isCanceled) {
      item.resolve(undefined);
      return;
    }
    try {
      item.resolve(item.fn());
    } catch (error) {
      reportError(error);
      item.reject(error);
    }
  }
}

/* -------------------------------------------------------------------------
 * Variant 2 — the closure factory: state in closure variables, methods on a
 * plain object literal.
 * ---------------------------------------------------------------------- */

function createFactoryScheduler(driver: Driver): Variant {
  const queues: Record<QueueName, QueueItem[]> = {
    read: [],
    write: [],
    background: [],
  };
  const tickCallbacks = new Set<TickCallback>();
  let phase: SchedulerPhase = 'idle';
  let isScheduled = false;
  let isBackgroundScheduled = false;
  let idleResolvers: Array<() => void> = [];
  let lastFrameTime = -1;

  function isIdle(): boolean {
    return Object.values(queues).every((queue) => queue.length === 0);
  }

  function resolveIdle(): void {
    if (idleResolvers.length === 0 || !isIdle()) {
      return;
    }
    const resolvers = idleResolvers;
    idleResolvers = [];
    for (const resolve of resolvers) {
      resolve();
    }
  }

  function run(item: QueueItem): void {
    if (item.isCanceled) {
      item.resolve(undefined);
      return;
    }
    try {
      item.resolve(item.fn());
    } catch (error) {
      reportError(error);
      item.reject(error);
    }
  }

  function clampDelta(frameTime: DOMHighResTimeStamp): number {
    if (lastFrameTime < 0) {
      return DEFAULT_DELTA;
    }
    return Math.min(Math.max(frameTime - lastFrameTime, MIN_DELTA), MAX_DELTA);
  }

  function hasFrameWork(): boolean {
    return FRAME_PHASES.some((name) => queues[name].length > 0);
  }

  function flush(frameTime: DOMHighResTimeStamp): void {
    isScheduled = false;

    if (tickCallbacks.size > 0) {
      phase = 'tick';
      const props: TickProps = { time: frameTime, delta: clampDelta(frameTime) };
      lastFrameTime = frameTime;
      for (const callback of tickCallbacks) {
        try {
          callback(props);
        } catch (error) {
          reportError(error);
        }
      }
    }

    for (const name of FRAME_PHASES) {
      phase = name;
      const batch = queues[name];
      queues[name] = [];
      for (const item of batch) {
        run(item);
      }
    }

    phase = 'idle';

    if (hasFrameWork() || tickCallbacks.size > 0) {
      schedule();
    }
    resolveIdle();
  }

  function schedule(): void {
    if (isScheduled) {
      return;
    }
    isScheduled = true;
    driver.requestFrame(flush);
  }

  function drainBackground(): void {
    isBackgroundScheduled = false;
    const start = performance.now();
    const queue = queues.background;

    phase = 'background';
    while (queue.length > 0 && performance.now() - start < BACKGROUND_BUDGET) {
      run(queue.shift() as QueueItem);
    }
    phase = 'idle';

    if (queue.length > 0) {
      scheduleBackground();
    }
    resolveIdle();
  }

  function scheduleBackground(): void {
    if (isBackgroundScheduled) {
      return;
    }
    isBackgroundScheduled = true;
    driver.postTurn(drainBackground);
  }

  function add<T>(queueName: QueueName, fn: () => T): ScheduledTask<T> {
    let resolve!: (value: unknown) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    promise.catch(() => {});
    const item: QueueItem = { fn, isCanceled: false, resolve, reject };
    queues[queueName].push(item);
    if (queueName === 'background') {
      scheduleBackground();
    } else {
      schedule();
    }
    return {
      promise: promise as Promise<T | undefined>,
      cancel() {
        item.isCanceled = true;
      },
    };
  }

  return {
    get phase() {
      return phase;
    },
    tick(callback) {
      if (tickCallbacks.size === 0) {
        lastFrameTime = -1;
      }
      tickCallbacks.add(callback);
      schedule();
      return () => {
        tickCallbacks.delete(callback);
      };
    },
    read(fn) {
      return add('read', fn);
    },
    write(fn) {
      return add('write', fn);
    },
    background(fn) {
      return add('background', fn);
    },
    whenIdle() {
      if (isIdle()) {
        return Promise.resolve();
      }
      return new Promise((resolve) => idleResolvers.push(resolve));
    },
  };
}

/* ---------------------------------------------------------------- fixtures */

/** One driver and one scheduler per group, so no group inherits state. */
function pair(): [Variant, Driver] {
  const driver = createDriver();
  return [new ClassScheduler(driver), driver];
}

function factoryPair(): [Variant, Driver] {
  const driver = createDriver();
  return [createFactoryScheduler(driver), driver];
}

const FRAME = 1000 / 60;
let clock = 1000;
/** A monotonic frame timestamp, so `clampDelta` is exercised, not short-circuited. */
function nextTime(): number {
  clock += FRAME;
  return clock;
}

const noop = () => {};

describe('construct 1000 schedulers', () => {
  const driver = createDriver();

  bench('class', () => {
    const made = [];
    for (let index = 0; index < 1000; index += 1) made.push(new ClassScheduler(driver));
    globalThis.__benchSink = made;
  });

  bench('closure factory', () => {
    const made = [];
    for (let index = 0; index < 1000; index += 1) made.push(createFactoryScheduler(driver));
    globalThis.__benchSink = made;
  });
});

/** The common case: a couple of tasks, then the frame that runs them. */
describe('one read + one write per frame, 200 frames', () => {
  function body([scheduler, driver]: [Variant, Driver]) {
    for (let index = 0; index < 200; index += 1) {
      scheduler.read(noop);
      scheduler.write(noop);
      driver.runFrame(nextTime());
    }
  }

  const klass = pair();
  const factory = factoryPair();

  bench('class', () => body(klass));
  bench('closure factory', () => body(factory));
});

/** A heavy frame: 250 tasks per phase, scheduled then flushed. */
describe('250 reads + 250 writes in one frame', () => {
  function body([scheduler, driver]: [Variant, Driver]) {
    for (let index = 0; index < 250; index += 1) {
      scheduler.read(noop);
      scheduler.write(noop);
    }
    driver.runFrame(nextTime());
  }

  const klass = pair();
  const factory = factoryPair();

  bench('class', () => body(klass));
  bench('closure factory', () => body(factory));
});

/**
 * The flush path with no promises in it: a tick fan-out allocates nothing per
 * subscriber, so what is left is the loop, the phase writes, the delta clamp
 * and — in the class — the brand check on every `this.#field` it touches.
 */
describe('tick fan-out, 100 subscribers, 100 frames', () => {
  function body([scheduler, driver]: [Variant, Driver]) {
    const off = [];
    for (let index = 0; index < 100; index += 1) off.push(scheduler.tick(noop));
    for (let index = 0; index < 100; index += 1) driver.runFrame(nextTime());
    for (const stop of off) stop();
    // Let the re-armed frame run out, so the next iteration starts idle.
    driver.runFrame(nextTime());
  }

  const klass = pair();
  const factory = factoryPair();

  bench('class', () => body(klass));
  bench('closure factory', () => body(factory));
});

/** What a single running animation actually costs the loop, frame after frame. */
describe('tick fan-out, 1 subscriber, 1000 frames', () => {
  function body([scheduler, driver]: [Variant, Driver]) {
    const off = scheduler.tick(noop);
    for (let index = 0; index < 1000; index += 1) driver.runFrame(nextTime());
    off();
    driver.runFrame(nextTime());
  }

  const klass = pair();
  const factory = factoryPair();

  bench('class', () => body(klass));
  bench('closure factory', () => body(factory));
});

describe('schedule 250 reads, cancel every one, flush', () => {
  function body([scheduler, driver]: [Variant, Driver]) {
    for (let index = 0; index < 250; index += 1) scheduler.read(noop).cancel();
    driver.runFrame(nextTime());
  }

  const klass = pair();
  const factory = factoryPair();

  bench('class', () => body(klass));
  bench('closure factory', () => body(factory));
});

/**
 * The off-frame lane. Its `performance.now()` per task is a real cost of the
 * time slice and it is the same in both variants, so this group has the least
 * headroom of the six to show a difference either way.
 */
describe('drain 250 background tasks', () => {
  function body([scheduler, driver]: [Variant, Driver]) {
    for (let index = 0; index < 250; index += 1) scheduler.background(noop);
    driver.runTurns();
  }

  const klass = pair();
  const factory = factoryPair();

  bench('class', () => body(klass));
  bench('closure factory', () => body(factory));
});

/** A prototype getter against an own accessor on an object literal. */
describe('read the phase 10000 times', () => {
  const [klass] = pair();
  const [factory] = factoryPair();

  bench('class', () => {
    let seen = 0;
    for (let index = 0; index < 10_000; index += 1) if (klass.phase === 'idle') seen += 1;
    globalThis.__benchSink = seen;
  });

  bench('closure factory', () => {
    let seen = 0;
    for (let index = 0; index < 10_000; index += 1) if (factory.phase === 'idle') seen += 1;
    globalThis.__benchSink = seen;
  });
});
