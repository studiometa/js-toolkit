import Base from '../abstracts/Base';
import useResize from '../services/resize';
import nextFrame from '../utils/nextFrame';

/**
 * MediaQuery component.
 *
 * <div data-component="MediaQuery" data-active-breakpoints="l xl">
 *   <div data-component="Foo"></div>
 * </div>
 */
export default class MediaQuery extends Base {
  /**
   * Component's configuration.
   *
   * @return {Object}
   */
  static config = {
    name: 'MediaQuery',
  };

  /**
   * Mounted hook.
   */
  mounted() {
    this.test();
    nextFrame(() => this.test());
  }

  /**
   * Resized hook.
   */
  resized() {
    this.test();
  }

  /**
   * Get the first element child of the component, as it must be another Base component that could
   * be either $mounted or $destroyed.
   *
   * @return {Base|Boolean}
   */
  get child() {
    const child = this.$el.firstElementChild ? this.$el.firstElementChild.__base__ : false;

    if (!child) {
      throw new Error(
        'The first and only child of the MediaQuery component must be another Base component.'
      );
    }

    return child;
  }

  /**
   * Get the current active breakpoint from the `useResize` service.
   *
   * @return {String}
   */
  get currentBreakpoint() {
    return useResize().props().breakpoint;
  }

  /**
   * Get a list of breakpoints in which the child component should be $mounted.
   *
   * @return {Array}
   */
  get activeBreakpoints() {
    if (this.$el.dataset.activeBreakpoints) {
      return this.$el.dataset.activeBreakpoints.split(' ');
    }

    return [];
  }

  /**
   * Test if the child component should be either $mounted or $destroyed based on the current active
   * breakpoint and the given list of breakpoints.
   *
   * @return {void}
   */
  test() {
    const isInBreakpoints = this.activeBreakpoints.includes(this.currentBreakpoint);

    if (isInBreakpoints && !this.child.$isMounted) {
      this.child.$mount();
      return;
    }

    if (!isInBreakpoints && this.child.$isMounted) {
      this.child.$destroy();
    }
  }
}
