import type { BaseConfig, BaseProps } from '../../src/index.js';
import { AbstractFigureDynamic, type AbstractFigureDynamicProps } from './AbstractFigureDynamic.js';
import { normalizeSize } from './utils.js';

export type FigureShopifyProps = AbstractFigureDynamicProps & {
  $options: AbstractFigureDynamicProps['$options'] & {
    crop?: 'top' | 'left' | 'right' | 'bottom' | 'center';
  };
};

/**
 * Dynamic image figure that rewrites its source for the Shopify CDN,
 * sized to the rendered element.
 *
 * @link https://shopify.dev/docs/api/liquid/filters/image_url
 * @link https://ui.studiometa.dev/reference/items/FigureShopify/
 */
export class FigureShopify<T extends BaseProps = BaseProps> extends AbstractFigureDynamic<
  FigureShopifyProps & T
> {
  static config: BaseConfig = {
    ...AbstractFigureDynamic.config,
    name: 'FigureShopify',
    options: {
      ...AbstractFigureDynamic.config.options,
      crop: String,
    },
  };

  /** Format the source for Shopify CDN API. */
  formatSrc(src: string): string {
    const { crop, step } = this.$options;

    const url = new URL(src, 'https://localhost');
    const width = normalizeSize(this.$refs.img.offsetWidth, step) * window.devicePixelRatio;
    const height = normalizeSize(this.$refs.img.offsetHeight, step) * window.devicePixelRatio;

    url.searchParams.set('width', String(width));
    url.searchParams.set('height', String(height));

    if (crop) {
      url.searchParams.set('crop', crop);
    }

    return url.toString();
  }
}
