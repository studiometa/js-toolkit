import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';
import { loadLink } from '../../src/utils/load.js';

export type AbstractPrefetchProps = BaseProps & {
  $el: HTMLAnchorElement;
  $options: {
    prefetch: boolean;
  };
  $emits: {
    prefetched: { url: URL };
  };
};

/**
 * Shared base for the prefetch components, bound to an anchor element. It
 * injects a `<link rel="prefetch">` for the anchor's `href` when the URL is
 * prefetchable — same-origin, not the current page, and not disabled by the
 * `prefetch` option — and emits `prefetched`. Subclasses decide when
 * `prefetch()` is called.
 *
 * @link https://ui.studiometa.dev/reference/items/Prefetch/
 */
export class AbstractPrefetch<T extends BaseProps = BaseProps> extends Base<
  AbstractPrefetchProps & T
> {
  static config: BaseConfig = {
    name: 'AbstractPrefetch',
    options: {
      prefetch: {
        type: Boolean,
        default: true,
      },
    },
  };

  /** The URL to prefetch, or `null` for an anchor with no destination. */
  get url(): URL | null {
    const { href } = this.$el;
    return href ? new URL(href) : null;
  }

  /** Is the URL worth a hint? */
  get isPrefetchable(): boolean {
    const { url } = this;

    if (!url?.href) {
      return false;
    }

    if (!this.$options.prefetch) {
      return false;
    }

    if (url.origin !== window.location.origin) {
      return false;
    }

    if (url.href === window.location.href) {
      return false;
    }

    if (
      url.hash &&
      url.pathname + url.search === window.location.pathname + window.location.search
    ) {
      return false;
    }

    return true;
  }

  /**
   * Hint the URL.
   *
   * `loadLink()` owns the whole of v3's body: it builds the element, appends
   * it to `<head>`, settles on the load event and deduplicates by resolved URL
   * **and** `rel`, which is what v3's `static prefetchedUrls` set was for.
   *
   * The guard order is reversed against v3, which reads `url.href` before
   * asking whether the URL exists and therefore throws on an `<a>` with no
   * `href` — a real v3 defect, and the spec below is the one that found it.
   */
  prefetch(): void {
    if (!this.isPrefetchable) {
      return;
    }

    const url = this.url as URL;

    void loadLink(url.href, { rel: 'prefetch' }).then(() => {
      if (this.$isMounted) {
        this.$emit('prefetched', { url });
      }
    });
  }
}
