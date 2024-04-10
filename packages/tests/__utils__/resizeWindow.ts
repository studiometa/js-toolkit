import {
  useFakeTimers,
  useRealTimers,
  advanceTimersByTimeAsync,
  isFakeTime,
} from './faketimers.js';

export async function resizeWindow({
  width = window.innerWidth,
  height = window.innerHeight,
} = {}) {
  const hasFakeTimer = isFakeTime();
  if (!hasFakeTimer) {
    useFakeTimers();
  }
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
  await advanceTimersByTimeAsync(400);
  if (!hasFakeTimer) {
    useRealTimers();
  }
}
