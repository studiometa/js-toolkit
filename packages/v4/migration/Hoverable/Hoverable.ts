import {
  Base,
  component,
  withPointer,
  withRaf,
  type BaseProps,
  type ElementPointerProps,
  type RafProps,
} from '../../src/index.js';
import { getOffsetSizes } from '../../src/utils/dom.js';
import { clamp01, damp, map } from '../../src/utils/maths.js';
import { transform } from '../../src/utils/transform.js';

export interface HoverableBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export type HoverableProps = BaseProps & {
  $refs: { target: HTMLElement };
  $options: {
    /** A number in `0–1` that smoothens the transition between each position. */
    sensitivity: number;
    /** Reverse the movement of the target. */
    reversed: boolean;
    /** Stop moving the target once the pointer leaves the root element. */
    contained: boolean;
  };
};

/**
 * Moves a `target` ref in response to the pointer's position over the root
 * element. The target is mapped across its available bounds and damped each
 * frame by the `sensitivity` option; `reversed` inverts the movement and
 * `contained` stops it once the pointer leaves the element.
 *
 * @link https://ui.studiometa.dev/reference/items/Hoverable/
 */
@component({
  name: 'Hoverable',
  refs: ['target'],
  options: {
    sensitivity: { type: Number, default: 0.1 },
    reversed: Boolean,
    contained: Boolean,
  },
})
export class Hoverable<T extends BaseProps = BaseProps> extends withRaf(withPointer(Base))<
  HoverableProps & T
> {
  props = {
    x: 0,
    y: 0,
    dampedX: 0,
    dampedY: 0,
  };

  /** The hoverable element, defaults to `this.$refs.target`. */
  get target(): HTMLElement {
    return this.$refs.target;
  }

  /** The bounding element, defaults to `this.$el`. */
  get parent(): HTMLElement {
    return this.$el;
  }

  /** The bounds in which the target can move. */
  get bounds(): HoverableBounds {
    const targetSizes = getOffsetSizes(this.target);
    const parentSizes = getOffsetSizes(this.parent);
    const xMin = targetSizes.x - parentSizes.x;
    const yMin = targetSizes.y - parentSizes.y;
    const xMax = xMin + targetSizes.width - parentSizes.width;
    const yMax = yMin + targetSizes.height - parentSizes.height;

    return {
      yMin: yMin * -1,
      yMax: yMax * -1,
      xMin: xMin * -1,
      xMax: xMax * -1,
    };
  }

  moved({ relativeProgressX, relativeProgressY }: ElementPointerProps): void {
    const { bounds, props } = this;
    const { reversed, contained } = this.$options;

    // Stop updating when the pointer is outside the parent bounds.
    if (
      contained &&
      (relativeProgressY < 0 ||
        relativeProgressX < 0 ||
        relativeProgressY > 1 ||
        relativeProgressX > 1)
    ) {
      return;
    }

    const from = reversed ? 1 : 0;
    const to = reversed ? 0 : 1;

    props.y = map(clamp01(relativeProgressY), from, to, bounds.yMin, bounds.yMax);
    props.x = map(clamp01(relativeProgressX), from, to, bounds.xMin, bounds.xMax);
  }

  ticked({ delta }: RafProps): void {
    const { props, target } = this;
    const { sensitivity } = this.$options;
    props.dampedY = damp(props.y, props.dampedY, sensitivity, delta);
    props.dampedX = damp(props.x, props.dampedX, sensitivity, delta);

    this.$write(() => {
      target.style.transform = transform({ x: props.dampedX, y: props.dampedY });
    });
  }
}
