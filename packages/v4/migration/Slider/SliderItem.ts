import { Base, useRaf, useResize, type MountedReturn } from '../../src/index.js';
import { damp } from '../utils/math.js';
import { uid } from '../utils/uid.js';

export interface SliderItemRect {
  x: number;
  width: number;
}

/**
 * SliderItem — one slide.
 *
 * Port of @studiometa/ui 1.10's `SliderItem`. It caches its position for the
 * Slider's arithmetic and translates itself along the x axis, instantly or
 * with a damped animation.
 *
 * v3 drove the animation with `this.$services.enable('ticked')` /
 * `disable('ticked')`, toggling the shared RAF service per item. v4 has no
 * such switch: `withRaf` subscribes for the whole mount cycle. The
 * subscription is therefore taken and released by hand — which is the same
 * behaviour, and arguably clearer, but it is a hook the mixin cannot give.
 */
export class SliderItem extends Base {
  static config = { name: 'SliderItem' };

  readonly id = uid('slider-item');

  /** Target position. */
  x = 0;

  /** Smoothed position. */
  dampedX = 0;

  #rect: SliderItemRect | null = null;

  #unsubscribeFrame: (() => void) | null = null;

  /**
   * Position and width of the slide as if it were untranslated.
   *
   * Invalidated by the resize service instead of by v3's `resized()` hook
   * plus a `shouldEvaluateRect` flag: a `ResizeObserver` reports the current
   * size on subscribe, so there is no first-resize gap to work around.
   */
  get rect(): SliderItemRect {
    if (!this.#rect) {
      const rect = this.$el.getBoundingClientRect();
      this.#rect = { x: rect.left - this.dampedX, width: rect.width };
    }
    return this.#rect;
  }

  mounted(): MountedReturn {
    this.$el.setAttribute('role', 'group');
    this.$el.setAttribute('aria-roledescription', 'slide');
    this.$el.setAttribute('aria-label', this.id);

    return [
      useResize().add(() => {
        this.#rect = null;
      }),
      () => this.#stopTicking(),
    ];
  }

  destroyed(): void {
    this.moveInstantly(0);
  }

  activate(): void {
    this.$el.classList.add('is-active');
  }

  disactivate(): void {
    this.$el.classList.remove('is-active');
  }

  /** Move with inertia. */
  move(targetPosition: number): void {
    this.x = targetPosition;
    this.#startTicking();
  }

  /** Move now, no animation. */
  moveInstantly(targetPosition: number): void {
    this.x = targetPosition;
    this.dampedX = targetPosition;
    this.$write(() => this.render());
  }

  render(): void {
    this.$el.style.transform = `translate3d(${this.dampedX}px, 0px, 0px)`;
  }

  #startTicking(): void {
    this.#unsubscribeFrame ??= useRaf().add(() => {
      this.dampedX = damp(this.x, this.dampedX, 0.1, 0.00001);
      if (this.dampedX === this.x) {
        this.#stopTicking();
      }
      return () => this.render();
    });
  }

  #stopTicking(): void {
    this.#unsubscribeFrame?.();
    this.#unsubscribeFrame = null;
  }
}
