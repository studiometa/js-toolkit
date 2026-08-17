import { type BaseConfig, type BaseProps } from '../../src/index.js';
import { Fetch, type FetchProps } from './Fetch.js';

/** The Section Rendering API query parameter name. */
export const SECTIONS_PARAMETER = 'sections';

/** The `response` option value the base class ships, and the one this replaces. */
const DEFAULT_RESPONSE = (Fetch.config.options?.response as { default: string }).default;

export type FetchShopifySectionProps = FetchProps & {
  $options: FetchProps['$options'] & {
    sections: string;
  };
};

/**
 * Adapts {@link Fetch} to Shopify's
 * [Section Rendering API](https://shopify.dev/docs/api/ajax/section-rendering).
 *
 * The section IDs are declared through the `sections` option instead of being
 * baked into the URL, so the element's own `href`/`action` stays a clean,
 * no-JS fallback. The JSON response (`{ [id]: html }`) is unwrapped by
 * {@link parseResponse} and each section is swapped in place by the inherited
 * `[id]` selector. With no `sections` configured the component degrades to the
 * base {@link Fetch} behaviour.
 *
 * @link https://ui.studiometa.dev/reference/items/FetchShopifySection/
 */
export class FetchShopifySection<T extends BaseProps = BaseProps> extends Fetch<
  FetchShopifySectionProps & T
> {
  /**
   * The config no longer spreads `Fetch.config`: configs merge along the
   * prototype chain (#627), so only what this class adds is restated.
   */
  static config: BaseConfig = {
    name: 'FetchShopifySection',
    options: {
      sections: String,
    },
  };

  /** The configured section IDs, trimmed and empty-filtered. */
  get sectionIds(): string[] {
    return this.$options.sections
      .split(',')
      .map((section) => section.trim())
      .filter(Boolean);
  }

  /** Append the configured section IDs, leaving the URL otherwise untouched. */
  protected appendSections(url: URL): URL {
    const { sectionIds } = this;

    if (sectionIds.length) {
      url.searchParams.set(SECTIONS_PARAMETER, sectionIds.join(','));
    }

    return url;
  }

  get url(): URL {
    return this.appendSections(super.url);
  }

  /**
   * Ensure the `sections` parameter is on every request URL, including the
   * already-clean one the inherited `onWindowPopstate()` replays — which
   * bypasses the `url` getter and would otherwise ask for HTML.
   */
  fetch(url: URL | string = this.url, requestInit: RequestInit = {}): Promise<void> {
    const normalizedUrl = url instanceof URL ? url : new URL(url, window.location.href);
    return super.fetch(this.appendSections(normalizedUrl), requestInit);
  }

  /**
   * Unwrap the Section Rendering JSON response (`{ [id]: html }`) into one HTML
   * string, dropping sections returned as `null`.
   *
   * Skipped — deferring to the base implementation, which evaluates the
   * `response` option — when no sections are configured, or when the caller
   * supplied their own `response` option.
   */
  async parseResponse(response: Response, url: URL, requestInit: RequestInit): Promise<string> {
    const { response: responseOption } = this.$options;

    if (!this.sectionIds.length || responseOption !== DEFAULT_RESPONSE) {
      return super.parseResponse(response, url, requestInit);
    }

    const parsed = (await response.json()) as Record<string, string | null>;
    return Object.values(parsed).filter(Boolean).join('');
  }

  /**
   * Strip the `sections` parameter before the base update, so the URL pushed
   * to the history is the human-facing page and not the raw endpoint.
   */
  update(url: URL, requestInit: RequestInit, content: string): Promise<void> {
    const displayUrl = new URL(url);
    displayUrl.searchParams.delete(SECTIONS_PARAMETER);
    return super.update(displayUrl, requestInit, content);
  }
}
