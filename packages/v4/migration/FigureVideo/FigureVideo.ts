import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';
import { loadImage } from '../../src/utils/load.js';
import {
  enterTransition,
  leaveTransition,
  TRANSITION_OPTIONS,
  type TransitionOptions,
} from '../../src/utils/transition.js';
import type { Transitionable } from '../Transition/index.js';

/** Gap: core ships no `$warn`. */
function warn(...args: unknown[]): void {
  console.warn('[FigureVideo]', ...args);
}

export type FigureVideoProps = BaseProps & {
  $refs: { video: HTMLVideoElement };
  $options: TransitionOptions & { lazy: boolean };
  $emits: {
    'transition-enter': void;
    'transition-enter-start': void;
    'transition-enter-end': void;
    'transition-leave': void;
    'transition-leave-start': void;
    'transition-leave-end': void;
    load: void;
  };
};

/**
 * Lazy-loaded video counterpart to `Figure`. Implementing `Transitionable`
 * directly (the same reason `AbstractFigure` does, rather than extending
 * the ported `Transition`) and mounting through the `in-view` strategy, it
 * defers loading of the `video` ref's `data-poster` and `data-src` sources
 * until the element enters the viewport when `lazy` is set, runs the enter
 * transition, and emits `load`.
 *
 * @link https://ui.studiometa.dev/reference/items/FigureVideo/
 */
export class FigureVideo<T extends BaseProps = BaseProps>
  extends Base<FigureVideoProps & T>
  implements Transitionable
{
  static config: BaseConfig = {
    name: 'FigureVideo',
    refs: ['video'],
    mountStrategy: 'in-view',
    options: {
      ...TRANSITION_OPTIONS,
      lazy: Boolean,
    },
  };

  state: 'entering' | 'leaving' | null = null;

  /**
   * Whether the sources have already been loaded, so a later mount (the
   * `in-view` strategy can trigger one) does not repeat it. v3 called
   * `$terminate()` from `onLoad()` for this; v4 has no termination (the
   * `Figure` and `LazyInclude` ports hit the same gap), and unlike `Figure`
   * this component has no naturally idempotent check to fall back on —
   * `load()` always reassigns every source — so the flag is load-bearing
   * here, not just documentation.
   */
  hasLoaded = false;

  get target(): HTMLVideoElement {
    return this.$refs.video;
  }

  get sources(): HTMLSourceElement[] {
    return [...this.$refs.video.querySelectorAll('source')];
  }

  async enter(): Promise<void> {
    this.state = 'entering';
    this.$emit('transition-enter');
    this.$emit('transition-enter-start');
    await enterTransition(this.target, this.$options);
    this.$emit('transition-enter-end');
  }

  async leave(): Promise<void> {
    this.state = 'leaving';
    this.$emit('transition-leave');
    this.$emit('transition-leave-start');
    await leaveTransition(this.target, this.$options);
    this.$emit('transition-leave-end');
  }

  toggle(): Promise<void> {
    return this.state === 'entering' ? this.leave() : this.enter();
  }

  /** Load the poster onto the video element. */
  async loadPoster(): Promise<void> {
    const { video } = this.$refs;

    if (!video.dataset.poster) {
      return;
    }

    try {
      await loadImage(video.dataset.poster);
      video.poster = video.dataset.poster;
    } catch {
      warn(`Failed to load poster "${video.dataset.poster}".`);
    }
  }

  /** Load every `<source>`'s `data-src` and wait for the video to have data. */
  loadSources(): Promise<void> {
    const { video } = this.$refs;

    for (const source of this.sources) {
      if (source.dataset.src) {
        source.src = source.dataset.src;
      }
    }

    return new Promise<void>((resolve) => {
      video.addEventListener(
        'loadeddata',
        () => {
          resolve();
        },
        { once: true },
      );
      video.load();
    });
  }

  load(): Promise<[void, void]> {
    return Promise.all([this.loadPoster(), this.loadSources()]);
  }

  /** Load on mount, once per element while lazy is set. */
  async mounted(): Promise<void> {
    const { video } = this.$refs;

    if (!video || !(video instanceof HTMLVideoElement)) {
      warn('The `video` ref is missing or not a `<video>` element.');
      return;
    }

    if (!this.$options.lazy || this.hasLoaded) {
      return;
    }

    await this.load();
    await this.enter();
    this.hasLoaded = true;
    this.$emit('load');
  }
}
