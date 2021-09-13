import damp from './math/damp.js';

/**
 * Handler for the click event on anchor links
 *
 * @param {HTMLElement} element The target element.
 * @param {Object} options Options for the scroll.
 * @param {Object} options.offset Offset to add to the target scroll position.
 * @param {Object} options.dampFactor The factor used for the scroll damping.
 * @return {Promise<number>} A promising resolving with the target scroll position.
 */
export default function scrollTo(element, options = { offset: 0, dampFactor: 0.2 }) {
  if (!(element instanceof HTMLElement)) {
    return Promise.resolve(window.pageYOffset);
  }

  const sizes = element.getBoundingClientRect();
  const scrollMargin = getComputedStyle(element).scrollMarginTop || '0';
  const max = document.body.offsetHeight - window.innerHeight;
  let scrollTarget = sizes.top + window.pageYOffset + parseInt(scrollMargin, 10);

  if (typeof options.offset === 'number') {
    scrollTarget += options.offset;
  }

  // Make sure to not scroll more than the max scroll allowed
  if (scrollTarget > max) {
    scrollTarget = max;
  }

  return new Promise((resolve) => {
    let isScrolling = false;
    let scroll = window.pageYOffset;
    let dampScroll = window.pageYOffset;

    /**
     * Handler for the wheel event
     * Is used to cancel the programmatic scroll animation
     */
    function eventHandler() {
      if (isScrolling) {
        isScrolling = false;
      }
    }

    /**
     * Scroll animation end's hook
     */
    function end() {
      window.removeEventListener('wheel', eventHandler);
      window.removeEventListener('touchmove', eventHandler);
      resolve(window.pageYOffset);
    }

    /**
     * Scroll animation's loop
     */
    function loop() {
      if (!isScrolling) {
        return end();
      }

      dampScroll = damp(scroll, dampScroll, options.dampFactor);
      window.scrollTo({ top: dampScroll });

      if (dampScroll === scroll) {
        isScrolling = false;
      }

      return requestAnimationFrame(loop);
    }

    /**
     * Start the scroll animation
     * @param {Number} target The target scroll
     */
    function start(target) {
      // Update vars
      isScrolling = true;
      dampScroll = window.pageYOffset;
      scroll = target;

      // Bind wheel event to stop the animation if
      // the user wants to scroll manually
      window.addEventListener('wheel', eventHandler, { passive: true });
      window.addEventListener('touchmove', eventHandler, { passive: true });

      // Init the loop
      loop();
    }

    // Start the scroll
    start(scrollTarget);
  });
}
