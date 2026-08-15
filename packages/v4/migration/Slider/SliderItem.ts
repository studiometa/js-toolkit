import { Base, useRaf, useResize, type MountedReturn } from '../../src/index.js';
import { damp } from '../../src/utils/maths.js';
import { uid } from '../utils/uid.js';

export interface SliderItemRect {
  x: number;
  width: number;
}

/** One slide with cached geometry and damped horizontal movement. */
export class SliderItem extends Base {
  static config = { name: 'SliderItem' };

  readonly id = uid('slider-item');

  /** Target position. */
  x = 0;

  /** Smoothed position. */
  dampedX = 0;

  #rect: SliderItemRect | null = null;

  #unsubscribeFrame: (() => void) | null = null;

  /** Position and width as if the slide were untranslated. */
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
      useResize().subscribe(() => {
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
    this.#unsubscribeFrame ??= useRaf().subscribe(({ delta }) => {
      this.dampedX = damp(this.x, this.dampedX, 0.1, delta, 0.00001);
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
