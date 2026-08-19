import {
  Base,
  component,
  domUpdate,
  EVENTS,
  on,
  swap,
  SWAP_MODES,
  viewTransition,
  type BaseProps,
  type DomUpdateDetail,
  type SwapMode,
} from '../../src/index.js';
import { historyPush } from '../../src/utils/history.js';
import { compileExpression } from '../expression.js';

/**
 * The lifecycle events a `Fetch` announces.
 *
 * A module constant rather than a static: v3 reads it through
 * `this.constructor.FETCH_EVENTS`, which only pays for itself if a subclass
 * replaces the map, and nothing in ui does. Reading it here deletes the
 * `FetchConstructor` type and the `declare ['constructor']` workaround with it.
 */
export const FETCH_EVENTS = Object.freeze({
  BEFORE_FETCH: 'fetch-before',
  FETCH: 'fetch-fetch',
  RESPONSE: 'fetch-response',
  AFTER_FETCH: 'fetch-after',
  BEFORE_UPDATE: 'fetch-update-before',
  UPDATE: 'fetch-update',
  AFTER_UPDATE: 'fetch-update-after',
  ERROR: 'fetch-error',
  ABORT: 'fetch-abort',
} as const);

/**
 * The header names the request carries on the component's own behalf.
 */
export const HEADER_NAMES = Object.freeze({
  ACCEPT: 'accept',
  X_REQUESTED_BY: 'x-requested-by',
  X_TRIGGERED_BY: 'x-triggered-by',
  USER_AGENT: 'user-agent',
} as const);

/** One parser for every instance: it holds no state between calls. */
const domParser = new DOMParser();

/** `response` expression argument names, in `parseResponse()`'s call order. */
const RESPONSE_ARGUMENTS = ['response', 'url', 'requestInit', 'self'] as const;

/** The context every lifecycle event carries. */
export interface FetchEventBase {
  instance: Fetch;
  url: URL;
  requestInit: RequestInit;
}

/**
 * The declared event surface. v3 spells the same list twice — once in
 * `config.emits` for the runtime check and once in prose — and neither
 * describes a payload.
 */
export type FetchEmits = {
  'fetch-before': FetchEventBase;
  'fetch-fetch': FetchEventBase;
  'fetch-response': FetchEventBase & { response: Response };
  'fetch-after': FetchEventBase & { content?: unknown; error?: unknown };
  'fetch-update-before': FetchEventBase & { content: unknown };
  'fetch-update': FetchEventBase & { fragment?: Document; update?: unknown };
  'fetch-update-after': FetchEventBase & { fragment?: Document; update?: unknown };
  'fetch-error': FetchEventBase & { error: Error };
  'fetch-abort': FetchEventBase & { reason: unknown };
};

export type FetchProps = BaseProps & {
  $el: HTMLAnchorElement | HTMLFormElement;
  $refs: {
    headers: HTMLInputElement[];
  };
  $options: {
    history: boolean;
    requestInit: RequestInit;
    headers: Record<string, string>;
    mode: SwapMode;
    selector: string;
    response: string;
    viewTransition: boolean;
    src: string;
  };
  $emits: FetchEmits;
};

/**
 * A self-contained AJAX navigation primitive bound to a link, a form or any
 * element with a `src` option. It resolves the request URL and `requestInit`
 * from that element, fetches the content, then updates the DOM by matching
 * elements from the response against the current page through the `selector`
 * option and swapping them following the `mode` option.
 *
 * @link https://ui.studiometa.dev/reference/items/Fetch/
 */
@component({
  name: 'Fetch',
  refs: ['headers[]'],
  options: {
    history: Boolean,
    mode: {
      type: String,
      default: SWAP_MODES.REPLACE,
    },
    requestInit: {
      type: Object,
      // Each instance requires its own mutable default object.
      default: () => ({}),
    },
    headers: {
      type: Object,
      default: () => ({}),
    },
    selector: {
      type: String,
      default: '[id]',
    },
    response: {
      type: String,
      default: 'response.text()',
    },
    viewTransition: {
      type: Boolean,
      default: true,
    },
    src: String,
  },
})
export class Fetch<T extends BaseProps = BaseProps> extends Base<FetchProps & T> {
  /** Aborts the request in flight when a new one starts. */
  protected abortController = new AbortController();

  #client: typeof fetch | undefined;

  /** The client used for the request. Assignable, so a test can inject one. */
  get client(): typeof fetch {
    return (this.#client ??= window.fetch.bind(window));
  }

  set client(client: typeof fetch) {
    this.#client = client;
  }

  /**
   * The URL to use for the request.
   *
   * The base URL is the `src` option when it is set, otherwise the element's
   * own destination: a form's `action`, a link's `href`, or the current
   * location as a last resort. For a GET form the form data is then folded on
   * top of that base, so an explicit `src` can carry a fixed query that
   * survives alongside the live form fields, with form fields winning.
   */
  get url(): URL {
    const { $el, isForm, isLink, $options } = this;

    const url = $options.src
      ? new URL($options.src, window.location.href)
      : isForm
        ? new URL(($el as HTMLFormElement).action)
        : isLink
          ? new URL(($el as HTMLAnchorElement).href)
          : new URL(window.location.href);

    if (isForm && ($el as HTMLFormElement).method.toLowerCase() === 'get') {
      for (const [key, value] of new URLSearchParams(
        new FormData($el as HTMLFormElement) as unknown as Record<string, string>,
      )) {
        url.searchParams.set(key, value);
      }
    }

    return url;
  }

  /** The options for the request, merged from the element and its refs. */
  get requestInit(): RequestInit {
    const { isForm, $el, $options, $refs } = this;
    const { requestInit, headers } = $options;
    const requestedBy = '@studiometa/ui/Fetch';

    const normalizedRequestInit: RequestInit & { headers: Record<string, string> } = {
      ...requestInit,
      headers: {
        [HEADER_NAMES.USER_AGENT]: `${navigator.userAgent} ${requestedBy}`,
        ...(requestInit.headers as Record<string, string> | undefined),
        ...headers,
      },
    };

    for (const header of $refs.headers) {
      if (header.dataset.name && header.value) {
        normalizedRequestInit.headers[header.dataset.name] = header.value;
      }
    }

    if (isForm) {
      const form = $el as HTMLFormElement;
      const method = form.method.toLowerCase();
      normalizedRequestInit.method = method;
      if (method === 'post') {
        normalizedRequestInit.body = new FormData(form);
      }
    }

    return normalizedRequestInit;
  }

  get isLink(): boolean {
    return this.$el instanceof HTMLAnchorElement;
  }

  get isForm(): boolean {
    return this.$el instanceof HTMLFormElement;
  }

  /** A plain left click on a link fetches its destination instead of navigating. */
  @on('click')
  navigate(event: MouseEvent): void {
    if (!this.isLink) {
      return;
    }

    if (
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      !event.metaKey &&
      event.button === 0 &&
      this.$el.target !== '_blank'
    ) {
      event.preventDefault();
      void this.fetch(this.url, this.requestInit);
    }
  }

  /** A form submission fetches its action with the form's own data. */
  @on('submit')
  send(event: SubmitEvent): void {
    if (!this.isForm) {
      return;
    }

    if (this.$el.target !== '_blank') {
      event.preventDefault();
      void this.fetch(this.url, this.requestInit);
    }
  }

  /** Update the content on history back/forward navigation. */
  @on(window, 'popstate')
  restore(): void {
    if (!this.$options.history) {
      return;
    }

    void this.fetch(new URL(window.location.href), {
      headers: {
        [HEADER_NAMES.X_TRIGGERED_BY]: 'popstate',
      },
    });
  }

  /**
   * Fetch the given url.
   *
   * The `url` parameter defaults to the {@link url} getter, so a bare
   * `fetch()` works from an event handler. Strings are resolved against the
   * current location, since the history and view-transition paths read
   * `url.pathname` and `url.searchParams`.
   */
  async fetch(url: URL | string = this.url, requestInit: RequestInit = {}): Promise<void> {
    const normalizedUrl = url instanceof URL ? url : new URL(url, window.location.href);
    this.$emit(FETCH_EVENTS.BEFORE_FETCH, { instance: this, url: normalizedUrl, requestInit });

    this.abortController.abort();
    const newController = new AbortController();
    newController.signal.addEventListener('abort', () => {
      this.$emit(FETCH_EVENTS.ABORT, {
        instance: this,
        url: normalizedUrl,
        requestInit,
        reason: newController.signal.reason,
      });
    });
    this.abortController = newController;
    const init = this.mergeRequestInit(requestInit, newController.signal);

    this.$emit(FETCH_EVENTS.FETCH, { instance: this, url: normalizedUrl, requestInit: init });

    try {
      const response = await this.client(normalizedUrl, init);
      this.$emit(FETCH_EVENTS.RESPONSE, {
        instance: this,
        url: normalizedUrl,
        requestInit: init,
        response,
      });

      if (!response.ok) {
        throw new Error(`Fetch failed with status ${response.status}`);
      }

      const content = await this.parseResponse(response, normalizedUrl, requestInit);
      this.$emit(FETCH_EVENTS.AFTER_FETCH, {
        instance: this,
        url: normalizedUrl,
        requestInit: init,
        content,
      });
      void this.update(normalizedUrl, init, content);
    } catch (error) {
      this.$emit(FETCH_EVENTS.AFTER_FETCH, {
        instance: this,
        url: normalizedUrl,
        requestInit: init,
        error,
      });
      this.error(normalizedUrl, init, error as Error);
    }
  }

  /**
   * The per-call `requestInit` folded onto the element's own, with the abort
   * signal of the request in flight. Carved out of `fetch()` because
   * `FetchShopifyPartial` needs the same merge before it decides whether the
   * request is expressible through its own transport.
   * @protected
   */
  mergeRequestInit(requestInit: RequestInit, signal: AbortSignal): RequestInit {
    return {
      ...this.requestInit,
      ...requestInit,
      headers: {
        ...(this.requestInit.headers as Record<string, string>),
        ...(requestInit.headers as Record<string, string> | undefined),
      },
      signal,
    };
  }

  /**
   * Extract the string content to inject from the raw `Response`.
   *
   * The default implementation evaluates the `response` option, giving it the
   * `response`, `url`, `requestInit` and `self` bindings and the instance as
   * `this`. Subclasses override this to parse with typed code instead.
   * @protected
   */
  parseResponse(response: Response, url: URL, requestInit: RequestInit): Promise<string> | string {
    const fn = compileExpression(RESPONSE_ARGUMENTS, `return ${this.$options.response}`) as (
      response: Response,
      url: URL,
      requestInit: RequestInit,
      self: unknown,
    ) => string;
    return fn.call(this, response, url, requestInit, self);
  }

  /**
   * Swap every element of the response whose id matches one on the page.
   *
   * `swap()` does all four modes now that it can replace its target: this
   * family matches an element by id and puts the response's element in its
   * place, attributes included, which is what `self` asks for. The additive
   * modes are the ones that keep the page element and add to its children, so
   * they are exactly `swap()`'s default.
   *
   * Every swap is started before any is awaited, so the whole update is one
   * synchronous DOM pass — v3's ordering — and the settling of all of them is
   * awaited once.
   *
   * @protected
   */
  async updateDOM(fragment: Document): Promise<void> {
    const { mode, selector } = this.$options;
    const isAdditive = mode === SWAP_MODES.APPEND || mode === SWAP_MODES.PREPEND;
    const swaps: Promise<void>[] = [];

    for (const newElement of fragment.querySelectorAll<HTMLElement>(selector)) {
      const oldElement = newElement.id ? document.getElementById(newElement.id) : null;

      if (!oldElement || oldElement === newElement) {
        continue;
      }

      swaps.push(swap(oldElement, newElement, { mode, self: !isAdditive }));
    }

    await Promise.all(swaps);
  }

  /**
   * Announce the imminent DOM change, then apply it.
   *
   * The change travels on core's `domUpdate()` protocol, so a listener can
   * take it over through `detail.wrap()`. The component's own view transition
   * is registered as the **first** claim on that same protocol rather than as
   * an `else` branch: `wrap()` keeps the last registration, and the event
   * starts on this element, so any listener above overrides the default
   * without the component having to ask whether one exists.
   */
  async update(url: URL, requestInit: RequestInit, content: string): Promise<void> {
    const { history, viewTransition: hasViewTransition } = this.$options;

    this.$emit(FETCH_EVENTS.BEFORE_UPDATE, { instance: this, url, requestInit, content });

    const fragment = domParser.parseFromString(content, 'text/html');

    if (history) {
      if (
        (requestInit.headers as Record<string, string> | undefined)?.[
          HEADER_NAMES.X_TRIGGERED_BY
        ] !== 'popstate'
      ) {
        historyPush({ path: url.pathname, search: url.searchParams });
      }
      this.$write(() => {
        if (fragment.title) {
          document.title = fragment.title;
        }
      });
    }

    this.$emit(FETCH_EVENTS.UPDATE, { instance: this, url, requestInit, fragment });

    const releaseDefault = hasViewTransition
      ? this.$on(EVENTS.dom.update, (event) => {
          (event as CustomEvent<DomUpdateDetail>).detail.wrap((apply) => viewTransition(apply));
        })
      : null;

    try {
      await domUpdate(this.$el, () => this.updateDOM(fragment), {
        instance: this,
        url,
        requestInit,
        fragment,
      });
    } finally {
      releaseDefault?.();
    }

    this.$emit(FETCH_EVENTS.AFTER_UPDATE, { instance: this, url, requestInit, fragment });
  }

  /** Announce a failed request, ignoring the abort the component caused. */
  error(url: URL, requestInit: RequestInit, error: Error): void {
    if (error.name === 'AbortError') {
      return;
    }

    this.$emit(FETCH_EVENTS.ERROR, { instance: this, url, requestInit, error });
  }

  /** Abort the request in flight. */
  abort(reason?: unknown): void {
    this.abortController.abort(reason);
  }
}
