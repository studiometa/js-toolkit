import {
  Base,
  component,
  DRAG_MODES,
  withDrag,
  withRaf,
  withResize,
  type BaseProps,
  type DragProps,
  type MountedReturn,
  type RafProps,
} from '../../src/index.js';
import { getOffsetSizes } from '../../src/utils/dom.js';
import { clamp, damp, INERTIA_FRAME, map } from '../../src/utils/maths.js';
import { transform } from '../../src/utils/transform.js';

/** The position the component publishes on every event it emits. */
export interface DraggablePosition {
  x: number;
  y: number;
  progressX: number;
  progressY: number;
  originX: number;
  originY: number;
  dampedX: number;
  dampedY: number;
}

interface Bounds {
  yMin: number;
  yMax: number;
  xMin: number;
  xMax: number;
}

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type DraggableProps = BaseProps & {
  $refs: {
    target: HTMLElement;
  };
  $options: {
    x: boolean;
    y: boolean;
    fitBounds: boolean;
    strictFitBounds: boolean;
    sensitivity: number;
    dropSensitivity: number;
    margin: string;
  };
  $emits: {
    'drag-start': DraggablePosition;
    'drag-drag': DraggablePosition;
    'drag-drop': DraggablePosition;
    'drag-inertia': DraggablePosition;
    'drag-stop': DraggablePosition;
    'drag-fit': DraggablePosition;
    'drag-render': DraggablePosition;
  };
};

/**
 * Makes a `target` ref draggable within its parent element. Dragging can be
 * constrained to the `x` and/or `y` axes, is damped through `sensitivity` and
 * `dropSensitivity`, and the target can be kept inside the parent bounds plus
 * a configurable `margin`.
 *
 * @link https://ui.studiometa.dev/reference/items/Draggable/
 */
@component({
  name: 'Draggable',
  refs: ['target'],
  options: {
    x: { type: Boolean, default: true },
    y: { type: Boolean, default: true },
    fitBounds: Boolean,
    strictFitBounds: Boolean,
    sensitivity: { type: Number, default: 0.5 },
    dropSensitivity: { type: Number, default: 0.1 },
    margin: { type: String, default: '0' },
  },
})
export class Draggable<T extends BaseProps = BaseProps> extends withResize(
  withRaf(
    withDrag(Base, {
      // The mixin is applied before this class exists, so the host is `Base`
      // and the resolver has to name the shape it needs rather than the class.
      // v3 spells the same thing `@ts-expect-error`.
      target: (instance) => (instance as Base & { readonly target: HTMLElement }).target,
    }),
    { manual: true },
  ),
)<DraggableProps & T> {
  /** The target position, shared as the payload of every event. */
  props: DraggablePosition = {
    x: 0,
    y: 0,
    progressX: 0,
    progressY: 0,
    originX: 0,
    originY: 0,
    dampedX: 0,
    dampedY: 0,
  };

  dampFactor = 0.5;

  /** Resolved lazily and cleared with the mount cycle, because a move changes the geometry. */
  #bounds: Bounds | null = null;

  #margin: Margin | null = null;

  #marginOption: string | null = null;

  /** The draggable element. */
  get target(): HTMLElement {
    return this.$refs.target;
  }

  /** The bounding element. */
  get parent(): HTMLElement {
    return this.$el;
  }

  /** The offset from the bounds, in CSS shorthand order. */
  get margin(): Margin {
    const marginOption = this.$options.margin;

    if (this.#margin && this.#marginOption === marginOption) {
      return this.#margin;
    }

    const values = marginOption.split(' ').map(Number);
    let [top = 0] = values;
    let right = top;
    let bottom = top;
    let left = top;

    switch (values.length) {
      case 4:
        [top, right, bottom, left] = values;
        break;
      case 3:
        [top, right, bottom] = values;
        left = right;
        break;
      case 2:
        [top, right] = values;
        left = right;
        bottom = top;
        break;
    }

    this.#margin = { top, right, bottom, left };
    this.#marginOption = marginOption;

    return this.#margin;
  }

  /** How far the target may travel inside its parent. */
  get bounds(): Bounds {
    if (!this.#bounds) {
      const { target, parent, margin } = this;
      const targetSizes = getOffsetSizes(target);
      const parentSizes = getOffsetSizes(parent);
      const xMin = targetSizes.x - parentSizes.x;
      const yMin = targetSizes.y - parentSizes.y;
      const xMax = xMin + targetSizes.width - parentSizes.width;
      const yMax = yMin + targetSizes.height - parentSizes.height;

      this.#bounds = {
        yMin: (yMin - margin.top) * -1,
        yMax: (yMax + margin.bottom) * -1,
        xMin: (xMin - margin.left) * -1,
        xMax: (xMax + margin.right) * -1,
      };
    }

    return this.#bounds;
  }

  mounted(): MountedReturn {
    return [
      super.mounted(),
      () => {
        this.#bounds = null;
        this.#margin = null;
        this.#marginOption = null;
      },
    ];
  }

  /** Measure again after a resize. */
  resized(): void {
    this.#bounds = null;
  }

  dragged(props: DragProps): void {
    if (props.mode === DRAG_MODES.IDLE) {
      return;
    }

    this.$emit(`drag-${props.mode}`, this.props);

    const { fitBounds, strictFitBounds, sensitivity, dropSensitivity } = this.$options;
    const { bounds } = this;

    if (props.mode === DRAG_MODES.START) {
      this.props.originX = this.props.x;
      this.props.originY = this.props.y;
      this.dampFactor = sensitivity;
      this.render();
    } else if (
      props.mode === DRAG_MODES.DRAG ||
      (props.mode === DRAG_MODES.INERTIA && !fitBounds)
    ) {
      // v3 spells this `props.x - props.origin.x`; the service publishes the
      // subtraction itself now.
      this.props.x = this.props.originX + props.distanceX;
      this.props.y = this.props.originY + props.distanceY;

      if (strictFitBounds) {
        this.props.x = clamp(this.props.x, bounds.xMin, bounds.xMax);
        this.props.y = clamp(this.props.y, bounds.yMin, bounds.yMax);
      }

      this.render();
    } else if (props.mode === DRAG_MODES.DROP && fitBounds) {
      // The service announces its exact settle position at `drop`; v3 has to
      // read `props.final.x` against the same origin.
      this.props.x = clamp(
        this.props.originX + (props.finalX - props.originX),
        bounds.xMin,
        bounds.xMax,
      );
      this.props.y = clamp(
        this.props.originY + (props.finalY - props.originY),
        bounds.yMin,
        bounds.yMax,
      );
      this.dampFactor = dropSensitivity;
      this.$services.ticked.start();
    }
  }

  /** Coast to the clamped destination, then announce the fit and stop. */
  ticked({ delta }: RafProps): void {
    this.$emit('drag-inertia', this.props);
    this.render(delta);
    if (this.props.dampedX === this.props.x && this.props.dampedY === this.props.y) {
      this.$services.ticked.stop();
      this.$emit('drag-fit', this.props);
    }
  }

  /**
   * v3's `damp()` is per frame and v4's is per elapsed millisecond, so a call
   * made outside the frame loop has to name the frame it stands in. One
   * nominal frame is exactly what v3 assumed everywhere.
   */
  render(elapsed: number = INERTIA_FRAME): void {
    const { props } = this;
    props.dampedX = damp(props.x, props.dampedX, this.dampFactor, elapsed);
    props.dampedY = damp(props.y, props.dampedY, this.dampFactor, elapsed);

    this.$read(() => {
      const { bounds } = this;
      const { x, y } = this.$options;

      this.$write(() => {
        props.progressX = map(props.x, bounds.xMin, bounds.xMax, 0, 1);
        props.progressY = map(props.y, bounds.yMin, bounds.yMax, 0, 1);

        this.target.style.transform = transform({
          x: x ? props.dampedX : 0,
          y: y ? props.dampedY : 0,
        });

        this.$emit('drag-render', this.props);
      });
    });
  }
}
