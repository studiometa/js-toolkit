import Service from '../abstracts/Service';
import debounce from '../utils/debounce';

/**
 * Resize service
 *
 * ```
 * import resize from '@studiometa/js/services/resize';
 * resize.add(id, handler);
 * resize.remove(id);
 * resize.props;
 * ```
 */
class Resize extends Service {
  /**
   * Bind the handler to the resize event.
   *
   * @return {void}
   */
  init() {
    this.handler = debounce(() => {
      this.trigger(this.props);
    }).bind(this);
    window.addEventListener('resize', this.handler);
  }

  /**
   * Unbind the handler from the resize event.
   *
   * @return {void}
   */
  kill() {
    window.removeEventListener('resize', this.handler);
  }

  /**
   * Get resize props.
   *
   * @type {Object}
   */
  get props() {
    const props = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.innerWidth / window.innerHeight,
      orientation: 'square',
    };

    if (props.ratio > 1) {
      props.orientation = 'landscape';
    }

    if (props.ratio < 1) {
      props.orientation = 'portrait';
    }

    return props;
  }
}

const resize = new Resize();
const add = resize.add.bind(resize);
const remove = resize.remove.bind(resize);
const props = () => resize.props;

export default () => ({
  add,
  remove,
  props,
});
