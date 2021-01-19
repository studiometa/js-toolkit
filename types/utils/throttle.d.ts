/**
 * Simple throttling helper that limits a
 * function to only run once every {delay}ms
 *
 * @param {Function} fn    The function to throttle
 * @param {Number}   delay The delay in ms
 */
export default function throttle(fn: Function, delay?: number): (...args: any[]) => any;
