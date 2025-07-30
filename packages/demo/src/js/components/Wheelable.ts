import { Base, withWheel } from '@studiometa/js-toolkit';
import type { BaseProps, BaseConfig, WheelServiceProps } from '@studiometa/js-toolkit';
import { domScheduler, transform, damp, clamp, getOffsetSizes } from '@studiometa/js-toolkit/utils';

export interface WheelableProps extends BaseProps {
  $refs: {
    target: HTMLElement;
  };
  $options: {
    x: boolean;
    y: boolean;
    fitBounds: boolean;
    sensitivity: number;
    dropSensitivity: number;
  };
}

/**
 * Wheelable class.
 */
export default class Wheelable<T extends BaseProps = BaseProps> extends withWheel(Base)<T & WheelableProps> {
  /**
   * Config.
   */
  static config: BaseConfig = {
    name: 'Wheelable',
    refs: ['target'],
    emits: ['wheel-wheel'],
    options: {
      x: {
        type: Boolean,
        default: true,
      },
      y: {
        type: Boolean,
        default: true,
      },
      fitBounds: Boolean,
      sensitivity: { type: Number, default: 0.5 },
      dropSensitivity: { type: Number, default: 0.1 },
    },
  };

  /**
   * Props for the target position.
   */
  props = {
    x: 0,
    y: 0,
    originX: 0,
    originY: 0,
    dampedX: 0,
    dampedY: 0,
  };

  /**
   * Smooth factor.
   */
  dampFactor = 0.5;

  /**
   * The draggable element, defaults to `this.$refs.target`.
   */
  get target(): HTMLElement {
    return this.$refs.target;
  }

  /**
   * The bouding element, defaults to `this.$el`.
   */
  get parent(): HTMLElement {
    return this.$el;
  }

  /**
   * The bounds values.
   */
  get bounds() {
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

  /**
   * Drag service hook.
   */
  wheeled(props: WheelServiceProps) {
    this.$emit(`wheel-wheel`, this.props);

    if (props.mode === props.MODES.START) {
      this.props.originX = this.props.x;
      this.props.originY = this.props.y;
      this.dampFactor = this.$options.sensitivity;
      this.render();
    } else if (
      props.mode === props.MODES.WHEEL
    ) {
      this.props.x -= props.deltaX * 0.5;
      this.props.y -= props.deltaY * 0.5;
      this.render();
    } else if (props.mode === props.MODES.END && this.$options.fitBounds) {
      const { bounds } = this;
      this.props.x = clamp(
        this.props.x,
        bounds.xMin,
        bounds.xMax,
      );
      this.props.y = clamp(
        this.props.y,
        bounds.yMin,
        bounds.yMax,
      );
      this.dampFactor = this.$options.dropSensitivity;
      this.$services.enable('ticked');
    }
  }

  ticked() {
    this.render();
    if (this.props.dampedX === this.props.x && this.props.dampedY === this.props.y) {
      this.$services.disable('ticked');
    }
  }

  render() {
    this.props.dampedX = damp(this.props.x, this.props.dampedX, this.dampFactor);
    this.props.dampedY = damp(this.props.y, this.props.dampedY, this.dampFactor);

    domScheduler.read(() => {
      const { x, y } = this.$options;
      domScheduler.write(() => {
        transform(this.target, {
          x: x ? this.props.dampedX : 0,
          y: y ? this.props.dampedY : 0,
        });
      });
    });
  }
}
