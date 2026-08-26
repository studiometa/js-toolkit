import type { BaseConfig, BaseProps } from '../../src/index.js';
import {
  withLeadingSlash,
  withoutLeadingSlash,
  withoutTrailingSlash,
} from '../../src/utils/strings.js';
import { AbstractFigureDynamic, type AbstractFigureDynamicProps } from './AbstractFigureDynamic.js';
import { normalizeSize } from './utils.js';

export type FigureTwicpicsProps = AbstractFigureDynamicProps & {
  $options: AbstractFigureDynamicProps['$options'] & {
    transform: string;
    domain: string;
    path: string;
    mode: string;
    dpr: boolean;
  };
};

/** Whether the user agent is a bot. */
const isBot = /bot|crawl|slurp|spider/i.test(navigator.userAgent);

/**
 * Dynamic image figure that rewrites its source into a TwicPics URL sized to
 * the rendered element. Its `formatSrc` injects a `twic` query built from
 * the `domain`, `path`, `transform` and `mode` options and the measured
 * dimensions, multiplied by the device pixel ratio unless `dpr` is disabled
 * or a bot is detected.
 *
 * @link https://ui.studiometa.dev/reference/items/FigureTwicpics/
 */
export class FigureTwicpics<T extends BaseProps = BaseProps> extends AbstractFigureDynamic<
  FigureTwicpicsProps & T
> {
  static config: BaseConfig = {
    ...AbstractFigureDynamic.config,
    name: 'FigureTwicpics',
    options: {
      ...AbstractFigureDynamic.config.options,
      transform: String,
      domain: String,
      path: String,
      mode: { type: String, default: 'cover' },
      dpr: { type: Boolean, default: true },
    },
  };

  /** The TwicPics path. */
  get path(): string {
    return withoutTrailingSlash(withoutLeadingSlash(this.$options.path));
  }

  /** The TwicPics domain. */
  get domain(): string {
    return this.$options.domain || new URL(this.$refs.img.dataset.src ?? '').host;
  }

  /**
   * The current device pixel ratio. `1` for a bot, and `1` when `dpr` is
   * disabled (`data-option-no-dpr`, since it defaults `true`).
   */
  get devicePixelRatio(): number {
    if (!this.$options.dpr || isBot) {
      return 1;
    }

    return window.devicePixelRatio;
  }

  /** Format the source for TwicPics. */
  formatSrc(src: string): string {
    const { transform, mode, step } = this.$options;

    const url = new URL(src, 'https://localhost');
    url.host = this.domain;
    url.port = '';

    if (this.path && !url.pathname.startsWith(withLeadingSlash(this.path))) {
      url.pathname = `/${this.path}${url.pathname}`;
    }

    const width = normalizeSize(this.$refs.img.offsetWidth, step) * this.devicePixelRatio;
    const height = normalizeSize(this.$refs.img.offsetHeight, step) * this.devicePixelRatio;

    url.searchParams.set(
      'twic',
      ['v1', transform, `${mode}=${width}x${height}`].filter(Boolean).join('/'),
    );

    url.search = decodeURIComponent(url.search);

    return url.toString();
  }
}
