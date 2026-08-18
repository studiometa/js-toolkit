import {
  Base,
  component,
  withPointer,
  write,
  type BaseProps,
  type MountedReturn,
  type PointerProps,
} from '../../src/index.js';
import { smoothTo, type SmoothToRecord } from '../../src/utils/smoothTo.js';
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
 * `$services` to bind the pointer and the frame loop. This port declares only
 * the pointer, because `smoothTo()` owns the other half: three named channels
 * on one frame subscription, each with its own rate, started when the pointer
 * moves and released the moment the cursor has caught up. v3 spells that
 * `$services.enable`/`disable('ticked')`, and this port used to spell it
 * `withRaf(..., { manual: true })` plus a hand-written `ticked()`.
 *
 * @link https://ui.studiometa.dev/reference/items/Cursor/
 */
@component({
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
})
export class Cursor<T extends BaseProps = BaseProps> extends withPointer(Base)<CursorProps & T> {
  /**
   * The three smoothed channels. `scale` damps at its own rate **and** by the
   * direction it travels, which is why the factor is a function rather than a
   * number: it is read per frame, per channel.
   */
  motion: SmoothToRecord<'x' | 'y' | 'scale'> = smoothTo(
    { x: 0, y: 0, scale: 0 },
    {
      damping: (key): number => {
        const { translateDampFactor, growDampFactor, shrinkDampFactor } = this.$options;
        if (key !== 'scale') {
          return translateDampFactor;
        }
        return this.motion.raw().scale < this.motion().scale ? shrinkDampFactor : growDampFactor;
      },
    },
  );

  /**
   * A mixin binds its subscription from `mounted()` and returns the release,
   * so a component that mixes one in **must** chain `super.mounted()`. v3's
   * `$services` sits outside the hook and forgives the omission; v4 silently
   * subscribes to nothing.
   */
  mounted(): MountedReturn {
    // A remount starts from rest: `jump()` moves the value and its target
    // together, so nothing animates back from where the last cycle left it.
    this.render(this.motion.jump({ x: 0, y: 0, scale: 0 }));

    return [
      super.mounted(),
      this.motion.subscribe((values: Record<'x' | 'y' | 'scale', number>) => this.render(values)),
      // The frame belongs to the mount cycle: a cursor destroyed mid-travel
      // must not keep asking for frames to finish a journey nobody watches.
      () => this.motion.destroy(),
    ];
  }

  /** Follow the pointer and decide the scale it is heading to. */
  moved({ event, x, y, isDown }: PointerProps): void {
    // Annotated rather than inferred: this class is generic in its props, so
    // each option reads as a deferred indexed access and two of them do not
    // measure as one type.
    let scale: number = this.$options.scale;

    if (!event) {
      this.motion({ x, y, scale });
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

    this.motion({ x, y, scale });
  }

  /**
   * A frame subscriber runs in the scheduler's **read** phase — that is where
   * `useRaf()` fans out, so that a measurement can precede the writes of the
   * same frame. This method only mutates, so it belongs in the write phase,
   * and a write scheduled from a read runs in the same frame: no latency, and
   * no style write landing between two components' measurements.
   */
  @write
  render({
    x,
    y,
    scale,
  }: {
    readonly x: number;
    readonly y: number;
    readonly scale: number;
  }): void {
    this.$el.style.transform = `translateZ(0) ${matrix({
      translateX: x,
      translateY: y,
      scaleX: scale,
      scaleY: scale,
    })}`;
  }
}
