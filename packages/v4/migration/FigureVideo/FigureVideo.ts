import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';
import { loadImage } from '../../src/utils/load.js';
import { withTransition, type TransitionProps } from '../Transition/index.js';

export type FigureVideoProps = BaseProps &
  TransitionProps & {
    $refs: { video: HTMLVideoElement };
    $options: TransitionProps['$options'] & { lazy: boolean };
    $emits: TransitionProps['$emits'] & { load: void };
  };

/**
 * Lazy-loaded video counterpart to `Figure`. Mixing in `withTransition`
 * (whose `target` it overrides onto the `video` ref, as `AbstractFigure`
 * does onto its `img`) and mounting through the `in-view` strategy, it
 * defers loading of the `video` ref's `data-poster` and `data-src` sources
 * until the element enters the viewport when `lazy` is set, runs the enter
 * transition, and emits `load`.
 *
 * @link https://ui.studiometa.dev/reference/items/FigureVideo/
 */
export class FigureVideo<T extends BaseProps = BaseProps> extends withTransition(Base)<
  FigureVideoProps & T
> {
  static config: BaseConfig = {
    name: 'FigureVideo',
    refs: ['video'],
    mountStrategy: 'in-view',
    options: {
      lazy: Boolean,
    },
  };

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

  /** Load the poster onto the video element. */
  async loadPoster(): Promise<void> {
    const { video } = this.$refs;

    if (!video.dataset.poster) {
      return;
    }

    try {
      await loadImage(video.dataset.poster);
      video.poster = video.dataset.poster;
    } catch (error) {
      this.$error(
        'figure-video.poster-load-failed',
        `Failed to load poster "${video.dataset.poster}".`,
        error,
      );
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

    /**
     * Settled by either outcome, deliberately.
     *
     * v3 waits on `loadeddata` alone, so a video whose sources all fail never
     * settles at all — and because `mounted()` awaits it, the component then
     * never reaches its enter transition, its `load` event or `hasLoaded`. A
     * media error is a real outcome and has to end the wait.
     */
    return new Promise<void>((resolve, reject) => {
      const settle = (handler: () => void) => {
        video.removeEventListener('loadeddata', onLoaded);
        video.removeEventListener('error', onError);
        handler();
      };
      const onLoaded = () => settle(resolve);
      const onError = () =>
        settle(() => reject(new Error(`Failed to load the sources of "${video.currentSrc}".`)));

      video.addEventListener('loadeddata', onLoaded, { once: true });
      video.addEventListener('error', onError, { once: true });
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
      this.$warn(
        'figure-video.invalid-ref',
        'The `video` ref is missing or not a `<video>` element.',
      );
      return;
    }

    if (!this.$options.lazy || this.hasLoaded) {
      return;
    }

    try {
      await this.load();
    } catch (error) {
      // Reported and left un-loaded, so a later mount cycle retries rather
      // than the component hanging on a promise that never settles.
      this.$error('figure-video.load-failed', 'Failed to load the video.', error);
      return;
    }

    await this.enter();
    this.hasLoaded = true;
    this.$emit('load');
  }
}
