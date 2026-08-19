import { withResize, type BaseConfig, type BaseProps } from '../../src/index.js';
import { loadImage } from '../../src/utils/load.js';
import { AbstractFigure, type AbstractFigureProps } from './AbstractFigure.js';

/** Gap: core ships no `$warn`. */
function warn(...args: unknown[]): void {
  console.warn('[Figure]', ...args);
}

export type AbstractFigureDynamicProps = AbstractFigureProps & {
  $options: AbstractFigureProps['$options'] & { disable: boolean; step: number };
};

/**
 * Shared base for figures whose source is computed at runtime from the
 * element's rendered size. It extends `AbstractFigure`, defaults the `lazy`
 * option to `true`, and passes the original `data-src` through the
 * overridable `formatSrc` method, unless the `disable` option is set. Its
 * own `formatSrc` returns the source unchanged, so subclasses provide the
 * actual transformation, and on resize it recomputes and reloads the
 * source.
 */
export class AbstractFigureDynamic<T extends BaseProps = BaseProps> extends withResize(
  AbstractFigure,
)<AbstractFigureDynamicProps & T> {
  static config: BaseConfig = {
    ...AbstractFigure.config,
    name: 'AbstractFigureDynamic',
    options: {
      ...AbstractFigure.config.options,
      disable: Boolean,
      step: { type: Number, default: 50 },
      lazy: { type: Boolean, default: true },
    },
  };

  /** The formatted source, or the original based on the `disable` option. */
  get original(): string {
    return this.$options.disable ? super.original : this.formatSrc(super.original);
  }

  /** Format the source with dynamic parameters. */
  formatSrc(src: string): string {
    return src;
  }

  /** Reassign the source from the original on resize. */
  async resized(): Promise<void> {
    const { original } = this;

    try {
      await loadImage(original);
    } catch {
      warn(`Failed to load image "${original}".`);
      return;
    }

    this.src = original;
  }
}
