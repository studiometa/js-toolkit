import {
  Base,
  withPointer,
  withRaf,
  type BaseConfig,
  type BaseProps,
  type MountedReturn,
  type PointerProps,
  type RafProps,
} from '../../src/index.js';
import { damp } from '../../src/utils/maths.js';
import { matrix } from '../../src/utils/transform.js';

export type CursorProps = BaseProps & {
  $options: {
    growSelectors: string;
    shrinkSelectors: string;
    scale: number;
    growTo: number;
    shrinkTo: number;
    translateDampFactor: number;
    growDampFactor: number;
    shrinkDampFactor: number;
  };
};

/**
 * A custom cursor that follows the pointer, damping its position each frame
 * for a smooth trail. It grows over elements matching `growSelectors` and
 * shrinks over `shrinkSelectors` or while the pointer is down, interpolating
 * between the `scale`, `growTo` and `shrinkTo` factors.
 *
 * v3 declares neither service: `moved()` and `ticked()` are enough for its
 * `$services` to bind the pointer and the frame loop. v4 asks for both by
 * name, and `withRaf(..., { manual: true })` is what lets the loop stop the
 * moment the cursor has caught up — v3 spells that `$services.disable`.
 *
 * @link https://ui.studiometa.dev/reference/items/Cursor/
 */
export class Cursor<T extends BaseProps = BaseProps> extends withRaf(withPointer(Base), {
  manual: true,
})<CursorProps & T> {
  static config: BaseConfig = {
    name: 'Cursor',
    options: {
      growSelectors: {
        type: String,
        default: 'a, a *, button, button *, [data-cursor-grow], [data-cursor-grow] *',
      },
      shrinkSelectors: {
        type: String,
        default: '[data-cursor-shrink], [data-cursor-shrink] *',
      },
      scale: { type: Number, default: 1 },
      growTo: { type: Number, default: 2 },
      shrinkTo: { type: Number, default: 0.5 },
      translateDampFactor: { type: Number, default: 0.25 },
      growDampFactor: { type: Number, default: 0.25 },
      shrinkDampFactor: { type: Number, default: 0.25 },
    },
  };

  x = 0;

  y = 0;

  scale = 0;

  pointerX = 0;

  pointerY = 0;

  pointerScale = 0;

  /**
   * A mixin binds its subscription from `mounted()` and returns the release,
   * so a component that mixes one in **must** chain `super.mounted()`. v3's
   * `$services` sits outside the hook and forgives the omission; v4 silently
   * subscribes to nothing.
   */
  mounted(): MountedReturn {
    this.x = 0;
    this.y = 0;
    this.scale = 0;
    this.pointerX = 0;
    this.pointerY = 0;
    this.pointerScale = 0;
    this.render({ x: this.x, y: this.y, scale: this.scale });
    return super.mounted();
  }

  /** Follow the pointer and decide the scale it is heading to. */
  moved({ event, x, y, isDown }: PointerProps): void {
    this.$services.ticked.start();

    this.pointerX = x;
    this.pointerY = y;

    let { scale } = this.$options;

    if (!event) {
      this.pointerScale = scale;
      return;
    }

    const { target } = event;
    const shouldGrow = target instanceof Element && target.matches(this.$options.growSelectors);
    const shouldReduce =
      isDown || (target instanceof Element && target.matches(this.$options.shrinkSelectors));

    if (shouldGrow) {
      scale = this.$options.growTo;
    }

    if (shouldReduce) {
      scale = this.$options.shrinkTo;
    }

    this.pointerScale = scale;
  }

  /** Close the gap, then stop the loop once there is none left. */
  ticked({ delta }: RafProps): void {
    const { translateDampFactor, shrinkDampFactor, growDampFactor } = this.$options;

    this.x = damp(this.pointerX, this.x, translateDampFactor, delta);
    this.y = damp(this.pointerY, this.y, translateDampFactor, delta);
    this.scale = damp(
      this.pointerScale,
      this.scale,
      this.pointerScale < this.scale ? shrinkDampFactor : growDampFactor,
      delta,
    );

    this.render({ x: this.x, y: this.y, scale: this.scale });

    if (this.x === this.pointerX && this.y === this.pointerY && this.scale === this.pointerScale) {
      this.$services.ticked.stop();
    }
  }

  render({ x, y, scale }: { x: number; y: number; scale: number }): void {
    this.$el.style.transform = `translateZ(0) ${matrix({
      translateX: x,
      translateY: y,
      scaleX: scale,
      scaleY: scale,
    })}`;
  }
}
