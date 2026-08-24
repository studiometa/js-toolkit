import type { BaseConfig, BaseProps } from '../../src/index.js';
import { AbstractFigure, type AbstractFigureProps } from './AbstractFigure.js';

export type FigureProps = AbstractFigureProps;

/**
 * Concrete lazy-loaded image figure built on `AbstractFigure`. It loads the
 * `data-src` source when the element scrolls into view, running the enter
 * transition and emitting `load` once it is ready.
 *
 * v3's `onLoad()` called `$terminate()`, since it has no further work to do
 * after the reveal — v4 has no termination (the `LazyInclude` port hit the
 * same gap). It needs none here either: `AbstractFigure.mounted()` only
 * loads when `src !== this.src`, which is already false once loaded, so a
 * later remount (the `in-view` strategy can trigger one) is a no-op on its
 * own.
 *
 * @link https://ui.studiometa.dev/reference/items/Figure/
 */
export class Figure<T extends BaseProps = BaseProps> extends AbstractFigure<T> {
  static config: BaseConfig = {
    ...AbstractFigure.config,
    name: 'Figure',
  };
}
