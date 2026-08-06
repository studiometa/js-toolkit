import { registerComponent } from '../helpers/registerComponent.js';
import type { BaseConstructor } from '../Base/index.js';
import type { ComponentLoadStrategy, ComponentManifest, ComponentManifestEntry } from './types.js';

const COMPONENT_SELECTOR = '[data-component]';
const LOAD_STRATEGIES: readonly ComponentLoadStrategy[] = [
  'eager',
  'visible',
  'idle',
  'interaction',
];

/** The diagnostic prefix used when the host does not inject its own. */
export const DEFAULT_DIAGNOSTIC_PREFIX = '[@studiometa/js-toolkit/autoload]';

/** Start loading visible components shortly before they enter the viewport. */
export const VISIBLE_ROOT_MARGIN = '200px 0px';
/** Ensure idle components eventually load even when the main thread remains busy. */
export const IDLE_TIMEOUT = 2_000;

interface IdleDeadlineLike {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
}

type IdleHandle = number;
type RequestIdleCallbackLike = (
  callback: (deadline: IdleDeadlineLike) => void,
  options?: { timeout: number },
) => IdleHandle;
type CancelIdleCallbackLike = (handle: IdleHandle) => void;
type RegisterComponent = (
  Constructor: BaseConstructor,
  token: string,
) => Promise<unknown> | unknown;

type ComponentState = 'scheduled' | 'loading' | 'registered' | 'failed';

interface ComponentRecord {
  state: ComponentState;
  promise?: Promise<void>;
  Constructor?: BaseConstructor;
  cleanups: Set<() => void>;
  scheduledStrategies: Set<ComponentLoadStrategy>;
}

export interface LoaderDependencies {
  document: Document;
  MutationObserver?: typeof MutationObserver;
  IntersectionObserver?: typeof IntersectionObserver;
  requestIdleCallback?: RequestIdleCallbackLike;
  cancelIdleCallback?: CancelIdleCallbackLike;
  setTimeout: typeof globalThis.setTimeout;
  clearTimeout: typeof globalThis.clearTimeout;
  registerComponent: RegisterComponent;
  console: Pick<Console, 'warn' | 'error'>;
  CustomEvent: typeof CustomEvent;
  /** The prefix prepended to every diagnostic message emitted by the loader. */
  diagnosticPrefix: string;
}

export interface ComponentLoaderOptions {
  manifest: ComponentManifest;
  /** The DOM scope to scan and observe. Defaults to the injected `document`. */
  root?: Document | Element;
  dependencies?: Partial<LoaderDependencies>;
}

export interface ComponentLoaderStartOptions {
  eagerComponents?: Iterable<string>;
}

function isLoadStrategy(value: string): value is ComponentLoadStrategy {
  return LOAD_STRATEGIES.includes(value as ComponentLoadStrategy);
}

function isBaseConstructor(value: unknown): value is BaseConstructor {
  if (typeof value !== 'function') {
    return false;
  }

  const Constructor = value as unknown as Record<string, unknown>;
  return Constructor.$isBase === true && typeof Constructor.$register === 'function';
}

function createDependencies(overrides: Partial<LoaderDependencies> = {}): LoaderDependencies {
  const scope = globalThis as typeof globalThis & {
    requestIdleCallback?: RequestIdleCallbackLike;
    cancelIdleCallback?: CancelIdleCallbackLike;
  };

  return {
    document,
    MutationObserver: globalThis.MutationObserver,
    IntersectionObserver: globalThis.IntersectionObserver,
    requestIdleCallback: scope.requestIdleCallback?.bind(scope),
    cancelIdleCallback: scope.cancelIdleCallback?.bind(scope),
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    registerComponent,
    console,
    CustomEvent,
    diagnosticPrefix: DEFAULT_DIAGNOSTIC_PREFIX,
    ...overrides,
  };
}

/**
 * Discover declarative components and schedule each constructor exactly once.
 *
 * The loader is generic: it knows nothing hard-coded about any component package and works purely
 * from the manifest it is given. Importing this module has no side effects — discovery only starts
 * when {@link ComponentLoader.start} is called.
 */
export class ComponentLoader {
  /** @private */
  __manifest: ComponentManifest;
  /** @private */
  __dependencies: LoaderDependencies;
  /** @private */
  __root: Document | Element;
  /** @private */
  __records = new Map<string, ComponentRecord>();
  /** @private */
  __eagerComponents = new Set<string>();
  /** @private */
  __elementSchedules = new WeakMap<Element, Set<string>>();
  /** @private */
  __elementCleanups = new WeakMap<Element, Set<() => void>>();
  /** @private */
  __mutationObserver?: MutationObserver;
  /** @private */
  __started = false;

  constructor({ manifest, root, dependencies }: ComponentLoaderOptions) {
    this.__manifest = manifest;
    this.__dependencies = createDependencies(dependencies);
    this.__root = root ?? this.__dependencies.document;
  }

  start({ eagerComponents = [] }: ComponentLoaderStartOptions = {}): void {
    if (this.__started) {
      return;
    }
    this.__started = true;

    const MutationObserverConstructor = this.__dependencies.MutationObserver;
    if (MutationObserverConstructor) {
      this.__mutationObserver = new MutationObserverConstructor((records) => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node instanceof Element) {
              this.__scan(node);
            }
          }
          for (const node of record.removedNodes) {
            if (node instanceof Element) {
              this.__cleanSubtree(node);
            }
          }
        }
      });
      this.__mutationObserver.observe(this.__root, {
        childList: true,
        subtree: true,
      });
    } else {
      this.__warn('MutationObserver is unavailable; added components will not be discovered.');
    }

    for (const token of new Set(eagerComponents)) {
      if (!this.__getEntry(token)) {
        this.__warn('An unknown eager component was ignored.');
        continue;
      }
      this.__eagerComponents.add(token);
      this.__schedule(token, 'eager');
    }

    this.__scan(this.__root);
  }

  stop(): void {
    this.__mutationObserver?.disconnect();
    for (const record of this.__records.values()) {
      this.__clean(record);
    }
  }

  /** @private */
  __scan(root: Document | Element): void {
    if (root instanceof Element && root.matches(COMPONENT_SELECTOR)) {
      this.__discover(root);
    }

    for (const element of root.querySelectorAll(COMPONENT_SELECTOR)) {
      this.__discover(element);
    }
  }

  /** @private */
  __discover(element: Element): void {
    const rawTokens = element.getAttribute('data-component') ?? '';
    const tokens = new Set(rawTokens.split(/\s+/).filter(Boolean));

    for (const token of tokens) {
      const entry = this.__getEntry(token);
      if (!entry) {
        this.__warn('An unknown component token was ignored.');
        continue;
      }

      const strategy = this.__getStrategy(element, entry);
      const scheduleKey = `${token}:${strategy}`;
      const elementSchedules = this.__elementSchedules.get(element) ?? new Set<string>();
      if (elementSchedules.has(scheduleKey)) {
        continue;
      }
      elementSchedules.add(scheduleKey);
      this.__elementSchedules.set(element, elementSchedules);
      this.__schedule(token, strategy, element);
    }
  }

  /** @private */
  __getEntry(token: string): ComponentManifestEntry | undefined {
    if (!Object.prototype.hasOwnProperty.call(this.__manifest, token)) {
      return undefined;
    }
    return this.__manifest[token];
  }

  /** @private */
  __getStrategy(element: Element, entry: ComponentManifestEntry): ComponentLoadStrategy {
    if (this.__eagerComponents.has(entry.token)) {
      return 'eager';
    }

    const attribute = element.getAttribute('data-load');
    if (attribute !== null) {
      if (isLoadStrategy(attribute)) {
        return attribute;
      }
      this.__warn(`Component "${entry.token}" has an invalid data-load value; using its default.`);
    }

    if (isLoadStrategy(entry.strategy)) {
      return entry.strategy;
    }

    this.__warn(`Component "${entry.token}" has an invalid manifest strategy; loading eagerly.`);
    return 'eager';
  }

  /** @private */
  __getRecord(token: string): ComponentRecord {
    let record = this.__records.get(token);
    if (!record) {
      record = {
        state: 'scheduled',
        cleanups: new Set(),
        scheduledStrategies: new Set(),
      };
      this.__records.set(token, record);
    }
    return record;
  }

  /** @private */
  __schedule(token: string, strategy: ComponentLoadStrategy, element?: Element): void {
    const record = this.__getRecord(token);
    if (record.state !== 'scheduled') {
      return;
    }

    if (strategy === 'eager') {
      this.__begin(token, record);
      return;
    }

    if (strategy === 'visible') {
      if (!element) {
        this.__begin(token, record);
        return;
      }
      const IntersectionObserverConstructor = this.__dependencies.IntersectionObserver;
      if (!IntersectionObserverConstructor) {
        this.__warn(`IntersectionObserver is unavailable; loading component "${token}" eagerly.`);
        this.__begin(token, record);
        return;
      }
      const observer = new IntersectionObserverConstructor(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.__begin(token, record);
          }
        },
        { rootMargin: VISIBLE_ROOT_MARGIN },
      );
      observer.observe(element);
      this.__addCleanup(record, () => observer.disconnect(), element);
      return;
    }

    if (strategy === 'idle') {
      if (record.scheduledStrategies.has(strategy)) {
        return;
      }
      record.scheduledStrategies.add(strategy);
      const requestIdleCallback = this.__dependencies.requestIdleCallback;
      if (requestIdleCallback) {
        const handle = requestIdleCallback(() => this.__begin(token, record), {
          timeout: IDLE_TIMEOUT,
        });
        this.__addCleanup(record, () => this.__dependencies.cancelIdleCallback?.(handle));
        return;
      }
      this.__warn(`requestIdleCallback is unavailable; using a timeout for component "${token}".`);
      const handle = this.__dependencies.setTimeout(
        () => this.__begin(token, record),
        IDLE_TIMEOUT,
      );
      this.__addCleanup(record, () => this.__dependencies.clearTimeout(handle));
      return;
    }

    if (!element) {
      this.__begin(token, record);
      return;
    }

    const listener = () => this.__begin(token, record);
    for (const eventName of ['pointerover', 'pointerdown', 'focusin']) {
      element.addEventListener(eventName, listener, { once: true });
      this.__addCleanup(record, () => element.removeEventListener(eventName, listener), element);
    }
  }

  /** @private */
  __begin(token: string, record: ComponentRecord): void {
    if (record.state !== 'scheduled') {
      return;
    }

    const entry = this.__getEntry(token);
    if (!entry) {
      return;
    }

    record.state = 'loading';
    this.__clean(record);
    record.promise = Promise.resolve()
      .then(() => entry.load())
      .then((Constructor) => {
        if (!isBaseConstructor(Constructor)) {
          throw new TypeError('The manifest loader did not resolve to a Base constructor.');
        }
        return Constructor;
      })
      .catch((error: unknown) => {
        record.state = 'failed';
        this.__reportError(token, 'import', error);
        return undefined;
      })
      .then(async (Constructor) => {
        if (!Constructor) {
          return;
        }
        try {
          await this.__dependencies.registerComponent(Constructor, token);
          record.Constructor = Constructor;
          record.state = 'registered';
          await this.__registerConfiguredChildren(token, Constructor, new Set([token]));
        } catch (error: unknown) {
          record.state = 'failed';
          this.__reportError(token, 'registration', error);
        }
      });
  }

  /** @private */
  async __registerConfiguredChildren(
    parentToken: string,
    ParentConstructor: BaseConstructor,
    visited: Set<string>,
  ): Promise<void> {
    const configuredChildren = ParentConstructor.config.components ?? {};

    for (const token of this.__getEntry(parentToken)?.children ?? []) {
      if (visited.has(token)) {
        continue;
      }

      const Constructor = configuredChildren[token];
      if (!isBaseConstructor(Constructor)) {
        continue;
      }

      visited.add(token);
      const record = this.__getRecord(token);
      if (record.state === 'loading') {
        continue;
      }

      if (record.state !== 'registered') {
        record.state = 'loading';
        this.__clean(record);
        record.promise = this.__registerConfiguredChild(token, Constructor, record, visited);
        await record.promise;
      } else {
        await this.__registerConfiguredChildren(token, record.Constructor ?? Constructor, visited);
      }
    }
  }

  /** @private */
  async __registerConfiguredChild(
    token: string,
    Constructor: BaseConstructor,
    record: ComponentRecord,
    visited: Set<string>,
  ): Promise<void> {
    try {
      await this.__dependencies.registerComponent(Constructor, token);
      record.Constructor = Constructor;
      record.state = 'registered';
      await this.__registerConfiguredChildren(token, Constructor, visited);
    } catch (error: unknown) {
      record.state = 'failed';
      this.__reportError(token, 'registration', error);
    }
  }

  /** @private */
  __addCleanup(record: ComponentRecord, cleanup: () => void, element?: Element): void {
    let active = true;
    const run = () => {
      if (!active) {
        return;
      }
      active = false;
      cleanup();
      record.cleanups.delete(run);
      if (element) {
        const elementCleanups = this.__elementCleanups.get(element);
        elementCleanups?.delete(run);
        if (elementCleanups?.size === 0) {
          this.__elementCleanups.delete(element);
        }
      }
    };

    record.cleanups.add(run);
    if (element) {
      const elementCleanups = this.__elementCleanups.get(element) ?? new Set();
      elementCleanups.add(run);
      this.__elementCleanups.set(element, elementCleanups);
    }
  }

  /** @private */
  __cleanSubtree(root: Element): void {
    for (const element of [root, ...root.querySelectorAll('*')]) {
      if (element.isConnected) {
        continue;
      }
      for (const cleanup of [...(this.__elementCleanups.get(element) ?? [])]) {
        cleanup();
      }
      this.__elementSchedules.delete(element);
    }
  }

  /** @private */
  __clean(record: ComponentRecord): void {
    for (const cleanup of record.cleanups) {
      cleanup();
    }
    record.cleanups.clear();
  }

  /** @private */
  __warn(message: string): void {
    this.__dependencies.console.warn(`${this.__dependencies.diagnosticPrefix} ${message}`);
  }

  /** @private */
  __reportError(token: string, stage: 'import' | 'registration', error: unknown): void {
    this.__dependencies.console.error(
      `${this.__dependencies.diagnosticPrefix} Failed during ${stage} for component "${token}".`,
      error,
    );
    const event = new this.__dependencies.CustomEvent('js-toolkit:error', {
      bubbles: true,
      detail: { token, stage, error },
    });
    (this.__dependencies.document.documentElement ?? this.__dependencies.document).dispatchEvent(
      event,
    );
  }
}
