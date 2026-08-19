import { component, type BaseProps } from '../../src/index.js';
import { historyPush } from '../../src/utils/history.js';
import { FETCH_EVENTS, Fetch, HEADER_NAMES, type FetchProps } from './Fetch.js';

/** Minimal shape of the `partials` API exposed by `@shopify/partial-rendering`. */
interface PartialsApi {
  fetch(
    ...args: [...names: string[], options: { url: string; signal?: AbortSignal }]
  ): Promise<unknown>;
  apply(update: unknown): void | Promise<void>;
}

/** Minimal shape of the `@shopify/partial-rendering` module. */
interface PartialsModule {
  partials: PartialsApi;
}

export type FetchShopifyPartialProps = FetchProps & {
  $options: FetchProps['$options'] & { partials: string };
};

/**
 * Adapts {@link Fetch} to Shopify's `@shopify/partial-rendering` API (Liquid
 * July '26 preview). Partial rendering engages only when partial names are
 * configured via the `partials` option **and** the preview package
 * resolves; otherwise it transparently falls back to the base {@link Fetch}
 * behaviour (id-based full-page swap).
 *
 * Compared to the base lifecycle, the partials path diverges in two ways:
 * the `RESPONSE` event never fires (there is no `Response` object on this
 * path), and the `UPDATE` payload carries the opaque partials `update`
 * object instead of a parsed `Document` fragment — `partials.apply` owns DOM
 * swapping, View Transitions and focus/selection/form/scroll preservation.
 *
 * @link https://ui.studiometa.dev/reference/items/Fetch/
 */
@component({
  name: 'FetchShopifyPartial',
  options: {
    partials: String,
  },
})
export class FetchShopifyPartial<T extends BaseProps = BaseProps> extends Fetch<
  FetchShopifyPartialProps & T
> {
  /**
   * Module specifier for the Shopify partial rendering package. A static
   * field, not a module constant like {@link FETCH_EVENTS}: this one exists
   * to be overridden, by a test or a subclass, so it keeps the shape a
   * `this.constructor` access needs.
   */
  static PARTIALS_MODULE = '@shopify/partial-rendering';

  /**
   * Load the Shopify partial rendering module, lazily so the class compiles
   * and runs without the preview package installed. Override on a subclass
   * or reassign directly (`FetchShopifyPartial.loadPartialsModule = …`) to
   * inject a fake.
   */
  static async loadPartialsModule(): Promise<PartialsModule> {
    return import(/* @vite-ignore */ this.PARTIALS_MODULE);
  }

  /** `undefined` means resolution has not been attempted yet, `null` means it failed. */
  partialsModule: PartialsApi | null | undefined;

  /** The configured partial names, trimmed and empty-filtered. */
  get partialNames(): string[] {
    return this.$options.partials
      .split(',')
      .map((partial) => partial.trim())
      .filter(Boolean);
  }

  /**
   * Resolve the partials API, memoising the result. Returns `null` on any
   * failure (missing package, missing export, …) so callers fall back to
   * the base behaviour. This never rejects.
   */
  async resolvePartials(): Promise<PartialsApi | null> {
    if (typeof this.partialsModule !== 'undefined') {
      return this.partialsModule;
    }

    try {
      const ctor = this.constructor as typeof FetchShopifyPartial;
      const loaded = await ctor.loadPartialsModule();
      this.partialsModule = loaded?.partials ?? null;
    } catch {
      this.partialsModule = null;
    }

    return this.partialsModule;
  }

  /**
   * Whether the given request can be expressed through the partials API.
   *
   * `@shopify/partial-rendering` only performs a GET for a URL — it takes
   * nothing but `{ url, signal }` — so a request carrying a body, a
   * non-GET method, custom headers or any other `RequestInit` field falls
   * back to the base {@link Fetch} behaviour, whether these come from the
   * element options or from the per-call `requestInit` argument.
   * Framework-internal headers are ignored, so the declarative click,
   * submit and popstate flows still use partial rendering.
   */
  canUsePartials(requestInit: RequestInit): boolean {
    const merged = {
      ...this.requestInit,
      ...requestInit,
      headers: {
        ...(this.requestInit.headers as Record<string, string>),
        ...(requestInit.headers as Record<string, string> | undefined),
      },
    };

    if ((merged.method ?? 'get').toLowerCase() !== 'get' || merged.body) {
      return false;
    }

    const supportedKeys = new Set(['method', 'headers', 'body', 'signal']);
    for (const key of Object.keys({ ...this.$options.requestInit, ...requestInit })) {
      if (!supportedKeys.has(key)) {
        return false;
      }
    }

    const internalHeaders = new Set<string>(Object.values(HEADER_NAMES));
    for (const header of Object.keys(merged.headers)) {
      if (!internalHeaders.has(header.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  /** Fetch via Shopify partial rendering when configured, otherwise fall back to the base behaviour. */
  async fetch(url: URL | string = this.url, requestInit: RequestInit = {}): Promise<void> {
    const normalizedUrl = url instanceof URL ? url : new URL(url, window.location.href);
    const names = this.partialNames;
    const partials =
      names.length && this.canUsePartials(requestInit) ? await this.resolvePartials() : null;

    if (!partials) {
      return super.fetch(normalizedUrl, requestInit);
    }

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
      const update = await partials.fetch(...names, {
        url: normalizedUrl.toString(),
        signal: init.signal ?? undefined,
      });
      this.$emit(FETCH_EVENTS.AFTER_FETCH, {
        instance: this,
        url: normalizedUrl,
        requestInit: init,
        content: update,
      });
      // Fire-and-forget the apply phase, matching the base `Fetch.fetch`
      // lifecycle: an `apply()` failure must not be misattributed to the
      // fetch phase and re-emit `AFTER_FETCH` a second time.
      void this.applyPartials(normalizedUrl, init, update, partials);
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
   * Apply the partials update to the DOM. Kept separate from the base
   * {@link Fetch.update}, which is still used verbatim on the fallback
   * path: on the partials path, `partials.apply` owns DOM swapping, View
   * Transitions and focus/selection/form/scroll preservation, so no
   * fragment parsing happens here.
   */
  async applyPartials(
    url: URL,
    requestInit: RequestInit,
    update: unknown,
    partials: PartialsApi,
  ): Promise<void> {
    const { history } = this.$options;

    this.$emit(FETCH_EVENTS.BEFORE_UPDATE, { instance: this, url, requestInit, content: update });

    if (history) {
      if (
        (requestInit.headers as Record<string, string> | undefined)?.[
          HEADER_NAMES.X_TRIGGERED_BY
        ] !== 'popstate'
      ) {
        historyPush({ path: url.pathname, search: url.searchParams });
      }
    }

    this.$emit(FETCH_EVENTS.UPDATE, { instance: this, url, requestInit, update });

    await partials.apply(update);

    this.$emit(FETCH_EVENTS.AFTER_UPDATE, { instance: this, url, requestInit, update });
  }
}
