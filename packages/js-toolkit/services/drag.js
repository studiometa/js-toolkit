import Service from './Service.js';
import usePointer from './pointer.js';
import useRaf from './raf.js';
import inertiaFinalValue from '../utils/math/inertiaFinalValue.js';

/**
 * @typedef {import('./index').ServiceInterface<DragServiceProps>} DragService
 */

/**
 * @typedef {import('./pointer.js').PointerServiceProps} PointerServiceProps
 */

/**
 * @type {Record<Uppercase<DragLifecycle>, DragLifecycle>}
 */
const MODES = {
  START: 'start',
  DRAG: 'drag',
  DROP: 'drop',
  INERTIA: 'inertia',
  STOP: 'stop',
};

/**
 * @typedef {'start'|'drag'|'drop'|'inertia'|'stop'} DragLifecycle
 */

/**
 * @typedef {Object} DragServiceProps
 * @property {DragLifecycle} mode
 *   The current mode of the dragging logic.
 * @property {HTMLElement} target
 *   The target element of the drag.
 * @property {boolean} isGrabbing
 *   Whether the user is currently grabbing the targeted element or not.
 * @property {boolean} hasInertia
 *   Whether the drag currently has inertia or not.
 * @property {number} x
 *   The current horizontal position in the viewport.
 * @property {number} y
 *   The current vertical position in the viewport.
 * @property {{ x: number, y: number }} delta
 *   The delta between the current position and the last.
 * @property {{ x: number, y: number }} origin
 *   The initial position where the dragging started.
 * @property {{ x: number, y: number }} distance
 *   The distance from the current position to the origin.
 * @property {{ x: number, y: number }} final
 *   The final position that will be reached at the end of the inertia.
 */

/**
 * @typedef {Object} DragServiceOptions
 * @property {number=} [dampFactor]
 * @property {number=} [dragTreshold]
 */

let id = 0;

/**
 * Drag service
 */
class Drag extends Service {
  /**
   * The instance ID.
   * @type {string}
   */
  id;

  /**
   * Props.
   * @type {DragServiceProps}
   */
  props = {
    target: null,
    mode: undefined,
    isGrabbing: false,
    hasInertia: false,
    x: 0,
    y: 0,
    delta: {
      x: 0,
      y: 0,
    },
    origin: {
      x: 0,
      y: 0,
    },
    distance: {
      x: 0,
      y: 0,
    },
    final: {
      x: 0,
      y: 0,
    },
  };

  /**
   * Options.
   * @type {DragServiceOptions}
   */
  options = {
    dampFactor: 0.85,
    dragTreshold: 10,
  };

  /**
   * Class constructor.
   * @param {HTMLElement} target The drag target.
   * @param {DragServiceOptions} options The drag options.
   */
  constructor(target, options = {}) {
    super();
    id += 1;
    this.id = `drag-${id}`;
    this.props.target = target;
    this.options = { ...this.options, ...options };
    this.pointerHandler = this.pointerHandler.bind(this);
    this.rafHandler = this.rafHandler.bind(this);
    return this;
  }

  /**
   * Bind the handler to the mousemove and touchmove events.
   * Bind the up and down handler to the mousedown, mouseup, touchstart and touchend events.
   *
   * @return {this}
   */
  init() {
    const options = { passive: true };
    this.props.target.addEventListener('mousedown', this, options);
    this.props.target.addEventListener('touchstart', this, options);
    this.props.target.addEventListener('dragstart', this, { capture: true });
    this.props.target.addEventListener('click', this, { capture: true });

    const pointer = usePointer();
    pointer.add(this.id, this.pointerHandler);

    return this;
  }

  /**
   * Unbind all handlers from their bounded event.
   *
   * @return {this}
   */
  kill() {
    this.props.target.removeEventListener('mousedown', this);
    this.props.target.removeEventListener('touchstart', this);
    this.props.target.removeEventListener('dragstart', this);
    this.props.target.removeEventListener('click', this);

    const pointer = usePointer();
    pointer.remove(this.id);
    return this;
  }

  /**
   * Handle any event.
   * @param {MouseEvent|TouchEvent|DragEvent} event
   */
  handleEvent(event) {
    if (event.type === 'dragstart') {
      event.preventDefault();
      return;
    }

    if (event.type === 'click') {
      if (this.__shouldPreventClick) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
      }

      return;
    }

    const x = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const y = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    this.start(x, y);
  }

  /**
   * Start the drag.
   * @param {number} x The initial horizontal position.
   * @param {number} y The initial vertical position.
   * @return {void}
   */
  start(x, y) {
    // Reset state
    this.props.x = x;
    this.props.y = y;
    this.props.origin.x = x;
    this.props.origin.y = y;
    this.props.delta.x = 0;
    this.props.delta.y = 0;
    this.props.distance.x = 0;
    this.props.distance.y = 0;
    this.props.final.x = x;
    this.props.final.y = y;

    this.props.mode = MODES.START;

    // Enable grabbing
    this.props.isGrabbing = true;

    this.trigger(this.props);
  }

  /**
   * Stop the drag, or drop.
   * @return {void}
   */
  drop() {
    this.props.isGrabbing = false;
    this.props.mode = MODES.DROP;

    this.props.hasInertia = true;
    this.props.final.x = inertiaFinalValue(
      this.props.x,
      this.props.delta.x,
      this.options.dampFactor
    );
    this.props.final.y = inertiaFinalValue(
      this.props.y,
      this.props.delta.y,
      this.options.dampFactor
    );

    this.trigger(this.props);

    setTimeout(() => {
      const raf = useRaf();
      raf.remove(this.id);
      raf.add(this.id, this.rafHandler);
    }, 0);
  }

  /**
   * Stop the drag.
   */
  stop() {
    useRaf().remove(this.id);
    this.props.hasInertia = false;
    this.props.mode = MODES.STOP;
    this.trigger(this.props);
  }

  /**
   * Raf service handler.
   * @return {void}
   */
  rafHandler() {
    if (!this.props.isGrabbing) {
      this.props.x += this.props.delta.x;
      this.props.y += this.props.delta.y;
      this.props.distance.x = this.props.x - this.props.origin.x;
      this.props.distance.y = this.props.y - this.props.origin.y;

      this.props.delta.x *= this.options.dampFactor;
      this.props.delta.y *= this.options.dampFactor;

      if (this.props.mode !== MODES.INERTIA) {
        this.props.mode = MODES.INERTIA;
      }

      this.trigger(this.props);

      if (Math.abs(this.props.delta.x) < 0.1 && Math.abs(this.props.delta.y) < 0.1) {
        this.stop();
      }
    }
  }

  /**
   * Pointer service handler.
   * @param {PointerServiceProps} props
   * @return {void}
   */
  pointerHandler(props) {
    if (this.props.isGrabbing) {
      this.props.x = props.x;
      this.props.y = props.y;
      this.props.delta.x = props.delta.x;
      this.props.delta.y = props.delta.y;
      this.props.final.x = props.x;
      this.props.final.y = props.y;
      this.props.distance.x = this.props.x - this.props.origin.x;
      this.props.distance.y = this.props.y - this.props.origin.y;

      if (this.props.mode !== MODES.DRAG) {
        this.props.mode = MODES.DRAG;
      }

      this.trigger(this.props);

      if (!props.isDown) {
        this.drop();
      }
    }
  }

  /**
   * Get the pointer props.
   *
   * @returns {this['props']}
   */
  updateProps() {
    return this.props;
  }

  /**
   * Test if we should allow click on links and buttons.
   *
   * @private
   * @returns {boolean}
   */
  get __shouldPreventClick() {
    return (
      Math.abs(this.props.distance.x) > this.options.dragTreshold ||
      Math.abs(this.props.distance.y) > this.options.dragTreshold
    );
  }
}

/**
 * @type {WeakMap<HTMLElement, DragService | undefined>}
 */
const instances = new WeakMap();

/**
 * Use the drag service.
 *
 * ```js
 * import { useDrag } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useDrag();
 * const draggableElement = document.querySelector('.draggable');
 * add(draggableElement, (props) => {}, { factor: 0.8 });
 * remove(draggableElement);
 * props(draggableElement);
 * ```
 *
 * @param {HTMLElement} target
 * @param {DragServiceOptions} options
 * @return {DragService}
 */
export default function useDrag(target, options) {
  let drag = instances.get(target);

  if (!drag) {
    const instance = new Drag(target, options);

    drag = {
      add: instance.add.bind(instance),
      remove: instance.remove.bind(instance),
      has: instance.has.bind(instance),
      props: instance.updateProps.bind(instance),
    };

    instances.set(target, drag);
  }

  return drag;
}
