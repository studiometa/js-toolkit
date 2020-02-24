/**
 * Simple throttling helper that limits a
 * function to only run once every {delay}ms
 *
 * @param {Function} fn    The function to throttle
 * @param {Number}   delay The delay in ms
 */
export default function throttle(fn: Function, delay = 16): Function {
  let lastCall = 0;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return false;
    }

    lastCall = now;
    return fn(...args);
  };
}
