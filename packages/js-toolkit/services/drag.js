import Service from '../abstracts/Service.js';
import usePointer from './pointer.js';
import useRaf from './raf.js';
import inertiaFinalValue from '../utils/math/inertiaFinalValue.js';

/**
 * @typedef {import('./index').ServiceInterface} ServiceInterface
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
 * @property {number=} [factor]
 */

/**
 * @typedef {Object} DragService
 * @property {(target:HTMLElement, callback:(props:DragServiceProps) => void, options?:DragServiceOptions) => void} add
 *   Add a callback function to the service. The key must be the HTML element targeted by the drag.
 * @property {(target:HTMLElement) => void} remove
 *   Remove a callback function to the service.
 * @property {() => DragServiceProps} props
 *   Get the current values of the resize service props.
 */

let instanceIds = 0;

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
   * The target element
   * @type {HTMLElement}
   */
  target;

  /**
   * The drag mode, use it to follow the different parts of the drag.
   * @type {DragLifecycle}
   */
  mode;

  /**
   * Whether we are currently dragging or not.
   * @type {Boolean}
   */
  isGrabbing = false;

  /**
   * The horizontal position of the drag.
   * @type {Number}
   */
  x = 0;

  /**
   * The vertical position of the drag.
   * @type {Number}
   */
  y = 0;

  /**
   * The velocity of the drag.
   * @type {{ x: number, y: number }}
   */
  delta = {
    x: 0,
    y: 0,
  };

  /**
   * The origin of the drag.
   * @type {{ x: number, y: number }}
   */
  origin = {
    x: 0,
    y: 0,
  };

  /**
   * The origin of the drag.
   * @type {{ x: number, y: number }}
   */
  distance = {
    x: 0,
    y: 0,
  };

  /**
   * The final position of the inertia.
   * @type {{ x: number, y: number }}
   */
  final = {
    x: 0,
    y: 0,
  };

  /**
   * Options.
   * @type {DragServiceOptions}
   */
  options = {
    factor: 0.85,
  };

  /**
   * Class constructor.
   * @param {HTMLElement} target The drag target.
   * @param {DragServiceOptions} options The drag options.
   */
  constructor(target, options = {}) {
    super();
    instanceIds += 1;
    this.id = `drag-${instanceIds}`;
    this.target = target;
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
    this.target.addEventListener('mousedown', this);
    this.target.addEventListener('touchstart', this);

    const pointer = usePointer();
    pointer.add(this.id, this.pointerHandler);

    return this;
  }

  /**
   * Handle any event.
   * @param {MouseEvent|TouchEvent} event [description]
   */
  handleEvent(event) {
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
    this.x = x;
    this.y = y;
    this.origin.x = x;
    this.origin.y = y;
    this.delta.x = 0;
    this.delta.y = 0;
    this.distance.x = 0;
    this.distance.y = 0;
    this.final.x = x;
    this.final.y = y;

    this.mode = MODES.START;

    // Enable grabbing
    this.isGrabbing = true;

    this.trigger(this.props);
  }

  /**
   * Stop the drag, or drop.
   * @return {void}
   */
  drop() {
    this.isGrabbing = false;
    this.mode = MODES.DROP;

    this.hasInertia = true;
    this.final.x = inertiaFinalValue(this.x, this.delta.x, this.options.factor);
    this.final.y = inertiaFinalValue(this.y, this.delta.y, this.options.factor);

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
    this.hasInertia = false;
    this.mode = MODES.STOP;
    this.trigger(this.props);
  }

  /**
   * Raf service handler.
   * @return {void}
   */
  rafHandler() {
    if (!this.isGrabbing) {
      this.x += this.delta.x;
      this.y += this.delta.y;
      this.distance.x = this.x - this.origin.x;
      this.distance.y = this.y - this.origin.y;

      this.delta.x *= this.options.factor;
      this.delta.y *= this.options.factor;

      if (this.mode !== MODES.INERTIA) {
        this.mode = MODES.INERTIA;
      }

      this.trigger(this.props);

      if (Math.abs(this.delta.x) < 0.1 && Math.abs(this.delta.y) < 0.1) {
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
    if (this.isGrabbing) {
      this.x = props.x;
      this.y = props.y;
      this.delta.x = props.delta.x;
      this.delta.y = props.delta.y;
      this.final.x = props.x;
      this.final.y = props.y;
      this.distance.x = this.x - this.origin.x;
      this.distance.y = this.y - this.origin.y;

      if (this.mode !== MODES.DRAG) {
        this.mode = MODES.DRAG;
      }

      this.trigger(this.props);

      if (!props.isDown) {
        this.drop();
      }
    }
  }

  /**
   * Unbind all handlers from their bounded event.
   *
   * @return {this}
   */
  kill() {
    document.removeEventListener('mousemove', this);
    document.removeEventListener('touchmove', this);

    const pointer = usePointer();
    pointer.remove(this.id);
    return this;
  }

  /**
   * Get the pointer props.
   *
   * @type {Object}
   */
  get props() {
    return {
      target: this.target,
      mode: this.mode,
      isGrabbing: this.isGrabbing,
      hasInertia: this.hasInertia,
      x: this.x,
      y: this.y,
      delta: this.delta,
      origin: this.origin,
      distance: this.distance,
      final: this.final,
    };
  }
}

const instances = new WeakMap();

/**
 * Use the pointer.
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
 * @return {ServiceInterface & DragService}
 */
export default function useDrag(target, options) {
  let drag = instances.get(target);

  if (!drag) {
    drag = new Drag(target, options);
  }

  const add = drag.add.bind(drag);
  const remove = drag.remove.bind(drag);
  const has = drag.has.bind(drag);
  const props = () => drag.props;

  return {
    add,
    remove,
    has,
    props,
  };
}
